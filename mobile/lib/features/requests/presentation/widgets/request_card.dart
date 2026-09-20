import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../domain/request_model.dart';

class RequestCard extends StatelessWidget {
  final RequestModel request;
  final bool isArabic;

  const RequestCard({super.key, required this.request, required this.isArabic});

  @override
  Widget build(BuildContext context) {
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
