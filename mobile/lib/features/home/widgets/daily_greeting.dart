import 'package:animate_do/animate_do.dart';
import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/date_formatting.dart';
import '../../../core/utils/greeting_icons.dart';
import '../../../models/user.dart';

class DailyGreeting extends StatelessWidget {
  const DailyGreeting({super.key, required this.user});

  final User user;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final now = DateTime.now();
    final hour = now.hour;
    final g = getContextualGreeting(hour);
    final icon = greetingIconForHour(hour);
    final dateStr = formatWeekdayDayMonthEs(now);

    return FadeInUp(
      duration: const Duration(milliseconds: 240),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  '$g, ${user.name}',
                  style: theme.textTheme.headlineSmall,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Icon(icon, size: 26, color: AppColors.gold.withValues(alpha: 0.9)),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            dateStr,
            style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}
