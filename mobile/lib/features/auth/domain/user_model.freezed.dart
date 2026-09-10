// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$UserModel {

 String get uid; String get regionNo; List<String> get allowedRegionNos; String? get branchId; String get role; bool get mustChangePassword; DateTime get lastLoginAt; String get sessionVersion; bool get isActive;
/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$UserModelCopyWith<UserModel> get copyWith => _$UserModelCopyWithImpl<UserModel>(this as UserModel, _$identity);

  /// Serializes this UserModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as UserModel;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is UserModel&&(identical(other.uid, _this.uid) || other.uid == _this.uid)&&(identical(other.regionNo, _this.regionNo) || other.regionNo == _this.regionNo)&&const DeepCollectionEquality().equals(other.allowedRegionNos, _this.allowedRegionNos)&&(identical(other.branchId, _this.branchId) || other.branchId == _this.branchId)&&(identical(other.role, _this.role) || other.role == _this.role)&&(identical(other.mustChangePassword, _this.mustChangePassword) || other.mustChangePassword == _this.mustChangePassword)&&(identical(other.lastLoginAt, _this.lastLoginAt) || other.lastLoginAt == _this.lastLoginAt)&&(identical(other.sessionVersion, _this.sessionVersion) || other.sessionVersion == _this.sessionVersion)&&(identical(other.isActive, _this.isActive) || other.isActive == _this.isActive));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as UserModel;
  return Object.hash(runtimeType,_this.uid,_this.regionNo,const DeepCollectionEquality().hash(_this.allowedRegionNos),_this.branchId,_this.role,_this.mustChangePassword,_this.lastLoginAt,_this.sessionVersion,_this.isActive);
}

@override
String toString() {
  final _this = this as UserModel;
  return 'UserModel(uid: ${_this.uid}, regionNo: ${_this.regionNo}, allowedRegionNos: ${_this.allowedRegionNos}, branchId: ${_this.branchId}, role: ${_this.role}, mustChangePassword: ${_this.mustChangePassword}, lastLoginAt: ${_this.lastLoginAt}, sessionVersion: ${_this.sessionVersion}, isActive: ${_this.isActive})';
}


}

/// @nodoc
abstract mixin class $UserModelCopyWith<$Res>  {
  factory $UserModelCopyWith(UserModel value, $Res Function(UserModel) _then) = _$UserModelCopyWithImpl;
@useResult
$Res call({
 String uid, String regionNo, List<String> allowedRegionNos, String? branchId, String role, bool mustChangePassword, DateTime lastLoginAt, String sessionVersion, bool isActive
});




}
/// @nodoc
class _$UserModelCopyWithImpl<$Res>
    implements $UserModelCopyWith<$Res> {
  _$UserModelCopyWithImpl(this._self, this._then);

  final UserModel _self;
  final $Res Function(UserModel) _then;

/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? uid = null,Object? regionNo = null,Object? allowedRegionNos = null,Object? branchId = freezed,Object? role = null,Object? mustChangePassword = null,Object? lastLoginAt = null,Object? sessionVersion = null,Object? isActive = null,}) {
  return _then(UserModel(
uid: null == uid ? _self.uid : uid // ignore: cast_nullable_to_non_nullable
as String,regionNo: null == regionNo ? _self.regionNo : regionNo // ignore: cast_nullable_to_non_nullable
as String,allowedRegionNos: null == allowedRegionNos ? _self.allowedRegionNos : allowedRegionNos // ignore: cast_nullable_to_non_nullable
as List<String>,branchId: freezed == branchId ? _self.branchId : branchId // ignore: cast_nullable_to_non_nullable
as String?,role: null == role ? _self.role : role // ignore: cast_nullable_to_non_nullable
as String,mustChangePassword: null == mustChangePassword ? _self.mustChangePassword : mustChangePassword // ignore: cast_nullable_to_non_nullable
as bool,lastLoginAt: null == lastLoginAt ? _self.lastLoginAt : lastLoginAt // ignore: cast_nullable_to_non_nullable
as DateTime,sessionVersion: null == sessionVersion ? _self.sessionVersion : sessionVersion // ignore: cast_nullable_to_non_nullable
as String,isActive: null == isActive ? _self.isActive : isActive // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [UserModel].
extension UserModelPatterns on UserModel {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _UserModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _UserModel() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _UserModel value)  $default,){
final _that = this;
switch (_that) {
case _UserModel():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _UserModel value)?  $default,){
final _that = this;
switch (_that) {
case _UserModel() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String uid,  String regionNo,  List<String> allowedRegionNos,  String? branchId,  String role,  bool mustChangePassword,  DateTime lastLoginAt,  String sessionVersion,  bool isActive)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _UserModel() when $default != null:
return $default(_that.uid,_that.regionNo,_that.allowedRegionNos,_that.branchId,_that.role,_that.mustChangePassword,_that.lastLoginAt,_that.sessionVersion,_that.isActive);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String uid,  String regionNo,  List<String> allowedRegionNos,  String? branchId,  String role,  bool mustChangePassword,  DateTime lastLoginAt,  String sessionVersion,  bool isActive)  $default,) {final _that = this;
switch (_that) {
case _UserModel():
return $default(_that.uid,_that.regionNo,_that.allowedRegionNos,_that.branchId,_that.role,_that.mustChangePassword,_that.lastLoginAt,_that.sessionVersion,_that.isActive);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String uid,  String regionNo,  List<String> allowedRegionNos,  String? branchId,  String role,  bool mustChangePassword,  DateTime lastLoginAt,  String sessionVersion,  bool isActive)?  $default,) {final _that = this;
switch (_that) {
case _UserModel() when $default != null:
return $default(_that.uid,_that.regionNo,_that.allowedRegionNos,_that.branchId,_that.role,_that.mustChangePassword,_that.lastLoginAt,_that.sessionVersion,_that.isActive);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _UserModel implements UserModel {
  const _UserModel({required this.uid, required this.regionNo, required  List<String> allowedRegionNos, this.branchId, required this.role, this.mustChangePassword = false, required this.lastLoginAt, required this.sessionVersion, this.isActive = true}): _allowedRegionNos = allowedRegionNos;
  factory _UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);

@override final  String uid;
@override final  String regionNo;
 final  List<String> _allowedRegionNos;
@override List<String> get allowedRegionNos {
  if (_allowedRegionNos is EqualUnmodifiableListView) return _allowedRegionNos;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_allowedRegionNos);
}

@override final  String? branchId;
@override final  String role;
@override@JsonKey() final  bool mustChangePassword;
@override final  DateTime lastLoginAt;
@override final  String sessionVersion;
@override@JsonKey() final  bool isActive;

/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$UserModelCopyWith<_UserModel> get copyWith => __$UserModelCopyWithImpl<_UserModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$UserModelToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _UserModel&&(identical(other.uid, uid) || other.uid == uid)&&(identical(other.regionNo, regionNo) || other.regionNo == regionNo)&&const DeepCollectionEquality().equals(other.allowedRegionNos, _allowedRegionNos)&&(identical(other.branchId, branchId) || other.branchId == branchId)&&(identical(other.role, role) || other.role == role)&&(identical(other.mustChangePassword, mustChangePassword) || other.mustChangePassword == mustChangePassword)&&(identical(other.lastLoginAt, lastLoginAt) || other.lastLoginAt == lastLoginAt)&&(identical(other.sessionVersion, sessionVersion) || other.sessionVersion == sessionVersion)&&(identical(other.isActive, isActive) || other.isActive == isActive));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,uid,regionNo,const DeepCollectionEquality().hash(_allowedRegionNos),branchId,role,mustChangePassword,lastLoginAt,sessionVersion,isActive);
}

@override
String toString() {
    return 'UserModel(uid: $uid, regionNo: $regionNo, allowedRegionNos: $allowedRegionNos, branchId: $branchId, role: $role, mustChangePassword: $mustChangePassword, lastLoginAt: $lastLoginAt, sessionVersion: $sessionVersion, isActive: $isActive)';
}


}

/// @nodoc
abstract mixin class _$UserModelCopyWith<$Res> implements $UserModelCopyWith<$Res> {
  factory _$UserModelCopyWith(_UserModel value, $Res Function(_UserModel) _then) = __$UserModelCopyWithImpl;
@override @useResult
$Res call({
 String uid, String regionNo, List<String> allowedRegionNos, String? branchId, String role, bool mustChangePassword, DateTime lastLoginAt, String sessionVersion, bool isActive
});




}
/// @nodoc
class __$UserModelCopyWithImpl<$Res>
    implements _$UserModelCopyWith<$Res> {
  __$UserModelCopyWithImpl(this._self, this._then);

  final _UserModel _self;
  final $Res Function(_UserModel) _then;

/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? uid = null,Object? regionNo = null,Object? allowedRegionNos = null,Object? branchId = freezed,Object? role = null,Object? mustChangePassword = null,Object? lastLoginAt = null,Object? sessionVersion = null,Object? isActive = null,}) {
  return _then(_UserModel(
uid: null == uid ? _self.uid : uid // ignore: cast_nullable_to_non_nullable
as String,regionNo: null == regionNo ? _self.regionNo : regionNo // ignore: cast_nullable_to_non_nullable
as String,allowedRegionNos: null == allowedRegionNos ? _self._allowedRegionNos : allowedRegionNos // ignore: cast_nullable_to_non_nullable
as List<String>,branchId: freezed == branchId ? _self.branchId : branchId // ignore: cast_nullable_to_non_nullable
as String?,role: null == role ? _self.role : role // ignore: cast_nullable_to_non_nullable
as String,mustChangePassword: null == mustChangePassword ? _self.mustChangePassword : mustChangePassword // ignore: cast_nullable_to_non_nullable
as bool,lastLoginAt: null == lastLoginAt ? _self.lastLoginAt : lastLoginAt // ignore: cast_nullable_to_non_nullable
as DateTime,sessionVersion: null == sessionVersion ? _self.sessionVersion : sessionVersion // ignore: cast_nullable_to_non_nullable
as String,isActive: null == isActive ? _self.isActive : isActive // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

// dart format on
