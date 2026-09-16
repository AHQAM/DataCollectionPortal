// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'form_fields_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Fetches the form fields for a given activityId from Firestore.

@ProviderFor(formFields)
final formFieldsProvider = FormFieldsFamily._();

/// Fetches the form fields for a given activityId from Firestore.

final class FormFieldsProvider
    extends
        $FunctionalProvider<
          AsyncValue<List<FormFieldModel>>,
          List<FormFieldModel>,
          FutureOr<List<FormFieldModel>>
        >
    with
        $FutureModifier<List<FormFieldModel>>,
        $FutureProvider<List<FormFieldModel>> {
  /// Fetches the form fields for a given activityId from Firestore.
  FormFieldsProvider._({
    required FormFieldsFamily super.from,
    required String super.argument,
  }) : super(
         retry: null,
         name: r'formFieldsProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$formFieldsHash();

  @override
  String toString() {
    return r'formFieldsProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  $FutureProviderElement<List<FormFieldModel>> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<List<FormFieldModel>> create(Ref ref) {
    final argument = this.argument as String;
    return formFields(ref, argument);
  }

  @override
  bool operator ==(Object other) {
    return other is FormFieldsProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$formFieldsHash() => r'7570eed0dfe65b9b34fdfb934b8a14da44a7bb1d';

/// Fetches the form fields for a given activityId from Firestore.

final class FormFieldsFamily extends $Family
    with $FunctionalFamilyOverride<FutureOr<List<FormFieldModel>>, String> {
  FormFieldsFamily._()
    : super(
        retry: null,
        name: r'formFieldsProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  /// Fetches the form fields for a given activityId from Firestore.

  FormFieldsProvider call(String activityId) =>
      FormFieldsProvider._(argument: activityId, from: this);

  @override
  String toString() => r'formFieldsProvider';
}

/// Saves form data for a request, using the currently logged-in user's regionNo.

@ProviderFor(FormSubmitController)
final formSubmitControllerProvider = FormSubmitControllerProvider._();

/// Saves form data for a request, using the currently logged-in user's regionNo.
final class FormSubmitControllerProvider
    extends $NotifierProvider<FormSubmitController, AsyncValue<void>> {
  /// Saves form data for a request, using the currently logged-in user's regionNo.
  FormSubmitControllerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'formSubmitControllerProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$formSubmitControllerHash();

  @$internal
  @override
  FormSubmitController create() => FormSubmitController();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(AsyncValue<void> value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<AsyncValue<void>>(value),
    );
  }
}

String _$formSubmitControllerHash() =>
    r'582288d0cef1b7565376ada7d5c94d27745d42fa';

/// Saves form data for a request, using the currently logged-in user's regionNo.

abstract class _$FormSubmitController extends $Notifier<AsyncValue<void>> {
  AsyncValue<void> build();
  @$mustCallSuper
  @override
  WhenComplete runBuild() {
    final ref = this.ref as $Ref<AsyncValue<void>, AsyncValue<void>>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<void>, AsyncValue<void>>,
              AsyncValue<void>,
              Object?,
              Object?
            >;
    return element.handleCreate(ref, build);
  }
}
