import { getFirestore } from 'firebase-admin/firestore';
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { sendNotificationInternal } from "./notificationService";

const db = getFirestore('datacollectionportal');

const checkAdminOrSupervisor = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }
  const role = context.auth.token.role;
  if (role !== "admin" && role !== "supervisor") {
    throw new functions.https.HttpsError("permission-denied", "Only admins or supervisors can perform this action.");
  }
};

export const importDataPreview = functions.https.onCall(async (data, context) => {
  checkAdminOrSupervisor(context);
  // Optional: Just return a preview of first 5 rows and mapping hints
  // Can be implemented if Admin UI wants backend processing for CSV
  return { success: true, message: "Preview generated" };
});

export const commitImport = functions.https.onCall(async (data, context) => {
  checkAdminOrSupervisor(context);

  const { requestId, importedRows, mapping, fileName, lang } = data;

  if (!requestId || !importedRows || !mapping) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required fields.");
  }

  const requestDoc = await db.collection("requests").doc(requestId).get();
  if (!requestDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Request not found.");
  }

  // Fetch all dependencies
  const usersSnap = await db.collection("users").get();
  const users = usersSnap.docs.map(d => d.data());

  const branchesSnap = await db.collection("branches").get();
  const branches = branchesSnap.docs.map(d => d.data());

  const fieldsSnap = await db.collection("request_fields").where("requestId", "==", requestId).get();
  const reqFields = fieldsSnap.docs.map(d => d.data());

  const existingAssignmentsSnap = await db.collection("assignments").where("requestId", "==", requestId).get();
  const existingAssignments = existingAssignmentsSnap.docs.map(d => d.data());

  let createdCount = 0;
  let skippedCount = 0;
  const newRecords: any[] = [];
  const newResponses: Record<string, Record<string, any>> = {};
  const touchedRegionNos = new Set<string>();
  const duplicateKeys = new Set<string>();

  importedRows.forEach((row: any, idx: number) => {
    // 1. Resolve Region
    const regKey = mapping['regionNo'] || 'RegionNo';
    const regionVal = String(
      row[regKey] || row['regionNo'] || row['RegionNo'] || row['رقم المنطقة'] || row['رقم_المنطقة'] || row['المنطقة'] || ''
    ).trim();

    const matchedUser = regionVal
      ? users.find((u) => u.regionNo === regionVal || (u.allowedRegionNos && u.allowedRegionNos.includes(regionVal)))
      : undefined;

    // 2. Resolve Customer Identification
    const custNoKey = mapping['customerNo'] || mapping['customer_no'] || 'CustomerNo';
    const customerNo = String(
      row[custNoKey] || row['customerNo'] || row['CustomerNo'] || row['رقم العميل'] || row['رقم_العميل'] || `CUST-${1000 + idx + 1}`
    ).trim();

    // Duplicate detection key (RequestId + RegionNo + CustomerNo)
    const dupKey = `${requestId}_${regionVal}_${customerNo}`;
    if (duplicateKeys.has(dupKey)) {
      skippedCount++;
      return; // Skip duplicate within the same batch
    }
    duplicateKeys.add(dupKey);

    const custNameKey = mapping['customerName'] || mapping['customer_name'] || 'CustomerName';
    const customerName = String(
      row[custNameKey] || row['customerName'] || row['CustomerName'] || row['اسم العميل'] || row['اسم_العميل'] || (lang === 'ar' ? `عميل ${idx + 1}` : `Customer ${idx + 1}`)
    ).trim();

    // 3. Resolve Branch
    const branchCol = mapping['branchName'] || mapping['branch_name'] || 'BranchName';
    const defaultBranch = matchedUser
      ? branches.find((b) => b.branchId === matchedUser.branchId)
      : branches[0];
    const branchName = String(
      row[branchCol] || row['BranchName'] || row['Branch'] || row['الفرع'] || row['اسم الفرع'] || matchedUser?.branchNameAr || defaultBranch?.branchNameAr || ''
    ).trim();
    const branchId = matchedUser?.branchId || defaultBranch?.branchId || 'BR-01';

    // 4. Resolve Rep
    const repNameCol = mapping['repName'] || 'RepName';
    const repName = String(
      row[repNameCol] || row['RepName'] || row['اسم المندوب'] || row['المندوب'] || matchedUser?.repNameAr || ''
    ).trim();

    const repNoCol = mapping['repNo'] || 'RepNo';
    const repNo = String(
      row[repNoCol] || row['RepNo'] || row['رقم المندوب'] || matchedUser?.repNo || (regionVal ? `REP-${regionVal}` : '')
    ).trim();

    // 5. Build dynamic field values and rawData for this record
    const rowRawData: Record<string, any> = { ...row };
    const rowResponses: Record<string, any> = {};

    reqFields.forEach((f) => {
      const mappedCol = mapping[f.fieldKey];
      let val = mappedCol ? row[mappedCol] : undefined;

      if (val === undefined) {
        val = row[f.fieldKey] ?? row[f.fieldLabelAr] ?? row[f.fieldLabelEn];
      }

      if (val === undefined && (f.fieldKey === 'customer_no' || f.fieldKey === 'cust_no')) val = customerNo;
      if (val === undefined && (f.fieldKey === 'customer_name' || f.fieldKey === 'cust_name')) val = customerName;
      if (val === undefined && (f.fieldKey === 'branch_name' || f.fieldKey === 'branch')) val = branchName;

      if (val !== undefined && val !== null && String(val).trim() !== '') {
        if (f.fieldType === 'currency' || f.fieldType === 'number') {
          const num = parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
          val = isNaN(num) ? val : num;
        }
        rowRawData[f.fieldKey] = val;
        rowResponses[f.fieldKey] = val;
      } else if (f.defaultValue !== undefined && f.defaultValue !== null) {
        rowRawData[f.fieldKey] = f.defaultValue;
        rowResponses[f.fieldKey] = f.defaultValue;
      }
    });

    const recordId = 'REC-IMP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    newResponses[recordId] = rowResponses;

    const newRec = {
      recordId,
      requestId,
      assignmentId: regionVal ? `ASG-${regionVal}-${requestId}` : 'UNASSIGNED',
      assignedUserId: matchedUser ? matchedUser.userId : 'UNASSIGNED',
      assignedRegionNo: regionVal || 'UNASSIGNED',
      customerNo,
      customerName,
      branchId,
      branchName,
      regionNo: regionVal || 'UNASSIGNED',
      repNo,
      repName,
      inventoryValue: Number(rowResponses['debit_balance'] || rowResponses['inventory_value'] || row[mapping['inventoryValue']] || 0) || 0,
      area: String(row[mapping['area']] || row['Area'] || row['المنطقة'] || row['الحي'] || row['الموقع'] || rowResponses['location'] || '').trim(),
      rawData: rowRawData,
      recordStatus: 'Pending',
      completionPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (regionVal) {
      touchedRegionNos.add(regionVal);
    }
    newRecords.push(newRec);
    createdCount++;
  });

  const newAssignments: any[] = [];
  touchedRegionNos.forEach((regNo) => {
    const exists = existingAssignments.some((a) => a.regionNo === regNo) || newAssignments.some((a) => a.regionNo === regNo);
    if (!exists) {
      const rep = users.find((u) => u.regionNo === regNo || (u.allowedRegionNos && u.allowedRegionNos.includes(regNo)));
      if (rep) {
        const nowIso = new Date().toISOString();
        newAssignments.push({
          assignmentId: `ASG-${regNo}-${requestId}`,
          requestId,
          userId: rep.userId,
          regionNo: regNo,
          branchId: rep.branchId,
          assignmentStatus: 'Active',
          assignedAt: nowIso,
          assignedBy: context.auth!.uid,
          totalRecords: 0,
          completedRecords: 0,
          pendingRecords: 0,
          progressPercent: 0,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
      }
    }
  });

  const chunks = [];
  const CHUNK_SIZE = 200; 
  for (let i = 0; i < newRecords.length; i += CHUNK_SIZE) {
    chunks.push(newRecords.slice(i, i + CHUNK_SIZE));
  }

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const batch = db.batch();
    
    chunk.forEach(rec => {
      batch.set(db.collection("records").doc(rec.recordId), rec);
      batch.set(db.collection("responses").doc(rec.recordId), newResponses[rec.recordId]);
    });

    if (i === 0) {
      newAssignments.forEach(asg => {
        batch.set(db.collection("assignments").doc(asg.assignmentId), asg);
      });
      batch.update(db.collection("requests").doc(requestId), {
        totalRecords: admin.firestore.FieldValue.increment(createdCount),
        updatedAt: new Date().toISOString(),
      });
    }
    await batch.commit();
  }

  // Also need to recalculate total records per assignment if we added to existing ones
  // We can do this asynchronously using another function or loop over assignments here
  const assignmentsBatch = db.batch();
  touchedRegionNos.forEach((regNo) => {
    const addedCount = newRecords.filter(r => r.assignedRegionNo === regNo).length;
    if (addedCount > 0) {
      const asgId = `ASG-${regNo}-${requestId}`;
      assignmentsBatch.update(db.collection("assignments").doc(asgId), {
        totalRecords: admin.firestore.FieldValue.increment(addedCount),
        pendingRecords: admin.firestore.FieldValue.increment(addedCount),
        updatedAt: new Date().toISOString()
      });
    }
  });
  await assignmentsBatch.commit();

  // Send Notifications
  const requestData = requestDoc.data();
  const notificationPromises: Promise<void>[] = [];
  touchedRegionNos.forEach((regNo) => {
    const rep = users.find((u) => u.regionNo === regNo || (u.allowedRegionNos && u.allowedRegionNos.includes(regNo)));
    if (rep) {
      notificationPromises.push(
        sendNotificationInternal(
          rep.userId,
          `تم تعيين بيانات جديدة: ${requestData?.titleAr || ''}`,
          `New records assigned: ${requestData?.titleEn || ''}`,
          `تم إدراج سجلات جديدة لمنطقتك (${regNo}).`,
          `New customer records have been assigned to your region (${regNo}).`,
          { requestId }
        )
      );
    }
  });
  await Promise.allSettled(notificationPromises);

  return { 
    success: true, 
    total: importedRows.length, 
    created: createdCount, 
    skipped: skippedCount 
  };
});
