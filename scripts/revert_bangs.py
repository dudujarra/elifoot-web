import os
import glob
import re

def main():
    files = glob.glob('src/engine/**/*.ts', recursive=True)
    count = 0
    for file in files:
        with open(file, 'r') as f:
            content = f.read()
        
        # We replace any letter followed by ! followed by letter or dot
        # This will remove 'mana!ger', 'player!.age', 'obj!.prop'
        new_content = re.sub(r'([a-zA-Z])!([a-zA-Z\.])', r'\1\2', content)
        
        if content != new_content:
            with open(file, 'w') as f:
                f.write(new_content)
            count += 1
            print(f"Reverted in {file}")

    print(f"Reverted in {count} files.")

if __name__ == '__main__':
    main()
