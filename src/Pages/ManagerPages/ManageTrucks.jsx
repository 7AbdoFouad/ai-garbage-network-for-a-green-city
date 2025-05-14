import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const WasteBinManagementPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [editForm, setEditForm] = useState({
    warehouseManger: '',
    warehouseName: '',
    sendAt: '',
    material: '',
    quantity: '',
    price: '',
    description: ''
  });

  const API_URL = 'http://localhost:3000/sortingstore';

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await axios.get(API_URL);
      setEntries(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch entries');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await axios.delete(`${API_URL}/${id}`);
      setEntries(entries.filter(entry => entry.id !== id));
      toast.success('Entry deleted successfully');
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  const handleEdit = (entry) => {
    setCurrentEntry(entry);
    setEditForm({
      warehouseManger: entry.warehouseManger,
      warehouseName: entry.warehouseName,
      sendAt: entry.sendAt,
      material: entry.material,
      quantity: entry.quantity,
      price: entry.price,
      description: entry.description
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.put(`${API_URL}/${currentEntry.id}`, editForm);
      setIsEditModalOpen(false);
      fetchEntries();
      toast.success('Entry updated successfully');
    } catch (error) {
      toast.error('Failed to update entry');
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading entries...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}> Warehouse Management</h1>
      
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Manager</th>
              <th style={styles.th}>Warehouse</th>
              <th style={styles.th}>Material</th>
              <th style={styles.th}>Quantity (kg)</th>
              <th style={styles.th}>Value</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr key={entry.id} style={styles.tr}>
                <td style={styles.td}>{entry.warehouseManger}</td>
                <td style={styles.td}>{entry.warehouseName}</td>
                <td style={styles.td}>{entry.material}</td>
                <td style={styles.td}>{entry.quantity}</td>
                <td style={styles.td}>${entry.price}</td>
                <td style={styles.td}>{entry.sendAt}</td>
                <td style={styles.td}>
                  <button 
                    onClick={() => handleEdit(entry)}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(entry.id)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Edit Entry</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                style={styles.closeButton}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Warehouse Manager:</label>
                <input
                  type="text"
                  name="warehouseManger"
                  value={editForm.warehouseManger}
                  onChange={handleEditChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Warehouse:</label>
                <select
                  name="warehouseName"
                  value={editForm.warehouseName}
                  onChange={handleEditChange}
                  required
                  style={styles.input}
                >
                  <option value="Masr">Masr</option>
                  <option value="Elsalam">Elsalam</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Material:</label>
                <select
                  name="material"
                  value={editForm.material}
                  onChange={handleEditChange}
                  required
                  style={styles.input}
                >
                  <option value="Metals">Metals</option>
                  <option value="Plastic">Plastic</option>
                  <option value="Paper">Paper</option>
                  <option value="Glass">Glass</option>
                  <option value="Wood">Wood</option>
                </select>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Quantity (kg):</label>
                  <input
                    type="number"
                    name="quantity"
                    value={editForm.quantity}
                    onChange={handleEditChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Value:</label>
                  <input
                    type="number"
                    name="price"
                    value={editForm.price}
                    onChange={handleEditChange}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Date:</label>
                <input
                  type="date"
                  name="sendAt"
                  value={editForm.sendAt}
                  onChange={handleEditChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description:</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  required
                  style={styles.textarea}
                  rows="4"
                />
              </div>

              <div style={styles.modalFooter}>
                <button type="submit" style={styles.saveButton}>
                  Save Changes
                </button>
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: '1200px',
    margin: '0 auto'
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px'
  },
  header: {
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '30px'
  },
  tableContainer: {
    overflowX: 'auto',
    boxShadow: '0 0 20px rgba(0,0,0,0.1)',
    borderRadius: '8px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white'
  },
  th: {
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '12px 15px',
    textAlign: 'left'
  },
  tr: {
    borderBottom: '1px solid #dddddd'
  },
  td: {
    padding: '12px 15px',
    verticalAlign: 'middle'
  },
  editButton: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '5px',
    fontSize: '14px'
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'linear-gradient(135deg, #d4edda, #a8df8e)',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalHeader: {
    padding: '15px 20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer'
  },
  modalForm: {
    padding: '20px'
  },
  formGroup: {
    marginBottom: '15px'
  },
  formRow: {
    display: 'flex',
    gap: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    minHeight: '80px',
    resize: 'vertical'
  },
  modalFooter: {
    padding: '15px 20px',
    borderTop: '1px solid #eee',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  saveButton: {
    backgroundColor: '#27ae60',
    marginRight: '300px',
    fontSize: '16px',
    color: 'white',
    border: 'none',
    padding: '8px 2px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default WasteBinManagementPage;