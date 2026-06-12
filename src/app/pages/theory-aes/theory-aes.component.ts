import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-theory-aes',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './theory-aes.component.html',
  styleUrls: ['./theory-aes.component.css']
})
export class TheoryAesComponent {
  faqOpen: number = 0;

  scrollTo(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}