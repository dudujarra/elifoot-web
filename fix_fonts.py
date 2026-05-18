import os
import glob

def fix_fonts(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.css'):
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                
                if 'Inter' in content or 'Outfit' in content:
                    # Fix font values
                    content = content.replace("font-family: 'Inter', system-ui, sans-serif;", "font-family: var(--ef-font-family-body);")
                    content = content.replace("font-family: var(--font-sans, 'Inter'), system-ui, sans-serif;", "font-family: var(--ef-font-family-body);")
                    content = content.replace("font-family: var(--font-body, 'Inter'), system-ui, sans-serif;", "font-family: var(--ef-font-family-body);")
                    content = content.replace("font-family: var(--font-display, 'Outfit'), system-ui, sans-serif;", "font-family: var(--ef-font-family-display);")
                    
                    # Fix comments
                    content = content.replace("Outfit + Inter + JetBrains Mono", "Press Start 2P + Pixelify Sans + IBM Plex Mono")
                    content = content.replace("Outfit + Inter", "Press Start 2P + Pixelify Sans")

                    with open(path, 'w') as f:
                        f.write(content)

fix_fonts('src/styles')
print("Fixed fonts.")
