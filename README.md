# 🚰 Flow-Sentinel

**Flow-Sentinel** is a lightweight, AI-assisted pipeline monitoring tool that detects potential leaks by analyzing pressure sensor data across a network of pipes modeled as a graph. It uses a modern monorepo setup with:

-   🧠 **FastAPI** (Python) backend for prediction and sensor data APIs
-   ⚛️ **React** (Vite) frontend for visualization and interaction
-   📈 Simulated data for fast prototyping and demo use

---

## 📊 How It Works

-   Each pipeline junction is a **node**, and pipes are **edges with max flow**.
-   Pressure sensors collect data at each node.
-   Backend checks for anomalies like unexpected drops in pressure.
-   React frontend displays:
    -   Real-time pressure at each node
    -   Leak warnings
    -   Graph visualization

---

## 🚀 Future Plans

-   [ ] ML model for more accurate leak detection
-   [ ] Historical pressure graphing
-   [ ] Live IoT device integration
-   [ ] Export reports (PDF/CSV)

---
