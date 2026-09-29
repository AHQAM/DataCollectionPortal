import 'package:flutter/material.dart';

class AppErrorFormatter {
  static String format(dynamic error, BuildContext context) {
    if (error == null) return '';

    final isAr = Localizations.localeOf(context).languageCode == 'ar';
    String raw = error.toString().trim();

    // Strip common wrapper prefixes like Exception: or FirebaseFunctionsException:
    raw = raw.replaceFirst(RegExp(r'^(Exception:\s*|Error:\s*)'), '');
    raw = raw.replaceFirst(
      RegExp(r'^FirebaseFunctionsException:\s*(\[[^\]]+\]\s*)?'),
      '',
    );

    // Check for bilingual delimiter '|'
    if (raw.contains('|')) {
      final parts = raw.split('|');
      final arPart = parts[0].trim();
      final enPart = parts.length > 1 ? parts[1].trim() : arPart;
      return isAr ? arPart : enPart;
    }

    // Common Firebase / network error matches
    final lower = raw.toLowerCase();
    if (lower.contains('network') ||
        lower.contains('socket') ||
        lower.contains('failed host lookup') ||
        lower.contains('connection')) {
      return isAr
          ? 'تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت.'
          : 'Unable to connect, please check your network connection.';
    }
    if (lower.contains('unauthenticated') ||
        lower.contains('user-not-found') ||
        lower.contains('wrong-password') ||
        lower.contains('invalid-credential')) {
      return isAr
          ? 'اسم المستخدم أو كلمة المرور غير صحيحة.'
          : 'Invalid username or password.';
    }
    if (lower.contains('device') && lower.contains('mismatch')) {
      return isAr
          ? 'هذا الحساب مرتبط بجهاز آخر. تواصل مع المسؤول لإلغاء الربط.'
          : 'Account bound to another device. Contact administrator.';
    }
    if (lower.contains('permission-denied')) {
      return isAr
          ? 'ليس لديك الصلاحية لتنفيذ هذه العملية.'
          : 'Permission denied for this operation.';
    }
    if (lower.contains('password must be at least') ||
        lower.contains('6 characters')) {
      return isAr
          ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.'
          : 'Password must be at least 6 characters.';
    }
    if (lower.contains('cannot reuse')) {
      return isAr
          ? 'لا يمكن استخدام نفس كلمة المرور الحالية.'
          : 'Cannot reuse the current password.';
    }
    if (lower.contains('current password is incorrect') ||
        lower.contains('wrong_current')) {
      return isAr
          ? 'كلمة المرور الحالية غير صحيحة.'
          : 'Current password is incorrect.';
    }
    if (lower.contains('already-exists') ||
        lower.contains('username already taken')) {
      return isAr
          ? 'اسم المستخدم مسجل مسبقاً.'
          : 'Username is already taken.';
    }
    if (lower.contains('deadline-exceeded') || lower.contains('timeout')) {
      return isAr
          ? 'استغرقت العملية وقتاً أطول من المعتاد، يرجى المحاولة مرة أخرى.'
          : 'Operation timed out, please try again.';
    }

    // Clean up any remaining stack trace lines or bracketed text
    final lines = raw.split('\n');
    String firstLine = lines.isNotEmpty ? lines[0].trim() : raw;
    firstLine = firstLine
        .replaceAll(RegExp(r'\[[a-zA-Z0-9_\/-]+\]'), '')
        .trim();

    if (firstLine.length > 100) {
      firstLine = '${firstLine.substring(0, 97)}...';
    }

    return firstLine.isNotEmpty
        ? firstLine
        : (isAr
            ? 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.'
            : 'An unexpected error occurred. Please try again.');
  }

  static void showSnackBar(BuildContext context, dynamic error) {
    final message = format(error, context);
    if (message.isEmpty) return;

    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.white, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        backgroundColor: Colors.red.shade800,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 4),
      ),
    );
  }

  static void showSuccessSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_outline, color: Colors.white, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: Colors.green.shade800,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 3),
      ),
    );
  }
}
