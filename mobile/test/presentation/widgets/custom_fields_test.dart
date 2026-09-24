import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:mobile/features/forms/domain/form_field_model.dart';
import 'package:mobile/features/forms/presentation/widgets/fields/rating_form_field.dart';
import 'package:mobile/features/forms/presentation/widgets/fields/yes_no_form_field.dart';
import 'package:mobile/features/forms/presentation/widgets/fields/text_input_field.dart';
import 'package:mobile/features/forms/presentation/widgets/fields/barcode_form_field.dart';
import 'package:mobile/features/forms/presentation/widgets/fields/location_form_field.dart';
import 'package:mobile/features/forms/presentation/widgets/fields/photo_form_field.dart';
import 'package:mobile/features/forms/presentation/widgets/fields/signature_form_field.dart';
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

  group('BarcodeFormField Widget Tests', () {
    const field = FormFieldModel(
      id: 'barcode_1',
      fieldKey: 'barcode_1',
      type: 'barcode',
      labelAr: 'باركود المنتج',
      labelEn: 'Product Barcode',
      isRequired: true,
    );

    testWidgets('renders barcode icon and enters barcode text', (
      WidgetTester tester,
    ) async {
      String? enteredBarcode;

      await tester.pumpWidget(
        createTestApp(
          BarcodeFormField(
            field: field,
            isArabic: true,
            onChanged: (val) => enteredBarcode = val,
            onSaved: (_) {},
          ),
        ),
      );

      expect(find.text('باركود المنتج'), findsWidgets);
      expect(find.byIcon(Icons.qr_code_scanner), findsOneWidget);

      await tester.enterText(find.byType(TextFormField), '6281001234567');
      expect(enteredBarcode, '6281001234567');
    });

    testWidgets('validates required field when input is empty', (
      WidgetTester tester,
    ) async {
      final formKey = GlobalKey<FormState>();

      await tester.pumpWidget(
        createTestApp(
          Form(
            key: formKey,
            child: BarcodeFormField(
              field: field,
              isArabic: true,
              onChanged: (_) {},
              onSaved: (_) {},
            ),
          ),
        ),
      );

      final isValid = formKey.currentState!.validate();
      await tester.pumpAndSettle();

      expect(isValid, isFalse);
      expect(find.text('يرجى إدخال رمز الباركود'), findsOneWidget);
    });
  });

  group('LocationFormField Widget Tests', () {
    const field = FormFieldModel(
      id: 'loc_1',
      fieldKey: 'loc_1',
      type: 'location',
      labelAr: 'الموقع الجغرافي',
      labelEn: 'GPS Location',
      isRequired: false,
    );

    testWidgets('renders location field header and GPS action button', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        createTestApp(
          LocationFormField(field: field, isArabic: true, onChanged: (_) {}),
        ),
      );

      expect(find.text('الموقع الجغرافي'), findsOneWidget);
      expect(find.byIcon(Icons.my_location), findsOneWidget);
    });
  });

  group('PhotoFormField Widget Tests', () {
    const field = FormFieldModel(
      id: 'photo_1',
      fieldKey: 'photo_1',
      type: 'photo',
      labelAr: 'صورة واجهة المتجر',
      labelEn: 'Storefront Photo',
      isRequired: true,
    );

    testWidgets('renders photo field label and camera icon', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        createTestApp(
          PhotoFormField(
            field: field,
            isArabic: true,
            requestId: 'req-1',
            recordId: 'rec-1',
            onChanged: (_) {},
          ),
        ),
      );

      expect(find.text('صورة واجهة المتجر'), findsOneWidget);
      expect(find.byIcon(Icons.camera_alt), findsWidgets);
    });
  });

  group('SignatureFormField Widget Tests', () {
    const field = FormFieldModel(
      id: 'sig_1',
      fieldKey: 'sig_1',
      type: 'signature',
      labelAr: 'توقيع المستلم',
      labelEn: 'Recipient Signature',
      isRequired: true,
    );

    testWidgets('renders signature canvas and action controls', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        createTestApp(
          SignatureFormField(
            field: field,
            isArabic: true,
            requestId: 'req-1',
            recordId: 'rec-1',
            onChanged: (_) {},
          ),
        ),
      );

      expect(find.text('توقيع المستلم'), findsOneWidget);
      expect(find.byIcon(Icons.draw), findsOneWidget);
      expect(find.text('مسح'), findsOneWidget);
    });
  });
}
