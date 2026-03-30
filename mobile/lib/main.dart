import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'app.dart';
import 'bootstrap.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await loadAppDotenv();
  await initializeDateFormatting('es');
  runApp(const MitsyyApp());
}
