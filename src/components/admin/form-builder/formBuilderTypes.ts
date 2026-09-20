import { FieldType } from '../../../types';

export interface FieldTypeOption {
  type: FieldType;
  labelAr: string;
  labelEn: string;
  icon: string;
}

export const ALL_FIELD_TYPES: FieldTypeOption[] = [
  { type: 'text', labelAr: 'نص قصير', labelEn: 'Short Text', icon: 'Aa' },
  { type: 'textarea', labelAr: 'نص طويل / ملاحظات', labelEn: 'Long Text / Notes', icon: '¶' },
  { type: 'select', labelAr: 'قائمة منسدلة', labelEn: 'Dropdown Select', icon: '▼' },
  { type: 'yes_no', labelAr: 'نعم / لا', labelEn: 'Yes / No', icon: '✓✗' },
  { type: 'currency', labelAr: 'مبلغ مالي (ر.س)', labelEn: 'Currency (SAR)', icon: '﷼' },
  { type: 'integer', labelAr: 'عدد صحيح (كميات)', labelEn: 'Integer Quantity', icon: '123' },
  { type: 'decimal', labelAr: 'عدد عشري', labelEn: 'Decimal Number', icon: '0.0' },
  { type: 'percentage', labelAr: 'نسبة مئوية %', labelEn: 'Percentage', icon: '%' },
  { type: 'date', labelAr: 'تاريخ الزيارة/المسح', labelEn: 'Date Picker', icon: '📅' },
  { type: 'time', labelAr: 'وقت محدد', labelEn: 'Time Picker', icon: '⏰' },
  { type: 'datetime', labelAr: 'تاريخ ووقت', labelEn: 'Date & Time', icon: '📆' },
  { type: 'single_choice', labelAr: 'اختيار أحادي (Radio)', labelEn: 'Single Choice', icon: '🔘' },
  { type: 'multi_choice', labelAr: 'اختيار متعدد (Checkbox)', labelEn: 'Multi Choice', icon: '☑' },
  { type: 'searchable_dropdown', labelAr: 'قائمة قابلة للبحث', labelEn: 'Searchable Select', icon: '🔍' },
  { type: 'photo', labelAr: 'صورة واحدة للرف', labelEn: 'Single Photo', icon: '📷' },
  { type: 'multi_photo', labelAr: 'صور متعددة', labelEn: 'Multiple Photos', icon: '🖼️' },
  { type: 'barcode_scan', labelAr: 'مسح باركود الصنف', labelEn: 'Barcode Scanner', icon: '||||' },
  { type: 'qr_scan', labelAr: 'مسح رمز QR', labelEn: 'QR Code Scanner', icon: '🏁' },
  { type: 'gps', labelAr: 'إحداثيات الموقع (GPS)', labelEn: 'GPS Location', icon: '📍' },
  { type: 'signature', labelAr: 'توقيع العميل الإلكتروني', labelEn: 'Customer Signature', icon: '✍️' },
  { type: 'file_attachment', labelAr: 'ملف مرفق (PDF/Doc)', labelEn: 'File Attachment', icon: '📎' },
  { type: 'rating', labelAr: 'تقييم نجوم (1-5)', labelEn: 'Rating Stars', icon: '★' },
  { type: 'calculated_field', labelAr: 'حقل محسوب تلقائياً', labelEn: 'Calculated Field', icon: 'fx' },
  { type: 'static_instruction', labelAr: 'نص إرشادي ثابت', labelEn: 'Static Guidance', icon: 'ℹ' },
];
