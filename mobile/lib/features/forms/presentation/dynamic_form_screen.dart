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

  void _setFieldValue(FormFieldModel field, dynamic val) {
    setState(() {
      _formData[field.key] = val;
      _formData[field.id] = val;
      if (field.fieldKey != null && field.fieldKey!.isNotEmpty) {
        _formData[field.fieldKey!] = val;
      }
    });
  }

  bool _isFieldVisible(FormFieldModel field) {
    final rule = field.visibilityRule;
    if (rule == null || rule.isEmpty) return true;

    final targetFieldKey = rule['targetFieldKey']?.toString();
    if (targetFieldKey == null || targetFieldKey.isEmpty) return true;

    final targetVal = _formData[targetFieldKey];
    final operator = rule['operator']?.toString() ?? 'equals';
    final ruleVal = rule['value']?.toString() ?? '';

    return _isConditionMet(targetVal, operator, ruleVal);
  }

  bool _isConditionMet(dynamic targetVal, String operator, String ruleVal) {
    final tStr = targetVal?.toString().toLowerCase().trim();
    final rStr = ruleVal.toLowerCase().trim();

    switch (operator) {
      case 'equals':
        if (tStr == rStr) return true;
        // Boolean / Yes-No normalization
        if ((tStr == 'true' || tStr == 'yes' || tStr == 'نعم' || tStr == '1') &&
            (rStr == 'true' || rStr == 'yes' || rStr == 'نعم' || rStr == '1')) {
          return true;
        }
        if ((tStr == 'false' || tStr == 'no' || tStr == 'لا' || tStr == '0') &&
            (rStr == 'false' || rStr == 'no' || rStr == 'لا' || rStr == '0')) {
          return true;
        }
        return false;
      case 'not_equals':
        return !_isConditionMet(targetVal, 'equals', ruleVal);
      case 'contains':
        if (targetVal == null) return false;
        return targetVal.toString().toLowerCase().contains(rStr);
      case 'greater_than':
        if (targetVal == null) return false;
        final tNum = num.tryParse(targetVal.toString());
        final rNum = num.tryParse(ruleVal);
        if (tNum == null || rNum == null) return false;
        return tNum > rNum;
      case 'less_than':
        if (targetVal == null) return false;
        final tNum = num.tryParse(targetVal.toString());
        final rNum = num.tryParse(ruleVal);
        if (tNum == null || rNum == null) return false;
        return tNum < rNum;
      case 'is_empty':
        if (targetVal == null) return true;
        return targetVal.toString().trim().isEmpty;
      case 'is_not_empty':
        if (targetVal == null) return false;
        return targetVal.toString().trim().isNotEmpty;
      default:
        return true;
    }
  }

  Future<void> _saveForm(List<FormFieldModel> fields) async {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();

      // Filter out hidden fields so they don't submit invalid or stale data
      final cleanData = Map<String, dynamic>.from(_formData);
      for (final field in fields) {
        if (!_isFieldVisible(field)) {
          cleanData.remove(field.key);
          cleanData.remove(field.id);
          if (field.fieldKey != null && field.fieldKey!.isNotEmpty) {
            cleanData.remove(field.fieldKey!);
          }
        }
      }

      await ref
          .read(formSubmitControllerProvider.notifier)
          .save(
            requestId: widget.requestId,
            recordId: widget.recordId,
            activityId: widget.activityId,
            formData: cleanData,
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

          // Filter by conditional visibility
          final visibleFields = sortedFields.where(_isFieldVisible).toList();

          return Form(
            key: _formKey,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: visibleFields.length,
              itemBuilder: (context, index) {
                final field = visibleFields[index];
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
    final currentValue = _formData[field.key] ?? _formData[field.id];

    switch (field.type) {
      case 'text':
        return TextFormField(
          initialValue: currentValue?.toString(),
          decoration: InputDecoration(
            labelText: label,
            hintText: label,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
          keyboardType: TextInputType.text,
          readOnly: field.isReadOnly,
          onChanged: (val) => _setFieldValue(field, val),
          validator: (value) {
            if (field.isRequired && (value == null || value.trim().isEmpty)) {
              return isArabic
                  ? (field.validationMessageAr ?? l10n.requiredField)
                  : (field.validationMessageEn ?? l10n.requiredField);
            }
            return null;
          },
          onSaved: (value) => _setFieldValue(field, value),
        );

      case 'textarea':
        return TextareaFormField(
          field: field,
          isArabic: isArabic,
          onChanged: (val) => _setFieldValue(field, val),
          onSaved: (val) => _setFieldValue(field, val),
        );

      case 'number':
      case 'integer':
      case 'decimal':
      case 'currency':
      case 'percentage':
        return TextFormField(
          initialValue: currentValue?.toString(),
          decoration: InputDecoration(
            labelText: label,
            hintText: label,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          readOnly: field.isReadOnly,
          onChanged: (val) {
            if (val.trim().isNotEmpty) {
              _setFieldValue(field, num.tryParse(val) ?? val);
            } else {
              _setFieldValue(field, null);
            }
          },
          validator: (value) {
            if (field.isRequired && (value == null || value.trim().isEmpty)) {
              return isArabic
                  ? (field.validationMessageAr ?? l10n.requiredField)
                  : (field.validationMessageEn ?? l10n.requiredField);
            }
            if (value != null && value.trim().isNotEmpty) {
              final parsed = num.tryParse(value);
              if (parsed == null) {
                return isArabic
                    ? 'يرجى إدخال قيمة رقمية صحيحة'
                    : 'Please enter a valid number';
              }
            }
            return null;
          },
          onSaved: (value) {
            if (value != null && value.trim().isNotEmpty) {
              _setFieldValue(field, num.tryParse(value) ?? value);
            } else {
              _setFieldValue(field, null);
            }
          },
        );

      case 'dropdown':
      case 'select':
      case 'single_choice':
        return DropdownButtonFormField<String>(
          initialValue: currentValue?.toString(),
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
          onChanged: field.isReadOnly ? null : (value) => _setFieldValue(field, value),
          onSaved: (value) => _setFieldValue(field, value),
        );

      case 'date':
        return DateFormField(
          field: field,
          isArabic: isArabic,
          onChanged: (val) => _setFieldValue(field, val),
          onSaved: (val) => _setFieldValue(field, val),
        );

      case 'yes_no':
      case 'boolean':
        return YesNoFormField(
          field: field,
          isArabic: isArabic,
          onChanged: (val) => _setFieldValue(field, val),
          onSaved: (val) => _setFieldValue(field, val),
        );

      case 'rating':
        return RatingFormField(
          field: field,
          isArabic: isArabic,
          onChanged: (val) => _setFieldValue(field, val),
          onSaved: (val) => _setFieldValue(field, val),
        );

      case 'location':
      case 'gps':
        return LocationFormField(
          field: field,
          isArabic: isArabic,
          onChanged: (val) => _setFieldValue(field, val),
        );

      case 'photo':
      case 'image':
        return PhotoFormField(
          field: field,
          isArabic: isArabic,
          requestId: widget.requestId,
          recordId: widget.recordId,
          onChanged: (val) => _setFieldValue(field, val),
        );

      case 'signature':
        return SignatureFormField(
          field: field,
          isArabic: isArabic,
          requestId: widget.requestId,
          recordId: widget.recordId,
          onChanged: (val) => _setFieldValue(field, val),
        );

      case 'barcode':
      case 'qr_code':
        return BarcodeFormField(
          field: field,
          isArabic: isArabic,
          onChanged: (val) => _setFieldValue(field, val),
          onSaved: (val) => _setFieldValue(field, val),
        );

      default:
        return _UnimplementedField(label: label, icon: Icons.help_outline);
    }
  }

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
