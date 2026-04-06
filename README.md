# 🧠 CNN 3D Visualizer

Interactive browser-based 3D visualization of how a Convolutional Neural Network (CNN) processes image data from input to prediction.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![Three.js](https://img.shields.io/badge/Three.js-r128-green)
![WebGL](https://img.shields.io/badge/WebGL-Enabled-blue)

## 📋 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [How to Use](#-how-to-use)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## 🌟 Overview

`CNN 3D Visualizer` is an educational tool that makes CNN internals easier to understand through live 3D animations.

It visually demonstrates:
- Input grid representation
- Convolution and feature extraction
- Pooling and spatial reduction
- Flatten and dense layer transformation
- Output confidence scores

## ✨ Features

- 🧩 Real-time 3D CNN layer visualization
- 🎬 Play, pause, reset, and step-by-step animation controls
- ⚡ Adjustable speed (`0.1x` to `3.0x`)
- 🖱️ Orbit camera controls (rotate, zoom, pan)
- 📊 Live layer info and prediction confidence bars
- 🎓 Beginner-friendly UI for teaching and demos

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **3D Engine:** Three.js (`r128` CDN)
- **Icons & Fonts:** Font Awesome, Google Fonts (Inter)

## 🚀 Getting Started

### Prerequisites

- Git
- Any modern browser (Chrome, Edge, Firefox, Safari)
- WebGL enabled

### 1) Clone the Repository

```bash
git clone https://github.com/srimathic11/CNN-3D-Visualizer-main.git
cd CNN-3D-Visualizer-main
```

### 2) Run Locally

Use any one of these options from the project root:

```bash
# Python 3
python3 -m http.server 8000
```

```bash
# Node.js
npx serve .
```

Then open:

```text
http://localhost:8000
```

## 🎮 How to Use

1. Select an input image from the dropdown.
2. Click **Start Processing**.
3. Rotate/zoom the 3D scene with mouse controls.
4. Use **Step Forward** for layer-by-layer understanding.
5. Adjust animation speed with the slider.

### Keyboard Shortcuts

- `Space` → Play/Pause
- `R` → Reset
- `→` → Step Forward
- `↑ / ↓` → Speed Up / Slow Down
- `H` → Help

## 📁 Project Structure

```text
CNN-3D-Visualizer-main/
├── index.html
├── styles.css
├── main.js
├── CNNVisualizer.js
├── LayerComponents.js
├── AnimationEngine.js
├── UIController.js
├── package.json
├── start.bat
└── README.md
```

## 🔧 Troubleshooting

- **Black/empty canvas**
  - Ensure WebGL is enabled in browser.
  - Try latest Chrome/Edge.

- **Slow performance**
  - Close other heavy tabs/apps.
  - Reduce animation speed.

- **Scripts not loading**
  - Run with a local server (`python3 -m http.server 8000`) instead of opening with `file://`.

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

