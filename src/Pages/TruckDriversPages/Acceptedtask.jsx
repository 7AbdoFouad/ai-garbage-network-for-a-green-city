// DriversAvailableTasks.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { AuthContext } from '../../Components/AuthContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styles from './DriversAvailableTasks2.module.css';

// Added validation schema from first example
const CompleteTaskSchema = Yup.object().shape({
  driverName: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Driver name is required'),
  reportDESC: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .required('Report description is required'),
  photoFile: Yup.mixed()
    .required('Photo is required')
    .test('fileSize', 'File too large (max 5MB)', value => value && value.size <= 5 * 1024 * 1024)
    .test('fileType', 'Unsupported file type (JPG/PNG only)', value => 
      value && ['image/jpg', 'image/jpeg', 'image/png'].includes(value.type)
    ),
  sentAt: Yup.date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future')
});

export default function DriverMyTasksPage() { 
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cookies] = useCookies(['token']);
  const { logout } = useContext(AuthContext);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const tasksPerPage = 6;
  
  const modalRef = useRef(null); // Added ref for modal
  const baseUrl = 'https://greencityapi.runasp.net/api';

  const openCompleteModal = (task) => {
    setSelectedTask(task);
    setShowCompleteModal(true);
  };

  const closeCompleteModal = () => {
    setShowCompleteModal(false);
    setSelectedTask(null);
  };
  
  // Handle outside click to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeCompleteModal();
      }
    };
    
    if (showCompleteModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [showCompleteModal]);

  const handleCompleteTask = async (values, { resetForm }) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('driverName', values.driverName);
      formData.append('reportDESC', values.reportDESC);
      formData.append('sentAt', values.sentAt);
      formData.append('photoFile', values.photoFile);
      formData.append('announcementsID', selectedTask.id.toString());

      const response = await fetch(`/api/PaidUserAnnouncements/complete-task/${selectedTask.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cookies.token}`
        },
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          toast.error('Session expired. Please log in again.');
          return;
        }
        throw new Error('Failed to complete task');
      }

      // Remove completed task
      setTasks(tasks.filter(task => task.id !== selectedTask.id));
      toast.success('Task completed successfully!');
      
      // Update pagination
      setTotalPages(Math.ceil((tasks.length - 1) / tasksPerPage));
      
      // Adjust current page if needed
      if (currentPage > Math.ceil((tasks.length - 1) / tasksPerPage)) {
        const newPage = Math.max(1, Math.ceil((tasks.length - 1) / tasksPerPage));
        setCurrentPage(newPage);
        sessionStorage.setItem('driversTasksPage5', newPage.toString());
      }
      
      closeCompleteModal();
      resetForm();
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        console.log('Fetched tasks:', data);
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
      {/* Added complete task modal */}
      {showCompleteModal && selectedTask && (
        <div className={styles.modalOverlay}>
          <motion.div 
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className={styles.modalContent}
          >
            <div className={styles.modalHeader}>
              <h2>Complete Task</h2>
              <button 
                onClick={closeCompleteModal}
                className={styles.closeButton}
              >
                &times;
              </button>
            </div>
            
            <Formik
              initialValues={{
                driverName: '',
                reportDESC: '',
                photoFile: null,
                sentAt: new Date().toISOString().split('T')[0],
                announcementsID: selectedTask.id
              }}
              validationSchema={CompleteTaskSchema}
              onSubmit={handleCompleteTask}
            >
              {({ setFieldValue, values, errors, touched }) => (
                <Form className={styles.completeForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="driverName">Driver Name</label>
                    <Field 
                      type="text" 
                      name="driverName" 
                      placeholder="Enter your full name"
                      className={`${styles.formInput} ${errors.driverName && touched.driverName ? styles.inputError : ''}`}
                    />
                    <ErrorMessage name="driverName" component="div" className={styles.errorText} />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="reportDESC">Report Description</label>
                    <Field 
                      as="textarea" 
                      name="reportDESC" 
                      placeholder="Describe the task completion details"
                      rows="4"
                      className={`${styles.formTextarea} ${errors.reportDESC && touched.reportDESC ? styles.inputError : ''}`}
                    />
                    <ErrorMessage name="reportDESC" component="div" className={styles.errorText} />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="sentAt">Completion Date</label>
                    <Field 
                      type="date" 
                      name="sentAt" 
                      className={`${styles.formInput} ${errors.sentAt && touched.sentAt ? styles.inputError : ''}`}
                    />
                    <ErrorMessage name="sentAt" component="div" className={styles.errorText} />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="photoFile">Upload Photo</label>
                    <input
                      id="photoFile"
                      name="photoFile"
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        setFieldValue("photoFile", event.currentTarget.files[0]);
                      }}
                      className={styles.formFileInput}
                    />
                    <ErrorMessage name="photoFile" component="div" className={styles.errorText} />
                    
                    <div className={styles.fileSection}>
                      <button 
                        type="button"
                        onClick={() => document.getElementById('photoFile').click()}
                        className={styles.fileButton}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        Choose File
                      </button>
                      
                      {values.photoFile && (
                        <div className={styles.filePreview}>
                          <p className={styles.fileName}>{values.photoFile.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.modalButtons}>
                    <button 
                      type="button" 
                      onClick={closeCompleteModal}
                      className={styles.cancelButton}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className={styles.completeButton}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className={styles.submitSpinner}></div>
                      ) : 'Complete Task'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </motion.div>
        </div>
      )}
      
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
                  onClick={() => openCompleteModal(task)}
                  className={styles.acceptButton}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Send Completion Report
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