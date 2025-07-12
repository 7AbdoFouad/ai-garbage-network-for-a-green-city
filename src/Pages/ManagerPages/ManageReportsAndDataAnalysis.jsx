import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import axios from 'axios';

const API_URL = 'https://greencityapi.runasp.net/api/StorageWarehouse';

const getAuthToken = () => Cookies.get("token");

const WarehouseManagement = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    warehouseName: '',
    address: '',
    totalCapacity: '',
    currentCapacity: '0'
  });
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWarehouses(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch warehouses');
    } finally {
      setLoading(false);
    }
  };

  const addWarehouse = async () => {
    const token = getAuthToken();
    const payload = new FormData();
    payload.append('warehouseName', formData.warehouseName);
    payload.append('address', formData.address);
    payload.append('totalCapacity', parseFloat(formData.totalCapacity));
    payload.append('currentCapacity', parseFloat(formData.currentCapacity));

    try {
      const response = await axios.post(API_URL, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Warehouse added successfully');
      fetchWarehouses();
      setFormData({ warehouseName: '', address: '', totalCapacity: '', currentCapacity: '' });
    } catch (error) {
      toast.error('Failed to add warehouse');
    }
  };

  const updateWarehouse = async () => {
    const token = getAuthToken();
    const payload = new FormData();
    payload.append('id', editingWarehouse.id);
    payload.append('warehouseName', formData.warehouseName);
    payload.append('address', formData.address);
    payload.append('totalCapacity', parseFloat(formData.totalCapacity));
    payload.append('currentCapacity', parseFloat(formData.currentCapacity));

    try {
      await axios.put(`${API_URL}/${editingWarehouse.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Warehouse updated');
      fetchWarehouses();
      setShowModal(false);
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const deleteWarehouse = async (id) => {
    const token = getAuthToken();
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Warehouse deleted');
      fetchWarehouses();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const capacityStats = warehouses.reduce((acc, w) => {
    acc.total += parseFloat(w.totalCapacity || 0);
    acc.used += parseFloat(w.currentCapacity || 0);
    return acc;
  }, { total: 0, used: 0 });

  const capacityPercent = capacityStats.total ? Math.round((capacityStats.used / capacityStats.total) * 100) : 0;

  return (
    <div style={{ 
      padding: '2rem', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4f0e2 100%)', 
      minHeight: '100vh',
      fontFamily: "'Poppins', sans-serif"
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        <h1 style={{ 
          color: '#2c3e50', 
          textAlign: 'center', 
          marginBottom: '2rem',
          fontSize: '2.5rem',
          fontWeight: '600',
          letterSpacing: '0.5px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
        }}>
          Warehouse Management System
        </h1>

        {/* Capacity Summary Card */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '1.5rem', 
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          borderLeft: '5px solid #4CAF50'
        }}>
          <h2 style={{ 
            borderBottom: '2px solid #e0e0e0', 
            color: '#2c3e50',
            paddingBottom: '0.5rem',
            marginBottom: '1rem',
            fontSize: '1.5rem',
            fontWeight: '500'
          }}>
            Capacity Summary
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <p style={{ color: '#7f8c8d', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Total Capacity</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2c3e50' }}>{capacityStats.total}</p>
            </div>
            <div>
              <p style={{ color: '#7f8c8d', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Used Capacity</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#e74c3c' }}>{capacityStats.used}</p>
            </div>
            <div>
              <p style={{ color: '#7f8c8d', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Available Capacity</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#27ae60' }}>{capacityStats.total - capacityStats.used}</p>
            </div>
            <div>
              <p style={{ color: '#7f8c8d', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Utilization</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: capacityPercent > 80 ? '#e74c3c' : '#3498db' }}>
                {capacityPercent}%
              </p>
            </div>
          </div>
          <div style={{ 
            background: '#ecf0f1', 
            borderRadius: '10px', 
            height: '20px', 
            marginTop: '10px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              height: '100%', 
              width: `${capacityPercent}%`, 
              background: capacityPercent > 80 ? 'linear-gradient(90deg, #e74c3c, #c0392b)' : 'linear-gradient(90deg, #2ecc71, #27ae60)',
              transition: 'width 0.5s ease'
            }}></div>
          </div>
        </div>

        {/* Add Warehouse Form */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '1.5rem', 
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{ 
            textAlign: 'center', 
            color: '#2c3e50',
            marginBottom: '1.5rem',
            fontSize: '1.5rem',
            fontWeight: '500'
          }}>
            Add New Warehouse
          </h2>
          <form onSubmit={(e) => { e.preventDefault(); addWarehouse(); }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#7f8c8d',
                fontSize: '0.9rem'
              }}>
                Warehouse Name
              </label>
              <input 
                name="warehouseName" 
                value={formData.warehouseName} 
                onChange={handleChange} 
                placeholder="Enter warehouse name" 
                required 
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  transition: 'border 0.3s',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#7f8c8d',
                fontSize: '0.9rem'
              }}>
                Address
              </label>
              <input 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                placeholder="Enter address" 
                required 
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  transition: 'border 0.3s',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#7f8c8d',
                fontSize: '0.9rem'
              }}>
                Total Capacity
              </label>
              <input 
                type="number" 
                name="totalCapacity" 
                value={formData.totalCapacity} 
                onChange={handleChange} 
                placeholder="Enter total capacity" 
                required 
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  transition: 'border 0.3s',
                  outline: 'none'
                }}
              />
            </div>
            <button 
              type="submit" 
              style={{ 
                backgroundColor: '#27ae60', 
                color: 'white', 
                padding: '0.75rem', 
                width: '100%',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                ':hover': {
                  backgroundColor: '#219653'
                }
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#219653'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#27ae60'}
            >
              Add Warehouse
            </button>
          </form>
        </div>

        {/* Warehouses Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          {warehouses.map(w => {
            const percent = Math.round((parseFloat(w.currentCapacity) / parseFloat(w.totalCapacity)) * 100);
            return (
              <div key={w.id} style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '1.5rem', 
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                ':hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                }
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{ 
                    color: '#2c3e50', 
                    fontSize: '1.25rem',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    {w.warehouseName}
                  </h3>
                  <span style={{
                    backgroundColor: percent > 80 ? '#fdecea' : '#e8f5e9',
                    color: percent > 80 ? '#e74c3c' : '#27ae60',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}>
                    {percent}% used
                  </span>
                </div>
                <p style={{ 
                  color: '#7f8c8d', 
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem'
                }}>
                  <span style={{ fontWeight: '500', color: '#2c3e50' }}>Address:</span> {w.address}
                </p>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <p style={{ 
                      color: '#7f8c8d', 
                      marginBottom: '0.25rem',
                      fontSize: '0.8rem'
                    }}>
                      Total Capacity
                    </p>
                    <p style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: '600', 
                      color: '#2c3e50'
                    }}>
                      {w.totalCapacity}
                    </p>
                  </div>
                  <div>
                    <p style={{ 
                      color: '#7f8c8d', 
                      marginBottom: '0.25rem',
                      fontSize: '0.8rem'
                    }}>
                      Used Capacity
                    </p>
                    <p style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: '600', 
                      color: '#e74c3c'
                    }}>
                      {w.currentCapacity}
                    </p>
                  </div>
                </div>
                <div style={{ 
                  background: '#ecf0f1', 
                  borderRadius: '10px', 
                  height: '10px', 
                  marginBottom: '1.5rem',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${percent}%`, 
                    background: percent > 80 ? 'linear-gradient(90deg, #e74c3c, #c0392b)' : 'linear-gradient(90deg, #2ecc71, #27ae60)'
                  }}></div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '0.75rem'
                }}>
                  <button 
                    onClick={() => { setEditingWarehouse(w); setFormData(w); setShowModal(true); }} 
                    style={{ 
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteWarehouse(w.id)} 
                    style={{ 
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit Modal */}
        {showModal && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{ 
              background: 'white', 
              padding: '2rem', 
              borderRadius: '12px', 
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
              <h2 style={{ 
                color: '#2c3e50',
                marginBottom: '1.5rem',
                fontSize: '1.5rem',
                fontWeight: '500'
              }}>
                Edit Warehouse
              </h2>
              <form onSubmit={(e) => { e.preventDefault(); updateWarehouse(); }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: '#7f8c8d',
                    fontSize: '0.9rem'
                  }}>
                    Warehouse Name
                  </label>
                  <input 
                    name="warehouseName" 
                    value={formData.warehouseName} 
                    onChange={handleChange} 
                    required 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      fontSize: '1rem',
                      transition: 'border 0.3s',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: '#7f8c8d',
                    fontSize: '0.9rem'
                  }}>
                    Address
                  </label>
                  <input 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    required 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      fontSize: '1rem',
                      transition: 'border 0.3s',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: '#7f8c8d',
                    fontSize: '0.9rem'
                  }}>
                    Total Capacity
                  </label>
                  <input 
                    type="number" 
                    name="totalCapacity" 
                    value={formData.totalCapacity} 
                    onChange={handleChange} 
                    required 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      fontSize: '1rem',
                      transition: 'border 0.3s',
                      outline: 'none'
                    }}
                  />
                </div>
                {/* <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: '#7f8c8d',
                    fontSize: '0.9rem'
                  }}>
                    Current Capacity
                  </label>
                  <input 
                    type="number" 
                    name="currentCapacity" 
                    value={formData.currentCapacity} 
                    onChange={handleChange} 
                    required 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      fontSize: '1rem',
                      transition: 'border 0.3s',
                      outline: 'none'
                    }}
                  />
                </div> */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    type="submit" 
                    style={{ 
                      flex: 1,
                      backgroundColor: '#27ae60', 
                      color: 'white', 
                      padding: '0.75rem', 
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '1rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#219653'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#27ae60'}
                  >
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    style={{ 
                      flex: 1,
                      backgroundColor: '#e74c3c', 
                      color: 'white', 
                      padding: '0.75rem', 
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '1rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseManagement;