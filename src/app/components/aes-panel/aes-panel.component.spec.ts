import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AesPanelComponent } from './aes-panel.component';

describe('AesPanelComponent', () => {
  let component: AesPanelComponent;
  let fixture: ComponentFixture<AesPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AesPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AesPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
