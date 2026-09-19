import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/request_model.dart';
import '../domain/record_model.dart';
import '../data/requests_repository.dart';
import '../../auth/presentation/auth_controller.dart';

part 'requests_controller.g.dart';

@riverpod
Stream<List<RequestModel>> myRequests(Ref ref) {
  final user = ref.watch(authControllerProvider).value;

  if (user == null) {
    return const Stream.empty();
  }

  final repository = ref.watch(requestsRepositoryProvider);
  return repository.watchMyRequests(user.uid);
}

final requestRecordsProvider = StreamProvider.family<List<RecordModel>, String>(
  (ref, requestId) {
    final user = ref.watch(authControllerProvider).value;
    if (user == null) {
      return const Stream.empty();
    }
    final repository = ref.watch(requestsRepositoryProvider);
    return repository.watchRecordsForRequest(requestId, user.uid);
  },
);
