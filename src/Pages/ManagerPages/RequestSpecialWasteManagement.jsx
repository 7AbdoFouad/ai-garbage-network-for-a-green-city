import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Badge, Toast, ToastContainer, Spinner } from 'react-bootstrap';

const API_URL = 'http://localhost:3000/requests';

const RequestSpecialWasteManagement = () => {
  // State management
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
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
      setFilteredRequests(data); // Initialize filtered requests
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

  // Apply filters whenever requests or filter criteria change
  useEffect(() => {
    let result = [...requests];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(request => request.status === statusFilter);
    }
    
    setFilteredRequests(result);
    
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [requests, statusFilter]);

  // Calculate pagination values based on filtered requests
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Handle request status update
  const updateRequestStatus = useCallback(async (id, status, reason = '') => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status,
          ...(reason && { rejectionReason: reason })
        })
      });

      if (!response.ok) throw new Error(`Failed to ${status} request`);

      // Optimistic UI update
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status, rejectionReason: reason } : req
      ));

      setToastMessage(`Request ${status} successfully`);
      setShowToast(true);
      
      // Close modal if open
      if (showRejectModal) {
        setShowRejectModal(false);
        setRejectionReason('');
      }
    } catch (err) {
      console.error(`Error ${status}ing request:`, err);
      setToastMessage(`Error ${status}ing request`);
      setShowToast(true);
      // Re-fetch to ensure UI matches server state
      fetchRequests();
    }
  }, [showRejectModal, fetchRequests]);

  // Handle request acceptance
  const handleAccept = useCallback((id) => {
    updateRequestStatus(id, 'accepted');
  }, [updateRequestStatus]);

  // Handle request rejection
  const handleReject = useCallback((request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  }, []);

  // Submit rejection with reason
  const submitRejection = useCallback(() => {
    if (!selectedRequest || !rejectionReason) return;
    updateRequestStatus(selectedRequest.id, 'rejected', rejectionReason);
  }, [selectedRequest, rejectionReason, updateRequestStatus]);

  // Status badge component
  const StatusBadge = React.memo(({ status }) => {
    const variants = {
      pending: { bg: "warning", text: "Pending" },
      accepted: { bg: "success", text: "Accepted" },
      rejected: { bg: "danger", text: "Rejected" },
    };
    
    return <Badge bg={variants[status]?.bg || "secondary"}>
      {variants[status]?.text || "Unknown"}
    </Badge>;
  });

  // Render loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Render error state
  if (error) {
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

      <h2 className="text-center mb-4">Special Waste Management Requests</h2>
      
      {/* Filter Controls */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <Form.Select 
          style={{ width: '200px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </Form.Select>
        
        <div className="text-muted">
          Showing {filteredRequests.length} request(s)
        </div>
      </div>
      
      <Table striped bordered hover responsive className="mt-3">
        <thead className="table-dark">
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
                <td>{new Date(request.pickupDate).toLocaleDateString()}</td>
                <td>
                  <StatusBadge status={request.status} />
                  {request.status === 'rejected' && request.rejectionReason && (
                    <div className="text-muted small mt-1">Reason: {request.rejectionReason}</div>
                  )}
                </td>
                <td>
                  {request.status === 'pending' && (
                    <div className="d-flex gap-2">
                      <Button 
                        variant="success" 
                        size="sm" 
                        onClick={() => handleAccept(request.id)}
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
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center py-4">
                {filteredRequests.length === 0 && requests.length > 0 
                  ? "No requests match the current filter"
                  : "No requests found"}
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination Controls */}
      {filteredRequests.length > itemsPerPage && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  &laquo;
                </button>
              </li>
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  &lsaquo;
                </button>
              </li>
              
              {/* Show limited page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
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
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  &rsaquo;
                </button>
              </li>
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  &raquo;
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Page Info */}
      <div className="text-center mt-2 text-muted">
        Showing {Math.min(indexOfFirstItem + 1, filteredRequests.length)} to {Math.min(indexOfLastItem, filteredRequests.length)} of {filteredRequests.length} requests
      </div>

      {/* Rejection Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reject Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You are about to reject this request from <strong>{selectedRequest?.institutionName}</strong>.</p>
          <p>Please provide a reason for rejection:</p>
          
          <Form.Group className="mb-3">
            <Form.Label>Rejection Reason *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              required
              minLength={10}
            />
            <Form.Text className="text-muted">
              Minimum 10 characters required
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={submitRejection}
            disabled={rejectionReason.length < 10}
          >
            Confirm Rejection
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RequestSpecialWasteManagement;