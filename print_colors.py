import json
import re

with open('audit_results.json', 'r') as f:
    issues = json.load(f)

colors = set()
for issue in issues:
    if issue['type'] == 'COLOR':
        # issue['message'] looks like "Cor hardcoded: #4CAF50, #222 — prefira var(--token)"
        match = re.search(r'Cor hardcoded: (.*?) —', issue['message'])
        if match:
            hex_colors = match.group(1).split(', ')
            for h in hex_colors:
                colors.add(h)

print("Unique hex colors to fix:", colors)
