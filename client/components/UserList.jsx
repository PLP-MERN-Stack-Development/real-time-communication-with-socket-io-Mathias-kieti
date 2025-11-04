import React from 'react';

export default function UserList({ users = [], onPrivate }) {
  return (
    <div className="user-list mb-4">
      <h5 className="font-semibold mb-2">Users ({users.length})</h5>
      <ul className="space-y-1">
        {users.map((u) => (
          <li key={u.id} className="flex justify-between items-center bg-gray-800 p-2 rounded-md">
            <span>{u.username}</span>
            <button
              onClick={() => onPrivate(u.id)}
              className="text-sm py-1 px-2 bg-teal-500 hover:bg-teal-600 rounded-md text-gray-900"
            >
              PM
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
