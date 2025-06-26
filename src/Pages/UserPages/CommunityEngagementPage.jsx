import { useEffect, useState, useMemo } from "react";
import styles from "./CommunityEngagementPage.module.css";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

const updateCommunityActivity = async (id, activity) => {
  try {
    const token = Cookies.get("token");
    const formData = new FormData();
    
    formData.append("actName", activity.actName);
    formData.append("actDescription", activity.actDescription);
    formData.append("actIntervalDate", activity.actIntervalDate);
    formData.append("actState", activity.actState);
    formData.append("numOfSubscribers", activity.numOfSubscribers);
    formData.append("numOfRequiredSubscribers", activity.numOfRequiredSubscribers);
    
    if (activity.photo && activity.photo.startsWith("data:image")) {
      formData.append("photo", activity.photo);
    }

    const response = await fetch(`/api/CommunityActivities/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData
    });
    
    const text = await response.text();
    if (!text) {
      return activity;
    }
    
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error("Failed to parse JSON response:", text);
      throw new Error("Received invalid JSON from server");
    }
  } catch (error) {
    console.error("Update activity error:", error);
    toast.error(error.message || "Failed to update activity");
    throw error;
  }
};

// Helper function to parse date from DD/MM/YYYY format
const parseDMYDate = (dateString) => {
  if (!dateString) return null;
  const [day, month, year] = dateString.split('/');
  return new Date(`${year}-${month}-${day}`);
};

export default function CommunityEngagementPage() {
  const [allActivities, setAllActivities] = useState([]);
  const [subscribedIds, setSubscribedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;

  // Initialize pagination from session storage
  const [availablePage, setAvailablePage] = useState(() => {
    const savedPage = sessionStorage.getItem("availablePage");
    return savedPage ? parseInt(savedPage) : 1;
  });
  
  const [subscribedPage, setSubscribedPage] = useState(() => {
    const savedPage = sessionStorage.getItem("subscribedPage");
    return savedPage ? parseInt(savedPage) : 1;
  });

  // Get token from cookies
  const getAuthToken = () => {
    return Cookies.get("token");
  };

  // Fetch all community activities
  const fetchAllActivities = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch("/api/CommunityActivities", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch activities");
      
      const data = await response.json();
      return data;
    } catch (error) {
      toast.error(error.message);
      return [];
    }
  };

  // Fetch user's subscriptions
  const fetchMySubscriptions = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch("/api/CommunityActivities/my-subscriptions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch subscriptions");
      
      return await response.json();
    } catch (error) {
      toast.error(error.message);
      return [];
    }
  };

  // Initialize data
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const [activities, subscriptions] = await Promise.all([
          fetchAllActivities(),
          fetchMySubscriptions()
        ]);
        
        // Extract subscribed activity IDs directly from the subscriptions
        const subscribedIds = subscriptions.map(sub => sub.id);
        
        setAllActivities(activities);
        setSubscribedIds(subscribedIds);
      } catch (error) {
        toast.error("Failed to initialize data");
      } finally {
        setLoading(false);
      }
    };
    
    initData();
  }, []);

  // Compute available and subscribed activities with date filtering
  const { availableActivities, subscribedActivities } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const filterActivities = (activity) => {
      if (!activity.actIntervalDate) return false;
      
      const [startDateStr] = activity.actIntervalDate.split(" - ");
      if (!startDateStr) return false;
      
      try {
        const startDate = parseDMYDate(startDateStr);
        if (!startDate) return false;
        
        startDate.setHours(0, 0, 0, 0);
        return startDate > today;
      } catch {
        return false;
      }
    };
    
    const available = allActivities.filter(activity => 
      !subscribedIds.includes(activity.id) &&
      activity.numOfSubscribers < activity.numOfRequiredSubscribers &&
      filterActivities(activity)
    );
    
    const subscribed = allActivities.filter(activity => 
      subscribedIds.includes(activity.id) &&
      activity.numOfSubscribers < activity.numOfRequiredSubscribers &&
      filterActivities(activity)
    );
    
    return { availableActivities: available, subscribedActivities: subscribed };
  }, [allActivities, subscribedIds]);

  // Adjust pagination when activities change
  useEffect(() => {
    const totalAvailablePages = Math.ceil(availableActivities.length / itemsPerPage);
    if (availablePage > totalAvailablePages && totalAvailablePages > 0) {
      const newPage = Math.max(totalAvailablePages, 1);
      setAvailablePage(newPage);
      sessionStorage.setItem("availablePage", newPage.toString());
    } else if (availableActivities.length === 0) {
      setAvailablePage(1);
      sessionStorage.setItem("availablePage", "1");
    }
    
    const totalSubscribedPages = Math.ceil(subscribedActivities.length / itemsPerPage);
    if (subscribedPage > totalSubscribedPages && totalSubscribedPages > 0) {
      const newPage = Math.max(totalSubscribedPages, 1);
      setSubscribedPage(newPage);
      sessionStorage.setItem("subscribedPage", newPage.toString());
    } else if (subscribedActivities.length === 0) {
      setSubscribedPage(1);
      sessionStorage.setItem("subscribedPage", "1");
    }
  }, [availableActivities, subscribedActivities]);

  // Save pagination to session storage
  useEffect(() => {
    sessionStorage.setItem("availablePage", availablePage.toString());
  }, [availablePage]);

  useEffect(() => {
    sessionStorage.setItem("subscribedPage", subscribedPage.toString());
  }, [subscribedPage]);

  // Handle subscription
  const handleSubscribe = async (activityId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/CommunityActivities/${activityId}/subscribe`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Subscription failed");
      
      // Update all activities with new subscriber count
      setAllActivities(prev => 
        prev.map(a => 
          a.id === activityId 
            ? { ...a, numOfSubscribers: a.numOfSubscribers + 1 } 
            : a
        )
      );
      
      // Add to subscribed IDs
      setSubscribedIds(prev => [...prev, activityId]);
      
      // Adjust pagination
      const newAvailableActivities = availableActivities.filter(a => a.id !== activityId);
      const newAvailablePageCount = Math.ceil(newAvailableActivities.length / itemsPerPage);
      
      if (newAvailablePageCount > 0 && availablePage > newAvailablePageCount) {
        setAvailablePage(newAvailablePageCount);
      }
      
      toast.success("Subscribed successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle unsubscription
  const handleUnsubscribe = async (activityId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/CommunityActivities/${activityId}/unsubscribe`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Unsubscription failed");
      
      setAllActivities(prev => 
        prev.map(a => 
          a.id === activityId 
            ? { ...a, numOfSubscribers: a.numOfSubscribers - 1 } 
            : a
        )
      );
      
      setSubscribedIds(prev => prev.filter(id => id !== activityId));
      
      const newSubscribedActivities = subscribedActivities.filter(a => a.id !== activityId);
      const newSubscribedPageCount = Math.ceil(newSubscribedActivities.length / itemsPerPage);
      
      if (newSubscribedPageCount > 0 && subscribedPage > newSubscribedPageCount) {
        setSubscribedPage(newSubscribedPageCount);
      }
      
      toast.success("Unsubscribed successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Pagination handlers
  const handleAvailablePageChange = (page) => setAvailablePage(page);
  const handleSubscribedPageChange = (page) => setSubscribedPage(page);

  // Paginated data
  const paginatedAvailable = availableActivities.slice(
    (availablePage - 1) * itemsPerPage,
    availablePage * itemsPerPage
  );
  
  const paginatedSubscribed = subscribedActivities.slice(
    (subscribedPage - 1) * itemsPerPage,
    subscribedPage * itemsPerPage
  );
  
  const totalAvailablePages = Math.ceil(availableActivities.length / itemsPerPage);
  const totalSubscribedPages = Math.ceil(subscribedActivities.length / itemsPerPage);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading community activities...</p>
      </div>
    );
  }

  return (
    <div className={styles.maincont}>
      <div className={styles.container}>
        {/* Available Activities Section */}
        <h2 className={styles.title}>Available Community Activities</h2>
        {availableActivities.length === 0 ? (
          <p className={styles.noActivitesMessage}>There are no upcoming activities available</p>
        ) : (
          <>
            <div className={styles.activitiesGrid}>
              {paginatedAvailable.map((activity) => {
                const [startDateStr] = activity.actIntervalDate?.split(" - ") || [];
                const startDate = startDateStr ? parseDMYDate(startDateStr) : null;
                
                return (
                  <div key={activity.id} className={styles.activityCard}>
                    {activity.photo && (
                      <img
                        src={activity.photo}
                        alt={activity.actName}
                        className={styles.activityImage}
                      />
                    )}
                    <h3 className={styles.activityTitle}>{activity.actName}</h3>
                    <p className={styles.activityDescription}>{activity.actDescription}</p>
                    {startDate && (
                      <p>
                        <strong>Starts:</strong> {startDate.toLocaleDateString()}
                      </p>
                    )}
                    <p>
                      <strong>Subscribers:</strong> {activity.numOfSubscribers} / {activity.numOfRequiredSubscribers}
                    </p>
                    <p>
                      <strong>Available Seats:</strong> {activity.numOfRequiredSubscribers - activity.numOfSubscribers}
                    </p>
                    <button
                      className={styles.subscribeButton}
                      onClick={() => handleSubscribe(activity.id)}
                    >
                      Subscribe to Activity
                    </button>
                  </div>
                );
              })}
            </div>
            {totalAvailablePages > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: totalAvailablePages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handleAvailablePageChange(i + 1)}
                    className={availablePage === i + 1 ? styles.activePage : styles.pageButton}
                    style={{
                      backgroundColor: availablePage === i + 1 ? "#2e7d32" : "white",
                      color: availablePage === i + 1 ? "white" : "black",
                      border: `1px solid ${availablePage === i + 1 ? "#2e7d32" : "#ccc"}`,
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Subscribed Activities Section */}
        {subscribedActivities.length > 0 && (
          <>
            <h2 className={styles.title}>Your Subscribed Activities</h2>
            <div className={styles.activitiesGrid}>
              {paginatedSubscribed.map((activity) => {
                const [startDateStr] = activity.actIntervalDate?.split(" - ") || [];
                const startDate = startDateStr ? parseDMYDate(startDateStr) : null;
                
                return (
                  <div key={activity.id} className={styles.activityCard}>
                    {activity.photo && (
                      <img
                        src={activity.photo}
                        alt={activity.actName}
                        className={styles.activityImage}
                      />
                    )}
                    <h3 className={styles.activityTitle}>{activity.actName}</h3>
                    <p className={styles.activityDescription}>{activity.actDescription}</p>
                    {startDate && (
                      <p>
                        <strong>Starts:</strong> {startDate.toLocaleDateString()}
                      </p>
                    )}
                    <p>
                      <strong>Subscribers:</strong> {activity.numOfSubscribers} / {activity.numOfRequiredSubscribers}
                    </p>
                    <p>
                      <strong>Available Seats:</strong> {activity.numOfRequiredSubscribers - activity.numOfSubscribers}
                    </p>
                    <button
                      className={styles.unsubscribeButton}
                      onClick={() => handleUnsubscribe(activity.id)}
                    >
                      Unsubscribe
                    </button>
                  </div>
                );
              })}
            </div>
            {totalSubscribedPages > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: totalSubscribedPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handleSubscribedPageChange(i + 1)}
                    className={subscribedPage === i + 1 ? styles.activePage : styles.pageButton}
                    style={{
                      backgroundColor: subscribedPage === i + 1 ? "#2e7d32" : "white",
                      color: subscribedPage === i + 1 ? "white" : "black",
                      border: `1px solid ${subscribedPage === i + 1 ? "#2e7d32" : "#ccc"}`,
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}