class RecordModel {
  final String recordId;
  final String requestId;
  final String targetId;
  final String targetName;
  final String assignedRegionNo;
  final String branchName;
  final String repName;
  final String
  recordStatus; // 'Pending' | 'DraftSaved' | 'Submitted' | 'Completed'
  final int completionPercent;
  final double? inventoryValue;
  final String? area;
  final String? phone;
  final Map<String, dynamic> rawData;
  final DateTime? updatedAt;

  // Backward-compatibility getters
  String get customerNo => targetId;
  String get customerName => targetName;
  String get userName => repName;

  const RecordModel({
    required this.recordId,
    required this.requestId,
    required this.targetId,
    required this.targetName,
    required this.assignedRegionNo,
    this.branchName = '',
    this.repName = '',
    this.recordStatus = 'Pending',
    this.completionPercent = 0,
    this.inventoryValue,
    this.area,
    this.phone,
    this.rawData = const {},
    this.updatedAt,
  });

  factory RecordModel.fromFirestore(String id, Map<String, dynamic> data) {
    DateTime? parseDate(dynamic val) {
      if (val == null) return null;
      if (val is DateTime) return val;
      if (val is String) return DateTime.tryParse(val);
      return null;
    }

    final raw = data['rawData'] is Map
        ? Map<String, dynamic>.from(data['rawData'] as Map)
        : <String, dynamic>{};

    String? extractPhone() {
      if (data['phone'] != null && data['phone'].toString().trim().isNotEmpty) {
        return data['phone'].toString().trim();
      }
      if (data['mobile'] != null &&
          data['mobile'].toString().trim().isNotEmpty) {
        return data['mobile'].toString().trim();
      }
      const candidates = [
        'phone',
        'mobile',
        'tel',
        'phone_number',
        'جوال',
        'هاتف',
        'رقم الجوال',
        'رقم الهاتف',
      ];
      for (final key in candidates) {
        if (raw[key] != null && raw[key].toString().trim().isNotEmpty) {
          return raw[key].toString().trim();
        }
      }
      return null;
    }

    final tId = (data['targetId'] ?? data['customerNo'] ?? '').toString();
    final tName = (data['targetName'] ??
            data['customerName'] ??
            data['targetId'] ??
            data['customerNo'] ??
            'سجل')
        .toString();

    return RecordModel(
      recordId: id,
      requestId: (data['requestId'] ?? '').toString(),
      targetId: tId,
      targetName: tName,
      assignedRegionNo: (data['assignedRegionNo'] ?? data['regionNo'] ?? '')
          .toString(),
      branchName: (data['branchName'] ?? '').toString(),
      repName: (data['repName'] ?? data['userName'] ?? '').toString(),
      recordStatus: (data['recordStatus'] ?? 'Pending').toString(),
      completionPercent: (data['completionPercent'] as num?)?.toInt() ?? 0,
      inventoryValue: (data['inventoryValue'] as num?)?.toDouble(),
      area: data['area']?.toString(),
      phone: extractPhone(),
      rawData: raw,
      updatedAt: parseDate(data['updatedAt']),
    );
  }
}
