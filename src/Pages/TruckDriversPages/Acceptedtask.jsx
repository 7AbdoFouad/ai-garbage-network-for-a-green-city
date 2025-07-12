// DriversAvailableTasks.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useCookies } from 'react-cookie';
import { AuthContext } from '../../Components/AuthContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './DriversAvailableTasks2.module.css';



export default function DriverMyTasksPage() { 
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cookies] = useCookies(['token']);
  const { logout } = useContext(AuthContext);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const tasksPerPage = 6;
  
  const baseUrl = 'https://greencityapi.runasp.net/api';

  useEffect(() => {
    const savedPage = sessionStorage.getItem('driversTasksPage5');
    if (savedPage) {
      setCurrentPage(parseInt(savedPage, 10));
    }
    
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/PaidUserAnnouncements/my-paid-tasks`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${cookies.token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            logout();
            toast.error('Session expired. Please log in again.');
            return;
          }
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        setTasks(data);
        setTotalPages(Math.ceil(data.length / tasksPerPage));
      } catch (err) {
        setError(err.message);
        toast.error(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [cookies.token, logout]);

  const handleAcceptTask = async (taskId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/PaidUserAnnouncements/accept-pickup/${taskId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cookies.token}`,
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          toast.error('Session expired. Please log in again.');
          return;
        }
        throw new Error('Failed to accept task');
      }

      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Task accepted successfully!');
      setTotalPages(Math.ceil((tasks.length - 1) / tasksPerPage));
      
      if (currentPage > Math.ceil((tasks.length - 1) / tasksPerPage)) {
        const newPage = Math.max(1, Math.ceil((tasks.length - 1) / tasksPerPage));
        setCurrentPage(newPage);
        sessionStorage.setItem('driversTasksPage5', newPage.toString());
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Pagination functions
  const goToPage = (page) => {
    setCurrentPage(page);
    sessionStorage.setItem('driversTasksPage5', page.toString());
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      sessionStorage.setItem('driversTasksPage5', newPage.toString());
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      sessionStorage.setItem('driversTasksPage5', newPage.toString());
    }
  };

  // Calculate current tasks to display
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}>
            <div className={styles.leaf1}></div>
            <div className={styles.leaf2}></div>
            <div className={styles.leaf3}></div>
          </div>
          <p className={styles.loadingText}>Loading green tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={styles.errorCard}
        >
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorHeading}>Connection Error</h2>
          <p className={styles.errorMessage}>Couldn&apos;t fetch tasks: {error}</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Retry Connection
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.emptyCard}
        >
          <div className={styles.emptyIcon}>
            <div className={styles.ecoIllustration}>
              <div className={styles.ecoLeaf}></div>
              <div className={styles.ecoLeaf}></div>
              <div className={styles.ecoLeaf}></div>
            </div>
          </div>
          <h2 className={styles.emptyHeading}>All Cleaned Up!</h2>
          <p className={styles.emptyMessage}>
            All tasks have been accepted. New eco-opportunities will sprout soon!
          </p>
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={styles.pulseText}
          >
            🌍 Making our city greener every day
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerBanner}>
        <div className={styles.bannerGradient}></div>
        <div className={styles.bannerContent}>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.title}
          >
            Eco Missions Await
          </motion.h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={styles.titleUnderline}
          ></motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={styles.taskCount}
          >
            {tasks.length} Green Task{tasks.length !== 1 ? 's' : ''} Ready
          </motion.p>
        </div>
      </div>

      <div className={styles.contentContainer}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.taskGrid}
          >
            {currentTasks.map(task => (
              <motion.div 
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(46, 125, 50, 0.2)" }}
                className={styles.taskCard}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.taskTitle}>{task.institutionName}</h3>
                    <p className={styles.taskAuthor}>
                      <span className={styles.authorIcon}>👤</span> {task.userName}
                    </p>
                  </div>
                  <div className={styles.institutionTypeBadge}>
                    {task.institutionType}
                  </div>
                </div>
                
                <div className={styles.taskDetails}>
                  <div className={styles.detailRow}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>
                        <span className={styles.detailIcon}>📞</span> Contact
                      </span>
                      <span className={styles.detailValue}>{task.contactNumber}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>
                        <span className={styles.detailIcon}>📍</span> Address
                      </span>
                      <span className={styles.detailValue}>{task.institutionAddress}</span>
                    </div>
                  </div>
                  
                  <div className={styles.detailRow}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>
                        <span className={styles.detailIcon}>🔄</span> Subscription
                      </span>
                      <span className={styles.detailValue}>
                        {task.subscriptionType} ({task.subscriptionDuration})
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>
                        <span className={styles.detailIcon}>⏱️</span> Start
                      </span>
                      <span className={styles.detailValue}>
                        {task.startDate} at {task.startTime}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.detailRow}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>
                        <span className={styles.detailIcon}>💳</span> Payment
                      </span>
                      <span className={styles.detailValue}>{task.paymentMethod}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>
                        <span className={styles.detailIcon}>💰</span> Price
                      </span>
                      <span className={styles.detailValue}>{task.price} EGP</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.additionalNotes}>
                  <span className={styles.detailLabel}>
                    <span className={styles.detailIcon}>📝</span> Notes:
                  </span>
                  <p className={styles.detailValue}>{task.additionalNotes}</p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAcceptTask(task.id)}
                  className={styles.acceptButton}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Accept Mission
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className={styles.paginationContainer}>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevPage} 
              disabled={currentPage === 1}
              className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={styles.paginationIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <motion.button
                key={page}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => goToPage(page)}
                className={`${styles.paginationButton} ${currentPage === page ? styles.active : ''}`}
              >
                {page}
              </motion.button>
            ))}
            
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextPage} 
              disabled={currentPage === totalPages}
              className={`${styles.paginationButton} ${currentPage === totalPages ? styles.disabled : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={styles.paginationIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        )}
      </div>
      
      <div className={styles.statusBar}>
        <div className={styles.statusIndicator}>
          <div className={styles.statusDot}></div>
          <span>Active: {tasks.length} eco-mission{tasks.length !== 1 ? 's' : ''} available</span>
        </div>
        <div className={styles.statusText}>
          Page {currentPage} of {totalPages} • Green City Initiative • Making our planet cleaner
        </div>
      </div>
    </div>
  );
}

