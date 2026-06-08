import { Component, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Button } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { StateService } from '../../services/state.service';
import { Tag, Expense } from '../../models/types';

interface TagStatBreakdown {
  tagId: string;
  tagName: string;
  total: number;
  percentage: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputText,
    InputNumber,
    Select,
    DatePicker,
    Button,
    ProgressBar,
  ],
  providers: [ConfirmationService],
  template: `
    <div class="max-w-620 animate-fade-in">
      @if (!stateService.activeBudget()) {
        <!-- Empty State when no budget is selected -->
        <div class="empty-state animate-fade-in">
          <i class="pi pi-wallet"></i>
          <h3>No Active Budget</h3>
          <p>Please select an existing budget from the sidebar or create a new budget to start tracking your pocket money.</p>
        </div>
      } @else {
        <!-- Budget Dashboard Header -->
        <div class="budget-dashboard-header">
          <h1 class="budget-title">
            <i class="pi pi-wallet"></i> {{ stateService.activeBudget()?.name }}
          </h1>
          <p class="budget-subtitle text-muted">Manage categories, log expenses, and analyze spending statistics.</p>
        </div>

        <!-- Section 1: Tags Management -->
        <section class="card-section animate-fade-in">
          <h2 class="card-title"><i class="pi pi-tags"></i> Category Tags</h2>
          <div class="tag-form">
            <div class="input-group">
              <input 
                pInputText 
                [(ngModel)]="newTagName" 
                placeholder="New category (e.g. Food, Transport)" 
                class="w-full flex-1"
                (keydown.enter)="addTag()"
              />
              <p-button label="Add Tag" icon="pi pi-plus" [disabled]="!newTagName.trim()" (onClick)="addTag()" />
            </div>
          </div>

          <div class="tags-list">
            @if (stateService.activeBudgetTags().length === 0) {
              <span class="text-muted text-sm">No tags created yet. Add one to categorize expenses!</span>
            } @else {
              @for (tag of stateService.activeBudgetTags(); track tag.id) {
                <div class="tag-badge" [class.editing]="editingTagId() === tag.id">
                  @if (editingTagId() === tag.id) {
                    <input 
                      type="text" 
                      [(ngModel)]="editingTagName" 
                      class="tag-edit-input" 
                      (keydown.enter)="saveTagEdit(tag)"
                      (keydown.escape)="cancelTagEdit()"
                      #editInput
                      autofocus
                    />
                    <button class="tag-action-btn save" (click)="saveTagEdit(tag)" title="Save">
                      <i class="pi pi-check"></i>
                    </button>
                    <button class="tag-action-btn cancel" (click)="cancelTagEdit()" title="Cancel">
                      <i class="pi pi-times"></i>
                    </button>
                  } @else {
                    <span class="tag-name">{{ tag.name }}</span>
                    <button class="tag-action-btn edit" (click)="startTagEdit(tag)" title="Edit Tag">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button class="tag-action-btn delete" (click)="confirmDeleteTag(tag)" title="Delete Tag">
                      <i class="pi pi-trash"></i>
                    </button>
                  }
                </div>
              }
            }
          </div>
        </section>

        <!-- Section 2: Expenses Management -->
        <section class="card-section animate-fade-in">
          <h2 class="card-title">
            <i class="pi pi-calculator"></i> 
            {{ editingExpenseId() ? 'Edit Expense' : 'Log New Expense' }}
          </h2>
          
          <div class="expense-form">
            <div class="grid-form">
              <div class="form-field">
                <label class="form-label">Amount</label>
                <p-inputnumber 
                  [(ngModel)]="expenseAmount" 
                  mode="currency" 
                  currency="MAD" 
                  locale="fr-MA" 
                  placeholder="0.00" 
                  styleClass="w-full" 
                  [min]="0.01"
                />
              </div>

              <div class="form-field">
                <label class="form-label">Description</label>
                <input 
                  pInputText 
                  [(ngModel)]="expenseDescription" 
                  placeholder="What did you buy?" 
                  class="w-full"
                />
              </div>

              <div class="form-field">
                <label class="form-label">Tag Category</label>
                <p-select 
                  [options]="stateService.activeBudgetTags()" 
                  [(ngModel)]="expenseTag" 
                  optionLabel="name" 
                  placeholder="Select a category" 
                  styleClass="w-full"
                />
              </div>

              <div class="form-field">
                <label class="form-label">Date</label>
                <p-datepicker 
                  [(ngModel)]="expenseDate" 
                  [showIcon]="true" 
                  styleClass="w-full" 
                  dateFormat="yy-mm-dd"
                />
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-4">
              @if (editingExpenseId()) {
                <p-button label="Cancel" severity="secondary" icon="pi pi-times" (onClick)="cancelExpenseEdit()" />
                <p-button label="Update Expense" icon="pi pi-save" [disabled]="!isExpenseFormValid()" (onClick)="saveExpense()" />
              } @else {
                <p-button label="Add Expense" icon="pi pi-check" [disabled]="!isExpenseFormValid()" (onClick)="saveExpense()" />
              }
            </div>
          </div>
        </section>

        <!-- Expenses List View -->
        <section class="card-section animate-fade-in">
          <h2 class="card-title"><i class="pi pi-list"></i> History</h2>
          
          <div class="expenses-list">
            @if (stateService.activeBudgetExpenses().length === 0) {
              <div class="empty-list text-center py-4 text-muted">
                <i class="pi pi-info-circle text-2xl mb-2"></i>
                <p>No expenses tracked yet. Log one above!</p>
              </div>
            } @else {
              @for (exp of stateService.activeBudgetExpenses(); track exp.id) {
                <div class="expense-item-card animate-fade-in">
                  <div class="expense-meta">
                    <span class="expense-amount">{{ exp.amount | number:'1.2-2' }} MAD</span>
                    <span class="expense-tag-label">{{ getTagName(exp.tagId) }}</span>
                  </div>
                  <div class="expense-details">
                    <span class="expense-desc">{{ exp.description }}</span>
                    <span class="expense-date text-muted text-xs">
                      <i class="pi pi-calendar"></i> {{ exp.date }}
                    </span>
                  </div>
                  <div class="expense-actions">
                    <button class="expense-action-btn edit" (click)="startExpenseEdit(exp)" title="Edit Expense">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button class="expense-action-btn delete" (click)="confirmDeleteExpense(exp)" title="Delete Expense">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        </section>

        <!-- Section 3: Statistics Scoped to Budget -->
        <section class="card-section animate-fade-in">
          <h2 class="card-title"><i class="pi pi-chart-pie"></i> Statistics</h2>
          
          <div class="stats-filters">
            <div class="grid-form">
              <div class="form-field">
                <label class="form-label">Start Date</label>
                <p-datepicker [(ngModel)]="statsStartDate" [showIcon]="true" styleClass="w-full" dateFormat="yy-mm-dd" />
              </div>
              <div class="form-field">
                <label class="form-label">End Date</label>
                <p-datepicker [(ngModel)]="statsEndDate" [showIcon]="true" styleClass="w-full" dateFormat="yy-mm-dd" />
              </div>
            </div>
            <div class="flex justify-end mt-4">
              <p-button label="Generate Stats" icon="pi pi-chart-bar" (onClick)="generateStats()" />
            </div>
          </div>

          @if (statsGenerated()) {
            <div class="stats-results animate-fade-in mt-4">
              <div class="stats-summary-box">
                <span class="stats-summary-label">Total Expenditures</span>
                <span class="stats-summary-val">{{ statsTotal() | number:'1.2-2' }} MAD</span>
              </div>

              <div class="stats-breakdown-section mt-4">
                <h4 class="breakdown-title">Categorized Breakdown</h4>
                @if (statsBreakdown().length === 0) {
                  <p class="text-muted text-sm text-center py-4">No expenses found within this date range.</p>
                } @else {
                  <div class="breakdown-list">
                    @for (item of statsBreakdown(); track item.tagId) {
                      <div class="breakdown-row">
                        <div class="breakdown-details">
                          <span class="breakdown-tag">{{ item.tagName }}</span>
                          <span class="breakdown-amt">
                            {{ item.total | number:'1.2-2' }} MAD 
                            <span class="breakdown-pct">({{ item.percentage.toFixed(1) }}%)</span>
                          </span>
                        </div>
                        <p-progressbar [value]="item.percentage" [showValue]="false" styleClass="stats-bar" />
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .budget-dashboard-header {
      margin-bottom: 2rem;
    }
    .budget-title {
      font-size: 2rem;
      font-weight: 800;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.025em;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .budget-title i {
      color: var(--primary-color);
    }
    .budget-subtitle {
      margin: 0;
      font-size: 1rem;
    }
    .tag-form {
      margin-bottom: 1.5rem;
    }
    .input-group {
      display: flex;
      gap: 0.5rem;
    }
    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .tag-badge {
      display: inline-flex;
      align-items: center;
      background-color: var(--sidebar-hover);
      border: 1px solid var(--border-color);
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-color);
      transition: all 0.2s ease;
      gap: 0.35rem;
    }
    .tag-badge:hover {
      border-color: var(--primary-color);
    }
    .tag-badge.editing {
      border-color: var(--primary-color);
      background-color: var(--card-bg);
      padding: 0.2rem 0.5rem;
    }
    .tag-edit-input {
      border: none;
      background: transparent;
      outline: none;
      font-family: inherit;
      font-weight: 600;
      font-size: 0.875rem;
      width: 100px;
      color: var(--text-color);
    }
    .tag-action-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 0.75rem;
      padding: 0.15rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s, color 0.2s;
    }
    .tag-action-btn:hover {
      background-color: var(--border-color);
      color: var(--text-color);
    }
    .tag-action-btn.delete:hover {
      color: var(--danger-color);
    }
    .tag-action-btn.save {
      color: var(--primary-color);
    }

    .grid-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }
    @media (max-width: 576px) {
      .grid-form {
        grid-template-columns: 1fr;
      }
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }
    .form-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
    }
    .flex { display: flex; }
    .justify-end { justify-content: flex-end; }
    .gap-2 { gap: 0.5rem; }
    .mt-4 { margin-top: 1.25rem; }

    .expenses-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .expense-item-card {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      padding: 1rem;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      position: relative;
      transition: all 0.2s ease;
    }
    .expense-item-card:hover {
      border-color: var(--primary-color);
      transform: translateY(-1px);
    }
    .expense-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.35rem;
    }
    .expense-amount {
      font-weight: 700;
      font-size: 1.15rem;
      color: var(--text-color);
    }
    .expense-tag-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background-color: rgba(30, 136, 229, 0.1);
      color: var(--primary-color);
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
    }
    html.app-dark .expense-tag-label {
      background-color: rgba(96, 165, 250, 0.15);
    }
    .expense-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .expense-desc {
      font-size: 0.95rem;
      color: var(--text-color);
    }
    .expense-date {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .expense-actions {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      gap: 0.25rem;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    .expense-item-card:hover .expense-actions {
      opacity: 1;
    }
    @media (max-width: 768px) {
      .expense-actions {
        opacity: 1;
        position: static;
        transform: none;
        margin-top: 0.75rem;
        justify-content: flex-end;
      }
    }
    .expense-action-btn {
      background: none;
      border: 1px solid var(--border-color);
      cursor: pointer;
      color: var(--text-muted);
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      transition: all 0.2s;
    }
    .expense-action-btn:hover {
      background-color: var(--sidebar-hover);
      color: var(--text-color);
      border-color: var(--text-muted);
    }
    .expense-action-btn.delete:hover {
      color: var(--danger-color);
      border-color: var(--danger-color);
    }

    .stats-summary-box {
      background: linear-gradient(135deg, rgba(30, 136, 229, 0.06) 0%, rgba(96, 165, 250, 0.03) 100%);
      border: 1px solid var(--border-color);
      padding: 1.25rem;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .stats-summary-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }
    .stats-summary-val {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--primary-color);
    }
    .breakdown-title {
      font-size: 0.95rem;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 1rem;
    }
    .breakdown-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .breakdown-row {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .breakdown-details {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
    }
    .breakdown-tag {
      font-weight: 600;
    }
    .breakdown-amt {
      font-weight: 700;
    }
    .breakdown-pct {
      font-weight: 500;
      color: var(--text-muted);
      font-size: 0.8rem;
    }
    ::ng-deep .stats-bar.p-progressbar {
      height: 6px !important;
      background-color: var(--border-color) !important;
      border-radius: 3px !important;
      overflow: hidden !important;
    }
    ::ng-deep .stats-bar .p-progressbar-value {
      background-color: var(--primary-color) !important;
    }
  `]
})
export class HomeComponent {
  stateService = inject(StateService);
  private confirmationService = inject(ConfirmationService);

  // Tag Form Fields
  newTagName = '';
  editingTagId = signal<string | null>(null);
  editingTagName = '';

  // Expense Form Fields
  editingExpenseId = signal<string | null>(null);
  expenseAmount: number | null = null;
  expenseDescription = '';
  expenseTag: Tag | null = null;
  expenseDate: Date = new Date();

  // Statistics Form Fields
  statsStartDate = signal<Date | null>(null);
  statsEndDate = signal<Date | null>(null);
  statsTotal = signal<number>(0);
  statsBreakdown = signal<TagStatBreakdown[]>([]);
  statsGenerated = signal<boolean>(false);

  constructor() {
    // Reset inputs and stats automatically when active budget changes
    effect(() => {
      const active = this.stateService.activeBudget();
      this.cancelTagEdit();
      this.cancelExpenseEdit();
      this.resetStats();
      this.newTagName = '';
    });
  }

  // Tag Operations
  async addTag() {
    if (!this.newTagName.trim()) return;
    await this.stateService.addTag(this.newTagName.trim());
    this.newTagName = '';
  }

  startTagEdit(tag: Tag) {
    this.editingTagId.set(tag.id);
    this.editingTagName = tag.name;
  }

  async saveTagEdit(tag: Tag) {
    if (!this.editingTagName.trim() || this.editingTagName.trim() === tag.name) {
      this.cancelTagEdit();
      return;
    }
    await this.stateService.updateTag({
      ...tag,
      name: this.editingTagName.trim()
    });
    this.cancelTagEdit();
  }

  cancelTagEdit() {
    this.editingTagId.set(null);
    this.editingTagName = '';
  }

  confirmDeleteTag(tag: Tag) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the tag "${tag.name}"? WARNING: All associated expenses will also be permanently deleted!`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger', label: 'Delete' },
      rejectButtonProps: { severity: 'secondary', label: 'Cancel' },
      accept: async () => {
        await this.stateService.deleteTag(tag.id);
      }
    });
  }

  // Expense Operations
  isExpenseFormValid(): boolean {
    return (
      this.expenseAmount !== null &&
      this.expenseAmount > 0 &&
      this.expenseDescription.trim().length > 0 &&
      this.expenseTag !== null &&
      this.expenseDate !== null
    );
  }

  async saveExpense() {
    if (!this.isExpenseFormValid()) return;

    // Format date as YYYY-MM-DD
    const yyyy = this.expenseDate.getFullYear();
    const mm = String(this.expenseDate.getMonth() + 1).padStart(2, '0');
    const dd = String(this.expenseDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const expensePayload = {
      amount: this.expenseAmount!,
      description: this.expenseDescription.trim(),
      tagId: this.expenseTag!.id,
      date: dateStr,
    };

    const expId = this.editingExpenseId();
    if (expId) {
      // Edit mode
      const originalExpense = this.stateService.activeBudgetExpenses().find(e => e.id === expId);
      if (originalExpense) {
        await this.stateService.updateExpense({
          ...originalExpense,
          ...expensePayload
        });
      }
    } else {
      // Add mode
      await this.stateService.addExpense(expensePayload);
    }

    this.cancelExpenseEdit();
  }

  startExpenseEdit(expense: Expense) {
    this.editingExpenseId.set(expense.id);
    this.expenseAmount = expense.amount;
    this.expenseDescription = expense.description;
    
    // Find matching tag option
    const tag = this.stateService.activeBudgetTags().find(t => t.id === expense.tagId);
    this.expenseTag = tag || null;

    // Parse date YYYY-MM-DD back to local Date object
    const parts = expense.date.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      this.expenseDate = new Date(year, month, day);
    } else {
      this.expenseDate = new Date(expense.date);
    }
  }

  cancelExpenseEdit() {
    this.editingExpenseId.set(null);
    this.expenseAmount = null;
    this.expenseDescription = '';
    this.expenseTag = null;
    this.expenseDate = new Date();
  }

  confirmDeleteExpense(expense: Expense) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this expense of ${expense.amount.toFixed(2)} MAD for "${expense.description}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger', label: 'Delete' },
      rejectButtonProps: { severity: 'secondary', label: 'Cancel' },
      accept: async () => {
        await this.stateService.deleteExpense(expense.id);
      }
    });
  }

  getTagName(tagId: string): string {
    const tag = this.stateService.activeBudgetTags().find((t) => t.id === tagId);
    return tag ? tag.name : 'Uncategorized';
  }

  // Statistics Operations
  resetStats() {
    // Default stats date range to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    this.statsStartDate.set(firstDay);
    this.statsEndDate.set(now);
    
    this.statsTotal.set(0);
    this.statsBreakdown.set([]);
    this.statsGenerated.set(false);
  }

  generateStats() {
    const start = this.statsStartDate();
    const end = this.statsEndDate();
    if (!start || !end) return;

    // Normalize start/end dates for comparison (ignoring time zones or details)
    const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999).getTime();

    const budgetExpenses = this.stateService.activeBudgetExpenses();
    const filtered = budgetExpenses.filter((e) => {
      const parts = e.date.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const time = new Date(y, m, d).getTime();
        return time >= startTime && time <= endTime;
      }
      const time = new Date(e.date).getTime();
      return time >= startTime && time <= endTime;
    });

    const total = filtered.reduce((sum, e) => sum + e.amount, 0);
    this.statsTotal.set(total);

    const tagTotals: { [key: string]: number } = {};
    filtered.forEach((e) => {
      tagTotals[e.tagId] = (tagTotals[e.tagId] || 0) + e.amount;
    });

    const breakdown: TagStatBreakdown[] = Object.keys(tagTotals).map((tagId) => {
      const tag = this.stateService.activeBudgetTags().find((t) => t.id === tagId);
      const name = tag ? tag.name : 'Uncategorized';
      const amt = tagTotals[tagId];
      const pct = total > 0 ? (amt / total) * 100 : 0;
      return {
        tagId,
        tagName: name,
        total: amt,
        percentage: pct,
      };
    }).sort((a, b) => b.total - a.total);

    this.statsBreakdown.set(breakdown);
    this.statsGenerated.set(true);
  }
}
