import { useState } from 'react';
import { RequestField, FieldType } from '../types';

export const useFormBuilder = (
  initialFields: RequestField[],
  requestId: string,
  updateRequestFields: (reqId: string, fields: RequestField[]) => void
) => {
  const [formFields, setFormFields] = useState<RequestField[]>(initialFields);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    initialFields.length > 0 ? initialFields[0].fieldId : null
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});

  const selectedField = formFields.find((f) => f.fieldId === selectedFieldId);

  const handleAddField = (type: FieldType = 'select') => {
    const newId = `field_${Date.now()}`;
    const newFieldKey = `custom_${formFields.length + 1}`;
    const newField: RequestField = {
      fieldId: newId,
      requestId,
      fieldKey: newFieldKey,
      fieldType: type,
      fieldLabelAr: `حقل جديد #${formFields.length + 1}`,
      fieldLabelEn: `New Field #${formFields.length + 1}`,
      isRequired: false,
      sortOrder: formFields.length + 1,
      options:
        type === 'select' || type === 'single_choice' || type === 'multi_choice'
          ? [
              { id: 'opt_1', value: 'opt_1', labelAr: 'خيار 1', labelEn: 'Option 1' },
              { id: 'opt_2', value: 'opt_2', labelAr: 'خيار 2', labelEn: 'Option 2' },
            ]
          : undefined,
      schemaVersion: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFormFields([...formFields, newField]);
    setSelectedFieldId(newId);
  };

  const handleDuplicateField = (field: RequestField) => {
    const copyId = `field_${Date.now()}`;
    const copy: RequestField = {
      ...field,
      fieldId: copyId,
      fieldKey: `${field.fieldKey}_copy`,
      fieldLabelAr: `${field.fieldLabelAr} (نسخة)`,
      fieldLabelEn: `${field.fieldLabelEn} (Copy)`,
      sortOrder: formFields.length + 1,
    };
    setFormFields([...formFields, copy]);
    setSelectedFieldId(copyId);
  };

  const handleDeleteField = (fieldId: string) => {
    const updated = formFields.filter((f) => f.fieldId !== fieldId);
    setFormFields(updated);
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(updated.length > 0 ? updated[0].fieldId : null);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formFields.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const next = [...formFields];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    next.forEach((f, i) => {
      f.sortOrder = i + 1;
    });

    setFormFields(next);
  };

  const updateSelectedField = (updates: Partial<RequestField>) => {
    if (!selectedFieldId) return;
    setFormFields((prev) =>
      prev.map((f) => (f.fieldId === selectedFieldId ? { ...f, ...updates } : f))
    );
  };

  const handleSaveAll = () => {
    updateRequestFields(requestId, formFields);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleLoadInactiveCustomersPreset = () => {
    const templateFields: RequestField[] = [
      {
        fieldId: 'fld_cust_no_' + Date.now(),
        requestId,
        fieldKey: 'customer_no',
        fieldType: 'text',
        fieldLabelAr: 'رقم العميل',
        fieldLabelEn: 'Customer No',
        placeholderAr: 'يُستورد تلقائياً من الإكسل',
        placeholderEn: 'Imported from Excel',
        isRequired: false,
        readOnlyRule: true,
        isReadOnly: true,
        schemaVersion: 1,
        sortOrder: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        fieldId: 'fld_cust_name_' + (Date.now() + 1),
        requestId,
        fieldKey: 'customer_name',
        fieldType: 'text',
        fieldLabelAr: 'اسم العميل',
        fieldLabelEn: 'Customer Name',
        placeholderAr: 'يُستورد تلقائياً من الإكسل',
        placeholderEn: 'Imported from Excel',
        isRequired: false,
        readOnlyRule: true,
        isReadOnly: true,
        schemaVersion: 1,
        sortOrder: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        fieldId: 'fld_branch_' + (Date.now() + 2),
        requestId,
        fieldKey: 'branch_name',
        fieldType: 'text',
        fieldLabelAr: 'الفرع',
        fieldLabelEn: 'Branch',
        placeholderAr: 'يُستورد تلقائياً من الإكسل',
        placeholderEn: 'Imported from Excel',
        isRequired: false,
        readOnlyRule: true,
        isReadOnly: true,
        schemaVersion: 1,
        sortOrder: 3,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        fieldId: 'fld_loc_' + (Date.now() + 3),
        requestId,
        fieldKey: 'location',
        fieldType: 'text',
        fieldLabelAr: 'الموقع / العنوان',
        fieldLabelEn: 'Location / Address',
        placeholderAr: 'يُستورد تلقائياً من الإكسل',
        placeholderEn: 'Imported from Excel',
        isRequired: false,
        readOnlyRule: true,
        isReadOnly: true,
        schemaVersion: 1,
        sortOrder: 4,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        fieldId: 'fld_debit_' + (Date.now() + 4),
        requestId,
        fieldKey: 'debit_balance',
        fieldType: 'currency',
        fieldLabelAr: 'المديونية الحالية',
        fieldLabelEn: 'Debit Balance',
        placeholderAr: '0.00',
        placeholderEn: '0.00',
        isRequired: false,
        readOnlyRule: true,
        isReadOnly: true,
        schemaVersion: 1,
        sortOrder: 5,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        fieldId: 'fld_last_deal_' + (Date.now() + 5),
        requestId,
        fieldKey: 'last_deal_date',
        fieldType: 'date',
        fieldLabelAr: 'تاريخ آخر تعامل',
        fieldLabelEn: 'Last Deal Date',
        isRequired: false,
        readOnlyRule: true,
        isReadOnly: true,
        schemaVersion: 1,
        sortOrder: 6,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        fieldId: 'fld_inact_reason_' + (Date.now() + 6),
        requestId,
        fieldKey: 'inactivity_reason',
        fieldType: 'select',
        fieldLabelAr: 'سبب عدم الشراء',
        fieldLabelEn: 'Reason for Not Buying',
        helpTextAr: 'يحدد المندوب سبب انقطاع العميل أو عدم شرائه بعد الزيارة الميدانية',
        helpTextEn: 'Representative selects why the customer stopped buying after the field visit',
        isRequired: true,
        readOnlyRule: false,
        isReadOnly: false,
        schemaVersion: 1,
        options: [
          { id: 'opt_1', value: 'أسعار المنافسين أقل', labelAr: 'أسعار المنافسين أقل', labelEn: 'Competitor prices lower' },
          { id: 'opt_2', value: 'إغلاق المحل أو انتقال النشاط', labelAr: 'إغلاق المحل أو انتقال النشاط', labelEn: 'Store closed or relocated' },
          { id: 'opt_3', value: 'وجود بضاعة سابقة متراكمة', labelAr: 'وجود بضاعة سابقة متراكمة', labelEn: 'Accumulated stock in store' },
          { id: 'opt_4', value: 'مشكلة ائتمانية / إيقاف التوريد بسبب المديونية', labelAr: 'مشكلة ائتمانية / إيقاف التوريد بسبب المديونية', labelEn: 'Credit block due to debt' },
          { id: 'opt_5', value: 'تأخر مواعيد التسليم والتوصيل', labelAr: 'تأخر مواعيد التسليم والتوصيل', labelEn: 'Delivery service delays' },
          { id: 'opt_6', value: 'شكوى من جودة المنتجات أو الصلاحية', labelAr: 'شكوى من جودة المنتجات أو الصلاحية', labelEn: 'Quality or expiry complaint' },
          { id: 'opt_7', value: 'المطالبة بخصومات وعروض إضافية', labelAr: 'المطالبة بخصومات وعروض إضافية', labelEn: 'Demands higher discounts/promos' },
          { id: 'opt_8', value: 'سبب آخر (يُذكر في الملاحظات)', labelAr: 'سبب آخر (يُذكر في الملاحظات)', labelEn: 'Other reason (specified in notes)' },
        ],
        sortOrder: 7,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        fieldId: 'fld_rep_notes_' + (Date.now() + 7),
        requestId,
        fieldKey: 'rep_visit_notes',
        fieldType: 'textarea',
        fieldLabelAr: 'ملاحظات الزيارة والإجراء المتخذ',
        fieldLabelEn: 'Visit Notes & Action Plan',
        placeholderAr: 'سجل تفاصيل مقابلة العميل، الاتفاق على التسوية، أو موعد الزيارة القادمة...',
        placeholderEn: 'Record meeting details, settlement agreement, or next visit date...',
        isRequired: false,
        readOnlyRule: false,
        isReadOnly: false,
        schemaVersion: 1,
        sortOrder: 8,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    setFormFields(templateFields);
    setSelectedFieldId(templateFields[6].fieldId);
  };

  return {
    formFields,
    selectedFieldId,
    selectedField,
    saveSuccess,
    previewValues,
    setPreviewValues,
    setSelectedFieldId,
    handleAddField,
    handleDuplicateField,
    handleDeleteField,
    handleMove,
    updateSelectedField,
    handleSaveAll,
    handleLoadInactiveCustomersPreset,
  };
};
