import { Injectable } from '@angular/core';
import { Budget, Tag, Expense } from '../models/types';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private dbName = 'masroufy_db';
  private dbVersion = 1;
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDb();
  }

  private initDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('budgets')) {
          db.createObjectStore('budgets', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('tags')) {
          db.createObjectStore('tags', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('expenses')) {
          db.createObjectStore('expenses', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: Event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event: Event) => {
        console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  // Budgets CRUD
  async getBudgets(): Promise<Budget[]> {
    const db = await this.dbPromise;
    return this.getAll<Budget>(db, 'budgets');
  }

  async saveBudget(budget: Budget): Promise<void> {
    const db = await this.dbPromise;
    await this.put(db, 'budgets', budget);
  }

  async deleteBudget(id: string): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(['budgets', 'tags', 'expenses'], 'readwrite');

    // 1. Delete Budget
    tx.objectStore('budgets').delete(id);

    // 2. Cascade delete all tags associated with this budget
    const tagsStore = tx.objectStore('tags');
    const tagsReq = tagsStore.getAll();
    tagsReq.onsuccess = () => {
      const allTags = tagsReq.result as Tag[];
      const budgetTags = allTags.filter((t) => t.budgetId === id);
      budgetTags.forEach((t) => tagsStore.delete(t.id));
    };

    // 3. Cascade delete all expenses associated with this budget
    const expensesStore = tx.objectStore('expenses');
    const expensesReq = expensesStore.getAll();
    expensesReq.onsuccess = () => {
      const allExpenses = expensesReq.result as Expense[];
      const budgetExpenses = allExpenses.filter((e) => e.budgetId === id);
      budgetExpenses.forEach((e) => expensesStore.delete(e.id));
    };

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Tags CRUD
  async getTags(): Promise<Tag[]> {
    const db = await this.dbPromise;
    return this.getAll<Tag>(db, 'tags');
  }

  async saveTag(tag: Tag): Promise<void> {
    const db = await this.dbPromise;
    await this.put(db, 'tags', tag);
  }

  async deleteTag(tagId: string, budgetId: string): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(['tags', 'expenses'], 'readwrite');

    // 1. Delete the tag
    tx.objectStore('tags').delete(tagId);

    // 2. Cascade delete all expenses associated with this tag in this budget
    const expensesStore = tx.objectStore('expenses');
    const expensesReq = expensesStore.getAll();
    expensesReq.onsuccess = () => {
      const allExpenses = expensesReq.result as Expense[];
      const associatedExpenses = allExpenses.filter(
        (e) => e.tagId === tagId && e.budgetId === budgetId
      );
      associatedExpenses.forEach((e) => expensesStore.delete(e.id));
    };

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Expenses CRUD
  async getExpenses(): Promise<Expense[]> {
    const db = await this.dbPromise;
    return this.getAll<Expense>(db, 'expenses');
  }

  async saveExpense(expense: Expense): Promise<void> {
    const db = await this.dbPromise;
    await this.put(db, 'expenses', expense);
  }

  async deleteExpense(id: string): Promise<void> {
    const db = await this.dbPromise;
    await this.delete(db, 'expenses', id);
  }

  // Database helper methods
  private getAll<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private put<T>(db: IDBDatabase, storeName: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(value);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private delete(db: IDBDatabase, storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
