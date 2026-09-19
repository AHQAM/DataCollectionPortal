import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:signature/signature.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../../domain/form_field_model.dart';

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
                        style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
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
                        const Icon(Icons.check_circle, color: _emerald, size: 20),
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
                          ? (widget.isArabic ? 'تحديد الموقع الآن' : 'Get Current Location')
                          : (widget.isArabic ? 'تحديث الموقع' : 'Update Location'),
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

/// Photo capture and upload form field
class PhotoFormField extends StatefulWidget {
  final FormFieldModel field;
  final bool isArabic;
  final String requestId;
  final String recordId;
  final ValueChanged<String> onChanged;

  const PhotoFormField({
    super.key,
    required this.field,
    required this.isArabic,
    required this.requestId,
    required this.recordId,
    required this.onChanged,
  });

  @override
  State<PhotoFormField> createState() => _PhotoFormFieldState();
}

class _PhotoFormFieldState extends State<PhotoFormField> {
  XFile? _imageFile;
  String? _uploadedUrl;
  bool _uploading = false;
  String? _error;

  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage(ImageSource source) async {
    try {
      final picked = await _picker.pickImage(
        source: source,
        maxWidth: 1600,
        maxHeight: 1600,
        imageQuality: 85,
      );

      if (picked == null) return;

      setState(() {
        _imageFile = picked;
        _uploading = true;
        _error = null;
      });

      // Upload to Firebase Storage
      final uid = FirebaseAuth.instance.currentUser?.uid ?? 'rep_user';
      final fileName = 'photo_${DateTime.now().millisecondsSinceEpoch}.jpg';
      final ref = FirebaseStorage.instance
          .ref()
          .child('uploads')
          .child(widget.requestId)
          .child(widget.recordId)
          .child(uid)
          .child(fileName);

      final bytes = await picked.readAsBytes();
      final uploadTask = await ref.putData(
        bytes,
        SettableMetadata(contentType: 'image/jpeg'),
      );

      final downloadUrl = await uploadTask.ref.getDownloadURL();

      setState(() {
        _uploadedUrl = downloadUrl;
        _uploading = false;
      });

      widget.onChanged(downloadUrl);
    } catch (e) {
      // If offline or storage error, fallback to local path
      setState(() {
        _uploading = false;
        if (_imageFile != null) {
          _uploadedUrl = _imageFile!.path;
          widget.onChanged(_imageFile!.path);
        } else {
          _error = e.toString();
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final label = widget.isArabic ? widget.field.labelAr : widget.field.labelEn;

    return FormField<String>(
      validator: (val) {
        if (widget.field.isRequired && _uploadedUrl == null) {
          return widget.isArabic
              ? (widget.field.validationMessageAr ?? 'يرجى التقاط أو اختيار صورة')
              : (widget.field.validationMessageEn ?? 'Photo is required');
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
                      Icons.camera_alt,
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
                        style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                if (_imageFile != null)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: SizedBox(
                      height: 160,
                      width: double.infinity,
                      child: Image.file(
                        File(_imageFile!.path),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                if (_uploading)
                  const Padding(
                    padding: EdgeInsets.all(12),
                    child: Center(
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                          SizedBox(width: 8),
                          Text('جاري رفع الصورة...'),
                        ],
                      ),
                    ),
                  ),
                if (_uploadedUrl != null && !_uploading)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle, color: _emerald, size: 16),
                        const SizedBox(width: 4),
                        Text(
                          widget.isArabic ? 'تم حفظ الصورة بنجاح' : 'Image saved successfully',
                          style: const TextStyle(color: _emerald, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                if (state.hasError || _error != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      _error ?? state.errorText ?? '',
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                        fontSize: 12,
                      ),
                    ),
                  ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _uploading ? null : () => _pickImage(ImageSource.camera),
                        icon: const Icon(Icons.camera_alt, size: 18),
                        label: Text(widget.isArabic ? 'الكاميرا' : 'Camera'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _uploading ? null : () => _pickImage(ImageSource.gallery),
                        icon: const Icon(Icons.photo_library, size: 18),
                        label: Text(widget.isArabic ? 'المعرض' : 'Gallery'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

/// Signature canvas and capture form field
class SignatureFormField extends StatefulWidget {
  final FormFieldModel field;
  final bool isArabic;
  final String requestId;
  final String recordId;
  final ValueChanged<String> onChanged;

  const SignatureFormField({
    super.key,
    required this.field,
    required this.isArabic,
    required this.requestId,
    required this.recordId,
    required this.onChanged,
  });

  @override
  State<SignatureFormField> createState() => _SignatureFormFieldState();
}

class _SignatureFormFieldState extends State<SignatureFormField> {
  final SignatureController _controller = SignatureController(
    penStrokeWidth: 3,
    penColor: Colors.black,
    exportBackgroundColor: Colors.white,
  );

  bool _isSigned = false;
  bool _uploading = false;
  String? _signatureUrl;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _saveSignature() async {
    if (_controller.isEmpty) return;

    setState(() {
      _uploading = true;
    });

    try {
      final bytes = await _controller.toPngBytes();
      if (bytes == null) {
        setState(() => _uploading = false);
        return;
      }

      final uid = FirebaseAuth.instance.currentUser?.uid ?? 'rep_user';
      final fileName = 'sig_${DateTime.now().millisecondsSinceEpoch}.png';
      final ref = FirebaseStorage.instance
          .ref()
          .child('uploads')
          .child(widget.requestId)
          .child(widget.recordId)
          .child(uid)
          .child(fileName);

      final uploadTask = await ref.putData(
        bytes,
        SettableMetadata(contentType: 'image/png'),
      );

      final downloadUrl = await uploadTask.ref.getDownloadURL();

      setState(() {
        _signatureUrl = downloadUrl;
        _isSigned = true;
        _uploading = false;
      });

      widget.onChanged(downloadUrl);
    } catch (e) {
      // Offline fallback: save base64
      final bytes = await _controller.toPngBytes();
      if (bytes != null) {
        final base64String = 'data:image/png;base64,${base64Encode(bytes)}';
        setState(() {
          _signatureUrl = base64String;
          _isSigned = true;
          _uploading = false;
        });
        widget.onChanged(base64String);
      } else {
        setState(() => _uploading = false);
      }
    }
  }

  void _clearSignature() {
    _controller.clear();
    setState(() {
      _isSigned = false;
      _signatureUrl = null;
    });
    widget.onChanged('');
  }

  @override
  Widget build(BuildContext context) {
    final label = widget.isArabic ? widget.field.labelAr : widget.field.labelEn;

    return FormField<String>(
      validator: (val) {
        if (widget.field.isRequired && !_isSigned) {
          return widget.isArabic
              ? (widget.field.validationMessageAr ?? 'يرجى التوقيع واعتماده')
              : (widget.field.validationMessageEn ?? 'Signature is required');
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
                      Icons.draw,
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
                        style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.shade300),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Signature(
                      controller: _controller,
                      height: 140,
                      backgroundColor: Colors.grey.shade50,
                    ),
                  ),
                ),
                if (_isSigned && _signatureUrl != null)
                  const Padding(
                    padding: EdgeInsets.only(top: 8),
                    child: Row(
                      children: [
                        Icon(Icons.check_circle, color: _emerald, size: 16),
                        SizedBox(width: 4),
                        Text(
                          'تم اعتماد التوقيع ✓',
                          style: TextStyle(color: _emerald, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ],
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
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _clearSignature,
                        child: Text(widget.isArabic ? 'مسح' : 'Clear'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _uploading ? null : _saveSignature,
                        child: _uploading
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : Text(widget.isArabic ? 'اعتماد التوقيع' : 'Confirm'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

/// Barcode input and scanner field
class BarcodeFormField extends StatelessWidget {
  final FormFieldModel field;
  final bool isArabic;
  final ValueChanged<String> onChanged;
  final FormFieldSetter<String> onSaved;

  const BarcodeFormField({
    super.key,
    required this.field,
    required this.isArabic,
    required this.onChanged,
    required this.onSaved,
  });

  @override
  Widget build(BuildContext context) {
    final label = isArabic ? field.labelAr : field.labelEn;

    return TextFormField(
      decoration: InputDecoration(
        labelText: label,
        hintText: isArabic ? 'أدخل أو امسح الباركود' : 'Enter or scan barcode',
        prefixIcon: const Icon(Icons.qr_code_scanner),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      readOnly: field.isReadOnly,
      validator: (value) {
        if (field.isRequired && (value == null || value.trim().isEmpty)) {
          return isArabic
              ? (field.validationMessageAr ?? 'يرجى إدخال رمز الباركود')
              : (field.validationMessageEn ?? 'Barcode is required');
        }
        return null;
      },
      onChanged: onChanged,
      onSaved: (val) => onSaved(val ?? ''),
    );
  }
}
