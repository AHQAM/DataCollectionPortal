import 'package:flutter/material.dart';

import 'package:mobile/features/forms/domain/form_field_model.dart';

/// Star rating form field
class RatingFormField extends StatefulWidget {
  final FormFieldModel field;
  final bool isArabic;
  final ValueChanged<int> onChanged;
  final FormFieldSetter<int> onSaved;

  const RatingFormField({
    super.key,
    required this.field,
    required this.isArabic,
    required this.onChanged,
    required this.onSaved,
  });

  @override
  State<RatingFormField> createState() => _RatingFormFieldState();
}

class _RatingFormFieldState extends State<RatingFormField> {
  int _rating = 0;

  @override
  Widget build(BuildContext context) {
    final label = widget.isArabic ? widget.field.labelAr : widget.field.labelEn;

    return FormField<int>(
      validator: (val) {
        if (widget.field.isRequired && _rating == 0) {
          return widget.isArabic
              ? (widget.field.validationMessageAr ?? 'يرجى تحديد التقييم')
              : (widget.field.validationMessageEn ?? 'Rating is required');
        }
        return null;
      },
      onSaved: (_) => widget.onSaved(_rating),
      builder: (state) {
        return Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: BorderSide(
              color: state.hasError
                  ? Theme.of(context).colorScheme.error
                  : Colors.grey.shade300,
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(14.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        label,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    if (widget.field.isRequired)
                      const Text(
                        ' *',
                        style: TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (index) {
                    final starValue = index + 1;
                    return IconButton(
                      icon: Icon(
                        starValue <= _rating ? Icons.star : Icons.star_border,
                        color: Colors.amber,
                        size: 32,
                      ),
                      onPressed: widget.field.isReadOnly
                          ? null
                          : () {
                              setState(() {
                                _rating = starValue;
                              });
                              widget.onChanged(_rating);
                              state.didChange(_rating);
                            },
                    );
                  }),
                ),
                if (state.hasError)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      state.errorText ?? '',
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                        fontSize: 12,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
