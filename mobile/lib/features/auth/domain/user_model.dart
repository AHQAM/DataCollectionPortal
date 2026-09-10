import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required String uid,
    required String regionNo,
    required List<String> allowedRegionNos,
    String? branchId,
    required String role,
    @Default(false) bool mustChangePassword,
    required DateTime lastLoginAt,
    required String sessionVersion,
    @Default(true) bool isActive,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}
