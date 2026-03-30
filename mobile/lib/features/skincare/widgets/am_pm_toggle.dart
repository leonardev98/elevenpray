import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../routine_slot.dart';

class AmPmToggle extends StatelessWidget {
  const AmPmToggle({
    super.key,
    required this.value,
    required this.onChanged,
  });

  final RoutineSlot value;
  final ValueChanged<RoutineSlot> onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _Segment(
            label: 'AM',
            selected: value == RoutineSlot.am,
            onTap: () => onChanged(RoutineSlot.am),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _Segment(
            label: 'PM',
            selected: value == RoutineSlot.pm,
            onTap: () => onChanged(RoutineSlot.pm),
          ),
        ),
      ],
    );
  }
}

class _Segment extends StatelessWidget {
  const _Segment({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Material(
      color: selected ? AppColors.gold.withValues(alpha: 0.12) : AppColors.surfaceSolid.withValues(alpha: 0.65),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(999),
        side: BorderSide(
          color: selected ? AppColors.gold.withValues(alpha: 0.55) : AppColors.borderSubtle,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 14),
          child: Center(
            child: Text(
              label,
              style: theme.textTheme.titleSmall?.copyWith(
                color: selected ? AppColors.gold : AppColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
