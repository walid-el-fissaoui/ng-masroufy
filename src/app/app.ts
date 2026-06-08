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

  confirmDeleteBudget(event: Event, budget: Budget) {
    // Stop event propagation so clicking delete doesn't select the budget
    event.stopPropagation();

    this.confirmationService.confirm({
      message: `Are you sure you want to delete the budget "${budget.name}"? This will permanently delete the budget, all its categories (tags), and all logged expenses!`,
      header: 'Delete Budget Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger', label: 'Delete' },
      rejectButtonProps: { severity: 'secondary', label: 'Cancel' },
      accept: async () => {
        await this.stateService.deleteBudget(budget.id);
      },
    });
  }
}
