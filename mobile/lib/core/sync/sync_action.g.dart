// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'sync_action.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_SyncAction _$SyncActionFromJson(Map<String, dynamic> json) => _SyncAction(
  id: json['id'] as String,
  type: json['type'] as String,
  payload: json['payload'] as String,
  createdAt: DateTime.parse(json['createdAt'] as String),
  retryCount: (json['retryCount'] as num?)?.toInt() ?? 0,
);

Map<String, dynamic> _$SyncActionToJson(_SyncAction instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'payload': instance.payload,
      'createdAt': instance.createdAt.toIso8601String(),
      'retryCount': instance.retryCount,
    };
