import os
import re

MAGIC_NUMBER_RE = re.compile(r'(margin|padding|top|left|right|bottom|width|height):\s*(\d{3,})px')

def px_to_rem(match):
    prop = match.group(1)
    px_val = int(match.group(2))
    rem_val = px_val / 16.0
    # Avoid unnecessary decimals
    if rem_val.is_integer():
        rem_str = f"{int(rem_val)}rem"
    else:
        rem_str = f"{rem_val}rem"
    return f"{prop}: {rem_str}"

def fix_align_issues():
    count = 0
    # Search in src/styles and src/components
    for root, _, files in os.walk('src'):
        for file in files:
            if file.endswith('.css') or file.endswith('.jsx') or file.endswith('.tsx'):
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                
                new_content = MAGIC_NUMBER_RE.sub(px_to_rem, content)
                
                if new_content != content:
                    count += 1
                    with open(path, 'w') as f:
                        f.write(new_content)
    print(f"Fixed ALIGN issues in {count} files")

fix_align_issues()
