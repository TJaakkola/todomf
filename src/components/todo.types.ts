export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export interface List {
  listId: string;
  name: string;
  email: string;
}

export interface ListItem {
  itemId: string;
  text: string;
  completed: boolean;
  listId: string;
}