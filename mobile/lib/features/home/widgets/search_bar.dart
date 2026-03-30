import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../../core/theme/dashboard_theme_ext.dart';
import '../../../core/theme/workspace_dashboard_tokens.dart';

class DashboardSearchBar extends StatefulWidget {
  const DashboardSearchBar({super.key, this.controller, this.hintText = 'Buscar tarea…'});

  final TextEditingController? controller;
  final String hintText;

  @override
  State<DashboardSearchBar> createState() => _DashboardSearchBarState();
}

class _DashboardSearchBarState extends State<DashboardSearchBar> {
  late final TextEditingController _c = widget.controller ?? TextEditingController();

  @override
  void dispose() {
    if (widget.controller == null) {
      _c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: context.dashGlassBase,
        borderRadius: BorderRadius.circular(WorkspaceDashboardTokens.radiusSearch),
        border: Border.all(color: context.dashGlassBorder),
        boxShadow: dark ? null : WorkspaceDashboardTokens.shadowCardLight,
      ),
      child: TextField(
        controller: widget.controller ?? _c,
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: context.dashTextPrimary,
            ),
        cursorColor: WorkspaceDashboardTokens.uniPrimary,
        decoration: InputDecoration(
          isDense: true,
          hintText: widget.hintText,
          hintStyle: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: context.dashTextMuted,
              ),
          prefixIcon: Icon(LucideIcons.search, size: 20, color: context.dashTextSecondary),
          suffixIcon: ValueListenableBuilder<TextEditingValue>(
            valueListenable: widget.controller ?? _c,
            builder: (context, value, _) {
              if (value.text.isEmpty) return const SizedBox.shrink();
              return IconButton(
                visualDensity: VisualDensity.compact,
                icon: Icon(LucideIcons.x, size: 18, color: context.dashTextSecondary),
                onPressed: () => (widget.controller ?? _c).clear(),
              );
            },
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 14),
        ),
      ),
    );
  }
}
