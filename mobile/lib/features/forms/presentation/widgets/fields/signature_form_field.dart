import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:signature/signature.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:firebase_auth/firebase_auth.dart';

import 'package:mobile/features/forms/domain/form_field_model.dart';

const Color _emerald = Color(0xFF059669);



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
                        style: TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
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
                          style: TextStyle(
                            color: _emerald,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
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
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : Text(
                                widget.isArabic ? 'اعتماد التوقيع' : 'Confirm',
                              ),
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
