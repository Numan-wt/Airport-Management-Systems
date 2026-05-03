# ✈️ AeroNexus — Smart Airport Management System

A fully featured, premium **Airport Management System** built with pure HTML, CSS, and JavaScript. No backend required — runs entirely in the browser.

## 🚀 Live Features

| Module | Description |
|---|---|
| 📊 **Live Dashboard** | Real-time stats, live flight board, charts, weather, activity timeline |
| 🛫 **Flight Management** | Add, edit, cancel flights with full status tracking |
| 👤 **Passenger System** | Passenger registry, boarding pass with QR code generation |
| ✅ **Check-in System** | 3-step wizard — booking lookup → seat selection → boarding pass |
| 🛡 **Staff & Admin Panel** | Role-based roster, shift management, performance tracking |
| 🚪 **Smart Gate Allocation** | AI-powered auto-allocation, conflict detection, visual terminal map |
| ⚠ **Delay Prediction Engine** | ML-style risk scoring, heatmap by airline & hour, factor analysis |
| 💺 **Smart Seat Allocation** | Interactive aircraft seat map, auto-assign by class & preference |

## 🎨 Design

- Premium **dark mode** UI with glassmorphism effects
- **Chart.js** for data visualizations
- **QR code** boarding pass generation
- Fully responsive layout
- Real-time clock & weather widget

## 🛠 Tech Stack

- **HTML5** — Semantic structure
- **Vanilla CSS** — Custom design system with CSS variables
- **Vanilla JavaScript** — Modular architecture, no frameworks
- **Chart.js** — Data visualizations
- **QRCode.js** — Boarding pass QR codes

## 📁 Project Structure

```
airport-management/
├── index.html          # Main app shell
├── style.css           # Global design system
├── app.js              # Core app engine (router, state, utilities)
├── data/
│   └── mock.js         # Realistic flight/passenger/staff data
└── modules/
    ├── dashboard.js    # Live Dashboard
    ├── flights.js      # Flight Management
    ├── passengers.js   # Passenger System
    ├── checkin.js      # Check-in Wizard
    ├── staff.js        # Staff & Admin Panel
    ├── gates.js        # Smart Gate Allocation
    ├── delay.js        # Delay Prediction Engine
    └── seats.js        # Smart Seat Allocation
```

## ▶️ How to Run

### Option 1 — Python (Recommended)
```bash
cd airport-management
python -m http.server 8080
```
Then open **http://localhost:8080** in your browser.

### Option 2 — VS Code
Install the **Live Server** extension, right-click `index.html` → **Open with Live Server**.

### Option 3 — Node.js
```bash
npx serve .
```

## ✈️ Airport Details

- **Airport:** Indira Gandhi International Airport (IGIA)
- **IATA Code:** DEL
- **Location:** New Delhi, India
- **Terminals:** T1 (Domestic), T2 (Domestic), T3 (International)
- **Gates:** 20 gates simulated

## 📸 Screenshots

> Live Dashboard with real-time flight board, stats and charts

## 🎓 College Project

Built as a comprehensive demonstration of:
- Modular JavaScript architecture
- Real-time UI updates
- AI-driven predictions (delay scoring algorithm)
- Smart allocation algorithms (gate & seat)
- Data visualization with Chart.js

---

Made with ❤️ using AeroNexus
