import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../constants/app_constants.dart';

class FcmService {
  FirebaseMessaging? _messagingInstance;
  FirebaseFirestore? _firestoreInstance;
  StreamSubscription<String>? _tokenRefreshSubscription;
  StreamSubscription<RemoteMessage>? _foregroundMessageSubscription;

  FcmService({FirebaseMessaging? messaging, FirebaseFirestore? firestore})
    : _messagingInstance = messaging,
      _firestoreInstance = firestore;

  FirebaseMessaging? get _messaging {
    if (_messagingInstance != null) return _messagingInstance;
    try {
      if (Firebase.apps.isNotEmpty) {
        _messagingInstance = FirebaseMessaging.instance;
      }
    } catch (_) {}
    return _messagingInstance;
  }

  FirebaseFirestore? get _firestore {
    if (_firestoreInstance != null) return _firestoreInstance;
    try {
      if (Firebase.apps.isNotEmpty) {
        _firestoreInstance = FirebaseFirestore.instanceFor(
          app: Firebase.app(),
          databaseId: AppConstants.databaseId,
        );
      }
    } catch (_) {}
    return _firestoreInstance;
  }

  /// Request notification permissions (Android 13+ & iOS)
  Future<NotificationSettings?> requestPermission() async {
    final messaging = _messaging;
    if (messaging == null) return null;
    return await messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );
  }

  /// Sync FCM token to Firestore users collection
  Future<void> syncToken(String userId) async {
    try {
      final messaging = _messaging;
      if (messaging == null) return;
      await requestPermission();
      final token = await messaging.getToken();
      if (token != null && token.isNotEmpty) {
        await _updateTokenInFirestore(userId, token);
      }

      // Listen for token refresh events
      listenTokenRefresh(userId);
    } catch (e) {
      debugPrint('FcmService.syncToken error: $e');
    }
  }

  /// Update token in Firestore
  Future<void> _updateTokenInFirestore(String userId, String token) async {
    try {
      final firestore = _firestore;
      if (firestore == null) return;
      await firestore
          .collection(AppConstants.usersCollection)
          .doc(userId)
          .update({
            'fcmToken': token,
            'fcmTokenUpdatedAt': FieldValue.serverTimestamp(),
          });
      debugPrint('FCM Token synced successfully for user: $userId');
    } catch (e) {
      debugPrint('Failed to update FCM token in Firestore: $e');
    }
  }

  /// Listen to token refresh
  void listenTokenRefresh(String userId) {
    final messaging = _messaging;
    if (messaging == null) return;
    _tokenRefreshSubscription?.cancel();
    _tokenRefreshSubscription = messaging.onTokenRefresh.listen(
      (newToken) async {
        debugPrint('FCM Token refreshed: $newToken');
        await _updateTokenInFirestore(userId, newToken);
      },
      onError: (err) {
        debugPrint('FCM Token refresh error: $err');
      },
    );
  }

  /// Clear token on logout
  Future<void> clearToken(String userId) async {
    try {
      _tokenRefreshSubscription?.cancel();
      _tokenRefreshSubscription = null;

      final firestore = _firestore;
      if (firestore != null) {
        await firestore
            .collection(AppConstants.usersCollection)
            .doc(userId)
            .update({'fcmToken': FieldValue.delete()});
        debugPrint('FCM Token cleared for user: $userId');
      }
    } catch (e) {
      debugPrint('Failed to clear FCM token in Firestore: $e');
    }
  }

  /// Setup foreground message listener to show in-app banner/SnackBar
  void setupForegroundNotificationHandler(BuildContext context) {
    try {
      if (Firebase.apps.isEmpty) return;
    } catch (_) {
      return;
    }
    _foregroundMessageSubscription?.cancel();
    // Capture ScaffoldMessengerState synchronously before the async listener
    // to satisfy use_build_context_synchronously lint rule.
    final messenger = ScaffoldMessenger.of(context);
    _foregroundMessageSubscription = FirebaseMessaging.onMessage.listen((
      RemoteMessage message,
    ) {
      debugPrint('Foreground FCM message received: ${message.messageId}');
      final notification = message.notification;
      if (notification == null) return;

      final title = notification.title ?? 'إشعار جديد';
      final body = notification.body ?? '';
      final requestId = message.data['requestId'];

      messenger.showSnackBar(
        SnackBar(
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          backgroundColor: AppConstants.primaryColor,
          duration: const Duration(seconds: 4),
          content: Row(
            children: [
              const Icon(
                Icons.notifications_active_rounded,
                color: AppConstants.accentColor,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        fontSize: 14,
                      ),
                    ),
                    if (body.isNotEmpty)
                      Text(
                        body,
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                  ],
                ),
              ),
            ],
          ),
          action: SnackBarAction(
            label: 'عرض',
            textColor: AppConstants.accentColor,
            onPressed: () {
              final router = GoRouter.of(context);
              if (requestId != null && requestId.toString().isNotEmpty) {
                router.push(
                  '/request/$requestId/records?activityId=$requestId&title=${Uri.encodeComponent(title)}',
                );
              } else {
                router.push('/notifications');
              }
            },
          ),
        ),
      );
    });
  }

  /// Setup notification tap handlers for background/terminated states
  void setupNotificationTapHandlers(GoRouter router) {
    final messaging = _messaging;
    if (messaging == null) return;

    // 1. When app is in background and opened via notification tap
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('FCM onMessageOpenedApp tapped: ${message.messageId}');
      _handleNotificationClick(message, router);
    });

    // 2. When app was terminated and launched by tapping a notification
    messaging.getInitialMessage().then((RemoteMessage? message) {
      if (message != null) {
        debugPrint('FCM getInitialMessage tapped: ${message.messageId}');
        _handleNotificationClick(message, router);
      }
    });
  }

  void _handleNotificationClick(RemoteMessage message, GoRouter router) {
    final requestId = message.data['requestId'];
    final title = message.notification?.title ?? 'الطلب';

    if (requestId != null && requestId.toString().isNotEmpty) {
      router.push(
        '/request/$requestId/records?activityId=$requestId&title=${Uri.encodeComponent(title)}',
      );
    } else {
      router.push('/notifications');
    }
  }

  void dispose() {
    _tokenRefreshSubscription?.cancel();
    _foregroundMessageSubscription?.cancel();
  }
}

final fcmServiceProvider = Provider<FcmService>((ref) {
  final service = FcmService();
  ref.onDispose(() => service.dispose());
  return service;
});
