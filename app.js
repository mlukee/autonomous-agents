// Canvas in kontekst
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const target = document.getElementById("target");

// Elementi uporabniškega vmesnika - gumbi
const buttons = {
  showFOV: document.getElementById("show-fov"),
  obstacles: document.getElementById("obstacles"),
  seekArrive: document.getElementById("seek-arrive"),
  randomWalk: document.getElementById("random-walk"),
  bounded: document.getElementById("bounded"),
  separation: document.getElementById("separation"),
  alignment: document.getElementById("alignment"),
  cohesion: document.getElementById("cohesion"),
  flocking: document.getElementById("flocking"),
  reset: document.getElementById("reset"),
};

// Elementi uporabniškega vmesnika - drsniki
const sliders = {
  fov: document.getElementById("fov-slider"),
  agents: document.getElementById("agents-slider"),
  flocks: document.getElementById("flocks-slider"),
  speed: document.getElementById("speed-slider"),
  separation: document.getElementById("separation-slider"),
  alignment: document.getElementById("alignment-slider"),
  cohesion: document.getElementById("cohesion-slider"),
};

// Elementi uporabniškega vmesnika - prikazi vrednosti drsnikov
const sliderValues = {
  fov: document.getElementById("fov-value"),
  agents: document.getElementById("agents-value"),
  flocks: document.getElementById("flocks-value"),
  speed: document.getElementById("speed-value"),
  separation: document.getElementById("separation-value"),
  alignment: document.getElementById("alignment-value"),
  cohesion: document.getElementById("cohesion-value"),
};

// Parametri simulacije
const params = {
  agentCount: parseInt(sliders.agents.value),
  flockCount: parseInt(sliders.flocks.value),
  maxSpeed: parseFloat(sliders.speed.value),
  maxForce: 0.4,
  separationWeight: parseFloat(sliders.separation.value),
  alignmentWeight: parseFloat(sliders.alignment.value),
  cohesionWeight: parseFloat(sliders.cohesion.value),
  perceptionRadius: 60,
  separationRadius: 50,
  avoidanceRadius: 20,
  arriveRadius: 100,
  obstacleCount: 3,
  minObstacleSize: 20,
  maxObstacleSize: 50,
  fieldOfView: Math.PI * 0.8, // 144 degrees
  showFieldOfView: false,
};

// Trenutni načini delovanja
const mode = {
  seekArrive: false,
  randomWalk: false,
  bounded: true, // Vedno vključeno privzeto
  separation: false,
  alignment: false,
  cohesion: false,
  flocking: false,
  obstacles: true,
};

// Pozicija tarče za seek/arrive
const targetPos = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  active: false,
};

// Seznam agentov
let agents = [];
let obstacles = [];

let flocks = [];
const flockColors = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6"];

// Funkcija za posodabljanje prikaza
function update() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw obstacles
  if (mode.obstacles) {
    obstacles.forEach((obstacle) => obstacle.draw());
  }

  // Update and draw all flocks
  flocks.forEach((flock) => {
    flock.update(agents, mode.obstacles ? obstacles : []);
    flock.draw();
  });

  // Draw target if active
  if (targetPos.active) {
    ctx.beginPath();
    ctx.arc(targetPos.x, targetPos.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fill();

    // Draw circle for arrival radius
    ctx.beginPath();
    ctx.arc(targetPos.x, targetPos.y, params.arriveRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 0, 0, 0.2)";
    ctx.stroke();
  }

  // Continue animation
  requestAnimationFrame(update);
}

// Funkcija za inicializacijo aplikacije
function init() {
  resizeCanvas();
  createObstacles();
  createFlocks();
  // createAgents();
  initSliders();
  initButtons();
  initDraggableTarget();
  initObstacleEvents();

  if (mode.obstacles) {
    buttons.obstacles.classList.add("active");
  }
  update();
}

// Event listenerji za prilagajanje velikosti okna
window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);

// Zaženi aplikacijo
init();
