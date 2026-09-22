import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:mobile/features/forms/domain/form_field_model.dart';
import 'package:mobile/features/forms/presentation/widgets/fields/rating_form_field.dart';
import 'package:mobile/features/forms/presentation/widgets/fields/yes_no_form_field.dart';
import 'package:mobile/features/forms/presentation/widgets/fields/text_input_field.dart';
import 'package:mobile/l10n/app_localizations.dart';

Widget createTestApp(Widget child) {
  return MaterialApp(
    localizationsDelegates: const [
      AppLocalizations.delegate,
      GlobalMaterialLocalizations.delegate,
      GlobalWidgetsLocalizations.delegate,
      GlobalCupertinoLocalizations.delegate,
    ],
    supportedLocales: const [Locale('ar'), Locale('en')],
    locale: const Locale('ar'),
    home: Scaffold(body: child),
  );
}

void main() {
  group('RatingFormField Widget Tests', () {
    const field = FormFieldModel(
      id: 'rating_1',
      fieldKey: 'rating_1',
      type: 'rating',
      labelAr: 'تقييم الزيارة',
      labelEn: 'Visit Rating',
      isRequired: true,
    );

    testWidgets('renders stars and updates rating on tap', (
      WidgetTester tester,
    ) async {
      int selectedRating = 0;

      await tester.pumpWidget(
        createTestApp(
          RatingFormField(
            field: field,
            isArabic: true,
            onChanged: (val) => selectedRating = val,
            onSaved: (_) {},
          ),
        ),
      );

      expect(find.text('تقييم الزيارة'), findsOneWidget);
      // Initially rating is 0, so all 5 are star_border
      expect(find.byIcon(Icons.star_border), findsNWidgets(5));

      // Tap on the 4th star
      await tester.tap(find.byIcon(Icons.star_border).at(3));
      await tester.pumpAndSettle();

      expect(selectedRating, 4);
      // After rating 4, 4 stars are filled and 1 is border
      expect(find.byIcon(Icons.star), findsNWidgets(4));
      expect(find.byIcon(Icons.star_border), findsOneWidget);
    });
  });

  group('YesNoFormField Widget Tests', () {
    const field = FormFieldModel(
      id: 'yes_no_1',
      fieldKey: 'yes_no_1',
      type: 'yes_no',
      labelAr: 'هل العميل متواجد؟',
      labelEn: 'Is customer present?',
      isRequired: true,
    );

    testWidgets('renders Yes and No buttons and updates selection', (
      WidgetTester tester,
    ) async {
      bool? selectedValue;

      await tester.pumpWidget(
        createTestApp(
          YesNoFormField(
            field: field,
            isArabic: true,
            onChanged: (val) => selectedValue = val,
            onSaved: (_) {},
          ),
        ),
      );

      expect(find.text('هل العميل متواجد؟'), findsOneWidget);
      expect(find.text('نعم ✓'), findsOneWidget);
      expect(find.text('لا ✗'), findsOneWidget);

      // Tap 'نعم ✓'
      await tester.tap(find.text('نعم ✓'));
      await tester.pumpAndSettle();
      expect(selectedValue, isTrue);

      // Tap 'لا ✗'
      await tester.tap(find.text('لا ✗'));
      await tester.pumpAndSettle();
      expect(selectedValue, isFalse);
    });
  });

  group('TextInputField Widget Tests', () {
    const field = FormFieldModel(
      id: 'text_1',
      fieldKey: 'text_1',
      type: 'text',
      labelAr: 'اسم المتجر',
      labelEn: 'Store Name',
      isRequired: true,
    );

    testWidgets('enters text and triggers onChanged', (
      WidgetTester tester,
    ) async {
      String? enteredText;

      await tester.pumpWidget(
        createTestApp(
          TextInputField(
            field: field,
            isArabic: true,
            currentValue: '',
            onChanged: (val) => enteredText = val,
          ),
        ),
      );

      expect(find.text('اسم المتجر'), findsWidgets);

      await tester.enterText(find.byType(TextFormField), 'بقالة الأمانة');
      expect(enteredText, 'بقالة الأمانة');
    });
  });
}
