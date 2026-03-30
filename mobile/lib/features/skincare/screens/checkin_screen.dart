import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/mitsyy_button.dart';
import '../widgets/skin_metric_slider.dart';

class CheckinScreen extends StatefulWidget {
  const CheckinScreen({super.key});

  @override
  State<CheckinScreen> createState() => _CheckinScreenState();
}

class _CheckinScreenState extends State<CheckinScreen> {
  int _step = 0;
  double _hydration = 0.5;
  double _redness = 0.2;
  double _brightness = 0.55;
  final _note = TextEditingController();

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: Text('Check-in', style: theme.textTheme.titleLarge),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(36),
          child: Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(3, (i) {
                final active = i == _step;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Container(
                    width: active ? 10 : 8,
                    height: active ? 10 : 8,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: active ? AppColors.gold : AppColors.borderMuted,
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppColors.horizontalMargin),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              '${_step + 1} de 3',
              style: theme.textTheme.labelLarge?.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: _step == 0
                  ? _StepPhoto(theme: theme)
                  : _step == 1
                      ? _StepMetrics(
                          hydration: _hydration,
                          redness: _redness,
                          brightness: _brightness,
                          onHydration: (v) => setState(() => _hydration = v),
                          onRedness: (v) => setState(() => _redness = v),
                          onBrightness: (v) => setState(() => _brightness = v),
                        )
                      : _StepNote(controller: _note),
            ),
            if (_step == 0)
              TextButton(
                onPressed: () => setState(() => _step = 1),
                child: Text(
                  'Continuar sin foto →',
                  style: theme.textTheme.labelLarge?.copyWith(color: AppColors.textSecondary),
                ),
              ),
            Row(
              children: [
                if (_step > 0)
                  TextButton(
                    onPressed: () => setState(() => _step -= 1),
                    child: const Text('Atrás'),
                  ),
                const Spacer(),
                if (_step < 2)
                  MitsyyButton(
                    label: 'Siguiente',
                    onPressed: () => setState(() => _step += 1),
                  )
                else
                  MitsyyButton(
                    label: 'Guardar check-in',
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Check-in guardado (mock)')),
                      );
                      context.pop();
                    },
                  ),
              ],
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

class _StepPhoto extends StatelessWidget {
  const _StepPhoto({required this.theme});

  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('Foto', style: theme.textTheme.titleMedium),
        const SizedBox(height: 12),
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppColors.radiusCard),
              border: Border.all(color: AppColors.borderSubtle),
              color: AppColors.surfaceSolid,
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.photo_camera_outlined, size: 56, color: AppColors.gold.withValues(alpha: 0.5)),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    OutlinedButton(onPressed: () {}, child: const Text('Tomar foto')),
                    const SizedBox(width: 12),
                    OutlinedButton(onPressed: () {}, child: const Text('Galería')),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _StepMetrics extends StatelessWidget {
  const _StepMetrics({
    required this.hydration,
    required this.redness,
    required this.brightness,
    required this.onHydration,
    required this.onRedness,
    required this.onBrightness,
  });

  final double hydration;
  final double redness;
  final double brightness;
  final ValueChanged<double> onHydration;
  final ValueChanged<double> onRedness;
  final ValueChanged<double> onBrightness;

  @override
  Widget build(BuildContext context) {
    return ListView(
      children: [
        SkinMetricSlider(
          icon: LucideIcons.droplets,
          iconColor: const Color(0xFF4A90C8),
          label: 'Hidratación',
          leftLabel: 'Muy seca',
          rightLabel: 'Muy hidratada',
          value: hydration,
          onChanged: onHydration,
        ),
        const SizedBox(height: 20),
        SkinMetricSlider(
          icon: LucideIcons.circleDot,
          iconColor: const Color(0xFFD64545),
          label: 'Rojez',
          leftLabel: 'Sin rojez',
          rightLabel: 'Mucha rojez',
          value: redness,
          onChanged: onRedness,
        ),
        const SizedBox(height: 20),
        SkinMetricSlider(
          icon: LucideIcons.sparkles,
          iconColor: AppColors.gold,
          label: 'Luminosidad',
          leftLabel: 'Apagada',
          rightLabel: 'Radiante',
          value: brightness,
          onChanged: onBrightness,
        ),
      ],
    );
  }
}

class _StepNote extends StatelessWidget {
  const _StepNote({required this.controller});

  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ListView(
      children: [
        Text('Nota opcional', style: theme.textTheme.titleMedium),
        const SizedBox(height: 12),
        TextField(
          controller: controller,
          maxLines: 5,
          maxLength: 200,
          decoration: const InputDecoration(
            hintText: '¿Algo que quieras recordar hoy?',
            alignLabelWithHint: true,
          ),
        ),
      ],
    );
  }
}
