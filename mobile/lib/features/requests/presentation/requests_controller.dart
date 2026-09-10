import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../domain/request_model.dart';
import '../data/requests_repository.dart';
import '../../auth/presentation/auth_controller.dart';

part 'requests_controller.g.dart';

@riverpod
Stream<List<RequestModel>> myRequests(MyRequestsRef ref) {
  final user = ref.watch(authControllerProvider).value;

  if (user == null) {
    return const Stream.empty();
  }

  final repository = ref.watch(requestsRepositoryProvider);
  return repository.watchMyRequests(user.regionNo);
}
