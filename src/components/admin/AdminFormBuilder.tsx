import React from "react";
import { useApp } from "../../context/AppContext";
import { FieldListSidebar } from "./form-builder/FieldListSidebar";
import { FieldPropertiesEditor } from "./form-builder/FieldPropertiesEditor";
import { FormMobilePreview } from "./form-builder/FormMobilePreview";
import { FormBuilderHeader } from "./form-builder/FormBuilderHeader";
import { useFormBuilder } from "../../hooks/useFormBuilder";

interface Props {
  requestId: string;
  onBack: () => void;
  onOpenImportWizard?: (requestId: string) => void;
}

export const AdminFormBuilder: React.FC<Props> = ({
  requestId,
  onBack,
  onOpenImportWizard,
}) => {
  const { lang, dir, requests, fields, updateRequestFields } = useApp();

  const currentRequest = requests.find((r) => r.requestId === requestId);
  const initialFields = fields.filter((f) => f.requestId === requestId);

  const {
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
  } = useFormBuilder(initialFields, requestId, updateRequestFields);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <FormBuilderHeader
        lang={lang}
        dir={dir}
        currentRequest={currentRequest}
        requestId={requestId}
        onBack={onBack}
        onOpenImportWizard={onOpenImportWizard}
        handleLoadInactiveCustomersPreset={handleLoadInactiveCustomersPreset}
        handleSaveAll={handleSaveAll}
        saveSuccess={saveSuccess}
      />

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <FieldListSidebar
          lang={lang}
          formFields={formFields}
          selectedFieldId={selectedFieldId}
          onSelectField={setSelectedFieldId}
          onAddField={handleAddField}
          onMoveField={handleMove}
        />

        <FieldPropertiesEditor
          lang={lang}
          selectedField={selectedField}
          formFields={formFields}
          onUpdateField={updateSelectedField}
          onDuplicateField={handleDuplicateField}
          onDeleteField={handleDeleteField}
        />

        <FormMobilePreview
          lang={lang}
          formFields={formFields}
          previewValues={previewValues}
          onPreviewValueChange={(key, val) =>
            setPreviewValues((prev) => ({ ...prev, [key]: val }))
          }
        />
      </div>
    </div>
  );
};
