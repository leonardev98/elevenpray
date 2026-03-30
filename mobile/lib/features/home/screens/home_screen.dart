import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/widgets/mitsyy_floating_bottom_nav.dart';
import '../../../models/user.dart';
import '../../auth/providers/auth_session.dart';
import '../../workspace/providers/user_workspaces_notifier.dart';
import '../utils/workspace_dashboard_mode.dart';
import '../widgets/dashboard_home.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _search = TextEditingController();

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthSession>();
    final u = auth.user;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        clipBehavior: Clip.none,
        children: [
          ListView(
            padding: MitsyyFloatingBottomNav.listPadding(
              context,
              const EdgeInsets.fromLTRB(20, 16, 20, 24),
            ),
            children: [
              if (u != null)
                DashboardHome(
                  user: User.fromSession(
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    avatarUrl: u.avatarUrl,
                  ),
                  searchController: _search,
                )
              else
                const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator())),
            ],
          ),
          Positioned(
            right: 20,
            bottom: MitsyyFloatingBottomNav.reservedBottomInset(context) + 14,
            child: const _WorkspaceFab(),
          ),
        ],
      ),
    );
  }
}

class _WorkspaceFab extends StatelessWidget {
  const _WorkspaceFab();

  @override
  Widget build(BuildContext context) {
    return Consumer<UserWorkspacesNotifier>(
      builder: (context, ws, _) {
        final mode = ws.dashboardMode;
        final colors = workspaceFabGradientForMode(mode);
        final glow = workspaceFabGlowForMode(mode);

        return Material(
          type: MaterialType.transparency,
          elevation: 0,
          child: InkWell(
            customBorder: const CircleBorder(),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Nueva tarea (próximamente)')),
              );
            },
            child: Ink(
              width: 58,
              height: 58,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: colors,
                ),
                boxShadow: [
                  BoxShadow(
                    color: glow.withValues(alpha: 0.45),
                    blurRadius: 20,
                    spreadRadius: 0,
                  ),
                  const BoxShadow(
                    color: Color(0x40000000),
                    blurRadius: 12,
                    offset: Offset(0, 6),
                  ),
                ],
              ),
              child: const Icon(Icons.add_rounded, color: Colors.white, size: 30),
            ),
          ),
        );
      },
    );
  }
}
