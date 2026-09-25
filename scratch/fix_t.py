import os
import re

SRC_DIR = r"c:\DataCollectionPortal\src"

def fix_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    orig_content = content

    # Fix double comma
    content = re.sub(r',\s*,\s*t\s*}', r', t}', content)
    
    # Check if t is used but not defined
    if 't("auto.' in content:
        has_t_import = re.search(r'\bimport\b.*\bt\b.*from', content)
        has_useapp_t = re.search(r'const\s+\{[^}]*\bt\b[^}]*\}\s*=\s*useApp', content)
        has_use_translation = 'useTranslation' in content
        
        if not (has_t_import or has_useapp_t or has_use_translation):
            # prepend import i18n from "i18next";
            # and we will define t as i18n.t or we can just import i18n and replace t("auto with i18n.t("auto
            if "import i18n from" not in content:
                # Add import i18n from '@/i18n' (or relative path)
                depth = len(filepath.split(os.sep)) - len(SRC_DIR.split(os.sep)) - 1
                prefix = "../" * depth if depth > 0 else "./"
                import_stmt = f'import i18n from "{prefix}i18n";\n'
                
                # Insert after the last import
                last_import = content.rfind("import ")
                if last_import != -1:
                    end_of_last = content.find("\n", last_import)
                    content = content[:end_of_last+1] + import_stmt + content[end_of_last+1:]
                else:
                    content = import_stmt + content
            
            content = content.replace('t("auto', 'i18n.t("auto')

    if content != orig_content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        return True
    return False

modified = 0
for root, dirs, files in os.walk(SRC_DIR):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            if fix_file(os.path.join(root, file)):
                modified += 1
                print(f"Fixed: {file}")

print(f"Done! Fixed {modified} files.")
