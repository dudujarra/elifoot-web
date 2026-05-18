import sys
import re
from collections import defaultdict

def main():
    try:
        with open('tsc.log', 'r') as f:
            lines = f.readlines()
    except FileNotFoundError:
        print("tsc.log not found")
        return

    file_edits = defaultdict(list)

    # Parse errors
    for line in lines:
        match = re.match(r'^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)', line)
        if not match:
            continue
            
        filepath, line_num, col, err_code, err_msg = match.groups()
        line_num = int(line_num) - 1
        col = int(col) - 1

        if err_code in ('TS18048', 'TS2532'):
            # TS18048: 'foo.bar' is possibly 'undefined'.
            # TS2532: Object is possibly 'undefined'.
            
            # Extract the expression from the error message if possible
            var_match = re.search(r'\'(.+?)\'', err_msg)
            if var_match:
                var_name = var_match.group(1)
                insert_idx = col + len(var_name)
                # Register edit: (line_num, insert_idx, text_to_insert)
                file_edits[filepath].append((line_num, insert_idx, '!'))
            else:
                # If no variable name in quotes, it might be TS2532 highlighting an object.
                # Just find the end of the word at the column.
                # Actually, TS2532 highlights the whole expression, but we only get the start col.
                pass

    # Apply edits per file
    for filepath, edits in file_edits.items():
        try:
            with open(filepath, 'r') as f:
                content_lines = f.readlines()
        except FileNotFoundError:
            continue

        # Sort edits in descending order of line and column so they don't offset each other
        edits.sort(key=lambda x: (x[0], x[1]), reverse=True)

        for line_num, idx, text in edits:
            if line_num < len(content_lines):
                line = content_lines[line_num]
                # Only insert if not already there
                if idx <= len(line) and line[idx:idx+1] != '!':
                    content_lines[line_num] = line[:idx] + text + line[idx:]

        with open(filepath, 'w') as f:
            f.writelines(content_lines)

    print(f"Applied fixes to {len(file_edits)} files.")

if __name__ == '__main__':
    main()
