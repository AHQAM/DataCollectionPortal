// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'form_record_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$FormRecordModel {

 String get id; String get requestId; String get activityId; String get branchId; String get regionNo; String get submittedBy; DateTime get createdAt; Map<String, dynamic> get data; Map<String, dynamic>? get metadata;
/// Create a copy of FormRecordModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$FormRecordModelCopyWith<FormRecordModel> get copyWith => _$FormRecordModelCopyWithImpl<FormRecordModel>(this as FormRecordModel, _$identity);

  /// Serializes this FormRecordModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as FormRecordModel;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is FormRecordModel&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.requestId, _this.requestId) || other.requestId == _this.requestId)&&(identical(other.activityId, _this.activityId) || other.activityId == _this.activityId)&&(identical(other.branchId, _this.branchId) || other.branchId == _this.branchId)&&(identical(other.regionNo, _this.regionNo) || other.regionNo == _this.regionNo)&&(identical(other.submittedBy, _this.submittedBy) || other.submittedBy == _this.submittedBy)&&(identical(other.createdAt, _this.createdAt) || other.createdAt == _this.createdAt)&&const DeepCollectionEquality().equals(other.data, _this.data)&&const DeepCollectionEquality().equals(other.metadata, _this.metadata));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as FormRecordModel;
  return Object.hash(runtimeType,_this.id,_this.requestId,_this.activityId,_this.branchId,_this.regionNo,_this.submittedBy,_this.createdAt,const DeepCollectionEquality().hash(_this.data),const DeepCollectionEquality().hash(_this.metadata));
}

@override
String toString() {
  final _this = this as FormRecordModel;
  return 'FormRecordModel(id: ${_this.id}, requestId: ${_this.requestId}, activityId: ${_this.activityId}, branchId: ${_this.branchId}, regionNo: ${_this.regionNo}, submittedBy: ${_this.submittedBy}, createdAt: ${_this.createdAt}, data: ${_this.data}, metadata: ${_this.metadata})';
}


}

/// @nodoc
abstract mixin class $FormRecordModelCopyWith<$Res>  {
  factory $FormRecordModelCopyWith(FormRecordModel value, $Res Function(FormRecordModel) _then) = _$FormRecordModelCopyWithImpl;
@useResult
$Res call({
 String id, String requestId, String activityId, String branchId, String regionNo, String submittedBy, DateTime createdAt, Map<String, dynamic> data, Map<String, dynamic>? metadata
});




}
/// @nodoc
class _$FormRecordModelCopyWithImpl<$Res>
    implements $FormRecordModelCopyWith<$Res> {
  _$FormRecordModelCopyWithImpl(this._self, this._then);

  final FormRecordModel _self;
  final $Res Function(FormRecordModel) _then;

/// Create a copy of FormRecordModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? requestId = null,Object? activityId = null,Object? branchId = null,Object? regionNo = null,Object? submittedBy = null,Object? createdAt = null,Object? data = null,Object? metadata = freezed,}) {
  return _then(FormRecordModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,requestId: null == requestId ? _self.requestId : requestId // ignore: cast_nullable_to_non_nullable
as String,activityId: null == activityId ? _self.activityId : activityId // ignore: cast_nullable_to_non_nullable
as String,branchId: null == branchId ? _self.branchId : branchId // ignore: cast_nullable_to_non_nullable
as String,regionNo: null == regionNo ? _self.regionNo : regionNo // ignore: cast_nullable_to_non_nullable
as String,submittedBy: null == submittedBy ? _self.submittedBy : submittedBy // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,data: null == data ? _self.data : data // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>,metadata: freezed == metadata ? _self.metadata : metadata // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>?,
  ));
}

}


/// Adds pattern-matching-related methods to [FormRecordModel].
extension FormRecordModelPatterns on FormRecordModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _FormRecordModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _FormRecordModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _FormRecordModel value)  $default,){
final _that = this;
switch (_that) {
case _FormRecordModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _FormRecordModel value)?  $default,){
final _that = this;
switch (_that) {
case _FormRecordModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String requestId,  String activityId,  String branchId,  String regionNo,  String submittedBy,  DateTime createdAt,  Map<String, dynamic> data,  Map<String, dynamic>? metadata)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _FormRecordModel() when $default != null:
return $default(_that.id,_that.requestId,_that.activityId,_that.branchId,_that.regionNo,_that.submittedBy,_that.createdAt,_that.data,_that.metadata);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String requestId,  String activityId,  String branchId,  String regionNo,  String submittedBy,  DateTime createdAt,  Map<String, dynamic> data,  Map<String, dynamic>? metadata)  $default,) {final _that = this;
switch (_that) {
case _FormRecordModel():
return $default(_that.id,_that.requestId,_that.activityId,_that.branchId,_that.regionNo,_that.submittedBy,_that.createdAt,_that.data,_that.metadata);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String requestId,  String activityId,  String branchId,  String regionNo,  String submittedBy,  DateTime createdAt,  Map<String, dynamic> data,  Map<String, dynamic>? metadata)?  $default,) {final _that = this;
switch (_that) {
case _FormRecordModel() when $default != null:
return $default(_that.id,_that.requestId,_that.activityId,_that.branchId,_that.regionNo,_that.submittedBy,_that.createdAt,_that.data,_that.metadata);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _FormRecordModel implements FormRecordModel {
  const _FormRecordModel({required this.id, required this.requestId, required this.activityId, required this.branchId, required this.regionNo, required this.submittedBy, required this.createdAt, required  Map<String, dynamic> data,  Map<String, dynamic>? metadata}): _data = data,_metadata = metadata;
  factory _FormRecordModel.fromJson(Map<String, dynamic> json) => _$FormRecordModelFromJson(json);

@override final  String id;
@override final  String requestId;
@override final  String activityId;
@override final  String branchId;
@override final  String regionNo;
@override final  String submittedBy;
@override final  DateTime createdAt;
 final  Map<String, dynamic> _data;
@override Map<String, dynamic> get data {
  if (_data is EqualUnmodifiableMapView) return _data;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableMapView(_data);
}

 final  Map<String, dynamic>? _metadata;
@override Map<String, dynamic>? get metadata {
  final value = _metadata;
  if (value == null) return null;
  if (_metadata is EqualUnmodifiableMapView) return _metadata;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableMapView(value);
}


/// Create a copy of FormRecordModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$FormRecordModelCopyWith<_FormRecordModel> get copyWith => __$FormRecordModelCopyWithImpl<_FormRecordModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$FormRecordModelToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _FormRecordModel&&(identical(other.id, id) || other.id == id)&&(identical(other.requestId, requestId) || other.requestId == requestId)&&(identical(other.activityId, activityId) || other.activityId == activityId)&&(identical(other.branchId, branchId) || other.branchId == branchId)&&(identical(other.regionNo, regionNo) || other.regionNo == regionNo)&&(identical(other.submittedBy, submittedBy) || other.submittedBy == submittedBy)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&const DeepCollectionEquality().equals(other.data, _data)&&const DeepCollectionEquality().equals(other.metadata, _metadata));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,id,requestId,activityId,branchId,regionNo,submittedBy,createdAt,const DeepCollectionEquality().hash(_data),const DeepCollectionEquality().hash(_metadata));
}

@override
String toString() {
    return 'FormRecordModel(id: $id, requestId: $requestId, activityId: $activityId, branchId: $branchId, regionNo: $regionNo, submittedBy: $submittedBy, createdAt: $createdAt, data: $data, metadata: $metadata)';
}


}

/// @nodoc
abstract mixin class _$FormRecordModelCopyWith<$Res> implements $FormRecordModelCopyWith<$Res> {
  factory _$FormRecordModelCopyWith(_FormRecordModel value, $Res Function(_FormRecordModel) _then) = __$FormRecordModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String requestId, String activityId, String branchId, String regionNo, String submittedBy, DateTime createdAt, Map<String, dynamic> data, Map<String, dynamic>? metadata
});




}
/// @nodoc
class __$FormRecordModelCopyWithImpl<$Res>
    implements _$FormRecordModelCopyWith<$Res> {
  __$FormRecordModelCopyWithImpl(this._self, this._then);

  final _FormRecordModel _self;
  final $Res Function(_FormRecordModel) _then;

/// Create a copy of FormRecordModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? requestId = null,Object? activityId = null,Object? branchId = null,Object? regionNo = null,Object? submittedBy = null,Object? createdAt = null,Object? data = null,Object? metadata = freezed,}) {
  return _then(_FormRecordModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,requestId: null == requestId ? _self.requestId : requestId // ignore: cast_nullable_to_non_nullable
as String,activityId: null == activityId ? _self.activityId : activityId // ignore: cast_nullable_to_non_nullable
as String,branchId: null == branchId ? _self.branchId : branchId // ignore: cast_nullable_to_non_nullable
as String,regionNo: null == regionNo ? _self.regionNo : regionNo // ignore: cast_nullable_to_non_nullable
as String,submittedBy: null == submittedBy ? _self.submittedBy : submittedBy // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,data: null == data ? _self._data : data // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>,metadata: freezed == metadata ? _self._metadata : metadata // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>?,
  ));
}


}

// dart format on
