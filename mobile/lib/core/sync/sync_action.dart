import 'package:freezed_annotation/freezed_annotation.dart';

part 'sync_action.freezed.dart';
part 'sync_action.g.dart';

@freezed
class SyncAction with _$SyncAction {
  const factory SyncAction({
    required String id,
    required String type, // e.g., 'CREATE_RECORD', 'UPDATE_REQUEST'
    required String payload, // JSON encoded data
    required DateTime createdAt,
    @Default(0) int retryCount,
  }) = _SyncAction;

  factory SyncAction.fromJson(Map<String, dynamic> json) =>
      _$SyncActionFromJson(json);
}
