import React, { useState } from 'react';
import { getXLSX } from '../../utils/excel';
import { useApp } from '../../context/AppContext';
import { Branch, Region } from '../../types';
import {
  Building2,
  MapPin,
  Plus,
  CheckCircle2,
  Search,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';
import { BranchModal } from './modals/BranchModal';
import { RegionModal } from './modals/RegionModal';
import { ExcelImportModal } from './modals/ExcelImportModal';
import { BranchStatsHeader } from './branches/BranchStatsHeader';
import { BranchesListView } from './branches/BranchesListView';
import { RegionsListView } from './branches/RegionsListView';

export const AdminBranches: React.FC = () => {
  const {
    lang,
    branches,
    regions,
    users,
    records,
    createBranch,
    updateBranch,
    deleteBranch,
    createRegion,
    updateRegion,
    deleteRegion,
    importBranchesAndRegions,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'branches' | 'regions'>('branches');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchCode, setBranchCode] = useState('');
  const [branchNameAr, setBranchNameAr] = useState('');
  const [branchNameEn, setBranchNameEn] = useState('');

  const [showRegionModal, setShowRegionModal] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [regionNo, setRegionNo] = useState('');
  const [regionNameAr, setRegionNameAr] = useState('');
  const [regionNameEn, setRegionNameEn] = useState('');
  const [regionBranchId, setRegionBranchId] = useState('');

  // Excel Import Modal State
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [parsedBranches, setParsedBranches] = useState<{ branchId: string; branchNameAr: string; branchNameEn?: string }[]>([]);
  const [parsedRegions, setParsedRegions] = useState<{ regionNo: string; regionNameAr: string; regionNameEn?: string; branchId: string }[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [excelFileName, setExcelFileName] = useState('');
  const [excelParseError, setExcelParseError] = useState<string | null>(null);

  const [alertError, setAlertError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Branch handlers
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchCode(`BR-${Math.floor(100 + Math.random() * 900)}`);
    setBranchNameAr('');
    setBranchNameEn('');
    setShowBranchModal(true);
    setAlertError(null);
  };

  const handleOpenEditBranch = (b: Branch) => {
    setEditingBranch(b);
    setBranchCode(b.branchId);
    setBranchNameAr(b.branchNameAr);
    setBranchNameEn(b.branchNameEn);
    setShowBranchModal(true);
    setAlertError(null);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchNameAr.trim()) {
      setAlertError(lang === 'ar' ? 'يرجى إدخال اسم الفرع بالعربية' : 'Please enter branch Arabic name');
      return;
    }

    try {
      if (editingBranch) {
        await updateBranch(editingBranch.branchId, {
          branchNameAr: branchNameAr.trim(),
          branchNameEn: branchNameEn.trim() || branchNameAr.trim(),
        });
        setSuccessMessage(lang === 'ar' ? 'تم تحديث بيانات الفرع بنجاح' : 'Branch updated successfully');
      } else {
        const code = branchCode.trim().toUpperCase();
        if (branches.some((b) => b.branchId === code)) {
          setAlertError(lang === 'ar' ? 'رمز الفرع موجود مسبقاً' : 'Branch ID already exists');
          return;
        }
        await createBranch({
          branchId: code,
          branchNameAr: branchNameAr.trim(),
          branchNameEn: branchNameEn.trim() || branchNameAr.trim(),
        });
        setSuccessMessage(lang === 'ar' ? 'تمت إضافة الفرع الجديد بنجاح' : 'New branch created successfully');
      }
    } catch (err) {
      console.error(err);
      setAlertError(lang === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving branch');
      return;
    }

    setShowBranchModal(false);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleDeleteBranch = async (b: Branch) => {
    if (window.confirm(lang === 'ar' ? `هل أنت متأكد من حذف ${b.branchNameAr}؟` : `Delete branch ${b.branchNameEn}?`)) {
      const res = await deleteBranch(b.branchId);
      if (!res.success) {
        alert(res.message || 'Cannot delete');
      } else {
        setSuccessMessage(lang === 'ar' ? 'تم حذف الفرع بنجاح' : 'Branch deleted');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  // Region handlers
  const handleOpenAddRegion = (presetBranchId?: string) => {
    setEditingRegion(null);
    setRegionNo('');
    setRegionNameAr('');
    setRegionNameEn('');
    setRegionBranchId(presetBranchId || (branches[0]?.branchId || ''));
    setShowRegionModal(true);
    setAlertError(null);
  };

  const handleOpenEditRegion = (r: Region) => {
    setEditingRegion(r);
    setRegionNo(r.regionNo);
    setRegionNameAr(r.regionNameAr);
    setRegionNameEn(r.regionNameEn);
    setRegionBranchId(r.branchId);
    setShowRegionModal(true);
    setAlertError(null);
  };

  const handleSaveRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regionNo.trim() || !regionNameAr.trim() || !regionBranchId) {
      setAlertError(lang === 'ar' ? 'يرجى تعبئة كافة الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    const cleanNo = regionNo.trim();

    try {
      if (editingRegion) {
        await updateRegion(editingRegion.regionId, {
          regionNo: cleanNo,
          regionNameAr: regionNameAr.trim(),
          regionNameEn: regionNameEn.trim() || regionNameAr.trim(),
          branchId: regionBranchId,
        });
        setSuccessMessage(lang === 'ar' ? 'تم تحديث بيانات المنطقة بنجاح' : 'Region updated successfully');
      } else {
        if (regions.some((r) => r.regionNo === cleanNo)) {
          setAlertError(lang === 'ar' ? 'رقم المنطقة مستخدم مسبقاً، يرجى اختيار رقم فريد' : 'Region number already exists');
          return;
        }
        await createRegion({
          regionId: `REG-${cleanNo}`,
          regionNo: cleanNo,
          regionNameAr: regionNameAr.trim(),
          regionNameEn: regionNameEn.trim() || regionNameAr.trim(),
          branchId: regionBranchId,
        });
        setSuccessMessage(lang === 'ar' ? 'تمت إضافة المنطقة بنجاح' : 'New region created successfully');
      }
    } catch (err) {
      console.error(err);
      setAlertError(lang === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving region');
      return;
    }

    setShowRegionModal(false);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleDeleteRegion = async (r: Region) => {
    if (window.confirm(lang === 'ar' ? `هل أنت متأكد من حذف منطقة ${r.regionNameAr} (#${r.regionNo})؟` : `Delete region ${r.regionNameEn}?`)) {
      const res = await deleteRegion(r.regionId);
      if (!res.success) {
        alert(res.message || 'Cannot delete region');
      } else {
        setSuccessMessage(lang === 'ar' ? 'تم حذف المنطقة' : 'Region deleted');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  // Excel Template Download Handler
  const handleDownloadTemplate = async () => {
    const templateData = [
      {
        'رمز الفرع (Branch ID)': 'BR-RYD',
        'اسم الفرع بالعربي (Branch Name AR)': 'فرع المنطقة الوسطى (الرياض)',
        'اسم الفرع بالإنجليزي (Branch Name EN)': 'Riyadh Central Branch',
        'رقم المنطقة (Region No)': '101',
        'اسم المنطقة بالعربي (Region Name AR)': 'شمال الرياض - العليا والسليمانية',
        'اسم المنطقة بالإنجليزي (Region Name EN)': 'North Riyadh - Olaya & Sulaimaniyah',
      },
      {
        'رمز الفرع (Branch ID)': 'BR-RYD',
        'اسم الفرع بالعربي (Branch Name AR)': 'فرع المنطقة الوسطى (الرياض)',
        'اسم الفرع بالإنجليزي (Branch Name EN)': 'Riyadh Central Branch',
        'رقم المنطقة (Region No)': '102',
        'اسم المنطقة بالعربي (Region Name AR)': 'شرق الرياض - الملز والربوة',
        'اسم المنطقة بالإنجليزي (Region Name EN)': 'East Riyadh - Malaz & Rabwah',
      },
      {
        'رمز الفرع (Branch ID)': 'BR-JED',
        'اسم الفرع بالعربي (Branch Name AR)': 'فرع المنطقة الغربية (جدة)',
        'اسم الفرع بالإنجليزي (Branch Name EN)': 'Western Jeddah Branch',
        'رقم المنطقة (Region No)': '201',
        'اسم المنطقة بالعربي (Region Name AR)': 'وسط جدة - الروضة والسلامة',
        'اسم المنطقة بالإنجليزي (Region Name EN)': 'Central Jeddah - Rawdah & Salamah',
      },
      {
        'رمز الفرع (Branch ID)': 'BR-DMM',
        'اسم الفرع بالعربي (Branch Name AR)': 'فرع المنطقة الشرقية (الدمام)',
        'اسم الفرع بالإنجليزي (Branch Name EN)': 'Eastern Dammam Branch',
        'رقم المنطقة (Region No)': '301',
        'اسم المنطقة بالعربي (Region Name AR)': 'الدمام - الشاطئ والمزروعية',
        'اسم المنطقة بالإنجليزي (Region Name EN)': 'Dammam - Shatea & Mazrouiya',
      },
    ];

    const XLSX = await getXLSX();
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الفروع والمناطق');
    XLSX.writeFile(wb, 'قالب_استيراد_الفروع_والمناطق_الميدانية.xlsx');
  };

  // Excel File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFileName(file.name);
    setExcelParseError(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const XLSX = await getXLSX();
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

        if (!jsonData || jsonData.length === 0) {
          setExcelParseError(lang === 'ar' ? 'الملف فارغ أو لا يحتوي على صفوف بيانات' : 'The file is empty or contains no rows');
          return;
        }

        const branchesMap = new Map<string, { branchId: string; branchNameAr: string; branchNameEn?: string }>();
        const regionsList: { regionNo: string; regionNameAr: string; regionNameEn?: string; branchId: string }[] = [];

        jsonData.forEach((row, idx) => {
          const branchId = String(
            row['رمز الفرع (Branch ID)'] ||
            row['رمز الفرع'] ||
            row['كود الفرع'] ||
            row['BranchId'] ||
            row['Branch ID'] ||
            row['BranchCode'] ||
            `BR-${idx + 1}`
          ).trim();

          const branchNameAr = String(
            row['اسم الفرع بالعربي (Branch Name AR)'] ||
            row['اسم الفرع بالعربي'] ||
            row['اسم الفرع'] ||
            row['الفرع'] ||
            row['BranchNameAr'] ||
            row['Branch Name AR'] ||
            row['Branch'] ||
            ''
          ).trim();

          const branchNameEn = String(
            row['اسم الفرع بالإنجليزي (Branch Name EN)'] ||
            row['اسم الفرع بالانجليزي'] ||
            row['BranchNameEn'] ||
            row['Branch Name EN'] ||
            branchNameAr
          ).trim();

          const regionNo = String(
            row['رقم المنطقة (Region No)'] ||
            row['رقم المنطقة'] ||
            row['كود المنطقة'] ||
            row['المنطقة'] ||
            row['RegionNo'] ||
            row['Region No'] ||
            row['Zone'] ||
            ''
          ).trim();

          const regionNameAr = String(
            row['اسم المنطقة بالعربي (Region Name AR)'] ||
            row['اسم المنطقة بالعربي'] ||
            row['اسم المنطقة'] ||
            row['RegionNameAr'] ||
            row['Region Name AR'] ||
            row['ZoneName'] ||
            ''
          ).trim();

          const regionNameEn = String(
            row['اسم المنطقة بالإنجليزي (Region Name EN)'] ||
            row['اسم المنطقة بالانجليزي'] ||
            row['RegionNameEn'] ||
            row['Region Name EN'] ||
            regionNameAr
          ).trim();

          if (branchNameAr) {
            const normalizedBranchId = branchId.toUpperCase();
            if (!branchesMap.has(normalizedBranchId)) {
              branchesMap.set(normalizedBranchId, {
                branchId: normalizedBranchId,
                branchNameAr,
                branchNameEn,
              });
            }
          }

          if (regionNo && regionNameAr) {
            regionsList.push({
              regionNo,
              regionNameAr,
              regionNameEn,
              branchId: branchId.toUpperCase(),
            });
          }
        });

        const parsedB = Array.from(branchesMap.values());
        if (parsedB.length === 0 && regionsList.length === 0) {
          setExcelParseError(
            lang === 'ar'
              ? 'لم يتم العثور على أعمدة متطابقة في الملف. يرجى التأكد من مطابقة أسماء الأعمدة أو تحميل القالب النموذجي.'
              : 'No matching columns found. Please verify column headers or use the standard template.'
          );
          return;
        }

        setParsedBranches(parsedB);
        setParsedRegions(regionsList);
      } catch (err: any) {
        setExcelParseError(err.message || 'Error parsing Excel file');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = async () => {
    if (parsedBranches.length === 0 && parsedRegions.length === 0) return;
    const res = await importBranchesAndRegions(parsedBranches, parsedRegions, importMode);
    if (res.success && res.data) {
      setSuccessMessage(
        lang === 'ar'
          ? `تم استيراد ${res.data.branchesCount} فرع و ${res.data.regionsCount} منطقة ميدانية بنجاح`
          : `Successfully imported ${res.data.branchesCount} branches and ${res.data.regionsCount} regions`
      );
    }
    setShowExcelModal(false);
    setParsedBranches([]);
    setParsedRegions([]);
    setExcelFileName('');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Filtered lists
  const filteredBranches = branches.filter((b) => {
    const q = searchQuery.toLowerCase();
    return b.branchNameAr.toLowerCase().includes(q) || b.branchNameEn.toLowerCase().includes(q) || b.branchId.toLowerCase().includes(q);
  });

  const filteredRegions = regions.filter((r) => {
    if (selectedBranchId !== 'ALL' && r.branchId !== selectedBranchId) return false;
    const q = searchQuery.toLowerCase();
    return (
      r.regionNo.includes(q) ||
      r.regionNameAr.toLowerCase().includes(q) ||
      r.regionNameEn.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <span>{lang === 'ar' ? 'إدارة الفروع والمناطق الميدانية' : 'Branches & Regions Management'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'ar'
              ? 'إضافة فروع الشركة، وتحديد المناطق الميدانية لكل فرع، وربط المندوبين والمشرفين بها ديناميكياً'
              : 'Add company branches, define regional sales zones, and link field representatives seamlessly'}
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setShowExcelModal(true);
              setExcelParseError(null);
            }}
            className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>{lang === 'ar' ? 'استيراد الفروع والمناطق من Excel' : 'Import from Excel'}</span>
          </button>

          {activeTab === 'branches' ? (
            <button
              onClick={handleOpenAddBranch}
              className="px-4 py-2.5 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ar' ? 'إضافة فرع جديد' : 'New Branch'}</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenAddRegion(selectedBranchId !== 'ALL' ? selectedBranchId : undefined)}
              className="px-4 py-2.5 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ar' ? 'إضافة منطقة جديدة' : 'New Region'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Quick Stats Grid */}
      <BranchStatsHeader
        lang={lang}
        branches={branches}
        regions={regions}
        users={users}
        records={records}
      />

      {/* Tabs & Search Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('branches')}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'branches' ? 'bg-white text-purple-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{lang === 'ar' ? 'قائمة الفروع' : 'Branches'} ({branches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('regions')}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'regions' ? 'bg-white text-purple-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{lang === 'ar' ? 'المناطق الميدانية' : 'Field Regions'} ({regions.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === 'regions' && (
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-hidden"
              >
                <option value="ALL">{lang === 'ar' ? 'جميع الفروع' : 'All Branches'}</option>
                {branches.map((b) => (
                  <option key={b.branchId} value={b.branchId}>
                    {lang === 'ar' ? b.branchNameAr : b.branchNameEn}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث بالاسم أو الرمز...' : 'Search by name or code...'}
              className="w-full h-9 ps-8 pe-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-purple-600 bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'branches' ? (
        <BranchesListView
          lang={lang}
          branches={filteredBranches}
          regions={regions}
          users={users}
          onOpenEditBranch={handleOpenEditBranch}
          onDeleteBranch={handleDeleteBranch}
          onSelectBranchAndSwitchToRegions={(bId) => {
            setSelectedBranchId(bId);
            setActiveTab('regions');
          }}
          onOpenAddRegion={handleOpenAddRegion}
        />
      ) : (
        <RegionsListView
          lang={lang}
          filteredRegions={filteredRegions}
          branches={branches}
          users={users}
          records={records}
          onOpenEditRegion={handleOpenEditRegion}
          onDeleteRegion={handleDeleteRegion}
        />
      )}

      {/* Modal: Add/Edit Branch */}
      <BranchModal
        lang={lang}
        showModal={showBranchModal}
        editingBranch={editingBranch}
        branchCode={branchCode}
        setBranchCode={setBranchCode}
        branchNameAr={branchNameAr}
        setBranchNameAr={setBranchNameAr}
        branchNameEn={branchNameEn}
        setBranchNameEn={setBranchNameEn}
        alertError={alertError}
        handleSaveBranch={handleSaveBranch}
        onClose={() => setShowBranchModal(false)}
      />

      {/* Modal: Add/Edit Region */}
      <RegionModal
        lang={lang}
        showModal={showRegionModal}
        editingRegion={editingRegion}
        regionNo={regionNo}
        setRegionNo={setRegionNo}
        regionNameAr={regionNameAr}
        setRegionNameAr={setRegionNameAr}
        regionNameEn={regionNameEn}
        setRegionNameEn={setRegionNameEn}
        regionBranchId={regionBranchId}
        setRegionBranchId={setRegionBranchId}
        branches={branches}
        alertError={alertError}
        handleSaveRegion={handleSaveRegion}
        onClose={() => setShowRegionModal(false)}
      />

      {/* Modal: Excel Import */}
      <ExcelImportModal
        lang={lang}
        showModal={showExcelModal}
        parsedBranches={parsedBranches}
        setParsedBranches={setParsedBranches}
        parsedRegions={parsedRegions}
        setParsedRegions={setParsedRegions}
        importMode={importMode}
        setImportMode={setImportMode}
        excelFileName={excelFileName}
        setExcelFileName={setExcelFileName}
        excelParseError={excelParseError}
        setExcelParseError={setExcelParseError}
        handleDownloadTemplate={handleDownloadTemplate}
        handleFileUpload={handleFileUpload}
        handleConfirmImport={handleConfirmImport}
        onClose={() => {
          setShowExcelModal(false);
          setParsedBranches([]);
          setParsedRegions([]);
          setExcelFileName('');
          setExcelParseError(null);
        }}
      />
    </div>
  );
};
