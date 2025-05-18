import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import useUser from "../../hooks/useUser";
import { FaTrashAlt, FaCheckCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from './Notifications.module.css';

const usePagination = (key, initialPage = 1) => {
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = sessionStorage.getItem(key);
    return saved ? parseInt(saved) : initialPage;
  });

  useEffect(() => {
    sessionStorage.setItem(key, currentPage);
  }, [currentPage, key]);

  return [currentPage, setCurrentPage];
};

export default function Notifications() {
  const { 
    managerNotifications,
    deleteManagerNotification
  } = useUser();
  const { id } = useParams();
  const [currentPage, setCurrentPage] = usePagination('notificationsPage');
  const itemsPerPage = 5;

  // Safely handle undefined notifications
  const notifications = managerNotifications || [];
  
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = notifications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(notifications.length / itemsPerPage);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🔔 Notifications</h1>
        <div className={styles.subtitle}>Recent activities and updates</div>
      </header>

      <div className={styles.notificationsList}>
        {currentItems.map((notification) => (
          <div key={notification.id} className={styles.notificationCard}>
            <div className={styles.notificationContent}>
              <div className={styles.iconContainer}>
                <FaCheckCircle className={styles.notificationIcon} />
              </div>
              <div>
                <h3 className={styles.notificationTitle}>
                  {notification.notificationContent}
                </h3>
                <time className={styles.notificationDate}>
                  {formatDate(notification.notificationDate)}
                </time>
              </div>
            </div>
            <button 
              onClick={() => deleteManagerNotification(notification.id)}
              className={styles.deleteButton}
            >
              <FaTrashAlt className={styles.trashIcon} />
            </button>
          </div>
        ))}
      </div>

      {notifications.length > itemsPerPage && (
        <div className={styles.pagination}>
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.pagButton}
          >
            <FaChevronLeft />
          </button>
          
          <span className={styles.pageIndicator}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.pagButton}
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}