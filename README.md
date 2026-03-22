# 🌌 WebGL Particle Image Disintegration

An advanced, interactive WebGL and GPGPU-powered visualizer that disintegrates high-resolution images into over 65,000 interactive floating particles. The particles react to your mouse movements in real-time, creating a mesmerizing, fluid-like distortion effect.

🔗 **Live Demo:** [Experience the Particle Disintegration Here!](https://pankajtiwari-art.github.io/Particle-Image-Disintegration/)

---

## 🌟 Key Features

* **⚡ GPGPU Physics Engine:** Uses General-Purpose computing on Graphics Processing Units to calculate the position and velocity of 65,536 (256x256) individual particles at a flawless 60FPS.
* **🖱️ Real-time Interaction:** Particles seamlessly repel and scatter away from your cursor/touch, then slowly decay back to their original positions.
* **🖼️ Preset Image Gallery:** Instantly switch between stunning pre-loaded high-res images (Space Galaxy, Cyberpunk, Mountains, etc.).
* **🔗 Custom Image Loading:** Paste any CORS-friendly image URL to instantly turn your own pictures into a particle simulation.
* **🎛️ Glassmorphism Control Panel:** A sleek, floating UI to tweak particle size and toggle the background image on the fly.

---

## 🛠️ Tech Stack

* **WebGL & OGL:** Core graphics rendering powered by the lightweight [OGL](https://github.com/oframe/ogl) library.
* **GLSL Shaders:** Custom Vertex and Fragment shaders for rendering points and mapping texture data.
* **JavaScript (ES Modules):** Clean, modern JS handling state, UI interactions, and texture loading.
* **HTML5 & CSS3:** Semantic structure with a modern, frosted-glass interface (Glassmorphism).

---

## 🚀 How to Run Locally

Because this project uses ES Modules and WebGL textures, it needs to be run on a local server to avoid browser CORS (Cross-Origin Resource Sharing) restrictions.

1. Clone this repository:
   ```bash
   git clone [https://github.com/pankajtiwari-art/Particle-Image-Disintegration.git](https://github.com/pankajtiwari-art/Particle-Image-Disintegration.git)
2. Open the folder in VS Code.
3. Install the Live Server extension (if you haven't already).
4. Right-click index.html and select "Open with Live Server".

Note: When testing custom image URLs, ensure the image host allows Cross-Origin requests (like Unsplash or Imgur).

---

## Pankaj Tiwari - Developer & Visual Artist
[GitHub Profile](https://github.com/pankajtiwari-art)

If you find this WebGL experiment inspiring, feel free to give this repository a ⭐!
