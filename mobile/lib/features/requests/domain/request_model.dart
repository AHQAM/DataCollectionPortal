import 'package:freezed_annotation/freezed_annotation.dart';

part 'request_model.freezed.dart';
part 'request_model.g.dart';

@freezed
class RequestModel with _$RequestModel {
  const factory RequestModel({
    required String id,
    required String activityId,
    required String branchId,
    required String regionNo,
    required String status, // 'pending', 'in_progress', 'completed', 'verified'
    required DateTime assignedAt,
    DateTime? dueDate,
    DateTime? completedAt,
    String? assignedTo,
    @Default({}) Map<String, dynamic> metadata,
  }) = _RequestModel;

  factory RequestModel.fromJson(Map<String, dynamic> json) =>
      _$RequestModelFromJson(json);
}
