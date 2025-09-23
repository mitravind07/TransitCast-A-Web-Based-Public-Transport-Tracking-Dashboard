# TransitCast — Public Transport Tracker (Starter)

This repository started as **IndraCast** (a weather dashboard) and has been adapted into **TransitCast**, a lightweight static web app that demonstrates how to fetch and display public transit information (nearby stops, upcoming departures, basic planner placeholder) using the **Transitland** REST API.

## What this starter includes
- Single-page app: `index.html`, `styles.css`, `script.js`
- Config: `config.js` (set API endpoints and refresh interval)
- Uses browser Geolocation to find nearby stops and Transitland to fetch stop & schedule data.

## How to run locally
1. Serve the folder as a static site. Example using Python:
   ```bash
   # from inside the project folder
   python3 -m http.server 8000
   # then open http://localhost:8000 in your browser
   ```
2. Allow browser location access when prompted.

## Notes about Transitland
- Transitland aggregates GTFS and GTFS-Realtime feeds globally. Many endpoints do not require API keys for simple queries, but API limits may apply. If you have a rate-limited use case, consider signing up or using a specific agency's API.
- The starter uses `/stops` and `/stop_schedules` endpoints. For production, you might prefer agency-specific GTFS-realtime decoding for vehicle positions and alerts.

## Next steps (suggestions)
- Integrate a map (Leaflet) and show stop markers & vehicle positions.
- Upgrade route planner with OpenTripPlanner or Google Directions (transit mode).
- Decode GTFS-Realtime protobufs for live vehicle positions and alerts.
- Add robust error handling and unit tests for parsers.

## Credits
Original project: IndraCast (weather dashboard) — adapted to TransitCast starter.

