"""
Background removal for HoneyBloom assets.
Uses corner-sample flood-fill with tolerance — works well on
solid/near-solid studio backgrounds (white, cream, light grey).
Saves originals as *_original.png backups first.
"""

from PIL import Image, ImageFilter
import os, shutil

ASSETS = r"d:\programming\rainiel proj\assets"

# Files to process and their approximate bg tolerance
# Higher tolerance = more aggressive removal (needed for grey gradients)
TARGETS = {
    "honeybloom-logo.png":    55,   # cream/off-white bg
    "logo1.png":              55,   # light grey bg
    "gallery-stacked-cups.png": 38, # white/light grey studio bg
    "gallery-spoon-cup.png":  38,   # near-white with soft shadow
    "product.png":            45,   # light grey studio bg
}


def color_distance(c1, c2):
    """Euclidean distance in RGB space."""
    return sum((a - b) ** 2 for a, b in zip(c1[:3], c2[:3])) ** 0.5


def flood_fill_alpha(img: Image.Image, tolerance: int) -> Image.Image:
    """
    Sample the four corners to get the background color,
    then walk every pixel — if it's within tolerance of the bg
    AND reachable from the edges via a flood fill, make it transparent.
    """
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size

    # Sample bg color from corners (average)
    corners = [
        pixels[0, 0][:3],
        pixels[w - 1, 0][:3],
        pixels[0, h - 1][:3],
        pixels[w - 1, h - 1][:3],
    ]
    bg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))

    # BFS flood fill from all edge pixels
    from collections import deque
    visited = [[False] * h for _ in range(w)]
    queue = deque()

    for x in range(w):
        for y in [0, h - 1]:
            if not visited[x][y] and color_distance(pixels[x, y][:3], bg) <= tolerance:
                queue.append((x, y))
                visited[x][y] = True
    for y in range(h):
        for x in [0, w - 1]:
            if not visited[x][y] and color_distance(pixels[x, y][:3], bg) <= tolerance:
                queue.append((x, y))
                visited[x][y] = True

    while queue:
        x, y = queue.popleft()
        pixels[x, y] = (pixels[x, y][0], pixels[x, y][1], pixels[x, y][2], 0)
        for nx, ny in [(x+1,y),(x-1,y),(x,y+1),(x,y-1)]:
            if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                if color_distance(pixels[nx, ny][:3], bg) <= tolerance:
                    visited[nx][ny] = True
                    queue.append((nx, ny))

    return img


def smooth_edges(img: Image.Image) -> Image.Image:
    """
    Apply a very slight alpha blur at the edges to avoid harsh jagged cutouts.
    """
    # Extract alpha, slightly blur it, put back
    r, g, b, a = img.split()
    a_smooth = a.filter(ImageFilter.GaussianBlur(radius=0.8))
    return Image.merge("RGBA", (r, g, b, a_smooth))


for filename, tolerance in TARGETS.items():
    src = os.path.join(ASSETS, filename)
    if not os.path.exists(src):
        print(f"SKIP (not found): {filename}")
        continue

    # Backup original
    name, ext = os.path.splitext(filename)
    backup = os.path.join(ASSETS, f"{name}_original{ext}")
    if not os.path.exists(backup):
        shutil.copy2(src, backup)
        print(f"  Backed up: {filename} → {name}_original{ext}")

    print(f"Processing: {filename} (tolerance={tolerance})")
    img = Image.open(src)
    result = flood_fill_alpha(img, tolerance)
    result = smooth_edges(result)

    # Always save as PNG (supports transparency)
    out_path = os.path.join(ASSETS, name + ".png")
    result.save(out_path, "PNG", optimize=True)
    print(f"  ✓ Saved: {name}.png")

print("\nDone.")
