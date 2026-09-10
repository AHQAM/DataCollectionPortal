import 'package:freezed_annotation/freezed_annotation.dart';

part 'form_record_model.freezed.dart';
part 'form_record_model.g.dart';

@freezed
class FormRecordModel with _$FormRecordModel {
  const factory FormRecordModel({
    required String id,
    required String requestId,
    required String activityId,
    required String branchId,
    required String regionNo,
    required String submittedBy,
    required DateTime createdAt,
    required Map<String, dynamic> data, // Keyed by form field ID
    Map<String, dynamic>? metadata, // Device info, exact location, etc.
  }) = _FormRecordModel;

  factory FormRecordModel.fromJson(Map<String, dynamic> json) =>
      _$FormRecordModelFromJson(json);
}
