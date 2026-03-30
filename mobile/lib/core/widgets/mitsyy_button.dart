import 'package:flutter/material.dart';

enum MitsyyButtonVariant { primary, secondaryOutline }

class MitsyyButton extends StatelessWidget {
  const MitsyyButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.expanded = false,
    this.variant = MitsyyButtonVariant.primary,
    this.icon,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool expanded;
  final MitsyyButtonVariant variant;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final child = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (icon != null) ...[
          Icon(icon, size: 20),
          const SizedBox(width: 8),
        ],
        Text(label),
      ],
    );

    final Widget button;
    switch (variant) {
      case MitsyyButtonVariant.primary:
        button = ElevatedButton(onPressed: onPressed, child: child);
      case MitsyyButtonVariant.secondaryOutline:
        button = OutlinedButton(
          onPressed: onPressed,
          style: OutlinedButton.styleFrom(
            foregroundColor: cs.onSurface,
            side: BorderSide(color: cs.outline.withValues(alpha: 0.55)),
          ),
          child: child,
        );
    }

    if (expanded) {
      return SizedBox(width: double.infinity, child: button);
    }
    return button;
  }
}
