import 'package:flutter/material.dart';

class RequestSearchFilterBar extends StatelessWidget {
  final bool isArabic;
  final String statusFilter;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<String> onStatusFilterChanged;

  const RequestSearchFilterBar({
    super.key,
    required this.isArabic,
    required this.statusFilter,
    required this.onSearchChanged,
    required this.onStatusFilterChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
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
            onChanged: (val) => onSearchChanged(val.trim().toLowerCase()),
          ),
          const SizedBox(height: 8),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterChip('ALL', isArabic ? 'الكل' : 'All'),
                const SizedBox(width: 6),
                _buildFilterChip('Published', isArabic ? 'النشطة' : 'Active'),
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
    );
  }

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
      onSelected: (_) => onStatusFilterChanged(key),
    );
  }
}
