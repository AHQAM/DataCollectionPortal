import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/storage/hive_service.dart';
import '../../../../core/network/network_info.dart';

class SyncStatusBottomSheet extends ConsumerWidget {
  final bool isArabic;

  const SyncStatusBottomSheet({super.key, required this.isArabic});

  static void show(BuildContext context, WidgetRef ref, bool isArabic) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => SyncStatusBottomSheet(isArabic: isArabic),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final hiveService = ref.read(hiveServiceProvider);
    final networkInfo = ref.read(networkInfoProvider);
    final queueCount = hiveService.syncQueueBox.length;

    return FutureBuilder<bool>(
      future: networkInfo.isConnected,
      builder: (context, snapshot) {
        final isOnline = snapshot.data ?? false;

        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Icon(
                    isOnline ? Icons.cloud_done : Icons.cloud_off,
                    color: isOnline ? Colors.green : Colors.orange,
                    size: 28,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    isArabic
                        ? 'حالة الاتصال والمزامنة'
                        : 'Connection & Sync Status',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(
                  Icons.wifi,
                  color: isOnline ? Colors.green : Colors.grey,
                ),
                title: Text(isArabic ? 'حالة الشبكة' : 'Network Status'),
                subtitle: Text(
                  isOnline
                      ? (isArabic ? 'متصل بالإنترنت' : 'Online')
                      : (isArabic
                            ? 'غير متصل (العمل في وضع الأوفلاين)'
                            : 'Offline mode active'),
                ),
              ),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.sync_problem, color: Colors.blue),
                title: Text(
                  isArabic
                      ? 'السجلات بانتظار الرفع'
                      : 'Pending Offline Submissions',
                ),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: queueCount > 0
                        ? Colors.orange.withValues(alpha: 0.2)
                        : Colors.green.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '$queueCount',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: queueCount > 0
                          ? Colors.orange.shade800
                          : Colors.green.shade800,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.of(context).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        isArabic
                            ? 'تم بدء مزامنة البيانات بالخلفية...'
                            : 'Syncing offline records in background...',
                      ),
                    ),
                  );
                },
                icon: const Icon(Icons.refresh),
                label: Text(isArabic ? 'مزامنة الآن' : 'Sync Now'),
              ),
            ],
          ),
        );
      },
    );
  }
}
