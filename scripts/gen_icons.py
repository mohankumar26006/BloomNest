import os
from PIL import Image, ImageDraw, ImageFont

def generate_icon(size, filename):
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw a circle
    margin = size * 0.1
    draw.ellipse([margin, margin, size - margin, size - margin], fill='#f43f5e') # rose-500
    
    # Add a simple text 'B' inside
    # Attempt to load a default font if possible, else use default
    try:
        # Load Arial on windows or equivalent
        font = ImageFont.truetype("arial.ttf", int(size * 0.5))
    except:
        font = ImageFont.load_default()
        
    text = "B"
    # Centering text
    # use getbbox
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    
    x = (size - text_w) / 2
    y = (size - text_h) / 2
    
    # Slight adjustment for visual centering
    y -= size * 0.05
    
    draw.text((x, y), text, fill='white', font=font)
    
    img.save(filename)
    print(f"Generated {filename}")

os.makedirs('public', exist_ok=True)
generate_icon(192, 'public/pwa-192x192.png')
generate_icon(512, 'public/pwa-512x512.png')
generate_icon(512, 'public/maskable-icon-512x512.png')

print("All icons generated.")
