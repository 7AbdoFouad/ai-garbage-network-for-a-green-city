import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RecyclingPage = () => {
  const [newItem, setNewItem] = useState({
    recyclingName: '',
    recyclingDesc: '',
    recyclingDate: '',
    recyclingLocation: 'Cairo, Egypt',
    recyclingImage: '',
    
   
  });

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const API_URL = 'http://localhost:3000/Recycling';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewItem(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: Number(value)
        }
      }));
    } else {
      setNewItem(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem(prev => ({
          ...prev,
          recyclingImage: reader.result
        }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // جلب بيانات السائق الحالي من localStorage
    const currentDriver = JSON.parse(localStorage.getItem('currentDriver')) || {
      id: "defaultId",
      name: "Unknown Driver"
    };

    try {
      const response = await axios.post(API_URL, {
        ...newItem,
        id: String(Date.now()),
        driverId: currentDriver.id, // إضافة ID السائق
        driverName: currentDriver.name // إضافة اسم السائق
      });
      
      if (response.status === 201) {
        toast.success('Program added successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        
        // Reset form
        setNewItem({
          recyclingName: '',
          recyclingDesc: '',
          recyclingDate: '',
          recyclingLocation: 'Cairo, Egypt',
          recyclingImage: '',
        
         
        });
        setImagePreview(null);
        document.getElementById('imageUpload').value = '';
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
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.header}>Add Recycling Program</h1>
        
        <div style={styles.formContainer}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Program Name:</label>
                <input
                  type="text"
                  name="recyclingName"
                  value={newItem.recyclingName}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                  placeholder="Enter program name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Date:</label>
                <input
                  type="date"
                  name="recyclingDate"
                  value={newItem.recyclingDate}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description:</label>
              <textarea
                name="recyclingDesc"
                value={newItem.recyclingDesc}
                onChange={handleInputChange}
                required
                style={styles.textarea}
                placeholder="Enter detailed description"
                rows="4"
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Location:</label>
                <input
                  type="text"
                  name="recyclingLocation"
                  value={newItem.recyclingLocation}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                  placeholder="Enter location"
                />
              </div>
            </div>

            

            <div style={styles.formGroup}>
              <label style={styles.label}>Program Image:</label>
              {imagePreview && (
                <div style={styles.imagePreviewContainer}>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={styles.imagePreview} 
                  />
                </div>
              )}
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={styles.fileInput}
              />
              <label htmlFor="imageUpload" style={styles.fileInputLabel}>
                {imagePreview ? 'Change Image' : 'Choose Image'}
              </label>
            </div>

            <button 
              type="submit" 
              style={loading ? {...styles.submitButton, ...styles.submitButtonDisabled} : styles.submitButton}
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
    padding: '30px',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    ':hover': {
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)'
    }
  },
  header: {
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '28px',
    fontWeight: '600',
    letterSpacing: '0.5px'
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
    gap: '20px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr'
    }
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
    boxSizing: 'border-box',
    fontSize: '14px',
    transition: 'border 0.3s ease, box-shadow 0.3s ease',
    ':focus': {
      outline: 'none',
      borderColor: '#3498db',
      boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.2)'
    }
  },
  textarea: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #dfe6e9',
    borderRadius: '8px',
    boxSizing: 'border-box',
    fontSize: '14px',
    minHeight: '100px',
    resize: 'vertical',
    transition: 'border 0.3s ease, box-shadow 0.3s ease',
    ':focus': {
      outline: 'none',
      borderColor: '#3498db',
      boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.2)'
    }
  },
  fileInput: {
    width: '0.1px',
    height: '0.1px',
    opacity: 0,
    overflow: 'hidden',
    position: 'absolute',
    zIndex: -1
  },
  fileInputLabel: {
    display: 'inline-block',
    padding: '12px 20px',
    backgroundColor: '#f8f9fa',
    color: '#495057',
    border: '1px dashed #adb5bd',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    fontSize: '14px',
    ':hover': {
      backgroundColor: '#e9ecef',
      borderColor: '#6c757d'
    }
  },
  imagePreviewContainer: {
    marginBottom: '15px',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  imagePreview: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
    display: 'block'
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
    marginTop: '10px',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    ':hover': {
      backgroundColor: '#219653',
      transform: 'translateY(-2px)'
    },
    ':active': {
      transform: 'translateY(0)'
    }
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
    cursor: 'not-allowed',
    ':hover': {
      backgroundColor: '#95a5a6',
      transform: 'none'
    }
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
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  }
};

export default RecyclingPage;