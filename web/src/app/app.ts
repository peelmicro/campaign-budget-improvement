import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  template: `
    <div class="min-h-screen bg-gray-100">
      <nav class="bg-white shadow-sm border-b">
        <div class="max-w-6xl mx-auto px-6 py-3">
          <a routerLink="/" class="text-lg font-bold text-blue-600 hover:text-blue-700">
            Campaign Budget
          </a>
        </div>
      </nav>
      <router-outlet />
    </div>
  `,
})
export class App {}
