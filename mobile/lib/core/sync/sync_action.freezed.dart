// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'sync_action.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$SyncAction {

 String get id; String get type; String get payload; DateTime get createdAt; int get retryCount;
/// Create a copy of SyncAction
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SyncActionCopyWith<SyncAction> get copyWith => _$SyncActionCopyWithImpl<SyncAction>(this as SyncAction, _$identity);

  /// Serializes this SyncAction to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as SyncAction;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SyncAction&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.type, _this.type) || other.type == _this.type)&&(identical(other.payload, _this.payload) || other.payload == _this.payload)&&(identical(other.createdAt, _this.createdAt) || other.createdAt == _this.createdAt)&&(identical(other.retryCount, _this.retryCount) || other.retryCount == _this.retryCount));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as SyncAction;
  return Object.hash(runtimeType,_this.id,_this.type,_this.payload,_this.createdAt,_this.retryCount);
}

@override
String toString() {
  final _this = this as SyncAction;
  return 'SyncAction(id: ${_this.id}, type: ${_this.type}, payload: ${_this.payload}, createdAt: ${_this.createdAt}, retryCount: ${_this.retryCount})';
}


}

/// @nodoc
abstract mixin class $SyncActionCopyWith<$Res>  {
  factory $SyncActionCopyWith(SyncAction value, $Res Function(SyncAction) _then) = _$SyncActionCopyWithImpl;
@useResult
$Res call({
 String id, String type, String payload, DateTime createdAt, int retryCount
});




}
/// @nodoc
class _$SyncActionCopyWithImpl<$Res>
    implements $SyncActionCopyWith<$Res> {
  _$SyncActionCopyWithImpl(this._self, this._then);

  final SyncAction _self;
  final $Res Function(SyncAction) _then;

/// Create a copy of SyncAction
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? type = null,Object? payload = null,Object? createdAt = null,Object? retryCount = null,}) {
  return _then(SyncAction(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,payload: null == payload ? _self.payload : payload // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,retryCount: null == retryCount ? _self.retryCount : retryCount // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [SyncAction].
extension SyncActionPatterns on SyncAction {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _SyncAction value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _SyncAction() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _SyncAction value)  $default,){
final _that = this;
switch (_that) {
case _SyncAction():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _SyncAction value)?  $default,){
final _that = this;
switch (_that) {
case _SyncAction() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String type,  String payload,  DateTime createdAt,  int retryCount)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _SyncAction() when $default != null:
return $default(_that.id,_that.type,_that.payload,_that.createdAt,_that.retryCount);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String type,  String payload,  DateTime createdAt,  int retryCount)  $default,) {final _that = this;
switch (_that) {
case _SyncAction():
return $default(_that.id,_that.type,_that.payload,_that.createdAt,_that.retryCount);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String type,  String payload,  DateTime createdAt,  int retryCount)?  $default,) {final _that = this;
switch (_that) {
case _SyncAction() when $default != null:
return $default(_that.id,_that.type,_that.payload,_that.createdAt,_that.retryCount);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _SyncAction implements SyncAction {
  const _SyncAction({required this.id, required this.type, required this.payload, required this.createdAt, this.retryCount = 0});
  factory _SyncAction.fromJson(Map<String, dynamic> json) => _$SyncActionFromJson(json);

@override final  String id;
@override final  String type;
@override final  String payload;
@override final  DateTime createdAt;
@override@JsonKey() final  int retryCount;

/// Create a copy of SyncAction
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$SyncActionCopyWith<_SyncAction> get copyWith => __$SyncActionCopyWithImpl<_SyncAction>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$SyncActionToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _SyncAction&&(identical(other.id, id) || other.id == id)&&(identical(other.type, type) || other.type == type)&&(identical(other.payload, payload) || other.payload == payload)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.retryCount, retryCount) || other.retryCount == retryCount));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,id,type,payload,createdAt,retryCount);
}

@override
String toString() {
    return 'SyncAction(id: $id, type: $type, payload: $payload, createdAt: $createdAt, retryCount: $retryCount)';
}


}

/// @nodoc
abstract mixin class _$SyncActionCopyWith<$Res> implements $SyncActionCopyWith<$Res> {
  factory _$SyncActionCopyWith(_SyncAction value, $Res Function(_SyncAction) _then) = __$SyncActionCopyWithImpl;
@override @useResult
$Res call({
 String id, String type, String payload, DateTime createdAt, int retryCount
});




}
/// @nodoc
class __$SyncActionCopyWithImpl<$Res>
    implements _$SyncActionCopyWith<$Res> {
  __$SyncActionCopyWithImpl(this._self, this._then);

  final _SyncAction _self;
  final $Res Function(_SyncAction) _then;

/// Create a copy of SyncAction
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? type = null,Object? payload = null,Object? createdAt = null,Object? retryCount = null,}) {
  return _then(_SyncAction(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,payload: null == payload ? _self.payload : payload // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,retryCount: null == retryCount ? _self.retryCount : retryCount // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

// dart format on
