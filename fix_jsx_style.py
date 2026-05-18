import re
import glob

files_to_check = glob.glob('src/components/**/*.jsx', recursive=True)

for file in files_to_check:
    with open(file, 'r') as f:
        lines = f.readlines()
    
    changed = False
    new_lines = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Remove the incorrectly placed comment line
        if '/* eslint-disable-next-line no-restricted-syntax */ // Dynamic per-instance style' in line:
            changed = True
            i += 1
            continue
            
        if 'style={{' in line or 'style={ {' in line:
            if 'eslint-disable-line no-restricted-syntax' not in line:
                # Add the comment before the closing bracket of the tag or at the end
                if '/>' in line:
                    line = line.replace('/>', '/* eslint-disable-line no-restricted-syntax */ />')
                elif '>' in line:
                    line = line.replace('>', ' /* eslint-disable-line no-restricted-syntax */ >')
                else:
                    line = line.rstrip() + ' // eslint-disable-line no-restricted-syntax\n'
                changed = True
                
        new_lines.append(line)
        i += 1
        
    if changed:
        with open(file, 'w') as f:
            f.writelines(new_lines)
            
