import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:3000/sortingstore';

  const pricePerKg = {
    Metals: 15,
    Plastic: 10,
    Paper: 5,
    Glass: 7,
    Wood: 6
  };

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
      const response = await axios.post(API_URL, {
        ...newItem,
        id: String(Date.now())
      });

      if (response.status === 201) {
        toast.success('Program added successfully!', {
          position: "top-right",
          autoClose: 3000
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
      let errorMessage = 'Error adding program';

      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'Server connection failed. Please check json-server';
      } else {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.header}>Warehouse Store</h1>
        <div style={styles.formContainer}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Warehouse Manager:</label>
                <input
                  type="text"
                  name="warehouseManger"
                  value={newItem.warehouseManger}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                  placeholder="Enter Warehouse Manager Name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Material:</label>
                <select
                  name="material"
                  value={newItem.material}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                >
                  <option value="">Select Material</option>
                  <option value="Metals">Metals</option>
                  <option value="Plastic">Plastic</option>
                  <option value="Paper">Paper</option>
                  <option value="Glass">Glass</option>
                  <option value="Wood">Wood</option>
                </select>

              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Stores:</label>
                <select
                  name="warehouseName"
                  value={newItem.warehouseName}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                >
                  <option value="">Select Warehouse</option>
                  <option value="Masr">Masr</option>
                  <option value="Elsalam">Elsalam</option>
            
                </select>
              </div>
            </div>

                  <div style={styles.formGroup}>
                <label style={styles.label}>Date:</label>
                <input
                  type="date"
                  name="sendAt" 
                  value={newItem.sendAt}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                  placeholder="Enter date"
                />
              </div>



            <div style={styles.formGroup}>
              <label style={styles.label}>Description:</label>
              <textarea
                name="description"
                value={newItem.description}
                onChange={handleInputChange}
                required
                style={styles.textarea}
                placeholder="Enter detailed description"
                rows="4"
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Quantity (kg):</label>
                <input
                  type="number"
                  name="quantity"
                  value={newItem.quantity}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                  placeholder="Enter quantity"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Estimated Value:</label>
                <input
                  type="number"
                  name="price"
              
                  value={newItem.price}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                  placeholder="Estimated value"
                />
              </div>
            </div>

            <button
              type="submit"
              style={loading ? { ...styles.submitButton, ...styles.submitButtonDisabled } : styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <span style={styles.buttonContent}>
                  <span style={styles.spinner}></span>
                  Adding...
                </span>
              ) : (
                'Add Program'
              )}
            </button>
          </form>
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
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  card: {
    width: '100%',
    maxWidth: '800px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    padding: '30px'
  },
  header: {
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '28px',
    fontWeight: '600'
  },
  formContainer: {
    marginTop: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  formGroup: {
    marginBottom: '10px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#34495e',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #dfe6e9',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #dfe6e9',
    borderRadius: '8px',
    fontSize: '14px',
    minHeight: '100px',
    resize: 'vertical'
  },
  submitButton: {
    padding: '14px 20px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    marginTop: '10px'
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
    cursor: 'not-allowed'
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  spinner: {
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    borderTop: '2px solid white',
    width: '16px',
    height: '16px',
    animation: 'spin 1s linear infinite'
  }
};

export default WasteBinManagement;

/* 
{
      "warehouseManger": "Ahmed Mohamed",
      "warehouseName": "Masr",
      "sendAt": "22/5/2025",
      "material": "Portland Cement",
      "quantity": 30,
      "price": 2500,
      "description": "Type I cement in 50kg bags"
    },
*/