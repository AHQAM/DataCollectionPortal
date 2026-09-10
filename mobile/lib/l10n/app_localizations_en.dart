// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'Sales Collection Hub';

  @override
  String get loginTitle => 'Login';

  @override
  String get regionNumber => 'Region Number';

  @override
  String get regionNumberHint => 'Enter your region number';

  @override
  String get password => 'Password';

  @override
  String get passwordHint => 'Enter your password';

  @override
  String get loginButton => 'Login';

  @override
  String get forgotPassword => 'Forgot Password?';

  @override
  String get myRequests => 'My Requests';

  @override
  String get settings => 'Settings';

  @override
  String get logout => 'Logout';

  @override
  String get sync => 'Sync';

  @override
  String get offline => 'Offline Mode';

  @override
  String get online => 'Online';

  @override
  String get save => 'Save';

  @override
  String get submit => 'Submit';

  @override
  String get errorGeneric => 'An unexpected error occurred';

  @override
  String get emptyState => 'No data to display';

  @override
  String get search => 'Search';

  @override
  String get requiredField => 'This field is required';

  @override
  String get changePassword => 'Change Password';

  @override
  String get currentPassword => 'Current Password';

  @override
  String get newPassword => 'New Password';

  @override
  String get confirmPassword => 'Confirm Password';

  @override
  String get passwordMismatch => 'Passwords do not match';

  @override
  String get passwordLengthError => 'Password must be at least 6 characters';

  @override
  String get mustChangePasswordMsg =>
      'You must change your password to continue';

  @override
  String get notifications => 'Notifications';

  @override
  String get noNotifications => 'No new notifications';
}
