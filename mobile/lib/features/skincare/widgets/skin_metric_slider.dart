import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';

class SkinMetricSlider extends StatelessWidget {
  const SkinMetricSlider({
    super.key,
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.leftLabel,
    required this.rightLabel,
    required this.value,
    required this.onChanged,
  });

  final IconData icon;
  final Color iconColor;
  final String label;
  final String leftLabel;
  final String rightLabel;
  final double value;
  final ValueChanged<double> onChanged;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 20, color: iconColor),
            const SizedBox(width: 8),
            Expanded(child: Text(label, style: theme.textTheme.titleSmall)),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(leftLabel, style: theme.textTheme.labelSmall),
            ),
            Expanded(
              child: Text(
                rightLabel,
                style: theme.textTheme.labelSmall,
                textAlign: TextAlign.end,
              ),
            ),
          ],
        ),
        SliderTheme(
          data: SliderTheme.of(context).copyWith(
            activeTrackColor: AppColors.gold.withValues(alpha: 0.45),
            inactiveTrackColor: AppColors.borderMuted,
            thumbColor: AppColors.gold,
            overlayColor: AppColors.gold.withValues(alpha: 0.12),
            trackHeight: 4,
          ),
          child: Slider(
            value: value,
            min: 0,
            max: 1,
            onChanged: onChanged,
          ),
        ),
      ],
    );
  }
}
