import 'product.dart';
import 'routine_template.dart';

/// Paso de rutina para la UI (mock + futuro mapper desde [DayItem]).
class RoutineStep {
  const RoutineStep({
    required this.id,
    required this.name,
    this.productBrand,
    this.instructions,
    this.durationSeconds = 60,
    this.productId,
    this.stepTypeChip,
    this.isCompleted = false,
  });

  final String id;
  final String name;
  final String? productBrand;
  final String? instructions;
  final int durationSeconds;
  final String? productId;
  final String? stepTypeChip;
  final bool isCompleted;

  RoutineStep copyWith({bool? isCompleted}) {
    return RoutineStep(
      id: id,
      name: name,
      productBrand: productBrand,
      instructions: instructions,
      durationSeconds: durationSeconds,
      productId: productId,
      stepTypeChip: stepTypeChip,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }

  static RoutineStep fromDayItem(DayItem item, Map<String, Product> productsById, {required bool isCompleted}) {
    final p = item.productId != null ? productsById[item.productId!] : null;
    return RoutineStep(
      id: item.id,
      name: item.content,
      productBrand: p?.brand,
      instructions: item.instructions,
      durationSeconds: item.durationSeconds ?? 60,
      productId: item.productId,
      stepTypeChip: item.stepType,
      isCompleted: isCompleted,
    );
  }
}
