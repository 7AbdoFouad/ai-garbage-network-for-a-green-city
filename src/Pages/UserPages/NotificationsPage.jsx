/* NotificationsPage.jsx */
import React, { useState, useEffect } from 'react';
import styles from './NotificationsPage.module.css';
import { FaTrashAlt, FaBell, FaGlobe, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import useUser from "../../hooks/useUser";
import { useParams } from "react-router-dom";
import { div } from '@tensorflow/tfjs';

const NotificationsPage = () => {
  const [view, setView] = useState('private');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const { 
    UserNotifications,
    PublicNotifications,
    UserNotificationsMarkedPublic,
    deleteUserNotification,
    addUserNotificationMarkedPublic,
  } = useUser();
  const { id } = useParams();

  // Session Storage for pagination
  useEffect(() => {
    const savedPage = sessionStorage.getItem(`notificationsPage-${view}`);
    if (savedPage) setCurrentPage(parseInt(savedPage));
  }, [view]);

  useEffect(() => {
    sessionStorage.setItem(`notificationsPage-${view}`, currentPage);
  }, [currentPage, view]);

  // Filtering logic
  const userMarkedSet = new Set(
    UserNotificationsMarkedPublic
      .filter(mark => String(mark.userId) === String(id))
      .map(mark => String(mark.PublicNotificationsID))
  );

  const visiblePublic = PublicNotifications.filter(
    pub => !userMarkedSet.has(String(pub.id))
  );

  const items = view === 'private' ? UserNotifications : visiblePublic;

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const handleViewChange = (newView) => {
    setView(newView);
    setCurrentPage(1);
  };

  return (
    <div className={styles.container}>
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          className={`${styles.tab} ${view === 'private' ? styles.active : ''}`}
          onClick={() => handleViewChange('private')}
        >
          <FaBell /> Private
        </button>
        <button
          className={`${styles.tab} ${view === 'public' ? styles.active : ''}`}
          onClick={() => handleViewChange('public')}
        >
          <FaGlobe /> Public
        </button>
      </header>

      <ul className={styles.list}>
        {currentItems.length === 0 ? (
          <li className={styles.empty}>
            {view === 'private'
              ? 'No private notifications.'
              : 'No public notifications available.'}
          </li>
        ) : (
          currentItems.map(note => (
            <li key={note.id} className={styles.card}>
              <div className={styles.content}>
                <span>{note.notificationContent}</span>
                <time>{note.notificationDate}</time>
              </div>
              <div className={styles.actions}>
                <button onClick={() => deleteUserNotification(note.id)}>
                  <FaTrashAlt />
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      {items.length > itemsPerPage && (
        <div className={styles.pagination}>
          <button 
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.pagButton}
          >
            <FaChevronLeft />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`${styles.pagButton} ${
                currentPage === i + 1 ? styles.activePage : ''
              }`}
            >
              {i + 1}
            </button>
          ))}
          
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
    </div>
  );
};

export default NotificationsPage;