import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:hive/hive.dart';

import 'package:mobile/core/storage/hive_service.dart';
import 'package:mobile/core/network/network_info.dart';
import 'package:mobile/core/sync/sync_manager.dart';
import 'package:mobile/core/sync/sync_action.dart';

class MockHiveService extends Mock implements HiveService {}

class MockNetworkInfo extends Mock implements NetworkInfo {}

class MockFirebaseFirestore extends Mock implements FirebaseFirestore {}

class MockBox<E> extends Mock implements Box<E> {}

// ignore: subtype_of_sealed_class
class MockCollectionReference<T extends Object?> extends Mock
    implements CollectionReference<T> {}

// ignore: subtype_of_sealed_class
class MockDocumentReference<T extends Object?> extends Mock
    implements DocumentReference<T> {}

void main() {
  late MockHiveService mockHiveService;
  late MockNetworkInfo mockNetworkInfo;
  late MockFirebaseFirestore mockFirestore;
  late MockBox<String> mockBox;
  late MockBox<String> failedBox;
  late SyncManager syncManager;

  setUp(() {
    mockHiveService = MockHiveService();
    mockNetworkInfo = MockNetworkInfo();
    mockFirestore = MockFirebaseFirestore();
    mockBox = MockBox<String>();
    failedBox = MockBox<String>();

    when(() => mockHiveService.syncQueueBox).thenReturn(mockBox);
    when(() => mockHiveService.failedSyncQueueBox).thenReturn(failedBox);
    when(
      () => mockNetworkInfo.onConnectivityChanged,
    ).thenAnswer((_) => Stream.value(false));
    when(() => mockNetworkInfo.isConnected).thenAnswer((_) async => false);

    syncManager = SyncManager(mockHiveService, mockNetworkInfo, mockFirestore);
  });

  test('enqueueAction saves to hive', () async {
    final action = SyncAction(
      id: 'test_id',
      type: 'CREATE_RECORD',
      payload: '{"collection": "records", "data": {"key": "value"}}',
      createdAt: DateTime.now(),
    );

    when(() => mockBox.put(any(), any())).thenAnswer((_) async => {});

    await syncManager.enqueueAction(action);

    verify(() => mockBox.put(action.id, jsonEncode(action.toJson()))).called(1);
  });

  test('enqueueAction attempts to sync if online', () async {
    when(() => mockNetworkInfo.isConnected).thenAnswer((_) async => true);

    // Setup queue iteration mocks
    when(() => mockBox.keys).thenReturn(['test_id']);

    final action = SyncAction(
      id: 'test_id',
      type: 'CREATE_RECORD',
      payload: '{"collection": "records", "data": {"key": "value"}}',
      createdAt: DateTime.now(),
    );

    when(() => mockBox.get('test_id')).thenReturn(jsonEncode(action.toJson()));
    when(() => mockBox.put(any(), any())).thenAnswer((_) async => {});
    when(() => mockBox.delete(any())).thenAnswer((_) async => {});

    // Setup firestore mocks
    final mockCollection = MockCollectionReference<Map<String, dynamic>>();
    final mockDoc = MockDocumentReference<Map<String, dynamic>>();

    when(() => mockFirestore.collection('records')).thenReturn(mockCollection);
    when(() => mockCollection.add(any())).thenAnswer((_) async => mockDoc);

    await syncManager.enqueueAction(action);
    await Future.delayed(
      const Duration(milliseconds: 50),
    ); // wait for _processQueue

    verify(() => mockBox.put(action.id, any())).called(1); // the initial put
    verify(() => mockFirestore.collection('records')).called(1);
    verify(() => mockBox.delete('test_id')).called(1);
  });

  test(
    'moves exhausted actions to the failed queue instead of deleting them',
    () async {
      when(() => mockNetworkInfo.isConnected).thenAnswer((_) async => true);
      final action = SyncAction(
        id: 'failed_id',
        type: 'CREATE_RECORD',
        payload: '{"collection": "records", "data": {"key": "value"}}',
        createdAt: DateTime.now(),
        retryCount: SyncManager.maxRetries,
      );

      when(() => mockBox.put(any(), any())).thenAnswer((_) async => {});
      when(() => mockBox.keys).thenReturn(['failed_id']);
      when(
        () => mockBox.get('failed_id'),
      ).thenReturn(jsonEncode(action.toJson()));
      when(() => mockBox.delete('failed_id')).thenAnswer((_) async => {});
      when(() => failedBox.put(any(), any())).thenAnswer((_) async => {});

      await syncManager.enqueueAction(action);
      await Future<void>.delayed(const Duration(milliseconds: 50));

      verify(() => failedBox.put('failed_id', any())).called(1);
      verify(() => mockBox.delete('failed_id')).called(1);
    },
  );
}
