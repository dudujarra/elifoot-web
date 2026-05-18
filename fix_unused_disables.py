import json
import os

with open('eslint-fix-dry.json', 'r') as f:
    results = json.load(f)

for result in results:
    if not result.get('messages'):
        continue
    
    file_path = result['filePath']
    with open(file_path, 'r') as f:
        lines = f.readlines()
        
    lines_to_delete = set()
    lines_to_modify = {}
    
    for msg in result['messages']:
        if msg.get('message', '').startswith('Unused eslint-disable directive'):
            line_idx = msg['line'] - 1
            line = lines[line_idx]
            
            # If it's a dedicated comment line
            if 'eslint-disable-next-line' in line:
                lines_to_delete.add(line_idx)
            # If it's inline at the end of the line
            elif 'eslint-disable-line' in line:
                lines_to_modify[line_idx] = line.replace('// eslint-disable-line no-restricted-syntax', '').replace('/* eslint-disable-line no-restricted-syntax */', '').rstrip() + '\n'
            # If it's just a general block
            elif 'eslint-disable' in line:
                lines_to_delete.add(line_idx)

    if lines_to_delete or lines_to_modify:
        new_lines = []
        for i, line in enumerate(lines):
            if i in lines_to_delete:
                continue
            if i in lines_to_modify:
                new_lines.append(lines_to_modify[i])
            else:
                new_lines.append(line)
                
        with open(file_path, 'w') as f:
            f.writelines(new_lines)
            
print("Done")
