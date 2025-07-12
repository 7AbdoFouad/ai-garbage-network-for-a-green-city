import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  XCircle, 
  CheckCircle, 
  Trash, 
  Check, 
  X, 
  Clock,
  AlertCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  DollarSign
} from 'react-feather';
import styled from 'styled-components';

const RecycleManagement = () => {
  // Initialize activeTab7 from sessionStorage or default to 'driverReports'
  const [activeTab7, setactiveTab7] = useState(() => {
    const savedTab = sessionStorage.getItem('recycleManagementactiveTab7');
    return savedTab || 'driverReports';
  });
  
  const [recyclingItems, setRecyclingItems] = useState([]);
  const [paidReports, setPaidReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paidLoading, setPaidLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paidError, setPaidError] = useState(null);
  const [driverCurrentPage, setDriverCurrentPage] = useState(1);
  const [paidCurrentPage, setPaidCurrentPage] = useState(1);
  const [approvingId, setApprovingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [paidApprovingId, setPaidApprovingId] = useState(null);
  const [paidDeletingId, setPaidDeletingId] = useState(null);
  const itemsPerPage = 6;

  // Save active tab to session storage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('recycleManagementactiveTab7', activeTab7);
  }, [activeTab7]);

  const getAuthToken = () => Cookies.get("token");

  useEffect(() => {
    if (activeTab7 === 'driverReports') {
      fetchRecyclingItems();
    } else {
      fetchPaidReports();
    }
  }, [activeTab7]);

  const fetchRecyclingItems = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get(
        'https://greencityapi.runasp.net/api/TruckDrivers/reports', 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const mappedItems = response.data.map((item, index) => ({
        id: item.id || index + 1,
        driverName: item.driverName,
        reportDESC: item.reportDESC,
        sentAt: formatDate(item.sentAt),
        usersAnnouncementId: item.usersAnnouncementId,
        photoUrl: item.photoUrl?.startsWith('http')
          ? item.photoUrl
          : `https://greencityapi.runasp.net/${item.photoUrl}`,
        status: 'pending'
      }));
      
      setRecyclingItems(mappedItems);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch driver reports');
      setLoading(false);
      console.error('Error fetching driver reports:', err);
    }
  };

  const fetchPaidReports = async () => {
    try {
      setPaidLoading(true);
      const token = getAuthToken();
      const response = await axios.get(
        'https://greencityapi.runasp.net/api/PaidUserAnnouncements/paid-reports', 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const mappedItems = response.data.map((item, index) => ({
        id: item.id || index + 1,
        driverName: item.driverName,
        reportDESC: item.reportDESC,
        sentAt: formatDate(item.sentAt),
        usersAnnouncementId: item.usersAnnouncementId,
        photoUrl: item.photoUrl?.startsWith('http')
          ? item.photoUrl
          : `https://greencityapi.runasp.net/${item.photoUrl}`,
        status: 'pending',
        price: item.price || 'N/A'
      }));
      
      setPaidReports(mappedItems);
      setPaidLoading(false);
    } catch (err) {
      setPaidError('Failed to fetch paid reports');
      setPaidLoading(false);
      console.error('Error fetching paid reports:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (item) => {
    try {
      setDeletingId(item.id);
      const token = getAuthToken();

      await axios.post(
        `https://greencityapi.runasp.net/api/TruckDrivers/invalidate-report/${item.id}`,
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRecyclingItems(recyclingItems.filter(i => i.id !== item.id));
      toast.success(
        <ToastContent>
          <CheckCircle size={18} className="me-2" />
          Report rejected successfully
        </ToastContent>,
        { icon: false }
      );
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(
        <ToastContent>
          <XCircle size={18} className="me-2" />
          Failed to reject report
        </ToastContent>,
        { icon: false }
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleApprove = async (item) => {
    try {
      setApprovingId(item.id);
      const token = getAuthToken();

      await axios.post(
        `https://greencityapi.runasp.net/api/TruckDrivers/validate-report/${item.id}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRecyclingItems(prev => prev.filter(i => i.id !== item.id));
      toast.success(
        <ToastContent>
          <CheckCircle size={18} className="me-2" />
          Report approved successfully
        </ToastContent>,
        { icon: false }
      );
    } catch (error) {
      console.error('Error approving item:', error);
      toast.error(
        <ToastContent>
          <XCircle size={18} className="me-2" />
          Approval failed
        </ToastContent>,
        { icon: false }
      );
    } finally {
      setApprovingId(null);
    }
  };

  const handlePaidDelete = async (item) => {
    try {
      setPaidDeletingId(item.id);
      const token = getAuthToken();

      await axios.post(
        `https://greencityapi.runasp.net/api/PaidUserAnnouncements/invalidate-paidReport/${item.id}`,
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPaidReports(paidReports.filter(i => i.id !== item.id));
      toast.success(
        <ToastContent>
          <CheckCircle size={18} className="me-2" />
          Paid report rejected successfully
        </ToastContent>,
        { icon: false }
      );
    } catch (error) {
      console.error('Error deleting paid report:', error);
      toast.error(
        <ToastContent>
          <XCircle size={18} className="me-2" />
          Failed to reject paid report
        </ToastContent>,
        { icon: false }
      );
    } finally {
      setPaidDeletingId(null);
    }
  };

  const handlePaidApprove = async (item) => {
    try {
      setPaidApprovingId(item.id);
      const token = getAuthToken();

      await axios.post(
        `https://greencityapi.runasp.net/api/PaidUserAnnouncements/validate-paidReport/${item.id}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPaidReports(prev => prev.filter(i => i.id !== item.id));
      toast.success(
        <ToastContent>
          <CheckCircle size={18} className="me-2" />
          Paid report approved successfully
        </ToastContent>,
        { icon: false }
      );
    } catch (error) {
      console.error('Error approving paid report:', error);
      toast.error(
        <ToastContent>
          <XCircle size={18} className="me-2" />
          Paid report approval failed
        </ToastContent>,
        { icon: false }
      );
    } finally {
      setPaidApprovingId(null);
    }
  };

  const renderDriverReports = () => {
    if (loading) return (
      <LoadingContainer>
        <Loader size={32} className="spin" />
        <h3>Loading driver reports...</h3>
      </LoadingContainer>
    );

    if (error) return (
      <ErrorContainer>
        <AlertCircle size={32} />
        <h3>{error}</h3>
        <button onClick={fetchRecyclingItems}>Retry</button>
      </ErrorContainer>
    );

    return (
      <>
        <Header>
          <Title>Driver Reports Management</Title>
          <StatsCard>
            <StatValue>{recyclingItems.length}</StatValue>
            <StatLabel>Pending Reports</StatLabel>
          </StatsCard>
        </Header>

        <ReportsGrid>
          {recyclingItems.length === 0 ? (
            <EmptyState>
              <Clock size={48} />
              <h3>No pending driver reports</h3>
              <p>All driver reports have been processed</p>
            </EmptyState>
          ) : (
            recyclingItems
              .slice((driverCurrentPage - 1) * itemsPerPage, driverCurrentPage * itemsPerPage)
              .map(item => (
                <ReportCard key={item.id} status={item.status}>
                  <ReportImage>
                    <img
                      src={item.photoUrl || 'https://via.placeholder.com/400x200?text=No+Image'}
                      alt="Report"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                      }}
                    />
                  </ReportImage>
                  
                  <ReportContent>
                    <DriverInfo>
                      <DriverAvatar>
                        {item.driverName.charAt(0).toUpperCase()}
                      </DriverAvatar>
                      <DriverName>{item.driverName}</DriverName>
                    </DriverInfo>
                    
                    <ReportDescription>{item.reportDESC}</ReportDescription>
                    
                    <ReportMeta>
                      <MetaItem>
                        <MetaLabel>Date</MetaLabel>
                        <MetaValue>{item.sentAt}</MetaValue>
                      </MetaItem>
                      <MetaItem>
                        <MetaLabel>Announcement ID</MetaLabel>
                        <MetaValue>{item.usersAnnouncementId}</MetaValue>
                      </MetaItem>
                    </ReportMeta>
                    
                    <ActionButtons>
                      <ApproveButton 
                        onClick={() => handleApprove(item)}
                        disabled={approvingId === item.id}
                      >
                        {approvingId === item.id ? (
                          <Loader size={16} className="spin" />
                        ) : (
                          <Check size={16} />
                        )}
                        {approvingId === item.id ? 'Approving...' : 'Approve'}
                      </ApproveButton>
                      
                      <RejectButton 
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? (
                          <Loader size={16} className="spin" />
                        ) : (
                          <X size={16} />
                        )}
                        {deletingId === item.id ? 'Deleting...' : 'Reject'}
                      </RejectButton>
                    </ActionButtons>
                  </ReportContent>
                </ReportCard>
              ))
          )}
        </ReportsGrid>

        {recyclingItems.length > itemsPerPage && (
          <Pagination>
            <PaginationButton 
              onClick={() => setDriverCurrentPage(p => Math.max(1, p - 1))}
              disabled={driverCurrentPage === 1}
            >
              <ChevronLeft size={18} />
            </PaginationButton>
            
            {Array.from({ length: Math.ceil(recyclingItems.length / itemsPerPage) }).map((_, idx) => (
              <PaginationNumber
                key={idx}
                active={driverCurrentPage === idx + 1}
                onClick={() => setDriverCurrentPage(idx + 1)}
              >
                {idx + 1}
              </PaginationNumber>
            ))}
            
            <PaginationButton
              onClick={() => setDriverCurrentPage(p => Math.min(Math.ceil(recyclingItems.length / itemsPerPage), p + 1))}
              disabled={driverCurrentPage === Math.ceil(recyclingItems.length / itemsPerPage)}
            >
              <ChevronRight size={18} />
            </PaginationButton>
          </Pagination>
        )}
      </>
    );
  };

  const renderPaidReports = () => {
    if (paidLoading) return (
      <LoadingContainer>
        <Loader size={32} className="spin" />
        <h3>Loading paid reports...</h3>
      </LoadingContainer>
    );

    if (paidError) return (
      <ErrorContainer>
        <AlertCircle size={32} />
        <h3>{paidError}</h3>
        <button onClick={fetchPaidReports}>Retry</button>
      </ErrorContainer>
    );

    return (
      <>
        <Header>
          <Title>Paid Announcements Reports</Title>
          <StatsCard>
            <StatValue>{paidReports.length}</StatValue>
            <StatLabel>Pending Paid Reports</StatLabel>
          </StatsCard>
        </Header>

        <ReportsGrid>
          {paidReports.length === 0 ? (
            <EmptyState>
              <DollarSign size={48} />
              <h3>No pending paid reports</h3>
              <p>All paid reports have been processed</p>
            </EmptyState>
          ) : (
            paidReports
              .slice((paidCurrentPage - 1) * itemsPerPage, paidCurrentPage * itemsPerPage)
              .map(item => (
                <ReportCard key={item.id} status={item.status}>
                  <ReportImage>
                    <img
                      src={item.photoUrl || 'https://via.placeholder.com/400x200?text=No+Image'}
                      alt="Report"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                      }}
                    />
                  </ReportImage>
                  
                  <ReportContent>
                    <DriverInfo>
                      <DriverAvatar>
                        {item.driverName.charAt(0).toUpperCase()}
                      </DriverAvatar>
                      <DriverName>{item.driverName}</DriverName>
                    </DriverInfo>
                    
                    <ReportDescription>{item.reportDESC}</ReportDescription>
                    
                    <ReportMeta>
                      <MetaItem>
                        <MetaLabel>Date</MetaLabel>
                        <MetaValue>{item.sentAt}</MetaValue>
                      </MetaItem>
                    </ReportMeta>
                    
                    <ActionButtons>
                      <ApproveButton 
                        onClick={() => handlePaidApprove(item)}
                        disabled={approvingId === item.id}
                      >
                        {approvingId === item.id ? (
                          <Loader size={16} className="spin" />
                        ) : (
                          <Check size={16} />
                        )}
                        {approvingId === item.id ? 'Approving...' : 'Approve'}
                      </ApproveButton>
                      
                      <RejectButton 
                        onClick={() => handlePaidDelete(item)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? (
                          <Loader size={16} className="spin" />
                        ) : (
                          <X size={16} />
                        )}
                        {deletingId === item.id ? 'Deleting...' : 'Reject'}
                      </RejectButton>
                    </ActionButtons>
                  </ReportContent>
                </ReportCard>
              ))
          )}
        </ReportsGrid>

        {paidReports.length > itemsPerPage && (
          <Pagination>
            <PaginationButton 
              onClick={() => setPaidCurrentPage(p => Math.max(1, p - 1))}
              disabled={paidCurrentPage === 1}
            >
              <ChevronLeft size={18} />
            </PaginationButton>
            
            {Array.from({ length: Math.ceil(paidReports.length / itemsPerPage) }).map((_, idx) => (
              <PaginationNumber
                key={idx}
                active={paidCurrentPage === idx + 1}
                onClick={() => setPaidCurrentPage(idx + 1)}
              >
                {idx + 1}
              </PaginationNumber>
            ))}
            
            <PaginationButton
              onClick={() => setPaidCurrentPage(p => Math.min(Math.ceil(paidReports.length / itemsPerPage), p + 1))}
              disabled={paidCurrentPage === Math.ceil(paidReports.length / itemsPerPage)}
            >
              <ChevronRight size={18} />
            </PaginationButton>
          </Pagination>
        )}
      </>
    );
  };

  return (
    <DashboardContainer>
      <Tabs>
        <Tab 
          active={activeTab7 === 'driverReports'} 
          onClick={() => setactiveTab7('driverReports')}
        >
          Driver Reports
        </Tab>
        <Tab 
          active={activeTab7 === 'paidReports'} 
          onClick={() => setactiveTab7('paidReports')}
        >
          Paid Announcements
        </Tab>
      </Tabs>

      {activeTab7 === 'driverReports' ? renderDriverReports() : renderPaidReports()}
    </DashboardContainer>
  );
};

// Styled Components (remain unchanged from original)
const DashboardContainer = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #2d3748;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 2rem;
`;

const Tab = styled.div`
  padding: 1rem 1.5rem;
  cursor: pointer;
  position: relative;
  font-weight: 500;
  color: ${props => props.active ? '#3182ce' : '#718096'};
  border-bottom: 2px solid ${props => props.active ? '#3182ce' : 'transparent'};
  margin-bottom: -1px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    color: #3182ce;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a365d;
  margin: 0;
`;

const StatsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  min-width: 120px;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #3182ce;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #718096;
  margin-top: 0.25rem;
`;

const ReportsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ReportCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  border-left: 4px solid ${props => 
    props.status === 'pending' ? '#ed8936' : 
    props.status === 'approved' ? '#38a169' : 
    '#e53e3e'};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
`;

const ReportImage = styled.div`
  height: 200px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const ReportContent = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const DriverInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const DriverAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3182ce;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 0.75rem;
`;

const DriverName = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #2d3748;
`;

const ReportDescription = styled.p`
  color: #4a5568;
  margin: 0 0 1.5rem;
  line-height: 1.5;
  flex-grow: 1;
`;

const ReportMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const MetaItem = styled.div`
  background: #f7fafc;
  padding: 0.75rem;
  border-radius: 8px;
`;

const MetaLabel = styled.div`
  font-size: 0.75rem;
  color: #718096;
  margin-bottom: 0.25rem;
`;

const MetaValue = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #2d3748;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ButtonBase = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  border: none;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  svg {
    stroke-width: 2.5px;
  }
`;

const ApproveButton = styled(ButtonBase)`
  background: #38a169;
  color: white;
  
  &:hover:not(:disabled) {
    background: #2f855a;
  }
`;

const RejectButton = styled(ButtonBase)`
  background: #e53e3e;
  color: white;
  
  &:hover:not(:disabled) {
    background: #c53030;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PaginationButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e2e8f0;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #edf2f7;
    border-color: #cbd5e0;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaginationNumber = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.active ? '#3182ce' : 'white'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  border: 1px solid ${props => props.active ? '#3182ce' : '#e2e8f0'};
  cursor: pointer;
  transition: all 0.2s;
  font-weight: ${props => props.active ? '600' : 'normal'};
  
  &:hover {
    background: ${props => props.active ? '#3182ce' : '#edf2f7'};
    border-color: ${props => props.active ? '#3182ce' : '#cbd5e0'};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 1rem;
  
  h3 {
    color: #4a5568;
    margin: 0;
  }
  
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 1rem;
  text-align: center;
  padding: 2rem;
  
  h3 {
    color: #e53e3e;
    margin: 0;
  }
  
  button {
    padding: 0.75rem 1.5rem;
    background: #3182ce;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    
    &:hover {
      background: #2b6cb0;
    }
  }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  
  h3 {
    color: #2d3748;
    margin: 1rem 0 0.5rem;
  }
  
  p {
    color: #718096;
    margin: 0;
  }
  
  svg {
    color: #a0aec0;
  }
`;

const ToastContent = styled.div`
  display: flex;
  align-items: center;
`;

export default RecycleManagement;