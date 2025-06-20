# 🛠️ Flow-Sentinel

**Flow-Sentinel** is a lightweight, AI-assisted pipeline monitoring tool that detects potential leaks by analyzing pressure sensor data across a network of pipes modeled as a graph.

Built with a modern monorepo architecture:

- 🧠 **FastAPI** (Python) backend for prediction logic and sensor data APIs  
- ⚛️ **React + Vite** frontend for interactive visualization and UI  
- 🧪 Simulated sensor data for rapid prototyping and testing

---

## 📊 How It Works

- Each **pipeline junction** is a **node**, and each **pipe** is an **edge** with defined flow capacity.
- **Pressure sensors** are simulated at each node and send periodic readings.
- The **backend** evaluates anomalies (e.g., sudden drops in pressure) to flag potential leaks.
- The **frontend** displays:
  - Real-time flow and pressure at nodes
  - Color-coded graph of the pipeline
  - Leak detection alerts
  - System statistics and trends

---

## 🖥️ Dashboard Features

### 🏠 Home Page
- Interactive map of the pipeline network
- Color-coded edges:
  - 🟢 Safe
  - 🟡 Leak-prone
  - 🔴 High-risk
  - 🟣 Confirmed leak
- Color-coded nodes:
  - 🟢 Normal
  - 🟡 Pressure/demand issue
  - ⚫ Offline
- Stats sidebar:
  - Total flow
  - Avg/min/max pressure
  - Active leaks
  - Last leak info

### 🛠️ Maintenance Page
- View and manage:
  - Ongoing tasks
  - Upcoming schedules
  - Past work logs
- Add/edit/delete maintenance entries
- Todo-style task list UI

### 🧪 Leak Prevention Page
- Select a pipe from the list
- View details:
  - Pressure trend over time
  - Maintenance history
  - Leak record
  - Upcoming scheduled work

---

## ⚙️ Tech Stack

| Layer     | Tools |
|-----------|-------|
| Frontend  | React (Vite), React Router, Axios, Chart.js |
| Backend   | FastAPI, Pydantic, Uvicorn |
| Visualization | react-cytoscapejs (graph), chart.js (trends) |
| Style     | CSS Modules or MUI (no Tailwind) |
| Structure | Monorepo (`frontend/` + `backend/`) |

---

## 📦 Getting Started

```
git clone https://github.com/your-username/flow-sentinel.git
cd flow-sentinel
Backend
bash
Copy
Edit
cd backend
python -m venv venv
venv\Scripts\activate #Bin: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
Runs at: http://localhost:8000
```
Frontend
```
cd frontend
npm install
npm run dev
Runs at: http://localhost:5173
```
Make sure the frontend uses a proxy to forward API calls to FastAPI:

vite.config.js
```
js
Copy
Edit
server: {
  proxy: {
    '/graph': 'http://localhost:8000',
    '/stats': 'http://localhost:8000',
    '/pipes': 'http://localhost:8000',
    '/maintenance': 'http://localhost:8000',
  }
}
```
