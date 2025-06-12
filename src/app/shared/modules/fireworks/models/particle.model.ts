import { Helper } from './helper.model';

export class Particle {
  get deleted(): boolean {
    const deleted = this.particles.length
      ? this.particles.every(par => par.deleted)
      : this.opacity <= 0;

    if (deleted) this.particles = [];

    return deleted;
  }

  private liveTime = 0;
  private prevTime = 0;
  private x = 0;
  private y = 0;
  private vx = 0;
  private vy = 0;
  private speed = Helper.random(200, 500) / 1000;
  private gravity = 1;
  private wind = 0;
  private opacity = 1;
  private color = '#fff';
  private particles: Particle[] = [];

  constructor(x: number, y: number, color: string) {
    this.prevTime = Date.now();
    this.x = x;
    this.y = y;
    this.color = color;
    const angle = Helper.random(0, 360);
    this.vx = Math.cos((angle * Math.PI) / 180.0);
    this.vy = Math.sin((angle * Math.PI) / 180.0);
  }

  dim(): void {
    this.opacity -= 0.03;
    if (this.opacity < 0) this.opacity = 0;
  }

  dim2(): void {
    this.opacity -= 0.05;
    if (this.opacity < 0) this.opacity = 0;
  }

  update(ctx: CanvasRenderingContext2D): void {
    const frameDur = Date.now() - this.prevTime;
    this.prevTime = Date.now();
    this.liveTime += frameDur;

    if (this.liveTime < 2500) {
      this.speed *= 0.96;
      this.x -= this.vx * this.speed * frameDur + this.wind;
      this.y -= this.vy * this.speed * frameDur - this.gravity;
      this.particles.push(new Particle(this.x, this.y, this.color));
    }

    this.particles.forEach(par => {
      par.draw(ctx);
      par.dim2();
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;

    ctx.beginPath();
    ctx.arc(this.x, this.y, 1.5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.closePath();
    ctx.restore();
  }
}
