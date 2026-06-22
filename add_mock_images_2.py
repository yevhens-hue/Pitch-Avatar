import re

with open('src/data/template-content.ts', 'r') as f:
    content = f.read()

def add_images(m):
    slides_str = m.group(1)
    idx = 1
    def repl(sm):
        nonlocal idx
        res = sm.group(0).replace("elements:", f"image_url: 'https://placehold.co/960x540/eef2ff/0076ff?text=Real+Slide+Image+{idx}',\n        elements:")
        idx += 1
        return res
    # Match any `id: X, title: 'Y', elements:`
    new_slides = re.sub(r'\{\s*id: \d+, title: [^,]+,\s*elements:', repl, slides_str)
    return m.group(0).replace(slides_str, new_slides)

content = re.sub(r"('2': \{\s*templateId: '2',\s*slides: \[)(.*?)(\],\s*\},\s*// ── 3\.)", add_images, content, flags=re.DOTALL)

with open('src/data/template-content.ts', 'w') as f:
    f.write(content)
