import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3001/api/todos')
      .then((res) => setTodos(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleAddTodo = async () => {
    try {
      const res = await axios.post('http://localhost:3001/api/todos', { title: newTodo, completed: false });
      setTodos([...todos, res.data]);
      setNewTodo('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCompleted = async (id) => {
    try {
      const res = await axios.put(`http://localhost:3001/api/todos/${id}`, { completed: !todos.find((todo) => todo._id === id).completed });
      setTodos(todos.map((todo) => (todo._id === id ? res.data : todo)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/todos/${id}`);
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Todo App</h1>
      <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} />
      <button onClick={handleAddTodo}>Add Todo</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo._id}>
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>{todo.title}</span>
            <button onClick={() => handleToggleCompleted(todo._id)}>Toggle Completed</button>
            <button onClick={() => handleDeleteTodo(todo._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;