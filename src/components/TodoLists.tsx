import { useEffect, useState } from 'react';
import { List, ListItem } from '../types/types';
import { CreateList } from './CreateList';
import { TodoListItem } from './TodoListItem';
import { TodoItems } from './TodoItems';
import { API_URL } from '../config';
import { getAuthHeaders } from '../utils/api';

interface TodoListsProps {
  userEmail: string;
}

export const TodoLists = ({ userEmail }: TodoListsProps) => {
  const [lists, setLists] = useState<List[]>([]);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);

  const fetchLists = async (email: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/lists?email=${encodeURIComponent(email)}`, {
        headers
      });
      const data = await response.json();
      setLists(data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  useEffect(() => {
    fetchLists(userEmail);
  }, [userEmail]);

  const fetchItems = async (listId: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/items?listId=${listId}`, {
        headers
      });
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  useEffect(() => {
    if (selectedList) {
      fetchItems(selectedList);
    }
  }, [selectedList]);

  const handleDeleteList = async (listId: string) => {
    try {
      const headers = await getAuthHeaders();
      await fetch(`${API_URL}/lists`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
          email: userEmail,
          listId: listId
        })
      });
      
      if (selectedList === listId) {
        setSelectedList(null);
        setItems([]);
      }
      
      fetchLists(userEmail);
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  return (
    <div className="space-y-6">
      <CreateList userEmail={userEmail} onListCreated={() => fetchLists(userEmail)} />

      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        <div className="w-full md:w-1/3">
          <h2 className="text-xl font-bold mb-4">Your Lists</h2>

          <ul className="space-y-2">
            {(lists || []).map((list: List) => (
              <TodoListItem
                key={list.listId}
                list={list}
                isSelected={selectedList === list.listId}
                onSelect={setSelectedList}
                onDelete={handleDeleteList}
              />
            ))}
          </ul>
        </div>

        {selectedList && (
          <div className="w-full md:w-2/3">
            <TodoItems
              items={items}
              selectedList={selectedList}
              onItemsChange={() => fetchItems(selectedList)}
            />
          </div>
        )}
      </div>
    </div>
  );
}; 