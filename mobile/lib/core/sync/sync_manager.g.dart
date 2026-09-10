// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'sync_manager.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(syncManager)
final syncManagerProvider = SyncManagerProvider._();

final class SyncManagerProvider
    extends $FunctionalProvider<SyncManager, SyncManager, SyncManager>
    with $Provider<SyncManager> {
  SyncManagerProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'syncManagerProvider',
          isAutoDispose: false,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$syncManagerHash();

  @$internal
  @override
  $ProviderElement<SyncManager> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  SyncManager create(Ref ref) {
    return syncManager(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(SyncManager value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<SyncManager>(value),
    );
  }
}

String _$syncManagerHash() => r'2005aa2294fd9e46e6902ef92246d0e649be6d88';
