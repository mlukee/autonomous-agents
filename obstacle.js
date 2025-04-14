/**
 * Razred Obstacle za ovire na terenu
 */
class Obstacle {
  constructor(x, y, radius) {
    this.position = new Vector(x, y);
    this.radius = radius;
    this.isDragging = false;
  }

  contains(point) {
    return Vector.dist(this.position, point) < this.radius;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(50, 50, 50, 0.7)";
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.stroke();
  }
}
