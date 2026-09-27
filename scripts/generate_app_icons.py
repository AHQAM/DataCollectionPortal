import os
from PIL import Image, ImageDraw

def generate_icons():
    source_path = r"C:\Users\devma\.gemini\antigravity-ide\brain\5bdc62b8-5ac3-45d4-afa8-e3b27867e016\field_collection_icon_1790418755751.jpg"
    res_dir = r"c:\DataCollectionPortal\mobile\android\app\src\main\res"

    img = Image.open(source_path).convert("RGBA")

    # The squircle in the generated 1024x1024 image is centered at (512, 512)
    # Box (104, 104, 920, 920) perfectly bounds the squircle (816x816 square)
    base_square = img.crop((104, 104, 920, 920))
    w, h = base_square.size

    # 1. Base squircle icon with transparent rounded corners (corner radius 180 out of 816 ~ 22%)
    squircle_mask = Image.new("L", (w, h), 0)
    draw_sq = ImageDraw.Draw(squircle_mask)
    draw_sq.rounded_rectangle([0, 0, w, h], radius=180, fill=255)
    
    squircle_icon = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    squircle_icon.paste(base_square, (0, 0), mask=squircle_mask)

    # 2. Base round icon (circular mask)
    round_mask = Image.new("L", (w, h), 0)
    draw_rd = ImageDraw.Draw(round_mask)
    draw_rd.ellipse([0, 0, w, h], fill=255)

    round_icon = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    round_icon.paste(base_square, (0, 0), mask=round_mask)

    # 3. Adaptive Foreground:
    # Android Adaptive canvas is 108dp. Safe zone is inner 72dp (66.6%).
    # We place the base square scaled to ~70% inside an 816x816 transparent canvas.
    fg_canvas_size = 1000
    safe_size = int(fg_canvas_size * 0.70)  # 700x700
    scaled_content = base_square.resize((safe_size, safe_size), Image.Resampling.LANCZOS)
    
    # Soft rounded corners for the content in foreground
    fg_mask = Image.new("L", (safe_size, safe_size), 0)
    draw_fg = ImageDraw.Draw(fg_mask)
    draw_fg.rounded_rectangle([0, 0, safe_size, safe_size], radius=int(safe_size * 0.22), fill=255)
    
    fg_icon = Image.new("RGBA", (fg_canvas_size, fg_canvas_size), (0, 0, 0, 0))
    offset = (fg_canvas_size - safe_size) // 2
    fg_icon.paste(scaled_content, (offset, offset), mask=fg_mask)

    # Mipmap densities and sizes
    densities = {
        "mipmap-mdpi": {"legacy": 48, "fg": 108},
        "mipmap-hdpi": {"legacy": 72, "fg": 162},
        "mipmap-xhdpi": {"legacy": 96, "fg": 216},
        "mipmap-xxhdpi": {"legacy": 144, "fg": 324},
        "mipmap-xxxhdpi": {"legacy": 192, "fg": 432},
    }

    for folder, sizes in densities.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)

        leg_size = sizes["legacy"]
        # Save ic_launcher.png
        res_squircle = squircle_icon.resize((leg_size, leg_size), Image.Resampling.LANCZOS)
        res_squircle.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")

        # Save ic_launcher_round.png
        res_round = round_icon.resize((leg_size, leg_size), Image.Resampling.LANCZOS)
        res_round.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")

        # Save ic_launcher_foreground.png
        fg_size = sizes["fg"]
        res_fg = fg_icon.resize((fg_size, fg_size), Image.Resampling.LANCZOS)
        res_fg.save(os.path.join(folder_path, "ic_launcher_foreground.png"), "PNG")

        print(f"Generated icons for {folder}: legacy={leg_size}x{leg_size}, fg={fg_size}x{fg_size}")

    # Also save a 512x512 high-res store icon
    store_icon = squircle_icon.resize((512, 512), Image.Resampling.LANCZOS)
    store_icon.save(os.path.join(res_dir, "ic_launcher-web.png"), "PNG")
    print("Generated 512x512 ic_launcher-web.png")

    # Also save to public/ and mobile/
    assets_dir = r"c:\DataCollectionPortal\mobile\assets\branding"
    os.makedirs(assets_dir, exist_ok=True)
    store_icon.save(os.path.join(assets_dir, "app_icon_512.png"), "PNG")
    print(f"Saved branding copy to {assets_dir}")

if __name__ == "__main__":
    generate_icons()
