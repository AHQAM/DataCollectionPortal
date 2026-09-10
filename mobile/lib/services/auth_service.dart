import 'dart:io';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
class AuthService with ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  
  User? get currentUser => _auth.currentUser;
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  // Get unique device ID
  Future<String?> _getDeviceId() async {
    if (kIsWeb) return "WEB_DEVICE"; // Platform throws on web
    final DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();
    try {
      if (Platform.isAndroid) {
        final androidInfo = await deviceInfo.androidInfo;
        return androidInfo.id; // Unique ID on Android
      } else if (Platform.isIOS) {
        final iosInfo = await deviceInfo.iosInfo;
        return iosInfo.identifierForVendor; // Unique ID on iOS
      }
    } catch (e) {
      debugPrint("Error getting device ID: $e");
    }
    return null;
  }

  // Login Method
  Future<String?> login(String email, String password) async {
    _setLoading(true);
    try {
      UserCredential result = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      User? user = result.user;
      if (user != null) {
        // Fetch user data from Firestore
        DocumentSnapshot doc = await _db.collection('users').doc(user.uid).get();
        if (!doc.exists) {
          await _auth.signOut();
          _setLoading(false);
          return "حساب المستخدم غير موجود في قاعدة البيانات.";
        }

        Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
        
        // 1. Check Role
        if (data['role'] != 'REP') {
          await _auth.signOut();
          _setLoading(false);
          return "هذا التطبيق مخصص للمناديب فقط.";
        }

        // 2. Device Binding Logic
        String? currentDeviceId = await _getDeviceId();
        if (currentDeviceId == null) {
          await _auth.signOut();
          _setLoading(false);
          return "تعذر جلب معرف الجهاز الخاص بك.";
        }

        String? storedDeviceId = data['deviceId'];
        if (storedDeviceId == null || storedDeviceId.isEmpty) {
          // First time login -> Bind the device
          await _db.collection('users').doc(user.uid).update({
            'deviceId': currentDeviceId,
          });
        } else if (storedDeviceId != currentDeviceId) {
          // Device mismatch -> Block login
          await _auth.signOut();
          _setLoading(false);
          return "غير مسموح الدخول من هذا الجهاز. يرجى استخدام جهازك المسجل أو مراجعة الإدارة.";
        }

        _setLoading(false);
        // Check if password change is required
        bool isPasswordChanged = data['isPasswordChanged'] ?? false;
        if (!isPasswordChanged) {
          return "FORCE_PASSWORD_CHANGE";
        }
        
        return "SUCCESS";
      }
    } on FirebaseAuthException catch (e) {
      _setLoading(false);
      return e.message ?? "حدث خطأ أثناء تسجيل الدخول";
    } catch (e) {
      _setLoading(false);
      debugPrint("Login error: $e");
      return "حدث خطأ غير متوقع: $e";
    }
    _setLoading(false);
    return "خطأ غير معروف";
  }

  // Change Password Method
  Future<String?> changePassword(String newPassword) async {
    _setLoading(true);
    try {
      User? user = _auth.currentUser;
      if (user != null) {
        await user.updatePassword(newPassword);
        // Update Firestore flag
        await _db.collection('users').doc(user.uid).update({
          'isPasswordChanged': true,
        });
        _setLoading(false);
        return "SUCCESS";
      }
    } on FirebaseAuthException catch (e) {
      _setLoading(false);
      return e.message;
    }
    _setLoading(false);
    return "المستخدم غير مسجل الدخول.";
  }

  Future<void> logout() async {
    await _auth.signOut();
    notifyListeners();
  }
}
