import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CampaignFormComponent } from './campaign-form.component';

describe('CampaignFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignFormComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CampaignFormComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show "New Campaign" title when creating', async () => {
    const fixture = TestBed.createComponent(CampaignFormComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('New Campaign');
  });

  it('should have an invalid form by default', () => {
    const fixture = TestBed.createComponent(CampaignFormComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.form.valid).toBe(false);
  });

  it('should have a submit button', () => {
    const fixture = TestBed.createComponent(CampaignFormComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button).toBeTruthy();
    expect(button.textContent.trim()).toBe('Create');
  });
});
