import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AesPanelComponent } from '../../components/aes-panel/aes-panel.component';
import { DesPanelComponent } from '../../components/des-panel/des-panel.component';
import { KuznechikPanelComponent } from '../../components/kuznechik-panel/kuznechik-panel.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgIf, AesPanelComponent, DesPanelComponent, KuznechikPanelComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  activeAlgorithm: string | null = null;

  constructor(private router: Router) {}

  scrollToAlgorithms(): void {
    const element = document.getElementById('algorithms');
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  openAlgorithm(algorithm: string): void {
    this.activeAlgorithm = algorithm;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.activeAlgorithm = null;
    document.body.style.overflow = 'auto';
  }

  goToDetailPage(algorithm: string): void {
    this.router.navigate(['/algorithms', algorithm]);
  }

  goToTheoryPage(algorithm: string): void {
    this.router.navigate(['/theory', algorithm]);
  }
}