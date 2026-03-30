import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/icons/workspace_icon.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/mock_delay.dart';
import '../../../core/widgets/mitsyy_card.dart';
import '../../../core/widgets/mitsyy_floating_bottom_nav.dart';
import '../../../core/widgets/mitsyy_skeleton.dart';
import '../../../models/catalog_workspace.dart';
import '../../home/providers/home_dashboard_notifier.dart';
import '../../workspace/providers/user_workspaces_notifier.dart';
import '../mock/explore_mock.dart';

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  late final Future<Map<String, List<CatalogWorkspace>>> _future;

  @override
  void initState() {
    super.initState();
    _future = withMockDelay(fetchExploreCatalog);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        leading: context.canPop()
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => context.pop(),
              )
            : null,
        title: Text('Descubrir Workspaces', style: theme.textTheme.titleLarge),
      ),
      body: FutureBuilder<Map<String, List<CatalogWorkspace>>>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return ListView(
              padding: MitsyyFloatingBottomNav.listPadding(
                context,
                const EdgeInsets.all(AppColors.horizontalMargin),
              ),
              children: const [
                MitsyySkeleton(height: 100),
                SizedBox(height: 16),
                MitsyySkeleton(height: 100),
                SizedBox(height: 16),
                MitsyySkeleton(height: 100),
              ],
            );
          }
          final sections = snapshot.data!;
          return ListView(
            padding: MitsyyFloatingBottomNav.listPadding(
              context,
              const EdgeInsets.fromLTRB(
                AppColors.horizontalMargin,
                0,
                AppColors.horizontalMargin,
                24,
              ),
            ),
            children: [
              Text(
                'Espacios curados para cada parte de tu vida',
                style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 16),
              Consumer2<UserWorkspacesNotifier, HomeDashboardNotifier>(
                builder: (context, ws, dash, _) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        ws.hasWorkspaces
                            ? '${ws.workspaces.length} workspace(s) en tu cuenta'
                            : 'Inicia sesión y sincroniza para ver tus workspaces reales.',
                        style: theme.textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 10),
                      FilledButton.tonalIcon(
                        onPressed: ws.loading
                            ? null
                            : () async {
                                await ws.refresh();
                                await dash.refresh();
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Lista actualizada')),
                                  );
                                }
                              },
                        icon: ws.loading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Icon(Icons.sync_rounded, size: 20),
                        label: Text(ws.loading ? 'Sincronizando…' : 'Sincronizar con el servidor'),
                        style: FilledButton.styleFrom(
                          alignment: Alignment.centerLeft,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        ),
                      ),
                    ],
                  );
                },
              ),
              const SizedBox(height: 24),
              ...sections.entries.expand((e) {
                final title = e.key;
                final items = e.value;
                return [
                  Text(title, style: theme.textTheme.titleMedium),
                  const SizedBox(height: 12),
                  ...items.map(
                    (c) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: MitsyyCard(
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(
                              workspaceIconFromKey(c.iconKey),
                              size: 32,
                              color: AppColors.gold.withValues(alpha: 0.9),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          c.title,
                                          style: theme.textTheme.titleLarge,
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      if (c.isActive)
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(8),
                                            color: AppColors.gold.withValues(alpha: 0.15),
                                            border: Border.all(color: AppColors.borderSubtle),
                                          ),
                                          child: Text(
                                            'Activo',
                                            style: theme.textTheme.labelSmall?.copyWith(color: AppColors.gold),
                                          ),
                                        ),
                                      if (c.requiresPro) ...[
                                        const SizedBox(width: 8),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(8),
                                            color: AppColors.proAmber.withValues(alpha: 0.12),
                                          ),
                                          child: Text(
                                            'Pro',
                                            style: theme.textTheme.labelSmall?.copyWith(color: AppColors.proAmber),
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    c.description,
                                    style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
                                    maxLines: 4,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 12),
                                  Align(
                                    alignment: Alignment.centerLeft,
                                    child: OutlinedButton(
                                      onPressed: () {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(content: Text('Disponible próximamente')),
                                        );
                                      },
                                      child: const Text('Activar'),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ];
              }),
            ],
          );
        },
      ),
    );
  }
}
