class User {
  const User({
    required this.id,
    required this.name,
    required this.email,
    this.avatarUrl,
    required this.planType,
    required this.activeWorkspacesCount,
  });

  final String id;
  final String name;
  final String email;
  final String? avatarUrl;
  final String planType;
  final int activeWorkspacesCount;

  /// Perfil mínimo desde el API (`/auth/me`).
  factory User.fromSession({
    required String id,
    required String name,
    required String email,
    String? avatarUrl,
  }) {
    return User(
      id: id,
      name: name,
      email: email,
      avatarUrl: avatarUrl,
      planType: 'free',
      activeWorkspacesCount: 0,
    );
  }
}
