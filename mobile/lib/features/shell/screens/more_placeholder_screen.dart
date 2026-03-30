import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme_mode_notifier.dart';
import '../../../core/widgets/mitsyy_floating_bottom_nav.dart';
import '../../auth/providers/auth_session.dart';
import '../../home/providers/home_dashboard_notifier.dart';
import '../../workspace/providers/user_workspaces_notifier.dart';

/// Pestaña **Más**: apariencia global (estilo ajustes iOS/Material 3).
class MorePlaceholderScreen extends StatelessWidget {
  const MorePlaceholderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return ListView(
      padding: MitsyyFloatingBottomNav.listPadding(
        context,
        const EdgeInsets.fromLTRB(AppColors.horizontalMargin, 24, AppColors.horizontalMargin, 24),
      ),
      children: [
        Text(
          'Ajustes',
          style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 8),
        Text(
          'Personaliza cómo se ve Mitsyy en todas las pantallas.',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 28),
        Text(
          'APARIENCIA',
          style: theme.textTheme.labelSmall?.copyWith(
            letterSpacing: 0.8,
            fontWeight: FontWeight.w600,
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 12),
        Consumer<AppThemeModeNotifier>(
          builder: (context, notifier, _) {
            return Material(
              color: Colors.transparent,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(AppColors.radiusCard),
                  border: Border.all(color: theme.colorScheme.outline.withValues(alpha: 0.35)),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.palette_outlined,
                            size: 22,
                            color: theme.colorScheme.primary,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Tema',
                              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Claro, oscuro o el mismo que el sistema.',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 16),
                      SegmentedButton<AppAppearancePreference>(
                        segments: const [
                          ButtonSegment<AppAppearancePreference>(
                            value: AppAppearancePreference.system,
                            icon: Icon(Icons.brightness_auto_rounded, size: 18),
                            label: Text('Auto'),
                          ),
                          ButtonSegment<AppAppearancePreference>(
                            value: AppAppearancePreference.light,
                            icon: Icon(Icons.light_mode_rounded, size: 18),
                            label: Text('Claro'),
                          ),
                          ButtonSegment<AppAppearancePreference>(
                            value: AppAppearancePreference.dark,
                            icon: Icon(Icons.dark_mode_rounded, size: 18),
                            label: Text('Oscuro'),
                          ),
                        ],
                        selected: {notifier.preference},
                        onSelectionChanged: (set) {
                          if (set.isEmpty) return;
                          notifier.setPreference(set.first);
                        },
                        showSelectedIcon: false,
                        style: ButtonStyle(
                          padding: WidgetStateProperty.all(
                            const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
        const SizedBox(height: 28),
        Text(
          'CUENTA',
          style: theme.textTheme.labelSmall?.copyWith(
            letterSpacing: 0.8,
            fontWeight: FontWeight.w600,
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 12),
        ListTile(
          contentPadding: EdgeInsets.zero,
          leading: Icon(Icons.sync_rounded, color: theme.colorScheme.primary),
          title: const Text('Sincronizar workspaces'),
          subtitle: const Text('Vuelve a cargar la lista desde el servidor'),
          trailing: const Icon(Icons.chevron_right_rounded),
          onTap: () async {
            final ws = context.read<UserWorkspacesNotifier>();
            final dash = context.read<HomeDashboardNotifier>();
            await ws.refresh();
            await dash.refresh();
            if (context.mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Sincronizado')),
              );
            }
          },
        ),
        ListTile(
          contentPadding: EdgeInsets.zero,
          leading: Icon(Icons.logout_rounded, color: theme.colorScheme.error),
          title: Text('Cerrar sesión', style: TextStyle(color: theme.colorScheme.error)),
          onTap: () async {
            await context.read<AuthSession>().logout();
            if (context.mounted) context.go('/login');
          },
        ),
        const SizedBox(height: 32),
        Icon(
          Icons.construction_outlined,
          size: 40,
          color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.5),
        ),
        const SizedBox(height: 12),
        Text(
          'Más opciones pronto',
          style: theme.textTheme.titleMedium,
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
