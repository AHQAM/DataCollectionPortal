import os
import re

files_to_fix = [
    r"c:\DataCollectionPortal\src\components\common\PWAInstallBanner.tsx",
    r"c:\DataCollectionPortal\src\components\common\TopNavbar.tsx",
    r"c:\DataCollectionPortal\src\hooks\useRecordOps.ts",
    r"c:\DataCollectionPortal\src\hooks\useUserOps.ts"
]

# 1. PWAInstallBanner.tsx: import i18n from "../../i18n"; and replace t("auto with i18n.t("auto in IOSGuideModal
f1 = files_to_fix[0]
with open(f1, "r", encoding="utf-8") as f: content = f.read()
if "import i18n" not in content:
    content = 'import i18n from "../../i18n";\n' + content
content = re.sub(r't\("auto', r'i18n.t("auto', content)
with open(f1, "w", encoding="utf-8") as f: f.write(content)

# 2. TopNavbar.tsx: lang: "ar" | "en"
f2 = files_to_fix[1]
with open(f2, "r", encoding="utf-8") as f: content = f.read()
# Find changeLanguage(lang === "ar" ? "en" : "ar") which has a type issue?
# "Argument of type 'string' is not assignable to parameter of type '"ar" | "en"'"
# Also `Argument of type '{ branch: string; }' is not assignable to parameter of type 'string'.`
content = content.replace('changeLanguage(lang === "ar" ? "en" : "ar")', 'changeLanguage((lang === "ar" ? "en" : "ar") as "ar" | "en")')
content = content.replace('JSON.stringify({ branch: bId })', 'bId')
content = content.replace('JSON.stringify({ regionNo: rNo, branch: bId })', 'rNo')
content = re.sub(r'onChange=\{\(bId\) => setBranchId\(.*?\}\}', r'onChange={(bId) => setBranchId(bId)}', content)
content = re.sub(r'onChange=\{\(rNo\) => setRegionNo\(.*?\}\}', r'onChange={(rNo) => setRegionNo(rNo)}', content)

with open(f2, "w", encoding="utf-8") as f: f.write(content)

# 3. useRecordOps.ts: import i18n from "../i18n"; at the top, and remove the inner one
f3 = files_to_fix[2]
with open(f3, "r", encoding="utf-8") as f: content = f.read()
content = content.replace('import i18n from "../i18n";\n', '')
content = 'import i18n from "../i18n";\n' + content
with open(f3, "w", encoding="utf-8") as f: f.write(content)

# 4. useUserOps.ts
f4 = files_to_fix[3]
with open(f4, "r", encoding="utf-8") as f: content = f.read()
content = content.replace('import i18n from "../i18n";\n', '')
content = 'import i18n from "../i18n";\n' + content
with open(f4, "w", encoding="utf-8") as f: f.write(content)
