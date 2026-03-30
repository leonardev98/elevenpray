/// Alineado con `WorkspaceProduct` del backend.
typedef ProductCategory = String;
typedef ProductStatus = String;
typedef UsageTime = String;

class Product {
  const Product({
    required this.id,
    required this.workspaceId,
    required this.name,
    required this.category,
    required this.status,
    this.brand,
    this.textureFormat,
    this.mainIngredients,
    this.usageTime,
    this.dateOpened,
    this.expirationDate,
    this.notes,
    this.rating,
    this.reactionNotes,
    this.imageUrl,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String workspaceId;
  final String name;
  final ProductCategory category;
  final ProductStatus status;
  final String? brand;
  final String? textureFormat;
  final List<String>? mainIngredients;
  final UsageTime? usageTime;
  final String? dateOpened;
  final String? expirationDate;
  final String? notes;
  final int? rating;
  final String? reactionNotes;
  final String? imageUrl;
  final String? createdAt;
  final String? updatedAt;

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as String,
      workspaceId: json['workspaceId'] as String,
      name: json['name'] as String,
      category: json['category'] as String,
      status: json['status'] as String,
      brand: json['brand'] as String?,
      textureFormat: json['textureFormat'] as String?,
      mainIngredients: (json['mainIngredients'] as List<dynamic>?)?.cast<String>(),
      usageTime: json['usageTime'] as String?,
      dateOpened: json['dateOpened'] as String?,
      expirationDate: json['expirationDate'] as String?,
      notes: json['notes'] as String?,
      rating: json['rating'] as int?,
      reactionNotes: json['reactionNotes'] as String?,
      imageUrl: json['imageUrl'] as String?,
      createdAt: json['createdAt'] as String?,
      updatedAt: json['updatedAt'] as String?,
    );
  }
}
