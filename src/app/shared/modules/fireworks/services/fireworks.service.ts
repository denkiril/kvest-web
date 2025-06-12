import { inject, Injectable, NgZone } from '@angular/core';

import { Firework } from '../models/firework.model';

@Injectable()
export class FireworksService {
  private zone = inject(NgZone);

  private ctx: CanvasRenderingContext2D | null = null;
  private fireworks: Firework[] = [];

  init(canvasEl: HTMLCanvasElement): void {
    this.ctx = canvasEl.getContext('2d');
    // console.log('[Fireworks] ctx:', this.ctx);
  }

  fire(): void {
    const { ctx } = this;
    if (!ctx) return;

    this.zone.runOutsideAngular(() => {
      for (let i = 0; i < 8; i++) {
        this.fireworks.push(new Firework(ctx, i % 2 === 0 ? 'left' : 'right'));
      }
      this.update();
    });
  }

  private update(): void {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // this.fireworks = this.fireworks.filter(item => !item.deleted);
    // this.fireworks.forEach(fw => {
    //   fw.update();
    // });

    let i = this.fireworks.length;
    while (i--) {
      if (this.fireworks[i].deleted) {
        this.fireworks.splice(i, 1);
      } else {
        this.fireworks[i].update();
      }
    }

    if (this.fireworks.length) {
      requestAnimationFrame(() => this.update());
    }
  }
}
