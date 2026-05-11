import os

def fix_quotes(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    content = content.replace("''#", "'#").replace("''", "'")

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed quotes in {filepath}")

for root, _, files in os.walk('src/components'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            fix_quotes(os.path.join(root, file))
