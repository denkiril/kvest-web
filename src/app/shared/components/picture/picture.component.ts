import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, Subject, takeUntil } from 'rxjs';

import { KvestImage } from '../../../modules/kvest-page/models/kvest-page.model';

@Component({
  selector: 'exokv-picture',
  standalone: true,
  templateUrl: './picture.component.html',
  styleUrl: './picture.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PictureComponent {
  public readonly images = input.required<KvestImage | undefined>();

  public readonly imageItems = computed(() => this.images()?.items ?? []);
  public readonly imagesCounter = signal(0);
  public readonly pending = signal(false);

  private readonly stopCounter$ = new Subject<void>();
  private counter = 0;

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(
      () => {
        const images = this.images();
        // console.log('images:', images);
        this.initCounter(images);
        this.pending.set(!!images);
      },
      { allowSignalWrites: true },
    );
  }

  public onImageLoad(): void {
    this.pending.set(false);
  }

  private initCounter(images: KvestImage | undefined): void {
    this.counter = 0;
    this.imagesCounter.set(0);
    this.stopCounter$.next();

    const imagesCount = images?.items.length ?? 0;
    if (imagesCount < 2) return;

    interval(5000)
      .pipe(takeUntil(this.stopCounter$), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.counter++;
        this.imagesCounter.set(this.counter % imagesCount);
        // console.log('imagesCounter:', this.counter, this.imagesCounter());
      });
  }
}
