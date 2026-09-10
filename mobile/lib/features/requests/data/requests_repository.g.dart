// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'requests_repository.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(requestsRepository)
final requestsRepositoryProvider = RequestsRepositoryProvider._();

final class RequestsRepositoryProvider extends $FunctionalProvider<
    RequestsRepository,
    RequestsRepository,
    RequestsRepository> with $Provider<RequestsRepository> {
  RequestsRepositoryProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'requestsRepositoryProvider',
          isAutoDispose: true,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$requestsRepositoryHash();

  @$internal
  @override
  $ProviderElement<RequestsRepository> $createElement(
          $ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  RequestsRepository create(Ref ref) {
    return requestsRepository(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(RequestsRepository value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<RequestsRepository>(value),
    );
  }
}

String _$requestsRepositoryHash() =>
    r'0916ab9cbaf60a264b0728bdbb8d37f45a83fbc1';
