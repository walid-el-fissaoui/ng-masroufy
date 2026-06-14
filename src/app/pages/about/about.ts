import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [ButtonModule, RouterLink],
  template: `
    <div class="max-w-620 animate-fade-in">
      <div class="about-header text-center">
        <div class="logo-container">
          <i class="pi pi-wallet logo-icon"></i>
        </div>
        <h1 class="about-title">{{ t.translate('appName') }}</h1>
        <p class="about-subtitle text-muted">{{ t.translate('appSubtitle') }}</p>
      </div>

      <div class="card-section">
        <h2 class="card-title"><i class="pi pi-compass"></i> {{ t.translate('whatIsMasroufyHeader') }}</h2>
        <p class="section-text">
          {{ t.translate('whatIsMasroufyText1') }}
        </p>
        <p class="section-text">
          {{ t.translate('whatIsMasroufyText2') }}
        </p>
      </div>

      <!-- Privacy Alert Card -->
      <div class="privacy-alert-card">
        <div class="privacy-header">
          <i class="pi pi-lock-open privacy-icon"></i>
          <h3>{{ t.translate('localPrivateHeader') }}</h3>
        </div>
        <p class="privacy-text">
          {{ t.translate('localPrivateText1') }}
        </p>
        <p class="privacy-text bg-badge">
          <i class="pi pi-info-circle"></i> {{ t.translate('localPrivateText2') }}
        </p>
      </div>

      <div class="card-section">
        <h2 class="card-title"><i class="pi pi-star"></i> {{ t.translate('coreFeatures') }}</h2>
        <ul class="features-list">
          <li>
            <i class="pi pi-check-circle text-primary"></i>
            <div>
              <strong>{{ t.translate('multiBudgetSupport') }}:</strong> {{ t.translate('multiBudgetSupportDesc') }}
            </div>
          </li>
          <li>
            <i class="pi pi-check-circle text-primary"></i>
            <div>
              <strong>{{ t.translate('scopedTagging') }}:</strong> {{ t.translate('scopedTaggingDesc') }}
            </div>
          </li>
          <li>
            <i class="pi pi-check-circle text-primary"></i>
            <div>
              <strong>{{ t.translate('detailedTracking') }}:</strong> {{ t.translate('detailedTrackingDesc') }}
            </div>
          </li>
          <li>
            <i class="pi pi-check-circle text-primary"></i>
            <div>
              <strong>{{ t.translate('interactiveStats') }}:</strong> {{ t.translate('interactiveStatsDesc') }}
            </div>
          </li>
          <li>
            <i class="pi pi-check-circle text-primary"></i>
            <div>
              <strong>{{ t.translate('darkMode') }}:</strong> {{ t.translate('darkModeDesc') }}
            </div>
          </li>
        </ul>
      </div>

      <div class="flex justify-content-center mt-4 mb-4">
        <p-button [label]="t.translate('backToDashboard')" icon="pi pi-home" routerLink="/" />
      </div>
    </div>
  `,
  styles: [`
    .about-header {
      margin-top: 1rem;
      margin-bottom: 2.5rem;
      text-align: center;
    }
    .logo-container {
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, #1e88e5 0%, #60a5fa 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem auto;
      box-shadow: 0 8px 16px -4px rgba(30, 136, 229, 0.3);
    }
    .logo-icon {
      font-size: 2.25rem;
      color: white;
    }
    .about-title {
      font-size: 2.25rem;
      font-weight: 800;
      margin: 0 0 0.25rem 0;
      letter-spacing: -0.025em;
    }
    .about-subtitle {
      font-size: 1.1rem;
      margin: 0;
    }
    .section-text {
      line-height: 1.6;
      font-size: 0.975rem;
      margin-bottom: 1rem;
    }
    .section-text strong {
      font-weight: 600;
    }
    .privacy-alert-card {
      background: linear-gradient(135deg, rgba(30, 136, 229, 0.08) 0%, rgba(96, 165, 250, 0.05) 100%);
      border: 1px solid rgba(30, 136, 229, 0.2);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    html.app-dark .privacy-alert-card {
      background: linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(30, 136, 229, 0.03) 100%);
      border: 1px solid rgba(96, 165, 250, 0.15);
    }
    .privacy-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .privacy-header h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--primary-color);
    }
    .privacy-icon {
      font-size: 1.4rem;
      color: var(--primary-color);
    }
    .privacy-text {
      line-height: 1.5;
      font-size: 0.95rem;
      margin-top: 0;
      margin-bottom: 0.75rem;
    }
    .bg-badge {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0;
    }
    .features-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .features-list li {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 1rem;
      line-height: 1.5;
      font-size: 0.95rem;
    }
    .features-list li:last-child {
      margin-bottom: 0;
    }
    .text-primary {
      color: var(--primary-color);
      font-size: 1.1rem;
      margin-top: 0.1rem;
    }
    .text-center {
      text-align: center;
    }
    .justify-content-center {
      display: flex;
      justify-content: center;
    }
    .mt-4 { margin-top: 1.5rem; }
    .mb-4 { margin-bottom: 1.5rem; }
  `]
})
export class AboutComponent {
  t = inject(TranslationService);
}
