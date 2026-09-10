// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'hive_service.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(hiveService)
final hiveServiceProvider = HiveServiceProvider._();

final class HiveServiceProvider
    extends $FunctionalProvider<HiveService, HiveService, HiveService>
    with $Provider<HiveService> {
  HiveServiceProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'hiveServiceProvider',
          isAutoDispose: false,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$hiveServiceHash();

  @$internal
  @override
  $ProviderElement<HiveService> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  HiveService create(Ref ref) {
    return hiveService(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(HiveService value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<HiveService>(value),
    );
  }
}

String _$hiveServiceHash() => r'736c4ce10a0f18e71445b2cae3c365a50f24d1d0';
