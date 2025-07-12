/* NotificationsPage.jsx */
import React, { useState, useEffect, useMemo } from 'react';
import styles from './NotificationsPage.module.css';
import { FaTrashAlt, FaBell, FaGlobe, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

// Utility to get stored auth token
const getAuthToken = () => Cookies.get('token');

const NotificationsPage = () => {
  // Initialize state from session storage
  const [view, setView] = useState(() => {
    return sessionStorage.getItem('notificationsView') || 'private';
  });
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = sessionStorage.getItem('notificationsPage');
    return savedPage ? parseInt(savedPage) : 1;
  });
  const [itemsPerPage] = useState(5);
  const [userNotifications, setUserNotifications] = useState([]);
  const [publicNotifications, setPublicNotifications] = useState([]);
  const [hiddenPublicIds, setHiddenPublicIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  // Calculate visible public notifications
  const visiblePublic = useMemo(() => {
    return publicNotifications.filter(
      pub => !hiddenPublicIds.has(String(pub.id))
    );
  }, [publicNotifications, hiddenPublicIds]);

  // Calculate current items based on view
  const items = useMemo(() => {
    return view === 'private' ? userNotifications : visiblePublic;
  }, [view, userNotifications, visiblePublic]);

  // Calculate pagination details
  const totalPages = useMemo(() => {
    return Math.ceil(items.length / itemsPerPage) || 1;
  }, [items.length, itemsPerPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  // Fetch notifications from backend with auth
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      // Fetch private notifications
      const privateRes = await fetch(`/api/Notifications/User`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!privateRes.ok) throw new Error('Failed to fetch private notifications');
      const privateData = await privateRes.json();
      const userPrivateNotifications = privateData;

      // Fetch public notifications
      const publicRes = await fetch(`/api/Notifications/Public`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!publicRes.ok) throw new Error('Failed to fetch public notifications');
      const publicData = await publicRes.json();

      setUserNotifications(userPrivateNotifications);
      setPublicNotifications(publicData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Hide public notification for user
  const hidePublicNotification = async (publicId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `/api/notifications/Public/DeleteForUser/${publicId}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (!response.ok) throw new Error('Failed to hide notification');
      setHiddenPublicIds(prev => {
        const newSet = new Set(prev);
        newSet.add(String(publicId));
        return newSet;
      });
      toast.success('Notification hidden successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Delete private notification
  const deletePrivateNotification = async (notificationId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `/api/Notifications/User/${notificationId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (!response.ok) throw new Error('Failed to delete notification');
      setUserNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      toast.success('Notification deleted successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Save pagination state to session storage
  useEffect(() => {
    sessionStorage.setItem('notificationsView', view);
    sessionStorage.setItem('notificationsPage', currentPage.toString());
  }, [view, currentPage]);

  // Adjust current page when data changes
  useEffect(() => {
    if (!loading) {
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      } else if (items.length === 0) {
        setCurrentPage(1);
      }
    }
  }, [loading, items.length, totalPages]);

  // Initial data fetch
  useEffect(() => {
    fetchNotifications();
  }, [id]);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const handleViewChange = (newView) => {
    setView(newView);
    setCurrentPage(1);
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          Loading notifications...
        </div>
      </div>
    );
  }

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
                  <time>{formatDate(note.notificationDate)}</time>
                </div>
                <div className={styles.actions}>
                  <button onClick={() => 
                    view === 'private' 
                      ? deletePrivateNotification(note.id) 
                      : hidePublicNotification(note.id)
                  }>
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