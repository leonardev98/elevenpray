import 'package:flutter/material.dart';

class DevHealthScreen extends StatelessWidget {
  const DevHealthScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(title: const Text('Dev health')),
      body: Center(
        child: Text(
          'Mitsyy mobile — OK',
          style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
        ),
      ),
    );
  }
}
