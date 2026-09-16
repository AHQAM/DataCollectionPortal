import 'dart:convert';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/sync/sync_action.dart';
import '../../../core/sync/sync_manager.dart';
import '../domain/form_field_model.dart';

part 'form_fields_repository.g.dart';

class FormFieldsRepository {
  final FirebaseFirestore _firestore;
  final SyncManager _syncManager;

  FormFieldsRepository(this._firestore, this._syncManager);

  /// Fetches the list of [FormFieldModel] for a given [activityId].
  Future<List<FormFieldModel>> getFieldsForActivity(String activityId) async {
    final snapshot = await _firestore
        .collection(AppConstants.requestFieldsCollection)
        .where('activityId', isEqualTo: activityId)
        .where('isActive', isEqualTo: true)
        .orderBy('orderIndex')
        .get();

    return snapshot.docs.map((doc) {
      final data = Map<String, dynamic>.from(doc.data());
      data['id'] = doc.id;
      return FormFieldModel.fromJson(data);
    }).toList();
  }

  /// Saves the filled form data for a request record, queued via [SyncManager]
  /// so it works offline.
  Future<void> saveFormRecord({
    required String requestId,
    required String activityId,
    required String regionNo,
    required Map<String, dynamic> formData,
  }) async {
    final docId = '${requestId}_$activityId';

    final payload = {
      'collection': AppConstants.recordsCollection,
      'docId': docId,
      'data': {
        'requestId': requestId,
        'activityId': activityId,
        'regionNo': regionNo,
        'formData': formData,
        'submittedAt': DateTime.now().toIso8601String(),
        'status': 'SUBMITTED',
      },
    };

    final action = SyncAction(
      id: docId,
      type: 'CREATE_RECORD',
      payload: jsonEncode(payload),
      retryCount: 0,
      createdAt: DateTime.now(),
    );

    await _syncManager.enqueueAction(action);
  }
}

@riverpod
FormFieldsRepository formFieldsRepository(Ref ref) {
  return FormFieldsRepository(
    FirebaseFirestore.instance,
    ref.watch(syncManagerProvider),
  );
}
