import os
import re
import json
import string

SRC_DIR = r"c:\DataCollectionPortal\src"
AR_JSON = r"c:\DataCollectionPortal\src\locales\ar.json"
EN_JSON = r"c:\DataCollectionPortal\src\locales\en.json"

with open(AR_JSON, "r", encoding="utf-8") as f:
    ar_data = json.load(f)
with open(EN_JSON, "r", encoding="utf-8") as f:
    en_data = json.load(f)

if "auto" not in ar_data: ar_data["auto"] = {}
if "auto" not in en_data: en_data["auto"] = {}

def to_camel_case(text):
    clean = re.sub(r'[^a-zA-Z0-9 ]', '', text)
    words = [w for w in clean.split() if w][:4]
    if not words: return "str"
    return words[0].lower() + "".join(w.capitalize() for w in words[1:])

# Matches lang === "ar" ? "Arabic text" : "English text"
# and also with single quotes
pattern = re.compile(
    r'lang\s*===\s*["\']ar["\']\s*\?\s*(["\'])(.*?)\1\s*:\s*(["\'])(.*?)\3',
    re.DOTALL
)

def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original_content = content
    
    def repl(m):
        ar_str = m.group(2)
        en_str = m.group(4)
        
        base_key = to_camel_case(en_str)
        if not base_key: base_key = "str"
        
        # Deduplicate
        key = base_key
        i = 1
        while key in en_data["auto"] and en_data["auto"][key] != en_str:
            key = f"{base_key}{i}"
            i += 1
            
        en_data["auto"][key] = en_str
        ar_data["auto"][key] = ar_str
        
        return f't("auto.{key}")'

    new_content = pattern.sub(repl, content)

    if new_content != original_content:
        # Check if we need to add `t` to `useApp`
        if 'useApp()' in new_content and 't("auto' in new_content:
            # simple replacement for { lang } = useApp() -> { lang, t } = useApp()
            # or { lang, user } -> { lang, user, t }
            # Look for const { ... } = useApp()
            useapp_match = re.search(r'const\s+\{([^}]+)\}\s*=\s*useApp\(\)', new_content)
            if useapp_match:
                inner = useapp_match.group(1)
                # If t is not in destructuring
                if not re.search(r'\bt\b', inner):
                    new_inner = inner + ", t"
                    new_content = new_content.replace(useapp_match.group(0), f'const {{{new_inner}}} = useApp()')
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        return True
    return False

modified = 0
for root, dirs, files in os.walk(SRC_DIR):
    if '__tests__' in root: continue
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            if process_file(os.path.join(root, file)):
                modified += 1
                print(f"Modified: {file}")

with open(AR_JSON, "w", encoding="utf-8") as f:
    json.dump(ar_data, f, ensure_ascii=False, indent=2)
with open(EN_JSON, "w", encoding="utf-8") as f:
    json.dump(en_data, f, ensure_ascii=False, indent=2)

print(f"Done! Modified {modified} files.")
