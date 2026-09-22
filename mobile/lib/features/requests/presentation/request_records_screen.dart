import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/l10n/app_localizations.dart';

import 'requests_controller.dart';
import 'widgets/request_records_header.dart';
import 'widgets/request_record_list_item.dart';

class RequestRecordsScreen extends ConsumerStatefulWidget {
  final String requestId;
  final String activityId;
  final String requestTitle;

  const RequestRecordsScreen({
    super.key,
    required this.requestId,
    required this.activityId,
    required this.requestTitle,
  });

  @override
  ConsumerState<RequestRecordsScreen> createState() =>
      _RequestRecordsScreenState();
}

class _RequestRecordsScreenState extends ConsumerState<RequestRecordsScreen> {
  String _searchQuery = '';
  String _statusFilter = 'ALL';

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    final recordsAsync = ref.watch(requestRecordsProvider(widget.requestId));

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.requestTitle,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            Text(
              isArabic
                  ? 'السجلات والجهات المسندة'
                  : 'Assigned Records & Entities',
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Search & Filter Header
          RequestRecordsHeader(
            isArabic: isArabic,
            statusFilter: _statusFilter,
            onSearchChanged: (val) {
              setState(() {
                _searchQuery = val;
              });
            },
            onStatusFilterChanged: (val) {
              setState(() {
                _statusFilter = val;
              });
            },
          ),
          const Divider(height: 1),

          // Records List
          Expanded(
            child: recordsAsync.when(
              data: (records) {
                // If there are no records at all in Firestore for this request, allow direct entry
                if (records.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.inventory_2_outlined,
                            size: 64,
                            color: Colors.grey.shade400,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            isArabic
                                ? 'لا توجد سجلات محددة مسبقاً لهذا الطلب'
                                : 'No pre-assigned records found for this request',
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            isArabic
                                ? 'يمكنك بدء إدخال جديد مباشرة'
                                : 'You can start a new submission directly',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Colors.grey.shade600,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 20),
                          ElevatedButton.icon(
                            onPressed: () {
                              context.push(
                                '/form/${widget.requestId}/${widget.activityId}?recordId=REC_${DateTime.now().millisecondsSinceEpoch}&title=${Uri.encodeComponent(widget.requestTitle)}',
                              );
                            },
                            icon: const Icon(Icons.add),
                            label: Text(
                              isArabic ? 'بدء إدخال استبيان' : 'Start Form',
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                // Apply Search & Filter
                final filtered = records.where((r) {
                  if (_statusFilter != 'ALL' &&
                      r.recordStatus != _statusFilter) {
                    return false;
                  }
                  if (_searchQuery.isNotEmpty) {
                    final matchName = r.customerName.toLowerCase().contains(
                      _searchQuery,
                    );
                    final matchNo = r.customerNo.toLowerCase().contains(
                      _searchQuery,
                    );
                    final matchArea = (r.area ?? '').toLowerCase().contains(
                      _searchQuery,
                    );
                    if (!matchName && !matchNo && !matchArea) return false;
                  }
                  return true;
                }).toList();

                if (filtered.isEmpty) {
                  return Center(
                    child: Text(
                      isArabic
                          ? 'لا توجد نتائج مطابقة للبحث'
                          : 'No matching records found',
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final record = filtered[index];
                    return RequestRecordListItem(
                      record: record,
                      isArabic: isArabic,
                      requestId: widget.requestId,
                      activityId: widget.activityId,
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, _) => Center(
                child: Text(
                  '${l10n.errorGeneric}\n$err',
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
