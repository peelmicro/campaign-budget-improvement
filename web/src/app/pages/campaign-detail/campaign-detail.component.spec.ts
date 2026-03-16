import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CampaignDetailComponent } from './campaign-detail.component';
import { CampaignService } from '../../services/campaign.service';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('CampaignDetailComponent', () => {
  let service: CampaignService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignDetailComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
      ],
    }).compileComponents();

    service = TestBed.inject(CampaignService);
    vi.spyOn(service, 'getById').mockReturnValue(of(null as any));
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CampaignDetailComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show campaign details when loaded', async () => {
    vi.spyOn(service, 'getById').mockReturnValue(of(
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
        channels: [
          {
            id: 1,
            campaignId: 1,
            channelId: 1,
            channel: { id: 1, code: 'VIDEO', description: 'Video Ads', cpm: 15, currencyId: 1, currency: { id: 1, code: 'USD', isoNumber: '840', symbol: '$', decimalPoints: 2 }, engagementRank: 'HIGH' },
            allocatedBudget: 5000,
            currencyId: 1,
            currency: { id: 1, code: 'USD', isoNumber: '840', symbol: '$', decimalPoints: 2 },
            estimatedImpressions: 333333,
            estimatedReach: 111111,
            days: 30,
            schedule: [],
          },
        ],
        createdAt: '2026-03-01',
        updatedAt: '2026-03-01',
      }
    ));

    const fixture = TestBed.createComponent(CampaignDetailComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('CAMP-001');
    expect(text).toContain('Video Ads');
  });

  it('should compute total reach', () => {
    vi.spyOn(service, 'getById').mockReturnValue(of(
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
        channels: [
          { id: 1, campaignId: 1, channelId: 1, channel: { id: 1, code: 'VIDEO', description: 'Video', cpm: 15, currencyId: 1, currency: { id: 1, code: 'USD', isoNumber: '840', symbol: '$', decimalPoints: 2 }, engagementRank: 'HIGH' }, allocatedBudget: 5000, currencyId: 1, currency: { id: 1, code: 'USD', isoNumber: '840', symbol: '$', decimalPoints: 2 }, estimatedImpressions: 333333, estimatedReach: 100000, days: 30, schedule: [] },
          { id: 2, campaignId: 1, channelId: 2, channel: { id: 2, code: 'DISPLAY', description: 'Display', cpm: 3, currencyId: 1, currency: { id: 1, code: 'USD', isoNumber: '840', symbol: '$', decimalPoints: 2 }, engagementRank: 'MEDIUM' }, allocatedBudget: 5000, currencyId: 1, currency: { id: 1, code: 'USD', isoNumber: '840', symbol: '$', decimalPoints: 2 }, estimatedImpressions: 1666667, estimatedReach: 555556, days: 30, schedule: [] },
        ],
        createdAt: '2026-03-01',
        updatedAt: '2026-03-01',
      }
    ));

    const fixture = TestBed.createComponent(CampaignDetailComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.totalReach()).toBe(655556);
  });
});
