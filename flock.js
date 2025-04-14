/**
 * Razred Flock za skupine agentov
 */
class Flock {
  constructor(id, color, count, x, y, spread = 100) {
    this.id = id;
    this.color = color;
    this.agents = [];

    // Create agents for this flock
    for (let i = 0; i < count; i++) {
      const posX = x + (Math.random() * spread * 2 - spread);
      const posY = y + (Math.random() * spread * 2 - spread);
      const agent = new Agent(posX, posY);
      agent.flockId = id; // Tag agent with flock ID
      agent.color = color;
      this.agents.push(agent);
    }
  }

  update(allAgents, obstacles) {
    this.agents.forEach((agent) => {
      // Apply flocking behavior only with agents from the same flock
      if (mode.flocking) {
        const sameFlockAgents = allAgents.filter((a) => a.flockId === this.id);
        agent.flock(sameFlockAgents);
      }

      // Apply obstacle avoidance
      if (mode.obstacles && obstacles.length > 0) {
        const avoidForce = agent.avoidObstacles(obstacles);
        agent.applyForce(avoidForce);
      }

      // Apply other behaviors based on modes
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
        const separation = agent
          .separation(allAgents)
          .mult(params.separationWeight);
        agent.applyForce(separation);
      }

      if (mode.alignment && !mode.flocking) {
        const alignment = agent
          .alignment(allAgents)
          .mult(params.alignmentWeight);
        agent.applyForce(alignment);
      }

      if (mode.cohesion && !mode.flocking) {
        const cohesion = agent.cohesion(allAgents).mult(params.cohesionWeight);
        agent.applyForce(cohesion);
      }

      // Update physics
      agent.update();
    });
  }

  draw() {
    this.agents.forEach((agent) => agent.draw());
  }
}
