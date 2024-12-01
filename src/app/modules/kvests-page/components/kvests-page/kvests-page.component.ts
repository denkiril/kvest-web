import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'exokv-kvests-page',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './kvests-page.component.html',
  styleUrl: './kvests-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KvestsPageComponent {}
