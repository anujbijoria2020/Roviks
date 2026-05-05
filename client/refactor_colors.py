import os
import re

directories = ['src']

rules = [
    # Backgrounds
    (r'bg-\[\#0d0d0d\]', 'bg-background', re.IGNORECASE),
    (r'bg-\[\#111111\]', 'bg-surface', re.IGNORECASE),
    (r'bg-\[\#141414\]', 'bg-surface-secondary', re.IGNORECASE),
    (r'bg-\[\#1a1a1a\]', 'bg-surface-secondary', re.IGNORECASE),
    (r'bg-zinc-800', 'bg-surface-secondary', re.IGNORECASE),
    # Primary Backgrounds
    (r'bg-\[\#f5a623\]', 'bg-primary', re.IGNORECASE),
    (r'bg-orange-500', 'bg-primary', re.IGNORECASE),
    # Primary Text
    (r'text-\[\#f5a623\]', 'text-primary', re.IGNORECASE),
    (r'text-orange-500', 'text-primary', re.IGNORECASE),
    # Primary Borders
    (r'border-\[\#f5a623\]', 'border-primary', re.IGNORECASE),
    (r'border-orange-500', 'border-primary', re.IGNORECASE),
    (r'border-\[\#f5a623\]/(\d+)', r'border-primary/\1', re.IGNORECASE),
    (r'bg-\[\#f5a623\]/(\d+)', r'bg-primary/\1', re.IGNORECASE),
    # Hover states
    (r'hover:text-\[\#f5a623\]', 'hover:text-primary', re.IGNORECASE),
    (r'hover:bg-\[\#f5a623\]', 'hover:bg-primary', re.IGNORECASE),
    (r'hover:border-\[\#f5a623\]', 'hover:border-primary', re.IGNORECASE),
    (r'hover:border-\[\#f5a623\]/(\d+)', r'hover:border-primary/\1', re.IGNORECASE),
    # General borders
    (r'border-zinc-800', 'border-border', re.IGNORECASE),
    (r'border-zinc-700', 'border-border', re.IGNORECASE),
    # Text
    (r'\btext-white\b', 'text-foreground', re.IGNORECASE),
    (r'\btext-zinc-200\b', 'text-foreground-secondary', re.IGNORECASE),
    (r'\btext-zinc-300\b', 'text-foreground-secondary', re.IGNORECASE),
    (r'\btext-zinc-400\b', 'text-foreground-muted', re.IGNORECASE),
    (r'\btext-zinc-500\b', 'text-foreground-muted', re.IGNORECASE),
    # Primary Foreground
    (r'\btext-black\b(?=.*bg-primary|.*bg-\[\#f5a623\]|.*bg-orange-500)', 'text-primary-foreground', re.IGNORECASE),
]

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    # Handle the specific text-black on primary bg case
    # This might be tricky via regex, so let's just do an aggressive replace if it's in the same className string:
    # Actually, simpler: replace text-black with text-primary-foreground ONLY if the same line has bg-primary or rounded or btn etc...
    # Better: just replace it if we find it:
    lines = new_content.split('\n')
    for i in range(len(lines)):
        # Apply word-based regexes
        for pattern, replacement, flags in rules:
            if pattern == r'\btext-black\b(?=.*bg-primary|.*bg-\[\#f5a623\]|.*bg-orange-500)':
                if re.search(r'bg-primary', lines[i]):
                     lines[i] = re.sub(r'\btext-black\b', 'text-primary-foreground', lines[i])
            else:
                lines[i] = re.sub(pattern, replacement, lines[i], flags=flags)

    new_content = '\n'.join(lines)
    
    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            replace_in_file(os.path.join(root, file))

print("Done.")
