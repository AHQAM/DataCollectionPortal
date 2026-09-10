// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_NotificationModel _$NotificationModelFromJson(Map<String, dynamic> json) =>
    _NotificationModel(
      notificationId: json['notificationId'] as String,
      userId: json['userId'] as String,
      titleAr: json['titleAr'] as String,
      titleEn: json['titleEn'] as String,
      bodyAr: json['bodyAr'] as String,
      bodyEn: json['bodyEn'] as String,
      data: json['data'] as Map<String, dynamic>?,
      status: json['status'] as String,
      sentAt: DateTime.parse(json['sentAt'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$NotificationModelToJson(_NotificationModel instance) =>
    <String, dynamic>{
      'notificationId': instance.notificationId,
      'userId': instance.userId,
      'titleAr': instance.titleAr,
      'titleEn': instance.titleEn,
      'bodyAr': instance.bodyAr,
      'bodyEn': instance.bodyEn,
      'data': instance.data,
      'status': instance.status,
      'sentAt': instance.sentAt.toIso8601String(),
      'createdAt': instance.createdAt.toIso8601String(),
    };
