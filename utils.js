/**
 * Pomožne funkcije za simulacijo
 */

// Funkcija za mapiranje vrednosti iz enega obsega v drugega
function map(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

// Funkcija za ustvarjanje agentov
function createAgents() {
  agents = [];
  for (let i = 0; i < params.agentCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    agents.push(new Agent(x, y));
  }
}

function initObstacleEvents() {
  let draggedObstacle = null;

  canvas.addEventListener("mousedown", function (e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const mousePos = new Vector(mouseX, mouseY);

    // Check if we clicked on any obstacle
    for (let obstacle of obstacles) {
      if (obstacle.contains(mousePos)) {
        draggedObstacle = obstacle;
        obstacle.isDragging = true;
        break;
      }
    }

    // If no obstacle was clicked and we're in obstacles mode, create a new one
    if (!draggedObstacle && e.altKey) {
      const newObstacle = new Obstacle(mouseX, mouseY, params.minObstacleSize);
      obstacles.push(newObstacle);
      draggedObstacle = newObstacle;
      newObstacle.isDragging = true;
    }
  });

  canvas.addEventListener("mousemove", function (e) {
    if (draggedObstacle) {
      const rect = canvas.getBoundingClientRect();
      draggedObstacle.position.x = e.clientX - rect.left;
      draggedObstacle.position.y = e.clientY - rect.top;
    }
  });

  canvas.addEventListener("mouseup", function () {
    if (draggedObstacle) {
      draggedObstacle.isDragging = false;
      draggedObstacle = null;
    }
  });

  // Add mouse wheel to resize obstacles
  canvas.addEventListener("wheel", function (e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const mousePos = new Vector(mouseX, mouseY);

    for (let obstacle of obstacles) {
      if (obstacle.contains(mousePos)) {
        // Adjust size based on wheel direction
        const delta = e.deltaY > 0 ? -5 : 5;
        obstacle.radius = Math.max(10, Math.min(100, obstacle.radius + delta));
        e.preventDefault();
        break;
      }
    }
  });
}

function createObstacles() {
  obstacles = [];

  for (let i = 0; i < params.obstacleCount; i++) {
    const radius =
      Math.random() * (params.maxObstacleSize - params.minObstacleSize) +
      params.minObstacleSize;
    const x = Math.random() * (canvas.width - 2 * radius) + radius;
    const y = Math.random() * (canvas.height - 2 * radius) + radius;

    obstacles.push(new Obstacle(x, y, radius));
  }
}

// Funkcija za inicializacijo drsnikov
function initSliders() {
  sliders.agents.addEventListener("input", function () {
    const value = parseInt(this.value);
    params.agentCount = value;
    sliderValues.agents.textContent = value;
    createAgents();
  });

  sliders.speed.addEventListener("input", function () {
    const value = parseFloat(this.value);
    params.maxSpeed = value;
    sliderValues.speed.textContent = value.toFixed(1);
    agents.forEach((agent) => {
      agent.maxSpeed = value;
    });
  });

  sliders.separation.addEventListener("input", function () {
    const value = parseFloat(this.value);
    params.separationWeight = value;
    sliderValues.separation.textContent = value.toFixed(1);
  });

  sliders.alignment.addEventListener("input", function () {
    const value = parseFloat(this.value);
    params.alignmentWeight = value;
    sliderValues.alignment.textContent = value.toFixed(1);
  });

  sliders.cohesion.addEventListener("input", function () {
    const value = parseFloat(this.value);
    params.cohesionWeight = value;
    sliderValues.cohesion.textContent = value.toFixed(1);
  });
}

// Funkcija za inicializacijo gumbov
function initButtons() {
  buttons.obstacles.addEventListener("click", function () {
    mode.obstacles = !mode.obstacles;
    this.classList.toggle("active");
  });

  buttons.seekArrive.addEventListener("click", function () {
    mode.seekArrive = !mode.seekArrive;
    this.classList.toggle("active");

    if (mode.seekArrive) {
      targetPos.active = true;
      targetPos.x = canvas.width / 2;
      targetPos.y = canvas.height / 2;

      // Show draggable target
      target.style.display = "block";
      target.style.left = targetPos.x + "px";
      target.style.top = targetPos.y + "px";
    } else {
      targetPos.active = false;
      target.style.display = "none";
    }
  });

  buttons.randomWalk.addEventListener("click", function () {
    mode.randomWalk = !mode.randomWalk;
    this.classList.toggle("active");
  });

  buttons.bounded.addEventListener("click", function () {
    mode.bounded = !mode.bounded;
    this.classList.toggle("active");
  });

  buttons.separation.addEventListener("click", function () {
    mode.separation = !mode.separation;
    this.classList.toggle("active");

    // Can't have flocking and individual behaviors
    if (mode.separation && mode.flocking) {
      mode.flocking = false;
      buttons.flocking.classList.remove("active");
    }
  });

  buttons.alignment.addEventListener("click", function () {
    mode.alignment = !mode.alignment;
    this.classList.toggle("active");

    // Can't have flocking and individual behaviors
    if (mode.alignment && mode.flocking) {
      mode.flocking = false;
      buttons.flocking.classList.remove("active");
    }
  });

  buttons.cohesion.addEventListener("click", function () {
    mode.cohesion = !mode.cohesion;
    this.classList.toggle("active");

    // Can't have flocking and individual behaviors
    if (mode.cohesion && mode.flocking) {
      mode.flocking = false;
      buttons.flocking.classList.remove("active");
    }
  });

  buttons.flocking.addEventListener("click", function () {
    mode.flocking = !mode.flocking;
    this.classList.toggle("active");

    // Turn off individual behaviors if flocking is on
    if (mode.flocking) {
      mode.separation = false;
      mode.alignment = false;
      mode.cohesion = false;
      buttons.separation.classList.remove("active");
      buttons.alignment.classList.remove("active");
      buttons.cohesion.classList.remove("active");
    }
  });

  buttons.reset.addEventListener("click", function () {
    // Reset all modes
    Object.keys(mode).forEach((key) => {
      mode[key] = false;
    });

    // Set bounded mode to true (default)
    mode.bounded = true;

    // Reset button states
    Object.values(buttons).forEach((button) => {
      button.classList.remove("active");
    });
    buttons.bounded.classList.add("active");

    // Reset target
    targetPos.active = false;
    target.style.display = "none";

    // Reset agent positions
    createAgents();
  });

  // Set bounded as active by default
  buttons.bounded.classList.add("active");
}

// Funkcija za inicializacijo vlečljive tarče
function initDraggableTarget() {
  let isDragging = false;

  target.addEventListener("mousedown", function (e) {
    isDragging = true;
    e.preventDefault();
  });

  document.addEventListener("mousemove", function (e) {
    if (isDragging) {
      // Get canvas position
      const canvasRect = canvas.getBoundingClientRect();

      // Update target position
      targetPos.x = e.clientX - canvasRect.left;
      targetPos.y = e.clientY - canvasRect.top;

      // Constrain to canvas
      targetPos.x = Math.max(0, Math.min(canvas.width, targetPos.x));
      targetPos.y = Math.max(0, Math.min(canvas.height, targetPos.y));

      // Update visual target position
      target.style.left = e.clientX + "px";
      target.style.top = e.clientY + "px";
    }
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
  });

  // Allow clicking on canvas to set target
  canvas.addEventListener("click", function (e) {
    if (mode.seekArrive) {
      const rect = canvas.getBoundingClientRect();
      targetPos.x = e.clientX - rect.left;
      targetPos.y = e.clientY - rect.top;
      targetPos.active = true;

      // Update visual target position
      target.style.display = "block";
      target.style.left = e.clientX + "px";
      target.style.top = e.clientY + "px";
    }
  });
}

// Funkcija za prilagajanje velikosti platna
function resizeCanvas() {
  const container = document.querySelector(".container");
  const maxWidth = Math.min(container.clientWidth - 40, 1000);
  canvas.width = maxWidth;
  canvas.height = Math.min(window.innerHeight * 0.6, 600);
}
