import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaChevronLeft, FaChevronRight, FaTrash, FaEdit, FaPlus, FaSearch } from "react-icons/fa";
import styles from "./WasteBinManagement.module.css";
import Cookies from "js-cookie";

const baseUrl = "https://greencityapi.runasp.net/";

// Custom hook for pagination with session storage
const usePagination = (key, initialPage = 1) => {
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = sessionStorage.getItem(key);
    return saved ? parseInt(saved) : initialPage;
  });

  useEffect(() => {
    sessionStorage.setItem(key, currentPage);
  }, [currentPage, key]);

  return [currentPage, setCurrentPage];
};

export default function RegionsBinsManagement() {
  const [bins, setBins] = useState([]);
  const [regions, setRegions] = useState([]);
  const [showBinModal, setShowBinModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedBin, setSelectedBin] = useState(null);
  const [filterRegion, setFilterRegion] = useState("All");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination
  const [binPage, setBinPage] = usePagination('binPage');
  const [regionPage, setRegionPage] = usePagination('regionPage');
  const itemsPerPage = 5;

  // Get auth token
  const getAuthToken = () => {
    return Cookies.get("token");
  };

  // Fetch regions
  const fetchRegions = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${baseUrl}api/Regions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch regions');
      
      const data = await response.json();
      // remove "None" region if it exists
      const filteredData = data.filter(region => region.regionName !== "None");
      setRegions(filteredData);
    } catch (error) {
      toast.error(`Error fetching regions: ${error.message}`);
    }
  };

  // Fetch bins
  const fetchBins = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${baseUrl}api/Bins`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch bins');
      
      const data = await response.json();
      //remove bin that 0
      const filteredData = data.filter(bin => bin.binNumber !== 0);
      setBins(filteredData);
    } catch (error) {
      toast.error(`Error fetching bins: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update region bin count
  const updateRegionBinCount = (regionId, increment) => {
    setRegions(prevRegions => 
      prevRegions.map(region => 
        region.id === regionId 
          ? { ...region, numOfBins: region.numOfBins + increment } 
          : region
      )
    );
  };

  // Check if region name exists
  const regionNameExists = (regionName, excludeId = null) => {
    return regions.some(region => 
      region.regionName.toLowerCase() === regionName.toLowerCase() && 
      region.id !== excludeId
    );
  };

  // Check if bin number exists in region
  const binNumberExistsInRegion = (regionId, binNumber, excludeId = null) => {
    return bins.some(bin => 
      bin.regionId === regionId && 
      bin.binNumber === binNumber && 
      bin.id !== excludeId
    );
  };

  // Add new bin
  const addBin = async (values) => {
    try {
      const token = getAuthToken();
      const regionId = parseInt(values.regionId);
      const binNumber = parseInt(values.binNumber);
      
      // Validate bin number doesn't exist in this region
      if (binNumberExistsInRegion(regionId, binNumber)) {
        toast.error(`Bin number ${binNumber} already exists in this region`);
        return false;
      }
      
      const response = await fetch(`${baseUrl}api/Bins`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          binNumber: binNumber,
          binLocation: values.binLocation,
          binStatus: "valid",
          fullness: "empty",
          regionId: regionId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to add bin');
      }
      
      const newBin = await response.json();
      setBins(prev => [...prev, newBin]);
      
      // Update region bin count
      updateRegionBinCount(regionId, 1);
      
      toast.success("Bin added successfully");
      return true;
    } catch (error) {
      toast.error(`Error adding bin: ${error.message}`);
      return false;
    }
  };

  // Update bin
  const updateBin = async (binId, values) => {
    try {
      const token = getAuthToken();
      const regionId = parseInt(values.regionId);
      const binNumber = parseInt(values.binNumber);
      
      // Validate bin number doesn't exist in this region
      if (binNumberExistsInRegion(regionId, binNumber, binId)) {
        toast.error(`Bin number ${binNumber} already exists in this region`);
        return false;
      }
      
      const response = await fetch(`${baseUrl}api/Bins/${binId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          binNumber: binNumber,
          binLocation: values.binLocation,
          binStatus: "valid",
          fullness: "empty",
          regionId: regionId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update bin');
      }
      
      // Handle 204 No Content
      setBins(prev => prev.map(bin => 
        bin.id === binId ? {
          ...bin,
          binNumber: binNumber,
          binLocation: values.binLocation,
          regionId: regionId
        } : bin
      ));
      
      toast.success("Bin updated successfully");
      return true;
    } catch (error) {
      toast.error(`Error updating bin: ${error.message}`);
      return false;
    }
  };

  // Delete bin
  const deleteBin = async (binId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${baseUrl}api/Bins/${binId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to delete bin');
      }
      
      // Find bin to get regionId for updating count
      const deletedBin = bins.find(bin => bin.id === binId);
      
      setBins(prev => prev.filter(bin => bin.id !== binId));
      
      // Update region bin count
      updateRegionBinCount(deletedBin.regionId, -1);
      
      // Adjust pagination if we deleted the last item on the page
      const newFilteredBins = bins.filter(bin => 
        filterRegion === "All" ? true : bin.regionId === parseInt(filterRegion)
      ).filter(bin => bin.id !== binId);
      
      const newTotalPages = Math.ceil(newFilteredBins.length / itemsPerPage);
      if (binPage > newTotalPages && newTotalPages > 0) {
        setBinPage(newTotalPages);
      }
      
      toast.success("Bin deleted successfully");
      return true;
    } catch (error) {
      toast.error(`Error deleting bin: ${error.message}`);
      return false;
    }
  };

  // Add new region
  const addRegion = async (values) => {
    try {
      const token = getAuthToken();
      const regionName = values.regionName.trim();
      
      // Validate region name doesn't exist
      if (regionNameExists(regionName)) {
        toast.error(`Region "${regionName}" already exists`);
        return false;
      }
      
      const response = await fetch(`${baseUrl}api/Regions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          regionName: regionName,
          numOfBins: 0
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to add region');
      }
      
      const newRegion = await response.json();
      setRegions(prev => [...prev, newRegion]);
      toast.success("Region added successfully");
      return true;
    } catch (error) {
      toast.error(`Error adding region: ${error.message}`);
      return false;
    }
  };

  // Update region
  const updateRegion = async (regionId, values) => {
    try {
      const token = getAuthToken();
      const regionName = values.regionName.trim();
      
      // Validate region name doesn't exist
      if (regionNameExists(regionName, regionId)) {
        toast.error(`Region "${regionName}" already exists`);
        return false;
      }
      
      const regionToUpdate = regions.find(r => r.id === regionId);
      
      const response = await fetch(`${baseUrl}api/Regions/${regionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          regionName: regionName,
          numOfBins: regionToUpdate.numOfBins
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update region');
      }
      
      // Handle 204 No Content
      setRegions(prev => prev.map(region => 
        region.id === regionId ? {
          ...region,
          regionName: regionName
        } : region
      ));
      
      toast.success("Region updated successfully");
      return true;
    } catch (error) {
      toast.error(`Error updating region: ${error.message}`);
      return false;
    }
  };

  // Delete region
  const deleteRegion = async (regionId) => {
    try {
      const token = getAuthToken();
      // First delete all bins in this region
      const binsToDelete = bins.filter(bin => bin.regionId === regionId);
      await Promise.all(binsToDelete.map(async binId =>  {
         const token = getAuthToken();
      const response = await fetch(`${baseUrl}api/Bins/${binId.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to delete bin');
      }
      
      // Find bin to get regionId for updating count
      const deletedBin = bins.find(bin => bin.id === binId.id);
      
      setBins(prev => prev.filter(bin => bin.id !== binId.id));
      
      // Update region bin count
      updateRegionBinCount(deletedBin.regionId, -1);
      
      // Adjust pagination if we deleted the last item on the page
      const newFilteredBins = bins.filter(bin => 
        filterRegion === "All" ? true : bin.regionId === parseInt(filterRegion)
      ).filter(bin => bin.id !== binId);
      
      const newTotalPages = Math.ceil(newFilteredBins.length / itemsPerPage);
      if (binPage > newTotalPages && newTotalPages > 0) {
        setBinPage(newTotalPages);
      }
      }));
      
      // Then delete the region
      const response = await fetch(`${baseUrl}api/Regions/${regionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to delete region');
      }
      
      setRegions(prev => prev.filter(region => region.id !== regionId));
      
      // Adjust pagination if we deleted the last item on the page
      const newRegions = regions.filter(region => region.id !== regionId);
      const newTotalPages = Math.ceil(newRegions.length / itemsPerPage);
      if (regionPage > newTotalPages && newTotalPages > 0) {
        setRegionPage(newTotalPages);
      }
      toast.success("Region and all associated bins deleted");
      return true;
    } catch (error) {
      toast.error(`Error deleting region: ${error.message}`);
      return false;
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchRegions();
      await fetchBins();
    };
    
    fetchData();
  }, []);

  // Filtered bins
  const filteredBins = bins.filter(bin => {
    const matchesRegion = filterRegion === "All" ? true : 
      bin.regionId === parseInt(filterRegion);
    
    const matchesSearch = bin.binLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bin.binNumber.toString().includes(searchTerm);
    
    return matchesRegion && matchesSearch;
  });

  // Paginated data
  const paginate = (data, page) => {
    const start = (page - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  };

  // Bin Form
  const binFormik = useFormik({
    initialValues: {
      regionId: "",
      binNumber: "",
      binLocation: ""
    },
    validationSchema: Yup.object({
      regionId: Yup.string().required("Required"),
      binNumber: Yup.number()
        .required("Required")
        .positive("Must be positive")
        .integer("Must be integer"),
      binLocation: Yup.string().required("Required")
    }),
    onSubmit: async (values) => {
      const success = selectedBin 
        ? await updateBin(selectedBin.id, values)
        : await addBin(values);
      
      if (success) {
        setShowBinModal(false);
        binFormik.resetForm();
      }
    }
  });

  // Region Form
  const regionFormik = useFormik({
    initialValues: {
      regionName: "",
    },
    validationSchema: Yup.object({
      regionName: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      const success = selectedRegion
        ? await updateRegion(selectedRegion.id, values)
        : await addRegion(values);
      
      if (success) {
        setShowRegionModal(false);
        regionFormik.resetForm();
      }
    }
  });

  // Handle region deletion
  const handleDeleteRegion = (regionId) => {
      deleteRegion(regionId);
  };

  // Handle bin deletion
  const handleDeleteBin = (binId) => {
      deleteBin(binId);
  };

  // Reset forms when modal is closed
  const handleBinModalClose = () => {
    setShowBinModal(false);
    binFormik.resetForm();
    setSelectedBin(null);
  };

  const handleRegionModalClose = () => {
    setShowRegionModal(false);
    regionFormik.resetForm();
    setSelectedRegion(null);
  };

  // Get region name by ID
  const getRegionName = (regionId) => {
    const region = regions.find(r => r.id === regionId);
    return region ? region.regionName : "Unknown Region";
  };

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>🌱 Waste Management System</h1>
          <p className={styles.subtitle}>Manage regions and bins efficiently</p>
        </div>
        <div className={styles.controls}>
          <Button 
            variant="success" 
            className={styles.controlButton}
            onClick={() => {
              setSelectedBin(null);
              binFormik.resetForm();
              setShowBinModal(true);
            }}
          >
            <FaPlus /> Add New Bin
          </Button>
          <Button 
            variant="success" 
            className={styles.controlButton}
            onClick={() => {
              setSelectedRegion(null);
              regionFormik.resetForm();
              setShowRegionModal(true);
            }}
          >
            <FaPlus /> Add New Region
          </Button>
        </div>
      </div>

      {/* Regions Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>🗺️ Regions ({regions.length})</h2>
          <div className={styles.sectionStats}>
            <div className={styles.statCard}>
              <span>Total Regions</span>
              <strong>{regions.length}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Total Bins</span>
              <strong>{bins.length}</strong>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spinner animation="border" variant="success" />
            <span>Loading regions...</span>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Region Name</th>
                  <th>Number of Bins</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginate(regions, regionPage).map(region => (
                  <tr key={region.id}>
                    <td>{region.regionName}</td>
                    <td>
                      <span className={styles.binCount}>
                        {region.numOfBins}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <Button 
                        variant="outline-success"
                        className={styles.actionButton}
                        onClick={() => {
                          setSelectedRegion(region);
                          regionFormik.setValues(region);
                          setShowRegionModal(true);
                        }}
                      >
                        <FaEdit /> Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        className={styles.actionButton}
                        onClick={() => handleDeleteRegion(region.id)}
                      >
                        <FaTrash /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {regions.length === 0 && (
              <div className={styles.noData}>
                <p>No regions found. Add your first region to get started!</p>
              </div>
            )}
            
            {regions.length > itemsPerPage && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setRegionPage(Math.max(1, regionPage - 1))} 
                  disabled={regionPage === 1}
                  className={styles.pagButton}
                >
                  <FaChevronLeft />
                </button>
                <span className={styles.pageIndicator}>
                  Page {regionPage} of {Math.ceil(regions.length/itemsPerPage)}
                </span>
                <button
                  onClick={() => setRegionPage(Math.min(Math.ceil(regions.length/itemsPerPage), regionPage + 1))} 
                  disabled={regionPage === Math.ceil(regions.length/itemsPerPage)}
                  className={styles.pagButton}
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bins Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>🗑️ Bins ({filteredBins.length})</h2>
          
          <div className={styles.filterContainer}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search bins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <select 
              value={filterRegion} 
              onChange={(e) => setFilterRegion(e.target.value)}
              className={styles.select}
            >
              <option value="All">All Regions</option>
              {regions.map(region => (
                <option key={region.id} value={region.id}>
                  {region.regionName}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spinner animation="border" variant="success" />
            <span>Loading bins...</span>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Region</th>
                  <th>Bin Number</th>
                  <th>Location</th>
                  {/* <th>Status</th> */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginate(filteredBins, binPage).map(bin => (
                  <tr key={bin.id}>
                    <td>{getRegionName(bin.regionId)}</td>
                    <td>{bin.binNumber}</td>
                    <td>{bin.binLocation}</td>
                    {/* <td>
                      <span className={`${styles.statusBadge} ${
                        bin.binStatus === "valid" ? styles.valid : styles.invalid
                      }`}>
                        {bin.binStatus}
                      </span>
                    </td> */}
                    <td className={styles.actionsCell}>
                      <Button 
                        variant="outline-success"
                        className={styles.actionButton}
                        onClick={() => {
                          setSelectedBin(bin);
                          binFormik.setValues({
                            regionId: bin.regionId,
                            binNumber: bin.binNumber,
                            binLocation: bin.binLocation
                          });
                          setShowBinModal(true);
                        }}
                      >
                        <FaEdit /> Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        className={styles.actionButton}
                        onClick={() => handleDeleteBin(bin.id)}
                      >
                        <FaTrash /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredBins.length === 0 && (
              <div className={styles.noData}>
                <p>No bins found. Add your first bin to get started!</p>
              </div>
            )}
            
            {filteredBins.length > itemsPerPage && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setBinPage(Math.max(1, binPage - 1))} 
                  disabled={binPage === 1}
                  className={styles.pagButton}
                >
                  <FaChevronLeft />
                </button>
                <span className={styles.pageIndicator}>
                  Page {binPage} of {Math.ceil(filteredBins.length/itemsPerPage)}
                </span>
                <button
                  onClick={() => setBinPage(Math.min(Math.ceil(filteredBins.length/itemsPerPage), binPage + 1))} 
                  disabled={binPage === Math.ceil(filteredBins.length/itemsPerPage)}
                  className={styles.pagButton}
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <BinModal 
        show={showBinModal}
        onHide={handleBinModalClose}
        formik={binFormik}
        regions={regions}
        isSubmitting={binFormik.isSubmitting}
      />
      
      <RegionModal 
        show={showRegionModal}
        onHide={handleRegionModalClose}
        formik={regionFormik}
        isSubmitting={regionFormik.isSubmitting}
      />
    </div>
  );
}

// Modal Components
const BinModal = ({ show, onHide, formik, regions, isSubmitting }) => (
  <Modal show={show} onHide={onHide} centered className={styles.modal}>
    <Modal.Header closeButton className={styles.modalHeader}>
      <Modal.Title>{formik.values.id ? "Edit Bin" : "Add New Bin"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <form onSubmit={formik.handleSubmit}>
        <div className={styles.formGroup}>
          <label>Region</label>
          <select
            name="regionId"
            value={formik.values.regionId}
            onChange={formik.handleChange}
            className={styles.select}
            disabled={isSubmitting}
          >
            <option value="">Select Region</option>
            {regions.map(region => (
              <option key={region.id} value={region.id}>
                {region.regionName}
              </option>
            ))}
          </select>
          {formik.touched.regionId && formik.errors.regionId && (
            <div className={styles.error}>{formik.errors.regionId}</div>
          )}
        </div>
        <div className={styles.formGroup}>
          <label>Bin Number</label>
          <input
            type="number"
            name="binNumber"
            value={formik.values.binNumber}
            onChange={formik.handleChange}
            className={styles.input}
            disabled={isSubmitting}
          />
          {formik.touched.binNumber && formik.errors.binNumber && (
            <div className={styles.error}>{formik.errors.binNumber}</div>
          )}
        </div>
        <div className={styles.formGroup}>
          <label>Location</label>
          <input
            type="text"
            name="binLocation"
            value={formik.values.binLocation}
            onChange={formik.handleChange}
            className={styles.input}
            disabled={isSubmitting}
          />
          {formik.touched.binLocation && formik.errors.binLocation && (
            <div className={styles.error}>{formik.errors.binLocation}</div>
          )}
        </div>
        <div className={styles.modalFooter}>
          <Button variant="outline-secondary" onClick={onHide} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="success" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Modal.Body>
  </Modal>
);

const RegionModal = ({ show, onHide, formik, isSubmitting }) => (
  <Modal show={show} onHide={onHide} centered className={styles.modal}>
    <Modal.Header closeButton className={styles.modalHeader}>
      <Modal.Title>{formik.values.id ? "Edit Region" : "Add New Region"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <form onSubmit={formik.handleSubmit}>
        <div className={styles.formGroup}>
          <label>Region Name</label>
          <input
            type="text"
            name="regionName"
            value={formik.values.regionName}
            onChange={formik.handleChange}
            className={styles.input}
            disabled={isSubmitting}
          />
          {formik.touched.regionName && formik.errors.regionName && (
            <div className={styles.error}>{formik.errors.regionName}</div>
          )}
        </div>
        <div className={styles.modalFooter}>
          <Button variant="outline-secondary" onClick={onHide} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="success" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Modal.Body>
  </Modal>
);