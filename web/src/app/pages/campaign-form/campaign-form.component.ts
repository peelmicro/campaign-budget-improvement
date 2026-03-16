import { Component, computed, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CampaignService } from '../../services/campaign.service';
import { CampaignGoal } from '../../models/campaign.interface';
import { Currency } from '../../models/currency.interface';
import { Client } from '../../models/client.interface';

@Component({
  selector: 'app-campaign-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">
        {{ isEdit() ? 'Edit Campaign' : 'New Campaign' }}
      </h1>

      @if (error()) {
        <p class="text-red-600 bg-red-50 p-3 rounded mb-4">{{ error() }}</p>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4 bg-white p-6 rounded-lg shadow">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input id="code" formControlName="code" type="text"
              class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label for="goal" class="block text-sm font-medium text-gray-700 mb-1">Goal</label>
            <select id="goal" formControlName="goal"
              class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              @for (g of goals; track g) {
                <option [value]="g">{{ g }}</option>
              }
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="clientId" class="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select id="clientId" formControlName="clientId"
              class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select a client</option>
              @for (c of clients(); track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </select>
          </div>
          <div>
            <label for="managerName" class="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
            <input id="managerName" formControlName="managerName" type="text"
              class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="budget" class="block text-sm font-medium text-gray-700 mb-1">Budget</label>
            <input id="budget" formControlName="budget" type="number" min="0" step="0.01"
              class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label for="currencyId" class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select id="currencyId" formControlName="currencyId"
              class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              @for (c of currencies(); track c.id) {
                <option [value]="c.id">{{ c.code }} ({{ c.symbol }})</option>
              }
            </select>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label for="days" class="block text-sm font-medium text-gray-700 mb-1">Days</label>
            <input id="days" formControlName="days" type="number" min="1"
              class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label for="fromDate" class="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input id="fromDate" formControlName="fromDate" type="date"
              class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label for="toDate" class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input id="toDate" formControlName="toDate" type="date"
              class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        <div class="flex items-center gap-3 pt-4">
          <button type="submit"
            [disabled]="form.invalid || loading()"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {{ loading() ? 'Saving...' : (isEdit() ? 'Update' : 'Create') }}
          </button>
          <a routerLink="/" class="text-gray-600 hover:text-gray-800">Cancel</a>
        </div>
      </form>
    </div>
  `,
})
export class CampaignFormComponent implements OnInit {
  private readonly campaignService = inject(CampaignService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly goals: CampaignGoal[] = ['REACH', 'ENGAGEMENT', 'BALANCED'];
  readonly campaignId = signal<number | null>(null);
  readonly isEdit = computed(() => this.campaignId() !== null);

  readonly currencies = signal<Currency[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    clientId: [0, [Validators.required, Validators.min(1)]],
    managerName: ['', Validators.required],
    budget: [0, [Validators.required, Validators.min(0.01)]],
    currencyId: [0, [Validators.required, Validators.min(1)]],
    days: [1, [Validators.required, Validators.min(1)]],
    fromDate: ['', Validators.required],
    toDate: ['', Validators.required],
    goal: ['REACH' as CampaignGoal, Validators.required],
  });

  ngOnInit(): void {
    this.campaignService.getCurrencies()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.currencies.set(data),
      });

    this.campaignService.getClients()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.clients.set(data),
      });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.campaignId.set(+id);
      this.loading.set(true);
      this.campaignService.getById(+id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (existing) => {
            this.form.patchValue({
              code: existing.code,
              clientId: existing.clientId,
              managerName: existing.managerName,
              budget: +existing.budget,
              currencyId: existing.currencyId,
              days: existing.days,
              fromDate: existing.fromDate,
              toDate: existing.toDate,
              goal: existing.goal,
            });
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set(err.message);
            this.loading.set(false);
          }
        });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    const dto = {
      ...this.form.getRawValue(),
      currencyId: +this.form.getRawValue().currencyId,
      clientId: +this.form.getRawValue().clientId,
    };

    const campaignId = this.campaignId();
    if (this.isEdit() && campaignId !== null) {
      this.campaignService.update(campaignId, dto)
        .subscribe({
          next: (campaign) => {
            this.loading.set(false);
            this.router.navigate(['/campaigns', campaign.id]);
          },
          error: (err) => {
            this.error.set(err.error?.message?.join?.(', ') || err.message);
            this.loading.set(false);
          }
        });
    } else {
      this.campaignService.create(dto)
        .subscribe({
          next: (campaign) => {
            this.loading.set(false);
            this.router.navigate(['/campaigns', campaign.id]);
          },
          error: (err) => {
            this.error.set(err.error?.message?.join?.(', ') || err.message);
            this.loading.set(false);
          }
        });
    }
  }
}
