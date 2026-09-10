import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/l10n/app_localizations.dart';
import 'notifications_controller.dart';
import 'package:intl/intl.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationsAsync = ref.watch(myNotificationsProvider);
    final l10n = AppLocalizations.of(context)!;
    final isAr = Localizations.localeOf(context).languageCode == 'ar';

    return Scaffold(
      appBar: AppBar(title: Text(l10n.notifications)),
      body: notificationsAsync.when(
        data: (notifications) {
          if (notifications.isEmpty) {
            return Center(
              child: Text(l10n.noNotifications),
            );
          }
          return ListView.builder(
            itemCount: notifications.length,
            itemBuilder: (context, index) {
              final notification = notifications[index];
              final isUnread = notification.status != 'READ';

              return ListTile(
                tileColor: isUnread ? Colors.blue.withValues(alpha: 0.1) : null,
                leading: Icon(
                  isUnread ? Icons.notifications_active : Icons.notifications,
                  color: isUnread
                      ? Theme.of(context).primaryColor
                      : Colors.grey,
                ),
                title: Text(
                  isAr ? notification.titleAr : notification.titleEn,
                  style: TextStyle(
                    fontWeight: isUnread ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(isAr ? notification.bodyAr : notification.bodyEn),
                    const SizedBox(height: 4),
                    Text(
                      DateFormat.yMd().add_jm().format(notification.sentAt),
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
                onTap: () {
                  if (isUnread) {
                    ref
                        .read(notificationsControllerProvider.notifier)
                        .markAsRead(notification.notificationId);
                  }
                  // Optionally navigate based on notification.data
                },
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
      ),
    );
  }
}
