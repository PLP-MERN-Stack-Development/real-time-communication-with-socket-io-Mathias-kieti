import React from 'react';

export default function UserList({ users = [], onPrivate }) {
  return (
    <div className="user-list">
      <h5>Users ({users.length})</h5>
      <ul>
        {users.map(u => (
          <li key={u.id}>
            <span>{u.username}</span>
            <button onClick={() => onPrivate(u.id)}>PM</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
