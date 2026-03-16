import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Campaign, CreateCampaignDto } from '../models/campaign.interface';
import { Currency } from '../models/currency.interface';
import { Client } from '../models/client.interface';

@Injectable({ providedIn: 'root' })
export class CampaignService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>('/api/campaigns');
  }

  getCurrencies(): Observable<Currency[]> {
    return this.http.get<Currency[]>('/api/currencies');
  }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>('/api/clients');
  }

  getById(id: number): Observable<Campaign> {
    return this.http.get<Campaign>(`/api/campaigns/${id}`);
  }

  create(dto: CreateCampaignDto): Observable<Campaign> {
    return this.http.post<Campaign>('/api/campaigns', dto);
  }

  update(id: number, dto: Partial<CreateCampaignDto>): Observable<Campaign> {
    return this.http.patch<Campaign>(`/api/campaigns/${id}`, dto);
  }

  redistribute(id: number): Observable<Campaign> {
    return this.http.post<Campaign>(`/api/campaigns/${id}/distribute`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/campaigns/${id}`);
  }
}
