import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/api/dto/user_workspace_dto.dart';
import '../../../core/icons/workspace_icon.dart';
import '../../../core/theme/dashboard_theme_ext.dart';
import '../../../core/theme/workspace_dashboard_tokens.dart';
import '../../../core/widgets/workspace_glass_card.dart';
import '../../workspace/providers/user_workspaces_notifier.dart';
import '../utils/workspace_dashboard_mode.dart';

/// Cabecera: workspace activo + bottom sheet con lista (y búsqueda si hay muchos).
class WorkspaceActiveHeader extends StatelessWidget {
  const WorkspaceActiveHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<UserWorkspacesNotifier>(
      builder: (context, sub, _) {
        final w = sub.activeWorkspace;
        final mode = sub.dashboardMode;
        final primary = workspacePrimaryForMode(mode);

        return WorkspaceGlassCard(
          padding: EdgeInsets.zero,
          borderColor: WorkspaceDashboardTokens.glassBorderActive.withValues(alpha: 0.35),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: sub.hasWorkspaces ? () => _openPicker(context, sub) : null,
              borderRadius: BorderRadius.circular(WorkspaceDashboardTokens.radiusGlassCard),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                child: Row(
                  children: [
                    Icon(
                      w != null ? workspaceIconForWorkspaceType(w.workspaceType) : Icons.hub_outlined,
                      size: 22,
                      color: primary,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            w?.name ?? (sub.loading ? 'Cargando…' : 'Sin workspace'),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: context.dashTextPrimary,
                                ),
                          ),
                          if (w != null) ...[
                            const SizedBox(height: 2),
                            Text(
                              w.subtypeLabel ?? w.workspaceType,
                              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                    color: context.dashTextMuted,
                                  ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    if (sub.hasWorkspaces)
                      Icon(
                        Icons.keyboard_arrow_down_rounded,
                        color: context.dashTextMuted,
                      ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  static Future<void> _openPicker(BuildContext context, UserWorkspacesNotifier sub) async {
    final items = sub.workspaces;
    if (items.isEmpty) return;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (ctx) {
        return SafeArea(
          child: _WorkspacePickerBody(
            workspaces: items,
            activeId: sub.activeWorkspaceId,
            onSelect: (id) {
              sub.setActiveWorkspace(id);
              Navigator.of(ctx).pop();
            },
          ),
        );
      },
    );
  }
}

class _WorkspacePickerBody extends StatefulWidget {
  const _WorkspacePickerBody({
    required this.workspaces,
    required this.activeId,
    required this.onSelect,
  });

  final List<UserWorkspaceDto> workspaces;
  final String? activeId;
  final ValueChanged<String> onSelect;

  @override
  State<_WorkspacePickerBody> createState() => _WorkspacePickerBodyState();
}

class _WorkspacePickerBodyState extends State<_WorkspacePickerBody> {
  final _search = TextEditingController();

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final showSearch = widget.workspaces.length > 5;
    final maxH = MediaQuery.sizeOf(context).height * 0.55;

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Cambiar mundo',
            style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 6),
          Text(
            '${widget.workspaces.length} espacios',
            style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant),
          ),
          if (showSearch) ...[
            const SizedBox(height: 14),
            TextField(
              controller: _search,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                hintText: 'Buscar…',
                prefixIcon: const Icon(Icons.search_rounded),
                filled: true,
                fillColor: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              ),
            ),
          ],
          const SizedBox(height: 12),
          SizedBox(
            height: maxH,
            child: ValueListenableBuilder<TextEditingValue>(
              valueListenable: _search,
              builder: (context, value, _) {
                final q = value.text.trim().toLowerCase();
                final filtered = q.isEmpty
                    ? widget.workspaces
                    : widget.workspaces.where((w) {
                        final t = '${w.name} ${w.subtypeLabel ?? ''} ${w.workspaceType}'.toLowerCase();
                        return t.contains(q);
                      }).toList();

                if (filtered.isEmpty) {
                  return Center(
                    child: Text(
                      'Sin resultados',
                      style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                    ),
                  );
                }

                return ListView.builder(
                  itemCount: filtered.length,
                  itemBuilder: (context, i) {
                    final w = filtered[i];
                    final selected = w.id == widget.activeId;
                    return ListTile(
                      leading: Icon(
                        workspaceIconForWorkspaceType(w.workspaceType),
                        color: theme.colorScheme.primary,
                      ),
                      title: Text(w.name),
                      subtitle: Text(w.subtypeLabel ?? w.workspaceType),
                      trailing: selected ? Icon(Icons.check_rounded, color: theme.colorScheme.primary) : null,
                      onTap: () => widget.onSelect(w.id),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
