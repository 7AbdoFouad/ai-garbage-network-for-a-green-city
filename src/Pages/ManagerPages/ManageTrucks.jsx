import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const WasteBinManagementPage = () => {
  const [allEntries, setAllEntries] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMaterials, setExpandedMaterials] = useState({});

  const SORTING_STORE_API = 'https://greencityapi.runasp.net/api/Warehouse';
  const WAREHOUSE_API = 'https://greencityapi.runasp.net/api/StorageWarehouse';
  const DELETE_API = 'https://greencityapi.runasp.net/api/Warehouse';
  const getAuthToken = () => Cookies.get("token");

  const materialIcons = {
    Wood: '🪵',
    Plastic: '🧴',
    Paper: '📄',
    Glass: '🍾',
    Metals: '🔩',
    Default: '🧱'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const [entriesResponse, warehousesResponse] = await Promise.all([
        axios.get(SORTING_STORE_API, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }),
        axios.get(WAREHOUSE_API, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        })
      ]);
      setAllEntries(entriesResponse.data);
      setWarehouses(warehousesResponse.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const groupEntriesByMaterial = (entries) => {
    const grouped = {};
    entries.forEach(entry => {
      if (!grouped[entry.material]) {
        grouped[entry.material] = [];
      }
      grouped[entry.material].push(entry);
    });
    return grouped;
  };

  const toggleMaterial = (warehouseId, material) => {
    setExpandedMaterials(prev => ({
      ...prev,
      [`${warehouseId}-${material}`]: !prev[`${warehouseId}-${material}`]
    }));
  };

  const getMaterialIcon = (material) => {
    return materialIcons[material] || materialIcons.Default;
  };

  const handleDelete = async (entry) => {
    try {
      const token = getAuthToken();
      await axios.delete(`${DELETE_API}/${entry.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAllEntries(prev => prev.filter(e => e.id !== entry.id));

      setWarehouses(prev =>
        prev.map(warehouse =>
          warehouse.warehouseName === entry.warehouseName
            ? {
                ...warehouse,
                currentCapacity: warehouse.currentCapacity - entry.quantity
              }
            : warehouse
        )
      );

      toast.success('Report deleted successfully');
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  return (
    <div style={styles.pageContainer}>
      <h1 style={styles.pageTitle}>📦 All Warehouse Reports</h1>
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading warehouse data...</p>
        </div>
      ) : (
        <div style={styles.warehousesGrid}>
          {warehouses.map(warehouse => {
            const relatedEntries = allEntries.filter(e => e.warehouseName === warehouse.warehouseName);
            const groupedEntries = groupEntriesByMaterial(relatedEntries);

            return (
              <div key={warehouse.id} style={styles.cardContainer}>
                <div style={styles.cardHeader}>
                  <h2 style={styles.cardTitle}>{warehouse.warehouseName}</h2>
                  <div style={styles.capacityMeter}>
                    <div 
                      style={{
                        width: `${(warehouse.currentCapacity / warehouse.totalCapacity) * 100}%`,
                        backgroundColor: warehouse.currentCapacity / warehouse.totalCapacity > 0.8 
                          ? '#e74c3c' 
                          : '#2ecc71'
                      }}
                    ></div>
                  </div>
                </div>
                
                <div style={styles.cardBody}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoIcon}>📍</span>
                    <p style={styles.infoText}>{warehouse.address}</p>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoIcon}>📦</span>
                    <p style={styles.infoText}>
                      {warehouse.currentCapacity} / {warehouse.totalCapacity} kg
                    </p>
                  </div>

                  {Object.keys(groupedEntries).length === 0 ? (
                    <div style={styles.emptyState}>
                      <p style={styles.noDataText}>No material data available</p>
                    </div>
                  ) : (
                    <div style={styles.materialsContainer}>
                      {Object.entries(groupedEntries).map(([material, entries]) => (
                        <div key={material} style={styles.materialCard}>
                          <div 
                            onClick={() => toggleMaterial(warehouse.id, material)} 
                            style={styles.materialHeader}
                          >
                            <div style={styles.materialTitle}>
                              <span style={styles.materialIcon}>{getMaterialIcon(material)}</span>
                              <h3 style={styles.materialName}>{material}</h3>
                            </div>
                            <span style={styles.toggleIcon}>
                              {expandedMaterials[`${warehouse.id}-${material}`] ? '−' : '+'}
                            </span>
                          </div>
                          
                          {expandedMaterials[`${warehouse.id}-${material}`] && (
                            <div style={styles.tableContainer}>
                              <table style={styles.table}>
                                <thead>
                                  <tr style={styles.tableHeadRow}>
                                    <th style={styles.tableHeader}>Quantity</th>
                                    <th style={styles.tableHeader}>Price</th>
                                    <th style={styles.tableHeader}>Manager</th>
                                    <th style={styles.tableHeader}>Date</th>
                                    <th style={styles.tableHeader}>Description</th>
                                    <th style={styles.tableHeader}>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {entries.map((entry, index) => (
                                    <tr key={index} style={styles.tableRow}>
                                      <td style={styles.tableCell}>{entry.quantity} kg</td>
                                      <td style={styles.tableCell}>${entry.price}</td>
                                      <td style={styles.tableCell}>{entry.warehouseManager}</td>
                                      <td style={styles.tableCell}>
                                        {new Date(entry.sendAt).toLocaleDateString()}
                                      </td>
                                      <td style={styles.tableCell}>{entry.description}</td>
                                      <td style={styles.tableCell}>
                                        <button 
                                          onClick={() => handleDelete(entry)} 
                                          style={{
                                            backgroundColor: '#e74c3c',
                                            color: 'white',
                                            border: 'none',
                                            padding: '6px 10px',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                          }}
                                        >
                                          Delete
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  pageContainer: {
    padding: '2rem',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    fontFamily: "'Poppins', sans-serif",
    maxWidth: '1800px',
    margin: '0 auto'
  },
  pageTitle: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '2.5rem',
    fontSize: '2.5rem',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #2ecc71',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  loadingText: {
    color: '#7f8c8d',
    fontSize: '1.1rem',
    fontWeight: '500'
  },
  warehousesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '2rem',
    padding: '0 1rem'
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },
  cardHeader: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '1.5rem',
    position: 'relative'
  },
  cardTitle: {
    margin: '0',
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'white'
  },
  capacityMeter: {
    height: '6px',
    backgroundColor: '#ecf0f1',
    borderRadius: '3px',
    marginTop: '1rem',
    overflow: 'hidden'
  },
  cardBody: {
    padding: '1.5rem'
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.75rem'
  },
  infoIcon: {
    marginRight: '0.75rem',
    fontSize: '1.2rem'
  },
  infoText: {
    margin: '0',
    color: '#34495e',
    fontSize: '0.95rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '1.5rem 0',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    marginTop: '1rem'
  },
  noDataText: {
    color: '#95a5a6',
    fontSize: '0.9rem',
    margin: '0'
  },
  materialsContainer: {
    marginTop: '1.5rem'
  },
  materialCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    marginBottom: '1rem',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  materialHeader: {
    backgroundColor: '#e8f4f8',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  materialTitle: {
    display: 'flex',
    alignItems: 'center'
  },
  materialIcon: {
    fontSize: '1.5rem',
    marginRight: '0.75rem'
  },
  materialName: {
    margin: '0',
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#2c3e50'
  },
  toggleIcon: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#7f8c8d'
  },
  tableContainer: {
    overflowX: 'auto',
    padding: '0.5rem'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem'
  },
  tableHeadRow: {
    backgroundColor: '#e8f4f8'
  },
  tableHeader: {
    padding: '0.75rem',
    textAlign: 'left',
    fontWeight: '600',
    color: '#2c3e50',
    borderBottom: '2px solid #dfe6e9'
  },
  tableRow: {
    // Pseudo-classes removed from style object
  },
  tableCell: {
    padding: '0.75rem',
    borderBottom: '1px solid #dfe6e9',
    color: '#34495e'
  }
};

export default WasteBinManagementPage;