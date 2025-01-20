import React, { useState } from 'react';
import { ListItem } from '../types/types';
import { API_URL } from '../config';
import { getAuthHeaders } from '../utils/api';

interface TodoItemsProps {
  items: ListItem[];
  selectedList: string;
  onItemsChange: () => void;
}

export const TodoItems = ({ items, selectedList, onItemsChange }: TodoItemsProps) => {
  const [newItemName, setNewItemName] = useState('');

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      const headers = await getAuthHeaders();
      await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          listId: selectedList,
          itemName: newItemName.trim()
        })
      });
      setNewItemName('');
      onItemsChange();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const headers = await getAuthHeaders();
      await fetch(`${API_URL}/items`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
          listId: selectedList,
          itemId: itemId
        })
      });
      onItemsChange();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="w-2/3">
      <h2 className="text-xl font-bold mb-4">Items</h2>
      
      <form onSubmit={handleAddItem} className="mb-4 flex space-x-2">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="flex-1 rounded-md border-gray-300 shadow-sm"
          placeholder="New item name"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Item
        </button>
      </form>

      <ul className="space-y-2">
        {items && items.length > 0 && items.map((item) => (
          <li
            key={item.itemId}
            className="flex justify-between items-center p-2 hover:bg-gray-50"
          >
            <span>{item.itemName}</span>
            <button
              onClick={() => handleDeleteItem(item.itemId)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}; 