// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'request_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_RequestModel _$RequestModelFromJson(Map<String, dynamic> json) =>
    _RequestModel(
      id: json['id'] as String,
      activityId: json['activityId'] as String,
      branchId: json['branchId'] as String,
      regionNo: json['regionNo'] as String,
      status: json['status'] as String,
      assignedAt: DateTime.parse(json['assignedAt'] as String),
      dueDate: json['dueDate'] == null
          ? null
          : DateTime.parse(json['dueDate'] as String),
      completedAt: json['completedAt'] == null
          ? null
          : DateTime.parse(json['completedAt'] as String),
      assignedTo: json['assignedTo'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>? ?? const {},
    );

Map<String, dynamic> _$RequestModelToJson(_RequestModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'activityId': instance.activityId,
      'branchId': instance.branchId,
      'regionNo': instance.regionNo,
      'status': instance.status,
      'assignedAt': instance.assignedAt.toIso8601String(),
      'dueDate': instance.dueDate?.toIso8601String(),
      'completedAt': instance.completedAt?.toIso8601String(),
      'assignedTo': instance.assignedTo,
      'metadata': instance.metadata,
    };
