/* =====================================
   WIKIORBIT - MAIN SCRIPT
===================================== */

/* =====================================
   MOBILE NAVBAR
===================================== */

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

menuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

/* =====================================
   NASA API CONFIG
===================================== */

const API_KEY = "1mqbq8LmvqitV1YcJ2C10O4OqDZMo31aAum8EwsO";

/* =====================================
   APOD SECTION
===================================== */

const apodContent = document.getElementById("apod-content");
const apodLoading = document.getElementById("apod-loading");
const apodDate = document.getElementById("apod-date");

// Set default date hari ini
const today = new Date().toISOString().split("T")[0];
apodDate.value = today;

// Fetch APOD
async function fetchAPOD(date = "") {

  apodLoading.style.display = "block";
  apodContent.innerHTML = "";

  try {

    let url =
      `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;

    if (date) {
      url += `&date=${date}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Gagal mengambil data APOD");
    }

    const data = await response.json();

    let mediaHTML = "";

    // Jika image
    if (data.media_type === "image") {

      mediaHTML = `
        <img src="${data.url}" alt="${data.title}">
      `;

    } else {

      // Jika video
      mediaHTML = `
        <iframe
          src="${data.url}"
          frameborder="0"
          allowfullscreen>
        </iframe>
      `;
    }

    apodContent.innerHTML = `
      ${mediaHTML}

      <div class="apod-info">
        <div class="apod-date">
          📅 ${data.date}
        </div>

        <h3>${data.title}</h3>

        <p>${data.explanation}</p>
      </div>
    `;

  } catch (error) {

    apodContent.innerHTML = `
      <p style="color:#ff5e7d;">
        ❌ ${error.message}
      </p>
    `;

  } finally {

    apodLoading.style.display = "none";
  }
}

// Event date picker
apodDate.addEventListener("change", (e) => {
  fetchAPOD(e.target.value);
});

// Load pertama
fetchAPOD(today);

/* =====================================
   NASA NEO DATA
===================================== */

const neoGrid = document.getElementById("neo-grid");
const neoLoading = document.getElementById("neo-loading");

async function fetchNEO() {

  neoLoading.style.display = "block";

  try {

    const response = await fetch(
      `https://api.nasa.gov/neo/rest/v1/feed?api_key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Gagal mengambil data asteroid");
    }

    const data = await response.json();

    // Ambil tanggal pertama
    const firstDate =
      Object.keys(data.near_earth_objects)[0];

    const asteroids =
      data.near_earth_objects[firstDate]
      .slice(0, 5);

    neoGrid.innerHTML = "";

    asteroids.forEach((asteroid) => {

      const diameter =
        asteroid.estimated_diameter.meters
        .estimated_diameter_max
        .toFixed(2);

      const approach =
        asteroid.close_approach_data[0];

      const speed =
        parseFloat(
          approach.relative_velocity
          .kilometers_per_hour
        ).toFixed(0);

      const distance =
        parseFloat(
          approach.miss_distance.kilometers
        ).toFixed(0);

      const danger =
        asteroid.is_potentially_hazardous_asteroid;

      const card = document.createElement("div");

      card.className = "neo-card glass";

      card.innerHTML = `
        <h3>${asteroid.name}</h3>

        <p>
          ☄ Diameter:
          ${diameter} meter
        </p>

        <p>
          🚀 Kecepatan:
          ${speed} km/h
        </p>

        <p>
          🌍 Jarak:
          ${distance} km
        </p>

        <p class="${danger ? "danger" : "safe"}">
          ${danger ? "Berbahaya" : "Aman"}
        </p>
      `;

      neoGrid.appendChild(card);

    });

  } catch (error) {

    neoGrid.innerHTML = `
      <p style="color:#ff5e7d;">
        ❌ ${error.message}
      </p>
    `;

  } finally {

    neoLoading.style.display = "none";
  }
}

fetchNEO();

/* =====================================
   ORBIT SIMULATION
===================================== */

const canvas = document.getElementById("orbitCanvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = 600;

let running = true;
let speedMultiplier = 1;

// Planet class
class Planet {

  constructor(radius, color, distance, speed) {

    this.radius = radius;
    this.color = color;

    this.distance = distance;
    this.angle = Math.random() * Math.PI * 2;

    this.speed = speed;

    // Trail orbit
    this.trail = [];
  }

  update() {

    // Hukum orbit sederhana
    this.angle += this.speed * speedMultiplier;

    const x =
      canvas.width / 2 +
      Math.cos(this.angle) * this.distance;

    const y =
      canvas.height / 2 +
      Math.sin(this.angle) * this.distance;

    this.trail.push({ x, y });

    // Batasi trail
    if (this.trail.length > 150) {
      this.trail.shift();
    }

    return { x, y };
  }

  draw() {

    const pos = this.update();

    // Draw trail orbit
    ctx.beginPath();

    for (let i = 0; i < this.trail.length; i++) {

      const point = this.trail[i];

      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }

    ctx.strokeStyle = this.color;
    ctx.globalAlpha = 0.3;
    ctx.stroke();

    ctx.globalAlpha = 1;

    // Draw planet
    ctx.beginPath();

    ctx.arc(
      pos.x,
      pos.y,
      this.radius,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

// Create planets
let planets = [];

function createPlanets() {

  planets = [
    new Planet(6, "#6ec5ff", 90, 0.02),
    new Planet(10, "#ff9d42", 150, 0.012),
    new Planet(14, "#a66cff", 230, 0.008)
  ];
}

createPlanets();

// Animation loop
function animate() {

  if (!running) return;

  requestAnimationFrame(animate);

  // Fade effect
  ctx.fillStyle = "rgba(3,5,16,0.25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Sun
  ctx.beginPath();

  ctx.arc(
    canvas.width / 2,
    canvas.height / 2,
    25,
    0,
    Math.PI * 2
  );

  ctx.fillStyle = "#ffd84d";
  ctx.shadowBlur = 30;
  ctx.shadowColor = "#ffd84d";
  ctx.fill();

  ctx.shadowBlur = 0;

  // Orbit guide
  planets.forEach((planet) => {

    ctx.beginPath();

    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      planet.distance,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.stroke();

    planet.draw();
  });
}

animate();

/* =====================================
   BUTTON CONTROL
===================================== */

const toggleBtn = document.getElementById("toggleSim");
const resetBtn = document.getElementById("resetSim");
const speedControl = document.getElementById("speedControl");

// Pause / Start
toggleBtn.addEventListener("click", () => {

  running = !running;

  toggleBtn.textContent =
    running ? "Pause" : "Start";

  if (running) {
    animate();
  }
});

// Reset
resetBtn.addEventListener("click", () => {

  createPlanets();

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );
});

// Speed slider
speedControl.addEventListener("input", (e) => {

  speedMultiplier = parseFloat(e.target.value);
});

/* =====================================
   RESPONSIVE CANVAS
===================================== */

window.addEventListener("resize", () => {

  canvas.width = canvas.offsetWidth;

  if (window.innerWidth < 768) {
    canvas.height = 400;
  } else {
    canvas.height = 600;
  }
});
