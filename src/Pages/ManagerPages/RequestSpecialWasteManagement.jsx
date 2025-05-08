import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Badge, Toast, ToastContainer } from 'react-bootstrap';

const API_URL = 'http://localhost:3000/requests';

const RequestSpecialWasteManagement = () => {
  // State management
  const [requests, setRequests] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch requests from API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch requests');
        const data = await response.json();
        setRequests(data);
        
        // Recalculate current page if needed
        const newTotalPages = Math.ceil(data.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } catch (error) {
        console.error('Error loading requests:', error);
        setToastMessage('Failed to load requests');
        setShowToast(true);
      }
    };
    fetchRequests();
  }, [currentPage]);

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = requests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle request acceptance
  const handleAccept = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'accepted' })
      });

      if (!response.ok) throw new Error('Failed to accept request');

      // Update local state directly
      setRequests(prev => prev.map(req => 
        req.id === id ? {...req, status: 'accepted'} : req
      ));

      setToastMessage('Request accepted successfully');
      setShowToast(true);
      
      // Recalculate current page if needed
      const newTotalPages = Math.ceil(requests.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      setToastMessage('Error accepting request');
      setShowToast(true);
    }
  };

  // Handle request rejection
  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  // Submit rejection with reason
  const submitRejection = async () => {
    try {
      const response = await fetch(`${API_URL}/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'rejected',
          rejectionReason: rejectionReason 
        })
      });

      if (!response.ok) throw new Error('Failed to reject request');

      // Update local state directly
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id ? {
          ...req, 
          status: 'rejected',
          rejectionReason: rejectionReason
        } : req
      ));

      setToastMessage('Request rejected successfully');
      setShowToast(true);
      setShowRejectModal(false);
      setRejectionReason('');
      
      // Recalculate current page if needed
      const newTotalPages = Math.ceil(requests.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      setToastMessage('Error rejecting request');
      setShowToast(true);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'accepted':
        return <Badge bg="success">Accepted</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="container-fluid py-4">
      <ToastContainer position="top-end">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <h2 className="text-center mb-4">Special Waste Management Requests</h2>
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Institution</th>
            <th>Waste Type</th>
            <th>Quantity</th>
            <th>Pickup Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((request) => (
              <tr key={request.id}>
                <td>{request.id}</td>
                <td>{request.institutionName}</td>
                <td>{request.wasteType || '-'}</td>
                <td>
                  {request.estimatedQuantity 
                    ? `${request.estimatedQuantity} ${request.quantityUnit}` 
                    : '-'}
                </td>
                <td>{request.pickupDate}</td>
                <td>
                  <StatusBadge status={request.status} />
                  {request.status === 'rejected' && request.rejectionReason && (
                    <div className="text-muted small mt-1">Reason: {request.rejectionReason}</div>
                  )}
                </td>
                <td>
                  {request.status === 'pending' && (
                    <>
                      <Button 
                        variant="success" 
                        size="sm" 
                        onClick={() => handleAccept(request.id)}
                        className="me-2"
                      >
                        Accept
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleReject(request)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">No requests found</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination Controls */}
      {requests.length > itemsPerPage && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  &laquo; First
                </button>
              </li>
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>
              
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                </li>
              ))}
              
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </li>
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last &raquo;
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Page Info */}
      <div className="text-center mt-2 text-muted">
        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, requests.length)} of {requests.length} requests
      </div>

      {/* Rejection Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You are about to reject this request from <strong>{selectedRequest?.institutionName}</strong>.</p>
          <p>Please provide a reason for rejection:</p>
          
          <Form.Group className="mb-3">
            <Form.Label>Rejection Reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={submitRejection}
            disabled={!rejectionReason}
          >
            Confirm Rejection
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RequestSpecialWasteManagement;