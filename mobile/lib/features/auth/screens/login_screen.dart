import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/mitsyy_button.dart';
import '../providers/auth_session.dart';
import '../widgets/auth_screen_widgets.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  late final TextEditingController _email;
  late final TextEditingController _password;
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _email = TextEditingController();
    _password = TextEditingController();
  }

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _error = null;
      _loading = true;
    });
    try {
      await context.read<AuthSession>().login(_email.text, _password.text);
      if (!mounted) return;
      context.go('/home');
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString().replaceFirst('Exception: ', '').replaceFirst('ApiException: ', '');
        });
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: AppColors.horizontalMargin),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 12),
              const AuthScreenHeader(
                title: 'Bienvenida',
                subtitle: 'Inicia sesión para seguir con tus rutinas y workspaces.',
              ),
              AuthFormPanel(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AuthTextField(
                      controller: _email,
                      label: 'Correo electrónico',
                      keyboardType: TextInputType.emailAddress,
                      autofillHints: const [AutofillHints.email],
                      enabled: !_loading,
                      textInputAction: TextInputAction.next,
                    ),
                    const SizedBox(height: 18),
                    AuthPasswordField(
                      controller: _password,
                      label: 'Contraseña',
                      autofillHints: const [AutofillHints.password],
                      enabled: !_loading,
                      textInputAction: TextInputAction.done,
                      onSubmitted: (_) {
                        if (!_loading) _submit();
                      },
                    ),
                    if (_error != null) AuthErrorBanner(message: _error!),
                    const SizedBox(height: 22),
                    MitsyyButton(
                      label: _loading ? 'Entrando…' : 'Continuar',
                      expanded: true,
                      onPressed: _loading ? null : _submit,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),
              Center(
                child: TextButton(
                  onPressed: _loading ? null : () => context.push('/register'),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.gold,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                  child: Text(
                    '¿No tienes cuenta? Regístrate',
                    style: theme.textTheme.labelLarge?.copyWith(
                      color: AppColors.gold,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
