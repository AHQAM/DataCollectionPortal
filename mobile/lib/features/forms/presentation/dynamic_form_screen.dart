import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import '../domain/form_field_model.dart';

class DynamicFormScreen extends ConsumerStatefulWidget {
  final String requestId;
  final String activityId;
  final List<FormFieldModel> fields;

  const DynamicFormScreen({
    super.key,
    required this.requestId,
    required this.activityId,
    required this.fields,
  });

  @override
  ConsumerState<DynamicFormScreen> createState() => _DynamicFormScreenState();
}

class _DynamicFormScreenState extends ConsumerState<DynamicFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, dynamic> _formData = {};

  void _saveForm() {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      
      // TODO: Queue this data using SyncManager
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppLocalizations.of(context)!.save)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    
    // Sort fields by orderIndex
    final sortedFields = List<FormFieldModel>.from(widget.fields)
      ..sort((a, b) => a.orderIndex.compareTo(b.orderIndex));

    return Scaffold(
      appBar: AppBar(
        title: Text('Activity: ${widget.activityId}'),
      ),
      body: Form(
        key: _formKey,
        child: ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: sortedFields.length,
          itemBuilder: (context, index) {
            final field = sortedFields[index];
            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: _buildFieldWidget(field, l10n),
            );
          },
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ElevatedButton(
            onPressed: _saveForm,
            child: Text(l10n.submit),
          ),
        ),
      ),
    );
  }

  Widget _buildFieldWidget(FormFieldModel field, AppLocalizations l10n) {
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    final label = isArabic ? field.labelAr : field.labelEn;

    switch (field.type) {
      case 'text':
      case 'number':
        return TextFormField(
          decoration: InputDecoration(
            labelText: label,
            hintText: label,
          ),
          keyboardType: field.type == 'number' ? TextInputType.number : TextInputType.text,
          readOnly: field.isReadOnly,
          validator: (value) {
            if (field.isRequired && (value == null || value.isEmpty)) {
              return isArabic 
                  ? (field.validationMessageAr ?? l10n.requiredField)
                  : (field.validationMessageEn ?? l10n.requiredField);
            }
            return null;
          },
          onSaved: (value) => _formData[field.id] = value,
        );
      case 'dropdown':
        return DropdownButtonFormField<String>(
          decoration: InputDecoration(
            labelText: label,
          ),
          items: field.options?.map((option) {
            return DropdownMenuItem(value: option, child: Text(option));
          }).toList() ?? [],
          validator: (value) {
            if (field.isRequired && value == null) {
              return isArabic 
                  ? (field.validationMessageAr ?? l10n.requiredField)
                  : (field.validationMessageEn ?? l10n.requiredField);
            }
            return null;
          },
          onChanged: field.isReadOnly ? null : (value) {},
          onSaved: (value) => _formData[field.id] = value,
        );
      default:
        // Placeholder for complex types (photo, signature, location)
        return Card(
          color: Theme.of(context).colorScheme.surfaceVariant,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Text('[$label] - Field Type: ${field.type} (To Be Implemented)'),
          ),
        );
    }
  }
}
