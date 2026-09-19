import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/l10n/app_localizations.dart';

import '../domain/record_model.dart';
import 'requests_controller.dart';

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
  ConsumerState<RequestRecordsScreen> createState() => _RequestRecordsScreenState();
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
              isArabic ? 'سجلات العملاء والمتاجر المسندة' : 'Assigned Customer Records',
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.normal),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            padding: const EdgeInsets.all(12),
            color: Theme.of(context).colorScheme.surface,
            child: Column(
              children: [
                TextField(
                  decoration: InputDecoration(
                    hintText: isArabic ? 'بحث باسم العميل، رقم العميل، أو المنطقة...' : 'Search by customer, number, or area...',
                    prefixIcon: const Icon(Icons.search, size: 20),
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
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
                      _buildFilterChip('Pending', isArabic ? 'بانتظار البدء' : 'Pending'),
                      const SizedBox(width: 6),
                      _buildFilterChip('DraftSaved', isArabic ? 'مسودة' : 'Draft'),
                      const SizedBox(width: 6),
                      _buildFilterChip('Submitted', isArabic ? 'مكتمل' : 'Completed'),
                    ],
                  ),
                ),
              ],
            ),
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
                          Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey.shade400),
                          const SizedBox(height: 16),
                          Text(
                            isArabic ? 'لا توجد سجلات محددة مسبقاً لهذا الطلب' : 'No pre-assigned records found for this request',
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            isArabic ? 'يمكنك بدء إدخال جديد مباشرة' : 'You can start a new submission directly',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                          ),
                          const SizedBox(height: 20),
                          ElevatedButton.icon(
                            onPressed: () {
                              context.push(
                                '/form/${widget.requestId}/${widget.activityId}?recordId=REC_${DateTime.now().millisecondsSinceEpoch}&title=${Uri.encodeComponent(widget.requestTitle)}',
                              );
                            },
                            icon: const Icon(Icons.add),
                            label: Text(isArabic ? 'بدء إدخال استبيان' : 'Start Form'),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                // Apply Search & Filter
                final filtered = records.where((r) {
                  if (_statusFilter != 'ALL' && r.recordStatus != _statusFilter) {
                    return false;
                  }
                  if (_searchQuery.isNotEmpty) {
                    final matchName = r.customerName.toLowerCase().contains(_searchQuery);
                    final matchNo = r.customerNo.toLowerCase().contains(_searchQuery);
                    final matchArea = (r.area ?? '').toLowerCase().contains(_searchQuery);
                    if (!matchName && !matchNo && !matchArea) return false;
                  }
                  return true;
                }).toList();

                if (filtered.isEmpty) {
                  return Center(
                    child: Text(
                      isArabic ? 'لا توجد نتائج مطابقة للبحث' : 'No matching records found',
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final record = filtered[index];
                    return _buildRecordCard(context, record, isArabic);
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

  Widget _buildFilterChip(String key, String label) {
    final isSelected = _statusFilter == key;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 12, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
      selected: isSelected,
      onSelected: (_) {
        setState(() {
          _statusFilter = key;
        });
      },
    );
  }

  Widget _buildRecordCard(BuildContext context, RecordModel record, bool isArabic) {
    Color statusColor;
    String statusText;
    IconData statusIcon;

    switch (record.recordStatus) {
      case 'Submitted':
      case 'Completed':
        statusColor = const Color(0xFF059669);
        statusText = isArabic ? 'مكتمل' : 'Completed';
        statusIcon = Icons.check_circle;
        break;
      case 'DraftSaved':
        statusColor = Colors.orange;
        statusText = isArabic ? 'مسودة' : 'Draft';
        statusIcon = Icons.edit_note;
        break;
      default:
        statusColor = Colors.blue;
        statusText = isArabic ? 'بانتظار البدء' : 'Pending';
        statusIcon = Icons.schedule;
        break;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () {
          context.push(
            '/form/${widget.requestId}/${widget.activityId}?recordId=${Uri.encodeComponent(record.recordId)}&title=${Uri.encodeComponent(record.customerName)}',
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(14.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          record.customerName,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${isArabic ? "رقم العميل" : "Customer No"}: ${record.customerNo}',
                          style: TextStyle(color: Colors.grey.shade600, fontSize: 12, fontFamily: 'monospace'),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(statusIcon, size: 14, color: statusColor),
                        const SizedBox(width: 4),
                        Text(
                          statusText,
                          style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.location_on_outlined, size: 14, color: Colors.grey.shade500),
                  const SizedBox(width: 4),
                  Text(
                    '${isArabic ? "المنطقة" : "Region"}: ${record.assignedRegionNo}',
                    style: TextStyle(color: Colors.grey.shade700, fontSize: 12),
                  ),
                  if (record.area != null && record.area!.isNotEmpty) ...[
                    const SizedBox(width: 8),
                    Text('•', style: TextStyle(color: Colors.grey.shade400)),
                    const SizedBox(width: 8),
                    Text(
                      record.area!,
                      style: TextStyle(color: Colors.grey.shade700, fontSize: 12),
                    ),
                  ],
                  const Spacer(),
                  const Icon(Icons.chevron_right, size: 18, color: Colors.grey),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

