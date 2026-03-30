import 'package:animate_do/animate_do.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../../core/theme/dashboard_theme_ext.dart';
import '../../../core/widgets/workspace_glass_card.dart';
import '../models/dashboard_task.dart';

class StatCard extends StatefulWidget {
  const StatCard({
    super.key,
    required this.stat,
    required this.accentColor,
    required this.glowShadows,
    this.animationDelay = Duration.zero,
  });

  final DashboardStat stat;
  final Color accentColor;
  final List<BoxShadow> glowShadows;
  final Duration animationDelay;

  @override
  State<StatCard> createState() => _StatCardState();
}

class _StatCardState extends State<StatCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return FadeInUp(
      delay: widget.animationDelay,
      duration: const Duration(milliseconds: 420),
      child: GestureDetector(
        onTapDown: (_) => setState(() => _pressed = true),
        onTapUp: (_) => setState(() => _pressed = false),
        onTapCancel: () => setState(() => _pressed = false),
        child: AnimatedScale(
          scale: _pressed ? 0.98 : 1,
          duration: const Duration(milliseconds: 120),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            curve: Curves.easeOutCubic,
            transform: Matrix4.translationValues(0, _pressed ? 0 : -2, 0),
            child: WorkspaceGlassCard(
              padding: const EdgeInsets.fromLTRB(16, 14, 12, 14),
              extraShadows: widget.glowShadows,
              borderColor: widget.accentColor.withValues(alpha: 0.25),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(widget.stat.icon, size: 22, color: widget.accentColor.withValues(alpha: 0.9)),
                      const Spacer(),
                      Icon(LucideIcons.arrowUpRight, size: 18, color: widget.accentColor.withValues(alpha: 0.85)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    widget.stat.displayValue,
                    style: theme.textTheme.displaySmall?.copyWith(
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      color: context.dashTextPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    widget.stat.title,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: context.dashTextSecondary,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
