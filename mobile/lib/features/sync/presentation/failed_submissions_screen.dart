import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/l10n/app_localizations.dart';

import '../../../core/sync/sync_manager.dart';

class FailedSubmissionsScreen extends ConsumerStatefulWidget {
  const FailedSubmissionsScreen({super.key});

  @override
  ConsumerState<FailedSubmissionsScreen> createState() =>
      _FailedSubmissionsScreenState();
}

class _FailedSubmissionsScreenState
    extends ConsumerState<FailedSubmissionsScreen> {
  late List<Map<String, dynamic>> _failedActions;

  @override
  void initState() {
    super.initState();
    _failedActions = ref.read(syncManagerProvider).getFailedActions();
  }

  void _refresh() {
    setState(() {
      _failedActions = ref.read(syncManagerProvider).getFailedActions();
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final syncManager = ref.read(syncManagerProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.failedSubmissions)),
      body: _failedActions.isEmpty
          ? Center(child: Text(l10n.noFailedSubmissions))
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _failedActions.length,
              separatorBuilder: (_, _) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final failed = _failedActions[index];
                final action = Map<String, dynamic>.from(
                  failed['action'] as Map? ?? const {},
                );
                final actionId = action['id']?.toString() ?? '';
                final reason =
                    failed['reason']?.toString() ?? l10n.errorGeneric;

                return Card(
                  child: ListTile(
                    leading: const Icon(
                      Icons.error_outline,
                      color: Colors.orange,
                    ),
                    title: Text(actionId),
                    subtitle: Text('${l10n.failedSubmissionReason}: $reason'),
                    isThreeLine: true,
                    trailing: PopupMenuButton<String>(
                      onSelected: (value) async {
                        if (value == 'retry') {
                          await syncManager.retryFailedAction(actionId);
                        } else {
                          await syncManager.discardFailedAction(actionId);
                        }
                        if (mounted) _refresh();
                      },
                      itemBuilder: (_) => [
                        PopupMenuItem(value: 'retry', child: Text(l10n.retry)),
                        PopupMenuItem(
                          value: 'discard',
                          child: Text(l10n.discard),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
