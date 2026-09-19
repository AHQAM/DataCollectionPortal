import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/l10n/app_localizations.dart';

import 'form_fields_controller.dart';
import '../domain/form_field_model.dart';
import 'widgets/custom_form_fields.dart';

class DynamicFormScreen extends ConsumerStatefulWidget {
  final String requestId;
  final String recordId;
  final String activityId;
  final String? title;

  const DynamicFormScreen({
    super.key,
    required this.requestId,
    required this.recordId,
    required this.activityId,
    this.title,
  });

  @override
  ConsumerState<DynamicFormScreen> createState() => _DynamicFormScreenState();
}

class _DynamicFormScreenState extends ConsumerState<DynamicFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, dynamic> _formData = {};

  Future<void> _saveForm(List<FormFieldModel> fields) async {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();

      await ref
          .read(formSubmitControllerProvider.notifier)
          .save(
            requestId: widget.requestId,
            recordId: widget.recordId,
            activityId: widget.activityId,
            formData: _formData,
          );

      final submitState = ref.read(formSubmitControllerProvider);
      if (!mounted) return;

      if (submitState.hasError) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(submitState.error.toString()),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم حفظ البيانات بنجاح ✓')),
        );
        Navigator.of(context).pop();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    final fieldsAsync = ref.watch(formFieldsProvider(widget.activityId));
    final submitState = ref.watch(formSubmitControllerProvider);

    final displayTitle = widget.title?.isNotEmpty == true
        ? widget.title!
        : (isArabic ? 'تفاصيل النشاط' : 'Activity Details');

    return Scaffold(
      appBar: AppBar(title: Text(displayTitle)),
      body: fieldsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Colors.red),
                const SizedBox(height: 16),
                Text(
                  'تعذّر تحميل حقول النموذج\n$error',
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
        data: (fields) {
          if (fields.isEmpty) {
            return const Center(child: Text('لا توجد حقول لهذا النشاط'));
          }

          // Sort fields by orderIndex
          final sortedFields = List<FormFieldModel>.from(fields)
            ..sort((a, b) => a.orderIndex.compareTo(b.orderIndex));

          return Form(
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
          );
        },
      ),
      bottomNavigationBar: fieldsAsync.hasValue
          ? SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: ElevatedButton(
                  onPressed: submitState.isLoading
                      ? null
                      : () => _saveForm(fieldsAsync.value!),
                  child: submitState.isLoading
                      ? const SizedBox(
                          height: 24,
                          width: 24,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : Text(l10n.submit),
                ),
              ),
            )
          : null,
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
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
          keyboardType: field.type == 'number'
              ? TextInputType.number
              : TextInputType.text,
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
          onChanged: field.isReadOnly ? null : (value) {},
          onSaved: (value) => _formData[field.id] = value,
        );

      case 'location':
        return LocationFormField(
          field: field,
          isArabic: isArabic,
          onChanged: (val) => _formData[field.id] = val,
        );

      case 'photo':
        return PhotoFormField(
          field: field,
          isArabic: isArabic,
          requestId: widget.requestId,
          recordId: widget.recordId,
          onChanged: (val) => _formData[field.id] = val,
        );

      case 'signature':
        return SignatureFormField(
          field: field,
          isArabic: isArabic,
          requestId: widget.requestId,
          recordId: widget.recordId,
          onChanged: (val) => _formData[field.id] = val,
        );

      case 'barcode':
        return BarcodeFormField(
          field: field,
          isArabic: isArabic,
          onChanged: (val) => _formData[field.id] = val,
          onSaved: (val) => _formData[field.id] = val,
        );

      default:
        return _UnimplementedField(label: label, icon: Icons.help_outline);
    }
  }
}

class _UnimplementedField extends StatelessWidget {
  final String label;
  final IconData icon;

  const _UnimplementedField({required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Theme.of(context).colorScheme.surfaceContainerHighest,
      child: ListTile(
        leading: Icon(icon),
        title: Text(label),
        subtitle: const Text('قريباً — هذا النوع غير متاح بعد'),
      ),
    );
  }
}
