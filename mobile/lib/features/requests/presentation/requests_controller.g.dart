// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'requests_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(myRequests)
final myRequestsProvider = MyRequestsProvider._();

final class MyRequestsProvider extends $FunctionalProvider<
        AsyncValue<List<RequestModel>>,
        List<RequestModel>,
        Stream<List<RequestModel>>>
    with
        $FutureModifier<List<RequestModel>>,
        $StreamProvider<List<RequestModel>> {
  MyRequestsProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'myRequestsProvider',
          isAutoDispose: true,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$myRequestsHash();

  @$internal
  @override
  $StreamProviderElement<List<RequestModel>> $createElement(
          $ProviderPointer pointer) =>
      $StreamProviderElement(pointer);

  @override
  Stream<List<RequestModel>> create(Ref ref) {
    return myRequests(ref);
  }
}

String _$myRequestsHash() => r'1e65481e7f5b3b82acad3e2e8fb083dbda292e12';
