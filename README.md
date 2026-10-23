# Press Under Pressure - Human Verification CAPTCHA

A satirical, high-stakes CAPTCHA mini-game inspired by the Google Stitch aesthetic. Prove you are a biological human entity by completing 8 rapid-fire cognitive rounds before the 25-second countdown expires.

---

## 🎨 Visual Design (Google Stitch)
- **Dark Indigo Base**: `#090A16`, `#0F1226`, `#151936`
- **Electric Violet Accents**: `#8A2BE2`, `#9D4EDD` with glowing neon halos
- **Mint & Coral Highlights**: `#00F5D4` (progression & success) and `#FF5964` (warnings & alarms)
- **Central Circular Arena**: An interactive circular button containing challenge rules and SVG symbols inside, framed by an animated circular SVG countdown ring.

---

## 🎮 Rules & Challenge Mechanics

### ⏱️ Total Time Limit
- **25.00 Seconds Total**: One continuous timer runs across all 8 rounds (~3.1 seconds per round average).
- Letting the clock hit zero results in instant verification failure.

### ⚠️ Special Overrides
- **Rat Override (🐀)**: Whenever a rat appears anywhere in the circle, all instructions are nullified: **Tap 0 times and Confirm immediately!**
- **Moon Override (🌙)**: Whenever a crescent moon appears, cosmic flux engages: **Tap exactly 3 times** regardless of the instructions!

### 🧩 Challenge Families
- **Star Recognition**: Count 5-pointed stars (★) vs. 4-pointed sparkles (✦) vs. hollow stars (☆).
- **Sharp-Edge Counting**: Calculate vertices on geometric shapes (Triangles = 3, Squares = 4, Circles = 0).
- **Color Spectrometry**: Count only Mint, Coral, or Violet shapes.
- **Entity Matching**: Identify robots (🤖), lightning bolts (⚡), keys (🔑), or gems (💎).
- **Parity Logic**: Tap based on condition results (e.g. Even circle count = 2 taps, Odd = 1 tap).
- **Negative Selection**: Exclude specific shapes (e.g. solid stars vs. hollow stars).

> [!NOTE]
> **Tap Confidentiality**: During a live challenge, you will only see your own tap count. The required target tap count is never revealed.

---

## ⌨️ Controls

| Action | Keyboard Shortcut | Mouse / Touch |
|---|---|---|
| **Tap Circular Button** | `Spacebar` | Click/Tap circle |
| **Confirm Round** | `Enter` | Click "Confirm Round" button |
| **Reset Current Taps** | `Backspace` | Click "↺ Reset Taps" |
| **Restart Game** | `R` or `Enter` (on game over) | Click "Re-Authenticate" button |
| **Toggle Sound** | `M` | Click Speaker Icon `🔊 / 🔇` |
| **Help / Rules** | `H` or `?` | Click `❓` Icon |

---

## 🚀 How to Run Locally

### Option 1: Using a Local HTTP Server (Recommended)
Running through an HTTP server ensures the Web Audio API runs without local file restrictions:

1. Open PowerShell or Command Prompt in the project folder (`d:\press-under-pressure`).
2. Start Python's built-in server:
   ```powershell
   python -m http.server 8080
   ```
3. Launch Google Chrome:
   ```powershell
   Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:8080/index.html"
   ```
   Or open Chrome and go to `http://localhost:8080/index.html`.

### Option 2: Direct File Open
You can open `index.html` directly in Chrome:
```powershell
Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" "d:\press-under-pressure\index.html"
```
Or double-click `index.html` in Windows File Explorer.

---

## 📁 File Structure

```
d:\press-under-pressure\
├── index.html       # Single-page markup, HUD, circular arena, and modals
├── style.css        # Stitch dark indigo/violet/mint/coral styles & animations
├── audio.js         # Procedural Web Audio API sound synthesizer
├── game.js          # Procedural round generator, 25s loop, and validation
├── AI_LOG.md        # Comprehensive log of AI development and testing
└── README.md        # Project documentation and instructions
```

---

## 🔊 Audio Effects
All sound effects are synthetically generated in real time using the browser's native **Web Audio API** (zero external MP3/WAV files required):
- Mechanical switch clicks with subtle pitch randomization
- Futuristic latch confirmation sounds
- Dual-tone round completion chimes
- Overrides alert chirps (Rat / Moon)
- Low-time urgency metronome ticks
- Victory multi-chord synth fanfare
- Dissonant failure buzzers
