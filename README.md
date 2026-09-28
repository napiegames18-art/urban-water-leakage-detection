# AquaIntel AI: Urban Water Leakage & Abnormal Consumption Detection

AquaIntel AI is an enterprise-grade, full-stack AI/ML platform for municipal and urban water distribution networks. It integrates real-time SCADA telemetry, acoustic hydrophone frequency analysis, transient pressure localization, IWA standard water balance accounting, and Advanced Metering Infrastructure (AMI) smart meter consumption profiling.

---

## 🌟 Key Features

### 1. 🗺️ Interactive Digital Twin GIS Network Map
- Vector SCADA topology visualizer covering 4 District Metered Areas (DMAs), reservoirs, booster pumps, Pressure Reducing Valves (PRVs), and 28 pipeline segments.
- Dynamic layer filters (*Full GIS, Acoustic Heatmap, Pressure Drop Gradients, Pipe Risk Index*).
- Animated flow vectors and real-time telemetry drawer for each junction node and pipe.

### 2. 🧠 Multi-Model AI Leakage & Burst Localization
- **Acoustic FFT Peak Decomposition**: Distinguishes turbulent pipe friction noise (450Hz - 1600Hz for metal, 180Hz - 700Hz for HDPE) from ambient fluid flow.
- **Pressure Transient Arrival Differential ($\Delta t$)**: Computes distance to pipe rupture with $\pm 6\text{m}$ accuracy using material wave speeds.
- **Automated Emergency Valve Isolation Solver**: Employs topological graph cut-set analysis to identify minimal boundary valves to shut down with lowest customer disruption.

### 3. 📊 IWA Standard Water Balance & Minimum Night Flow (MNF)
- Full System Input Volume (SIV) hierarchical Sankey flow accounting (Revenue Water vs Physical & Commercial Losses).
- **Minimum Night Flow (02:00 - 04:00 AM)** regression analyzer detecting hidden subterranean leakage.

### 4. 🏠 Smart Meter (AMI) Abnormal Consumption Profiler
- 24-hour diurnal consumption curves for residential, commercial, and industrial meters.
- AI anomaly classification:
  - `CONTINUOUS_LEAK`: Steady baseline flow during sleeping hours (e.g. toilet flapper leak).
  - `METER_TAMPERING_BYPASS`: Sudden collapse in registered volume during operating hours.
  - `UNCHARACTERISTIC_SURGE`: Excessive uncharacteristic flow exceeding 3.5x historical envelope.
  - `BACKFLOW_RISK`: Negative flow registration with potential potable water contamination.
- Automated customer alert dispatch.

### 5. 🔮 Predictive Pipe Health & Asset Risk Index
- Physics-informed **Weibull Hazard Rate** scoring pipe material, age, soil corrosivity, and C-factor roughness to compute failure risk ($0-100\%$) and Remaining Useful Life (RUL).

### 6. ⚡ Incident Simulation & Fault Injection Studio
- Interactive triggers to simulate pipe bursts ($145\text{ m}^3/\text{h}$), underground fissures, smart meter tampering, industrial surges, or reset to nominal baseline.

### 7. 📋 Dispatch Queue & 🤖 AI Operations Copilot
- Real-time technician work order tracking from dispatch to repressurization.
- Conversational AI assistant specialized in hydraulic troubleshooting and network optimization.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- npm

### 1. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Run the Application

#### Terminal 1: Start Backend Server
```bash
cd backend
npm start
# REST API and Telemetry Stream run on http://localhost:5000
```

#### Terminal 2: Start Frontend UI
```bash
cd frontend
npm run dev
# Mission Control UI opens on http://localhost:3000
```

---

## 📂 Project Structure

```
AIML PROJECT 1/
├── backend/
│   ├── data/
│   │   └── networkTopology.js     # DMAs, nodes, pipes, valves, smart meters
│   ├── services/
│   │   ├── aiDetectionEngine.js   # Multi-sensor AI, acoustic, transient & risk models
│   │   └── simulationService.js   # Live telemetry stream & fault injector
│   ├── server.js                  # Express REST API routes & AI Copilot
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DigitalTwinMap.jsx         # Vector GIS digital twin map
│   │   │   ├── LeakDetectionHub.jsx       # Multi-sensor leak detection & valve solver
│   │   │   ├── WaterBalanceAnalytics.jsx  # IWA Water Balance & MNF analyzer
│   │   │   ├── SmartMeterMonitoring.jsx   # AMI consumption profiler & alerts
│   │   │   ├── PipeRiskPredictor.jsx      # Weibull asset risk & RUL matrix
│   │   │   ├── SimulationControls.jsx     # Fault injection studio
│   │   │   ├── WorkOrdersModal.jsx        # Dispatch & repair tracking
│   │   │   └── AICopilotDrawer.jsx        # Conversational operations assistant
│   │   ├── App.jsx                        # Master mission control layout
│   │   └── App.css                        # Glassmorphic UI theme
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── README.md
```

---

## 📜 License
MIT License. Built for Smart City Urban Water Infrastructure & Sustainability.
