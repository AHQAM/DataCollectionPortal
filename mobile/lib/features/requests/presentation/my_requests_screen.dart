import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';

import 'requests_controller.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../../core/storage/hive_service.dart';
import '../../../core/network/network_info.dart';

class MyRequestsScreen extends ConsumerWidget {
  const MyRequestsScreen({super.key});

  void _showSyncStatusModal(
    BuildContext context,
    WidgetRef ref,
    bool isArabic,
  ) async {
    final hiveService = ref.read(hiveServiceProvider);
    final networkInfo = ref.read(networkInfoProvider);
    final isOnline = await networkInfo.isConnected;
    final queueCount = hiveService.syncQueueBox.length;

    if (!context.mounted) return;

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
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
                  Navigator.of(ctx).pop();
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

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    final requestsAsyncValue = ref.watch(myRequestsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.myRequests),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            tooltip: isArabic ? 'الإشعارات' : 'Notifications',
            onPressed: () {
              context.push('/notifications');
            },
          ),
          IconButton(
            icon: const Icon(Icons.sync),
            tooltip: isArabic ? 'حالة المزامنة' : 'Sync Status',
            onPressed: () => _showSyncStatusModal(context, ref, isArabic),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              ref.read(authControllerProvider.notifier).logout();
            },
          ),
        ],
      ),
      body: requestsAsyncValue.when(
        data: (requests) {
          if (requests.isEmpty) {
            return Center(
              child: Text(
                l10n.emptyState,
                style: Theme.of(context).textTheme.titleMedium,
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: requests.length,
            itemBuilder: (context, index) {
              final request = requests[index];
              final title =
                  (isArabic
                      ? request.metadata['titleAr']
                      : request.metadata['titleEn']) ??
                  (request.metadata['titleAr'] ??
                      'Activity: ${request.activityId}');

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                child: ListTile(
                  title: Text(
                    title.toString(),
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text(
                    '${isArabic ? "الحالة" : "Status"}: ${request.status}\n${isArabic ? "رمز الطلب" : "Code"}: ${request.metadata['requestCode'] ?? request.activityId}',
                  ),
                  isThreeLine: true,
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    context.push(
                      '/request/${request.id}/records?activityId=${request.activityId}&title=${Uri.encodeComponent(title.toString())}',
                    );
                  },
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Text(
            '${l10n.errorGeneric}\n$error',
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
