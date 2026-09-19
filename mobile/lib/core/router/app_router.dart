import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/change_password_screen.dart';
import '../../features/auth/presentation/auth_controller.dart';
import '../../features/requests/presentation/my_requests_screen.dart';
import '../../features/requests/presentation/request_records_screen.dart';
import '../../features/forms/presentation/dynamic_form_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';

part 'app_router.g.dart';

@riverpod
GoRouter appRouter(Ref ref) {
  final authState = ref.watch(authControllerProvider);

  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isAuthLoading = authState.isLoading;
      if (isAuthLoading) return null; // Wait for loading

      final user = authState.value;
      final isLoggingIn = state.uri.path == '/login';

      if (user == null) {
        // Not logged in and trying to access a secure page
        if (!isLoggingIn) return '/login';
      } else {
        // Logged in
        if (user.mustChangePassword) {
          if (state.uri.path != '/change-password') return '/change-password';
        } else {
          // Logged in, no forced password change
          if (isLoggingIn || state.uri.path == '/change-password') {
            return '/requests';
          }
        }
      }
      return null; // No redirect needed
    },
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/change-password',
        builder: (context, state) => const ChangePasswordScreen(),
      ),
      GoRoute(
        path: '/requests',
        builder: (context, state) => const MyRequestsScreen(),
      ),
      GoRoute(
        path: '/request/:requestId/records',
        builder: (context, state) {
          final requestId = state.pathParameters['requestId']!;
          final activityId = state.uri.queryParameters['activityId'] ?? requestId;
          final title = state.uri.queryParameters['title'] ?? 'Request Records';
          return RequestRecordsScreen(
            requestId: requestId,
            activityId: activityId,
            requestTitle: title,
          );
        },
      ),
      GoRoute(
        path: '/form/:requestId/:activityId',
        builder: (context, state) {
          final requestId = state.pathParameters['requestId']!;
          final activityId = state.pathParameters['activityId']!;
          return DynamicFormScreen(
            requestId: requestId,
            recordId: state.uri.queryParameters['recordId'] ?? requestId,
            activityId: activityId,
            title: state.uri.queryParameters['title'],
          );
        },
      ),
      GoRoute(
        path: '/notifications',
        builder: (context, state) => const NotificationsScreen(),
      ),
    ],
  );
}
