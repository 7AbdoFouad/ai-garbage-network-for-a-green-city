// DriversAvailableTasks.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { AuthContext } from '../../Components/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styles from './DriversAvailableTasks.module.css';

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
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cookies] = useCookies(['token']);
  const { logout } = useContext(AuthContext);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const tasksPerPage = 6;
  
  const modalRef = useRef(null);
  
  const baseUrl = 'https://greencityapi.runasp.net/api';

  useEffect(() => {
    // Get current page from session storage if available
    const savedPage = sessionStorage.getItem('driversTasksPage');
    if (savedPage) {
      setCurrentPage(parseInt(savedPage, 10));
    }
    
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/TruckDrivers/my-tasks`, {
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

  // Handle outside click to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeCompleteModal();
      }
    };
    
    if (showCompleteModal) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Re-enable body scrolling when modal closes
      document.body.style.overflow = 'auto';
    };
  }, [showCompleteModal]);

  const openCompleteModal = (task) => {
    setSelectedTask(task);
    setShowCompleteModal(true);
  };

  const closeCompleteModal = () => {
    setShowCompleteModal(false);
    setSelectedTask(null);
  };

  const handleCompleteTask = async (values, { resetForm }) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('driverName', values.driverName);
      formData.append('reportDESC', values.reportDESC);
      formData.append('sentAt', values.sentAt);
      formData.append('photoFile', values.photoFile);
      formData.append('announcementsID', selectedTask.id.toString());

      const response = await fetch(`/api/TruckDrivers/complete-task/${selectedTask.id}`, {
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

      // Remove the completed task from the list
      setTasks(tasks.filter(task => task.id !== selectedTask.id));
      toast.success('Task completed successfully!');
      
      // Recalculate total pages after task removal
      setTotalPages(Math.ceil((tasks.length - 1) / tasksPerPage));
      
      // Adjust current page if we're on the last page and it becomes empty
      if (currentPage > Math.ceil((tasks.length - 1) / tasksPerPage)) {
        const newPage = Math.max(1, Math.ceil((tasks.length - 1) / tasksPerPage));
        setCurrentPage(newPage);
        sessionStorage.setItem('driversTasksPage', newPage.toString());
      }
      
      // Close modal and reset form
      closeCompleteModal();
      resetForm();
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
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
      
      <div className={styles.contentContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Tasks</h1>
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
              </div>
              
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.taskTitle}>{task.announcementType}</h3>
                                   {/* <div className={styles.regionBadge}>
                                     {task.regionName === "None" ? "No Region specified" : task.regionName}
                                   </div> */}
                                 </div>
                                 
                                 <p className={styles.taskDescription}>
                                   {task.announcementDescription === "None" ? 
                                       <div className={styles.taskDetails}>
                 
                                                 <div className={styles.detailItem}>
                                     <span className={styles.detailLabel}>Region</span>
                                     <span className={styles.detailValue}>
                                       {task.regionName=== "None" ? "No Region specified": task.regionName}
                                     </span>
                                   </div>
                                   <div className={styles.detailItem}>
                                     <span className={styles.detailLabel}>Location</span>
                                     <span className={styles.detailValue}>
                                       {task.siteLocation === "None" ? "No location specified" : task.siteLocation}
                                     </span>
                                   </div>
                                      
                                 </div>
                                   : 
                                   <>
                                 {task.siteLocation === "None" ?
                                                 <div className={styles.taskDetails}> 
                 
                                 <div className={styles.detailItem}>
                                     <span className={styles.detailLabel}>Description</span>
                                     <span className={styles.detailValue}>
                                       {task.announcementDescription=== "None" ? "No Description specified": task.announcementDescription}
                                     </span>
                                   </div></div> :
                                 <div className={styles.taskDetails}> 
                                 {/* <div className={styles.detailItem}>{task.announcementDescription}</div> */}
                                    <div className={styles.detailItem}>
                                     <span className={styles.detailLabel}>Description</span>
                                     <span className={styles.detailValue}>
                                       {task.announcementDescription=== "None" ? "No Description specified": task.announcementDescription}
                                     </span>
                                   </div>
                                   <div className={styles.detailItem}>
                                     <span className={styles.detailLabel}>Region</span>
                                     <span className={styles.detailValue}>
                                       {task.regionName=== "None" ? "No Region specified": task.regionName}
                                     </span>
                                   </div>
                                   <div className={styles.detailItem}>
                                     <span className={styles.detailLabel}>Location</span>
                                     <span className={styles.detailValue}>
                                       {task.siteLocation === "None" ? "No location specified" : task.siteLocation}
                                     </span>
                                   </div>
                                   
                           
                                
                                 </div>
                                 }</>
                                   }
                                 </p>
                <button
                  onClick={() => openCompleteModal(task)}
                  className={styles.acceptButton}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Send Completion Report
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
    </div>
  );
}