import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { StateService } from '../../services/state.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, Button, InputText],
  template: `
    <div class="max-w-620 animate-fade-in">
      <section class="card-section">
        <h1 class="card-title"><i class="pi pi-cog"></i> {{ t.translate('settings') }}</h1>
        <div class="form-field">
          <label class="form-label" for="currency">{{ t.translate('currency') }}</label>
          <input pInputText id="currency" [(ngModel)]="currency" maxlength="12" class="w-full input-text" />
          <small class="text-muted">{{ t.translate('currencyDescription') }}</small>
        </div>
        <div class="saving-button">
          <p-button [label]="t.translate('save')" icon="pi pi-save" [disabled]="!currency.trim()" (onClick)="save()" />
        </div>
      </section>
    </div>
  `,
  styles: [`
    .saving-button {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
    }
    .input-text {
      margin: 8px 0;
    }
  `]
})
export class SettingsComponent {
  stateService = inject(StateService);
  t = inject(TranslationService);
  currency = this.stateService.currency();

  save() {
    this.stateService.setCurrency(this.currency);
    this.currency = this.stateService.currency();
  }
}
