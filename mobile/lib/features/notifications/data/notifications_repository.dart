import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
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
        .orderBy('sentAt', descending: true)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs.map((doc) {
            return NotificationModel.fromJson({
              ...doc.data(),
              'notificationId': doc.id,
            });
          }).toList();
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
  return NotificationsRepository(FirebaseFirestore.instance, user.uid);
}
