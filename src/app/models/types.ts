export interface Budget {
  id: string;
  name: string;
  createdAt: number;
}

export interface Tag {
  id: string;
  budgetId: string;
  name: string;
  createdAt: number;
}

export interface Expense {
  id: string;
  budgetId: string;
  amount: number;
  description: string;
  tagId: string; // Foreign key referencing Tag.id
  date: string; // Stored as "YYYY-MM-DD"
  createdAt: number;
}
