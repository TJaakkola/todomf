import { List } from '../types/types';

interface TodoListItemProps {
  list: List;
  isSelected: boolean;
  onSelect: (listId: string) => void;
  onDelete: (listId: string) => void;
}

export const TodoListItem = ({ list, isSelected, onSelect, onDelete }: TodoListItemProps) => {
  return (
    <li
      className={`p-2 flex justify-between items-center rounded ${
        isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'
      }`}
    >
      <span 
        className="cursor-pointer flex-grow"
        onClick={() => onSelect(list.listId)}
      >
        {list.name}
      </span>
      <button
        onClick={() => onDelete(list.listId)}
        className="text-red-500 hover:text-red-700 ml-2"
      >
        Delete
      </button>
    </li>
  );
}; 