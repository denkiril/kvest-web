import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { KvestPageService } from '../../services/kvest-page.service';

@Component({
  selector: 'exokv-kvest-page',
  standalone: true,
  imports: [CommonModule],
  providers: [KvestPageService],
  templateUrl: './kvest-page.component.html',
  styleUrl: './kvest-page.component.scss',
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
