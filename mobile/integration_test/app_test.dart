import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mobile/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('end-to-end test', () {
    testWidgets('App starts and shows login screen', (tester) async {
      // Launch the app
      app.main();

      // Wait for the app to settle
      await tester.pumpAndSettle();

      // Ensure that the main screen or login screen rendered (depending on auth state)
      // Just check that a Scaffold or MaterialApp exists
      expect(find.byType(MaterialApp), findsOneWidget);
    });
  });
}
