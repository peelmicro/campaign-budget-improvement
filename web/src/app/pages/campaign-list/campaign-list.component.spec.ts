import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CampaignListComponent } from './campaign-list.component';
import { CampaignService } from '../../services/campaign.service';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('CampaignListComponent', () => {
  let service: CampaignService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignListComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    service = TestBed.inject(CampaignService);
    vi.spyOn(service, 'getAll').mockReturnValue(of([]));
    vi.spyOn(service, 'getCurrencies').mockReturnValue(of([]));
    vi.spyOn(service, 'getClients').mockReturnValue(of([]));
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CampaignListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show empty state when no campaigns', async () => {
    const fixture = TestBed.createComponent(CampaignListComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('No campaigns yet');
  });

  it('should show campaigns in a table', async () => {
    vi.spyOn(service, 'getAll').mockReturnValue(of([
      {
        id: 1,
        code: 'CAMP-001',
        clientId: 1,
        client: { id: 1, name: 'Acme', industry: 'Retail' },
        managerName: 'John',
        budget: 10000,
        currencyId: 1,
        currency: { id: 1, code: 'USD', isoNumber: '840', symbol: '$', decimalPoints: 2 },
        days: 30,
        fromDate: '2026-04-01',
        toDate: '2026-04-30',
        goal: 'REACH',
        channels: [],
        createdAt: '2026-03-01',
        updatedAt: '2026-03-01',
      },
    ]));
    const fixture = TestBed.createComponent(CampaignListComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('CAMP-001');
    expect(text).toContain('Acme');
  });

  it('should have a link to create new campaign', () => {
    const fixture = TestBed.createComponent(CampaignListComponent);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a[href="/campaigns/new"]');
    expect(link).toBeTruthy();
  });
});
