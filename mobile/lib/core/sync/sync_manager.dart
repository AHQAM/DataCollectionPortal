import 'package:firebase_core/firebase_core.dart';
import 'dart:convert';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'package:flutter/foundation.dart';

import '../network/network_info.dart';
import '../storage/hive_service.dart';
import 'sync_action.dart';
import 'package:cloud_functions/cloud_functions.dart';

part 'sync_manager.g.dart';

class SyncManager {
  final HiveService _hiveService;
  final NetworkInfo _networkInfo;
  final FirebaseFirestore _firestore;

  bool _isSyncing = false;

  SyncManager(this._hiveService, this._networkInfo, this._firestore) {
    _init();
  }

  void _init() {
    _networkInfo.onConnectivityChanged.listen((isConnected) {
      if (isConnected) {
        _processQueue();
      }
    });
  }

  Future<void> enqueueAction(SyncAction action) async {
    final box = _hiveService.syncQueueBox;
    await box.put(action.id, jsonEncode(action.toJson()));

    // Attempt to sync immediately if online
    if (await _networkInfo.isConnected) {
      _processQueue();
    }
  }

  static const int maxRetries = 5;

  Future<void> _processQueue() async {
    if (_isSyncing) return;
    _isSyncing = true;

    try {
      final box = _hiveService.syncQueueBox;
      final keys = box.keys.toList();

      for (final key in keys) {
        final jsonString = box.get(key) as String?;
        if (jsonString == null) continue;

        final action = SyncAction.fromJson(jsonDecode(jsonString));

        if (action.retryCount >= maxRetries) {
          debugPrint(
            'Action ${action.id} exceeded max retries. Removing from active queue.',
          );
          await box.delete(key);
          continue;
        }

        bool success = await _executeAction(action);

        if (success) {
          await box.delete(key);
        } else {
          final nextRetry = action.retryCount + 1;
          if (nextRetry >= maxRetries) {
            debugPrint(
              'Action ${action.id} reached max retries ($maxRetries). Removing from active queue.',
            );
            await box.delete(key);
          } else {
            final updatedAction = action.copyWith(retryCount: nextRetry);
            await box.put(key, jsonEncode(updatedAction.toJson()));
          }
        }
      }
    } finally {
      _isSyncing = false;
    }
  }

  Future<bool> _executeAction(SyncAction action) async {
    try {
      final payload = jsonDecode(action.payload) as Map<String, dynamic>;

      switch (action.type) {
        case 'SUBMIT_RESPONSE':
          final callable = FirebaseFunctions.instanceFor(
            region: 'us-central1',
          ).httpsCallable('submitResponse');
          await callable.call(<String, dynamic>{
            'requestId': payload['data']['requestId'],
            'recordId': payload['data']['recordId'],
            'activityId': payload['data']['activityId'],
            'formData': payload['data']['formData'],
            'submittedAt': payload['data']['submittedAt'],
          });
          return true;

        case 'CREATE_RECORD':
          final collection = payload['collection'] as String;
          final docId = payload['docId'] as String?;
          final data = payload['data'] as Map<String, dynamic>;
          if (docId != null) {
            await _firestore.collection(collection).doc(docId).set(data);
          } else {
            await _firestore.collection(collection).add(data);
          }
          return true;

        case 'UPDATE_DOCUMENT':
          final collection = payload['collection'] as String;
          final docId = payload['docId'] as String;
          final data = payload['data'] as Map<String, dynamic>;

          await _firestore.collection(collection).doc(docId).update(data);
          return true;

        default:
          debugPrint('Unknown sync action type: ${action.type}');
          return true; // Mark as true to discard unknown actions
      }
    } on FirebaseFunctionsException catch (e) {
      if (e.code == 'permission-denied' ||
          e.code == 'invalid-argument' ||
          e.code == 'failed-precondition') {
        debugPrint('Permanent sync failure for ${action.id}: ${e.code}');
        return true;
      }
      debugPrint('Retryable sync failure ${action.id}: ${e.code}');
      return false;
    } catch (e) {
      debugPrint('Failed to execute sync action ${action.id}: $e');
      return false; // Will retry
    }
  }
}

@Riverpod(keepAlive: true)
SyncManager syncManager(Ref ref) {
  return SyncManager(
    ref.watch(hiveServiceProvider),
    ref.watch(networkInfoProvider),
    FirebaseFirestore.instanceFor(
      app: Firebase.app(),
      databaseId: 'datacollectionportal',
    ),
  );
}
