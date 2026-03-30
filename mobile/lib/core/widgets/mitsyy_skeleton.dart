import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../theme/app_colors.dart';

class MitsyySkeleton extends StatelessWidget {
  const MitsyySkeleton({
    super.key,
    required this.height,
    this.width,
    this.borderRadius = 12,
  });

  final double height;
  final double? width;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.borderMuted.withValues(alpha: 0.45),
      highlightColor: Colors.white.withValues(alpha: 0.85),
      child: Container(
        width: width ?? double.infinity,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.borderMuted.withValues(alpha: 0.35),
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }
}
