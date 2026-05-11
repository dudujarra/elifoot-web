import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # 1. Remove borderRadius
    content = re.sub(r'borderRadius:\s*[\'"][^\'"]*[\'"],?\s*', '', content)
    content = re.sub(r'borderRadius:\s*\d+,?\s*', '', content)
    content = re.sub(r'border-radius:\s*[^;]+;\s*', '', content)

    # 2. Replace rgba(...) with solid hex colors
    def rgba_replacer(match):
        r = int(match.group(1))
        g = int(match.group(2))
        b = int(match.group(3))
        # Mapping to brand colors
        if r == 57 and g == 255 and b == 20: return '#1B4332'
        if r == 255 and g == 51 and b == 51: return '#8B0000'
        if r == 255 and g == 215 and b == 0: return '#1B4332'
        if r == 106 and g == 188 and b == 58: return '#1B4332'
        if r == 58 and g == 125 and b == 206: return '#111417'
        if r == 16 and g == 185 and b == 129: return '#1B4332'
        if r == 239 and g == 68 and b == 68: return '#8B0000'
        if r == 0 and g == 0 and b == 0: return '#040805'
        if r == 255 and g == 255 and b == 255: return '#0E1F14'
        return '#111417'

    content = re.sub(r'rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*0\.[0-9]+\s*\)', rgba_replacer, content)

    # 3. Remove opacity
    content = re.sub(r'opacity:\s*0\.[0-9]+,?\s*', '', content)
    content = re.sub(r'opacity:\s*[\'"]0\.[0-9]+[\'"],?\s*', '', content)
    
    # 4. Remove backdrop-filter
    content = re.sub(r'backdropFilter:\s*[\'"][^\'"]*[\'"],?\s*', '', content)
    content = re.sub(r'backdrop-filter:\s*[^;]+;\s*', '', content)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk('src/components'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            fix_file(os.path.join(root, file))
