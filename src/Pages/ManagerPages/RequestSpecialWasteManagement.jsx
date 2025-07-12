import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Table, 
  Button, 
  Container, 
  Card, 
  Badge, 
  Spinner,
  Modal,
  ProgressBar,
  Row,
  Col
} from 'react-bootstrap';
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  InfoCircle,
  CurrencyDollar,
  CalendarCheck,
  ClockHistory,
  Building,
  CashStack
} from 'react-bootstrap-icons';
import styled from 'styled-components';
import { CurrencyPound } from 'react-bootstrap-icons';

// Styled components for custom styling
const StyledCard = styled(Card)`
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  border: none;
  overflow: hidden;
`;

const StyledTable = styled(Table)`
  thead th {
    background-color: #2c3e50;
    color: white;
    font-weight: 500;
    border-bottom: none;
  }
  
  tbody tr {
    transition: all 0.2s ease;
    
    &:hover {
      background-color: rgba(44, 62, 80, 0.05);
    }
  }
  
  .action-buttons {
    min-width: 180px;
  }
`;

const StatusBadge = styled(Badge)`
  font-weight: 500;
  padding: 6px 10px;
  font-size: 0.8rem;
  text-transform: uppercase;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  flex-direction: column;
  
  .spinner {
    width: 3rem;
    height: 3rem;
    border-width: 0.25rem;
  }
`;

const SummaryCard = styled(Card)`
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  .card-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #2c3e50;
  }
  
  .card-title {
    font-size: 0.9rem;
    color: #6c757d;
    margin-bottom: 0.5rem;
  }
  
  .card-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
  }
`;

const PaidAnnouncementsManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  const API_URL = 'https://greencityapi.runasp.net/api/PaidUserAnnouncements';
  const getAuthToken = () => Cookies.get("token");

  useEffect(() => {
    fetchPaidAnnouncements();
  }, []);

  const fetchPaidAnnouncements = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/admin/pending-announcements`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAnnouncements(response.data);
    } catch (error) {
      console.error("Error fetching announcements", error);
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    const totalAmount = announcements.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    const averageAmount = announcements.length > 0 ? totalAmount / announcements.length : 0;
    const institutionTypes = [...new Set(announcements.map(item => item.institutionType))];
    
    // Count by institution type
    const typeCounts = {};
    announcements.forEach(item => {
      typeCounts[item.institutionType] = (typeCounts[item.institutionType] || 0) + 1;
    });
    
    // Most common institution type
    const mostCommonType = Object.keys(typeCounts).reduce((a, b) => 
      typeCounts[a] > typeCounts[b] ? a : b, 'None');
    
    return {
      totalAmount,
      averageAmount,
      institutionTypes: institutionTypes.length,
      mostCommonType,
      pendingCount: announcements.length
    };
  };

  const summary = calculateSummary();

  const handleApprove = async (id) => {
    try {
      setApprovingId(id);
      const token = getAuthToken();
      await axios.post(`${API_URL}/approve/${id}`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAnnouncements(prev => prev.filter(i => i.id !== id));
      toast.success(
        <div>
          <CheckCircle className="me-2" />
          Announcement approved successfully
        </div>,
        { icon: false }
      );
    } catch (err) {
      console.error(err);
      toast.error(
        <div>
          <XCircle className="me-2" />
          Approval failed
        </div>,
        { icon: false }
      );
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setRejectingId(id);
      const token = getAuthToken();
      await axios.post(`${API_URL}/reject/${id}`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(prev => prev.filter(i => i.id !== id));
      toast.success(
        <div>
          <CheckCircle className="me-2" />
          Announcement rejected successfully
        </div>,
        { icon: false }
      );
    } catch (err) {
      console.error(err);
      toast.error(
        <div>
          <XCircle className="me-2" />
          Rejection failed
        </div>,
        { icon: false }
      );
    } finally {
      setRejectingId(null);
    }
  };

  const showAnnouncementDetails = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDetails(true);
  };

  const renderStatusBadge = (status) => {
    let variant = 'secondary';
    if (status === 'Approved') variant = 'success';
    if (status === 'Rejected') variant = 'danger';
    if (status === 'Pending') variant = 'warning';
    
    return <StatusBadge bg={variant}>{status}</StatusBadge>;
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner animation="border" role="status" className="spinner">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading announcements...</p>
      </LoadingContainer>
    );
  }

  return (
    <Container className="py-4 g-4 jjustify-content-center ">
      {/* Summary Section */}
      <Row className="mb-4 g-4">
        <Col md={4}>
          <SummaryCard>
            <Card.Body className="text-center">
              <CurrencyPound  className="card-icon" />
              <h6 className="card-title">Total Value</h6>
              <div className="card-value">{summary.totalAmount.toFixed(2)} EGP</div>
              <ProgressBar 
                variant="success" 
                now={100} 
                className="mt-2" 
                style={{ height: '6px' }} 
              />
            </Card.Body>
          </SummaryCard>
        </Col>
        
        <Col md={4}>
          <SummaryCard>
            <Card.Body className="text-center">
              <CashStack className="card-icon" />
              <h6 className="card-title">Average Value</h6>
              <div className="card-value">{summary.averageAmount.toFixed(2)} EGP</div>
              <ProgressBar 
                variant="info" 
                now={100} 
                className="mt-2" 
                style={{ height: '6px' }} 
              />
            </Card.Body>
          </SummaryCard>
        </Col>
        
        
        
        <Col md={4}>
          <SummaryCard>
            <Card.Body className="text-center">
              <ClockHistory className="card-icon" />
              <h6 className="card-title">Pending Requests</h6>
              <div className="card-value">{summary.pendingCount}</div>
              <ProgressBar 
                variant="danger" 
                now={100} 
                className="mt-2" 
                style={{ height: '6px' }} 
              />
            </Card.Body>
          </SummaryCard>
        </Col>
      </Row>

      <StyledCard className="mb-4">
        <Card.Header className="bg-success text-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="h4 mb-0">
              <Clock className="me-2" />
              Paid Announcements Management
            </h2>
            <Badge bg="light" text="primary" pill>
              {announcements.length} Pending
            </Badge>
          </div>
        </Card.Header>
        
        <Card.Body className="p-0">
          <div className="table-responsive">
            <StyledTable hover className="mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Institution</th>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th className="action-buttons">Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.length > 0 ? (
                  announcements.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="fw-semibold">{item.userName}</div>
                        <small className="text-muted">ID: {item.userId}</small>
                      </td>
                      <td className="text-nowrap">{item.institutionName}</td>
                      <td>{item.institutionType}</td>
                      <td className="text-nowrap">
                        {item.startDate}
                        <div className="text-muted small">{item.startTime}</div>
                      </td>
                      <td>{item.subscriptionDuration=='1 day'?'1 Day':item.subscriptionDuration+' Days'} </td>
                      <td className="fw-bold">{item.price} EGP</td>
                      <td>{renderStatusBadge(item.status)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-success" 
                            size="sm" 
                            onClick={() => handleApprove(item.id)}
                            disabled={approvingId === item.id}
                          >
                            {approvingId === item.id ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <>Approve</>
                            )}
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => handleReject(item.id)}
                            disabled={rejectingId === item.id}
                          >
                            {rejectingId === item.id ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <>Reject</>
                            )}
                          </Button>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            onClick={() => showAnnouncementDetails(item)}
                          >
                            <InfoCircle />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <div className="text-muted">
                        <CheckCircle size={48} className="mb-3 text-success" />
                        <h4>No pending announcements</h4>
                        <p>All announcements have been processed</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </StyledTable>
          </div>
        </Card.Body>
      </StyledCard>

      {/* Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Announcement Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAnnouncement && (
            <div className="row">
              <div className="col-md-6">
                <h5 className="mb-3">Institution Information</h5>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <strong>Name:</strong> {selectedAnnouncement.institutionName}
                  </li>
                  <li className="mb-2">
                    <strong>Type:</strong> {selectedAnnouncement.institutionType}
                  </li>
                  <li className="mb-2">
                    <strong>Address:</strong> {selectedAnnouncement.institutionAddress}
                  </li>
                  <li className="mb-2">
                    <strong>Contact:</strong> {selectedAnnouncement.contactNumber}
                  </li>
                </ul>
              </div>
              <div className="col-md-6">
                <h5 className="mb-3">Event Details</h5>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <strong>Start:</strong> {selectedAnnouncement.startDate} at {selectedAnnouncement.startTime}
                  </li>
                  <li className="mb-2">
                    <strong>Duration:</strong> {selectedAnnouncement.subscriptionDuration} days
                  </li>
                  <li className="mb-2">
                    <strong>Price:</strong> {selectedAnnouncement.price} EGP
                  </li>
                  <li className="mb-2">
                    <strong>Payment Method:</strong> {selectedAnnouncement.paymentMethod}
                  </li>
                </ul>
              </div>
              <div className="col-12 mt-3">
                <h5 className="mb-2">Additional Notes</h5>
                <div className="bg-light p-3 rounded">
                  {selectedAnnouncement.additionalNotes || 'No additional notes provided'}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaidAnnouncementsManagement;