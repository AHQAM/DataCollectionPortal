import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/utils/error_formatter.dart';

import 'requests_controller.dart';
import '../../auth/presentation/auth_controller.dart';
import 'widgets/sync_status_bottom_sheet.dart';
import 'widgets/request_search_filter_bar.dart';
import 'widgets/request_card.dart';

class MyRequestsScreen extends ConsumerStatefulWidget {
  const MyRequestsScreen({super.key});

  @override
  ConsumerState<MyRequestsScreen> createState() => _MyRequestsScreenState();
}

class _MyRequestsScreenState extends ConsumerState<MyRequestsScreen> {
  String _searchQuery = '';
  String _statusFilter = 'ALL'; // 'ALL' | 'Published' | 'Completed'

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    final requestsAsyncValue = ref.watch(myRequestsProvider);
    final userState = ref.watch(authControllerProvider);
    final isSupervisorOrAdmin =
        userState.value?.role == 'SUPERVISOR' ||
        userState.value?.role == 'ADMIN';

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.myRequests),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            tooltip: isArabic ? 'الإشعارات' : 'Notifications',
            onPressed: () => context.push('/notifications'),
          ),
          IconButton(
            icon: const Icon(Icons.lock_reset),
            tooltip: isArabic ? 'تغيير كلمة المرور' : 'Change Password',
            onPressed: () => context.push('/change-password'),
          ),
          IconButton(
            icon: const Icon(Icons.sync),
            tooltip: isArabic ? 'حالة المزامنة' : 'Sync Status',
            onPressed: () => SyncStatusBottomSheet.show(context, ref, isArabic),
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
          if (isSupervisorOrAdmin)
            Container(
              width: double.infinity,
              color: Colors.indigo.shade50,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  Icon(
                    Icons.admin_panel_settings,
                    color: Colors.indigo.shade700,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      isArabic ? 'فتح لوحة تحكم الإدارة' : 'Open Web Admin',
                      style: TextStyle(
                        color: Colors.indigo.shade900,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () async {
                      final url = Uri.parse(
                        'https://landsurvey-ebb3b.web.app/',
                      );
                      if (await canLaunchUrl(url)) {
                        await launchUrl(
                          url,
                          mode: LaunchMode.externalApplication,
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.indigo,
                      foregroundColor: Colors.white,
                    ),
                    child: Text(isArabic ? 'فتح' : 'Open'),
                  ),
                ],
              ),
            ),
          // Search and filter chips section
          RequestSearchFilterBar(
            isArabic: isArabic,
            statusFilter: _statusFilter,
            onSearchChanged: (query) => setState(() => _searchQuery = query),
            onStatusFilterChanged: (filter) =>
                setState(() => _statusFilter = filter),
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
                    return RequestCard(
                      request: filtered[index],
                      isArabic: isArabic,
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, stack) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.error_outline,
                        size: 48,
                        color: Colors.red,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        AppErrorFormatter.format(error, context),
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: () => ref.refresh(myRequestsProvider),
                        icon: const Icon(Icons.refresh, size: 18),
                        label: Text(isArabic ? 'إعادة المحاولة' : 'Retry'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
