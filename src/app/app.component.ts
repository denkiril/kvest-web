import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { debounceTime, fromEvent } from 'rxjs';

import { FireworksService } from './shared/modules/fireworks';

@Component({
  selector: 'exokv-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fireworksService = inject(FireworksService);

  @ViewChild('canvas', { static: true }) private canvas!: ElementRef<HTMLCanvasElement>;

  canvasWidth = signal(0);
  canvasHeight = signal(0);

  ngOnInit(): void {
    this.setCanvasSize();
  }

  ngAfterViewInit(): void {
    this.fireworksService.init(this.canvas.nativeElement);
    this.watchResize();
  }

  private setCanvasSize(): void {
    this.canvasWidth.set(window.innerWidth);
    this.canvasHeight.set(window.innerHeight);
  }

  private watchResize(): void {
    fromEvent(window, 'resize')
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.setCanvasSize());
  }
}
