import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import { KvestPageService } from '../../services/kvest-page.service';

@Component({
  selector: 'exokv-kvest-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule],
  providers: [KvestPageService],
  templateUrl: './kvest-page.component.html',
  styleUrl: './kvest-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KvestPageComponent {
  private readonly kvestPageService = inject(KvestPageService);

  public readonly page = toSignal(this.kvestPageService.page$);

  public goNext(): void {
    this.kvestPageService.goNext();
  }

  public goPrev(): void {
    this.kvestPageService.goPrev();
  }
}
