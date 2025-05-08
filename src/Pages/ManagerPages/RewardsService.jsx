import axios from 'axios';

const API_URL = 'http://localhost:3000'; // تأكد أن هذا هو عنوان json-server الخاص بك

export const getRewards = async () => {
  try {
    const response = await axios.get(`${API_URL}/Rewards`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rewards:', error);
    throw error;
  }
};

export const addReward = async (reward) => {
  try {
    const response = await axios.post(`${API_URL}/Rewards`, reward);
    return response.data;
  } catch (error) {
    console.error('Error adding reward:', error);
    throw error;
  }
};

export const updateReward = async (id, reward) => {
  try {
    const response = await axios.put(`${API_URL}/Rewards/${id}`, reward);
    return response.data;
  } catch (error) {
    console.error('Error updating reward:', error);
    throw error;
  }
};

export const deleteReward = async (id) => {
  try {
    await axios.delete(`${API_URL}/Rewards/${id}`);
    return id;
  } catch (error) {
    console.error('Error deleting reward:', error);
    throw error;
  }
};