import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/fcm_service.dart';
import '../data/auth_repository.dart';
import '../domain/user_model.dart';

import 'package:cloud_firestore/cloud_firestore.dart';

part 'auth_controller.g.dart';

@riverpod
class AuthController extends _$AuthController {
  @override
  FutureOr<UserModel?> build() async {
    final authRepo = ref.watch(authRepositoryProvider);

    // Listen to auth state changes to refresh user data
    ref.listen<AsyncValue<void>>(
      authRepositoryProvider.select((repo) => const AsyncData(null)),
      (previous, next) {},
    ); // Placeholder to ensure repo is watched if we need to listen directly.

    // The actual stream of Firebase user
    final user = await authRepo.getUserData();
    if (user != null) {
      // Sync FCM token in background if user is already authenticated
      ref.read(fcmServiceProvider).syncToken(user.uid);

      // Listen to Firestore for deactivation
      final subscription = FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .snapshots()
          .listen((doc) {
        if (doc.exists && doc.data()?['isActive'] == false) {
          logout();
        }
      });
      ref.onDispose(() => subscription.cancel());
    }
    return user;
  }

  Future<void> login(String regionNo, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final authRepo = ref.read(authRepositoryProvider);
      await authRepo.login(regionNo, password);
      final user = await authRepo.getUserData();
      if (user != null) {
        await ref.read(fcmServiceProvider).syncToken(user.uid);
      }
      return user;
    });
  }

  Future<void> changePassword(
    String currentPassword,
    String newPassword,
  ) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final authRepo = ref.read(authRepositoryProvider);
      await authRepo.changePassword(currentPassword, newPassword);
      return await authRepo.getUserData();
    });
  }

  Future<void> logout() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      await ref.read(authRepositoryProvider).logout();
      return null;
    });
  }
}
