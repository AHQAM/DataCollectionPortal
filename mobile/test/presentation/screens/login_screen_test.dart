import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:mobile/features/auth/presentation/login_screen.dart';
import 'package:mobile/features/auth/presentation/auth_controller.dart';
import 'package:mobile/features/auth/domain/user_model.dart';
import 'package:mobile/l10n/app_localizations.dart';

class MockAuthController extends AuthController {
  @override
  FutureOr<UserModel?> build() => null;
}

Widget createTestApp(Widget child, [List<dynamic> overrides = const []]) {
  return ProviderScope(
    overrides: [
      authControllerProvider.overrideWith(() => MockAuthController()),
      ...overrides.cast(),
    ],
    child: MaterialApp(
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('ar'), Locale('en')],
      locale: const Locale('ar'),
      home: child,
    ),
  );
}

void main() {
  group('LoginScreen Widget & Flow Tests', () {
    testWidgets('renders all login screen widgets properly', (
      WidgetTester tester,
    ) async {
      tester.view.physicalSize = const Size(800, 1200);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(createTestApp(const LoginScreen()));
      await tester.pumpAndSettle();

      expect(find.byType(LoginScreen), findsOneWidget);
      expect(find.byIcon(Icons.dashboard_customize), findsOneWidget);
      expect(find.byType(TextFormField), findsNWidgets(2));
      expect(find.byType(ElevatedButton), findsOneWidget);
      expect(find.byIcon(Icons.visibility), findsOneWidget);
    });

    testWidgets('shows validation errors when fields are empty', (
      WidgetTester tester,
    ) async {
      tester.view.physicalSize = const Size(800, 1200);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(createTestApp(const LoginScreen()));
      await tester.pumpAndSettle();

      final buttonFinder = find.byType(ElevatedButton);
      await tester.ensureVisible(buttonFinder);
      await tester.tap(buttonFinder);
      await tester.pumpAndSettle();

      // Should show validation error messages
      expect(find.text('هذا الحقل مطلوب'), findsNWidgets(2));
    });

    testWidgets('toggling password visibility icon changes obscureText', (
      WidgetTester tester,
    ) async {
      tester.view.physicalSize = const Size(800, 1200);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(createTestApp(const LoginScreen()));
      await tester.pumpAndSettle();

      final iconButtonFinder = find.byType(IconButton);
      expect(iconButtonFinder, findsOneWidget);

      await tester.ensureVisible(iconButtonFinder);
      await tester.tap(iconButtonFinder);
      await tester.pumpAndSettle();

      expect(find.byIcon(Icons.visibility_off), findsOneWidget);
    });

    testWidgets('allows entering region number and password', (
      WidgetTester tester,
    ) async {
      tester.view.physicalSize = const Size(800, 1200);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(createTestApp(const LoginScreen()));
      await tester.pumpAndSettle();

      final textFields = find.byType(TextFormField);
      await tester.enterText(textFields.at(0), '101');
      await tester.enterText(textFields.at(1), 'Secret123!');
      await tester.pumpAndSettle();

      expect(find.text('101'), findsOneWidget);
      expect(find.text('Secret123!'), findsOneWidget);
    });
  });
}
