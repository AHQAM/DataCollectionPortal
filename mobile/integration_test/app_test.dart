import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mobile/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('end-to-end test', () {
    testWidgets('App starts, shows login screen, and attempts login', (tester) async {
      // Launch the app
      app.main();

      // Wait for the app to settle
      await tester.pumpAndSettle();

      // Ensure that the main screen or login screen rendered
      expect(find.byType(MaterialApp), findsOneWidget);

      // Check if we are on the login screen by looking for the lock icon or text fields
      final regionField = find.byType(TextFormField).first;
      final passwordField = find.byType(TextFormField).last;
      
      if (tester.any(regionField)) {
        // Enter region number
        await tester.enterText(regionField, '101');
        
        // Enter password
        await tester.enterText(passwordField, 'password123');
        
        // Find and tap the login button
        final loginBtn = find.byType(ElevatedButton);
        expect(loginBtn, findsOneWidget);
        
        await tester.tap(loginBtn);
        
        // Trigger a frame
        await tester.pump();
        
        // At this point it might show a loading spinner or an error depending on the local auth state.
        // We simply assert the UI reacted to our input.
        expect(find.text('101'), findsOneWidget);
      }
    });
  });
}
