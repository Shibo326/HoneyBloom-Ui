import shutil
from PIL import Image, ImageFilter
from collections import deque

shutil.copy2("assets/gallery-spoon-cup_original.png", "assets/gallery-spoon-cup.png")
img = Image.open("assets/gallery-spoon-cup.png").convert("RGBA")
w, h = img.size
p = img.load()

def dist(c1, c2):
    return sum((a - b) ** 2 for a, b in zip(c1[:3], c2[:3])) ** 0.5

# Two bg patches: top-left (darker grey) and top-right (near white)
patch_tl = [p[x][y][:3] if False else p[x, y][:3] for x in range(30) for y in range(30)]
patch_tr = [p[w - 1 - x, y][:3] for x in range(30) for y in range(30)]

bg_tl = tuple(sum(c[i] for c in patch_tl) // len(patch_tl) for i in range(3))
bg_tr = tuple(sum(c[i] for c in patch_tr) // len(patch_tr) for i in range(3))
print("bg_tl:", bg_tl)
print("bg_tr:", bg_tr)

TOLERANCE = 80

def is_bg(px):
    return dist(px[:3], bg_tl) <= TOLERANCE or dist(px[:3], bg_tr) <= TOLERANCE

visited = [[False] * h for _ in range(w)]
q = deque()

for x in range(w):
    for y in [0, h - 1]:
        if not visited[x][y] and is_bg(p[x, y]):
            q.append((x, y))
            visited[x][y] = True

for y in range(h):
    for x in [0, w - 1]:
        if not visited[x][y] and is_bg(p[x, y]):
            q.append((x, y))
            visited[x][y] = True

print("Seeds:", len(q))

while q:
    x, y = q.popleft()
    p[x, y] = (p[x, y][0], p[x, y][1], p[x, y][2], 0)
    for nx, ny in [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]:
        if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
            if is_bg(p[nx, ny]):
                visited[nx][ny] = True
                q.append((nx, ny))

r, g, b, a = img.split()
a = a.filter(ImageFilter.GaussianBlur(0.8))
result = Image.merge("RGBA", (r, g, b, a))
result.save("assets/gallery-spoon-cup.png", "PNG", optimize=True)

p2 = result.load()
print("Corners: TL=%d TR=%d BL=%d BR=%d" % (
    p2[0, 0][3], p2[w-1, 0][3], p2[0, h-1][3], p2[w-1, h-1][3]
))
print("Done!")
