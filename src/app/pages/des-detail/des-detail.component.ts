import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';  // ← ДОБАВЬТЕ NgFor
import { DesPanelComponent } from '../../components/des-panel/des-panel.component';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-des-detail',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, DesPanelComponent],  // ← ДОБАВЬТЕ NgFor
  templateUrl: './des-detail.component.html',
  styleUrls: ['./des-detail.component.css']
})
export class DesDetailComponent implements OnInit {
  showModal: boolean = false;
  showInteractiveModal: boolean = false;
  faqOpen: number = 0;
  activeSBox: number = 1;
  openFormula: string = '';

  content: any = {};

  constructor(private contentService: ContentService) {}

  ngOnInit() {
    this.loadContent();
  }

  loadContent() {
    this.contentService.getPageContent('des').subscribe({
      next: (data) => {
        this.content = data;
        console.log('DES content loaded:', this.content);
      },
      error: (err) => {
        console.error('Failed to load DES content:', err);
      }
    });
  }

  openInteractiveModal(): void {
    this.showInteractiveModal = true;
    document.body.classList.add('modal-open');
  }

  closeInteractiveModal(): void {
    this.showInteractiveModal = false;
    document.body.classList.remove('modal-open');
  }
}