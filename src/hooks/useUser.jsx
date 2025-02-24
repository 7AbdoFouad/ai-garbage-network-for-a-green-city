import { useEffect, useState } from "react";
import axios from "axios";

const useUser = () => {
  const [users, setUsers] = useState([]);
  const [managers, setmanagers] = useState([]);
  const [truckDrivers, settruckDrivers] = useState([]);
  const [contactUs, setContactUs] = useState([]);
  const [bins, setBins] = useState([]);
  const [usersAnnouncements, setUsersAnnouncements] = useState([]);
  const [regions, setRegions] = useState([]);
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
  // --------------------------- Contact Us --------------------------------------
  // Add a Contact Us
 const addContactUs = async (values) => {
    const res = await axios.post("http://localhost:3000/ContactUs", values);
    setContactUs([...contactUs, res.data]); // Assuming the server returns the created user object
    return res.data;
  }
  // Delete a Contact Us
  const deleteContactUs = async (id) => {
    await axios.delete(`http://localhost:3000/ContactUs/${id}`);
    setContactUs(contactUs.filter((contact) => contact.id !== id));
  };
  // Fetch a single Contact Us  
  const fetchContactUs = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/ContactUs/${id}`);    
      return data;
    } catch (error) {
      console.error(error);
    }
  };
  // Update a Contact Us
  const updateContactUs = async (id, values) => {
    const res = await axios.put(`http://localhost:3000/ContactUs/${id}`, values);
    setContactUs(contactUs.map((contact) => (contact.id === id ? res.data : contact)));
    return res.data;
  };
  // --------------------------- Bins --------------------------------------
// Add a Bin
const addBin = async (values) => {
  const res = await axios.post("http://localhost:3000/bins", values);
  setBins([...bins, res.data]); // Assuming the server returns the created user object
  return res.data;
}
// Delete a Bin
const deleteBin = async (id) => {
  await axios.delete(`http://localhost:3000/bins/${id}`);
  setBins(bins.filter((bin) => bin.id !== id));
};
// Fetch a single Bin  
const fetchBin = async (id) => {
  try {
    const { data } = await axios.get(`http://localhost:3000/bins/${id}`);    
    return data;
  } catch (error) {
    console.error(error);
  }
};
// Update a Bin
const updateBin = async (id, values) => {
  const res = await axios.put(`http://localhost:3000/bins/${id}`, values);
  setBins(bins.map((bin) => (bin.id === id ? res.data : bin)));
  return res.data;
};
// --------------------------- UsersAnnouncements --------------------------------------
// Add a UsersAnnouncement
const addUsersAnnouncements = async (values) => {
  const res = await axios.post("http://localhost:3000/UsersAnnouncements", values);
  setUsersAnnouncements([...usersAnnouncements, res.data]); // Assuming the server returns the created user object
  return res.data;
} 
// Delete a UsersAnnouncement
const deleteUsersAnnouncements = async (id) => {
  await axios.delete(`http://localhost:3000/UsersAnnouncements/${id}`);
  setUsersAnnouncements(usersAnnouncements.filter((UsersAnnouncement) => UsersAnnouncement.id !== id));
};
// Fetch a single UsersAnnouncement  
const fetchUsersAnnouncements = async (id) => {
  try {
    const { data } = await axios.get(`http://localhost:3000/UsersAnnouncements/${id}`);    
    return data;
  } catch (error) {
    console.error(error);
  }
};
// Update a UsersAnnouncement
const updateUsersAnnouncements = async (id, values) => {
  const res = await axios.put(`http://localhost:3000/UsersAnnouncements/${id}`, values);
  setUsersAnnouncements(usersAnnouncements.map((UsersAnnouncement) => (UsersAnnouncement.id === id ? res.data : UsersAnnouncement)));
  return res.data;
};  
// --------------------------- regions --------------------------------------
// Add a region
const addRegion = async (values) => {
  const res = await axios.post("http://localhost:3000/regions", values);
  setRegions([...regions, res.data]); // Assuming the server returns the created user object
  return res.data;
}
// Delete a region
const deleteRegion = async (id) => {
  await axios.delete(`http://localhost:3000/regions/${id}`);
  setRegions(regions.filter((region) => region.id !== id));
};
// Fetch a single region  
const fetchRegion = async (id) => {
  try {
    const { data } = await axios.get(`http://localhost:3000/regions/${id}`);    
    return data;
  } catch (error) {
    console.error(error);
  }
};
// Update a region
const updateRegion = async (id, values) => {
  const res = await axios.put(`http://localhost:3000/regions/${id}`, values);
  setRegions(regions.map((region) => (region.id === id ? res.data : region)));
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
    const fetchmanagers = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/managers");
        setmanagers(data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchtruckDrivers = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/Truckdrivers");
        settruckDrivers(data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchContactUs = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/ContactUs");
        setContactUs(data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchBins = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/bins");
        setBins(data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchUsersAnnouncements = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/UsersAnnouncements");
        setUsersAnnouncements(data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchRegions = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/regions");
        setRegions(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();fetchmanagers();fetchtruckDrivers();fetchContactUs();fetchBins();fetchUsersAnnouncements();
    fetchRegions(); 
  }, []);



  return {
    users,
    managers,
    truckDrivers,
    contactUs,
    bins,
    usersAnnouncements,
    regions,
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
    addContactUs,
    deleteContactUs,
    fetchContactUs,
    updateContactUs,
    addBin,
    deleteBin,
    fetchBin,
    updateBin,
    addUsersAnnouncements,
    deleteUsersAnnouncements,
    fetchUsersAnnouncements,
    updateUsersAnnouncements,
    addRegion,
    deleteRegion,
    fetchRegion,
    updateRegion

  };
};

export default useUser;
