import { useEffect, useState } from "react";
import axios from "axios";

const useUser = () => {
  const [users, setUsers] = useState([]);
  const [todos, setTodos] = useState([]);
  // const [user, setUser] = useState({});

  //========================== Users =================================
  // Register[add] a new user
  const registerUser = async (values) => { //in project ,this only used  from Users 
    const res = await axios.post("http://localhost:3000/users", values);
    setUsers([...users, res.data]); // Assuming the server returns the created user object
    return res.data;
  };

  // Delete a user
  const deleteUser = async (id) => {
    await axios.delete(`http://localhost:3000/users/${id}`);
    setUsers(users.filter((user) => user.id !== id));
  };

  // Fetch a single user
  const fetchUser = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/users/${id}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  // Update a user
  const updateUser = async (id, values) => {
    const res = await axios.put(`http://localhost:3000/users/${id}`, values);
    setUsers(users.map((user) => (user.id === id ? res.data : user)));
    return res.data;
  };

  //======================= Todos ===================================
  // Add a todo
  const addTodo = async (values) => {
    const res = await axios.post(`http://localhost:3000/todos`, values);
    // console.log(res.data);
    
    setTodos([...todos, res.data]); // Assuming the server returns the created todo object
    return res.data;
  };

  // Fetch a single todo
  const fetchTodo = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/todos/${id}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  // Delete a todo
  const deleteTodo = async (id) => {
    await axios.delete(`http://localhost:3000/todos/${id}`);
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Update a todo
  const updateTodo = async (id, values) => {
    const res = await axios.put(`http://localhost:3000/todos/${id}`, values);
    setTodos(todos.map((todo) => (todo.id === id ? res.data : todo)));
    return res.data;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/users");
        setUsers(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/todos");
        setTodos(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTodos();
  }, []);

  return { users, todos, registerUser, deleteUser, fetchTodo, fetchUser, updateUser, addTodo, deleteTodo, updateTodo };
};

export default useUser;
