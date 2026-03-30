import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/providers/auth_session.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/auth/screens/splash_screen.dart';
import '../../features/dev/dev_health_screen.dart';
import '../../features/explore/screens/explore_screen.dart';
import '../../features/home/screens/home_screen.dart';
import '../../features/home/screens/schedule_screen.dart';
import '../../features/skincare/screens/checkin_screen.dart';
import '../../features/skincare/screens/products_screen.dart';
import '../../features/skincare/screens/progress_screen.dart';
import '../../features/skincare/screens/routine_screen.dart';
import '../../features/skincare/screens/skincare_home_screen.dart';
import '../../features/shell/screens/more_placeholder_screen.dart';
import '../shell/main_shell.dart';

final GlobalKey<NavigatorState> rootNavigatorKey = GlobalKey<NavigatorState>();

GoRouter createAppRouter(AuthSession auth) {
  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/splash',
    refreshListenable: auth,
    redirect: (BuildContext context, GoRouterState state) {
      final loggedIn = auth.isAuthenticated;
      final loc = state.matchedLocation;
      final isSplash = loc == '/splash';
      final isLogin = loc == '/login';
      final isRegister = loc == '/register';
      final isDev = loc.startsWith('/dev/');

      if (!loggedIn && !isSplash && !isLogin && !isRegister && !isDev) {
        return '/login';
      }
      if (loggedIn && (isLogin || isRegister)) {
        return '/home';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/dev/health',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const DevHealthScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainShell(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/home',
                pageBuilder: (context, state) => NoTransitionPage(
                  key: state.pageKey,
                  child: const HomeScreen(),
                ),
                routes: [
                  GoRoute(
                    path: 'schedule',
                    parentNavigatorKey: rootNavigatorKey,
                    builder: (context, state) => const ScheduleScreen(),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/skincare',
                pageBuilder: (context, state) => NoTransitionPage(
                  key: state.pageKey,
                  child: const SkincareHomeScreen(),
                ),
                routes: [
                  GoRoute(
                    path: 'routine',
                    parentNavigatorKey: rootNavigatorKey,
                    builder: (context, state) => const RoutineScreen(),
                  ),
                  GoRoute(
                    path: 'checkin',
                    parentNavigatorKey: rootNavigatorKey,
                    builder: (context, state) => const CheckinScreen(),
                  ),
                  GoRoute(
                    path: 'products',
                    parentNavigatorKey: rootNavigatorKey,
                    builder: (context, state) => const ProductsScreen(),
                  ),
                  GoRoute(
                    path: 'progress',
                    parentNavigatorKey: rootNavigatorKey,
                    builder: (context, state) => const ProgressScreen(),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/explore',
                pageBuilder: (context, state) => NoTransitionPage(
                  key: state.pageKey,
                  child: const ExploreScreen(),
                ),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/more',
                pageBuilder: (context, state) => NoTransitionPage(
                  key: state.pageKey,
                  child: const MorePlaceholderScreen(),
                ),
              ),
            ],
          ),
        ],
      ),
    ],
  );
}
