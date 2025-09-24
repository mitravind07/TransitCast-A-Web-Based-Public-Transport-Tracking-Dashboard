# 🚍 TransitCast: A Web-Based Public Transport Tracking Dashboard  

## 📖 Overview  
TransitCast is a lightweight, browser-based dashboard that helps users track **public transport in real time**.  
It combines **geolocation, live API data, and interactive maps** to provide:  
- Nearby transit stops  
- Live bus/train arrivals  
- Route planning  
- Map visualization of stops, vehicles, and itineraries  
- Favorites for quick access  

Built with **HTML, CSS, and JavaScript**, powered by **Leaflet + OpenStreetMap** and APIs such as **Transitland** or **OpenTripPlanner**.  

---

## ✨ Features  
- 🌍 **Interactive Map** — Explore stops, vehicles, and planned routes.  
- 📍 **Nearby Stops** — Auto-detects user location and lists closest stops.  
- ⏱️ **Live Arrivals** — Displays upcoming arrivals at a selected stop.  
- 🛣️ **Route Planner** — Suggests itineraries between two points.  
- ⭐ **Favorites** — Save frequently used stops locally for quick access.  
- 🔄 **Auto Refresh** — Data updates at regular intervals.  

---

## ⚡ Quick Start  

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/yourusername/transitcast.git
   cd transitcast
   ```

2. **Run Locally**  
   - Open `index.html` in your browser.  
   - Allow **location access** to get nearby stops.  

3. **Demo**  
   - Click markers on the map to view stop details.  
   - Use the **Route Planner** form to enter origin & destination.  

---

## 🔧 Configuration  

Edit `config.js` to set API endpoints:  

```js
const CONFIG = {
  TRANSITLAND_BASE_URL: "https://transit.land/api/v2/rest",
  AUTO_REFRESH_SECONDS: 45,

  // Optional advanced features:
  TRANSITLAND_ROUTING_URL: "",  // Transitland routing API endpoint
  OTP_URL: "",                  // OpenTripPlanner server URL (e.g. "http://localhost:8080/otp")
  VEHICLE_POSITIONS_URL: ""     // JSON feed with vehicle positions [{lat, lon, id, route_label}]
};
```  

- **Transitland** → Provides global stop/arrival data (no key required for many endpoints).  
- **Routing** → Use either Transitland Routing API or OpenTripPlanner.  
- **Vehicle Positions** → Optional JSON feed with live vehicle data.  

---

## 🌍 Map  
- Interactive map powered by **Leaflet + OpenStreetMap**.  
- Stop markers include names, distance, and arrival info.  
- Routes are drawn as polylines (if supported by API).  

---

## 📌 Notes  
- Works best in cities with **open transit data**.  
- For demos, try searching routes like `New Delhi → Gurgaon`.  
- Some APIs may require sign-up for free API keys.  

---

## 📜 License  
This project is licensed under the MIT License.  

---

## 🔖 GitHub Topics  
Add these tags to your repo for better discoverability:  

```
public-transport
javascript
leaflet
transit
transitland
opentripplanner
geolocation
realtime-data
web-dashboard
```
