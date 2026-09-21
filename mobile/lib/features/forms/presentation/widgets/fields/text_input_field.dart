import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../domain/form_field_model.dart';

class TextInputField extends StatelessWidget {
  final FormFieldModel field;
  final bool isArabic;
  final String? currentValue;
  final ValueChanged<String?> onChanged;
  final FormFieldSetter<String>? onSaved;

  const TextInputField({
    super.key,
    required this.field,
    required this.isArabic,
    required this.currentValue,
    required this.onChanged,
    this.onSaved,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final label = isArabic ? field.labelAr : field.labelEn;

    return TextFormField(
      initialValue: currentValue,
      decoration: InputDecoration(
        labelText: label,
        hintText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      keyboardType: TextInputType.text,
      readOnly: field.isReadOnly,
      onChanged: onChanged,
      validator: (value) {
        if (field.isRequired && (value == null || value.trim().isEmpty)) {
          return isArabic
              ? (field.validationMessageAr ?? l10n.requiredField)
              : (field.validationMessageEn ?? l10n.requiredField);
        }
        return null;
      },
      onSaved: onSaved,
    );
  }
}
