import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:mobile/l10n/app_localizations.dart';

import 'dart:ui';
import 'package:flutter/foundation.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'firebase_options.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';
import 'core/storage/hive_service.dart';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_app_check/firebase_app_check.dart';
import 'core/services/fcm_service.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // If you're going to use other Firebase services in the background, such as Firestore,
  // make sure you call `initializeApp` before using other Firebase services.
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  debugPrint("Handling a background message: ${message.messageId}");
}

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Capture Flutter Framework errors (layout overflows, widget build errors, etc.)
  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    debugPrint(
      'FlutterError.onError: ${details.exceptionAsString()}\n${details.stack}',
    );
    try {
      FirebaseCrashlytics.instance.recordFlutterFatalError(details);
    } catch (_) {
      // Firebase not initialized yet
    }
  };

  // 2. Capture asynchronous Platform errors
  PlatformDispatcher.instance.onError = (Object error, StackTrace stack) {
    debugPrint('PlatformDispatcher.onError: $error\n$stack');
    try {
      FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
    } catch (_) {
      // Firebase not initialized yet
    }
    return true; // handled
  };

  runZonedGuarded(
    () async {
      bool firebaseInitialized = false;

      // Initialize Firebase with fallback error handling
      try {
        await Firebase.initializeApp(
          options: DefaultFirebaseOptions.currentPlatform,
        );
        firebaseInitialized = true;

        // Configure App Check
        try {
          await FirebaseAppCheck.instance.activate(
            providerAndroid: kDebugMode
                ? const AndroidDebugProvider()
                : const AndroidPlayIntegrityProvider(),
            providerApple: kDebugMode
                ? const AppleDebugProvider()
                : const AppleDeviceCheckProvider(),
          );
        } catch (e) {
          debugPrint('Firebase App Check activation failed: $e');
        }

        // Configure Crashlytics (disabled in debug mode, active in release/production)
        await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(
          !kDebugMode,
        );

        // Initialize FCM
        FirebaseMessaging.onBackgroundMessage(
          _firebaseMessagingBackgroundHandler,
        );

        // Request permission (iOS/Web mainly)
        await FirebaseMessaging.instance.requestPermission(
          alert: true,
          badge: true,
          sound: true,
        );
      } catch (e, stack) {
        debugPrint('Firebase initialization failed: $e\n$stack');
      }

      // Initialize local storage
      try {
        await Hive.initFlutter();
        await HiveService().init();
      } catch (e, stack) {
        debugPrint('Hive initialization failed: $e\n$stack');
      }

      if (!firebaseInitialized) {
        runApp(const FirebaseErrorApp());
        return;
      }

      runApp(const ProviderScope(child: SalesCollectionApp()));
    },
    (error, stack) {
      debugPrint('Uncaught exception in runZonedGuarded: $error\n$stack');
      try {
        FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
      } catch (_) {
        // Firebase not initialized yet
      }
    },
  );
}

class FirebaseErrorApp extends StatelessWidget {
  const FirebaseErrorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.cloud_off_rounded,
                      size: 40,
                      color: Colors.red.shade600,
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'فشل الاتصال بالخادم',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E293B),
                    ),
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    'تعذر تهيئة خدمات النظام الأساسية. يرجى التحقق من اتصالك بالإنترنت ثم إعادة تشغيل التطبيق.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 14, color: Color(0xFF64748B)),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class SalesCollectionApp extends ConsumerStatefulWidget {
  const SalesCollectionApp({super.key});

  @override
  ConsumerState<SalesCollectionApp> createState() => _SalesCollectionAppState();
}

class _SalesCollectionAppState extends ConsumerState<SalesCollectionApp> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final fcmService = ref.read(fcmServiceProvider);
      final router = ref.read(appRouterProvider);
      fcmService.setupNotificationTapHandlers(router);
    });
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(appRouterProvider);
    final fcmService = ref.watch(fcmServiceProvider);

    return MaterialApp.router(
      title: 'Sales Collection Hub',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,

      // Localization setup
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('ar', ''), Locale('en', '')],
      locale: const Locale('ar', ''), // Default to Arabic
      // Router setup
      routerConfig: router,
      builder: (context, child) {
        fcmService.setupForegroundNotificationHandler(context);
        return child ?? const SizedBox.shrink();
      },
    );
  }
}
