import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { Drawer } from 'primeng/drawer';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { StateService } from './services/state.service';
import { MasroufyExportData } from './services/db.service';
import { TranslationService } from './services/translation.service';
import { Budget } from './models/types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    Button,
    InputText,
    Dialog,
    Drawer,
    ConfirmDialog,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  stateService = inject(StateService);
  translationService = inject(TranslationService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  // Sidebar controls
  sidebarCollapsed = signal<boolean>(false);
  mobileDrawerVisible = signal<boolean>(false);

  // Budget dialog states
  createBudgetVisible = false;
  newBudgetName = '';

  toggleSidebar() {
    this.sidebarCollapsed.update((val) => !val);
  }

  showCreateBudgetDialog() {
    this.newBudgetName = '';
    this.createBudgetVisible = true;
  }

  async saveBudget() {
    if (!this.newBudgetName.trim()) return;
    await this.stateService.addBudget(this.newBudgetName.trim());
    this.createBudgetVisible = false;
    this.newBudgetName = '';
  }

  async exportData() {
    const data = await this.stateService.exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${this.translationService.translate('exportDataFilePrefix')}-${timestamp}.json`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  chooseImportFile(input: HTMLInputElement) {
    if (window.confirm(this.translationService.translate('importDataConfirm'))) input.click();
  }

  async importData(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      const data: unknown = JSON.parse(await file.text());
      if (!this.isExportData(data)) throw new Error('Invalid backup format');
      await this.stateService.importData(data);
      window.alert(this.translationService.translate('importDataSuccess'));
    } catch {
      window.alert(this.translationService.translate('importDataError'));
    }
  }

  private isExportData(value: unknown): value is MasroufyExportData {
    if (!value || typeof value !== 'object') return false;
    const data = value as Partial<MasroufyExportData>;
    if (!Array.isArray(data.budgets) || !Array.isArray(data.tags) || !Array.isArray(data.expenses)) return false;
    const record = (item: unknown): item is Record<string, unknown> => !!item && typeof item === 'object';
    return data.budgets.every((item) => record(item) && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.createdAt === 'number')
      && data.tags.every((item) => record(item) && typeof item.id === 'string' && typeof item.budgetId === 'string' && typeof item.name === 'string' && typeof item.createdAt === 'number')
      && data.expenses.every((item) => record(item) && typeof item.id === 'string' && typeof item.budgetId === 'string' && typeof item.amount === 'number' && typeof item.description === 'string' && typeof item.tagId === 'string' && typeof item.date === 'string' && typeof item.createdAt === 'number');
  }

  confirmDeleteBudget(event: Event, budget: Budget) {
    // Stop event propagation so clicking delete doesn't select the budget
    event.stopPropagation();

    this.confirmationService.confirm({
      message: this.translationService.translate('deleteBudgetConfirmText', { name: budget.name }),
      header: this.translationService.translate('deleteBudgetConfirmHeader'),
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger', label: this.translationService.translate('delete') },
      rejectButtonProps: { severity: 'secondary', label: this.translationService.translate('cancel') },
      accept: async () => {
        await this.stateService.deleteBudget(budget.id);
      },
    });
  }
}
