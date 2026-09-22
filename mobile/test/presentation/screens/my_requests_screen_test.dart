import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:mobile/features/requests/presentation/my_requests_screen.dart';
import 'package:mobile/features/requests/presentation/requests_controller.dart';
import 'package:mobile/features/requests/domain/request_model.dart';
import 'package:mobile/l10n/app_localizations.dart';

Widget createTestApp(Widget child, [List<dynamic> overrides = const []]) {
  return ProviderScope(
    overrides: overrides.cast(),
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
  group('MyRequestsScreen Widget Tests', () {
    testWidgets('shows empty state when requests list is empty', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        createTestApp(const MyRequestsScreen(), [
          myRequestsProvider.overrideWith(
            (ref) => Stream.value(<RequestModel>[]),
          ),
        ]),
      );

      await tester.pumpAndSettle();

      expect(find.byType(MyRequestsScreen), findsOneWidget);
      expect(find.text('طلباتي'), findsOneWidget);
      // Empty state text
      expect(find.byType(ListView), findsNothing);
    });

    testWidgets('renders list of requests when data is provided', (
      WidgetTester tester,
    ) async {
      final mockRequests = [
        RequestModel(
          id: 'req_1',
          activityId: 'ACT-001',
          branchId: 'B1',
          regionNo: '101',
          status: 'Published',
          assignedAt: DateTime(2026, 1, 1),
          metadata: {
            'titleAr': 'حملة تحديث بيانات العملاء',
            'titleEn': 'Customer Data Campaign',
            'requestCode': 'REQ-2026-01',
          },
        ),
      ];

      await tester.pumpWidget(
        createTestApp(const MyRequestsScreen(), [
          myRequestsProvider.overrideWith((ref) => Stream.value(mockRequests)),
        ]),
      );

      await tester.pumpAndSettle();

      expect(find.text('حملة تحديث بيانات العملاء'), findsOneWidget);
      expect(find.text('REQ-2026-01'), findsOneWidget);
    });
  });
}
