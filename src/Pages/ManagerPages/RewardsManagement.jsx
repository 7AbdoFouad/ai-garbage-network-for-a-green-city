import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Alert } from 'react-bootstrap';
import * as RewardsService from '../ManagerPages/RewardsService';
import styles from './RewardsManagement.module.css';

export default function RewardsManagement() {
  const [rewards, setRewards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentReward, setCurrentReward] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form state
  const [formData, setFormData] = useState({
    rewardName: '',
    rewardDesc: '',
    rewardValue: '',
    ExpiryDate: '',
    rewardRequirements: {
      numOfAcceptedAnnouncements: 0,
      numOfCompletedActivities: 0,
      numOfCompletedPolls: 0
    }
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const rewardsData = await RewardsService.getRewards();
      setRewards(rewardsData);
      setError(null);
    } catch (err) {
      setError('فشل تحميل المكافآت. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRequirementsChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      rewardRequirements: {
        ...prev.rewardRequirements,
        [name]: parseInt(value) || 0
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editMode) {
        await RewardsService.updateReward(currentReward.id, formData);
        setSuccess('تم تحديث المكافأة بنجاح');
      } else {
        await RewardsService.addReward(formData);
        setSuccess('تم إضافة المكافأة بنجاح');
      }
      fetchRewards(); // Refresh data after update
      setShowModal(false);
    } catch (err) {
      setError('فشل حفظ المكافأة. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleEdit = (reward) => {
    setCurrentReward(reward);
    setFormData({
      rewardName: reward.rewardName,
      rewardDesc: reward.rewardDesc,
      rewardValue: reward.rewardValue,
      ExpiryDate: reward.ExpiryDate,
      rewardRequirements: reward.rewardRequirements || {
        numOfAcceptedAnnouncements: 0,
        numOfCompletedActivities: 0,
        numOfCompletedPolls: 0
      }
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("are you sure you want to delete this reward?")) {
      try {
        await RewardsService.deleteReward(id);
        setRewards(prev => prev.filter(r => r.id !== id));
        setSuccess('reward deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError('failed to delete reward. please try again.');
      }
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentReward(null);
    setFormData({
      rewardName: "",
      rewardDesc: "",
      rewardValue: "",
      ExpiryDate: "",
      rewardRequirements: {
        numOfAcceptedAnnouncements: 0,
        numOfCompletedActivities: 0,
        numOfCompletedPolls: 0
      }
    });
  };

  const filteredRewards = rewards.filter(reward => 
    reward.rewardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reward.rewardDesc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRequirementDetails = (reward) => {
    const req = reward.rewardRequirements || {};
    const requirements = [];
    
    if (req.numOfAcceptedAnnouncements > 0) {
      requirements.push(`${req.numOfAcceptedAnnouncements} announcements`);
    }
    if (req.numOfCompletedActivities > 0) {
      requirements.push(`${req.numOfCompletedActivities} activities`);
    }
    if (req.numOfCompletedPolls > 0) {
      requirements.push(`${req.numOfCompletedPolls} polls`);
    }
    
    return requirements.length > 0 ? requirements.join(', ') : 'No requirements';
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRewards.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRewards.length / itemsPerPage);

  return (
    <div className={styles.container}>
      <h2 className="text-center mb-4">Reward Management</h2>
      
      {/* <div className="d-flex justify-content-between mb-4">
        <Form.Control
          type="text"
          placeholder="search by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
          style={{ width: '300px' }}
        />
      </div> */}

      {loading && !showModal && <div className="text-center">جاري التحميل...</div>}
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Table striped bordered hover responsive className="mt-4" dir="rtl">
  <thead className="bg-dark text-white">
    <tr style={{ width: '200px', textAlign: 'center' }}>
      <th >Actions</th>
      <th>Requirements</th>
      <th>Expiry Date</th>
      <th>Value</th>
      <th>Description</th>
      <th>Reward Name</th>
      
    </tr>
  </thead>
  <tbody>
    {currentItems.map((reward) => (
      <tr key={reward.id } style={{ textAlign: 'center' , width: '200px'} }>
        <td>
          <div className="d-flex" style={{ gap: '10px', justifyContent: 'flex-end' }}>
            <Button
              variant="warning"
              size="sm"
              onClick={() => handleEdit(reward)}
              style={{ marginBottom: '10px' ,marginLeft: '15px'}}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(reward.id)}
              style={{ marginBottom: '10px', marginLeft: '30px' }}
            >
              Delete
            </Button>
          </div>
        </td>
        <td style={{ textAlign: 'center' }}>
          <Badge bg="success" >
            {getRequirementDetails(reward)}
          </Badge>
        </td>
        <td>{reward.ExpiryDate}</td>
        <td>{reward.rewardValue}</td>
        <td>{reward.rewardDesc}</td>
        <td>{reward.rewardName}</td>
      </tr>
    ))}
  </tbody>
</Table>
      {/* Pagination */}
     {filteredRewards.length > itemsPerPage && (
  <div className="d-flex justify-content-center mt-4">
    <nav>
      <ul className="pagination">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            &laquo;
          </button>
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => setCurrentPage(page)}
              style={{ 
                backgroundColor: currentPage === page ? '#28a745' : '#f8f9fa', 
                color: currentPage === page ? 'white' : '#28a745',
                borderColor: '#28a745'
              }}
            >
              {page}
            </button>
          </li>
        ))}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            style={{ backgroundColor: currentPage === totalPages ? '#f8f9fa' : '#28a745', color: currentPage === totalPages ? '#6c757d' : 'white' }}
          >
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  </div>
)}


      {/* Add Reward Section */}
      <div className="mt-5 p-4 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
        <h4 className="mb-4">Add New Reward</h4>
        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="rewardName"
                  value={formData.rewardName}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Value</Form.Label>
                <Form.Control
                  type="text"
                  name="rewardValue"
                  value={formData.rewardValue}
                  onChange={handleInputChange}
                  required
                  placeholder="مثال: 5$"
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="rewardDesc"
              value={formData.rewardDesc}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Expiry Date</Form.Label>
            <Form.Control
              type="date"
              name="ExpiryDate"
              value={formData.ExpiryDate}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <h5 className="mt-4">Requirements</h5>
          <div className="row">
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Number of accepted announcements</Form.Label>
                <Form.Control
                  type="number"
                  name="numOfAcceptedAnnouncements"
                  value={formData.rewardRequirements.numOfAcceptedAnnouncements}
                  onChange={handleRequirementsChange}
                  min="0"
                />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Number of completed activities</Form.Label>
                <Form.Control
                  type="number"
                  name="numOfCompletedActivities"
                  value={formData.rewardRequirements.numOfCompletedActivities}
                  onChange={handleRequirementsChange}
                  min="0"
                />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Number of completed polls</Form.Label>
                <Form.Control
                  type="number"
                  name="numOfCompletedPolls"
                  value={formData.rewardRequirements.numOfCompletedPolls}
                  onChange={handleRequirementsChange}
                  min="0"
                />
              </Form.Group>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={handleClose} className="me-2" >
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Add Reward'}
            </Button>
          </div>
        </Form>
      </div>
      
    </div>
  );
}
