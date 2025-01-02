import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';

import { KvestPageService } from '../../../kvest-page/services/kvest-page.service';

@Component({
  selector: 'exokv-kvests-page',
  standalone: true,
  imports: [RouterModule],
  providers: [KvestPageService],
  templateUrl: './kvests-page.component.html',
  styleUrl: './kvests-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KvestsPageComponent {
  private readonly kvestPageService = inject(KvestPageService);

  public readonly kvestsItems = toSignal(this.kvestPageService.kvestsItems$);
}
