import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/constants/app_constants.dart';
import '../domain/request_model.dart';
import '../domain/record_model.dart';

part 'requests_repository.g.dart';

class RequestsRepository {
  final FirebaseFirestore _firestore;

  RequestsRepository(this._firestore);

  Stream<List<RequestModel>> watchMyRequests(String userId) {
    return _firestore
        .collection(AppConstants.requestsCollection)
        .where('status', whereIn: const ['Published', 'Closed', 'Archived'])
        .snapshots()
        .map((snapshot) {
          final requests = snapshot.docs.map((doc) {
            final data = Map<String, dynamic>.from(doc.data());
            data['id'] = doc.id;

            DateTime parseDate(dynamic val) {
              if (val is Timestamp) {
                return val.toDate();
              }
              if (val is String) {
                return DateTime.tryParse(val) ?? DateTime.now();
              }
              return DateTime.now();
            }

            data['assignedAt'] = parseDate(
              data['assignedAt'] ?? data['publishedAt'] ?? data['createdAt'],
            ).toIso8601String();
            if (data['dueDate'] != null || data['dueAt'] != null) {
              data['dueDate'] = parseDate(
                data['dueDate'] ?? data['dueAt'],
              ).toIso8601String();
            }
            if (data['completedAt'] != null) {
              data['completedAt'] = parseDate(
                data['completedAt'],
              ).toIso8601String();
            }

            data['activityId'] =
                data['activityId'] ?? data['requestId'] ?? doc.id;
            data['branchId'] =
                data['branchId'] ??
                (data['targetBranches'] is List &&
                        (data['targetBranches'] as List).isNotEmpty
                    ? (data['targetBranches'] as List)[0]
                    : 'MAIN');
            data['regionNo'] = data['regionNo'] ?? 'ALL';
            data['metadata'] = {
              'titleAr': data['titleAr'] ?? data['title'] ?? '',
              'titleEn': data['titleEn'] ?? data['title'] ?? '',
              'requestCode': data['requestCode'] ?? '',
            };

            return RequestModel.fromJson(data);
          }).toList();

          return requests;
        });
  }

  Future<void> updateRequestStatus(String requestId, String status) async {
    await _firestore
        .collection(AppConstants.requestsCollection)
        .doc(requestId)
        .update({'status': status});
  }

  Stream<List<RecordModel>> watchRecordsForRequest(
    String requestId,
    String userId,
  ) {
    return _firestore
        .collection(AppConstants.recordsCollection)
        .where('requestId', isEqualTo: requestId)
        .where('assignedUserId', isEqualTo: userId)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs.map((doc) {
            final data = Map<String, dynamic>.from(doc.data());
            return RecordModel.fromFirestore(doc.id, data);
          }).toList();
        });
  }
}

@riverpod
RequestsRepository requestsRepository(Ref ref) {
  return RequestsRepository(
    FirebaseFirestore.instanceFor(
      app: Firebase.app(),
      databaseId: 'datacollectionportal',
    ),
  );
}
