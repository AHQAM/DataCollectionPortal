import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/constants/app_constants.dart';
import '../domain/request_model.dart';

part 'requests_repository.g.dart';

class RequestsRepository {
  final FirebaseFirestore _firestore;

  RequestsRepository(this._firestore);

  Stream<List<RequestModel>> watchMyRequests(String regionNo) {
    // We listen to Firestore, and simultaneously cache the results in Hive.
    // If we're offline, Firestore's own offline persistence works, but Hive gives us more control if needed.
    return _firestore
        .collection(AppConstants.requestsCollection)
        .where('regionNo', isEqualTo: regionNo)
        .orderBy('assignedAt', descending: true)
        .snapshots()
        .map((snapshot) {
          final requests = snapshot.docs.map((doc) {
            final data = doc.data();
            data['id'] = doc.id;
            // Handle Firestore Timestamp conversions
            data['assignedAt'] = (data['assignedAt'] as Timestamp)
                .toDate()
                .toIso8601String();
            if (data['dueDate'] != null) {
              data['dueDate'] = (data['dueDate'] as Timestamp)
                  .toDate()
                  .toIso8601String();
            }
            if (data['completedAt'] != null) {
              data['completedAt'] = (data['completedAt'] as Timestamp)
                  .toDate()
                  .toIso8601String();
            }
            return RequestModel.fromJson(data);
          }).toList();

          // Cache locally
          // For simplicity, we can store them in Hive, but Firestore already has a local cache.
          // We will rely on Firestore's cache for reads, and SyncManager for offline writes.

          return requests;
        });
  }

  Future<void> updateRequestStatus(String requestId, String status) async {
    await _firestore
        .collection(AppConstants.requestsCollection)
        .doc(requestId)
        .update({'status': status});
  }
}

@riverpod
RequestsRepository requestsRepository(Ref ref) {
  return RequestsRepository(FirebaseFirestore.instance);
}
