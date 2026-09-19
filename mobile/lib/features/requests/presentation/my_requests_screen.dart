import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:mobile/l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';

import 'requests_controller.dart';
import '../domain/request_model.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../../core/storage/hive_service.dart';
import '../../../core/network/network_info.dart';

class MyRequestsScreen extends ConsumerStatefulWidget {
  const MyRequestsScreen({super.key});

  @override
  ConsumerState<MyRequestsScreen> createState() => _MyRequestsScreenState();
}

class _MyRequestsScreenState extends ConsumerState<MyRequestsScreen> {
  String _searchQuery = '';
  String _statusFilter = 'ALL'; // 'ALL' | 'Published' | 'Completed'

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
  Widget build(BuildContext context) {
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
      body: Column(
        children: [
          // Search and filter chips section
          Container(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
            color: Theme.of(context).colorScheme.surface,
            child: Column(
              children: [
                TextField(
                  decoration: InputDecoration(
                    hintText: isArabic
                        ? 'بحث باسم الطلب أو الرمز...'
                        : 'Search requests by title or code...',
                    prefixIcon: const Icon(Icons.search, size: 20),
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onChanged: (val) {
                    setState(() {
                      _searchQuery = val.trim().toLowerCase();
                    });
                  },
                ),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('ALL', isArabic ? 'الكل' : 'All'),
                      const SizedBox(width: 6),
                      _buildFilterChip(
                        'Published',
                        isArabic ? 'النشطة' : 'Active',
                      ),
                      const SizedBox(width: 6),
                      _buildFilterChip(
                        'Completed',
                        isArabic ? 'المكتملة / المغلقة' : 'Completed',
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Requests list
          Expanded(
            child: requestsAsyncValue.when(
              data: (requests) {
                if (requests.isEmpty) {
                  return Center(
                    child: Text(
                      l10n.emptyState,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  );
                }

                // Filter requests
                final filtered = requests.where((req) {
                  // Status filter
                  if (_statusFilter == 'Published' &&
                      req.status != 'Published') {
                    return false;
                  }
                  if (_statusFilter == 'Completed' &&
                      req.status != 'Closed' &&
                      req.status != 'Archived') {
                    return false;
                  }

                  // Search query filter
                  if (_searchQuery.isNotEmpty) {
                    final titleAr = (req.metadata['titleAr'] ?? '')
                        .toString()
                        .toLowerCase();
                    final titleEn = (req.metadata['titleEn'] ?? '')
                        .toString()
                        .toLowerCase();
                    final code = (req.metadata['requestCode'] ?? '')
                        .toString()
                        .toLowerCase();
                    final actId = req.activityId.toLowerCase();

                    final match =
                        titleAr.contains(_searchQuery) ||
                        titleEn.contains(_searchQuery) ||
                        code.contains(_searchQuery) ||
                        actId.contains(_searchQuery);

                    if (!match) return false;
                  }

                  return true;
                }).toList();

                if (filtered.isEmpty) {
                  return Center(
                    child: Text(
                      isArabic
                          ? 'لا توجد طلبات مطابقة للبحث'
                          : 'No matching requests found',
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(14),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final request = filtered[index];
                    return _buildRequestCard(context, request, isArabic);
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
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final isSelected = _statusFilter == key;
    return ChoiceChip(
      label: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
      selected: isSelected,
      onSelected: (_) {
        setState(() {
          _statusFilter = key;
        });
      },
    );
  }

  Widget _buildRequestCard(
    BuildContext context,
    RequestModel request,
    bool isArabic,
  ) {
    final title =
        (isArabic
            ? request.metadata['titleAr']
            : request.metadata['titleEn']) ??
        (request.metadata['titleAr'] ?? 'Activity: ${request.activityId}');

    final requestCode = request.metadata['requestCode'] ?? request.activityId;
    final isPublished = request.status == 'Published';

    // Due date and remaining days
    final dueDate = request.dueDate;
    int? daysRemaining;
    bool isOverdue = false;
    bool isDueToday = false;

    if (dueDate != null) {
      final now = DateTime.now();
      final todayDate = DateTime(now.year, now.month, now.day);
      final targetDate = DateTime(dueDate.year, dueDate.month, dueDate.day);
      daysRemaining = targetDate.difference(todayDate).inDays;
      if (daysRemaining < 0) {
        isOverdue = true;
      } else if (daysRemaining == 0) {
        isDueToday = true;
      }
    }

    // Target scope
    final targetBranches = request.metadata['targetBranches'];
    final targetRegions = request.metadata['targetRegions'];

    String scopeText = '';
    if (targetBranches is List && targetBranches.isNotEmpty) {
      scopeText = isArabic
          ? 'الفروع المستهدفة: ${targetBranches.length}'
          : 'Target Branches: ${targetBranches.length}';
    }
    if (targetRegions is List && targetRegions.isNotEmpty) {
      final regStr = isArabic
          ? 'المناطق: ${targetRegions.length}'
          : 'Regions: ${targetRegions.length}';
      scopeText = scopeText.isEmpty ? regStr : '$scopeText • $regStr';
    }
    if (scopeText.isEmpty) {
      scopeText = isArabic ? 'نطاق عام (كل الفروع)' : 'All Branches Scope';
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 1.5,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          context.push(
            '/request/${request.id}/records?activityId=${request.activityId}&title=${Uri.encodeComponent(title.toString())}',
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header: Title + Status Chip
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title.toString(),
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.blue.shade50,
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: Colors.blue.shade200),
                              ),
                              child: Text(
                                requestCode.toString(),
                                style: TextStyle(
                                  fontSize: 11,
                                  fontFamily: 'monospace',
                                  fontWeight: FontWeight.bold,
                                  color: Colors.blue.shade800,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              scopeText,
                              style: TextStyle(
                                fontSize: 11,
                                color: Colors.grey.shade600,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: isPublished
                          ? const Color(0xFF059669).withValues(alpha: 0.12)
                          : Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isPublished
                            ? const Color(0xFF059669).withValues(alpha: 0.3)
                            : Colors.grey.shade300,
                      ),
                    ),
                    child: Text(
                      isPublished
                          ? (isArabic ? 'نشط' : 'Active')
                          : (isArabic ? 'مغلق' : 'Closed'),
                      style: TextStyle(
                        color: isPublished
                            ? const Color(0xFF059669)
                            : Colors.grey.shade700,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 10),

              // Footer: Due Date & Countdown + Action
              Row(
                children: [
                  if (dueDate != null) ...[
                    Icon(
                      Icons.calendar_today_outlined,
                      size: 14,
                      color: Colors.grey.shade600,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      DateFormat('yyyy/MM/dd').format(dueDate),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade700,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: isOverdue
                            ? Colors.red.shade50
                            : isDueToday
                            ? Colors.amber.shade50
                            : Colors.green.shade50,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: isOverdue
                              ? Colors.red.shade200
                              : isDueToday
                              ? Colors.amber.shade200
                              : Colors.green.shade200,
                        ),
                      ),
                      child: Text(
                        isOverdue
                            ? (isArabic
                                  ? 'متأخر (${daysRemaining!.abs()} يوم)'
                                  : 'Overdue (${daysRemaining!.abs()}d)')
                            : isDueToday
                            ? (isArabic ? 'ينتهي اليوم' : 'Due today')
                            : (isArabic
                                  ? 'متبقي $daysRemaining يوم'
                                  : '$daysRemaining days left'),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isOverdue
                              ? Colors.red.shade800
                              : isDueToday
                              ? Colors.amber.shade900
                              : Colors.green.shade800,
                        ),
                      ),
                    ),
                  ] else ...[
                    Icon(
                      Icons.event_available,
                      size: 14,
                      color: Colors.grey.shade500,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      isArabic ? 'مفتوح بدون موعد نهائي' : 'No deadline',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                  const Spacer(),
                  Row(
                    children: [
                      Text(
                        isArabic ? 'عرض السجلات' : 'View Records',
                        style: TextStyle(
                          fontSize: 12,
                          color: Theme.of(context).colorScheme.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 2),
                      Icon(
                        isArabic ? Icons.chevron_left : Icons.chevron_right,
                        size: 16,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
