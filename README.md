🚍 TransitCast — Public Transport Tracker
📖 Overview

TransitCast is a lightweight web dashboard that helps users:

Find nearby transit stops using geolocation.

View live arrivals at selected stops.

See stops, vehicles, and routes on an interactive Leaflet map.

Use a route planner to get itineraries between two locations.

Save favorite stops for quick access.

Built with HTML, CSS, JavaScript, and APIs such as Transitland and OpenTripPlanner (OTP).

⚡ Quick Start

Download & Extract
Unzip the project and open the folder.

Run Locally

Open index.html in your browser.

Allow location access (to find nearby stops).

Basic Demo

You’ll see your location on the map.

Nearby transit stops will appear as markers.

Click on a stop → view upcoming arrivals.

Use the Route Planner (bottom panel) to enter origin & destination.

🔧 Configuration

Edit config.js to set API endpoints:

const CONFIG = {
  TRANSITLAND_BASE_URL: "https://transit.land/api/v2/rest",
  AUTO_REFRESH_SECONDS: 45,

  // Optional advanced features:
  TRANSITLAND_ROUTING_URL: "",  // Transitland routing API endpoint
  OTP_URL: "",                  // OpenTripPlanner server URL (e.g. "http://localhost:8080/otp")
  VEHICLE_POSITIONS_URL: ""     // JSON feed with vehicle positions [{lat, lon, id, route_label}]
};

Options:

Transitland Base URL: Default is global dataset. Works without an API key for many cities.

Routing:

If you have Transitland v2 routing enabled → paste its URL in TRANSITLAND_ROUTING_URL.

Or, if you run OpenTripPlanner → set OTP_URL.

Vehicles: If you have a decoded GTFS-Realtime feed → point VEHICLE_POSITIONS_URL to it.

🌍 Map

Powered by Leaflet + OpenStreetMap.

Stops and vehicles update automatically.

Routes (if supported by API) are drawn as polylines.

🚀 Deployment

Push the folder to GitHub.

Deploy free on Netlify or Vercel.

Share the live link.

📌 Notes

Not all cities expose open transit APIs.

If testing in India, you can simulate routes by entering text like New Delhi → Gurgaon.

Some APIs require free sign-up for keys.
