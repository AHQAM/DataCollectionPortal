import 'dart:convert';
import 'dart:math';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'hive_service.g.dart';

class HiveService {
  static const String requestsBoxName = 'requestsBox';
  static const String recordsBoxName = 'recordsBox';
  static const String syncQueueBoxName = 'syncQueueBox';
  static const String failedSyncQueueBoxName = 'failedSyncQueueBox';

  static const String _encryptionKeyName = 'hive_encryption_key';
  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage();

  Future<void> init() async {
    final encryptionKey = await _loadOrCreateEncryptionKey();
    final cipher = HiveAesCipher(encryptionKey);

    await Hive.openBox(requestsBoxName, encryptionCipher: cipher);
    await Hive.openBox(recordsBoxName, encryptionCipher: cipher);
    await Hive.openBox(syncQueueBoxName, encryptionCipher: cipher);
    await Hive.openBox(failedSyncQueueBoxName, encryptionCipher: cipher);
  }

  Future<List<int>> _loadOrCreateEncryptionKey() async {
    final storedKey = await _secureStorage.read(key: _encryptionKeyName);
    if (storedKey != null) {
      return base64Url.decode(storedKey);
    }

    final key = List<int>.generate(32, (_) => Random.secure().nextInt(256));
    await _secureStorage.write(
      key: _encryptionKeyName,
      value: base64UrlEncode(key),
    );
    return key;
  }

  Box get requestsBox => Hive.box(requestsBoxName);
  Box get recordsBox => Hive.box(recordsBoxName);
  Box get syncQueueBox => Hive.box(syncQueueBoxName);
  Box get failedSyncQueueBox => Hive.box(failedSyncQueueBoxName);

  Future<void> clearAll() async {
    await requestsBox.clear();
    await recordsBox.clear();
    await syncQueueBox.clear();
    await failedSyncQueueBox.clear();
  }
}

@Riverpod(keepAlive: true)
HiveService hiveService(Ref ref) {
  return HiveService();
}
