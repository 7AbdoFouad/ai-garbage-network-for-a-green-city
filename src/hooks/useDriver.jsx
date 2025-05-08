// hooks/useDriver.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useDriver = () => {
  const [driverAnnouncements, setDriverAnnouncements] = useState([]);
  const [regions, setRegions] = useState([]);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch driver data
  const fetchDriver = async (driverId) => {
    try {
      const response = await axios.get(`/api/drivers/${driverId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch driver data');
      throw err;
    }
  };

  // Fetch all collection records for a driver
  const fetchDriverAnnouncements = async (driverId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/drivers/${driverId}/collections`);
      setDriverAnnouncements(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch collections');
      toast.error('Failed to load collection records');
    } finally {
      setLoading(false);
    }
  };

  // Add new collection record
  const addDriverAnnouncement = async (data) => {
    try {
      const response = await axios.post('/api/collections', data);
      setDriverAnnouncements(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add collection');
      throw err;
    }
  };

  // Update collection record
  const updateDriverAnnouncement = async (id, data) => {
    try {
      const response = await axios.put(`/api/collections/${id}`, data);
      setDriverAnnouncements(prev => 
        prev.map(item => item.id === id ? response.data : item)
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update collection');
      throw err;
    }
  };

  // Delete collection record
  const deleteDriverAnnouncement = async (id) => {
    try {
      await axios.delete(`/api/collections/${id}`);
      setDriverAnnouncements(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete collection');
      throw err;
    }
  };

  // Mark collection as completed
  const markAsCollected = async (id) => {
    try {
      const response = await axios.patch(`/api/collections/${id}/complete`);
      setDriverAnnouncements(prev => 
        prev.map(item => item.id === id ? response.data : item)
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark as collected');
      throw err;
    }
  };

  // Fetch regions and bins data (for dropdowns)
  const fetchRegionsAndBins = async () => {
    try {
      const [regionsRes, binsRes] = await Promise.all([
        axios.get('/api/regions'),
        axios.get('/api/bins')
      ]);
      setRegions(regionsRes.data);
      setBins(binsRes.data);
    } catch (err) {
      setError('Failed to load region and bin data');
    }
  };

  useEffect(() => {
    fetchRegionsAndBins();
  }, []);

  return {
    driverAnnouncements,
    regions,
    bins,
    loading,
    error,
    fetchDriver,
    fetchDriverAnnouncements,
    addDriverAnnouncement,
    updateDriverAnnouncement,
    deleteDriverAnnouncement,
    markAsCollected
  };
};

export default useDriver;