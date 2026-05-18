import re
import os

files_to_clean = {}

# Parse eslint output
with open('eslint_report2.txt', 'r') if os.path.exists('eslint_report2.txt') else os.popen('npx eslint .') as f:
    current_file = None
    for line in f:
        line = line.strip()
        if line.startswith('/Users/'):
            current_file = line
            files_to_clean[current_file] = []
        elif 'Unused eslint-disable directive' in line and current_file:
            # line looks like: 112:9  warning  Unused eslint-disable directive ...
            match = re.match(r'^(\d+):', line)
            if match:
                line_num = int(match.group(1))
                files_to_clean[current_file].append(line_num)

for file_path, lines_to_delete in files_to_clean.items():
    if not lines_to_delete:
        continue
    try:
        with open(file_path, 'r') as f:
            lines = f.readlines()
        
        # We need to be careful: deleting a line changes the index, but we just set it to empty string or remove it.
        # But wait, it might be inline at the end of the line.
        for line_num in lines_to_delete:
            idx = line_num - 1
            if idx < len(lines):
                line = lines[idx]
                new_line = re.sub(r'//\s*eslint-disable[^\n]*', '', line)
                new_line = re.sub(r'/\*\s*eslint-disable.*?\*/', '', new_line)
                new_line = re.sub(r'\{\s*/\*\s*eslint-disable.*?\*/\s*\}', '', new_line)
                if new_line.strip() == '':
                    lines[idx] = ''
                else:
                    lines[idx] = new_line
                    
        with open(file_path, 'w') as f:
            f.writelines(lines)
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

print("Done")
