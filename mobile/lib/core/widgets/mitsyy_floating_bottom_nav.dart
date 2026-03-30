import 'package:flutter/material.dart';

import '../theme/workspace_dashboard_tokens.dart';

/// Destino de la barra inferior (íconos Lucide u otros [IconData]).
class MitsyyNavDestination {
  const MitsyyNavDestination({required this.icon, this.semanticsLabel});

  final IconData icon;
  final String? semanticsLabel;
}

/// Barra inferior a ancho completo; estilo Instagram (línea superior fina, superficie plana).
class MitsyyFloatingBottomNav extends StatelessWidget {
  const MitsyyFloatingBottomNav({
    super.key,
    required this.currentIndex,
    required this.onDestinationSelected,
    required this.destinations,
    this.barHeight = _kBarHeight,
    this.iconSize = _kIconSize,
  }) : assert(destinations.length >= 2);

  final int currentIndex;
  final ValueChanged<int> onDestinationSelected;
  final List<MitsyyNavDestination> destinations;

  final double barHeight;

  final double iconSize;

  static const double _kBarHeight = 49;
  static const double _kIconSize = 24;

  static const Color _hairlineLight = Color(0xFFDBDBDB);
  static const Color _inactiveIconLight = Color(0xFF8E8E8E);

  static double reservedBottomInset(BuildContext context) {
    return _kBarHeight + MediaQuery.paddingOf(context).bottom;
  }

  static EdgeInsets listPadding(BuildContext context, EdgeInsets base) {
    return EdgeInsets.fromLTRB(
      base.left,
      base.top,
      base.right,
      base.bottom + reservedBottomInset(context),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.paddingOf(context).bottom;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final surface = isDark ? WorkspaceDashboardTokens.bgPrimary : Colors.white;
    final hairline = isDark ? WorkspaceDashboardTokens.outlineDark : _hairlineLight;
    final selectedIcon = isDark ? WorkspaceDashboardTokens.textPrimary : Colors.black;
    final inactiveIcon = isDark ? WorkspaceDashboardTokens.textMuted : _inactiveIconLight;
    final indicator = Theme.of(context).colorScheme.primary;

    return Material(
      color: surface,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            height: barHeight,
            decoration: BoxDecoration(
              color: surface,
              border: Border(
                top: BorderSide(color: hairline, width: 0.5),
              ),
              boxShadow: null,
            ),
            child: Row(
              children: [
                for (var i = 0; i < destinations.length; i++)
                  Expanded(
                    child: _NavIcon(
                      index: i,
                      currentIndex: currentIndex,
                      destination: destinations[i],
                      barHeight: barHeight,
                      iconSize: iconSize,
                      selectedColor: selectedIcon,
                      inactiveColor: inactiveIcon,
                      indicatorColor: indicator,
                      isDark: isDark,
                      onTap: () => onDestinationSelected(i),
                    ),
                  ),
              ],
            ),
          ),
          if (bottomInset > 0)
            ColoredBox(
              color: surface,
              child: SizedBox(height: bottomInset),
            ),
        ],
      ),
    );
  }
}

class _NavIcon extends StatelessWidget {
  const _NavIcon({
    required this.index,
    required this.currentIndex,
    required this.destination,
    required this.barHeight,
    required this.iconSize,
    required this.selectedColor,
    required this.inactiveColor,
    required this.indicatorColor,
    required this.isDark,
    required this.onTap,
  });

  final int index;
  final int currentIndex;
  final MitsyyNavDestination destination;
  final double barHeight;
  final double iconSize;
  final Color selectedColor;
  final Color inactiveColor;
  final Color indicatorColor;
  final bool isDark;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final selected = index == currentIndex;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        splashColor: indicatorColor.withValues(alpha: isDark ? 0.14 : 0.08),
        highlightColor: indicatorColor.withValues(alpha: isDark ? 0.08 : 0.04),
        child: Semantics(
          button: true,
          selected: selected,
          label: destination.semanticsLabel,
          child: SizedBox(
            height: barHeight,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  destination.icon,
                  size: iconSize,
                  color: selected ? selectedColor : inactiveColor,
                ),
                const SizedBox(height: 4),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  curve: Curves.easeOutCubic,
                  width: selected ? 22 : 0,
                  height: 2,
                  decoration: BoxDecoration(
                    color: indicatorColor,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
