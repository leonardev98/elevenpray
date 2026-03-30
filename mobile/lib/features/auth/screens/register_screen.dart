import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/workspace_dashboard_tokens.dart';
import '../../../core/widgets/mitsyy_button.dart';
import '../providers/auth_session.dart';
import '../widgets/auth_screen_widgets.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  late final TextEditingController _name;
  late final TextEditingController _email;
  late final TextEditingController _password;
  late final TextEditingController _confirmPassword;
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController();
    _email = TextEditingController();
    _password = TextEditingController();
    _confirmPassword = TextEditingController();
  }

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    _confirmPassword.dispose();
    super.dispose();
  }

  String? _validate() {
    final name = _name.text.trim();
    if (name.isEmpty) return 'Escribe tu nombre.';
    final email = _email.text.trim();
    if (email.isEmpty) return 'Escribe tu correo.';
    if (!email.contains('@')) return 'Correo no válido.';
    final p = _password.text;
    if (p.length < 4) return 'La contraseña debe tener al menos 4 caracteres.';
    if (p != _confirmPassword.text) return 'Las contraseñas no coinciden.';
    return null;
  }

  Future<void> _submit() async {
    final v = _validate();
    if (v != null) {
      setState(() => _error = v);
      return;
    }
    setState(() {
      _error = null;
      _loading = true;
    });
    try {
      await context.read<AuthSession>().register(
            name: _name.text.trim(),
            email: _email.text.trim(),
            password: _password.text,
          );
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
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: AppColors.horizontalMargin),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerLeft,
                child: Material(
                  color: isDark
                      ? WorkspaceDashboardTokens.bgSecondary.withValues(alpha: 0.5)
                      : Colors.white.withValues(alpha: 0.75),
                  borderRadius: BorderRadius.circular(14),
                  child: InkWell(
                    onTap: _loading ? null : () => context.pop(),
                    borderRadius: BorderRadius.circular(14),
                    child: Padding(
                      padding: const EdgeInsets.all(10),
                      child: Icon(
                        Icons.arrow_back_rounded,
                        size: 22,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              const AuthScreenHeader(
                title: 'Crear cuenta',
                subtitle: 'Unos datos y listo. Usa el mismo correo que en la web si ya te registraste allí.',
              ),
              AuthFormPanel(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AuthTextField(
                      controller: _name,
                      label: 'Nombre',
                      textCapitalization: TextCapitalization.words,
                      autofillHints: const [AutofillHints.name],
                      enabled: !_loading,
                      textInputAction: TextInputAction.next,
                    ),
                    const SizedBox(height: 18),
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
                      label: 'Contraseña (mín. 4 caracteres)',
                      autofillHints: const [AutofillHints.newPassword],
                      enabled: !_loading,
                      textInputAction: TextInputAction.next,
                    ),
                    const SizedBox(height: 18),
                    AuthPasswordField(
                      controller: _confirmPassword,
                      label: 'Confirmar contraseña',
                      autofillHints: const [AutofillHints.newPassword],
                      enabled: !_loading,
                      textInputAction: TextInputAction.done,
                      onSubmitted: (_) {
                        if (!_loading) _submit();
                      },
                    ),
                    if (_error != null) AuthErrorBanner(message: _error!),
                    const SizedBox(height: 22),
                    MitsyyButton(
                      label: _loading ? 'Creando cuenta…' : 'Registrarme',
                      expanded: true,
                      onPressed: _loading ? null : _submit,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),
              Center(
                child: TextButton(
                  onPressed: _loading ? null : () => context.pop(),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.gold,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                  child: Text(
                    '¿Ya tienes cuenta? Inicia sesión',
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
