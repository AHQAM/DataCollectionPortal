import 'package:freezed_annotation/freezed_annotation.dart';

part 'notification_model.freezed.dart';
part 'notification_model.g.dart';

@freezed
abstract class NotificationModel with _$NotificationModel {
  const factory NotificationModel({
    required String notificationId,
    required String userId,
    required String titleAr,
    required String titleEn,
    required String bodyAr,
    required String bodyEn,
    Map<String, dynamic>? data,
    required String status, // 'SENT', 'READ'
    required DateTime sentAt,
    required DateTime createdAt,
  }) = _NotificationModel;

  factory NotificationModel.fromJson(Map<String, dynamic> json) =>
      _$NotificationModelFromJson(json);
}
