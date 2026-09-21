import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:signature/signature.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../../domain/form_field_model.dart';

const Color _emerald = Color(0xFF059669);
const Color _emeraldLight = Color(0xFFECFDF5);
const Color _emeraldBorder = Color(0xFFA7F3D0);

/// Yes/No boolean toggle field
class YesNoFormField extends StatefulWidget {
  final FormFieldModel field;
  final bool isArabic;
  final ValueChanged<bool?> onChanged;
  final FormFieldSetter<bool?> onSaved;

  const YesNoFormField({
    super.key,
    required this.field,
    required this.isArabic,
    required this.onChanged,
    required this.onSaved,
  });

  @override
  State<YesNoFormField> createState() => _YesNoFormFieldState();
}

class _YesNoFormFieldState extends State<YesNoFormField> {
  bool? _value;

  @override
  Widget build(BuildContext context) {
    final label = widget.isArabic ? widget.field.labelAr : widget.field.labelEn;

    return FormField<bool>(
      validator: (val) {
        if (widget.field.isRequired && _value == null) {
          return widget.isArabic
              ? (widget.field.validationMessageAr ?? 'يرجى تحديد نعم أو لا')
              : (widget.field.validationMessageEn ?? 'Please select Yes or No');
        }
        return null;
      },
      onSaved: (_) => widget.onSaved(_value),
      builder: (state) {
        return Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: BorderSide(
              color: state.hasError
                  ? Theme.of(context).colorScheme.error
                  : Colors.grey.shade300,
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(14.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        label,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    if (widget.field.isRequired)
                      const Text(
                        ' *',
                        style: TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: ChoiceChip(
                        label: Center(
                          child: Text(widget.isArabic ? 'نعم ✓' : 'Yes ✓'),
                        ),
                        selected: _value == true,
                        selectedColor: Colors.green.withValues(alpha: 0.2),
                        onSelected: widget.field.isReadOnly
                            ? null
                            : (selected) {
                                setState(() {
                                  _value = selected ? true : null;
                                });
                                widget.onChanged(_value);
                                state.didChange(_value);
                              },
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ChoiceChip(
                        label: Center(
                          child: Text(widget.isArabic ? 'لا ✗' : 'No ✗'),
                        ),
                        selected: _value == false,
                        selectedColor: Colors.red.withValues(alpha: 0.2),
                        onSelected: widget.field.isReadOnly
                            ? null
                            : (selected) {
                                setState(() {
                                  _value = selected ? false : null;
                                });
                                widget.onChanged(_value);
                                state.didChange(_value);
                              },
                      ),
                    ),
                  ],
                ),
                if (state.hasError)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      state.errorText ?? '',
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                        fontSize: 12,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
