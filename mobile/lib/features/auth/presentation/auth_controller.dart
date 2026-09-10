import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/auth_repository.dart';
import '../domain/user_model.dart';

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
    return await authRepo.getUserData();
  }

  Future<void> login(String regionNo, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final authRepo = ref.read(authRepositoryProvider);
      await authRepo.login(regionNo, password);
      return await authRepo.getUserData();
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
