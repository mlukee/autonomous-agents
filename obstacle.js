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

    // Change style when hovered or dragging
    if (this.isHovered || this.isDragging) {
      ctx.fillStyle = "rgba(80, 80, 80, 0.8)";
      ctx.strokeStyle = "#ff3333";
      ctx.lineWidth = 2;
    } else {
      ctx.fillStyle = "rgba(50, 50, 50, 0.7)";
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
    }

    ctx.fill();
    ctx.stroke();
  }
}
