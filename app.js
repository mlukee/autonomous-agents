// Canvas in kontekst
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const target = document.getElementById("target");

// Elementi uporabniškega vmesnika - gumbi
const buttons = {
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
  agents: document.getElementById("agents-slider"),
  speed: document.getElementById("speed-slider"),
  separation: document.getElementById("separation-slider"),
  alignment: document.getElementById("alignment-slider"),
  cohesion: document.getElementById("cohesion-slider"),
};

// Elementi uporabniškega vmesnika - prikazi vrednosti drsnikov
const sliderValues = {
  agents: document.getElementById("agents-value"),
  speed: document.getElementById("speed-value"),
  separation: document.getElementById("separation-value"),
  alignment: document.getElementById("alignment-value"),
  cohesion: document.getElementById("cohesion-value"),
};

// Parametri simulacije
const params = {
  agentCount: parseInt(sliders.agents.value),
  maxSpeed: parseFloat(sliders.speed.value),
  maxForce: 0.2,
  separationWeight: parseFloat(sliders.separation.value),
  alignmentWeight: parseFloat(sliders.alignment.value),
  cohesionWeight: parseFloat(sliders.cohesion.value),
  perceptionRadius: 50,
  separationRadius: 50,
  avoidanceRadius: 30,
  arriveRadius: 100,
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
};

// Pozicija tarče za seek/arrive
const targetPos = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  active: false,
};

// Seznam agentov
let agents = [];

// Funkcija za posodabljanje prikaza
function update() {
  // console.log("Updating...");
  // console.log("Agent count:", agents.length);
  // console.log(mode);

  // Počisti platno
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Posodobi in nariši vse agente
  agents.forEach((agent) => {
    // Uporabi ustrezna vedenja glede na način delovanja
    if (mode.seekArrive && targetPos.active) {
      const seek = agent.seek(targetPos);
      agent.applyForce(seek);
    }

    if (mode.randomWalk) {
      const wander = agent.wander();
      agent.applyForce(wander);
    }

    if (mode.bounded) {
      const boundary = agent.boundaries();
      agent.applyForce(boundary);
    } else {
      agent.checkEdges();
    }

    if (mode.separation && !mode.flocking) {
      const separation = agent.separation(agents).mult(params.separationWeight);
      agent.applyForce(separation);
    }

    if (mode.alignment && !mode.flocking) {
      const alignment = agent.alignment(agents).mult(params.alignmentWeight);
      agent.applyForce(alignment);
    }

    if (mode.cohesion && !mode.flocking) {
      const cohesion = agent.cohesion(agents).mult(params.cohesionWeight);
      agent.applyForce(cohesion);
    }

    if (mode.flocking) {
      agent.flock(agents);
    }

    // Posodobi fiziko agenta
    agent.update();

    // Nariši agenta
    agent.draw();
  });

  // Nariši tarčo, če je aktivna
  if (targetPos.active) {
    ctx.beginPath();
    ctx.arc(targetPos.x, targetPos.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fill();

    // Nariši krog za območje pristanek
    ctx.beginPath();
    ctx.arc(targetPos.x, targetPos.y, params.arriveRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 0, 0, 0.2)";
    ctx.stroke();
  }

  // Nadaljuj animacijo
  requestAnimationFrame(update);
}

// Funkcija za inicializacijo aplikacije
function init() {
  resizeCanvas();
  createAgents();
  initSliders();
  initButtons();
  initDraggableTarget();
  update();
}

// Event listenerji za prilagajanje velikosti okna
window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);

// Zaženi aplikacijo
init();
