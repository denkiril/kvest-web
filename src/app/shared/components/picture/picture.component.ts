import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';

@Component({
  selector: 'exokv-picture',
  standalone: true,
  templateUrl: './picture.component.html',
  styleUrl: './picture.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PictureComponent {
  public readonly image = input.required<string | undefined>();
  public readonly pending = signal(false);

  constructor() {
    effect(
      () => {
        this.pending.set(!!this.image());
      },
      { allowSignalWrites: true },
    );
  }

  public onImageLoad(): void {
    this.pending.set(false);
  }
}
