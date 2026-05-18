import os
import re

color_map = {
    '#0A130E': 'var(--bg-dark)',
    '#222': 'var(--bg-panel-hover)',
    '#4CAF50': 'var(--primary)',
    '#10B981': 'var(--primary)',
    '#6EE7B7': 'var(--primary)',
    '#081A10': 'var(--bg-panel)',
    '#0A3D1A': 'var(--bg-panel)',
    '#162D1C': 'var(--bg-panel-hover)',
    '#FF9800': 'var(--accent)',
    '#FBBF24': 'var(--accent)',
    '#fbbf24': 'var(--accent)',
    '#f59e0b': 'var(--accent)',
    '#FCD34D': 'var(--accent)',
    '#2A2510': 'var(--bg-panel-sunk)',
    '#3D3200': 'var(--bg-panel-sunk)',
    '#1A1808': 'var(--bg-panel-sunk)',
    '#F44336': 'var(--danger)',
    '#EF4444': 'var(--danger)',
    '#ef4444': 'var(--danger)',
    '#FF5555': 'var(--danger)',
    '#FCA5A5': 'var(--danger)',
    '#1A0808': 'var(--bg-panel-sunk)',
    '#2A1010': 'var(--bg-panel-sunk)',
    '#3D0A0A': 'var(--bg-panel-sunk)',
    '#2D1616': 'var(--bg-panel-sunk)',
    '#6c2b75': 'var(--color-mute, #7B2CBF)',
    '#452873': 'var(--color-mute, #7B2CBF)',
    '#1a0f2e': 'var(--bg-dark)',
    '#2D162D': 'var(--bg-panel-sunk)',
    '#140818': 'var(--bg-panel-sunk)',
    '#A855F7': 'var(--color-mute, #7B2CBF)',
    '#161B22': 'var(--bg-dark)',
    '#0D1A24': 'var(--bg-dark)',
    '#081018': 'var(--bg-panel-sunk)',
    '#0E1418': 'var(--bg-panel)',
    '#040805': 'var(--bg-dark)',
    '#2D3748': 'var(--bg-panel-hover)',
    '#3B82F6': 'var(--info)',
    '#3b82f6': 'var(--info)',
    '#40BAF7': 'var(--info)',
    '#93C5FD': 'var(--info)',
    '#1d7aa8': 'var(--info)',
    '#a5b4fc': 'var(--info)',
    '#102030': 'var(--bg-panel-sunk)',
    '#F1FAEE': 'var(--text-main)',
    '#222222': 'var(--bg-panel-hover)',
}

def fix_colors():
    # Only fix files that have COLOR issues based on the audit
    # But doing a global replace in src/styles/ is faster, except ignoring tokens
    for root, _, files in os.walk('src/styles'):
        for file in files:
            if file.endswith('.css') and 'isssd-premium' not in file and 'tokens' not in file and 'elifoot-classic' not in file and 'StyleguideView' not in file:
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                
                original_content = content
                for hex_code, token in color_map.items():
                    # Replace hex_code with token, ignore case for hex matching
                    content = re.sub(re.escape(hex_code) + r'\b', token, content, flags=re.IGNORECASE)
                
                if content != original_content:
                    with open(path, 'w') as f:
                        f.write(content)

# Special handling for index.css too
def fix_index():
    path = 'src/index.css'
    if os.path.exists(path):
        with open(path, 'r') as f:
            content = f.read()
        
        original_content = content
        for hex_code, token in color_map.items():
            content = re.sub(re.escape(hex_code) + r'\b', token, content, flags=re.IGNORECASE)
            
        if content != original_content:
            with open(path, 'w') as f:
                f.write(content)

fix_colors()
fix_index()
print("Fixed Colors")
