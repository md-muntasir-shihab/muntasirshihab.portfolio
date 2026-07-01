import re
with open('src/lib/data.ts', 'r', encoding='utf-8') as f:
    code = f.read()

code = re.sub(r'email:\s*"[^"]+"', 'email: ""', code)

with open('src/lib/data.ts', 'w', encoding='utf-8') as f:
    f.write(code)
