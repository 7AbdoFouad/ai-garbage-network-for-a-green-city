import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useRewards() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/rewards');
      setRewards(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const addReward = async (rewardData) => {
    try {
      const response = await axios.post('/api/rewards', rewardData);
      setRewards(prev => [...prev, response.data]);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return false;
    }
  };

  const updateReward = async (id, rewardData) => {
    try {
      const response = await axios.put(`/api/rewards/${id}`, rewardData);
      setRewards(prev => prev.map(r => r._id === id ? response.data : r));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return false;
    }
  };

  const deleteReward = async (id) => {
    try {
      await axios.delete(`/api/rewards/${id}`);
      setRewards(prev => prev.filter(r => r._id !== id));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return false;
    }
  };

  return {
    rewards,
    loading,
    error,
    addReward,
    updateReward,
    deleteReward,
    fetchRewards
  };
}