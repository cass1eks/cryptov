import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';  // ← ДОБАВЬТЕ NgFor
import { KuznechikPanelComponent } from '../../components/kuznechik-panel/kuznechik-panel.component';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-kuznechik-detail',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, KuznechikPanelComponent],  // ← ДОБАВЬТЕ NgFor
  templateUrl: './kuznechik-detail.component.html',
  styleUrls: ['./kuznechik-detail.component.css']
})
export class KuznechikDetailComponent implements OnInit {
  showSBoxModal = false;
  showInteractiveModal = false;
  openFormula: string = '';
  faqOpen: number = 0;

  content: any = {};

  constructor(private contentService: ContentService) {}

  ngOnInit() {
    this.loadContent();
  }

  loadContent() {
    this.contentService.getPageContent('kuznechik').subscribe({
      next: (data) => {
        this.content = data;
        console.log('Kuznechik content loaded:', this.content);
      },
      error: (err) => {
        console.error('Failed to load kuznechik content:', err);
      }
    });
  }

  openInteractiveModal() {
    this.showInteractiveModal = true;
    document.body.classList.add('modal-open');
  }

  closeInteractiveModal() {
    this.showInteractiveModal = false;
    document.body.classList.remove('modal-open');
  }
}