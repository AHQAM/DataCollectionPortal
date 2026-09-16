import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:uuid/uuid.dart';

import '../../../core/constants/app_constants.dart';
import '../domain/user_model.dart';

part 'auth_repository.g.dart';

class AuthRepository {
  final FirebaseAuth _auth;
  final FirebaseFunctions _functions;
  final FlutterSecureStorage _secureStorage;

  AuthRepository(this._auth, this._functions, this._secureStorage);

  Stream<User?> authStateChanges() => _auth.authStateChanges();
  User? get currentUser => _auth.currentUser;

  Future<String> _getOrGenerateDeviceId() async {
    String? deviceId = await _secureStorage.read(key: AppConstants.deviceIdKey);
    if (deviceId == null) {
      deviceId = const Uuid().v4();
      await _secureStorage.write(
        key: AppConstants.deviceIdKey,
        value: deviceId,
      );
    }
    return deviceId;
  }

  Future<void> login(String regionNo, String password) async {
    final deviceId = await _getOrGenerateDeviceId();

    // Get FCM token for push notifications (optional — may fail on devices without GMS)
    String? fcmToken;
    try {
      fcmToken = await FirebaseMessaging.instance.getToken();
    } catch (e) {
      // FCM not available on this device — login will proceed without it
      debugPrint('FCM token unavailable: $e');
    }

    // Call the custom login Cloud Function
    final HttpsCallable callable =
        _functions.httpsCallable('authenticateWithRegionPassword');
    final response = await callable.call(<String, dynamic>{
      'regionNo': regionNo,
      'password': password,
      'installationDeviceId': deviceId,
      'platform': 'android',
      'appVersion': '1.0.0',
      if (fcmToken != null) 'fcmToken': fcmToken,
    });

    final String customToken = response.data['token'];

    // Sign in with the generated custom token
    await _auth.signInWithCustomToken(customToken);
  }

  Future<void> changePassword(
    String currentPassword,
    String newPassword,
  ) async {
    final HttpsCallable callable = _functions.httpsCallable('changePassword');
    await callable.call(<String, dynamic>{
      'currentPassword': currentPassword,
      'newPassword': newPassword,
    });

    // Force token refresh to pick up the new claims
    await _auth.currentUser?.getIdTokenResult(true);
  }

  Future<void> logout() async {
    await _auth.signOut();
  }

  Future<UserModel?> getUserData() async {
    final user = _auth.currentUser;
    if (user == null) return null;

    final idTokenResult = await user.getIdTokenResult(true);
    final claims = idTokenResult.claims;

    if (claims == null) return null;

    return UserModel(
      uid: user.uid,
      regionNo: claims['regionNo'] as String? ?? '',
      // Check allowed region numbers (if applicable, e.g. supervisors)
      allowedRegionNos: [
        ...?((claims['allowedRegionNos'] as List<dynamic>?)
            ?.map((e) => e.toString())),
      ],
      branchId: claims['branchId'] as String?,
      role: claims['role'] as String? ?? 'sales_rep',
      mustChangePassword: claims['mustChangePassword'] as bool? ?? false,
      lastLoginAt: DateTime.parse(
        claims['lastLoginAt'] as String? ?? DateTime.now().toIso8601String(),
      ),
      sessionVersion: claims['sessionVersion'] as String? ?? '',
    );
  }
}

@riverpod
AuthRepository authRepository(Ref ref) {
  return AuthRepository(
    FirebaseAuth.instance,
    FirebaseFunctions.instance,
    const FlutterSecureStorage(),
  );
}
