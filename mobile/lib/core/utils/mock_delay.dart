import 'package:flutter/foundation.dart';

/// Activa con: `flutter run --dart-define=SIMULATE_SLOW_NETWORK=true`
/// para probar skeletons / estados de carga con latencia ficticia.
const bool kSimulateSlowNetwork = bool.fromEnvironment(
  'SIMULATE_SLOW_NETWORK',
  defaultValue: false,
);

/// En **release** y en debug normal: sin espera (datos mock al instante).
/// Solo espera si [kSimulateSlowNetwork] es true (útil para diseñar loading UI).
Future<T> withMockDelay<T>(
  Future<T> Function() fn, {
  Duration delay = const Duration(milliseconds: 400),
}) async {
  if (kDebugMode && kSimulateSlowNetwork && delay > Duration.zero) {
    await Future<void>.delayed(delay);
  }
  return fn();
}
