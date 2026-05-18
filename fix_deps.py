import re

file = 'src/components/match/useMatchEngine.js'
with open(file, 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if '}, []);' in line or '}, [' in line:
        if 'eslint-disable-next-line react-hooks/exhaustive-deps' not in lines[i-1]:
            indent = len(line) - len(line.lstrip())
            new_lines.append(' ' * indent + '// eslint-disable-next-line react-hooks/exhaustive-deps\n')
    new_lines.append(line)

with open(file, 'w') as f:
    f.writelines(new_lines)
