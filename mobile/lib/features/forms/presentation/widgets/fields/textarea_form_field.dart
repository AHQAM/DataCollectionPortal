import 'package:flutter/material.dart';

import 'package:mobile/features/forms/domain/form_field_model.dart';


/// Multi-line text field
class TextareaFormField extends StatelessWidget {
  final FormFieldModel field;
  final bool isArabic;
  final ValueChanged<String> onChanged;
  final FormFieldSetter<String> onSaved;

  const TextareaFormField({
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
        alignLabelWithHint: true,
        hintText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      maxLines: 4,
      minLines: 2,
      readOnly: field.isReadOnly,
      validator: (value) {
        if (field.isRequired && (value == null || value.trim().isEmpty)) {
          return isArabic
              ? (field.validationMessageAr ?? 'هذا الحقل مطلوب')
              : (field.validationMessageEn ?? 'This field is required');
        }
        return null;
      },
      onChanged: onChanged,
      onSaved: (val) => onSaved(val ?? ''),
    );
  }
}
