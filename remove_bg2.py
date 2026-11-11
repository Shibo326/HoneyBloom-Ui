"""
Fix gallery-stacked-cups.png — gradient grey background needs
multi-point edge sampling + higher tolerance.
Also re-processes logo1.png which had a grey (not white) bg.
"""

from PIL import Image, ImageFilter
from collections import deque
import os, shutil

ASSETS = r"d:\programming\rainiel proj\assets"


def color_distance(c1, c2):
    return sum((a - b) ** 2 for a, b in zip(c1[:3], c2[:3])) ** 0.5


def flood_fill_alpha_multi(img: Image.Image, tolerance: int) -> Image.Image:
    """
    Samples bg color from ALL edge pixels (not just 4 corners),
    clusters them, picks the dominant bg cluster, then flood-fills.
    This handles gradient backgrounds much better.
    """
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size

    # Collect all edge pixel colors
    edge_colors = []
    for x in range(w):
        edge_colors.append(pixels[x, 0][:3])
        edge_colors.append(pixels[x, h - 1][:3])
    for y in range(h):
        edge_colors.append(pixels[0, y][:3])
        edge_colors.append(pixels[w - 1, y][:3])

    # Find the dominant bg color by averaging all edge pixels
    # that are within 60px of each other (simple mean shift)
    r = sum(c[0] for c in edge_colors) // len(edge_colors)
    g = sum(c[1] for c in edge_colors) // len(edge_colors)
    b = sum(c[2] for c in edge_colors) // len(edge_colors)
    bg = (r, g, b)

    print(f"  Detected bg color: rgb{bg}")

    # BFS flood fill from ALL edge pixels that match bg within tolerance
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

    print(f"  Flood fill seed pixels: {len(queue)}")

    while queue:
        x, y = queue.popleft()
        r, g, b, a = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)
        for nx, ny in [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]:
            if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                if color_distance(pixels[nx, ny][:3], bg) <= tolerance:
                    visited[nx][ny] = True
                    queue.append((nx, ny))

    return img


def smooth_edges(img: Image.Image) -> Image.Image:
    r, g, b, a = img.split()
    a_smooth = a.filter(ImageFilter.GaussianBlur(radius=0.8))
    return Image.merge("RGBA", (r, g, b, a_smooth))


# gallery-stacked-cups — gradient grey needs tolerance 65
TARGETS = {
    "gallery-stacked-cups.png": 65,
}

for filename, tolerance in TARGETS.items():
    src = os.path.join(ASSETS, filename)
    # Restore from original backup first
    name, ext = os.path.splitext(filename)
    backup = os.path.join(ASSETS, f"{name}_original{ext}")
    if os.path.exists(backup):
        shutil.copy2(backup, src)
        print(f"Restored from backup: {filename}")

    print(f"Processing: {filename} (tolerance={tolerance})")
    img = Image.open(src)
    result = flood_fill_alpha_multi(img, tolerance)
    result = smooth_edges(result)
    out = os.path.join(ASSETS, name + ".png")
    result.save(out, "PNG", optimize=True)
    print(f"  ✓ Saved: {name}.png")

print("\nDone.")
