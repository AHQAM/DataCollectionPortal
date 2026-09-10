// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'request_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$RequestModel {

 String get id; String get activityId; String get branchId; String get regionNo; String get status; DateTime get assignedAt; DateTime? get dueDate; DateTime? get completedAt; String? get assignedTo; Map<String, dynamic> get metadata;
/// Create a copy of RequestModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$RequestModelCopyWith<RequestModel> get copyWith => _$RequestModelCopyWithImpl<RequestModel>(this as RequestModel, _$identity);

  /// Serializes this RequestModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as RequestModel;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is RequestModel&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.activityId, _this.activityId) || other.activityId == _this.activityId)&&(identical(other.branchId, _this.branchId) || other.branchId == _this.branchId)&&(identical(other.regionNo, _this.regionNo) || other.regionNo == _this.regionNo)&&(identical(other.status, _this.status) || other.status == _this.status)&&(identical(other.assignedAt, _this.assignedAt) || other.assignedAt == _this.assignedAt)&&(identical(other.dueDate, _this.dueDate) || other.dueDate == _this.dueDate)&&(identical(other.completedAt, _this.completedAt) || other.completedAt == _this.completedAt)&&(identical(other.assignedTo, _this.assignedTo) || other.assignedTo == _this.assignedTo)&&const DeepCollectionEquality().equals(other.metadata, _this.metadata));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as RequestModel;
  return Object.hash(runtimeType,_this.id,_this.activityId,_this.branchId,_this.regionNo,_this.status,_this.assignedAt,_this.dueDate,_this.completedAt,_this.assignedTo,const DeepCollectionEquality().hash(_this.metadata));
}

@override
String toString() {
  final _this = this as RequestModel;
  return 'RequestModel(id: ${_this.id}, activityId: ${_this.activityId}, branchId: ${_this.branchId}, regionNo: ${_this.regionNo}, status: ${_this.status}, assignedAt: ${_this.assignedAt}, dueDate: ${_this.dueDate}, completedAt: ${_this.completedAt}, assignedTo: ${_this.assignedTo}, metadata: ${_this.metadata})';
}


}

/// @nodoc
abstract mixin class $RequestModelCopyWith<$Res>  {
  factory $RequestModelCopyWith(RequestModel value, $Res Function(RequestModel) _then) = _$RequestModelCopyWithImpl;
@useResult
$Res call({
 String id, String activityId, String branchId, String regionNo, String status, DateTime assignedAt, DateTime? dueDate, DateTime? completedAt, String? assignedTo, Map<String, dynamic> metadata
});




}
/// @nodoc
class _$RequestModelCopyWithImpl<$Res>
    implements $RequestModelCopyWith<$Res> {
  _$RequestModelCopyWithImpl(this._self, this._then);

  final RequestModel _self;
  final $Res Function(RequestModel) _then;

/// Create a copy of RequestModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? activityId = null,Object? branchId = null,Object? regionNo = null,Object? status = null,Object? assignedAt = null,Object? dueDate = freezed,Object? completedAt = freezed,Object? assignedTo = freezed,Object? metadata = null,}) {
  return _then(RequestModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,activityId: null == activityId ? _self.activityId : activityId // ignore: cast_nullable_to_non_nullable
as String,branchId: null == branchId ? _self.branchId : branchId // ignore: cast_nullable_to_non_nullable
as String,regionNo: null == regionNo ? _self.regionNo : regionNo // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,assignedAt: null == assignedAt ? _self.assignedAt : assignedAt // ignore: cast_nullable_to_non_nullable
as DateTime,dueDate: freezed == dueDate ? _self.dueDate : dueDate // ignore: cast_nullable_to_non_nullable
as DateTime?,completedAt: freezed == completedAt ? _self.completedAt : completedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,assignedTo: freezed == assignedTo ? _self.assignedTo : assignedTo // ignore: cast_nullable_to_non_nullable
as String?,metadata: null == metadata ? _self.metadata : metadata // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>,
  ));
}

}


/// Adds pattern-matching-related methods to [RequestModel].
extension RequestModelPatterns on RequestModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _RequestModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _RequestModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _RequestModel value)  $default,){
final _that = this;
switch (_that) {
case _RequestModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _RequestModel value)?  $default,){
final _that = this;
switch (_that) {
case _RequestModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String activityId,  String branchId,  String regionNo,  String status,  DateTime assignedAt,  DateTime? dueDate,  DateTime? completedAt,  String? assignedTo,  Map<String, dynamic> metadata)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _RequestModel() when $default != null:
return $default(_that.id,_that.activityId,_that.branchId,_that.regionNo,_that.status,_that.assignedAt,_that.dueDate,_that.completedAt,_that.assignedTo,_that.metadata);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String activityId,  String branchId,  String regionNo,  String status,  DateTime assignedAt,  DateTime? dueDate,  DateTime? completedAt,  String? assignedTo,  Map<String, dynamic> metadata)  $default,) {final _that = this;
switch (_that) {
case _RequestModel():
return $default(_that.id,_that.activityId,_that.branchId,_that.regionNo,_that.status,_that.assignedAt,_that.dueDate,_that.completedAt,_that.assignedTo,_that.metadata);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String activityId,  String branchId,  String regionNo,  String status,  DateTime assignedAt,  DateTime? dueDate,  DateTime? completedAt,  String? assignedTo,  Map<String, dynamic> metadata)?  $default,) {final _that = this;
switch (_that) {
case _RequestModel() when $default != null:
return $default(_that.id,_that.activityId,_that.branchId,_that.regionNo,_that.status,_that.assignedAt,_that.dueDate,_that.completedAt,_that.assignedTo,_that.metadata);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _RequestModel implements RequestModel {
  const _RequestModel({required this.id, required this.activityId, required this.branchId, required this.regionNo, required this.status, required this.assignedAt, this.dueDate, this.completedAt, this.assignedTo,  Map<String, dynamic> metadata = const {}}): _metadata = metadata;
  factory _RequestModel.fromJson(Map<String, dynamic> json) => _$RequestModelFromJson(json);

@override final  String id;
@override final  String activityId;
@override final  String branchId;
@override final  String regionNo;
@override final  String status;
@override final  DateTime assignedAt;
@override final  DateTime? dueDate;
@override final  DateTime? completedAt;
@override final  String? assignedTo;
 final  Map<String, dynamic> _metadata;
@override@JsonKey() Map<String, dynamic> get metadata {
  if (_metadata is EqualUnmodifiableMapView) return _metadata;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableMapView(_metadata);
}


/// Create a copy of RequestModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$RequestModelCopyWith<_RequestModel> get copyWith => __$RequestModelCopyWithImpl<_RequestModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$RequestModelToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _RequestModel&&(identical(other.id, id) || other.id == id)&&(identical(other.activityId, activityId) || other.activityId == activityId)&&(identical(other.branchId, branchId) || other.branchId == branchId)&&(identical(other.regionNo, regionNo) || other.regionNo == regionNo)&&(identical(other.status, status) || other.status == status)&&(identical(other.assignedAt, assignedAt) || other.assignedAt == assignedAt)&&(identical(other.dueDate, dueDate) || other.dueDate == dueDate)&&(identical(other.completedAt, completedAt) || other.completedAt == completedAt)&&(identical(other.assignedTo, assignedTo) || other.assignedTo == assignedTo)&&const DeepCollectionEquality().equals(other.metadata, _metadata));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,id,activityId,branchId,regionNo,status,assignedAt,dueDate,completedAt,assignedTo,const DeepCollectionEquality().hash(_metadata));
}

@override
String toString() {
    return 'RequestModel(id: $id, activityId: $activityId, branchId: $branchId, regionNo: $regionNo, status: $status, assignedAt: $assignedAt, dueDate: $dueDate, completedAt: $completedAt, assignedTo: $assignedTo, metadata: $metadata)';
}


}

/// @nodoc
abstract mixin class _$RequestModelCopyWith<$Res> implements $RequestModelCopyWith<$Res> {
  factory _$RequestModelCopyWith(_RequestModel value, $Res Function(_RequestModel) _then) = __$RequestModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String activityId, String branchId, String regionNo, String status, DateTime assignedAt, DateTime? dueDate, DateTime? completedAt, String? assignedTo, Map<String, dynamic> metadata
});




}
/// @nodoc
class __$RequestModelCopyWithImpl<$Res>
    implements _$RequestModelCopyWith<$Res> {
  __$RequestModelCopyWithImpl(this._self, this._then);

  final _RequestModel _self;
  final $Res Function(_RequestModel) _then;

/// Create a copy of RequestModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? activityId = null,Object? branchId = null,Object? regionNo = null,Object? status = null,Object? assignedAt = null,Object? dueDate = freezed,Object? completedAt = freezed,Object? assignedTo = freezed,Object? metadata = null,}) {
  return _then(_RequestModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,activityId: null == activityId ? _self.activityId : activityId // ignore: cast_nullable_to_non_nullable
as String,branchId: null == branchId ? _self.branchId : branchId // ignore: cast_nullable_to_non_nullable
as String,regionNo: null == regionNo ? _self.regionNo : regionNo // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,assignedAt: null == assignedAt ? _self.assignedAt : assignedAt // ignore: cast_nullable_to_non_nullable
as DateTime,dueDate: freezed == dueDate ? _self.dueDate : dueDate // ignore: cast_nullable_to_non_nullable
as DateTime?,completedAt: freezed == completedAt ? _self.completedAt : completedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,assignedTo: freezed == assignedTo ? _self.assignedTo : assignedTo // ignore: cast_nullable_to_non_nullable
as String?,metadata: null == metadata ? _self._metadata : metadata // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>,
  ));
}


}

// dart format on
