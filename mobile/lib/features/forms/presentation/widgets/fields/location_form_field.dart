import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

import 'package:mobile/features/forms/domain/form_field_model.dart';

const Color _emerald = Color(0xFF059669);
const Color _emeraldLight = Color(0xFFECFDF5);
const Color _emeraldBorder = Color(0xFFA7F3D0);

/// Location picker field with GPS coordinates
class LocationFormField extends StatefulWidget {
  final FormFieldModel field;
  final bool isArabic;
  final ValueChanged<dynamic> onChanged;
  final FormFieldValidator<dynamic>? validator;

  const LocationFormField({
    super.key,
    required this.field,
    required this.isArabic,
    required this.onChanged,
    this.validator,
  });

  @override
  State<LocationFormField> createState() => _LocationFormFieldState();
}

class _LocationFormFieldState extends State<LocationFormField> {
  Position? _position;
  bool _loading = false;
  String? _error;

  Future<void> _getCurrentLocation() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() {
          _error = widget.isArabic
              ? 'خدمة تحديد الموقع الجغرافي (GPS) غير مفعلة'
              : 'Location service is disabled';
          _loading = false;
        });
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() {
            _error = widget.isArabic
                ? 'تم رفض إذن الوصول للموقع'
                : 'Location permission denied';
            _loading = false;
          });
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        setState(() {
          _error = widget.isArabic
              ? 'إذن الموقع مرفوض دائماً. يرجى تفعيله من الإعدادات'
              : 'Location permission permanently denied';
          _loading = false;
        });
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 15),
        ),
      );

      setState(() {
        _position = position;
        _loading = false;
      });

      final locationData = {
        'latitude': position.latitude,
        'longitude': position.longitude,
        'accuracy': position.accuracy,
        'timestamp': DateTime.now().toIso8601String(),
      };

      widget.onChanged(locationData);
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final label = widget.isArabic ? widget.field.labelAr : widget.field.labelEn;

    return FormField<dynamic>(
      validator: (val) {
        if (widget.field.isRequired && _position == null) {
          return widget.isArabic
              ? (widget.field.validationMessageAr ?? 'يرجى تحديد الموقع')
              : (widget.field.validationMessageEn ?? 'Location is required');
        }
        return null;
      },
      builder: (state) {
        return Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(
              color: state.hasError
                  ? Theme.of(context).colorScheme.error
                  : Colors.grey.shade300,
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.location_on,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(width: 8),
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
                const SizedBox(height: 12),
                if (_position != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _emeraldLight,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: _emeraldBorder),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.check_circle,
                          color: _emerald,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Lat: ${_position!.latitude.toStringAsFixed(6)}, Lng: ${_position!.longitude.toStringAsFixed(6)}',
                            style: const TextStyle(
                              fontFamily: 'monospace',
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                if (_error != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      _error!,
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                        fontSize: 12,
                      ),
                    ),
                  ),
                if (state.hasError)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      state.errorText ?? '',
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                        fontSize: 12,
                      ),
                    ),
                  ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: _loading ? null : _getCurrentLocation,
                    icon: _loading
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.my_location, size: 18),
                    label: Text(
                      _position == null
                          ? (widget.isArabic
                                ? 'تحديد الموقع الآن'
                                : 'Get Current Location')
                          : (widget.isArabic
                                ? 'تحديث الموقع'
                                : 'Update Location'),
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
