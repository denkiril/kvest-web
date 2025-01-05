import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'exokv-spinner',
  standalone: true,
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {}
