import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../auth/presentation/auth_controller.dart';
import '../data/form_fields_repository.dart';
import '../domain/form_field_model.dart';

part 'form_fields_controller.g.dart';

/// Fetches the form fields for a given activityId from Firestore.
@riverpod
Future<List<FormFieldModel>> formFields(Ref ref, String activityId) {
  final repository = ref.watch(formFieldsRepositoryProvider);
  return repository.getFieldsForActivity(activityId);
}

/// Saves form data for a request, using the currently logged-in user's regionNo.
@riverpod
class FormSubmitController extends _$FormSubmitController {
  @override
  AsyncValue<void> build() => const AsyncData(null);

  Future<void> save({
    required String requestId,
    required String recordId,
    required String activityId,
    required Map<String, dynamic> formData,
  }) async {
    state = const AsyncLoading();

    final user = ref.read(authControllerProvider).value;
    if (user == null) {
      state = AsyncError('المستخدم غير مسجّل الدخول', StackTrace.current);
      return;
    }

    state = await AsyncValue.guard(() async {
      await ref
          .read(formFieldsRepositoryProvider)
          .saveFormRecord(
            requestId: requestId,
            recordId: recordId,
            activityId: activityId,
            regionNo: user.regionNo,
            formData: formData,
          );
    });
  }
}
