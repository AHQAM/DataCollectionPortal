import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../domain/record_model.dart';

class RequestRecordListItem extends StatelessWidget {
  final RecordModel record;
  final bool isArabic;
  final String requestId;
  final String activityId;

  const RequestRecordListItem({
    super.key,
    required this.record,
    required this.isArabic,
    required this.requestId,
    required this.activityId,
  });

  Future<void> _makePhoneCall(BuildContext context, String phone) async {
    final uri = Uri.parse('tel:$phone');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        if (!context.mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              isArabic
                  ? 'تعذر فتح الاتصال بالرقم: $phone'
                  : 'Could not launch phone call to: $phone',
            ),
          ),
        );
      }
    } catch (_) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isArabic
                ? 'حدث خطأ أثناء محاولة الاتصال'
                : 'Error launching phone call',
          ),
        ),
      );
    }
  }

  Future<void> _openMapLocation(BuildContext context, String query) async {
    final uri = Uri.parse(
      'https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent(query)}',
    );
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (!context.mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              isArabic
                  ? 'تعذر فتح الخرائط للموقع المحدد'
                  : 'Could not open maps for location',
            ),
          ),
        );
      }
    } catch (_) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isArabic
                ? 'حدث خطأ أثناء محاولة فتح الخريطة'
                : 'Error opening maps',
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
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

    final hasPhone = record.phone != null && record.phone!.trim().isNotEmpty;
    final hasArea = record.area != null && record.area!.trim().isNotEmpty;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      elevation: 1.5,
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () {
          context.push(
            '/form/$requestId/$activityId?recordId=${Uri.encodeComponent(record.recordId)}&title=${Uri.encodeComponent(record.customerName)}',
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
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${isArabic ? "رقم العميل" : "Customer No"}: ${record.customerNo}',
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 12,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: statusColor.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(statusIcon, size: 14, color: statusColor),
                        const SizedBox(width: 4),
                        Text(
                          statusText,
                          style: TextStyle(
                            color: statusColor,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(
                    Icons.location_on_outlined,
                    size: 14,
                    color: Colors.grey.shade500,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${isArabic ? "المنطقة" : "Region"}: ${record.assignedRegionNo}',
                    style: TextStyle(color: Colors.grey.shade700, fontSize: 12),
                  ),
                  if (hasArea) ...[
                    const SizedBox(width: 8),
                    Text('•', style: TextStyle(color: Colors.grey.shade400)),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        record.area!,
                        style: TextStyle(
                          color: Colors.grey.shade700,
                          fontSize: 12,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ],
              ),
              if (hasPhone) ...[
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(
                      Icons.phone_outlined,
                      size: 14,
                      color: Colors.grey.shade500,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      record.phone!,
                      style: TextStyle(
                        color: Colors.grey.shade700,
                        fontSize: 12,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 10),
              const Divider(height: 1),
              const SizedBox(height: 8),
              Row(
                children: [
                  if (hasPhone) ...[
                    IconButton.filledTonal(
                      icon: const Icon(Icons.phone, size: 16),
                      tooltip: isArabic ? 'اتصال بالعميل' : 'Call Customer',
                      visualDensity: VisualDensity.compact,
                      onPressed: () => _makePhoneCall(context, record.phone!),
                    ),
                    const SizedBox(width: 6),
                  ],
                  if (hasArea) ...[
                    IconButton.filledTonal(
                      icon: const Icon(Icons.directions, size: 16),
                      tooltip: isArabic ? 'فتح الخريطة' : 'Open in Maps',
                      visualDensity: VisualDensity.compact,
                      onPressed: () => _openMapLocation(context, record.area!),
                    ),
                    const SizedBox(width: 6),
                  ],
                  const Spacer(),
                  Text(
                    isArabic ? 'فتح الاستبيان' : 'Open Form',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.primary,
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
        ),
      ),
    );
  }
}
