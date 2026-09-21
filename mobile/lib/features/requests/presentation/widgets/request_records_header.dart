import 'package:flutter/material.dart';

class RequestRecordsHeader extends StatelessWidget {
  final bool isArabic;
  final String statusFilter;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<String> onStatusFilterChanged;

  const RequestRecordsHeader({
    super.key,
    required this.isArabic,
    required this.statusFilter,
    required this.onSearchChanged,
    required this.onStatusFilterChanged,
  });

  Widget _buildFilterChip(String key, String label) {
    final isSelected = statusFilter == key;
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
        onStatusFilterChanged(key);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      color: Theme.of(context).colorScheme.surface,
      child: Column(
        children: [
          TextField(
            decoration: InputDecoration(
              hintText: isArabic
                  ? 'بحث باسم العميل، رقم العميل، أو المنطقة...'
                  : 'Search by customer, number, or area...',
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
              onSearchChanged(val.trim().toLowerCase());
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
                  'Pending',
                  isArabic ? 'بانتظار البدء' : 'Pending',
                ),
                const SizedBox(width: 6),
                _buildFilterChip('DraftSaved', isArabic ? 'مسودة' : 'Draft'),
                const SizedBox(width: 6),
                _buildFilterChip('Submitted', isArabic ? 'مكتمل' : 'Completed'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
