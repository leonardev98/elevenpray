import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/mitsyy_card.dart';
import '../../../core/utils/mock_delay.dart';
import '../../../core/widgets/mitsyy_skeleton.dart';
import '../../../models/product.dart';
import '../mock/skincare_mock.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  late final Future<List<Product>> _future;
  String _filter = 'Todos';

  static const _filters = [
    'Todos',
    'AM',
    'PM',
    'Sérum',
    'Limpiador',
    'SPF',
    'Tratamiento',
  ];

  @override
  void initState() {
    super.initState();
    _future = withMockDelay(fetchSkincareProducts);
  }

  bool _matches(Product p, String f) {
    if (f == 'Todos') return true;
    if (f == 'AM') return p.usageTime == 'am' || p.usageTime == 'both';
    if (f == 'PM') return p.usageTime == 'pm' || p.usageTime == 'both';
    if (f == 'Sérum') return p.category == 'serum';
    if (f == 'Limpiador') return p.category == 'cleanser';
    if (f == 'SPF') return p.category == 'sunscreen';
    if (f == 'Tratamiento') return p.category == 'retinoid' || p.category == 'spot_treatment';
    return true;
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
        title: Text('Mis Productos', style: theme.textTheme.titleLarge),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {},
          ),
        ],
      ),
      body: FutureBuilder<List<Product>>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return ListView(
              padding: const EdgeInsets.all(AppColors.horizontalMargin),
              children: [
                SizedBox(
                  height: 40,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: const [
                      MitsyySkeleton(height: 36, width: 72, borderRadius: 20),
                      SizedBox(width: 8),
                      MitsyySkeleton(height: 36, width: 56, borderRadius: 20),
                      SizedBox(width: 8),
                      MitsyySkeleton(height: 36, width: 56, borderRadius: 20),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                ...List.generate(
                  6,
                  (i) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: MitsyySkeleton(height: 88, borderRadius: AppColors.radiusCard),
                  ),
                ),
              ],
            );
          }
          final all = snapshot.data!;
          final filtered = all.where((p) => _matches(p, _filter)).toList();

          if (filtered.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(AppColors.horizontalMargin),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(LucideIcons.sprayCan, size: 56, color: AppColors.gold.withValues(alpha: 0.65)),
                    const SizedBox(height: 16),
                    Text('Aún no tienes productos', style: theme.textTheme.headlineSmall, textAlign: TextAlign.center),
                    const SizedBox(height: 8),
                    Text(
                      'Añade tus productos desde la web o la app',
                      style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    OutlinedButton(
                      onPressed: () {},
                      child: const Text('Ir a la web →'),
                    ),
                  ],
                ),
              ),
            );
          }

          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SizedBox(
                height: 44,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: AppColors.horizontalMargin),
                  scrollDirection: Axis.horizontal,
                  itemCount: _filters.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, i) {
                    final f = _filters[i];
                    final sel = f == _filter;
                    return FilterChip(
                      selected: sel,
                      label: Text(f),
                      onSelected: (_) => setState(() => _filter = f),
                      selectedColor: AppColors.gold.withValues(alpha: 0.2),
                      checkmarkColor: AppColors.gold,
                      labelStyle: theme.textTheme.labelLarge?.copyWith(
                        color: sel ? AppColors.gold : AppColors.textSecondary,
                      ),
                      side: BorderSide(color: sel ? AppColors.gold.withValues(alpha: 0.5) : AppColors.borderMuted),
                      backgroundColor: AppColors.surfaceSolid.withValues(alpha: 0.55),
                    );
                  },
                ),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: AppColors.horizontalMargin),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, i) {
                    final p = filtered[i];
                    return _ProductRowCard(product: p);
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _ProductRowCard extends StatelessWidget {
  const _ProductRowCard({required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return MitsyyCard(
      onTap: () {},
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          _ProductThumb(imageUrl: product.imageUrl),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(product.name, style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w500)),
                if (product.brand != null)
                  Text(
                    product.brand!,
                    style: theme.textTheme.bodySmall?.copyWith(fontSize: 13),
                  ),
                const SizedBox(height: 8),
                _UsageBadge(usageTime: product.usageTime),
              ],
            ),
          ),
          Icon(Icons.chevron_right, color: AppColors.textSecondary.withValues(alpha: 0.8)),
        ],
      ),
    );
  }
}

class _ProductThumb extends StatelessWidget {
  const _ProductThumb({this.imageUrl});

  final String? imageUrl;

  @override
  Widget build(BuildContext context) {
    const size = 64.0;
    if (imageUrl != null && imageUrl!.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: CachedNetworkImage(
          imageUrl: imageUrl!,
          width: size,
          height: size,
          fit: BoxFit.cover,
          placeholder: (_, __) => Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.surfaceSolid, AppColors.gold.withValues(alpha: 0.25)],
              ),
            ),
          ),
          errorWidget: (_, __, ___) => _PlaceholderBox(size: size),
        ),
      );
    }
    return _PlaceholderBox(size: size);
  }
}

class _PlaceholderBox extends StatelessWidget {
  const _PlaceholderBox({required this.size});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.surfaceSolid, AppColors.gold.withValues(alpha: 0.2)],
        ),
      ),
    );
  }
}

class _UsageBadge extends StatelessWidget {
  const _UsageBadge({this.usageTime});

  final String? usageTime;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final u = usageTime ?? 'am';
    if (u == 'both') {
      return Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.borderSubtle),
        ),
        clipBehavior: Clip.antiAlias,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              color: AppColors.gold.withValues(alpha: 0.2),
              child: Text('AM', style: theme.textTheme.labelSmall?.copyWith(color: AppColors.gold)),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              color: AppColors.surfaceSolid.withValues(alpha: 0.85),
              child: Text(
                'PM',
                style: theme.textTheme.labelSmall?.copyWith(color: AppColors.textSecondary),
              ),
            ),
          ],
        ),
      );
    }
    final isAm = u == 'am';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        color: isAm ? AppColors.gold.withValues(alpha: 0.18) : AppColors.surfaceSolid.withValues(alpha: 0.75),
        border: Border.all(color: isAm ? AppColors.gold.withValues(alpha: 0.35) : AppColors.borderSubtle),
      ),
      child: Text(
        isAm ? 'AM' : 'PM',
        style: theme.textTheme.labelSmall?.copyWith(color: isAm ? AppColors.gold : AppColors.textSecondary),
      ),
    );
  }
}
