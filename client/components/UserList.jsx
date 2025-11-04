import React from 'react';

export default function UserList({ users = [], onPrivate }) {
  return (
    <div className="mb-4">
      <h5 className="font-semibold mb-2">Users ({users.length})</h5>
      <ul className="flex flex-col gap-2">
        {users.map((u) => (
          <li key={u.id} className="flex justify-between items-center p-1 bg-gray-700 rounded">
            <span>{u.username}</span>
            <button
              className="bg-teal-400 hover:bg-teal-500 text-gray-900 font-bold px-2 py-1 rounded text-xs"
              onClick={() => onPrivate(u.id)}
            >
              PM
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
