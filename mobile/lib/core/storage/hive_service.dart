import 'package:hive_flutter/hive_flutter.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'hive_service.g.dart';

class HiveService {
  static const String requestsBoxName = 'requestsBox';
  static const String recordsBoxName = 'recordsBox';
  static const String syncQueueBoxName = 'syncQueueBox';

  Future<void> init() async {
    // Open necessary boxes for the offline-first experience
    await Hive.openBox(requestsBoxName);
    await Hive.openBox(recordsBoxName);
    await Hive.openBox(syncQueueBoxName);
  }

  Box get requestsBox => Hive.box(requestsBoxName);
  Box get recordsBox => Hive.box(recordsBoxName);
  Box get syncQueueBox => Hive.box(syncQueueBoxName);

  Future<void> clearAll() async {
    await requestsBox.clear();
    await recordsBox.clear();
    await syncQueueBox.clear();
  }
}

@Riverpod(keepAlive: true)
HiveService hiveService(HiveServiceRef ref) {
  return HiveService();
}
