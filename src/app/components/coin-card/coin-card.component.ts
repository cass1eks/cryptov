import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-coin-card',
  standalone: true,
  templateUrl: './coin-card.component.html',
  styleUrl: './coin-card.component.css'
})
export class CoinCardComponent {

  @Input() name = '';
  @Input() symbol = '';
  @Input() price = 0;
  @Input() change24h = 0;

}
