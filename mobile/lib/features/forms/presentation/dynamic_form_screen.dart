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

    final targetFieldKey =
        rule['targetFieldKey']?.toString() ?? rule['targetFieldId']?.toString();
    if (targetFieldKey == null || targetFieldKey.isEmpty) return true;

    // Try finding the value in _formData using various possible keys
    var targetVal = _formData[targetFieldKey];
    if (targetVal == null) {
      final possibleKeys = _formData.keys.where(
        (k) => k.contains(targetFieldKey) || targetFieldKey.contains(k),
      );
      if (possibleKeys.isNotEmpty) {
        targetVal = _formData[possibleKeys.first];
      }
    }

    final operator = rule['operator']?.toString() ?? 'equals';
    final ruleVal = rule['value']?.toString() ?? '';

    return _isConditionMet(targetVal, operator, ruleVal);
  }

  bool _isConditionMet(dynamic targetVal, String operator, String ruleVal) {
    final tStr = targetVal?.toString().toLowerCase().trim() ?? '';
    final rStr = ruleVal.toLowerCase().trim();

    switch (operator) {
      case 'equals':
      case '==':
        if (tStr.isEmpty && rStr.isNotEmpty) return false;
        if (tStr == rStr) return true;

        // Handle dropdown value vs label mismatch
        if (tStr.isNotEmpty &&
            rStr.isNotEmpty &&
            (tStr.contains(rStr) || rStr.contains(tStr)))
          return true;

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
      case '!=':
        if (tStr.isEmpty && rStr.isNotEmpty) return true;
        return !_isConditionMet(targetVal, 'equals', ruleVal);
      case 'contains':
        if (tStr.isEmpty) return false;
        return tStr.contains(rStr);
      case 'greater_than':
      case '>':
        if (tStr.isEmpty) return false;
        final tNum = num.tryParse(tStr);
        final rNum = num.tryParse(rStr);
        if (tNum == null || rNum == null) return false;
        return tNum > rNum;
      case 'less_than':
      case '<':
        if (tStr.isEmpty) return false;
        final tNum = num.tryParse(tStr);
        final rNum = num.tryParse(rStr);
        if (tNum == null || rNum == null) return false;
        return tNum < rNum;
      case 'is_empty':
        return tStr.isEmpty;
      case 'is_not_empty':
        return tStr.isNotEmpty;
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
        return TextInputField(
          field: field,
          isArabic: isArabic,
          currentValue: currentValue?.toString(),
          onChanged: (val) => _setFieldValue(field, val),
          onSaved: (val) => _setFieldValue(field, val),
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
        return NumberInputField(
          field: field,
          isArabic: isArabic,
          currentValue: currentValue?.toString(),
          onChanged: (val) {
            if (val.trim().isNotEmpty) {
              _setFieldValue(field, num.tryParse(val) ?? val);
            } else {
              _setFieldValue(field, null);
            }
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
        return DropdownField(
          field: field,
          isArabic: isArabic,
          currentValue: currentValue?.toString(),
          onChanged: (value) => _setFieldValue(field, value),
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
