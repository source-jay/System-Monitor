# SYSTEM_OS Monitor 🟢

A retro-cyberpunk real-time system monitoring web application inspired by terminal interfaces (htop / sysstat). Built with a lightweight **Python Flask** backend and a pure **Vanilla HTML/CSS/JS** frontend (no React, no Tailwind CSS).

---

## 💻 Tech Stack

- **Backend**: Python 3.x, Flask, `psutil`, `os`, `time`
- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6 fetch API)
- **Typography & Icons**: `JetBrains Mono`, `Material Symbols Outlined`
- **Design Aesthetic**: CRT Scanlines, Terminal Green Glow, Glassmorphism, Responsive Mobile-First Navigation

---

## ✨ Features

- 🔋 **Status Overview**: System health state, total uptime counter, high-level CPU/RAM/Disk bars, thermal warnings, and simulated system logs.
- ⚡ **Resource Metrics**: Per-core CPU load percentages, CPU frequency tracking, dynamic ASCII load graph, RAM allocation breakdown (physical, cache, buffers), and storage volume partition usage.
- ⚙️ **Process Management**: Real-time listing of top process consumers (PID, user, CPU%, memory%, command) sorted dynamically.
- 🌐 **Network Traffic**: Bandwidth speed meters (RX/TX in KB/s & MB/s), total transfer statistics, and error counters per interface.
- 📱 **Mobile & Desktop Ready**: Fully responsive interface tailored for smartphones and desktop browsers alike.

---

## 🌐 Live Demo

🔗 **https://system-monitor-seven.vercel.app/**

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have Python installed on your system:
```bash
python --version
```

### 2. Install Dependencies
Install the required Python libraries using `requirements.txt`:
```bash
pip install -r requirements.txt
```

### 3. Run the Application
Start the Flask development server:
```bash
python app.py
```

### 4. Access the Dashboard
- **Local Access**: Open your browser and navigate to `http://localhost:5000`
- **Mobile Access**: Connect your phone to the same Wi-Fi network and open `http://<YOUR-PC-IP>:5000` (e.g. `http://192.168.1.4:5000`).

---

## 📡 API Endpoints

The Flask server exposes REST API endpoints for telemetry data:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/` | `GET` | Renders the main dashboard SPA |
| `/api/status` | `GET` | Returns core health metrics, uptime, total CPU/RAM/Disk stats |
| `/api/resources` | `GET` | Returns per-core usage, RAM/Swap details, and disk partitions |
| `/api/processes` | `GET` | Returns top processes sorted by CPU utilization |
| `/api/network` | `GET` | Returns RX/TX speeds and network interface metrics |

---

## 📁 Project Structure

```text
system monitor/
├── app.py              # Flask server & psutil API endpoints
├── requirements.txt    # Python dependencies (Flask, psutil)
├── README.md           # Project documentation
├── static/
│   ├── style.css       # CRT overlay, dark theme, & vanilla layout styles
│   └── script.js       # Real-time polling & DOM rendering logic
└── templates/
    └── index.html      # Single Page Application HTML markup
```

## 👨‍💻 Developer

**Jay Nimase**

B.Tech Software Engineering Student
MIT Academy of Engineering, Pune

* GitHub: https://github.com/source-jay
* LinkedIn: https://www.linkedin.com/in/jay-nimase/

## 📄 License

This project is developed for educational and portfolio purposes.

---

⭐ If you found this project interesting, consider giving the repository a star!
