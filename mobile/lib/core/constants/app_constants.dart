import 'package:flutter/material.dart';

class AppConstants {
  // Collections
  static const String usersCollection = 'users';
  static const String requestsCollection = 'requests';
  static const String recordsCollection = 'records';
  static const String responsesCollection = 'responses';
  static const String requestFieldsCollection = 'request_fields';
  static const String notificationsCollection = 'notifications';

  // Storage Keys
  static const String deviceIdKey = 'installation_device_id';
  static const String fcmTokenKey = 'fcm_token';
  static const String languageKey = 'preferred_language';

  // Dimensions
  static const double defaultPadding = 16.0;
  static const double defaultBorderRadius = 12.0;

  // App Colors
  static const Color primaryColor = Color(0xFF3B0764); // Dark Purple
  static const Color secondaryColor = Color(0xFF6B21A8);
  static const Color accentColor = Color(0xFFFACC15); // Yellow accent
  static const Color backgroundColor = Color(0xFFF8FAFC);
  static const Color errorColor = Color(0xFFEF4444);
  static const Color successColor = Color(0xFF10B981);
}
