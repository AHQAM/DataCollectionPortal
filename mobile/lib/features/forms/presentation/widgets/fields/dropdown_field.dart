import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../domain/form_field_model.dart';

class DropdownField extends StatelessWidget {
  final FormFieldModel field;
  final bool isArabic;
  final String? currentValue;
  final ValueChanged<String?>? onChanged;
  final FormFieldSetter<String>? onSaved;

  const DropdownField({
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

    return DropdownButtonFormField<String>(
      initialValue: currentValue,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      items:
          field.options
              ?.map(
                (option) =>
                    DropdownMenuItem(value: option, child: Text(option)),
              )
              .toList() ??
          [],
      validator: (value) {
        if (field.isRequired && value == null) {
          return isArabic
              ? (field.validationMessageAr ?? l10n.requiredField)
              : (field.validationMessageEn ?? l10n.requiredField);
        }
        return null;
      },
      onChanged: field.isReadOnly ? null : onChanged,
      onSaved: onSaved,
    );
  }
}
