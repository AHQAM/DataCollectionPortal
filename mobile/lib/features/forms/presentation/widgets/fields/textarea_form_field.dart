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

