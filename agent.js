/**
 * Razred Agent za avtonomne like s krmilnimi vedenji
 */
class Agent {
  constructor(x, y) {
    this.position = new Vector(x, y);
    this.velocity = Vector.random().mult(params.maxSpeed);
    this.acceleration = new Vector();
    this.size = 7;
    this.maxSpeed = params.maxSpeed;
    this.maxForce = params.maxForce;
    this.wanderAngle = 0;
    this.wanderRadius = 25;
    this.wanderDistance = 80;
    this.wanderChange = 0.3;
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  seek(target) {
    const desired = new Vector(
      target.x - this.position.x,
      target.y - this.position.y
    );
    const d = desired.mag();

    if (d < params.arriveRadius) {
      // Arrive behavior - slow down when approaching
      const speed = map(d, 0, params.arriveRadius, 0, this.maxSpeed);
      desired.setMag(speed);
    } else {
      // Seek behavior - go at max speed
      desired.setMag(this.maxSpeed);
    }

    const steer = desired.sub(this.velocity);
    steer.limit(this.maxForce);
    return steer;
  }

  wander() {
    // Change wander angle slightly for natural movement
    this.wanderAngle +=
      Math.random() * this.wanderChange * 2 - this.wanderChange;

    // Calculate the circle center in front of the agent
    const circleCenter = this.velocity
      .copy()
      .normalize()
      .mult(this.wanderDistance);

    // Calculate the displacement force
    const displacement = new Vector(
      Math.cos(this.wanderAngle) * this.wanderRadius,
      Math.sin(this.wanderAngle) * this.wanderRadius
    );

    // Calculate the wander force
    const wanderForce = circleCenter.add(displacement);
    wanderForce.limit(this.maxForce);

    return wanderForce;
  }

  boundaries() {
    let desired = null;
    const margin = 100;

    if (this.position.x < margin) {
      desired = new Vector(this.maxSpeed, this.velocity.y);
    } else if (this.position.x > canvas.width - margin) {
      desired = new Vector(-this.maxSpeed, this.velocity.y);
    }

    if (this.position.y < margin) {
      desired = new Vector(this.velocity.x, this.maxSpeed);
    } else if (this.position.y > canvas.height - margin) {
      desired = new Vector(this.velocity.x, -this.maxSpeed);
    }

    if (desired) {
      desired.setMag(this.maxSpeed);
      const steer = desired.sub(this.velocity.copy());
      steer.limit(this.maxForce);
      return steer;
    }

    return new Vector(0, 0);
  }

  // Check if agent is out of bounds and wrap it
  checkEdges() {
    if (this.position.x < 0) this.position.x = canvas.width;
    if (this.position.x > canvas.width) this.position.x = 0;
    if (this.position.y < 0) this.position.y = canvas.height;
    if (this.position.y > canvas.height) this.position.y = 0;
  }

  separation(agents) {
    let steering = new Vector();
    let total = 0;
    for (let other of agents) {
      let d = Vector.dist(this.position, other.position);
      if (other !== this && d < params.perceptionRadius) {
        let diff = Vector.sub(this.position, other.position);
        diff.div(d);
        steering.add(diff);
        total++;
      }
    }
    if (total > 0) {
      // In steering we have average position of sorrounding agents
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      // Limit the steering force
      steering.limit(this.maxForce);
    }
    return steering;
  }

  alignment(agents) {
    let steering = new Vector();
    let total = 0;
    for (let other of agents) {
      let d = Vector.dist(this.position, other.position);
      if (other !== this && d < params.perceptionRadius) {
        steering.add(other.velocity);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  cohesion(agents) {
    let steering = new Vector();
    let total = 0;
    for (let other of agents) {
      let d = Vector.dist(this.position, other.position);
      if (other !== this && d < params.perceptionRadius) {
        steering.add(other.position);
        total++;
      }
    }
    if (total > 0) {
      // In steering we have average position of sorrounding agents
      steering.div(total);
      steering.sub(this.position);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      // Limit the steering force
      steering.limit(this.maxForce);
    }
    return steering;
  }

  flock(agents) {
    // Calculate the three flocking forces
    let alignment = this.alignment(agents).mult(params.alignmentWeight);
    let cohesion = this.cohesion(agents).mult(params.cohesionWeight);
    let separation = this.separation(agents).mult(params.separationWeight);

    // Apply all three forces
    this.applyForce(alignment);
    this.applyForce(cohesion);
    this.applyForce(separation);
  }

  avoidObstacles(obstacles) {
    let steering = new Vector(0, 0);

    for (let obstacle of obstacles) {
      // Calculate distance to obstacle
      const dist = Vector.dist(this.position, obstacle.position);

      // If we're within the avoidance range (obstacle radius + some buffer)
      const avoidanceRange = obstacle.radius + params.avoidanceRadius;

      if (dist < avoidanceRange) {
        // Calculate heading toward obstacle
        let toObstacle = Vector.sub(obstacle.position, this.position);

        // Stronger avoidance force the closer we are
        let force = map(dist, 0, avoidanceRange, params.maxForce * 2, 0);

        // Steer away (opposite direction)
        toObstacle.normalize().mult(-force);
        steering.add(toObstacle);
      }
    }

    return steering;
  }

  draw() {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(Math.atan2(this.velocity.y, this.velocity.x));

    // Draw triangle for agent
    ctx.beginPath();
    ctx.moveTo(this.size * 2, 0);
    ctx.lineTo(-this.size, this.size);
    ctx.lineTo(-this.size, -this.size);
    ctx.closePath();
    ctx.fillStyle = "#3498db";
    ctx.fill();

    ctx.restore();
  }
}
