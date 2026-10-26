"""Render ZAD's original short bead collision effect; no external audio sources."""
from pathlib import Path
import math
import random
import struct
import wave

root = Path(__file__).resolve().parents[1]
target = root / 'modules/zad-adhan/android/src/main/res/raw/tasbih_bead.wav'
target.parent.mkdir(parents=True, exist_ok=True)
rate = 22050
rng = random.Random(617)
frames = []
for i in range(round(rate * .09)):
    t = i / rate
    attack = min(1, t / .0004)
    body = .35 * math.sin(2 * math.pi * 830 * t) * math.exp(-t * 125)
    ring = .18 * math.sin(2 * math.pi * 2180 * t) * math.exp(-t * 180)
    transient = .20 * rng.uniform(-1, 1) * math.exp(-t * 430)
    tail = max(0, 1 - t / .09)
    frames.append(struct.pack('<h', round(32767 * attack * (body + ring + transient) * tail)))
with wave.open(str(target), 'wb') as output:
    output.setnchannels(1)
    output.setsampwidth(2)
    output.setframerate(rate)
    output.writeframes(b''.join(frames))
print(f'{target.name}: {len(frames)} mono PCM16 samples at {rate}Hz')
