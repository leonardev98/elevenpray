import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../widgets/mitsyy_floating_bottom_nav.dart';

/// [Stack] sin [Scaffold]: el fondo lo aporta [MitsyyAppBackground] en el builder de la app.
class MainShell extends StatelessWidget {
  const MainShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  static const _destinations = [
    MitsyyNavDestination(icon: LucideIcons.home, semanticsLabel: 'Inicio'),
    MitsyyNavDestination(icon: LucideIcons.sparkles, semanticsLabel: 'Skincare'),
    MitsyyNavDestination(icon: LucideIcons.compass, semanticsLabel: 'Explorar'),
    MitsyyNavDestination(icon: LucideIcons.menu, semanticsLabel: 'Más'),
  ];

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: Stack(
        fit: StackFit.expand,
        clipBehavior: Clip.none,
        children: [
          Positioned.fill(
            child: SafeArea(
              top: true,
              bottom: false,
              // Sin padding inferior: el scroll reserva espacio con MitsyyFloatingBottomNav.listPadding.
              child: navigationShell,
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: MitsyyFloatingBottomNav(
              currentIndex: navigationShell.currentIndex,
              destinations: _destinations,
              onDestinationSelected: (i) => navigationShell.goBranch(
                    i,
                    initialLocation: i == navigationShell.currentIndex,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}
