import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/api/api_config.dart';
import 'core/api/mitsyy_api.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/app_theme_mode_notifier.dart';
import 'core/theme/workspace_dashboard_tokens.dart';
import 'core/widgets/mitsyy_app_background.dart';
import 'features/auth/providers/auth_session.dart';
import 'features/home/providers/home_dashboard_notifier.dart';
import 'features/skincare/providers/skincare_routine_provider.dart';
import 'features/workspace/providers/user_workspaces_notifier.dart';

class MitsyyApp extends StatefulWidget {
  const MitsyyApp({super.key, this.router});

  final GoRouter? router;

  @override
  State<MitsyyApp> createState() => _MitsyyAppState();
}

class _MitsyyAppState extends State<MitsyyApp> {
  SharedPreferences? _prefs;

  @override
  void initState() {
    super.initState();
    SharedPreferences.getInstance().then((p) {
      if (mounted) setState(() => _prefs = p);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_prefs == null) {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        darkTheme: AppTheme.dark,
        themeMode: ThemeMode.dark,
        home: MitsyyAppBackground(
          child: Builder(
            builder: (context) => Scaffold(
              backgroundColor: Colors.transparent,
              body: Center(
                child: Text(
                  'Mitsyy',
                  style: Theme.of(context).textTheme.displayMedium?.copyWith(fontSize: 28),
                ),
              ),
            ),
          ),
        ),
      );
    }
    return _MitsyyAppRoot(prefs: _prefs!, routerOverride: widget.router);
  }
}

class _MitsyyAppRoot extends StatefulWidget {
  const _MitsyyAppRoot({required this.prefs, this.routerOverride});

  final SharedPreferences prefs;
  final GoRouter? routerOverride;

  @override
  State<_MitsyyAppRoot> createState() => _MitsyyAppRootState();
}

class _MitsyyAppRootState extends State<_MitsyyAppRoot> {
  late final MitsyyApi _api = MitsyyApi(baseUrl: ApiConfig.baseUrl);
  late final AuthSession _auth = AuthSession(widget.prefs, _api)..restoreFromPrefs();
  late final UserWorkspacesNotifier _workspaces =
      UserWorkspacesNotifier(prefs: widget.prefs, auth: _auth, api: _api);
  late final HomeDashboardNotifier _dashboard =
      HomeDashboardNotifier(api: _api, auth: _auth, workspaces: _workspaces);
  late final GoRouter _router = widget.routerOverride ?? createAppRouter(_auth);

  @override
  void dispose() {
    _dashboard.dispose();
    _workspaces.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<MitsyyApi>.value(value: _api),
        ChangeNotifierProvider<AuthSession>.value(value: _auth),
        ChangeNotifierProvider<UserWorkspacesNotifier>.value(value: _workspaces),
        ChangeNotifierProvider<HomeDashboardNotifier>.value(value: _dashboard),
        ChangeNotifierProvider(
          create: (_) => SkincareRoutineNotifier(widget.prefs)..loadPersistedState(),
        ),
        ChangeNotifierProvider(
          create: (_) => AppThemeModeNotifier(widget.prefs)..loadPersistedState(),
        ),
      ],
      child: Consumer<AppThemeModeNotifier>(
        builder: (context, themeNotifier, _) {
          return MaterialApp.router(
            title: 'Mitsyy',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light,
            darkTheme: AppTheme.dark,
            themeMode: themeNotifier.materialThemeMode,
            locale: const Locale('es'),
            supportedLocales: const [Locale('es')],
            localizationsDelegates: const [
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            builder: (context, child) {
              return Builder(
                builder: (context) {
                  final brightness = Theme.of(context).brightness;
                  final overlay = brightness == Brightness.dark
                      ? SystemUiOverlayStyle.light.copyWith(
                          statusBarColor: Colors.transparent,
                          systemNavigationBarColor: WorkspaceDashboardTokens.bgPrimary,
                          systemNavigationBarIconBrightness: Brightness.light,
                        )
                      : SystemUiOverlayStyle.dark.copyWith(
                          statusBarColor: Colors.transparent,
                          systemNavigationBarColor: Colors.white,
                          systemNavigationBarIconBrightness: Brightness.dark,
                        );
                  return AnnotatedRegion<SystemUiOverlayStyle>(
                    value: overlay,
                    child: MitsyyAppBackground(child: child ?? const SizedBox.shrink()),
                  );
                },
              );
            },
            routerConfig: _router,
          );
        },
      ),
    );
  }
}
