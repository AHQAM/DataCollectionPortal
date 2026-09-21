import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/forms/domain/form_field_model.dart';

void main() {
  group('FormFieldModel JSON Parsing', () {
    test('Parses a standard text field correctly', () {
      final json = {
        'id': 'f1',
        'fieldKey': 'firstName',
        'type': 'text',
        'labelAr': 'الاسم',
        'labelEn': 'First Name',
        'isRequired': true,
      };

      final field = FormFieldModel.fromJson(json);

      expect(field.id, 'f1');
      expect(field.fieldKey, 'firstName');
      expect(field.key, 'firstName');
      expect(field.type, 'text');
      expect(field.labelAr, 'الاسم');
      expect(field.labelEn, 'First Name');
      expect(field.isRequired, true);
    });

    test('Maps legacy field types correctly', () {
      final json = {'id': 'f2', 'fieldType': 'gps', 'fieldLabelAr': 'الموقع'};

      final field = FormFieldModel.fromJson(json);

      // gps should map to location
      expect(field.type, 'location');
      expect(field.id, 'f2');
      expect(field.key, 'f2');
      expect(field.labelAr, 'الموقع');
    });

    test('Parses dropdown options correctly', () {
      final json = {
        'id': 'f3',
        'type': 'select',
        'labelAr': 'اختر',
        'options': [
          {'labelAr': 'خيار ١', 'value': 'opt1'},
          'opt2',
        ],
      };

      final field = FormFieldModel.fromJson(json);

      // select should map to dropdown
      expect(field.type, 'dropdown');
      expect(field.options, isNotNull);
      expect(field.options!.length, 2);
      expect(field.options![0], 'خيار ١');
      expect(field.options![1], 'opt2');
    });

    test('Parses visibility rules correctly', () {
      final json = {
        'id': 'f4',
        'type': 'text',
        'labelAr': 'سبب الرفض',
        'visibilityRule': {
          'targetFieldKey': 'status',
          'operator': 'equals',
          'value': 'rejected',
        },
      };

      final field = FormFieldModel.fromJson(json);

      expect(field.visibilityRule, isNotNull);
      expect(field.visibilityRule!['targetFieldKey'], 'status');
      expect(field.visibilityRule!['operator'], 'equals');
    });
  });
}
