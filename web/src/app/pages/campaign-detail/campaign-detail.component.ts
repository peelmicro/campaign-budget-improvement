import { Component, computed, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampaignService } from '../../services/campaign.service';
import { Campaign, CampaignGoal } from '../../models/campaign.interface';
import { CampaignChannel } from '../../models/campaign-channel.interface';

@Component({
  selector: 'app-campaign-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DecimalPipe, PercentPipe, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto p-6">
      @if (loading()) {
        <p class="text-gray-500">Loading...</p>
      }

      @if (error()) {
        <p class="text-red-600 bg-red-50 p-3 rounded mb-4">{{ error() }}</p>
      }

      @if (campaign(); as c) {
        <div class="flex items-center justify-between mb-6">
          <div>
            <a routerLink="/" class="text-blue-600 hover:underline text-sm">&larr; Back to campaigns</a>
            <h1 class="text-2xl font-bold text-gray-800 mt-1">{{ c.code }}</h1>
          </div>
          <div class="flex gap-2">
            <a [routerLink]="['/campaigns', c.id, 'edit']"
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              Edit
            </a>
            <button (click)="onDelete()"
              class="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors">
              Delete
            </button>
          </div>
        </div>

        <!-- Campaign Summary -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white p-4 rounded-lg shadow">
            <p class="text-sm text-gray-500">Budget</p>
            <p class="text-xl font-bold text-gray-800">
              {{ c.budget | currency: c.currency.code }}
            </p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow">
            <p class="text-sm text-gray-500">Duration</p>
            <p class="text-xl font-bold text-gray-800">{{ c.days }} days</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow">
            <p class="text-sm text-gray-500">Goal</p>
            <p class="text-xl font-bold text-gray-800">{{ c.goal }}</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow">
            <p class="text-sm text-gray-500">Total Est. Reach</p>
            <p class="text-xl font-bold text-gray-800">{{ totalReach() | number }}</p>
          </div>
        </div>

        <!-- Re-distribute -->
        <div class="bg-white p-4 rounded-lg shadow mb-6 flex items-center gap-4">
          <label for="goalSelect" class="text-sm font-medium text-gray-700">Re-distribute with goal:</label>
          <select id="goalSelect" [(ngModel)]="selectedGoal"
            class="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
            <option value="REACH">REACH</option>
            <option value="ENGAGEMENT">ENGAGEMENT</option>
            <option value="BALANCED">BALANCED</option>
          </select>
          <button (click)="onRedistribute()"
            [disabled]="loading()"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            Redistribute
          </button>
        </div>

        <!-- Budget Distribution Chart -->
        @if (c.channels.length > 0) {
          <div class="bg-white p-4 rounded-lg shadow mb-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Budget Allocation</h2>
            <div class="space-y-3">
              @for (ch of c.channels; track ch.id) {
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="font-medium text-gray-700">{{ ch.channel.description }}</span>
                    <span class="text-gray-600">
                      {{ ch.allocatedBudget | currency: c.currency.code }}
                      ({{ +ch.allocatedBudget / +c.budget | percent: '1.1-1' }})
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-4">
                    <div class="h-4 rounded-full transition-all duration-500"
                      [class]="barColor(ch.channel.code)"
                      [style.width.%]="+ch.allocatedBudget / +c.budget * 100">
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Distribution Table -->
        @if (c.channels.length > 0) {
          <div class="bg-white rounded-lg shadow overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-gray-50 border-b">
                <tr>
                  <th class="px-4 py-3 text-sm font-semibold text-gray-600">Channel</th>
                  <th class="px-4 py-3 text-sm font-semibold text-gray-600 text-right">Allocated Budget</th>
                  <th class="px-4 py-3 text-sm font-semibold text-gray-600 text-right">% of Total</th>
                  <th class="px-4 py-3 text-sm font-semibold text-gray-600 text-right">Est. Impressions</th>
                  <th class="px-4 py-3 text-sm font-semibold text-gray-600 text-right">Est. Reach</th>
                  <th class="px-4 py-3 text-sm font-semibold text-gray-600 text-right">Days</th>
                  <th class="px-4 py-3 text-sm font-semibold text-gray-600 text-center">Schedule</th>
                </tr>
              </thead>
              <tbody>
                @for (ch of c.channels; track ch.id) {
                  <tr class="border-b last:border-b-0">
                    <td class="px-4 py-3 font-medium text-gray-800">
                      {{ ch.channel.description }}
                    </td>
                    <td class="px-4 py-3 text-right text-gray-700">
                      {{ ch.allocatedBudget | currency: c.currency.code }}
                    </td>
                    <td class="px-4 py-3 text-right text-gray-700">
                      {{ +ch.allocatedBudget / +c.budget | percent: '1.1-1' }}
                    </td>
                    <td class="px-4 py-3 text-right text-gray-700">
                      {{ ch.estimatedImpressions | number }}
                    </td>
                    <td class="px-4 py-3 text-right text-gray-700">
                      {{ ch.estimatedReach | number }}
                    </td>
                    <td class="px-4 py-3 text-right text-gray-700">{{ ch.days }}</td>
                    <td class="px-4 py-3 text-center">
                      <button (click)="openSchedule(ch)"
                        class="text-blue-600 hover:text-blue-800 text-sm hover:underline">
                        View dates
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
              <tfoot class="bg-gray-50 font-semibold">
                <tr>
                  <td class="px-4 py-3 text-gray-800">Total</td>
                  <td class="px-4 py-3 text-right text-gray-800">
                    {{ c.budget | currency: c.currency.code }}
                  </td>
                  <td class="px-4 py-3 text-right text-gray-800">100%</td>
                  <td class="px-4 py-3 text-right text-gray-800">
                    {{ totalImpressions() | number }}
                  </td>
                  <td class="px-4 py-3 text-right text-gray-800">
                    {{ totalReach() | number }}
                  </td>
                  <td class="px-4 py-3 text-right text-gray-800">{{ c.days }}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        }
      }

      <!-- Schedule Modal -->
      @if (scheduleChannel(); as sc) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="dialog" aria-modal="true"
          (click)="closeSchedule()" (keydown.escape)="closeSchedule()">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
            role="document" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()">
            <div class="flex items-center justify-between p-4 border-b">
              <h3 class="text-lg font-semibold text-gray-800">
                {{ sc.channel.description }} — Schedule
              </h3>
              <button (click)="closeSchedule()"
                class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <div class="p-4 overflow-y-auto">
              <p class="text-sm text-gray-500 mb-3">
                {{ sc.schedule.length }} days scheduled
              </p>
              <div class="grid grid-cols-3 gap-2">
                @for (date of sc.schedule; track date) {
                  <span class="text-sm text-gray-700 bg-gray-50 rounded px-2 py-1 text-center">
                    {{ date }}
                  </span>
                }
              </div>
            </div>
            <div class="p-4 border-t">
              <button (click)="closeSchedule()"
                class="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CampaignDetailComponent implements OnInit {
  private readonly campaignService = inject(CampaignService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly id = Number(this.route.snapshot.paramMap.get('id') ?? 0);
  selectedGoal: CampaignGoal = 'REACH';
  readonly scheduleChannel = signal<CampaignChannel | null>(null);

  readonly campaign = signal<Campaign | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly totalImpressions = computed(() =>
    (this.campaign()?.channels || ([] as CampaignChannel[])).reduce(
      (sum: number, ch: CampaignChannel) => sum + ch.estimatedImpressions,
      0,
    ),
  );

  readonly totalReach = computed(() =>
    (this.campaign()?.channels || ([] as CampaignChannel[])).reduce(
      (sum: number, ch: CampaignChannel) => sum + ch.estimatedReach,
      0,
    ),
  );

  ngOnInit(): void {
    this.loading.set(true);
    this.campaignService.getById(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.campaign.set(data);
          this.selectedGoal = data.goal;
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message);
          this.loading.set(false);
        }
      });
  }

  openSchedule(channel: CampaignChannel): void {
    this.scheduleChannel.set(channel);
  }

  closeSchedule(): void {
    this.scheduleChannel.set(null);
  }

  onRedistribute(): void {
    const c = this.campaign();
    this.loading.set(true);
    
    if (!c || this.selectedGoal === c.goal) {
      this.campaignService.redistribute(this.id)
        .subscribe({
          next: (data) => {
            this.campaign.set(data);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set(err.message);
            this.loading.set(false);
          }
        });
    } else {
      this.campaignService.update(this.id, { goal: this.selectedGoal })
        .subscribe({
          next: (data) => {
            this.campaign.set(data);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set(err.error?.message?.join?.(', ') || err.message);
            this.loading.set(false);
          }
        });
    }
  }

  onDelete(): void {
    if (confirm('Are you sure you want to delete this campaign?')) {
      this.loading.set(true);
      this.campaignService.delete(this.id)
        .subscribe({
          next: () => {
            this.loading.set(false);
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.error.set(err.message);
            this.loading.set(false);
          }
        });
    }
  }

  barColor(channelCode: string): string {
    switch (channelCode) {
      case 'VIDEO':
        return 'bg-blue-500';
      case 'DISPLAY':
        return 'bg-green-500';
      case 'SOCIAL':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  }
}
