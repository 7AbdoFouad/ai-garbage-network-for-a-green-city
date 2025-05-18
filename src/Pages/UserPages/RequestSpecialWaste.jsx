import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Table, Badge, Toast, ToastContainer, Modal, Row, Col, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

const API_URL = 'http://localhost:3000/requests';

const WasteCollectionApp = () => {
  const{id}=useParams();
  // Initial form state
  const initialFormState = {
    id: '',
    requestSourceType: '',
    institutionName: '',
    contactNumber: '',
    locationAddress: '',
    wasteType: '',
    estimatedQuantity: '',
    quantityUnit: 'kg',
    pickupDate: '',
    pickupTime: '',
    notes: '',
    paymentMethod: 'electronic',
    userId:id
  };

  // State management
  const [formData, setFormData] = useState(initialFormState);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [validationErrors, setValidationErrors] = useState({});
  const itemsPerPage = 5;

  // Memoized fetch function
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
      setToastMessage('Failed to load requests');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch requests on component mount
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Reset current page when requests change
  useEffect(() => {
    setCurrentPage(1);
  }, [requests.length]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.requestSourceType) errors.requestSourceType = 'Required';
    if (!formData.institutionName) errors.institutionName = 'Required';
    if (!formData.locationAddress) errors.locationAddress = 'Required';
    if (!formData.pickupDate) errors.pickupDate = 'Required';
    if (!formData.pickupTime) errors.pickupTime = 'Required';
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when field changes
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const calculateCost = useCallback(() => {
    if (!formData.estimatedQuantity) return 0;
    return parseFloat(formData.estimatedQuantity) * 5;
  }, [formData.estimatedQuantity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setToastMessage('Please fill in all required fields');
      setShowToast(true);
      return;
    }

    const requestData = {
      ...formData,
      id: editingId || Date.now().toString(), // Generate ID if new
      estimatedQuantity: formData.estimatedQuantity ? parseFloat(formData.estimatedQuantity) : null,
      status: 'pending',
      paymentStatus: paymentStatus,
      cost: calculateCost()
    };

    try {
      setLoading(true);
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) throw new Error(`Failed to ${editingId ? 'update' : 'create'} request`);

      const updatedResponse = await fetch(API_URL);
      const updatedData = await updatedResponse.json();
      setRequests(updatedData);
      
      setToastMessage(`Request ${editingId ? 'updated' : 'added'} successfully`);
      setShowToast(true);
      resetForm();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error saving request:', error);
      setToastMessage(`Error ${editingId ? 'updating' : 'creating'} request: ${error.message}`);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = useCallback((id) => {
    const requestToEdit = requests.find(r => r.id === id);
    if (requestToEdit) {
      setFormData({
        ...requestToEdit,
        estimatedQuantity: requestToEdit.estimatedQuantity?.toString() || ''
      });
      setPaymentStatus(requestToEdit.paymentStatus || 'unpaid');
      setEditingId(id);
      setShowEditModal(true);
    }
  }, [requests]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete request');
      
      const updatedResponse = await fetch(API_URL);
      const updatedData = await updatedResponse.json();
      setRequests(updatedData);
      
      setToastMessage('Request deleted successfully');
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting request:', error);
      setToastMessage('Error deleting request');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePayment = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'paid' })
      });
      
      if (!response.ok) throw new Error('Failed to process payment');
      
      const updatedResponse = await fetch(API_URL);
      const updatedData = await updatedResponse.json();
      setRequests(updatedData);
      
      setToastMessage('Payment processed successfully');
      setShowToast(true);
    } catch (error) {
      console.error('Error processing payment:', error);
      setToastMessage('Error processing payment');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setPaymentStatus('unpaid');
    setEditingId(null);
    setValidationErrors({});
  }, []);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = requests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  // Render loading state
  if (loading && requests.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Render error state
  if (error && requests.length === 0) {
    return (
      <div className="alert alert-danger">
        <p>Error loading requests: {error}</p>
        <Button variant="primary" onClick={fetchRequests}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide>
          <Toast.Header closeButton={false}>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <h2 className="text-center mb-4">Waste Collection Requests</h2>
      
      {/* New Request Section */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-success text-white">
          <h4>New Collection Request</h4>
        </div>
        <div className="card-body">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Request Source *</Form.Label>
                  <Form.Select 
                    name="requestSourceType" 
                    value={formData.requestSourceType} 
                    onChange={handleChange} 
                    required
                    isInvalid={!!validationErrors.requestSourceType}
                  >
                    <option value="">Select source</option>
                    <option value="Hospital">Hospital</option>
                    <option value="School">School</option>
                    <option value="Factory">Factory</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.requestSourceType}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Institution Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="institutionName"
                    value={formData.institutionName}
                    onChange={handleChange}
                    required
                    isInvalid={!!validationErrors.institutionName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.institutionName}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Contact Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    pattern="[0-9]{11}"
                    placeholder="01XXXXXXXXX"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Location Address *</Form.Label>
                  <Form.Control
                    type="text"
                    name="locationAddress"
                    value={formData.locationAddress}
                    onChange={handleChange}
                    required
                    isInvalid={!!validationErrors.locationAddress}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.locationAddress}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Waste Type</Form.Label>
                  <Form.Select 
                    name="wasteType" 
                    value={formData.wasteType} 
                    onChange={handleChange}
                  >
                    <option value="">Select type</option>
                    <option value="Medical">Medical</option>
                    <option value="General">General</option>
                    <option value="Chemical">Chemical</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Industrial">Industrial</option>
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Estimated Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        name="estimatedQuantity"
                        value={formData.estimatedQuantity}
                        onChange={handleChange}
                        min="0"
                        step="0.1"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Unit</Form.Label>
                      <Form.Select 
                        name="quantityUnit" 
                        value={formData.quantityUnit} 
                        onChange={handleChange}
                      >
                        <option value="kg">kg</option>
                        <option value="liter">liter</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Pickup Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="pickupDate"
                    value={formData.pickupDate}
                    onChange={handleChange}
                    required
                    isInvalid={!!validationErrors.pickupDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.pickupDate}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Pickup Time *</Form.Label>
                  <Form.Control
                    type="time"
                    name="pickupTime"
                    value={formData.pickupTime}
                    onChange={handleChange}
                    required
                    isInvalid={!!validationErrors.pickupTime}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.pickupTime}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Additional Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="card mb-3">
              <div className="card-header bg-light">
                <h5>Payment Information</h5>
              </div>
              <div className="card-body">
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Estimated Cost:</strong> {formData.estimatedQuantity ? `${calculateCost()} EGP` : 'N/A'}
                    </div>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Payment Method *</Form.Label>
                      <Form.Check
                        type="radio"
                        label="Electronic Payment"
                        name="paymentMethod"
                        value="electronic"
                        checked={formData.paymentMethod === 'electronic'}
                        onChange={handleChange}
                        className="mb-2"
                      />
                      <Form.Check 
                        type="radio"
                        label="Pay on Delivery"
                        name="paymentMethod"
                        value="invoice"
                        checked={formData.paymentMethod === 'invoice'}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </div>

            <div className="d-flex justify-content-end">
              <Button 
                variant="success" 
                type="submit"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                ) : editingId ? (
                  'Update Request'
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </Form>
        </div>
      </div>

      {/* Existing Requests Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-success text-white">
          <h4>My Requests</h4>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="d-flex justify-content-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Source</th>
                    <th>Institution</th>
                    <th>Waste Type</th>
                    <th>Quantity</th>
                    <th>Pickup Date</th>
                    <th>Cost</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((request, index) => (
                      <tr key={request.id}>
                        <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                        <td>{request.requestSourceType}</td>
                        <td>{request.institutionName}</td>
                        <td>{request.wasteType || '-'}</td>
                        <td>
                          {request.estimatedQuantity 
                            ? `${request.estimatedQuantity} ${request.quantityUnit}` 
                            : '-'}
                        </td>
                        <td>{new Date(request.pickupDate).toLocaleDateString()}</td>
                        <td>{request.estimatedQuantity ? `${request.estimatedQuantity * 5} EGP` : '-'}</td>
                        <td>
                          <Badge bg={
                            request.status === 'pending' ? 'warning' : 
                            request.status === 'rejected' ? 'danger' : 
                            'success'
                          }>
                            {request.status}
                          </Badge>
                        </td>
                       
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            onClick={() => handleEdit(request.id)}
                            className="me-2"
                            disabled={loading}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => handleDelete(request.id)}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center py-4">No requests found</td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {requests.length > itemsPerPage && (
                <div className="d-flex justify-content-center mt-4">
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                        >
                          &laquo;
                        </button>
                      </li>
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          &lsaquo;
                        </button>
                      </li>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}
                      
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          &rsaquo;
                        </button>
                      </li>
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                        >
                          &raquo;
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => {
        setShowEditModal(false);
        resetForm();
      }} size="lg">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Edit Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Request Source</Form.Label>
                  <Form.Select
                    name="requestSourceType"
                    value={formData.requestSourceType}
                    onChange={handleChange}
                  >
                    <option value="">Select source</option>
                    <option value="Hospital">Hospital</option>
                    <option value="School">School</option>
                    <option value="Factory">Factory</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Institution Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="institutionName"
                    value={formData.institutionName}
                    onChange={handleChange}
                    required
                    isInvalid={!!validationErrors.institutionName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.institutionName}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Contact Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    pattern="[0-9]{11}"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Estimated Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name="estimatedQuantity"
                    value={formData.estimatedQuantity}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Pickup Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="pickupDate"
                    value={formData.pickupDate}
                    onChange={handleChange}
                    required
                    isInvalid={!!validationErrors.pickupDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.pickupDate}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Waste Type</Form.Label>
                  <Form.Select 
                    value={formData.wasteType}
                    onChange={(e) => setFormData({...formData, wasteType: e.target.value})} // Update wasteType directly(e.target.value)}
                  >
                    <option value="">Select type</option>
                    <option value="Medical">Medical</option>
                    <option value="General">General</option>
                    <option value="Chemical">Chemical</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Industrial">Industrial</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Additional Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowEditModal(false);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              'Save Changes'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WasteCollectionApp;