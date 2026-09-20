import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../core/constants/app_constants.dart';
import '../domain/notification_model.dart';
import '../../auth/presentation/auth_controller.dart';

part 'notifications_repository.g.dart';

class NotificationsRepository {
  final FirebaseFirestore _firestore;
  final String userId;

  NotificationsRepository(this._firestore, this.userId);

  Stream<List<NotificationModel>> watchNotifications() {
    return _firestore
        .collection('notifications')
        .where('userId', isEqualTo: userId)
        .snapshots()
        .map((snapshot) {
          final list = <NotificationModel>[];
          for (final doc in snapshot.docs) {
            try {
              final data = doc.data();
              final rawSentAt = data['sentAt'];
              String sentAtStr;
              if (rawSentAt is Timestamp) {
                sentAtStr = rawSentAt.toDate().toIso8601String();
              } else if (rawSentAt is String) {
                sentAtStr = rawSentAt;
              } else {
                sentAtStr = DateTime.now().toIso8601String();
              }

              final rawCreatedAt = data['createdAt'];
              String createdAtStr;
              if (rawCreatedAt is Timestamp) {
                createdAtStr = rawCreatedAt.toDate().toIso8601String();
              } else if (rawCreatedAt is String) {
                createdAtStr = rawCreatedAt;
              } else {
                createdAtStr = sentAtStr;
              }

              final model = NotificationModel.fromJson({
                ...data,
                'notificationId': doc.id,
                'sentAt': sentAtStr,
                'createdAt': createdAtStr,
              });
              list.add(model);
            } catch (e) {
              // Ignore single malformed doc to prevent breaking the notification screen
            }
          }
          list.sort((a, b) => b.sentAt.compareTo(a.sentAt));
          return list;
        });
  }

  Future<void> markAsRead(String notificationId) async {
    await _firestore.collection('notifications').doc(notificationId).update({
      'status': 'READ',
    });
  }
}

@riverpod
NotificationsRepository? notificationsRepository(Ref ref) {
  final user = ref.watch(authControllerProvider).value;
  if (user == null) return null;
  return NotificationsRepository(
    FirebaseFirestore.instanceFor(
      app: Firebase.app(),
      databaseId: AppConstants.databaseId,
    ),
    user.uid,
  );
}
