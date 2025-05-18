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
  const [CommunityActivities, setCommunityActivities] = useState([]);
  const [SubscribersOfCommunityActivities, setSubscribersOfCommunityActivities] = useState([]);
  const [Polls, setPolls] = useState([]);
  const [SubscribersOfPolls, setSubscribersOfPolls] = useState([]);
  const [Rewards, setRewards] = useState([]);
  const [UsersSignedUpForRewards, setUsersSignedUpForRewards] = useState([]);
  const [UserNotifications, setUserNotifications] = useState([]);
  const [PublicNotifications, setPublicNotifications] = useState([]);
  const [UserNotificationsMarkedPublic, setUserNotificationsMarkedPublic] = useState([]);
  const [DrivierNotifications, setDrivierNotifications] = useState([]);
  const [managerNotifications, setManagerNotifications] = useState([]);
  const [Acceptted_Users_And_SpecialOrder,setAcceptted_Users_And_SpecialOrder] = useState([]);
  const [Available_UsersAnnouncements_Tasks, setAvailable_UsersAnnouncements_Tasks] = useState([]);
  
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
  };
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
    const res = await axios.put(
      `http://localhost:3000/ContactUs/${id}`,
      values
    );
    setContactUs(
      contactUs.map((contact) => (contact.id === id ? res.data : contact))
    );
    return res.data;
  };
  // --------------------------- Bins --------------------------------------
  // Add a Bin
  const addBin = async (values) => {
    const res = await axios.post("http://localhost:3000/bins", values);
    setBins([...bins, res.data]); // Assuming the server returns the created user object
    return res.data;
  };
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
    const res = await axios.post(
      "http://localhost:3000/UsersAnnouncements",
      values
    );
    setUsersAnnouncements([...usersAnnouncements, res.data]); // Assuming the server returns the created user object
    return res.data;
  };
  // Delete a UsersAnnouncement
  const deleteUsersAnnouncements = async (id) => {
    await axios.delete(`http://localhost:3000/UsersAnnouncements/${id}`);
    setUsersAnnouncements(
      usersAnnouncements.filter(
        (UsersAnnouncement) => UsersAnnouncement.id !== id
      )
    );
  };
  // Fetch a single UsersAnnouncement
  const fetchUsersAnnouncements = async (id) => {
    try {
      const { data } = await axios.get(
        `http://localhost:3000/UsersAnnouncements/${id}`
      );
      return data;
    } catch (error) {
      console.error(error);
    }
  };
  // Update a UsersAnnouncement
  const updateUsersAnnouncements = async (id, values) => {
    const res = await axios.put(
      `http://localhost:3000/UsersAnnouncements/${id}`,
      values
    );
    setUsersAnnouncements(
      usersAnnouncements.map((UsersAnnouncement) =>
        UsersAnnouncement.id === id ? res.data : UsersAnnouncement
      )
    );
    return res.data;
  };
  // --------------------------- regions --------------------------------------
  // Add a region
  const addRegion = async (values) => {
    const res = await axios.post("http://localhost:3000/regions", values);
    setRegions([...regions, res.data]); // Assuming the server returns the created user object
    return res.data;
  };
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
  // --------------------------- CommunityActivities --------------------------------------
  // Add a CommunityActivity
  const addCommunityActivity = async (values) => {
    const res = await axios.post(
      "http://localhost:3000/CommunityActivities",
      values
    );
    setCommunityActivities([...CommunityActivities, res.data]); // Assuming the server returns the created user object
    return res.data;
  };
  // Delete a CommunityActivity
  const deleteCommunityActivity = async (id) => {
    await axios.delete(`http://localhost:3000/CommunityActivities/${id}`);
    setCommunityActivities(
      CommunityActivities.filter(
        (CommunityActivity) => CommunityActivity.id !== id
      )
    );
  };
  // Fetch a single CommunityActivity
  const fetchCommunityActivity = async (id) => {
    try {
      const { data } = await axios.get(
        `http://localhost:3000/CommunityActivities/${id}`
      );
      return data;
    } catch (error) {
      console.error(error);
    }
  };
  // Update a CommunityActivity
  const updateCommunityActivity = async (id, values) => {
    const res = await axios.put(
      `http://localhost:3000/CommunityActivities/${id}`,
      values
    );
    setCommunityActivities(
      CommunityActivities.map((CommunityActivity) =>
        CommunityActivity.id === id ? res.data : CommunityActivity
      )
    );
    return res.data;
  };
  // --------------------------- SubscribersOfCommunityActivities --------------------------------------
  // Add a SubscribersOfCommunityActivity
  const addSubscribersOfCommunityActivity = async (values) => {
    const res = await axios.post(
      "http://localhost:3000/SubscribersOfCommunityActivities",
      values
    );
    setSubscribersOfCommunityActivities([
      ...SubscribersOfCommunityActivities,
      res.data,
    ]); // Assuming the server returns the created user object
    return res.data;
  }
  // Delete a SubscribersOfCommunityActivity
  const deleteSubscribersOfCommunityActivity = async (id) => {
    await axios.delete(`http://localhost:3000/SubscribersOfCommunityActivities/${id}`); 
    // setSubscribersOfCommunityActivities(SubscribersOfCommunityActivities.filter((SubscribersOfCommunityActivity) => SubscribersOfCommunityActivity.id !== id));
    setSubscribersOfCommunityActivities((prev) => prev.filter((sub) => sub.id !== id));

  }
  // Fetch a single SubscribersOfCommunityActivity
  const fetchSubscribersOfCommunityActivity = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/SubscribersOfCommunityActivities/${id}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  }
  // Update a SubscribersOfCommunityActivity
  const updateSubscribersOfCommunityActivity = async (id, values) => {
    const res = await axios.put(`http://localhost:3000/SubscribersOfCommunityActivities/${id}`, values);
    setSubscribersOfCommunityActivities(SubscribersOfCommunityActivities.map((SubscribersOfCommunityActivity) => SubscribersOfCommunityActivity.id === id ? res.data : SubscribersOfCommunityActivity));
    return res.data;
  }
  // --------------------------- Polls --------------------------------------
  // Add a Poll
  const addPoll = async (values) => {
    const res = await axios.post("http://localhost:3000/Polls", values);
    setPolls([...Polls, res.data]); // Assuming the server returns the created user object
    return res.data;
  }
  // Delete a Poll
  const deletePoll = async (id) => {
    await axios.delete(`http://localhost:3000/Polls/${id}`);
    setPolls(Polls.filter((Poll) => Poll.id !== id));
  }
  // Fetch a single Poll
  const fetchPoll = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/Polls/${id}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  }
  // Update a Poll
  const updatePoll = async (id, values) => {
    const res = await axios.put(`http://localhost:3000/Polls/${id}`, values);
    setPolls(Polls.map((Poll) => Poll.id === id ? res.data : Poll));
    return res.data;
  }
  // --------------------------- SubscribersOfPolls --------------------------------------
  // Add a SubscribersOfPoll
  const addSubscribersOfPoll = async (values) => {
    const res = await axios.post("http://localhost:3000/SubscribersOfPolls", values);
    setSubscribersOfPolls([...SubscribersOfPolls, res.data]); // Assuming the server returns the created user object
    return res.data;
  }
  // Delete a SubscribersOfPoll
  const deleteSubscribersOfPoll = async (id) => {
    await axios.delete(`http://localhost:3000/SubscribersOfPolls/${id}`);
    setSubscribersOfPolls(SubscribersOfPolls.filter((SubscribersOfPoll) => SubscribersOfPoll.id !== id));
  }
  // Fetch a single SubscribersOfPoll
  const fetchSubscribersOfPoll = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/SubscribersOfPolls/${id}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  }
  // Update a SubscribersOfPoll
  const updateSubscribersOfPoll = async (id, values) => {
    const res = await axios.put(`http://localhost:3000/SubscribersOfPolls/${id}`, values);
    setSubscribersOfPolls(SubscribersOfPolls.map((SubscribersOfPoll) => SubscribersOfPoll.id === id ? res.data : SubscribersOfPoll));
    return res.data;
  }
  // --------------------------- Rewards --------------------------------------
  // Add a Reward
  const addReward = async (values) => {
    const res = await axios.post("http://localhost:3000/Rewards", values);
    setRewards([...Rewards, res.data]); // Assuming the server returns the created user object
    return res.data;
  }
  // Delete a Reward
  const deleteReward = async (id) => {
    await axios.delete(`http://localhost:3000/Rewards/${id}`);
    setRewards(Rewards.filter((Reward) => Reward.id !== id));
  }
  // Fetch a single Reward
  const fetchReward = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/Rewards/${id}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  }
  // Update a Reward
  const updateReward = async (id, values) => {
    const res = await axios.put(`http://localhost:3000/Rewards/${id}`, values);
    setRewards(Rewards.map((Reward) => Reward.id === id ? res.data : Reward));
    return res.data;
  }
  // --------------------------- UsersSignedUpForRewards --------------------------------------
  // Add a UsersSignedUpForReward
  const addUsersSignedUpForReward = async (values) => {
    const res = await axios.post("http://localhost:3000/UsersSignedUpForRewards", values);
    setUsersSignedUpForRewards([...UsersSignedUpForRewards, res.data]); // Assuming the server returns the created user object
    return res.data;
  }
  // Delete a UsersSignedUpForReward
  const deleteUsersSignedUpForReward = async (id) => {
    await axios.delete(`http://localhost:3000/UsersSignedUpForRewards/${id}`);
    setUsersSignedUpForRewards(UsersSignedUpForRewards.filter((UsersSignedUpForReward) => UsersSignedUpForReward.id !== id));
  }
  // Fetch a single UsersSignedUpForReward
  const fetchUsersSignedUpForReward = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/UsersSignedUpForRewards/${id}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  }
  // Update a UsersSignedUpForReward
  const updateUsersSignedUpForReward = async (id, values) => {
    const res = await axios.put(`http://localhost:3000/UsersSignedUpForRewards/${id}`, values);
    setUsersSignedUpForRewards(UsersSignedUpForRewards.map((UsersSignedUpForReward) => UsersSignedUpForReward.id === id ? res.data : UsersSignedUpForReward));
    return res.data;
  }
  // ____________________________ UserNotifications --------------------------------------
  // Add a UserNotification
  const addUserNotification = async (values) => {
    const res = await axios.post("http://localhost:3000/UserNotifications", values);
    setUserNotifications([...UserNotifications, res.data]); // Assuming the server returns the created user object
    return res.data;
  }
  // Delete a UserNotification
  const deleteUserNotification = async (id) => {
    await axios.delete(`http://localhost:3000/UserNotifications/${id}`);
    setUserNotifications(UserNotifications.filter((UserNotification) => UserNotification.id !== id));
  }
  // Fetch a single UserNotification
  const fetchUserNotification = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/UserNotifications/${id}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  }
  // Update a UserNotification
  const updateUserNotification = async (id, values) => {
    const res = await axios.put(`http://localhost:3000/UserNotifications/${id}`, values);
    setUserNotifications(UserNotifications.map((UserNotification) => UserNotification.id === id ? res.data : UserNotification));
    return res.data;
  }
  // ____________________________ PublicNotifications --------------------------------------
  // Add a PublicNotification
  const addPublicNotification = async (values) => {
    const res = await axios.post("http://localhost:3000/PublicNotifications", values);
    setPublicNotifications([...PublicNotifications, res.data]); // Assuming the server returns the created user object
    return res.data;
  }
  // Delete a PublicNotification
  const deletePublicNotification = async (id) => {
    await axios.delete(`http://localhost:3000/PublicNotifications/${id}`);
    setPublicNotifications(PublicNotifications.filter((PublicNotification) => PublicNotification.id !== id));
  }
  // Fetch a single PublicNotification
  const fetchPublicNotification = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/PublicNotifications/${id}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  }
  // Update a PublicNotification
  const updatePublicNotification = async (id, values) => {
    const res = await axios.put(`http://localhost:3000/PublicNotifications/${id}`, values);
    setPublicNotifications(PublicNotifications.map((PublicNotification) => PublicNotification.id === id ? res.data : PublicNotification));
    return res.data;
  }
  // ____________________________ UserNotificationsMarkedPublic --------------------------------------
  // Add a UserNotificationMarkedPublic
  const addUserNotificationMarkedPublic = async (values) => {
    const res = await axios.post("http://localhost:3000/UserNotificationsMarkedPublic", values);
    setUserNotificationsMarkedPublic([...UserNotificationsMarkedPublic, res.data]); // Assuming the server returns the created user object
    return res.data;
  }
  // Delete a UserNotificationMarkedPublic
  const deleteUserNotificationMarkedPublic = async (id) => {
    await axios.delete(`http://localhost:3000/UserNotificationsMarkedPublic/${id}`);
    setUserNotificationsMarkedPublic(UserNotificationsMarkedPublic.filter((UserNotificationMarkedPublic) => UserNotificationMarkedPublic.id !== id));
  }
  // Fetch a single UserNotificationMarkedPublic
  const fetchUserNotificationMarkedPublic = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/UserNotificationsMarkedPublic/${id}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  }
  // Update a UserNotificationMarkedPublic
  const updateUserNotificationMarkedPublic = async (id, values) => {
    const res = await axios.put(`http://localhost:3000/UserNotificationsMarkedPublic/${id}`, values);
    setUserNotificationsMarkedPublic(UserNotificationsMarkedPublic.map((UserNotificationMarkedPublic) => UserNotificationMarkedPublic.id === id ? res.data : UserNotificationMarkedPublic));
    return res.data;
  }
  // ____________________________ DrivierNotifications --------------------------------------
  // Add a DrivierNotification
  const addDrivierNotification = async (values) => {
    const res = await axios.post("http://localhost:3000/DrivierNotifications", values);
    setDrivierNotifications([...DrivierNotifications, res.data]); // Assuming the server returns the created user object
    return res.data;
  }
  // Delete a DrivierNotification
  const deleteDrivierNotification = async (id) => {
    await axios.delete(`http://localhost:3000/DrivierNotifications/${id}`); 
    setDrivierNotifications(DrivierNotifications.filter((DrivierNotification) => DrivierNotification.id !== id));
  }
  // Fetch a single DrivierNotification
  const fetchDrivierNotification = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/DrivierNotifications/${id}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  }
  // Update a DrivierNotification
  const updateDrivierNotification = async (id, values) => {
    const res = await axios.put(`http://localhost:3000/DrivierNotifications/${id}`, values);
    setDrivierNotifications(DrivierNotifications.map((DrivierNotification) => DrivierNotification.id === id ? res.data : DrivierNotification));
    return res.data;
  }
//_____________________________
  // ____________________________ managerNotifications --------------------------------------
  // Add a managerNotification
  const addManagerNotification = async (values) => {
    const res = await axios.post("http://localhost:3000/managerNotifications", values);
    setManagerNotifications([...managerNotifications, res.data]); // Assuming the server returns the created user object
    return res.data;
  }
  // Delete a managerNotification
  const deleteManagerNotification = async (id) => {
    await axios.delete(`http://localhost:3000/managerNotifications/${id}`);
    setManagerNotifications(managerNotifications.filter((managerNotification) => managerNotification.id !== id));
  }
  // Fetch a single managerNotification
  const fetchManagerNotification = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/managerNotifications/${id}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  }
  // Update a managerNotification
  const updateManagerNotification = async (id, values) => {
    const res = await axios.put(`http://localhost:3000/managerNotifications/${id}`, values);
    setManagerNotifications(managerNotifications.map((managerNotification) => managerNotification.id === id ? res.data : managerNotification));
    return res.data;
  }
  // ____________________________ Acceptted_Users_And_SpecialOrder --------------------------------------
  // Add a Acceptted_Users_And_SpecialOrder
  const addAcceptted_Users_And_SpecialOrder = async (values) => {
    const res = await axios.post("http://localhost:3000/Acceptted_Users_And_SpecialOrder", values);
    setAcceptted_Users_And_SpecialOrder([...Acceptted_Users_And_SpecialOrder, res.data]); // Assuming the server returns the created user object
    return res.data;
  }
  // Delete a Acceptted_Users_And_SpecialOrder
  const deleteAcceptted_Users_And_SpecialOrder = async (id) => {
    await axios.delete(`http://localhost:3000/Acceptted_Users_And_SpecialOrder/${id}`);
    setAcceptted_Users_And_SpecialOrder(Acceptted_Users_And_SpecialOrder.filter((Acceptted_Users_And_SpecialOrder) => Acceptted_Users_And_SpecialOrder.id !== id));
  }
  // Fetch a single Acceptted_Users_And_SpecialOrder
  const fetchAcceptted_Users_And_SpecialOrder = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/Acceptted_Users_And_SpecialOrder/${id}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  }
  // Update a Acceptted_Users_And_SpecialOrder
  const updateAcceptted_Users_And_SpecialOrder = async (id, values) => {
    const res = await axios.put(`http://localhost:3000/Acceptted_Users_And_SpecialOrder/${id}`, values);
    setAcceptted_Users_And_SpecialOrder(Acceptted_Users_And_SpecialOrder.map((Acceptted_Users_And_SpecialOrder) => Acceptted_Users_And_SpecialOrder.id === id ? res.data : Acceptted_Users_And_SpecialOrder));
    return res.data;
  }
  // ____________________________ Available_UsersAnnouncements_Tasks --------------------------------------
  // Add a Available_UsersAnnouncements_Tasks
  const addAvailable_UsersAnnouncements_Tasks = async (values) => {
    const res = await axios.post("http://localhost:3000/Available_UsersAnnouncements_Tasks", values);
    setAvailable_UsersAnnouncements_Tasks([...Available_UsersAnnouncements_Tasks, res.data]); // Assuming the server returns the created user object
    return res.data;
  }
  // Delete a Available_UsersAnnouncements_Tasks
  const deleteAvailable_UsersAnnouncements_Tasks = async (id) => {
    await axios.delete(`http://localhost:3000/Available_UsersAnnouncements_Tasks/${id}`);
    setAvailable_UsersAnnouncements_Tasks(Available_UsersAnnouncements_Tasks.filter((Available_UsersAnnouncements_Task) => Available_UsersAnnouncements_Task.id !== id));
  }
  // Fetch a single Available_UsersAnnouncements_Tasks
  const fetchAvailable_UsersAnnouncements_Tasks = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/Available_UsersAnnouncements_Tasks/${id}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  }
  // Update a Available_UsersAnnouncements_Tasks
  const updateAvailable_UsersAnnouncements_Tasks = async (id, values) => {
    const res = await axios.put(`http://localhost:3000/Available_UsersAnnouncements_Tasks/${id}`, values);
    setAvailable_UsersAnnouncements_Tasks(Available_UsersAnnouncements_Tasks.map((Available_UsersAnnouncements_Task) => Available_UsersAnnouncements_Task.id === id ? res.data : Available_UsersAnnouncements_Task));
    return res.data;
  }

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
        const { data } = await axios.get(
          "http://localhost:3000/UsersAnnouncements"
        );
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
    const fetchCommunityActivities = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:3000/CommunityActivities"
        );
        setCommunityActivities(data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchSubscribersOfCommunityActivities = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:3000/SubscribersOfCommunityActivities"
        );
        setSubscribersOfCommunityActivities(data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchPolls = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/Polls");
        setPolls(data);
      } catch (error) {
        console.error(error);
      }
    };  
    const fetchSubscribersOfPolls = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/SubscribersOfPolls");
        setSubscribersOfPolls(data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchRewards = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/Rewards");
        setRewards(data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchUsersSignedUpForRewards = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/UsersSignedUpForRewards");
        setUsersSignedUpForRewards(data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchUserNotifications = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/UserNotifications");
        setUserNotifications(data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchPublicNotifications = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/PublicNotifications");
        setPublicNotifications(data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchUserNotificationsMarkedPublic = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/UserNotificationsMarkedPublic");
        setUserNotificationsMarkedPublic(data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchDrivierNotifications = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/DrivierNotifications");
        setDrivierNotifications(data);
      } catch (error) {
        console.error(error);
      }
    };
        const fetchManagerNotifications = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/managerNotifications");
        setManagerNotifications(data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchAcceptted_Users_And_SpecialOrder = async()=>{
      try {
        const { data } = await axios.get("http://localhost:3000/Acceptted_Users_And_SpecialOrder");
        setAcceptted_Users_And_SpecialOrder(data);
      } catch (error) {
        console.error(error);
      }
    }
   const fetchAvailable_UsersAnnouncements_Tasks = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/Available_UsersAnnouncements_Tasks");
        setAvailable_UsersAnnouncements_Tasks(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();
    fetchmanagers();
    fetchtruckDrivers();
    fetchContactUs();
    fetchBins();
    fetchUsersAnnouncements();
    fetchRegions();
    fetchCommunityActivities();
    fetchSubscribersOfCommunityActivities();
    fetchPolls();
    fetchSubscribersOfPolls();
    fetchRewards();
    fetchUsersSignedUpForRewards();
    fetchUserNotifications();
    fetchPublicNotifications();
    fetchUserNotificationsMarkedPublic();
    fetchDrivierNotifications();
    fetchManagerNotifications();
    fetchAcceptted_Users_And_SpecialOrder();
    fetchAvailable_UsersAnnouncements_Tasks();
  }, []);

  return {
    users,
    managers,
    truckDrivers,
    contactUs,
    bins,
    usersAnnouncements,
    regions,
    CommunityActivities,
    SubscribersOfCommunityActivities,
    Polls,
    SubscribersOfPolls,
    Rewards,
    UsersSignedUpForRewards,
    UserNotifications,
    PublicNotifications,
    UserNotificationsMarkedPublic,
    DrivierNotifications,
    managerNotifications,
    Acceptted_Users_And_SpecialOrder,
    Available_UsersAnnouncements_Tasks,

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
    updateRegion,
    addCommunityActivity,
    deleteCommunityActivity,
    fetchCommunityActivity,
    updateCommunityActivity,
    addSubscribersOfCommunityActivity,
    deleteSubscribersOfCommunityActivity,
    fetchSubscribersOfCommunityActivity,
    updateSubscribersOfCommunityActivity,
    addPoll,
    deletePoll,
    fetchPoll,
    updatePoll,
    addSubscribersOfPoll,
    deleteSubscribersOfPoll,
    fetchSubscribersOfPoll,
    updateSubscribersOfPoll,
    addReward,
    deleteReward,
    fetchReward,
    updateReward,
    addUsersSignedUpForReward,
    deleteUsersSignedUpForReward,
    fetchUsersSignedUpForReward,
    updateUsersSignedUpForReward,
    addUserNotification,
    deleteUserNotification,
    fetchUserNotification,
    updateUserNotification,
    addPublicNotification,
    deletePublicNotification,
    fetchPublicNotification,
    updatePublicNotification,
    addUserNotificationMarkedPublic,
    deleteUserNotificationMarkedPublic,
    fetchUserNotificationMarkedPublic,
    updateUserNotificationMarkedPublic,
    addDrivierNotification,
    deleteDrivierNotification,
    fetchDrivierNotification,
    updateDrivierNotification,
    addManagerNotification,
    deleteManagerNotification,
    fetchManagerNotification,
    updateManagerNotification,
    addAcceptted_Users_And_SpecialOrder,
    deleteAcceptted_Users_And_SpecialOrder,
    fetchAcceptted_Users_And_SpecialOrder,
    updateAcceptted_Users_And_SpecialOrder,
    addAvailable_UsersAnnouncements_Tasks,
    deleteAvailable_UsersAnnouncements_Tasks,
    fetchAvailable_UsersAnnouncements_Tasks,
    updateAvailable_UsersAnnouncements_Tasks
  };
};

export default useUser;
