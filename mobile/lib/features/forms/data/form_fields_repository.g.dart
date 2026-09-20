// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'form_fields_repository.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(formFieldsRepository)
final formFieldsRepositoryProvider = FormFieldsRepositoryProvider._();

final class FormFieldsRepositoryProvider
    extends
        $FunctionalProvider<
          FormFieldsRepository,
          FormFieldsRepository,
          FormFieldsRepository
        >
    with $Provider<FormFieldsRepository> {
  FormFieldsRepositoryProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'formFieldsRepositoryProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$formFieldsRepositoryHash();

  @$internal
  @override
  $ProviderElement<FormFieldsRepository> $createElement(
    $ProviderPointer pointer,
  ) => $ProviderElement(pointer);

  @override
  FormFieldsRepository create(Ref ref) {
    return formFieldsRepository(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(FormFieldsRepository value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<FormFieldsRepository>(value),
    );
  }
}

String _$formFieldsRepositoryHash() =>
    r'3256d9f037935d1fd9a8026d36f6b8f2f775986f';
