// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'form_field_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_FormFieldModel _$FormFieldModelFromJson(Map<String, dynamic> json) =>
    _FormFieldModel(
      id: json['id'] as String,
      type: json['type'] as String,
      labelAr: json['labelAr'] as String,
      labelEn: json['labelEn'] as String,
      isRequired: json['isRequired'] as bool? ?? true,
      options: (json['options'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      validationRegex: json['validationRegex'] as String?,
      validationMessageAr: json['validationMessageAr'] as String?,
      validationMessageEn: json['validationMessageEn'] as String?,
      isReadOnly: json['isReadOnly'] as bool? ?? false,
      minLength: (json['minLength'] as num?)?.toInt(),
      maxLength: (json['maxLength'] as num?)?.toInt(),
      minValue: (json['minValue'] as num?)?.toDouble(),
      maxValue: (json['maxValue'] as num?)?.toDouble(),
      orderIndex: (json['orderIndex'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$FormFieldModelToJson(_FormFieldModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'labelAr': instance.labelAr,
      'labelEn': instance.labelEn,
      'isRequired': instance.isRequired,
      'options': instance.options,
      'validationRegex': instance.validationRegex,
      'validationMessageAr': instance.validationMessageAr,
      'validationMessageEn': instance.validationMessageEn,
      'isReadOnly': instance.isReadOnly,
      'minLength': instance.minLength,
      'maxLength': instance.maxLength,
      'minValue': instance.minValue,
      'maxValue': instance.maxValue,
      'orderIndex': instance.orderIndex,
    };
