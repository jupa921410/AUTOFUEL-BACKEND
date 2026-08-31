from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1] / "public"
size = 512
image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(image)

draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=112, fill="#050505")
draw.rounded_rectangle((112, 148, 365, 425), radius=92, fill="#dc2626")
draw.rectangle((112, 148, 365, 300), fill="#dc2626")
draw.rounded_rectangle((350, 195, 482, 365), radius=70, outline="#dc2626", width=48)

try:
    font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 205)
except OSError:
    font = ImageFont.load_default()
draw.text((238, 285), "A", font=font, fill="white", anchor="mm", stroke_width=0)

for points in [((180, 130), (158, 99), (188, 64)), ((270, 125), (248, 92), (279, 55))]:
    draw.line(points, fill="white", width=22, joint="curve")

apple = image.resize((180, 180), Image.Resampling.LANCZOS)
apple.save(root / "autofuel-apple-touch-icon.png", optimize=True)
image.save(root / "autofuel-favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
