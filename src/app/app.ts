import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { Drawer } from 'primeng/drawer';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { StateService } from './services/state.service';
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
  providers: [ConfirmationService],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  stateService = inject(StateService);
  translationService = inject(TranslationService);
  private confirmationService = inject(ConfirmationService);

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
