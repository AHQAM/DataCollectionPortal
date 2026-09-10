// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'notification_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$NotificationModel {

 String get notificationId; String get userId; String get titleAr; String get titleEn; String get bodyAr; String get bodyEn; Map<String, dynamic>? get data; String get status; DateTime get sentAt; DateTime get createdAt;
/// Create a copy of NotificationModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$NotificationModelCopyWith<NotificationModel> get copyWith => _$NotificationModelCopyWithImpl<NotificationModel>(this as NotificationModel, _$identity);

  /// Serializes this NotificationModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as NotificationModel;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is NotificationModel&&(identical(other.notificationId, _this.notificationId) || other.notificationId == _this.notificationId)&&(identical(other.userId, _this.userId) || other.userId == _this.userId)&&(identical(other.titleAr, _this.titleAr) || other.titleAr == _this.titleAr)&&(identical(other.titleEn, _this.titleEn) || other.titleEn == _this.titleEn)&&(identical(other.bodyAr, _this.bodyAr) || other.bodyAr == _this.bodyAr)&&(identical(other.bodyEn, _this.bodyEn) || other.bodyEn == _this.bodyEn)&&const DeepCollectionEquality().equals(other.data, _this.data)&&(identical(other.status, _this.status) || other.status == _this.status)&&(identical(other.sentAt, _this.sentAt) || other.sentAt == _this.sentAt)&&(identical(other.createdAt, _this.createdAt) || other.createdAt == _this.createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as NotificationModel;
  return Object.hash(runtimeType,_this.notificationId,_this.userId,_this.titleAr,_this.titleEn,_this.bodyAr,_this.bodyEn,const DeepCollectionEquality().hash(_this.data),_this.status,_this.sentAt,_this.createdAt);
}

@override
String toString() {
  final _this = this as NotificationModel;
  return 'NotificationModel(notificationId: ${_this.notificationId}, userId: ${_this.userId}, titleAr: ${_this.titleAr}, titleEn: ${_this.titleEn}, bodyAr: ${_this.bodyAr}, bodyEn: ${_this.bodyEn}, data: ${_this.data}, status: ${_this.status}, sentAt: ${_this.sentAt}, createdAt: ${_this.createdAt})';
}


}

/// @nodoc
abstract mixin class $NotificationModelCopyWith<$Res>  {
  factory $NotificationModelCopyWith(NotificationModel value, $Res Function(NotificationModel) _then) = _$NotificationModelCopyWithImpl;
@useResult
$Res call({
 String notificationId, String userId, String titleAr, String titleEn, String bodyAr, String bodyEn, Map<String, dynamic>? data, String status, DateTime sentAt, DateTime createdAt
});




}
/// @nodoc
class _$NotificationModelCopyWithImpl<$Res>
    implements $NotificationModelCopyWith<$Res> {
  _$NotificationModelCopyWithImpl(this._self, this._then);

  final NotificationModel _self;
  final $Res Function(NotificationModel) _then;

/// Create a copy of NotificationModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? notificationId = null,Object? userId = null,Object? titleAr = null,Object? titleEn = null,Object? bodyAr = null,Object? bodyEn = null,Object? data = freezed,Object? status = null,Object? sentAt = null,Object? createdAt = null,}) {
  return _then(NotificationModel(
notificationId: null == notificationId ? _self.notificationId : notificationId // ignore: cast_nullable_to_non_nullable
as String,userId: null == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String,titleAr: null == titleAr ? _self.titleAr : titleAr // ignore: cast_nullable_to_non_nullable
as String,titleEn: null == titleEn ? _self.titleEn : titleEn // ignore: cast_nullable_to_non_nullable
as String,bodyAr: null == bodyAr ? _self.bodyAr : bodyAr // ignore: cast_nullable_to_non_nullable
as String,bodyEn: null == bodyEn ? _self.bodyEn : bodyEn // ignore: cast_nullable_to_non_nullable
as String,data: freezed == data ? _self.data : data // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,sentAt: null == sentAt ? _self.sentAt : sentAt // ignore: cast_nullable_to_non_nullable
as DateTime,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}

}


/// Adds pattern-matching-related methods to [NotificationModel].
extension NotificationModelPatterns on NotificationModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _NotificationModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _NotificationModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _NotificationModel value)  $default,){
final _that = this;
switch (_that) {
case _NotificationModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _NotificationModel value)?  $default,){
final _that = this;
switch (_that) {
case _NotificationModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String notificationId,  String userId,  String titleAr,  String titleEn,  String bodyAr,  String bodyEn,  Map<String, dynamic>? data,  String status,  DateTime sentAt,  DateTime createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _NotificationModel() when $default != null:
return $default(_that.notificationId,_that.userId,_that.titleAr,_that.titleEn,_that.bodyAr,_that.bodyEn,_that.data,_that.status,_that.sentAt,_that.createdAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String notificationId,  String userId,  String titleAr,  String titleEn,  String bodyAr,  String bodyEn,  Map<String, dynamic>? data,  String status,  DateTime sentAt,  DateTime createdAt)  $default,) {final _that = this;
switch (_that) {
case _NotificationModel():
return $default(_that.notificationId,_that.userId,_that.titleAr,_that.titleEn,_that.bodyAr,_that.bodyEn,_that.data,_that.status,_that.sentAt,_that.createdAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String notificationId,  String userId,  String titleAr,  String titleEn,  String bodyAr,  String bodyEn,  Map<String, dynamic>? data,  String status,  DateTime sentAt,  DateTime createdAt)?  $default,) {final _that = this;
switch (_that) {
case _NotificationModel() when $default != null:
return $default(_that.notificationId,_that.userId,_that.titleAr,_that.titleEn,_that.bodyAr,_that.bodyEn,_that.data,_that.status,_that.sentAt,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _NotificationModel implements NotificationModel {
  const _NotificationModel({required this.notificationId, required this.userId, required this.titleAr, required this.titleEn, required this.bodyAr, required this.bodyEn,  Map<String, dynamic>? data, required this.status, required this.sentAt, required this.createdAt}): _data = data;
  factory _NotificationModel.fromJson(Map<String, dynamic> json) => _$NotificationModelFromJson(json);

@override final  String notificationId;
@override final  String userId;
@override final  String titleAr;
@override final  String titleEn;
@override final  String bodyAr;
@override final  String bodyEn;
 final  Map<String, dynamic>? _data;
@override Map<String, dynamic>? get data {
  final value = _data;
  if (value == null) return null;
  if (_data is EqualUnmodifiableMapView) return _data;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableMapView(value);
}

@override final  String status;
@override final  DateTime sentAt;
@override final  DateTime createdAt;

/// Create a copy of NotificationModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$NotificationModelCopyWith<_NotificationModel> get copyWith => __$NotificationModelCopyWithImpl<_NotificationModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$NotificationModelToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _NotificationModel&&(identical(other.notificationId, notificationId) || other.notificationId == notificationId)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.titleAr, titleAr) || other.titleAr == titleAr)&&(identical(other.titleEn, titleEn) || other.titleEn == titleEn)&&(identical(other.bodyAr, bodyAr) || other.bodyAr == bodyAr)&&(identical(other.bodyEn, bodyEn) || other.bodyEn == bodyEn)&&const DeepCollectionEquality().equals(other.data, _data)&&(identical(other.status, status) || other.status == status)&&(identical(other.sentAt, sentAt) || other.sentAt == sentAt)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,notificationId,userId,titleAr,titleEn,bodyAr,bodyEn,const DeepCollectionEquality().hash(_data),status,sentAt,createdAt);
}

@override
String toString() {
    return 'NotificationModel(notificationId: $notificationId, userId: $userId, titleAr: $titleAr, titleEn: $titleEn, bodyAr: $bodyAr, bodyEn: $bodyEn, data: $data, status: $status, sentAt: $sentAt, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$NotificationModelCopyWith<$Res> implements $NotificationModelCopyWith<$Res> {
  factory _$NotificationModelCopyWith(_NotificationModel value, $Res Function(_NotificationModel) _then) = __$NotificationModelCopyWithImpl;
@override @useResult
$Res call({
 String notificationId, String userId, String titleAr, String titleEn, String bodyAr, String bodyEn, Map<String, dynamic>? data, String status, DateTime sentAt, DateTime createdAt
});




}
/// @nodoc
class __$NotificationModelCopyWithImpl<$Res>
    implements _$NotificationModelCopyWith<$Res> {
  __$NotificationModelCopyWithImpl(this._self, this._then);

  final _NotificationModel _self;
  final $Res Function(_NotificationModel) _then;

/// Create a copy of NotificationModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? notificationId = null,Object? userId = null,Object? titleAr = null,Object? titleEn = null,Object? bodyAr = null,Object? bodyEn = null,Object? data = freezed,Object? status = null,Object? sentAt = null,Object? createdAt = null,}) {
  return _then(_NotificationModel(
notificationId: null == notificationId ? _self.notificationId : notificationId // ignore: cast_nullable_to_non_nullable
as String,userId: null == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String,titleAr: null == titleAr ? _self.titleAr : titleAr // ignore: cast_nullable_to_non_nullable
as String,titleEn: null == titleEn ? _self.titleEn : titleEn // ignore: cast_nullable_to_non_nullable
as String,bodyAr: null == bodyAr ? _self.bodyAr : bodyAr // ignore: cast_nullable_to_non_nullable
as String,bodyEn: null == bodyEn ? _self.bodyEn : bodyEn // ignore: cast_nullable_to_non_nullable
as String,data: freezed == data ? _self._data : data // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,sentAt: null == sentAt ? _self.sentAt : sentAt // ignore: cast_nullable_to_non_nullable
as DateTime,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}


}

// dart format on
