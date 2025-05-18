import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Toast, ToastContainer, Spinner } from 'react-bootstrap';
import useUser from "../../hooks/useUser";

const API_URL = 'http://localhost:3000/requests';

const RequestSpecialWasteManagement = () => {
    const { addUserNotification, addAcceptted_Users_And_SpecialOrder } = useUser();
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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchRequests = useCallback(async () => {
        setLoading(true);
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

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    useEffect(() => {
        let result = requests.filter(request => request.status !== 'accepted');
        if (statusFilter !== 'all') {
            result = result.filter(request => request.status === statusFilter);
        }
        setFilteredRequests(result);
        setCurrentPage(1);
    }, [requests, statusFilter]);

    const handlePageChange = (page) => setCurrentPage(page);

    const updateRequestStatus = useCallback(async (id, status, request, reason = '') => {
        try {
            if (status === 'accepted') {
                // Update status to accepted in database
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'accepted' })
                });
                
                if (!response.ok) throw new Error('Failed to accept request');

                // Optimistic UI update
                setRequests(prev => prev.map(req => 
                    req.id === id ? { ...req, status: 'accepted' } : req
                ));

                // Add to accepted users
                addAcceptted_Users_And_SpecialOrder({
                    requestId: id,
                    Type: "2"
                });
            } else {
                // Delete rejected request from database
                const deleteResponse = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                if (!deleteResponse.ok) throw new Error('Failed to delete request');

                // Optimistic UI update
                setRequests(prev => prev.filter(req => req.id !== id));
            }

            // Send notification
            const notificationContent = status === 'accepted' 
                ? 'Your special waste request has been accepted' 
                : `Request for Special order collection
                 with the following details:
                 ${request.institutionName},
                 ${request.wasteType},
                 ${request.estimatedQuantity},
                 ${request.pickupDate}
                 has been rejected
                 reason: ${reason}`;
            
            addUserNotification({
                userId: request.userId,
                notificationContent,
                notificationDate: new Date().toISOString().split('T')[0]
            });

            setToastMessage(`Request ${status} successfully`);
            setShowToast(true);
            
            if (showRejectModal) {
                setShowRejectModal(false);
                setRejectionReason('');
            }
        } catch (err) {
            console.error(`Error ${status}ing request:`, err);
            setToastMessage(`Error ${status}ing request`);
            setShowToast(true);
            fetchRequests();
        }
    }, [showRejectModal, fetchRequests, addUserNotification, addAcceptted_Users_And_SpecialOrder]);

    // Keep other functions and components the same as previous answer

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

    return (
        <div className="container-fluid py-4">
            <ToastContainer position="top-end" className="p-3">
                <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide>
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>

            <h2 className="text-center mb-4">Special Waste Management Requests</h2>
            
            <div className="mb-3 d-flex justify-content-between align-items-center">
                <Form.Select 
                    style={{ width: '200px' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                </Form.Select>
                
                <div className="text-muted">
                    Showing {filteredRequests.length} request(s)
                </div>
            </div>
            
            <Table striped bordered hover responsive className="mt-3">
                <thead className="table-dark">
                    <tr>
                        <th>Institution</th>
                        <th>Waste Type</th>
                        <th>Quantity</th>
                        <th>Pickup Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.length > 0 ? (
                        currentItems.map((request) => (
                            <tr key={request.id}>
                                <td>{request.institutionName}</td>
                                <td>{request.wasteType || '-'}</td>
                                <td>
                                    {request.estimatedQuantity 
                                        ? `${request.estimatedQuantity} ${request.quantityUnit}` 
                                        : '-'}
                                </td>
                                <td>{new Date(request.pickupDate).toLocaleDateString()}</td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <Button 
                                            variant="success" 
                                            size="sm" 
                                            onClick={() => updateRequestStatus(
                                                request.id, 
                                                'accepted', 
                                                request
                                            )}
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
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center py-4">
                                {filteredRequests.length === 0 && requests.length > 0 
                                    ? "No requests match the current filter"
                                    : "No requests found"}
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* Keep pagination and modal components same as previous answer */}
        </div>
    );
};

export default RequestSpecialWasteManagement;