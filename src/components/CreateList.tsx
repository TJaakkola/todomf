import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { API_URL } from '../config';
import { getAuthHeaders } from '../utils/api';

interface CreateListProps {
  userEmail: string;
  onListCreated: () => void;
}

export const CreateList = ({ userEmail, onListCreated }: CreateListProps) => {
  const [listName, setListName] = useState('');
  const [sharedEmails, setSharedEmails] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const listId = uuidv4();
      const headers = await getAuthHeaders();
      // Create list owner association

      await fetch(`${API_URL}/lists`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: userEmail,
          listId,
          name: listName
        })
      });

      // Create shared user associations
      const emails = sharedEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email && email !== userEmail);

      await Promise.all(
        emails.map(email =>
          fetch(`${API_URL}/lists`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              email,
              listId,
              name: listName
            })
          })
        )
      );

      setListName('');
      setSharedEmails('');
      onListCreated();
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          List Name
        </label>
        <input
          type="text"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Share with (comma-separated emails)
        </label>
        <input
          type="text"
          value={sharedEmails}
          onChange={(e) => setSharedEmails(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="email1@example.com, email2@example.com"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isLoading ? 'Creating...' : 'Create List'}
      </button>
    </form>
  );
}; 