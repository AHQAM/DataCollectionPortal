import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { Branch, Region } from '../../types';
import {
  Building2,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Users,
  Search,
  Filter,
  ArrowRight,
  FileSpreadsheet,
  UploadCloud,
  Download,
  AlertOctagon,
  Sparkles,
  Check,
  FileDown,
  RefreshCw,
  Layers,
} from 'lucide-react';

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
  const handleDownloadTemplate = () => {
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
    reader.onload = (evt) => {
      try {
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
    setSuccessMessage(
      lang === 'ar'
        ? `تم استيراد ${res.branchesCount} فرع و ${res.regionsCount} منطقة ميدانية بنجاح`
        : `Successfully imported ${res.branchesCount} branches and ${res.regionsCount} regions`
    );
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
          {/* Import from Excel button */}
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

          {/* Add Branch / Region button */}
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold">{lang === 'ar' ? 'إجمالي الفروع' : 'Total Branches'}</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{branches.length}</div>
          <div className="text-[10px] text-purple-700 font-semibold mt-1">{branches.filter(b => b.isActive).length} {lang === 'ar' ? 'فرع نشط' : 'Active'}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold">{lang === 'ar' ? 'المناطق الميدانية' : 'Field Regions'}</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{regions.length}</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-1">{regions.filter(r => r.isActive).length} {lang === 'ar' ? 'منطقة مغطاة' : 'Covered'}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold">{lang === 'ar' ? 'المشرفين والمندوبين' : 'Supervisors & Reps'}</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{users.length}</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-1">{users.filter(u => u.role === 'REP').length} {lang === 'ar' ? 'مندوب ميداني' : 'Reps'}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold">{lang === 'ar' ? 'سجلات العملاء' : 'Customer Records'}</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{records.length}</div>
          <div className="text-[10px] text-blue-700 font-semibold mt-1">{records.filter(r => r.recordStatus === 'Completed').length} {lang === 'ar' ? 'زيارة مكتملة' : 'Completed'}</div>
        </div>
      </div>

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
        /* Branches View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBranches.map((b) => {
            const branchRegions = regions.filter((r) => r.branchId === b.branchId);
            const branchUsers = users.filter((u) => u.branchId === b.branchId);
            const branchSupervisors = branchUsers.filter((u) => u.role === 'SUPERVISOR');
            const branchReps = branchUsers.filter((u) => u.role === 'REP');

            return (
              <div
                key={b.branchId}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-900 font-bold flex items-center justify-center shrink-0 border border-purple-100">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900">
                          {lang === 'ar' ? b.branchNameAr : b.branchNameEn}
                        </h3>
                        <span className="text-[10px] text-purple-700 font-mono font-bold bg-purple-50 px-1.5 py-0.5 rounded">
                          {b.branchId}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditBranch(b)}
                        className="p-1.5 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all"
                        title={lang === 'ar' ? 'تعديل' : 'Edit'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBranch(b)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title={lang === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Branch Metrics */}
                  <div className="mt-4 grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">{lang === 'ar' ? 'المناطق' : 'Regions'}</span>
                      <span className="text-xs font-black text-slate-800">{branchRegions.length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">{lang === 'ar' ? 'المشرفين' : 'Supervisors'}</span>
                      <span className="text-xs font-black text-purple-900">{branchSupervisors.length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">{lang === 'ar' ? 'المناديب' : 'Reps'}</span>
                      <span className="text-xs font-black text-slate-800">{branchReps.length}</span>
                    </div>
                  </div>

                  {/* Region badges inside branch */}
                  <div className="mt-3">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">
                      {lang === 'ar' ? 'المناطق الميدانية التابعة:' : 'Assigned Zones:'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {branchRegions.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic">
                          {lang === 'ar' ? 'لا توجد مناطق مضافة بعد' : 'No regions yet'}
                        </span>
                      ) : (
                        branchRegions.slice(0, 4).map((r) => (
                          <span
                            key={r.regionId}
                            className="text-[10px] font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700"
                          >
                            #{r.regionNo} {lang === 'ar' ? r.regionNameAr : r.regionNameEn}
                          </span>
                        ))
                      )}
                      {branchRegions.length > 4 && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                          +{branchRegions.length - 4} {lang === 'ar' ? 'المزيد' : 'more'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedBranchId(b.branchId);
                      setActiveTab('regions');
                    }}
                    className="text-xs font-bold text-purple-900 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{lang === 'ar' ? 'استعراض وإضافة مناطق الفرع' : 'View & Add Zones'}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                  </button>

                  <button
                    onClick={() => handleOpenAddRegion(b.branchId)}
                    className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{lang === 'ar' ? 'منطقة' : 'Add Zone'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Regions View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-start">{lang === 'ar' ? 'رقم المنطقة' : 'Region No'}</th>
                  <th className="px-4 py-3 text-start">{lang === 'ar' ? 'اسم المنطقة والحي' : 'Region Name'}</th>
                  <th className="px-4 py-3 text-start">{lang === 'ar' ? 'الفرع التابع له' : 'Parent Branch'}</th>
                  <th className="px-4 py-3 text-start">{lang === 'ar' ? 'المندوب المعين' : 'Assigned Rep'}</th>
                  <th className="px-4 py-3 text-start">{lang === 'ar' ? 'سجلات العملاء' : 'Customer Records'}</th>
                  <th className="px-4 py-3 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                      {lang === 'ar' ? 'لا توجد مناطق مطابقة لمعايير البحث' : 'No matching regions found'}
                    </td>
                  </tr>
                ) : (
                  filteredRegions.map((r) => {
                    const branch = branches.find((b) => b.branchId === r.branchId);
                    const assignedRep = users.find(
                      (u) => u.regionNo === r.regionNo || (u.allowedRegionNos && u.allowedRegionNos.includes(r.regionNo))
                    );
                    const regRecords = records.filter((rec) => rec.regionNo === r.regionNo);

                    return (
                      <tr key={r.regionId} className="hover:bg-slate-50/80 transition-all">
                        <td className="px-4 py-3.5 font-mono font-extrabold text-purple-900">
                          #{r.regionNo}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-extrabold text-slate-900">
                            {lang === 'ar' ? r.regionNameAr : r.regionNameEn}
                          </div>
                          {r.regionNameEn && (
                            <div className="text-[10px] text-slate-400 font-mono">{r.regionNameEn}</div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px]">
                            <Building2 className="w-3.5 h-3.5 text-purple-700" />
                            <span>{branch ? (lang === 'ar' ? branch.branchNameAr : branch.branchNameEn) : r.branchId}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {assignedRep ? (
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-bold text-slate-800">{assignedRep.repNameAr}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">
                              {lang === 'ar' ? 'غير مسند لمندوب' : 'Unassigned'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-extrabold text-slate-800">{regRecords.length}</span>{' '}
                          <span className="text-[10px] text-slate-400">{lang === 'ar' ? 'عميل' : 'clients'}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditRegion(r)}
                              className="p-1.5 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all"
                              title={lang === 'ar' ? 'تعديل' : 'Edit'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRegion(r)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title={lang === 'ar' ? 'حذف' : 'Delete'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Branch */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {editingBranch
                    ? lang === 'ar' ? 'تعديل بيانات الفرع' : 'Edit Branch'
                    : lang === 'ar' ? 'إضافة فرع جديد' : 'New Branch'}
                </h3>
              </div>
              <button
                onClick={() => setShowBranchModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {alertError && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{alertError}</span>
              </div>
            )}

            <form onSubmit={handleSaveBranch} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'رمز الفرع (Branch ID)' : 'Branch ID'}
                </label>
                <input
                  type="text"
                  disabled={!!editingBranch}
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  placeholder="مثال: BR-RYD"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono font-bold uppercase disabled:bg-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'اسم الفرع (باللغة العربية)' : 'Branch Name (Arabic)'} *
                </label>
                <input
                  type="text"
                  value={branchNameAr}
                  onChange={(e) => setBranchNameAr(e.target.value)}
                  placeholder="مثال: فرع المنطقة الجنوبية (أبها وخميس مشيط)"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'اسم الفرع (باللغة الإنجليزية)' : 'Branch Name (English)'}
                </label>
                <input
                  type="text"
                  value={branchNameEn}
                  onChange={(e) => setBranchNameEn(e.target.value)}
                  placeholder="e.g. Southern Region Branch (Abha)"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  {lang === 'ar' ? 'حفظ الفرع' : 'Save Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Region */}
      {showRegionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {editingRegion
                    ? lang === 'ar' ? 'تعديل بيانات المنطقة' : 'Edit Region'
                    : lang === 'ar' ? 'إضافة منطقة ميدانية جديدة' : 'New Field Region'}
                </h3>
              </div>
              <button
                onClick={() => setShowRegionModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {alertError && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{alertError}</span>
              </div>
            )}

            <form onSubmit={handleSaveRegion} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'الفرع التابع له' : 'Parent Branch'} *
                </label>
                <select
                  value={regionBranchId}
                  onChange={(e) => setRegionBranchId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
                  required
                >
                  {branches.map((b) => (
                    <option key={b.branchId} value={b.branchId}>
                      {lang === 'ar' ? b.branchNameAr : b.branchNameEn} ({b.branchId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'رقم المنطقة الميدانية (Region Number)' : 'Region Number'} *
                </label>
                <input
                  type="text"
                  value={regionNo}
                  onChange={(e) => setRegionNo(e.target.value)}
                  placeholder="مثال: 110 أو 201"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono font-bold"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {lang === 'ar'
                    ? 'يُستخدم كرقم دخول للمندوب الميداني وكرمز للمنطقة في ملفات الإكسل'
                    : 'Used by rep to login and matches Region No column in Excel'}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'اسم المنطقة والأحياء (بالعربية)' : 'Region Name (Arabic)'} *
                </label>
                <input
                  type="text"
                  value={regionNameAr}
                  onChange={(e) => setRegionNameAr(e.target.value)}
                  placeholder="مثال: شمال الرياض - النرجس والياسمين"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'اسم المنطقة (بالإنجليزية)' : 'Region Name (English)'}
                </label>
                <input
                  type="text"
                  value={regionNameEn}
                  onChange={(e) => setRegionNameEn(e.target.value)}
                  placeholder="e.g. North Riyadh - Narjis & Yasmin"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegionModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  {lang === 'ar' ? 'حفظ المنطقة' : 'Save Region'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXCEL IMPORT MODAL (Branches & Regions) */}
      {/* ========================================================================= */}
      {showExcelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {lang === 'ar' ? 'استيراد الفروع والمناطق من Excel' : 'Import Branches & Regions from Excel'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'ar'
                      ? 'رفع ملف Excel (.xlsx) لإنشاء الفروع وتوزيع المناطق الميدانية تلقائياً'
                      : 'Upload an Excel (.xlsx) file to auto-populate branches and regional sales zones'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowExcelModal(false);
                  setParsedBranches([]);
                  setParsedRegions([]);
                  setExcelFileName('');
                  setExcelParseError(null);
                }}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 py-4">
              {/* Template Download Card */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'ar' ? 'القالب النموذجي المعتمد' : 'Standard Excel Template'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    {lang === 'ar'
                      ? 'حمّل ملف الإكسل المنسّق مسبقاً، عبّئ فروعك ومناطقك ثم ارفعه هنا.'
                      : 'Download the pre-formatted template, fill in your branches and zones, then upload.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'تحميل قالب Excel (.xlsx)' : 'Download Template (.xlsx)'}</span>
                </button>
              </div>

              {/* File Upload Drop Area */}
              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition-all bg-slate-50/50 hover:bg-emerald-50/20">
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl inline-block shadow-xs transition-all">
                    {lang === 'ar' ? 'اختر ملف الإكسل (.xlsx, .xls, .csv)' : 'Select Excel File (.xlsx, .xls, .csv)'}
                  </span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {excelFileName ? (
                  <div className="mt-3 text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{excelFileName}</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-2">
                    {lang === 'ar' ? 'يدعم ملفات .xlsx و .xls و .csv' : 'Supports .xlsx, .xls, and .csv files'}
                  </p>
                )}
              </div>

              {/* Parse Error */}
              {excelParseError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{excelParseError}</span>
                </div>
              )}

              {/* Preview of Parsed Data */}
              {(parsedBranches.length > 0 || parsedRegions.length > 0) && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-900 rounded-lg text-xs font-black">
                        {lang === 'ar' ? `الفروع المكتشفة: ${parsedBranches.length}` : `Branches: ${parsedBranches.length}`}
                      </span>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-black">
                        {lang === 'ar' ? `المناطق المكتشفة: ${parsedRegions.length}` : `Regions: ${parsedRegions.length}`}
                      </span>
                    </div>

                    {/* Mode selector */}
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          value="append"
                          checked={importMode === 'append'}
                          onChange={() => setImportMode('append')}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{lang === 'ar' ? 'دمج مع الحالي (Merge)' : 'Merge with existing'}</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          value="replace"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="text-rose-600 focus:ring-rose-500"
                        />
                        <span>{lang === 'ar' ? 'استبدال بالكامل (Replace All)' : 'Replace all'}</span>
                      </label>
                    </div>
                  </div>

                  {/* Sample rows preview table */}
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-start text-[11px]">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-start">{lang === 'ar' ? 'رمز الفرع' : 'Branch ID'}</th>
                          <th className="px-3 py-2 text-start">{lang === 'ar' ? 'اسم الفرع' : 'Branch Name'}</th>
                          <th className="px-3 py-2 text-start">{lang === 'ar' ? 'رقم المنطقة' : 'Region No'}</th>
                          <th className="px-3 py-2 text-start">{lang === 'ar' ? 'اسم المنطقة' : 'Region Name'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {parsedRegions.slice(0, 10).map((r, i) => {
                          const branch = parsedBranches.find((b) => b.branchId === r.branchId);
                          return (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="px-3 py-1.5 font-mono text-purple-900 font-bold">{r.branchId}</td>
                              <td className="px-3 py-1.5 text-slate-800">{branch?.branchNameAr || r.branchId}</td>
                              <td className="px-3 py-1.5 font-mono font-bold text-slate-900">{r.regionNo}</td>
                              <td className="px-3 py-1.5 text-slate-600">{r.regionNameAr}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {parsedRegions.length > 10 && (
                    <p className="text-[10px] text-slate-400 text-center">
                      {lang === 'ar'
                        ? `... ويوجد ${parsedRegions.length - 10} مناطق إضافية في الملف`
                        : `... and ${parsedRegions.length - 10} more regions in file`}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowExcelModal(false);
                  setParsedBranches([]);
                  setParsedRegions([]);
                  setExcelFileName('');
                  setExcelParseError(null);
                }}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={parsedBranches.length === 0 && parsedRegions.length === 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>
                  {lang === 'ar'
                    ? `تأكيد الاستيراد (${parsedBranches.length} فرع / ${parsedRegions.length} منطقة)`
                    : `Confirm Import (${parsedBranches.length} Branches / ${parsedRegions.length} Regions)`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
