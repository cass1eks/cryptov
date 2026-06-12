import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { AesPanelComponent } from '../../components/aes-panel/aes-panel.component';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-aes-detail',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, AesPanelComponent],
  templateUrl: './aes-detail.component.html',
  styleUrls: ['./aes-detail.component.css']
})
export class AesDetailComponent implements OnInit {
  showSBoxModal = false;
  showInteractiveModal = false;
  openFormula: string = '';  // ← ИЗМЕНЕНО: string вместо number

  content: any = {};

  constructor(private contentService: ContentService) {}

  ngOnInit() {
    this.loadContent();
  }

  loadContent() {
    this.contentService.getPageContent('aes').subscribe({
      next: (data) => {
        this.content = data;
        console.log('AES content loaded:', this.content);
      },
      error: (err) => {
        console.error('Failed to load content:', err);
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