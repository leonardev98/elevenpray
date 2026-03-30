import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/mitsyy_card.dart';
import '../../../models/routine_step.dart';

class RoutineStepCard extends StatefulWidget {
  const RoutineStepCard({
    super.key,
    required this.step,
    required this.index,
    required this.onToggle,
    this.highlight = false,
  });

  final RoutineStep step;
  final int index;
  final VoidCallback onToggle;
  final bool highlight;

  @override
  State<RoutineStepCard> createState() => _RoutineStepCardState();
}

class _RoutineStepCardState extends State<RoutineStepCard> with SingleTickerProviderStateMixin {
  bool _expanded = false;
  late AnimationController _checkCtrl;

  @override
  void initState() {
    super.initState();
    _checkCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 320),
    );
    if (widget.step.isCompleted) {
      _checkCtrl.value = 1;
    }
  }

  @override
  void didUpdateWidget(covariant RoutineStepCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.step.isCompleted && !oldWidget.step.isCompleted) {
      _checkCtrl.forward(from: 0);
    }
    if (!widget.step.isCompleted && oldWidget.step.isCompleted) {
      _checkCtrl.reverse();
    }
  }

  @override
  void dispose() {
    _checkCtrl.dispose();
    super.dispose();
  }

  String _num(int i) => (i + 1).toString().padLeft(2, '0');

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final s = widget.step;
    final done = s.isCompleted;
    String instructionPreview = '';
    if (s.instructions != null && s.instructions!.isNotEmpty) {
      final t = s.instructions!;
      instructionPreview = _expanded || t.length <= 48 ? t : '${t.substring(0, 48)}…';
    }

    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: done ? 1 : 0),
      duration: const Duration(milliseconds: 240),
      curve: Curves.easeOutCubic,
      builder: (context, t, child) {
        return Opacity(
          opacity: done ? 0.5 + 0.15 * (1 - t) : 1.0,
          child: DecoratedBox(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppColors.radiusCard),
              border: widget.highlight
                  ? Border.all(color: AppColors.gold.withValues(alpha: 0.35), width: 1)
                  : null,
            ),
            child: child,
          ),
        );
      },
      child: MitsyyCard(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _num(widget.index),
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: AppColors.gold,
                    fontFamily: 'monospace',
                    fontSize: 13,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        s.name,
                        style: theme.textTheme.titleMedium?.copyWith(
                          decoration: done ? TextDecoration.lineThrough : null,
                          color: done ? theme.colorScheme.onSurfaceVariant : theme.colorScheme.onSurface,
                        ),
                      ),
                      if (s.productBrand != null)
                        Text(
                          s.productBrand!,
                          style: theme.textTheme.bodySmall?.copyWith(fontSize: 13),
                        ),
                    ],
                  ),
                ),
                GestureDetector(
                  onTap: () {
                    if (!done) HapticFeedback.mediumImpact();
                    widget.onToggle();
                  },
                  child: ScaleTransition(
                    scale: TweenSequence<double>([
                      TweenSequenceItem(tween: Tween(begin: 1, end: 1.25), weight: 40),
                      TweenSequenceItem(tween: Tween(begin: 1.25, end: 1), weight: 60),
                    ]).animate(CurvedAnimation(parent: _checkCtrl, curve: Curves.easeOut)),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: done ? AppColors.gold : Colors.transparent,
                        border: Border.all(
                          color: done ? AppColors.gold : AppColors.borderMuted,
                          width: 1.5,
                        ),
                      ),
                      child: done
                          ? Icon(Icons.check_rounded, size: 18, color: theme.colorScheme.onPrimary)
                          : null,
                    ),
                  ),
                ),
              ],
            ),
            if (s.instructions != null && s.instructions!.isNotEmpty) ...[
              const SizedBox(height: 10),
              InkWell(
                onTap: () => setState(() => _expanded = !_expanded),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        instructionPreview,
                        style: theme.textTheme.bodySmall,
                        maxLines: _expanded ? null : 2,
                        overflow: _expanded ? TextOverflow.visible : TextOverflow.ellipsis,
                      ),
                    ),
                    Icon(
                      _expanded ? Icons.expand_less : Icons.expand_more,
                      color: theme.colorScheme.onSurfaceVariant,
                      size: 20,
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 10),
            Align(
              alignment: Alignment.centerLeft,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: AppColors.borderMuted,
                ),
                child: Text(
                  '${s.durationSeconds}s',
                  style: theme.textTheme.labelSmall,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
