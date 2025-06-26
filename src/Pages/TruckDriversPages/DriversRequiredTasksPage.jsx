// DriversAvailableTasks.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useCookies } from 'react-cookie';
import { AuthContext } from '../../Components/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import styles from './DriversAvailableTasks.module.css'; // CSS Module import

const DriversAvailableTasks = () => {
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
    // Get current page from session storage if available
    const savedPage = sessionStorage.getItem('driversTasksPage');
    if (savedPage) {
      setCurrentPage(parseInt(savedPage, 10));
    }
    
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/UsersAnnouncements/approved`, {
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
      const response = await fetch(`/api/TruckDrivers/accept-tasks/${taskId}`, {
        method: 'POST',
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
        throw new Error('Failed to accept task');
      }

      // Remove the accepted task from the list
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Task accepted successfully!');
      
      // Recalculate total pages after task removal
      setTotalPages(Math.ceil((tasks.length - 1) / tasksPerPage));
      
      // Adjust current page if we're on the last page and it becomes empty
      if (currentPage > Math.ceil((tasks.length - 1) / tasksPerPage)) {
        const newPage = Math.max(1, Math.ceil((tasks.length - 1) / tasksPerPage));
        setCurrentPage(newPage);
        sessionStorage.setItem('driversTasksPage', newPage.toString());
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
    sessionStorage.setItem('driversTasksPage', page.toString());
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      sessionStorage.setItem('driversTasksPage', newPage.toString());
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      sessionStorage.setItem('driversTasksPage', newPage.toString());
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
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading available tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorHeading}>Error Loading Tasks</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>🌱</div>
          <h2 className={styles.emptyHeading}>No Tasks Available</h2>
          <p className={styles.emptyMessage}>
            All tasks have been accepted. Check back later for new assignments.
          </p>
          <div className={styles.pulseText}>Great job keeping our city clean!</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Available Tasks</h1>
          <div className={styles.subtitle}>
            <div className={styles.titleUnderline}></div>
            <p className={styles.taskCount}>
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} ready for action
            </p>
          </div>
        </div>

        <div className={styles.taskGrid}>
          {currentTasks.map(task => (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={styles.taskCard}
            >
              <div className={styles.imageContainer}>
                {task.photoFile ? (
                  <img 
                    src={task.photoFile} 
                    alt={task.announcementType} 
                    className={styles.taskImage}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <div className={styles.placeholderIcon}>🌿</div>
                    <p>No Image Available</p>
                  </div>
                )}
                {/* <div className={styles.statusBadge}>
                  {task.status}
                </div> */}
              </div>
              
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.taskTitle}>{task.announcementType}</h3>
                    <p className={styles.taskAuthor}>Posted by: {task.userName}</p>
                  </div>
                  <div className={styles.regionBadge}>
                    {task.regionName}
                  </div>
                </div>
                
                <p className={styles.taskDescription}>{task.announcementDescription}</p>
                
                <div className={styles.taskDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Location</span>
                    <span className={styles.detailValue}>{task.siteLocation}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Date</span>
                    <span className={styles.detailValue}>
                      {new Date(task.todayDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Priority</span>
                    <span className={styles.detailValue}>High</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Estimated Time</span>
                    <span className={styles.detailValue}>2-3 hours</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleAcceptTask(task.id)}
                  className={styles.acceptButton}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Accept Task
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Pagination Controls */}
        <div className={styles.paginationContainer}>
          <button 
            onClick={prevPage} 
            disabled={currentPage === 1}
            className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.paginationIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`${styles.paginationButton} ${currentPage === page ? styles.active : ''}`}
            >
              {page}
            </button>
          ))}
          
          <button 
            onClick={nextPage} 
            disabled={currentPage === totalPages}
            className={`${styles.paginationButton} ${currentPage === totalPages ? styles.disabled : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.paginationIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
{/*       
      <div className={styles.statusBar}>
        <div className={styles.statusIndicator}>
          <div className={styles.statusDot}></div>
          <span>Active: {tasks.length} task{tasks.length !== 1 ? 's' : ''} available</span>
        </div>
        <div className={styles.statusText}>
          Page {currentPage} of {totalPages} • Green City Initiative • Making our city cleaner every day
        </div>
      </div> */}
    </div>
  );
};

export default DriversAvailableTasks;