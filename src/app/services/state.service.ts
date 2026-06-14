import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DbService } from './db.service';
import { Budget, Tag, Expense } from '../models/types';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private dbService = inject(DbService);
  private router = inject(Router);

  // Raw lists (signals)
  private budgetsList = signal<Budget[]>([]);
  private tagsList = signal<Tag[]>([]);
  private expensesList = signal<Expense[]>([]);

  // Selection states (signals)
  private activeBudgetId = signal<string | null>(null);

  // Dark mode state
  darkMode = signal<boolean>(false);

  // Public computed properties
  budgets = computed(() => this.budgetsList());
  
  activeBudget = computed(() => {
    const activeId = this.activeBudgetId();
    return this.budgetsList().find((b) => b.id === activeId) || null;
  });

  activeBudgetTags = computed(() => {
    const activeId = this.activeBudgetId();
    if (!activeId) return [];
    return this.tagsList()
      .filter((t) => t.budgetId === activeId)
      .sort((a, b) => b.createdAt - a.createdAt);
  });

  activeBudgetExpenses = computed(() => {
    const activeId = this.activeBudgetId();
    if (!activeId) return [];
    return this.expensesList()
      .filter((e) => e.budgetId === activeId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt);
  });

  constructor() {
    this.init();
    this.initDarkMode();
  }

  private async init() {
    try {
      const budgets = await this.dbService.getBudgets();
      this.budgetsList.set(budgets);

      const tags = await this.dbService.getTags();
      this.tagsList.set(tags);

      const expenses = await this.dbService.getExpenses();
      this.expensesList.set(expenses);

      // Restore active budget from localStorage
      const storedActiveId = localStorage.getItem('masroufy_active_budget_id');
      if (storedActiveId && budgets.some((b) => b.id === storedActiveId)) {
        this.activeBudgetId.set(storedActiveId);
      } else if (budgets.length > 0) {
        this.selectBudget(budgets[0].id);
      }
    } catch (e) {
      console.error('Error loading initial state from IndexedDB:', e);
    }
  }

  private initDarkMode() {
    const storedDarkMode = localStorage.getItem('masroufy_dark_mode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = storedDarkMode === 'true' || (!storedDarkMode && systemPrefersDark);
    this.setDarkMode(isDark);
  }

  setDarkMode(isDark: boolean) {
    this.darkMode.set(isDark);
    localStorage.setItem('masroufy_dark_mode', String(isDark));
    const htmlEl = document.querySelector('html');
    if (htmlEl) {
      if (isDark) {
        htmlEl.classList.add('app-dark');
      } else {
        htmlEl.classList.remove('app-dark');
      }
    }
  }

  toggleDarkMode() {
    this.setDarkMode(!this.darkMode());
  }

  selectBudget(id: string | null) {
    this.activeBudgetId.set(id);
    if (id) {
      localStorage.setItem('masroufy_active_budget_id', id);
      // Navigate back to Home if the user is currently on another page (e.g. About)
      if (this.router.url !== '/') {
        this.router.navigate(['/']);
      }
    } else {
      localStorage.removeItem('masroufy_active_budget_id');
    }
  }

  // Budget Operations
  async addBudget(name: string) {
    const id = crypto.randomUUID();
    const newBudget: Budget = {
      id,
      name,
      createdAt: Date.now(),
    };
    await this.dbService.saveBudget(newBudget);
    this.budgetsList.update((list) => [...list, newBudget]);
    this.selectBudget(id);
  }

  async deleteBudget(id: string) {
    await this.dbService.deleteBudget(id);
    
    // Update local signals
    this.budgetsList.update((list) => list.filter((b) => b.id !== id));
    this.tagsList.update((list) => list.filter((t) => t.budgetId !== id));
    this.expensesList.update((list) => list.filter((e) => e.budgetId !== id));

    // Reset or update selected budget
    if (this.activeBudgetId() === id) {
      const remaining = this.budgetsList();
      if (remaining.length > 0) {
        this.selectBudget(remaining[0].id);
      } else {
        this.selectBudget(null);
      }
    }
  }

  // Tag Operations
  async addTag(name: string) {
    const budgetId = this.activeBudgetId();
    if (!budgetId) return;
    const id = crypto.randomUUID();
    const newTag: Tag = {
      id,
      budgetId,
      name,
      createdAt: Date.now(),
    };
    await this.dbService.saveTag(newTag);
    this.tagsList.update((list) => [...list, newTag]);
  }

  async updateTag(tag: Tag) {
    await this.dbService.saveTag(tag);
    this.tagsList.update((list) => list.map((t) => (t.id === tag.id ? tag : t)));
  }

  async deleteTag(tagId: string) {
    const budgetId = this.activeBudgetId();
    if (!budgetId) return;
    await this.dbService.deleteTag(tagId, budgetId);

    // Update state lists in memory
    this.tagsList.update((list) => list.filter((t) => t.id !== tagId));
    this.expensesList.update((list) =>
      list.filter((e) => !(e.tagId === tagId && e.budgetId === budgetId))
    );
  }

  // Expense Operations
  async addExpense(expenseData: Omit<Expense, 'id' | 'budgetId' | 'createdAt'>) {
    const budgetId = this.activeBudgetId();
    if (!budgetId) return;
    const id = crypto.randomUUID();
    const newExpense: Expense = {
      ...expenseData,
      id,
      budgetId,
      createdAt: Date.now(),
    };
    await this.dbService.saveExpense(newExpense);
    this.expensesList.update((list) => [...list, newExpense]);
  }

  async updateExpense(expense: Expense) {
    await this.dbService.saveExpense(expense);
    this.expensesList.update((list) => list.map((e) => (e.id === expense.id ? expense : e)));
  }

  async deleteExpense(id: string) {
    await this.dbService.deleteExpense(id);
    this.expensesList.update((list) => list.filter((e) => e.id !== id));
  }

  exportData() {
    return this.dbService.exportData();
  }
}
