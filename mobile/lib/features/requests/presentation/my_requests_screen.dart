import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';

import 'requests_controller.dart';
import '../../auth/presentation/auth_controller.dart';

class MyRequestsScreen extends ConsumerWidget {
  const MyRequestsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final requestsAsyncValue = ref.watch(myRequestsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.myRequests),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              // TODO: Navigate to settings/sync status
            },
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
              final isArabic = Localizations.localeOf(context).languageCode == 'ar';
              final title = (isArabic
                  ? request.metadata['titleAr']
                  : request.metadata['titleEn']) ?? (request.metadata['titleAr'] ?? 'Activity: ${request.activityId}');

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  title: Text(
                    title.toString(),
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text(
                    '${isArabic ? "الحالة" : "Status"}: ${request.status}\n${isArabic ? "المعرف" : "ID"}: ${request.activityId}',
                  ),
                  isThreeLine: true,
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    context.push(
                      '/form/${request.id}/${request.activityId}?recordId=${Uri.encodeComponent(request.id)}&title=${Uri.encodeComponent(title.toString())}',
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
