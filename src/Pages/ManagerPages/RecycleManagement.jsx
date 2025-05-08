import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RecycleManagement = () => {
  const [recyclingItems, setRecyclingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editForm, setEditForm] = useState({
    recyclingName: '',
    recyclingDesc: '',
    recyclingDate: '',
    recyclingLocation: '',
    recyclingImage: '',
    TheMassofWasteKilo: '',
    recyclingValue: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchRecyclingItems();
  }, []);

  const fetchRecyclingItems = async () => {
    try {
      const response = await axios.get('http://localhost:3000/Recycling');
      setRecyclingItems(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch recycling data');
      setLoading(false);
      console.error('Error fetching data:', err);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete ${item.recyclingName}?`)) return;
    
    try {
      await axios.delete(`http://localhost:3000/Recycling/${item.id}`);
      setRecyclingItems(recyclingItems.filter(i => i.id !== item.id));
      toast.success(`${item.recyclingName} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Error while deleting!');
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setEditForm({
      recyclingName: item.recyclingName,
      recyclingDesc: item.recyclingDesc,
      recyclingDate: item.recyclingDate,
      recyclingLocation: item.recyclingLocation,
      recyclingImage: item.recyclingImage,
      TheMassofWasteKilo: item.TheMassofWasteKilo,
      recyclingValue: item.recyclingValue
    });
    setIsModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`http://localhost:3000/Recycling/${currentItem.id}`, editForm);
      setIsModalOpen(false);
      fetchRecyclingItems();
      toast.success(`${editForm.recyclingName} updated successfully!`);
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Error while updating!');
    }
  };

  if (loading) return <div style={styles.loading}>Loading data...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Recycle Management</h1>
      
      <div style={styles.itemsContainer}>
        {recyclingItems.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage).map(item => (
          <div key={item.id} style={styles.itemCard}>
            <div style={styles.imageContainer}>
              {item.recyclingImage && (
                <img 
                  src={item.recyclingImage} 
                  alt={item.recyclingName} 
                  style={styles.image}
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                  }}
                />
              )}
            </div>
            <div style={styles.itemContent}>
              <h2 style={styles.itemTitle}>{item.recyclingName}</h2>
              <p style={styles.itemDesc}>{item.recyclingDesc}</p>
              
              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Date:</span>
                  <span>{item.recyclingDate}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Location:</span>
                  <span>{item.recyclingLocation}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Waste Mass (kg):</span>
                  <span>{item.TheMassofWasteKilo}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Value:</span>
                  <span>{item.recyclingValue}</span>
                </div>
              </div>
              
              <div style={styles.actionButtons}>
                <button 
                  onClick={() => handleEdit(item)}
                  style={styles.editButton}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(item)}
                  style={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {recyclingItems.length > itemsPerPage && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '20px',
          gap: '5px',
          padding: '10px 0'
        }}>
          {Array.from({length: Math.ceil(recyclingItems.length/itemsPerPage)}).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index+1)}
              style={{
                padding: '5px 10px',
                backgroundColor: currentPage === index+1 ? '#2e7d32' : 'white',
                color: currentPage === index+1 ? 'white' : 'black',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {index+1}
            </button>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Edit {currentItem?.recyclingName}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={styles.closeButton}
              >
                &times;
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label>Program Name:</label>
                <input
                  type="text"
                  name="recyclingName"
                  value={editForm.recyclingName}
                  onChange={handleEditChange}
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label>Description:</label>
                <textarea
                  name="recyclingDesc"
                  value={editForm.recyclingDesc}
                  onChange={handleEditChange}
                  style={{...styles.input, minHeight: '80px'}}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label>Value:</label>
                <textarea
                  name="recyclingValue"
                  value={editForm.recyclingValue}
                  onChange={handleEditChange}
                  style={{...styles.input, minHeight: '60px'}}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label>Date:</label>
                <input
                  type="date"
                  name="recyclingDate"
                  value={editForm.recyclingDate}
                  onChange={handleEditChange}
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label>Location:</label>
                <input
                  type="text"
                  name="recyclingLocation"
                  value={editForm.recyclingLocation}
                  onChange={handleEditChange}
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label>Waste Mass (kg):</label>
                <input
                  type="number"
                  name="TheMassofWasteKilo"
                  value={editForm.TheMassofWasteKilo}
                  onChange={handleEditChange}
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label>Program Image:</label>
                {editForm.recyclingImage && (
                  <img 
                    src={editForm.recyclingImage} 
                    alt="Image preview" 
                    style={styles.imagePreview} 
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setEditForm(prev => ({
                          ...prev,
                          recyclingImage: event.target.result
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={styles.fileInput}
                />
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button 
                onClick={handleEditSubmit}
                style={styles.saveButton}
              >
                Save Changes
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: 'linear-gradient(135deg, #d4edda, #a8df8e)',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh'
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#2c3e50'
  },
  error: {
    textAlign: 'center',
    padding: '50px',
    color: '#e74c3c',
    fontSize: '18px'
  },
  header: {
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '28px'
  },
  itemsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  itemCard: {
    border: '1px solid #ddd',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
    transition: 'transform 0.3s ease',
    ':hover': {
      transform: 'translateY(-5px)'
    }
  },
  imageContainer: {
    height: '200px',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
    ':hover': {
      transform: 'scale(1.05)'
    }
  },
  itemContent: {
    padding: '20px'
  },
  itemTitle: {
    marginTop: '0',
    color: '#27ae60',
    fontSize: '20px',
    marginBottom: '10px'
  },
  itemDesc: {
    color: '#666',
    marginBottom: '15px',
    lineHeight: '1.5'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '15px'
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column'
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px',
    fontSize: '14px'
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '15px',
    gap: '10px'
  },
  editButton: {
    padding: '10px 15px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    flex: '1',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
    ':hover': {
      backgroundColor: '#2980b9'
    }
  },
  deleteButton: {
    padding: '10px 15px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    flex: '1',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
    ':hover': {
      backgroundColor: '#c0392b'
    }
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'linear-gradient(135deg, #d4edda, #afe395)',
    borderRadius: '10px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    animation: 'modalFadeIn 0.3s ease'
  },
  modalHeader: {
    padding: '15px 20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#777',
    ':hover': {
      color: '#333'
    }
  },
  modalBody: {
    padding: '20px'
  },
  modalFooter: {
    padding: '15px 20px',
    borderTop: '1px solid #eee',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  formGroup: {
    marginBottom: '15px'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    boxSizing: 'border-box',
    fontSize: '14px',
    transition: 'border-color 0.3s ease',
    ':focus': {
      borderColor: '#3498db',
      outline: 'none'
    }
  },
  fileInput: {
    width: '100%',
    marginTop: '5px'
  },
  imagePreview: {
    maxWidth: '100%',
    maxHeight: '150px',
    display: 'block',
    margin: '10px 0',
    borderRadius: '6px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  saveButton: {
    padding: '10px 20px',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    marginRight: '310px',
    transition: 'background-color 0.3s ease',
    ':hover': {
      backgroundColor: '#27ae60'
    }
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
    ':hover': {
      backgroundColor: '#7f8c8d'
    }
  }
};

export default RecycleManagement;