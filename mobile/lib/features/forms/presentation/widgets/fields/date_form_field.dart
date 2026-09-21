import 'package:flutter/material.dart';

import 'package:mobile/features/forms/domain/form_field_model.dart';

/// Date picker form field
class DateFormField extends StatefulWidget {
  final FormFieldModel field;
  final bool isArabic;
  final ValueChanged<String> onChanged;
  final FormFieldSetter<String> onSaved;

  const DateFormField({
    super.key,
    required this.field,
    required this.isArabic,
    required this.onChanged,
    required this.onSaved,
  });

  @override
  State<DateFormField> createState() => _DateFormFieldState();
}

class _DateFormFieldState extends State<DateFormField> {
  DateTime? _selectedDate;
  final _controller = TextEditingController();

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );

    if (picked != null) {
      setState(() {
        _selectedDate = picked;
        _controller.text = picked.toIso8601String().split('T')[0];
      });
      widget.onChanged(_controller.text);
    }
  }

  @override
  Widget build(BuildContext context) {
    final label = widget.isArabic ? widget.field.labelAr : widget.field.labelEn;

    return TextFormField(
      controller: _controller,
      readOnly: true,
      onTap: widget.field.isReadOnly ? null : _pickDate,
      decoration: InputDecoration(
        labelText: label,
        hintText: widget.isArabic ? 'اختر التاريخ' : 'Select Date',
        prefixIcon: const Icon(Icons.calendar_today),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      validator: (value) {
        if (widget.field.isRequired && (value == null || value.isEmpty)) {
          return widget.isArabic
              ? (widget.field.validationMessageAr ?? 'يرجى اختيار التاريخ')
              : (widget.field.validationMessageEn ?? 'Date is required');
        }
        return null;
      },
      onSaved: (val) => widget.onSaved(val ?? ''),
    );
  }
}
