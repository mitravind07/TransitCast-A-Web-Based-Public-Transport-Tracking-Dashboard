// script.js — TransitCast starter logic
const stopsList = document.getElementById('stopsList');
const arrivalsEl = document.getElementById('arrivals');
const selectedStopName = document.getElementById('selectedStopName');
const locationStatus = document.getElementById('locationStatus');
const refreshBtn = document.getElementById('refreshBtn');
const favoritesList = document.getElementById('favoritesList');
const alertsEl = document.getElementById('alerts');

let state = {
  lat: null,
  lon: null,
  stops: [],
  selectedStop: null,
  favorites: JSON.parse(localStorage.getItem('transitcast:favorites') || '[]')
};

function setLocationText(t){ locationStatus.textContent = 'Location: ' + t; }

function haversineDistance(lat1, lon1, lat2, lon2){
  // returns meters
  function toRad(v){return v*Math.PI/180}
  const R = 6371000;
  const dLat = toRad(lat2-lat1), dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R*c;
}

async function fetchNearbyStops(lat, lon){
  const url = `${CONFIG.TRANSITLAND_BASE}/stops?lat=${lat}&lon=${lon}&r=${CONFIG.DEFAULT_RADIUS_METERS}&per_page=30`;
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    return data.stops || [];
  }catch(e){
    console.warn('Transitland stops fetch failed', e);
    return [];
  }
}

function renderStops(stops){
  if(!stops.length){ stopsList.innerHTML = '<div class="muted">No stops found nearby.</div>'; return; }
  const html = stops.map(s=>{
    const dist = state.lat? Math.round(haversineDistance(state.lat,state.lon,s.geometry.coordinates[1],s.geometry.coordinates[0])) : '?';
    const isFav = state.favorites.includes(s.onestop_id);
    return `<div class="stop-row" data-id="${s.onestop_id}">
      <div class="stop-info">
        <div class="stop-name">${s.name || s.street || s.onestop_id}</div>
        <div class="distance">${dist} m — ${s.geometry ? s.geometry.type : ''}</div>
      </div>
      <div>
        <button class="star" data-id="${s.onestop_id}" title="Favorite">${isFav?'★':'☆'}</button>
        <button class="select" data-id="${s.onestop_id}">View</button>
      </div>
    </div>`;
  }).join('');
  stopsList.innerHTML = html;

  // Attach events
  document.querySelectorAll('.select').forEach(b=>b.addEventListener('click', (ev)=>{
    const id = ev.currentTarget.dataset.id;
    const stop = state.stops.find(x=>x.onestop_id===id);
    selectStop(stop);
  }));
  document.querySelectorAll('.star').forEach(b=>b.addEventListener('click', (ev)=>{
    const id = ev.currentTarget.dataset.id;
    toggleFavorite(id);
    renderFavorites();
    renderStops(state.stops);
  }));
}

async function fetchArrivalsForStop(stop_onestop_id){
  // Transitland provides stop_schedules which is useful for next departures
  const url = `${CONFIG.TRANSITLAND_BASE}/stop_schedules?stop_onestop_id=${stop_onestop_id}&per_page=20`;
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    return data.stop_schedules || [];
  }catch(e){
    console.warn('Arrival fetch failed', e);
    return [];
  }
}

function renderArrivals(scheduleItems, stop){
  selectedStopName.textContent = stop.name || stop.onestop_id;
  if(!scheduleItems.length){
    arrivalsEl.innerHTML = '<li class="muted">No upcoming scheduled departures available.</li>';
    return;
  }
  const now = new Date();
  const items = scheduleItems.slice(0,8).map(it=>{
    // prefer predicted departure_time then scheduled
    const dep = it.predicted_departure_time || it.departure_time || it.arrival_time;
    let label = dep ? new Date(dep).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'TBD';
    const route = it.route ? (it.route.name || it.route.onestop_id) : (it.onestop_id || '');
    return `<li>
      <div><span class="route-chip">${route}</span> ${it.headsign || it.trip_headsign || ''}</div>
      <div class="muted">${label}</div>
    </li>`;
  }).join('');
  arrivalsEl.innerHTML = items;
}

function selectStop(stop){
  state.selectedStop = stop;
  // fetch arrivals
  fetchArrivalsForStop(stop.onestop_id).then(items=>{
    renderArrivals(items, stop);
  });
}

function toggleFavorite(onestop_id){
  const idx = state.favorites.indexOf(onestop_id);
  if(idx>=0) state.favorites.splice(idx,1);
  else state.favorites.push(onestop_id);
  localStorage.setItem('transitcast:favorites', JSON.stringify(state.favorites));
}

function renderFavorites(){
  if(!state.favorites.length){ favoritesList.innerHTML = '<div class="muted">No favorites yet.</div>'; return; }
  const html = state.favorites.map(id=>`<div>${id}</div>`).join('');
  favoritesList.innerHTML = html;
}

function showAlert(text){
  alertsEl.classList.remove('hidden');
  alertsEl.textContent = text;
}

function hideAlert(){
  alertsEl.classList.add('hidden');
  alertsEl.textContent = '';
}

async function init(){
  renderFavorites();
  // geolocation
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(async pos=>{
      state.lat = pos.coords.latitude;
      state.lon = pos.coords.longitude;
      setLocationText(`${state.lat.toFixed(4)}, ${state.lon.toFixed(4)}`);
      const stops = await fetchNearbyStops(state.lat, state.lon);
      // Transitland returns stops with geometry.coordinates [lon,lat]
      // normalize to keep simple fields
      state.stops = (stops||[]).map(s=>{
        try{
          const lon = s.geometry.coordinates[0], lat = s.geometry.coordinates[1];
          return {...s, lat, lon};
        }catch(e){ return s; }
      });
      renderStops(state.stops);
      // Auto select first stop
      if(state.stops.length) selectStop(state.stops[0]);
    }, err=>{
      setLocationText('Permission denied or unavailable');
      showAlert('Geolocation denied. You can search manually using planner.');
    }, {timeout:8000});
  }else{
    setLocationText('Geolocation not supported');
    showAlert('Geolocation not supported by this browser.');
  }

  // Refresh handler
  refreshBtn.addEventListener('click', ()=>{ if(state.selectedStop) selectStop(state.selectedStop); });

  // Auto refresh loop
  setInterval(()=>{ if(state.selectedStop) selectStop(state.selectedStop); }, CONFIG.AUTO_REFRESH_SECONDS*1000);
}

init();

// --- Leaflet map setup ---
let map, stopsLayer, vehiclesLayer, routeLayer;

function initMap(){
  try {
    map = L.map('map').setView([20.5937,78.9629], 5); // default to India
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    stopsLayer = L.layerGroup().addTo(map);
    vehiclesLayer = L.layerGroup().addTo(map);
    routeLayer = L.layerGroup().addTo(map);
  } catch(e){
    console.warn('Leaflet init failed', e);
  }
}

function renderStopsOnMap(stops){
  if(!map || !stopsLayer) return;
  stopsLayer.clearLayers();
  stops.forEach(s=>{
    const marker = L.marker([s.lat, s.lon]);
    marker.bindPopup(`<b>${s.name||s.onestop_id}</b><br/><small>${Math.round(haversineDistance(state.lat,state.lon,s.lat,s.lon))} m</small><br/><button onclick="selectStopFromMap('${s.onestop_id}')">View Arrivals</button>`);
    marker.on('click', ()=>{
      // ensure selected in list
      // find and select stop
    });
    stopsLayer.addLayer(marker);
  });
  if(stops.length) map.panTo([stops[0].lat, stops[0].lon]);
}

window.selectStopFromMap = function(onestop_id){
  const stop = state.stops.find(x=>x.onestop_id===onestop_id);
  if(stop) selectStop(stop);
}

// --- Vehicle positions (best-effort) ---
// Transitland may expose parsed GTFS-realtime through their API; if CONFIG.VEHICLE_POSITIONS_URL is set, fetch it.
// CONFIG.VEHICLE_POSITIONS_URL should point to a JSON endpoint returning positions as [{lat,lon,id,route_label}]
async function fetchVehiclePositions(){
  if(!CONFIG.VEHICLE_POSITIONS_URL) return [];
  try{
    const res = await fetch(CONFIG.VEHICLE_POSITIONS_URL);
    if(!res.ok) throw new Error('vehicle positions fetch failed');
    const data = await res.json();
    return data.vehicles || data || [];
  }catch(e){
    console.warn('fetchVehiclePositions error', e);
    return [];
  }
}

function renderVehiclesOnMap(vehicles){
  if(!map || !vehiclesLayer) return;
  vehiclesLayer.clearLayers();
  vehicles.forEach(v=>{
    if(!v.lat || !v.lon) return;
    const m = L.circleMarker([v.lat, v.lon], {radius:6});
    m.bindPopup(`<b>Vehicle ${v.id||''}</b><br/>${v.route_label||''}`);
    vehiclesLayer.addLayer(m);
  });
}

// --- Route planner ---
// Uses Transitland v2 routing if configured, otherwise tries OpenTripPlanner (CONFIG.OTP_URL)
async function planRoute(origin, destination){
  routeLayer.clearLayers();
  const tlRouting = CONFIG.TRANSITLAND_ROUTING_URL;
  const otp = CONFIG.OTP_URL;
  try{
    if(tlRouting){
      // Example: Transitland routing expects origin/destination as lat,lon pairs or addresses
      const url = `${tlRouting}?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=TRANSIT,WALK`;
      const res = await fetch(url);
      const data = await res.json();
      renderItinerariesFromRouting(data);
    } else if(otp){
      // OTP plan API: /otp/routers/default/plan?fromPlace=lat,lon&toPlace=lat,lon&mode=TRANSIT,WALK
      // Expect origin/destination as "lat,lon"
      const url = `${otp}/routers/default/plan?fromPlace=${encodeURIComponent(origin)}&toPlace=${encodeURIComponent(destination)}&mode=TRANSIT,WALK`;
      const res = await fetch(url);
      const data = await res.json();
      renderItinerariesFromOTP(data);
    } else {
      document.getElementById('itineraries').innerText = 'Routing not configured. Set CONFIG.TRANSITLAND_ROUTING_URL or CONFIG.OTP_URL in config.js';
    }
  }catch(e){
    console.warn('planRoute error', e);
    document.getElementById('itineraries').innerText = 'Route planner failed: ' + e.message;
  }
}

function renderItinerariesFromRouting(data){
  // Best-effort parsing for Transitland v2 routing response
  if(!data || !data.itineraries) { document.getElementById('itineraries').innerText = 'No itineraries found.'; return; }
  const out = data.itineraries.map((it, i)=>{
    return `<div class="itinerary"><strong>Option ${i+1}</strong>: ${it.duration_minutes||Math.round(it.duration/60)} min — ${it.legs ? it.legs.length : 0} legs</div>`;
  }).join('');
  document.getElementById('itineraries').innerHTML = out;
  // Optionally draw first itinerary as polyline if geometry provided
  if(data.itineraries[0] && data.itineraries[0].geometry){
    try{
      const coords = data.itineraries[0].geometry.coordinates.map(c=>[c[1], c[0]]);
      const poly = L.polyline(coords).addTo(routeLayer);
      map.fitBounds(poly.getBounds(), {padding:[40,40]});
    }catch(e){console.warn('draw polyline failed', e);}
  }
}

function renderItinerariesFromOTP(data){
  if(!data || !data.plan || !data.plan.itineraries){ document.getElementById('itineraries').innerText = 'No itineraries found.'; return; }
  const out = data.plan.itineraries.map((it,i)=>{
    return `<div class="itinerary"><strong>Option ${i+1}</strong>: ${Math.round(it.duration/60)} min — ${it.legs.length} legs</div>`;
  }).join('');
  document.getElementById('itineraries').innerHTML = out;
  // draw first itinerary legs as polyline
  const first = data.plan.itineraries[0];
  if(first && first.legs){
    const latlngs = [];
    first.legs.forEach(leg=>{
      if(leg.legGeometry && leg.legGeometry.points){
        // OTP uses encoded polylines — decode? skip for now
      }
    });
  }
}

// Hook planner form
const plannerForm = document.getElementById('plannerForm');
if(plannerForm){
  plannerForm.addEventListener('submit', function(ev){
    ev.preventDefault();
    const fromVal = document.getElementById('fromInput').value.trim();
    const toVal = document.getElementById('toInput').value.trim();
    if(!fromVal || !toVal){ document.getElementById('itineraries').innerText = 'Enter both origin and destination.'; return; }
    // For convenience, if values are coordinates "lat,lon", use them directly; otherwise pass as text.
    planRoute(fromVal, toVal);
  });
}

// Periodically refresh vehicle positions if configured
setInterval(async ()=>{
  const vehicles = await fetchVehiclePositions();
  renderVehiclesOnMap(vehicles);
}, Math.max(15, CONFIG.AUTO_REFRESH_SECONDS) * 1000);

// expose for debugging
window.planRoute = planRoute;
