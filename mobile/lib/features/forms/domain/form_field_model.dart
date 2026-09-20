import 'package:freezed_annotation/freezed_annotation.dart';

part 'form_field_model.freezed.dart';

@freezed
abstract class FormFieldModel with _$FormFieldModel {
  const FormFieldModel._();

  const factory FormFieldModel({
    required String id,
    String? fieldKey,
    required String
    type, // 'text', 'number', 'dropdown', 'location', 'photo', 'signature', 'barcode'
    required String labelAr,
    required String labelEn,
    @Default(true) bool isRequired,
    List<String>? options, // For dropdowns
    String? validationRegex,
    String? validationMessageAr,
    String? validationMessageEn,
    @Default(false) bool isReadOnly,
    int? minLength,
    int? maxLength,
    double? minValue,
    double? maxValue,
    @Default(0) int orderIndex,
    Map<String, dynamic>? visibilityRule,
  }) = _FormFieldModel;

  String get key => (fieldKey != null && fieldKey!.isNotEmpty) ? fieldKey! : id;

  factory FormFieldModel.fromJson(Map<String, dynamic> json) {
    final rawOptions = json['options'];
    List<String>? options;
    if (rawOptions is List) {
      options = rawOptions
          .map((opt) {
            if (opt is Map) {
              return (opt['labelAr'] ?? opt['value'] ?? opt['labelEn'] ?? '')
                  .toString();
            }
            return opt.toString();
          })
          .where((s) => s.isNotEmpty)
          .toList();
    }

    var type = (json['type'] ?? json['fieldType'] ?? 'text').toString();
    if (type == 'gps') type = 'location';
    if (type == 'select' || type == 'single_choice') type = 'dropdown';
    if (type == 'barcode_scan' || type == 'qr_scan') type = 'barcode';

    Map<String, dynamic>? visibilityRule;
    if (json['visibilityRule'] is Map) {
      visibilityRule = Map<String, dynamic>.from(json['visibilityRule'] as Map);
    }

    final rawKey = json['fieldKey']?.toString();
    final rawId = (json['id'] ?? json['fieldId'] ?? rawKey ?? '').toString();

    return FormFieldModel(
      id: rawId,
      fieldKey: (rawKey != null && rawKey.isNotEmpty) ? rawKey : rawId,
      type: type,
      labelAr: (json['labelAr'] ?? json['fieldLabelAr'] ?? '').toString(),
      labelEn:
          (json['labelEn'] ??
                  json['fieldLabelEn'] ??
                  json['fieldLabelAr'] ??
                  '')
              .toString(),
      isRequired: json['isRequired'] as bool? ?? true,
      options: options,
      validationRegex: json['validationRegex'] as String?,
      validationMessageAr:
          (json['validationMessageAr'] ?? json['helpTextAr']) as String?,
      validationMessageEn:
          (json['validationMessageEn'] ?? json['helpTextEn']) as String?,
      isReadOnly: json['isReadOnly'] as bool? ?? false,
      minLength: (json['minLength'] as num?)?.toInt(),
      maxLength: (json['maxLength'] as num?)?.toInt(),
      minValue: (json['minValue'] as num?)?.toDouble(),
      maxValue: (json['maxValue'] as num?)?.toDouble(),
      orderIndex:
          ((json['orderIndex'] ?? json['sortOrder']) as num?)?.toInt() ?? 0,
      visibilityRule: visibilityRule,
    );
  }
}
