// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'form_field_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$FormFieldModel {

 String get id; String? get fieldKey; String get type; String get labelAr; String get labelEn; bool get isRequired; List<String>? get options; String? get validationRegex; String? get validationMessageAr; String? get validationMessageEn; bool get isReadOnly; int? get minLength; int? get maxLength; double? get minValue; double? get maxValue; int get orderIndex; Map<String, dynamic>? get visibilityRule;
/// Create a copy of FormFieldModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$FormFieldModelCopyWith<FormFieldModel> get copyWith => _$FormFieldModelCopyWithImpl<FormFieldModel>(this as FormFieldModel, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as FormFieldModel;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is FormFieldModel&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.fieldKey, _this.fieldKey) || other.fieldKey == _this.fieldKey)&&(identical(other.type, _this.type) || other.type == _this.type)&&(identical(other.labelAr, _this.labelAr) || other.labelAr == _this.labelAr)&&(identical(other.labelEn, _this.labelEn) || other.labelEn == _this.labelEn)&&(identical(other.isRequired, _this.isRequired) || other.isRequired == _this.isRequired)&&const DeepCollectionEquality().equals(other.options, _this.options)&&(identical(other.validationRegex, _this.validationRegex) || other.validationRegex == _this.validationRegex)&&(identical(other.validationMessageAr, _this.validationMessageAr) || other.validationMessageAr == _this.validationMessageAr)&&(identical(other.validationMessageEn, _this.validationMessageEn) || other.validationMessageEn == _this.validationMessageEn)&&(identical(other.isReadOnly, _this.isReadOnly) || other.isReadOnly == _this.isReadOnly)&&(identical(other.minLength, _this.minLength) || other.minLength == _this.minLength)&&(identical(other.maxLength, _this.maxLength) || other.maxLength == _this.maxLength)&&(identical(other.minValue, _this.minValue) || other.minValue == _this.minValue)&&(identical(other.maxValue, _this.maxValue) || other.maxValue == _this.maxValue)&&(identical(other.orderIndex, _this.orderIndex) || other.orderIndex == _this.orderIndex)&&const DeepCollectionEquality().equals(other.visibilityRule, _this.visibilityRule));
}


@override
int get hashCode {
  final _this = this as FormFieldModel;
  return Object.hash(runtimeType,_this.id,_this.fieldKey,_this.type,_this.labelAr,_this.labelEn,_this.isRequired,const DeepCollectionEquality().hash(_this.options),_this.validationRegex,_this.validationMessageAr,_this.validationMessageEn,_this.isReadOnly,_this.minLength,_this.maxLength,_this.minValue,_this.maxValue,_this.orderIndex,const DeepCollectionEquality().hash(_this.visibilityRule));
}

@override
String toString() {
  final _this = this as FormFieldModel;
  return 'FormFieldModel(id: ${_this.id}, fieldKey: ${_this.fieldKey}, type: ${_this.type}, labelAr: ${_this.labelAr}, labelEn: ${_this.labelEn}, isRequired: ${_this.isRequired}, options: ${_this.options}, validationRegex: ${_this.validationRegex}, validationMessageAr: ${_this.validationMessageAr}, validationMessageEn: ${_this.validationMessageEn}, isReadOnly: ${_this.isReadOnly}, minLength: ${_this.minLength}, maxLength: ${_this.maxLength}, minValue: ${_this.minValue}, maxValue: ${_this.maxValue}, orderIndex: ${_this.orderIndex}, visibilityRule: ${_this.visibilityRule})';
}


}

/// @nodoc
abstract mixin class $FormFieldModelCopyWith<$Res>  {
  factory $FormFieldModelCopyWith(FormFieldModel value, $Res Function(FormFieldModel) _then) = _$FormFieldModelCopyWithImpl;
@useResult
$Res call({
 String id, String? fieldKey, String type, String labelAr, String labelEn, bool isRequired, List<String>? options, String? validationRegex, String? validationMessageAr, String? validationMessageEn, bool isReadOnly, int? minLength, int? maxLength, double? minValue, double? maxValue, int orderIndex, Map<String, dynamic>? visibilityRule
});




}
/// @nodoc
class _$FormFieldModelCopyWithImpl<$Res>
    implements $FormFieldModelCopyWith<$Res> {
  _$FormFieldModelCopyWithImpl(this._self, this._then);

  final FormFieldModel _self;
  final $Res Function(FormFieldModel) _then;

/// Create a copy of FormFieldModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? fieldKey = freezed,Object? type = null,Object? labelAr = null,Object? labelEn = null,Object? isRequired = null,Object? options = freezed,Object? validationRegex = freezed,Object? validationMessageAr = freezed,Object? validationMessageEn = freezed,Object? isReadOnly = null,Object? minLength = freezed,Object? maxLength = freezed,Object? minValue = freezed,Object? maxValue = freezed,Object? orderIndex = null,Object? visibilityRule = freezed,}) {
  return _then(FormFieldModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,fieldKey: freezed == fieldKey ? _self.fieldKey : fieldKey // ignore: cast_nullable_to_non_nullable
as String?,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,labelAr: null == labelAr ? _self.labelAr : labelAr // ignore: cast_nullable_to_non_nullable
as String,labelEn: null == labelEn ? _self.labelEn : labelEn // ignore: cast_nullable_to_non_nullable
as String,isRequired: null == isRequired ? _self.isRequired : isRequired // ignore: cast_nullable_to_non_nullable
as bool,options: freezed == options ? _self.options : options // ignore: cast_nullable_to_non_nullable
as List<String>?,validationRegex: freezed == validationRegex ? _self.validationRegex : validationRegex // ignore: cast_nullable_to_non_nullable
as String?,validationMessageAr: freezed == validationMessageAr ? _self.validationMessageAr : validationMessageAr // ignore: cast_nullable_to_non_nullable
as String?,validationMessageEn: freezed == validationMessageEn ? _self.validationMessageEn : validationMessageEn // ignore: cast_nullable_to_non_nullable
as String?,isReadOnly: null == isReadOnly ? _self.isReadOnly : isReadOnly // ignore: cast_nullable_to_non_nullable
as bool,minLength: freezed == minLength ? _self.minLength : minLength // ignore: cast_nullable_to_non_nullable
as int?,maxLength: freezed == maxLength ? _self.maxLength : maxLength // ignore: cast_nullable_to_non_nullable
as int?,minValue: freezed == minValue ? _self.minValue : minValue // ignore: cast_nullable_to_non_nullable
as double?,maxValue: freezed == maxValue ? _self.maxValue : maxValue // ignore: cast_nullable_to_non_nullable
as double?,orderIndex: null == orderIndex ? _self.orderIndex : orderIndex // ignore: cast_nullable_to_non_nullable
as int,visibilityRule: freezed == visibilityRule ? _self.visibilityRule : visibilityRule // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>?,
  ));
}

}


/// Adds pattern-matching-related methods to [FormFieldModel].
extension FormFieldModelPatterns on FormFieldModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _FormFieldModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _FormFieldModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _FormFieldModel value)  $default,){
final _that = this;
switch (_that) {
case _FormFieldModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _FormFieldModel value)?  $default,){
final _that = this;
switch (_that) {
case _FormFieldModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String? fieldKey,  String type,  String labelAr,  String labelEn,  bool isRequired,  List<String>? options,  String? validationRegex,  String? validationMessageAr,  String? validationMessageEn,  bool isReadOnly,  int? minLength,  int? maxLength,  double? minValue,  double? maxValue,  int orderIndex,  Map<String, dynamic>? visibilityRule)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _FormFieldModel() when $default != null:
return $default(_that.id,_that.fieldKey,_that.type,_that.labelAr,_that.labelEn,_that.isRequired,_that.options,_that.validationRegex,_that.validationMessageAr,_that.validationMessageEn,_that.isReadOnly,_that.minLength,_that.maxLength,_that.minValue,_that.maxValue,_that.orderIndex,_that.visibilityRule);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String? fieldKey,  String type,  String labelAr,  String labelEn,  bool isRequired,  List<String>? options,  String? validationRegex,  String? validationMessageAr,  String? validationMessageEn,  bool isReadOnly,  int? minLength,  int? maxLength,  double? minValue,  double? maxValue,  int orderIndex,  Map<String, dynamic>? visibilityRule)  $default,) {final _that = this;
switch (_that) {
case _FormFieldModel():
return $default(_that.id,_that.fieldKey,_that.type,_that.labelAr,_that.labelEn,_that.isRequired,_that.options,_that.validationRegex,_that.validationMessageAr,_that.validationMessageEn,_that.isReadOnly,_that.minLength,_that.maxLength,_that.minValue,_that.maxValue,_that.orderIndex,_that.visibilityRule);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String? fieldKey,  String type,  String labelAr,  String labelEn,  bool isRequired,  List<String>? options,  String? validationRegex,  String? validationMessageAr,  String? validationMessageEn,  bool isReadOnly,  int? minLength,  int? maxLength,  double? minValue,  double? maxValue,  int orderIndex,  Map<String, dynamic>? visibilityRule)?  $default,) {final _that = this;
switch (_that) {
case _FormFieldModel() when $default != null:
return $default(_that.id,_that.fieldKey,_that.type,_that.labelAr,_that.labelEn,_that.isRequired,_that.options,_that.validationRegex,_that.validationMessageAr,_that.validationMessageEn,_that.isReadOnly,_that.minLength,_that.maxLength,_that.minValue,_that.maxValue,_that.orderIndex,_that.visibilityRule);case _:
  return null;

}
}

}

/// @nodoc


class _FormFieldModel extends FormFieldModel {
  const _FormFieldModel({required this.id, this.fieldKey, required this.type, required this.labelAr, required this.labelEn, this.isRequired = true,  List<String>? options, this.validationRegex, this.validationMessageAr, this.validationMessageEn, this.isReadOnly = false, this.minLength, this.maxLength, this.minValue, this.maxValue, this.orderIndex = 0,  Map<String, dynamic>? visibilityRule}): _options = options,_visibilityRule = visibilityRule,super._();
  

@override final  String id;
@override final  String? fieldKey;
@override final  String type;
@override final  String labelAr;
@override final  String labelEn;
@override@JsonKey() final  bool isRequired;
 final  List<String>? _options;
@override List<String>? get options {
  final value = _options;
  if (value == null) return null;
  if (_options is EqualUnmodifiableListView) return _options;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(value);
}

@override final  String? validationRegex;
@override final  String? validationMessageAr;
@override final  String? validationMessageEn;
@override@JsonKey() final  bool isReadOnly;
@override final  int? minLength;
@override final  int? maxLength;
@override final  double? minValue;
@override final  double? maxValue;
@override@JsonKey() final  int orderIndex;
 final  Map<String, dynamic>? _visibilityRule;
@override Map<String, dynamic>? get visibilityRule {
  final value = _visibilityRule;
  if (value == null) return null;
  if (_visibilityRule is EqualUnmodifiableMapView) return _visibilityRule;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableMapView(value);
}


/// Create a copy of FormFieldModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$FormFieldModelCopyWith<_FormFieldModel> get copyWith => __$FormFieldModelCopyWithImpl<_FormFieldModel>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _FormFieldModel&&(identical(other.id, id) || other.id == id)&&(identical(other.fieldKey, fieldKey) || other.fieldKey == fieldKey)&&(identical(other.type, type) || other.type == type)&&(identical(other.labelAr, labelAr) || other.labelAr == labelAr)&&(identical(other.labelEn, labelEn) || other.labelEn == labelEn)&&(identical(other.isRequired, isRequired) || other.isRequired == isRequired)&&const DeepCollectionEquality().equals(other.options, _options)&&(identical(other.validationRegex, validationRegex) || other.validationRegex == validationRegex)&&(identical(other.validationMessageAr, validationMessageAr) || other.validationMessageAr == validationMessageAr)&&(identical(other.validationMessageEn, validationMessageEn) || other.validationMessageEn == validationMessageEn)&&(identical(other.isReadOnly, isReadOnly) || other.isReadOnly == isReadOnly)&&(identical(other.minLength, minLength) || other.minLength == minLength)&&(identical(other.maxLength, maxLength) || other.maxLength == maxLength)&&(identical(other.minValue, minValue) || other.minValue == minValue)&&(identical(other.maxValue, maxValue) || other.maxValue == maxValue)&&(identical(other.orderIndex, orderIndex) || other.orderIndex == orderIndex)&&const DeepCollectionEquality().equals(other.visibilityRule, _visibilityRule));
}


@override
int get hashCode {
    return Object.hash(runtimeType,id,fieldKey,type,labelAr,labelEn,isRequired,const DeepCollectionEquality().hash(_options),validationRegex,validationMessageAr,validationMessageEn,isReadOnly,minLength,maxLength,minValue,maxValue,orderIndex,const DeepCollectionEquality().hash(_visibilityRule));
}

@override
String toString() {
    return 'FormFieldModel(id: $id, fieldKey: $fieldKey, type: $type, labelAr: $labelAr, labelEn: $labelEn, isRequired: $isRequired, options: $options, validationRegex: $validationRegex, validationMessageAr: $validationMessageAr, validationMessageEn: $validationMessageEn, isReadOnly: $isReadOnly, minLength: $minLength, maxLength: $maxLength, minValue: $minValue, maxValue: $maxValue, orderIndex: $orderIndex, visibilityRule: $visibilityRule)';
}


}

/// @nodoc
abstract mixin class _$FormFieldModelCopyWith<$Res> implements $FormFieldModelCopyWith<$Res> {
  factory _$FormFieldModelCopyWith(_FormFieldModel value, $Res Function(_FormFieldModel) _then) = __$FormFieldModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String? fieldKey, String type, String labelAr, String labelEn, bool isRequired, List<String>? options, String? validationRegex, String? validationMessageAr, String? validationMessageEn, bool isReadOnly, int? minLength, int? maxLength, double? minValue, double? maxValue, int orderIndex, Map<String, dynamic>? visibilityRule
});




}
/// @nodoc
class __$FormFieldModelCopyWithImpl<$Res>
    implements _$FormFieldModelCopyWith<$Res> {
  __$FormFieldModelCopyWithImpl(this._self, this._then);

  final _FormFieldModel _self;
  final $Res Function(_FormFieldModel) _then;

/// Create a copy of FormFieldModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? fieldKey = freezed,Object? type = null,Object? labelAr = null,Object? labelEn = null,Object? isRequired = null,Object? options = freezed,Object? validationRegex = freezed,Object? validationMessageAr = freezed,Object? validationMessageEn = freezed,Object? isReadOnly = null,Object? minLength = freezed,Object? maxLength = freezed,Object? minValue = freezed,Object? maxValue = freezed,Object? orderIndex = null,Object? visibilityRule = freezed,}) {
  return _then(_FormFieldModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,fieldKey: freezed == fieldKey ? _self.fieldKey : fieldKey // ignore: cast_nullable_to_non_nullable
as String?,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,labelAr: null == labelAr ? _self.labelAr : labelAr // ignore: cast_nullable_to_non_nullable
as String,labelEn: null == labelEn ? _self.labelEn : labelEn // ignore: cast_nullable_to_non_nullable
as String,isRequired: null == isRequired ? _self.isRequired : isRequired // ignore: cast_nullable_to_non_nullable
as bool,options: freezed == options ? _self._options : options // ignore: cast_nullable_to_non_nullable
as List<String>?,validationRegex: freezed == validationRegex ? _self.validationRegex : validationRegex // ignore: cast_nullable_to_non_nullable
as String?,validationMessageAr: freezed == validationMessageAr ? _self.validationMessageAr : validationMessageAr // ignore: cast_nullable_to_non_nullable
as String?,validationMessageEn: freezed == validationMessageEn ? _self.validationMessageEn : validationMessageEn // ignore: cast_nullable_to_non_nullable
as String?,isReadOnly: null == isReadOnly ? _self.isReadOnly : isReadOnly // ignore: cast_nullable_to_non_nullable
as bool,minLength: freezed == minLength ? _self.minLength : minLength // ignore: cast_nullable_to_non_nullable
as int?,maxLength: freezed == maxLength ? _self.maxLength : maxLength // ignore: cast_nullable_to_non_nullable
as int?,minValue: freezed == minValue ? _self.minValue : minValue // ignore: cast_nullable_to_non_nullable
as double?,maxValue: freezed == maxValue ? _self.maxValue : maxValue // ignore: cast_nullable_to_non_nullable
as double?,orderIndex: null == orderIndex ? _self.orderIndex : orderIndex // ignore: cast_nullable_to_non_nullable
as int,visibilityRule: freezed == visibilityRule ? _self._visibilityRule : visibilityRule // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>?,
  ));
}


}

// dart format on
