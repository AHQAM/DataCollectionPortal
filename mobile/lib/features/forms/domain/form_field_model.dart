import 'package:freezed_annotation/freezed_annotation.dart';

part 'form_field_model.freezed.dart';
part 'form_field_model.g.dart';

@freezed
class FormFieldModel with _$FormFieldModel {
  const factory FormFieldModel({
    required String id,
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
  }) = _FormFieldModel;

  factory FormFieldModel.fromJson(Map<String, dynamic> json) =>
      _$FormFieldModelFromJson(json);
}
