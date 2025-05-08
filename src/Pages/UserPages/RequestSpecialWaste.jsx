import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Badge, Toast, ToastContainer, Modal, Row, Col } from 'react-bootstrap';

const API_URL = 'http://localhost:3000/requests';

const WasteCollectionApp = () => {
  // Form state
  const [formData, setFormData] = useState({
    id:'',
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
    paymentMethod: 'electronic'
  });

  // UI state
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const itemsPerPage = 5;

  // Fetch data from db.json
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error('Error loading requests:', error);
        setToastMessage('Failed to load requests');
        setShowToast(true);
      }
    };
    fetchRequests();
  }, []);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [requests.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateCost = () => {
    if (!formData.estimatedQuantity) return 0;
    return parseFloat(formData.estimatedQuantity) * 5;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const requestData = {
      ...formData,
      id: editingId || formData.id, // Ensure ID is included
      estimatedQuantity: formData.estimatedQuantity ? parseFloat(formData.estimatedQuantity) : null,
      status: 'pending',
      paymentStatus: paymentStatus
    };

    try {
      if (editingId) {
        // Explicitly include the ID in the URL and body
        await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({...requestData, id: editingId})
        });
        setToastMessage('Request updated successfully');
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        });
        setToastMessage('Request added successfully');
      }

      const response = await fetch(API_URL);
      const data = await response.json();
      setRequests(data);
      
      setShowToast(true);
      resetForm();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error saving request:', error);
      setToastMessage('Error saving request');
      setShowToast(true);
      setEditingId(null); // Reset editingId on error
    }
  };

  const handleEdit = (id) => {
    const requestToEdit = requests.find(r => r.id === id);
    if (requestToEdit) {
      setFormData({
        ...requestToEdit,
        id: requestToEdit.id, // Explicitly set the id
        estimatedQuantity: requestToEdit.estimatedQuantity?.toString() || ''
      });
      setPaymentStatus(requestToEdit.paymentStatus || 'unpaid');
      setEditingId(requestToEdit.id); // Set editingId to the request's id
      setShowEditModal(true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        const response = await fetch(API_URL);
        const data = await response.json();
        setRequests(data);
        setToastMessage('Request deleted successfully');
        setShowToast(true);
      } catch (error) {
        console.error('Error deleting request:', error);
        setToastMessage('Error deleting request');
        setShowToast(true);
      }
    }
  };

  const handlePayment = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'paid' })
      });
      const response = await fetch(API_URL);
      const data = await response.json();
      setRequests(data);
      setToastMessage('Payment processed successfully');
      setShowToast(true);
    } catch (error) {
      console.error('Error processing payment:', error);
      setToastMessage('Error processing payment');
      setShowToast(true);
    }
  };

  const resetForm = () => {
    setFormData({
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
      paymentMethod: 'electronic'
    });
    setPaymentStatus('unpaid');
    setEditingId(null);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = requests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  return (
    <div className="container-fluid py-4">
      <ToastContainer position="top-end">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <h2 className="text-center mb-4">Waste Collection Requests</h2>
      
      {/* New Request Section */}
      <div className="card mb-4">
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
                  />
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
                  />
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
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Pickup Time *</Form.Label>
                  <Form.Control
                    type="time"
                    name="pickupTime"
                    value={formData.pickupTime}
                    onChange={handleChange}
                    required
                  />
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
                    <Form.Group >
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
              >
                {editingId ? 'Update Request' : 'Submit Request'}
              </Button>
            </div>
          </Form>
        </div>
      </div>

      {/* Existing Requests Table */}
      <div className="card">
        <div className="card-header bg-success text-white">
          <h4>My Requests</h4>
        </div>
        <div className="card-body">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Source</th>
                <th>Institution</th>
                <th>Waste Type</th>
                <th>Quantity</th>
                <th>Pickup Date</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Payment</th>
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
                    <td>{request.pickupDate}</td>
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
                      {request.paymentStatus === 'paid' ? (
                        <Badge bg="success">Paid</Badge>
                      ) : (
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          onClick={() => handlePayment(request.id)}
                        >
                          Pay Now
                        </Button>
                      )}
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={() => handleEdit(request.id)}
                        className="me-2"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleDelete(request.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center">No requests found</td>
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
                        style={currentPage === page ? {backgroundColor: 'green', color: 'white'} : {}}
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => {
        setShowEditModal(false);
        setEditingId(null);
      }} size="lg">
        <Modal.Header closeButton style={{ background: "linear-gradient(135deg, #d4edda, #a8df8e)" }}>
          <Modal.Title>Edit Request</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: "linear-gradient(135deg, #d4edda, #a8df8e)" }}>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Request Source</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.requestSourceType}
                    readOnly
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Institution Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="institutionName"
                    value={formData.institutionName}
                    onChange={handleChange}
                    required
                  />
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
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Payment Status</Form.Label>
                  <Form.Select 
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
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
        <Modal.Footer style={{ background: "linear-gradient(135deg, #d4edda, #a8df8e)" }}>
          <Button variant="secondary" onClick={() => {
            setShowEditModal(false);
            setEditingId(null);
          }}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WasteCollectionApp;