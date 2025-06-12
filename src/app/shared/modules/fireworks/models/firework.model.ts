import { Helper } from './helper.model';
import { Particle } from './particle.model';

type StartPosition = 'left' | 'right';

const FIREWORKS_COLORS: string[] = [
  '#ff0000',
  '#ffea00',
  '#96ff00',
  '#00ffff',
  '#0042ff',
  '#ff00e4',
  '#ffac00',
];

export class Firework {
  get deleted() {
    return this.del;
  }

  private ctx: CanvasRenderingContext2D;
  private liveTime = 0;
  private prevTime = 0;
  private x = 0;
  private y = 0;
  private sx = 0;
  private sy = 0;
  private vx = 0;
  private vy = 0;
  private color = '#fff';
  private speed = Helper.random(700, 1100) / 1000;
  private gravity = 1.5;
  private del = false;
  private primaryParticles: Particle[] = [];
  private secondaryParticles: Particle[] = [];

  constructor(ctx: CanvasRenderingContext2D, startPosition: StartPosition) {
    this.ctx = ctx;
    this.init(startPosition);
  }

  private init(startPosition: StartPosition): void {
    const { width, height } = this.ctx.canvas;
    const xCoef = startPosition === 'left' ? -1 : 1;
    this.sx = startPosition === 'left' ? 0 : width;
    this.sy = height * Helper.random(0.9, 0.75);

    const angle = 90 - xCoef * Helper.random(10, 13);
    this.vx = Math.cos((angle * Math.PI) / 180.0);
    this.vy = Math.sin((angle * Math.PI) / 180.0);

    this.x = this.sx;
    this.y = this.sy;
    this.prevTime = Date.now();
    this.color = this.getColor();
    // console.log('>> Firework', angle, this.x, this.y, this);
  }

  update(): void {
    const frameDur = Date.now() - this.prevTime;
    this.prevTime = Date.now();
    this.liveTime += frameDur;

    if (this.liveTime < 1400) {
      this.speed *= 0.98;
      this.x -= this.vx * this.speed * frameDur;
      this.y -= this.vy * this.speed * frameDur - this.gravity;
      this.primaryParticles.push(new Particle(this.x, this.y, this.color));
    } else if (!this.secondaryParticles.length) {
      for (let i = 0; i < 30; i++) {
        this.secondaryParticles.push(new Particle(this.x, this.y, this.color));
      }
    }
    // console.log('fw upd', this.counter++, this.x, this.y);

    // this.primaryParticles.forEach(par => {
    //   par.draw(this.ctx);
    //   par.dim();
    // });
    // this.secondaryParticles.forEach(par => {
    //   par.update(this.ctx);
    // });

    let i = this.primaryParticles.length;
    while (i--) {
      if (this.primaryParticles[i].deleted) {
        this.primaryParticles.splice(i, 1);
      } else {
        this.primaryParticles[i].draw(this.ctx);
        this.primaryParticles[i].dim();
      }
    }

    i = this.secondaryParticles.length;
    while (i--) {
      if (this.secondaryParticles[i].deleted) {
        this.secondaryParticles.splice(i, 1);
      } else {
        this.secondaryParticles[i].update(this.ctx);
      }
    }

    this.del = !this.primaryParticles.length && !this.secondaryParticles.length;
    //   this.primaryParticles.every(par => par.deleted) &&
    //   this.secondaryParticles.every(par => par.deleted);
  }

  private getColor(): string {
    return FIREWORKS_COLORS[Helper.random(0, 6, true)] ?? '#fff';
  }
}
