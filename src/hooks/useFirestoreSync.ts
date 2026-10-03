import { useEffect } from "react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuthStore } from "../stores/authStore";
import { useDataStore } from "../stores/dataStore";
import {
  User,
  Branch,
  Region,
  RequestItem,
  RequestField,
  Assignment,
  RecordItem,
  NotificationItem,
  DeviceBinding,
  PasswordResetRequest,
} from "../types";
import { useUIStore } from "../stores/uiStore";

export const useFirestoreSync = () => {
  const currentUser = useAuthStore((state) => state.currentUser);

  const setUsers = useDataStore((state) => state.setUsers);
  const setRequests = useDataStore((state) => state.setRequests);
  const setFields = useDataStore((state) => state.setFields);
  const setAssignments = useDataStore((state) => state.setAssignments);
  const setRecords = useDataStore((state) => state.setRecords);
  const setRecordResponses = useDataStore((state) => state.setRecordResponses);
  const setBranches = useDataStore((state) => state.setBranches);
  const setRegions = useDataStore((state) => state.setRegions);
  const setDeviceBindings = useDataStore((state) => state.setDeviceBindings);
  const setPasswordResetRequests = useDataStore(
    (state) => state.setPasswordResetRequests,
  );
  const setNotifications = useUIStore((state) => state.setNotifications);

  useEffect(() => {
    if (!currentUser) {
      setUsers([]);
      setRequests([]);
      setFields([]);
      setAssignments([]);
      setRecords([]);
      setRecordResponses({});
      setNotifications([]);
      setDeviceBindings([]);
      setPasswordResetRequests([]);
      return;
    }

    const isAdmin = currentUser.role === "ADMIN";
    const isSupervisor = currentUser.role === "SUPERVISOR";
    const isRep = currentUser.role === "REP";

    const usersQuery = isAdmin
      ? collection(db, "users")
      : query(
          collection(db, "users"),
          where("branchId", "==", currentUser.branchId),
        );

    const requestsCollection = collection(db, "requests");
    const allowedRegionNos = currentUser.allowedRegionNos?.length
      ? Array.from(new Set(currentUser.allowedRegionNos))
      : [currentUser.regionNo];
    const allowedRegionChunks = Array.from(
      { length: Math.ceil(allowedRegionNos.length / 30) },
      (_, index) => allowedRegionNos.slice(index * 30, (index + 1) * 30),
    );
    const requestsQueries = isAdmin
      ? [requestsCollection]
      : isSupervisor
        ? [
            query(
              requestsCollection,
              where("branchId", "==", currentUser.branchId),
            ),
            query(
              requestsCollection,
              where("targetBranches", "array-contains", currentUser.branchId),
            ),
          ]
        : [
            ...allowedRegionChunks.map((regionNos) =>
              query(
                requestsCollection,
                where("targetRegions", "array-contains-any", regionNos),
                where("status", "in", ["Published", "Closed", "Archived"]),
              ),
            ),
            query(
              requestsCollection,
              where("targetRegions", "==", []),
              where("status", "in", ["Published", "Closed", "Archived"]),
            ),
          ];

    const assignmentsQuery = isAdmin
      ? collection(db, "assignments")
      : isSupervisor
        ? query(
            collection(db, "assignments"),
            where("branchId", "==", currentUser.branchId),
          )
        : query(
            collection(db, "assignments"),
            where("userId", "==", currentUser.userId),
          );

    const recordsQuery = isAdmin
      ? collection(db, "records")
      : isSupervisor
        ? query(
            collection(db, "records"),
            where("branchId", "==", currentUser.branchId),
          )
        : query(
            collection(db, "records"),
            where("assignedUserId", "==", currentUser.userId),
          );

    const responsesQuery = isAdmin
      ? collection(db, "responses")
      : isSupervisor
        ? query(
            collection(db, "responses"),
            where("branchId", "==", currentUser.branchId),
          )
        : query(
            collection(db, "responses"),
            where("submittedBy", "==", currentUser.userId),
          );

    const notificationsQuery = isAdmin
      ? collection(db, "notifications")
      : query(
          collection(db, "notifications"),
          where("userId", "==", currentUser.userId),
        );

    const unsubUsers = isRep
      ? onSnapshot(
          doc(db, "users", currentUser.userId),
          (snapshot) => {
            setUsers(snapshot.exists() ? [snapshot.data() as User] : []);
          },
          (error) => console.error("Error listening to users:", error),
        )
      : onSnapshot(
          usersQuery,
          (snapshot) => {
            const firestoreUsers: User[] = [];
            snapshot.forEach((docSnap) =>
              firestoreUsers.push(docSnap.data() as User),
            );
            if (firestoreUsers.length > 0) setUsers(firestoreUsers);
          },
          (error) => console.error("Error listening to users:", error),
        );

    const requestSnapshots = new Map<number, RequestItem[]>();
    const unsubRequests = requestsQueries.map((requestsQuery, index) =>
      onSnapshot(
        requestsQuery,
        (snapshot) => {
          const data: RequestItem[] = [];
          snapshot.forEach((docSnap) =>
            data.push(docSnap.data() as RequestItem),
          );
          requestSnapshots.set(index, data);
          const mergedRequests = new Map<string, RequestItem>();
          requestSnapshots.forEach((requests) =>
            requests.forEach((request) =>
              mergedRequests.set(request.requestId, request),
            ),
          );
          setRequests(Array.from(mergedRequests.values()));
        },
        (error) => console.error("Error listening to requests:", error),
      ),
    );

    const unsubFields = onSnapshot(
      collection(db, "request_fields"),
      (snapshot) => {
        const data: RequestField[] = [];
        snapshot.forEach((docSnap) =>
          data.push(docSnap.data() as RequestField),
        );
        setFields(data);
      },
      (error) => console.error("Error listening to fields:", error),
    );

    const unsubAssignments = onSnapshot(
      assignmentsQuery,
      (snapshot) => {
        const data: Assignment[] = [];
        snapshot.forEach((docSnap) => data.push(docSnap.data() as Assignment));
        setAssignments(data);
      },
      (error) => console.error("Error listening to assignments:", error),
    );

    const unsubRecords = onSnapshot(
      recordsQuery,
      (snapshot) => {
        const data: RecordItem[] = [];
        snapshot.forEach((docSnap) => data.push(docSnap.data() as RecordItem));
        setRecords(data);
      },
      (error) => console.error("Error listening to records:", error),
    );

    const unsubResponses = onSnapshot(
      responsesQuery,
      (snapshot) => {
        const data: Record<string, Record<string, any>> = {};
        snapshot.forEach((docSnap) => {
          const resp = docSnap.data();
          const recordId = resp.recordId || docSnap.id;
          const answers = resp.data || resp.answers;
          if (recordId && answers) {
            data[recordId] = answers;
          }
        });
        setRecordResponses(data);
      },
      (error) => console.error("Error listening to responses:", error),
    );

    const unsubNotifications = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const data: NotificationItem[] = [];
        snapshot.forEach((docSnap) =>
          data.push(docSnap.data() as NotificationItem),
        );
        setNotifications(
          data.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        );
      },
      (error) => console.error("Error listening to notifications:", error),
    );

    const unsubBranches = onSnapshot(
      collection(db, "branches"),
      (snapshot) => {
        const data: Branch[] = [];
        snapshot.forEach((docSnap) => data.push(docSnap.data() as Branch));
        setBranches(data);
      },
      (error) => console.error("Error listening to branches:", error),
    );

    const unsubRegions = onSnapshot(
      collection(db, "regions"),
      (snapshot) => {
        const data: Region[] = [];
        snapshot.forEach((docSnap) => data.push(docSnap.data() as Region));
        setRegions(data);
      },
      (error) => console.error("Error listening to regions:", error),
    );

    const unsubDeviceBindings = isAdmin
      ? onSnapshot(
          collection(db, "deviceBindings"),
          (snapshot) => {
            const data: DeviceBinding[] = [];
            snapshot.forEach((docSnap) =>
              data.push(docSnap.data() as DeviceBinding),
            );
            setDeviceBindings(data);
          },
          (error) => console.error("Error listening to deviceBindings:", error),
        )
      : () => {};

    const unsubPasswordResets = isAdmin
      ? onSnapshot(
          collection(db, "passwordResetRequests"),
          (snapshot) => {
            const data: PasswordResetRequest[] = [];
            snapshot.forEach((docSnap) =>
              data.push(docSnap.data() as PasswordResetRequest),
            );
            setPasswordResetRequests(data);
          },
          (error) =>
            console.error("Error listening to passwordResetRequests:", error),
        )
      : () => {};

    return () => {
      unsubUsers();
      unsubRequests.forEach((unsubscribe) => unsubscribe());
      unsubFields();
      unsubAssignments();
      unsubRecords();
      unsubResponses();
      unsubNotifications();
      unsubBranches();
      unsubRegions();
      unsubDeviceBindings();
      unsubPasswordResets();
    };
  }, [currentUser]);
};
