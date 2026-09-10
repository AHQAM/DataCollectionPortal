// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_UserModel _$UserModelFromJson(Map<String, dynamic> json) => _UserModel(
  uid: json['uid'] as String,
  regionNo: json['regionNo'] as String,
  allowedRegionNos: (json['allowedRegionNos'] as List<dynamic>)
      .map((e) => e as String)
      .toList(),
  branchId: json['branchId'] as String?,
  role: json['role'] as String,
  mustChangePassword: json['mustChangePassword'] as bool? ?? false,
  lastLoginAt: DateTime.parse(json['lastLoginAt'] as String),
  sessionVersion: json['sessionVersion'] as String,
  isActive: json['isActive'] as bool? ?? true,
);

Map<String, dynamic> _$UserModelToJson(_UserModel instance) =>
    <String, dynamic>{
      'uid': instance.uid,
      'regionNo': instance.regionNo,
      'allowedRegionNos': instance.allowedRegionNos,
      'branchId': instance.branchId,
      'role': instance.role,
      'mustChangePassword': instance.mustChangePassword,
      'lastLoginAt': instance.lastLoginAt.toIso8601String(),
      'sessionVersion': instance.sessionVersion,
      'isActive': instance.isActive,
    };
