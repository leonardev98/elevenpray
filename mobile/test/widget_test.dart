import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:mitsyy_mobile/app.dart';
import 'package:mitsyy_mobile/bootstrap.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('MitsyyApp arranca', (tester) async {
    SharedPreferences.setMockInitialValues({});
    await loadAppDotenv();
    await tester.pumpWidget(const MitsyyApp());
    await tester.pump();
    await tester.pump(const Duration(seconds: 2));
    expect(find.text('Mitsyy'), findsWidgets);
  });
}
