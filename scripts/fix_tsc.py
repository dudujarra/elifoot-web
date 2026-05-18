import os
import re

def main():
    with open('tsc_errors.log', 'r') as f:
        lines = f.readlines()

    file_edits = {}

    for line in lines:
        match = re.match(r'(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)', line)
        if match:
            filepath, line_num, col, err_code, err_msg = match.groups()
            line_num = int(line_num) - 1
            col = int(col) - 1

            if filepath not in file_edits:
                try:
                    with open(filepath, 'r') as f:
                        file_edits[filepath] = f.readlines()
                except:
                    continue

            lines_content = file_edits[filepath]
            curr_line = lines_content[line_num]

            if err_code == 'TS2345' and "Argument of type 'unknown'" in err_msg:
                # catch (err) -> err as Error
                lines_content[line_num] = curr_line.replace('capture(err,', 'capture(err as Error,')
            
            elif err_code == 'TS7006':
                # Parameter implicitly has 'any' type
                # Simple fix: wait, regex might be tricky. Let's do a naive replace for p and s
                if "Parameter 'p'" in err_msg:
                    lines_content[line_num] = re.sub(r'\bp\b', '(p: any)', curr_line, count=1)
                elif "Parameter 's'" in err_msg:
                    lines_content[line_num] = re.sub(r'\bs\b', '(s: any)', curr_line, count=1)
                    
            elif err_code == 'TS2404':
                # for...in cannot use type annotation
                lines_content[line_num] = re.sub(r'const\s+(\w+)\s*:\s*any\s+in', r'const \1 in', curr_line)
                lines_content[line_num] = re.sub(r'let\s+(\w+)\s*:\s*any\s+in', r'let \1 in', lines_content[line_num])

            elif err_code == 'TS7034' and "implicitly has type 'any[]'" in err_msg:
                lines_content[line_num] = curr_line.replace(' = []', ': any[] = []')

            elif err_code == 'TS2612':
                # Property 'winner' will overwrite base property
                # Just add declare or remove it. Better to remove it or add declare
                lines_content[line_num] = "    // " + curr_line

            elif err_code == 'TS2416' and 'advanceWeek' in curr_line:
                pass

            elif err_code == 'TS2554' and 'Expected 2 arguments, but got 0' in err_msg:
                # DuelResolver and xGEngine empty function call
                pass

    for filepath, lines_content in file_edits.items():
        with open(filepath, 'w') as f:
            f.writelines(lines_content)

if __name__ == '__main__':
    main()
