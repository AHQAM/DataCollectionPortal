import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:mobile/features/forms/presentation/dynamic_form_screen.dart';
import 'package:mobile/features/forms/presentation/form_fields_controller.dart';
import 'package:mobile/features/forms/domain/form_field_model.dart';
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
  group('DynamicFormScreen & Submission Flow Tests', () {
    final mockFields = [
      const FormFieldModel(
        id: 'f1',
        fieldKey: 'customer_name',
        labelAr: 'اسم العميل',
        labelEn: 'Customer Name',
        type: 'text',
        isRequired: true,
        orderIndex: 0,
      ),
      const FormFieldModel(
        id: 'f2',
        fieldKey: 'notes',
        labelAr: 'الملاحظات',
        labelEn: 'Notes',
        type: 'textarea',
        isRequired: false,
        orderIndex: 1,
      ),
    ];

    testWidgets('renders dynamic form fields and title correctly', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        createTestApp(
          const DynamicFormScreen(
            requestId: 'req_1',
            recordId: 'rec_1',
            activityId: 'act_1',
            title: 'استبيان الزيارة الميدانية',
          ),
          [
            formFieldsProvider(
              'act_1',
            ).overrideWith((ref) => Future.value(mockFields)),
          ],
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('استبيان الزيارة الميدانية'), findsOneWidget);
      expect(find.text('اسم العميل'), findsAtLeastNWidgets(1));
      expect(find.text('الملاحظات'), findsAtLeastNWidgets(1));
      expect(find.byType(ElevatedButton), findsOneWidget);
    });

    testWidgets('allows entering data into form fields', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        createTestApp(
          const DynamicFormScreen(
            requestId: 'req_1',
            recordId: 'rec_1',
            activityId: 'act_1',
          ),
          [
            formFieldsProvider(
              'act_1',
            ).overrideWith((ref) => Future.value(mockFields)),
          ],
        ),
      );

      await tester.pumpAndSettle();

      final textFields = find.byType(TextFormField);
      expect(textFields, findsNWidgets(2));

      await tester.enterText(textFields.at(0), 'شركة الأمل للتجارة');
      await tester.enterText(textFields.at(1), 'تمت الزيارة بنجاح');
      await tester.pumpAndSettle();

      expect(find.text('شركة الأمل للتجارة'), findsOneWidget);
      expect(find.text('تمت الزيارة بنجاح'), findsOneWidget);
    });
  });
}
