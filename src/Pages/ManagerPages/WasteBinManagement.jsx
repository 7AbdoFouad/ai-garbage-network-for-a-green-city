import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

const getAuthToken = () => Cookies.get("token");

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

const WasteBinManagement = () => {
  const [newItem, setNewItem] = useState({
    warehouseManger: '',
    warehouseName: '',
    sendAt: '',
    material: '',
    quantity: '',
    price: '',
    description: ''
  });

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  const POST_API_URL = 'https://greencityapi.runasp.net/api/Warehouse';
  const DROPDOWN_API_URL = 'https://greencityapi.runasp.net/api/StorageWarehouse';

  const pricePerKg = {
    Metals: 15,
    Plastic: 10,
    Paper: 5,
    Glass: 7,
    Wood: 6
  };

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const token = getAuthToken();
        const response = await axios.get(DROPDOWN_API_URL,
          {
           headers: { Authorization: `Bearer ${token}` }
          }
        );
        setWarehouses(response.data);
      } catch (error) {
        console.error('Error fetching warehouses:', error);
        toast.error('Failed to load warehouse options');
      }
    };

    fetchWarehouses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewItem(prev => {
      const updatedItem = {
        ...prev,
        [name]: value
      };

      if ((name === "material" || name === "quantity") && updatedItem.material && updatedItem.quantity) {
        const quantity = parseFloat(updatedItem.quantity);
        const pricePerUnit = pricePerKg[updatedItem.material] || 0;
        updatedItem.price = (quantity * pricePerUnit).toFixed(2);
      }

      return updatedItem;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('warehouseManger', newItem.warehouseManger);
      formData.append('warehouseName', newItem.warehouseName);
      formData.append('sendAt', formatDate(newItem.sendAt));
      formData.append('material', newItem.material);
      formData.append('quantity',parseFloat( newItem.quantity));
      formData.append('price',  parseFloat( newItem.price));
      formData.append('description', newItem.description);
      console.log("Sending Data:", newItem);

      const response = await axios.post(POST_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200 || response.status === 201) {
        toast.success('Item added successfully!', {
          position: "top-right",
          autoClose: 3000,
          style: {
            background: '#27ae60',
            color: '#fff'
          }
        });

        setNewItem({
          warehouseManger: '',
          warehouseName: '',
          sendAt: '',
          material: '',
          quantity: '',
          price: '',
          description: ''
        });
      }
    } catch (error) {
      let errorMessage = 'Error adding item';
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'Server connection failed. Please check backend API.';
      } else {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        style: {
          background: '#e74c3c',
          color: '#fff'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.splitContainer}>
        {/* Left side - Form */}
        <div style={styles.formSection}>
          <div style={styles.card}>
            {/* Fixed Header */}
            <div style={styles.headerContainer}>
              <h1 style={styles.header}>📦 Warehouse Inventory</h1>
              <p style={styles.subHeader}>Add new materials to your warehouse</p>
            </div>

            {/* Scrollable Form Content */}
            <div style={styles.scrollableFormContainer}>
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelIcon}>🧱</span> Material Type
                    </label>
                    <select
                      name="material"
                      value={newItem.material}
                      onChange={handleInputChange}
                      required
                      style={styles.input}
                    >
                      <option value="">Select material</option>
                      <option value="Metals">🔩 Metals</option>
                      <option value="Plastic">🧴 Plastic</option>
                      <option value="Paper">📄 Paper</option>
                      <option value="Glass">🍾 Glass</option>
                      <option value="Wood">🪵 Wood</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelIcon}>🏭</span> Warehouse
                    </label>
                    <select
                      name="warehouseName"
                      value={newItem.warehouseName}
                      onChange={handleInputChange}
                      required
                      style={styles.input}
                    >
                      <option value="">Select warehouse</option>
                      {warehouses.map((w, index) => (
                        <option key={index} value={w.warehouseName}>{w.warehouseName}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelIcon}>📅</span> Date
                    </label>
                    <input
                      type="date"
                      name="sendAt"
                      value={newItem.sendAt}
                      onChange={handleInputChange}
                      required
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <span style={styles.labelIcon}>📝</span> Description
                  </label>
                  <textarea
                    name="description"
                    value={newItem.description}
                    onChange={handleInputChange}
                    required
                    style={styles.textarea}
                    placeholder="Enter item description..."
                    rows="4"
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelIcon}>⚖️</span> Quantity (kg)
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={newItem.quantity}
                      onChange={handleInputChange}
                      required
                      style={styles.input}
                      placeholder="Enter weight in kg"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelIcon}>💰</span> Estimated Value ($)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={newItem.price}
                      onChange={handleInputChange}
                      required
                      style={styles.input}
                      placeholder="Auto-calculated"
                      readOnly
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={loading ? { ...styles.submitButton, ...styles.submitButtonLoading } : styles.submitButton}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span style={styles.spinner}></span>
                      Processing...
                    </>
                  ) : (
                    '➕ Add Inventory Item'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right side - Warehouse Image */}
        <div style={styles.imageSection}>
          <div style={styles.imageOverlay}>
            <h2 style={styles.imageTitle}>Warehouse Management</h2>
            <p style={styles.imageText}>Track and manage your inventory with ease</p>
          </div>
          <img
            src="https://www.hashmicro.com/ph/blog/wp-content/uploads/2024/01/cost-reduction-through-green-warehouse-practices.jpg"
            alt="Modern Warehouse"
            style={styles.warehouseImage}
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '2rem',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4f0e2 100%)',
    fontFamily: "'Poppins', sans-serif"
  },
  splitContainer: {
    display: 'flex',
    width: '100%',
    maxWidth: '1200px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    height: '80vh'
  },
  formSection: {
    flex: '1',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden'
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#ffffff'
  },
  headerContainer: {
    padding: '2rem 2rem 1rem',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #f0f0f0',
    zIndex: 10
  },
  header: {
    color: '#2c3e50',
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    letterSpacing: '0.5px'
  },
  subHeader: {
    color: '#7f8c8d',
    fontSize: '1rem',
    fontWeight: '400'
  },
  scrollableFormContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 2rem 2rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    paddingBottom: '1rem'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem'
  },
  formGroup: {
    marginBottom: '0'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.75rem',
    fontWeight: '500',
    color: '#2c3e50',
    fontSize: '0.95rem'
  },
  labelIcon: {
    marginRight: '0.5rem',
    fontSize: '1.1rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '0.95rem',
    backgroundColor: '#f8f9fa',
    transition: 'all 0.2s ease',
    ':focus': {
      outline: 'none',
      borderColor: '#27ae60',
      boxShadow: '0 0 0 3px rgba(39, 174, 96, 0.2)'
    }
  },
  textarea: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '0.95rem',
    minHeight: '100px',
    resize: 'vertical',
    backgroundColor: '#f8f9fa',
    transition: 'all 0.2s ease',
    ':focus': {
      outline: 'none',
      borderColor: '#27ae60',
      boxShadow: '0 0 0 3px rgba(39, 174, 96, 0.2)'
    }
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: '0.5rem',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    ':hover': {
      backgroundColor: '#219653',
      transform: 'translateY(-2px)'
    }
  },
  submitButtonLoading: {
    opacity: '0.8',
    cursor: 'not-allowed',
    backgroundColor: '#27ae60'
  },
  spinner: {
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    animation: 'spin 1s linear infinite'
  },
  imageSection: {
    flex: '1',
    position: 'relative',
    display: ['none', null, 'block']
  },
  warehouseImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  imageOverlay: {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.5))',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '2rem',
    zIndex: '1'
  },
  imageTitle: {
    color: 'white',
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem'
  },
  imageText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '1rem'
  }
};

export default WasteBinManagement;