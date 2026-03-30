import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/mock_delay.dart';
import '../../../core/widgets/mitsyy_skeleton.dart';
import '../../../models/progress_photo.dart';
import '../mock/skincare_mock.dart';

class ProgressScreen extends StatefulWidget {
  const ProgressScreen({super.key});

  @override
  State<ProgressScreen> createState() => _ProgressScreenState();
}

class _ProgressScreenState extends State<ProgressScreen> {
  late final Future<List<ProgressPhoto>> _future;
  bool _month = false;

  @override
  void initState() {
    super.initState();
    _future = withMockDelay(fetchProgressPhotos);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final seriesA = mockMetricSeriesA();
    final seriesB = mockMetricSeriesB();
    final seriesC = mockMetricSeriesC();
    final checkinDays = mockCheckinWeekdayIndices();
    final now = DateTime.now();
    final todayIndex = now.weekday - 1;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: Text('Mi Progreso', style: theme.textTheme.titleLarge),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: SegmentedButton<bool>(
              segments: const [
                ButtonSegment(value: false, label: Text('Sem')),
                ButtonSegment(value: true, label: Text('Mes')),
              ],
              selected: {_month},
              onSelectionChanged: (s) => setState(() => _month = s.first),
            ),
          ),
        ],
      ),
      body: FutureBuilder<List<ProgressPhoto>>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return ListView(
              padding: const EdgeInsets.all(AppColors.horizontalMargin),
              children: const [
                MitsyySkeleton(height: 100),
                SizedBox(height: 16),
                MitsyySkeleton(height: 100),
                SizedBox(height: 16),
                MitsyySkeleton(height: 100),
              ],
            );
          }
          final photos = snapshot.data!;

          return ListView(
            padding: const EdgeInsets.all(AppColors.horizontalMargin),
            children: [
              Text('Métricas · ${_month ? 'mes' : 'semana'}', style: theme.textTheme.titleMedium),
              const SizedBox(height: 12),
              SizedBox(height: 90, child: _MiniLineChart(color: AppColors.gold, values: seriesA)),
              const SizedBox(height: 8),
              SizedBox(height: 90, child: _MiniLineChart(color: AppColors.error.withValues(alpha: 0.85), values: seriesB)),
              const SizedBox(height: 8),
              SizedBox(height: 90, child: _MiniLineChart(color: AppColors.success.withValues(alpha: 0.9), values: seriesC)),
              const SizedBox(height: 28),
              Text('Esta semana', style: theme.textTheme.titleMedium),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(7, (i) {
                  final labels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
                  final has = checkinDays.contains(i);
                  final isToday = i == todayIndex;
                  return Column(
                    children: [
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 400),
                        curve: Curves.easeOut,
                        width: isToday ? 34 : 30,
                        height: isToday ? 34 : 30,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: has ? AppColors.gold : AppColors.borderMuted,
                          border: isToday ? Border.all(color: AppColors.gold, width: 2) : null,
                          boxShadow: isToday
                              ? [
                                  BoxShadow(
                                    color: AppColors.gold.withValues(alpha: 0.35),
                                    blurRadius: 8,
                                    spreadRadius: 0,
                                  ),
                                ]
                              : null,
                        ),
                        child: has
                            ? Icon(Icons.check_rounded, size: 18, color: theme.colorScheme.onPrimary)
                            : null,
                      ),
                      const SizedBox(height: 6),
                      Text(labels[i], style: theme.textTheme.labelSmall),
                    ],
                  );
                }),
              ),
              const SizedBox(height: 28),
              Text('Fotos', style: theme.textTheme.titleMedium),
              const SizedBox(height: 12),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  mainAxisSpacing: 10,
                  crossAxisSpacing: 10,
                  childAspectRatio: 0.85,
                ),
                itemCount: photos.length,
                itemBuilder: (context, i) {
                  final p = photos[i];
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [AppColors.surfaceSolid, AppColors.background],
                            ),
                            border: Border.all(color: AppColors.borderSubtle),
                          ),
                          child: Icon(Icons.photo_outlined, color: AppColors.gold.withValues(alpha: 0.3)),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        p.caption ?? p.takenAt,
                        style: theme.textTheme.labelSmall?.copyWith(fontSize: 11),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  );
                },
              ),
            ],
          );
        },
      ),
    );
  }
}

class _MiniLineChart extends StatelessWidget {
  const _MiniLineChart({required this.color, required this.values});

  final Color color;
  final List<double> values;

  @override
  Widget build(BuildContext context) {
    final spots = <FlSpot>[
      for (var i = 0; i < values.length; i++) FlSpot(i.toDouble(), values[i]),
    ];
    return LineChart(
      LineChartData(
        gridData: const FlGridData(show: false),
        titlesData: const FlTitlesData(show: false),
        borderData: FlBorderData(show: false),
        minY: 0,
        maxY: 1,
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            color: color,
            barWidth: 2,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              color: color.withValues(alpha: 0.12),
            ),
          ),
        ],
      ),
    );
  }
}
