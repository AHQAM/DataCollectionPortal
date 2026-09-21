import 'package:flutter/material.dart';

import 'package:mobile/features/forms/domain/form_field_model.dart';


/// Barcode input and scanner field
class BarcodeFormField extends StatelessWidget {
  final FormFieldModel field;
  final bool isArabic;
  final ValueChanged<String> onChanged;
  final FormFieldSetter<String> onSaved;

  const BarcodeFormField({
    super.key,
    required this.field,
    required this.isArabic,
    required this.onChanged,
    required this.onSaved,
  });

  @override
  Widget build(BuildContext context) {
    final label = isArabic ? field.labelAr : field.labelEn;

    return TextFormField(
      decoration: InputDecoration(
        labelText: label,
        hintText: isArabic ? 'أدخل أو امسح الباركود' : 'Enter or scan barcode',
        prefixIcon: const Icon(Icons.qr_code_scanner),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      readOnly: field.isReadOnly,
      validator: (value) {
        if (field.isRequired && (value == null || value.trim().isEmpty)) {
          return isArabic
              ? (field.validationMessageAr ?? 'يرجى إدخال رمز الباركود')
              : (field.validationMessageEn ?? 'Barcode is required');
        }
        return null;
      },
      onChanged: onChanged,
      onSaved: (val) => onSaved(val ?? ''),
    );
  }
}
