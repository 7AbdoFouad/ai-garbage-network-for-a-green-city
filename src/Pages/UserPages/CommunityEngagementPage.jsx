import { useEffect, useState } from "react";
import useUser from "../../hooks/useUser.jsx";
import styles from "./CommunityEngagementPage.module.css"; // Import CSS Module
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function CommunityEngagementPage() {
  const {
    CommunityActivities,
    addSubscribersOfCommunityActivity,
    deleteSubscribersOfCommunityActivity,
    SubscribersOfCommunityActivities,
    updateCommunityActivity,
    fetchUser,
  } = useUser();

  // every CommunityActivities item has this data in database
  // "actIntervalDate": "2025-04-22 - 2025-04-30",
  // "NumOfSubscribers": 10,
  // "NumOfRequiredSubscribers": 40

  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [subscribedActivities, setSubscribedActivities] = useState([]); // Subscribed activities
  const [availableActivities, setAvailableActivities] = useState([]); // Available activities
  const [availablePage, setAvailablePage] = useState(
    parseInt(sessionStorage.getItem("availablePage")) || 1
  );
  const [subscribedPage, setSubscribedPage] = useState(
    parseInt(sessionStorage.getItem("subscribedPage")) || 1
  );
  const itemsPerPage = 6;

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Fetch user and update activities when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchUser(id);
      setUser(data);

      if (!CommunityActivities || CommunityActivities.length === 0) {
        console.warn("No activities found.");
        return;
      }

      if (!SubscribersOfCommunityActivities) {
        console.warn("No subscriber data available.");
        return;
      }

      const userSubscriptions = SubscribersOfCommunityActivities
        .filter((sub) => sub.userId === data.id)
        .map((sub) => sub.ActivityId);

      console.log("User Subscriptions:", userSubscriptions);

      const today = new Date().toISOString().split("T")[0];

      const subscribed = CommunityActivities.filter(
        (activity) =>
          userSubscriptions.includes(activity.id) &&
          activity.NumOfSubscribers < activity.NumOfRequiredSubscribers &&
          activity.actIntervalDate?.split(" - ")[0] > today
      );

      console.log("Subscribed Activities:", subscribed);

      const available = CommunityActivities.filter(
        (activity) =>
          !userSubscriptions.includes(activity.id) &&
          activity.NumOfSubscribers < activity.NumOfRequiredSubscribers &&
          activity.actIntervalDate?.split(" - ")[0] > today
      );

      console.log("Available Activities:", available);

      setSubscribedActivities(subscribed);
      setAvailableActivities(available);
    };

    fetchData();
  }, [CommunityActivities, SubscribersOfCommunityActivities, fetchUser, id]);

  // Subscribe function
  const handleSubscribe = async (activityId, ActName) => {
    if (!user) return;

    await addSubscribersOfCommunityActivity({
      userId: user.id,
      name: user.name,
      email: user.email,
      ActivityName: ActName,
      ActivityId: activityId,
    });

    toast.success("Subscribed successfully! You will be notified via email with the details before the event starts.");

    const activity = CommunityActivities.find((act) => act.id === activityId);
    if (activity) {
      await updateCommunityActivity(activityId, {
        ...activity,
        NumOfSubscribers: activity.NumOfSubscribers + 1,
      });
    }

    const subscribedActivity = availableActivities.find((act) => act.id === activityId);
    const updatedAvailable = availableActivities.filter((act) => act.id !== activityId);
    setAvailableActivities(updatedAvailable);
    setSubscribedActivities([...subscribedActivities, subscribedActivity]);

    // Fix Pagination: If the available list is empty, adjust the page
    const newTotalPages = Math.ceil(updatedAvailable.length / itemsPerPage);
    if (availablePage > newTotalPages) {
      const newPage = Math.max(availablePage - 1, 1);
      setAvailablePage(newPage);
      sessionStorage.setItem("availablePage", newPage);
    }
  };

  // Unsubscribe function
  const handleUnsubscribe = async (activityId) => {
    if (!user) return;

    const subscriberEntry = SubscribersOfCommunityActivities.find(
      (sub) => sub.userId === user.id && sub.ActivityId === activityId
    );

    if (!subscriberEntry) {
      toast.error("Subscription not found!");
      return;
    }

    await deleteSubscribersOfCommunityActivity(subscriberEntry.id);
    toast.success("Unsubscribed successfully!");

    const activity = CommunityActivities.find((act) => act.id === activityId);
    if (activity && activity.NumOfSubscribers > 0) {
      await updateCommunityActivity(activityId, {
        ...activity,
        NumOfSubscribers: activity.NumOfSubscribers - 1,
      });
    }

    // Remove from the subscribed list
    const updatedSubscribed = subscribedActivities.filter((act) => act.id !== activityId);
    setSubscribedActivities(updatedSubscribed);

    // Move back to available activities
    setAvailableActivities([...availableActivities, activity]);

    // Fix Pagination: If the page is now empty, go to the previous page
    const newTotalPages = Math.ceil(updatedSubscribed.length / itemsPerPage);
    if (subscribedPage > newTotalPages) {
      const newPage = Math.max(subscribedPage - 1, 1);
      setSubscribedPage(newPage);
      sessionStorage.setItem("subscribedPage", newPage);
    }
  };

  const handleAvailablePageChange = (page) => {
    setAvailablePage(page);
    sessionStorage.setItem("availablePage", page);
  };

  const handleSubscribedPageChange = (page) => {
    setSubscribedPage(page);
    sessionStorage.setItem("subscribedPage", page);
  };

  const paginatedAvailable = availableActivities.slice(
    (availablePage - 1) * itemsPerPage,
    Math.min(availablePage * itemsPerPage, availableActivities.length)
  );

  const paginatedSubscribed = subscribedActivities.slice(
    (subscribedPage - 1) * itemsPerPage,
    subscribedPage * itemsPerPage
  );

  const totalAvailablePages = Math.ceil(availableActivities.length / itemsPerPage);
  const totalSubscribedPages = Math.ceil(subscribedActivities.length / itemsPerPage);

  return (
    <div className={styles.maincont}>
      <div className={styles.container}>
        {/* Available Activities Section */}
        <h2 className={styles.title}>Available Community Activities</h2>
        {availableActivities.length === 0 ? (
          <p className={styles.noActivitesMessage}>There are no activities available</p>
        ) :  (
          <>
            <div className={styles.activitiesGrid}>
              {paginatedAvailable.map((activity, index) => (
                <div key={activity.id} className={styles.activityCard}>
                  <img
                    src={activity.imgFile}
                    alt={activity.ActName}
                    className={styles.activityImage}
                  />
                  <h3 className={styles.activityTitle}>{activity.ActName}</h3>
                  <p className={styles.activityDescription}>{activity.ActDescription}</p>
                  <p>
                    <strong>Time Period:</strong> {activity.actIntervalDate}
                  </p>
                  <p>
                    <strong>Subscribers:</strong> {activity.NumOfSubscribers} / {activity.NumOfRequiredSubscribers}
                  </p>
                  <p>
                    <strong>Available Seats:</strong> {activity.NumOfRequiredSubscribers - activity.NumOfSubscribers}
                  </p>
                  <button
                    className={styles.subscribeButton}
                    onClick={() => handleSubscribe(activity.id, activity.ActName)}
                  >
                    Subscribe to Activity
                  </button>
                </div>
              ))}
            </div>
            {totalAvailablePages > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: totalAvailablePages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handleAvailablePageChange(i + 1)}
                    className={availablePage === i + 1 ? styles.activePage : styles.pageButton}
                    style={{backgroundColor:availablePage === i + 1 ? "#2e7d32" : "white",
                      color:availablePage === i + 1 ? "white" : "black",
                      border:availablePage === i + 1 ? "#2e7d32" : "white",
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
            <h2 className={styles.title}>Subscribed Community Activities</h2>
            <div className={styles.activitiesGrid}>
              {paginatedSubscribed.map((activity, index) => (
                <div key={activity.id} className={styles.activityCard}>
                  <img
                    src={activity.imgFile}
                    alt={activity.ActName}
                    className={styles.activityImage}
                  />
                  <h3 className={styles.activityTitle}>{activity.ActName}</h3>
                  <p className={styles.activityDescription}>{activity.ActDescription}</p>
                  <p>
                    <strong>Time Period:</strong> {activity.actIntervalDate}
                  </p>
                  <p>
                    <strong>Subscribers:</strong> {activity.NumOfSubscribers} / {activity.NumOfRequiredSubscribers}
                  </p>
                  <p>
                    <strong>Available Seats:</strong> {activity.NumOfRequiredSubscribers - activity.NumOfSubscribers}
                  </p>
                  <button
                    className={styles.unsubscribeButton}
                    onClick={() => handleUnsubscribe(activity.id)}
                  >
                    Unsubscribe
                  </button>
                </div>
              ))}
            </div>
            {totalSubscribedPages > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: totalSubscribedPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handleSubscribedPageChange(i + 1)}
                    className={subscribedPage === i + 1 ? styles.activePage : styles.pageButton}
                    style={{backgroundColor:subscribedPage === i + 1 ? "#2e7d32" : "white",
                      color:subscribedPage === i + 1 ? "white" : "black",
                      border:subscribedPage === i + 1 ? "#2e7d32" : "white",
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
