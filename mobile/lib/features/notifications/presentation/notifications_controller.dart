import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../domain/notification_model.dart';
import '../data/notifications_repository.dart';

part 'notifications_controller.g.dart';

@riverpod
Stream<List<NotificationModel>> myNotifications(Ref ref) {
  final repository = ref.watch(notificationsRepositoryProvider);
  if (repository == null) {
    return Stream.value([]);
  }
  return repository.watchNotifications();
}

@riverpod
class NotificationsController extends _$NotificationsController {
  @override
  FutureOr<void> build() {}

  Future<void> markAsRead(String notificationId) async {
    final repository = ref.read(notificationsRepositoryProvider);
    if (repository == null) return;

    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => repository.markAsRead(notificationId));
  }
}
