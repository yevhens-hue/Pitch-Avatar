import re

with open('src/data/template-content.ts', 'r') as f:
    content = f.read()

# Add image_url to SlideContent
content = content.replace('  elements: SelectedElement[]\n}', '  elements: SelectedElement[]\n  image_url?: string\n}')

# For template '2', add image_url to each slide
def add_images(m):
    slides_str = m.group(1)
    # find { id: X, title: 'Y', elements: ... } and add image_url
    idx = 1
    def repl(sm):
        nonlocal idx
        res = sm.group(0).replace("elements:", f"image_url: 'https://placehold.co/960x540/eef2ff/0076ff?text=Real+Slide+Image+{idx}',\n        elements:")
        idx += 1
        return res
    new_slides = re.sub(r'\{\s*id: \d+, title: [^,]+,\s*elements:', repl, slides_str)
    return m.group(0).replace(slides_str, new_slides)

content = re.sub(r"('2': \{\s*templateId: '2',\s*slides: \[)(.*?)(\],\s*\},\s*// ── 3\.)", add_images, content, flags=re.DOTALL)

with open('src/data/template-content.ts', 'w') as f:
    f.write(content)
