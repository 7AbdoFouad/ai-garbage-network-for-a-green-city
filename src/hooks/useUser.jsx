import { useEffect, useState } from "react";
import axios from "axios";

const useUser = () => {
  const [users, setUsers] = useState([]);
  const [managers, setmanagers] = useState([]);
  const [truckDrivers, settruckDrivers] = useState([]);
  // const [user, setUse
  // r] = useState({});

  //========================== Users =================================
  // Register[add] a new user
  const registerUser = async (values) => {
    //in project ,this only used  from Users
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

  //======================= managers ===================================
  // Add a manager
  const addManager = async (values) => {
    const res = await axios.post(`http://localhost:3000/managers`, values);
    // console.log(res.data);

    setmanagers([...managers, res.data]); // Assuming the server returns the created todo object
    return res.data;
  };

  // Fetch a single manager
  const fetchManager = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/managers/${id}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  // Delete a manager
  const deleteManager = async (id) => {
    await axios.delete(`http://localhost:3000/managers/${id}`);
    setmanagers(managers.filter((todo) => todo.id !== id));
  };

  // Update a manager
  const updateManager = async (id, values) => {
    const res = await axios.put(`http://localhost:3000/managers/${id}`, values);
    setmanagers(managers.map((todo) => (todo.id === id ? res.data : todo)));
    return res.data;
  };
  //======================= truckDrivers ===================================
  // Add a truckDriver
  const addTruckDriver = async (values) => {
    const res = await axios.post(`http://localhost:3000/Truckdrivers`, values);
    settruckDrivers([...truckDrivers, res.data]); // Assuming the server returns the created todo object
    return res.data;
  };
  // Fetch a single truckDriver
  const fetchTruckDriver = async (id) => {
    try {
      const { data } = await axios.get(
        `http://localhost:3000/Truckdrivers/${id}`
      );
      return data;
    } catch (error) {
      console.error(error);
    }
  };
  // Delete a truckDriver
  const deleteTruckDriver = async (id) => {
    await axios.delete(`http://localhost:3000/Truckdrivers/${id}`);
    settruckDrivers(truckDrivers.filter((todo) => todo.id !== id));
  };
  // Update a truckDriver
  const updateTruckDriver = async (id, values) => {
    const res = await axios.put(
      `http://localhost:3000/Truckdrivers/${id}`,
      values
    );
    settruckDrivers(
      truckDrivers.map((todo) => (todo.id === id ? res.data : todo))
    );
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
    const fetchmanagers = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/managers");
        setmanagers(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchmanagers();
  }, []);

  useEffect(() => {
    const fetchtruckDrivers = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/Truckdrivers");
        settruckDrivers(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchtruckDrivers();
  }, []);

  return {
    users,
    managers,
    truckDrivers,
    registerUser,
    deleteUser,
    fetchUser,
    updateUser,
    addManager,
    deleteManager,
    fetchManager,
    updateManager,
    addTruckDriver,
    deleteTruckDriver,
    fetchTruckDriver,
    updateTruckDriver,
  };
};

export default useUser;
