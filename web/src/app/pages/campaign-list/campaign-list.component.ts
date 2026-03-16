import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CampaignService } from '../../services/campaign.service';
import { Campaign } from '../../models/campaign.interface';

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="max-w-6xl mx-auto p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Campaigns</h1>
        <a
          routerLink="/campaigns/new"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Campaign
        </a>
      </div>

      @if (loading()) {
        <p class="text-gray-500">Loading...</p>
      }

      @if (error()) {
        <p class="text-red-600 bg-red-50 p-3 rounded">{{ error() }}</p>
      }

      @if (!loading() && campaigns().length === 0) {
        <p class="text-gray-500 text-center py-12">
          No campaigns yet. Create your first campaign to get started.
        </p>
      }

      @if (campaigns().length > 0) {
        <div class="overflow-x-auto bg-white rounded-lg shadow">
          <table class="w-full text-left">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-4 py-3 text-sm font-semibold text-gray-600">Code</th>
                <th class="px-4 py-3 text-sm font-semibold text-gray-600">Client</th>
                <th class="px-4 py-3 text-sm font-semibold text-gray-600">Budget</th>
                <th class="px-4 py-3 text-sm font-semibold text-gray-600">Days</th>
                <th class="px-4 py-3 text-sm font-semibold text-gray-600">Goal</th>
                <th class="px-4 py-3 text-sm font-semibold text-gray-600">Dates</th>
              </tr>
            </thead>
            <tbody>
              @for (campaign of campaigns(); track campaign.id) {
                <tr>
                  <td class="px-4 py-3">
                    <a
                      [routerLink]="['/campaigns', campaign.id]"
                      class="text-blue-600 hover:underline font-medium"
                    >
                      {{ campaign.code }}
                    </a>
                  </td>
                  <td class="px-4 py-3 text-gray-700">{{ campaign.client.name }}</td>
                  <td class="px-4 py-3 text-gray-700">
                    {{ campaign.budget | currency: campaign.currency.code }}
                  </td>
                  <td class="px-4 py-3 text-gray-700">{{ campaign.days }}</td>
                  <td class="px-4 py-3">
                    <span class="inline-block px-2 py-1 text-xs font-medium rounded-full"
                      [class]="goalClass(campaign.goal)">
                      {{ campaign.goal }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-gray-500 text-sm">
                    {{ campaign.fromDate }} &rarr; {{ campaign.toDate }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class CampaignListComponent implements OnInit {
  private readonly campaignService = inject(CampaignService);
  private readonly destroyRef = inject(DestroyRef);

  readonly campaigns = signal<Campaign[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    this.campaignService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.campaigns.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message);
          this.loading.set(false);
        }
      });
  }

  goalClass(goal: string): string {
    switch (goal) {
      case 'REACH':
        return 'bg-green-100 text-green-800';
      case 'ENGAGEMENT':
        return 'bg-purple-100 text-purple-800';
      case 'BALANCED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
