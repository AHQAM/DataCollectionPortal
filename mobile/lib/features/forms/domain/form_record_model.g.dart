// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'form_record_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_FormRecordModel _$FormRecordModelFromJson(Map<String, dynamic> json) =>
    _FormRecordModel(
      id: json['id'] as String,
      requestId: json['requestId'] as String,
      activityId: json['activityId'] as String,
      branchId: json['branchId'] as String,
      regionNo: json['regionNo'] as String,
      submittedBy: json['submittedBy'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      data: json['data'] as Map<String, dynamic>,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$FormRecordModelToJson(_FormRecordModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'requestId': instance.requestId,
      'activityId': instance.activityId,
      'branchId': instance.branchId,
      'regionNo': instance.regionNo,
      'submittedBy': instance.submittedBy,
      'createdAt': instance.createdAt.toIso8601String(),
      'data': instance.data,
      'metadata': instance.metadata,
    };
