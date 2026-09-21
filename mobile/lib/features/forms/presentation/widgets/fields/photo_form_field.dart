import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:firebase_auth/firebase_auth.dart';

import 'package:mobile/features/forms/domain/form_field_model.dart';

const Color _emerald = Color(0xFF059669);



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
              ? (widget.field.validationMessageAr ??
                    'يرجى التقاط أو اختيار صورة')
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
                        style: TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
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
                        const Icon(
                          Icons.check_circle,
                          color: _emerald,
                          size: 16,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          widget.isArabic
                              ? 'تم حفظ الصورة بنجاح'
                              : 'Image saved successfully',
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
                        onPressed: _uploading
                            ? null
                            : () => _pickImage(ImageSource.camera),
                        icon: const Icon(Icons.camera_alt, size: 18),
                        label: Text(widget.isArabic ? 'الكاميرا' : 'Camera'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _uploading
                            ? null
                            : () => _pickImage(ImageSource.gallery),
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
