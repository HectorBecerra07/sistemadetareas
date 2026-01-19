// server/data.js

let users = [
  { id: 1, name: 'Alice', email: 'alice@mail.com', password: '123456', role: 'admin' },
  { id: 2, name: 'Bob',   email: 'bob@mail.com',   password: '123456', role: 'user' },
  { id: 3, name: 'Charlie', email: 'charlie@mail.com', password: '123456', role: 'user' },
  { id: 4, name: 'David', email: 'david@mail.com', password: '123456', role: 'user' },
  { id: 5, name: 'Eve',   email: 'eve@mail.com',   password: '123456', role: 'user' },
];

let tasks = [
  {
    id: 1,
    title: 'Tarea de ejemplo para Alice',
    dueDate: new Date().toISOString(),
    completed: false,
    userId: 1,
  },
  {
    id: 2,
    title: 'Tarea de ejemplo para Bob',
    dueDate: new Date().toISOString(),
    completed: true,
    userId: 2,
  },
];

let messages = [
  {
    id: 1,
    from: 1,
    to: 2,
    text: 'Hola Bob 👋',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    from: 2,
    to: 1,
    text: 'Hola Alice, ¿todo bien?',
    createdAt: new Date().toISOString(),
  },
];

export {
  users,
  tasks,
  messages,
};
