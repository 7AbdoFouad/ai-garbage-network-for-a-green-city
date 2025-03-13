import React, { useEffect, useState } from "react";
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
    fetchUser,
  } = useUser();

  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [subscribedActivities, setSubscribedActivities] = useState([]); // Subscribed activities
  const [availableActivities, setAvailableActivities] = useState([]); // Available activities

  // Fetch user and update activities when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchUser(id);
      setUser(data);

      // Get activities the user is subscribed to
      const userSubscriptions = SubscribersOfCommunityActivities.filter(
        (sub) => sub.userId === data.id
      ).map((sub) => sub.ActivityId);

      // Filter activities into available and subscribed
      const subscribed = CommunityActivities.filter((activity) =>
        userSubscriptions.includes(activity.id)
      );
      setSubscribedActivities(subscribed);

      const available = CommunityActivities.filter(
        (activity) => !userSubscriptions.includes(activity.id)
      );
      setAvailableActivities(available);
    };

    fetchData();
  }, [CommunityActivities, SubscribersOfCommunityActivities]);

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

    toast.success("تم الاشتراك بنجاح!");

    // Move activity from available to subscribed
    const subscribedActivity = availableActivities.find((act) => act.id === activityId);
    setSubscribedActivities([...subscribedActivities, subscribedActivity]);
    setAvailableActivities(availableActivities.filter((act) => act.id !== activityId));
  };

  // Unsubscribe function
  const handleUnsubscribe = async (activityId) => {
    if (!user) return;

    await deleteSubscribersOfCommunityActivity(activityId, user.id);
    toast.success("تم إلغاء الاشتراك بنجاح!");

    // Move activity back to available list
    const unsubscribedActivity = subscribedActivities.find((act) => act.id === activityId);
    setAvailableActivities([...availableActivities, unsubscribedActivity]);
    setSubscribedActivities(subscribedActivities.filter((act) => act.id !== activityId));
  };

  return (
    <div className={styles.container}>
      {/* Available Activities Section */}
      <h2 className={styles.title}>الأنشطة الاجتماعية المتاحة</h2>
      <div className={styles.activitiesGrid}>
        {availableActivities.map((activity, index) => (
          <div key={activity.id} className={styles.activityCard}>
            <img
              src={`/src/Pages/UserPages/${index + 4}.jpg`}
              alt={activity.ActName}
              className={styles.activityImage}
            />
            <h3 className={styles.activityTitle}>{activity.ActName}</h3>
            <p className={styles.activityDescription}>{activity.ActDescription}</p>
            <p><strong>الفترة الزمنية:</strong> {activity.actIntervalDate}</p>
            <button
              className={styles.subscribeButton}
              onClick={() => handleSubscribe(activity.id, activity.ActName)}
            >
              اشترك في الفاعلية
            </button>
          </div>
        ))}
      </div>

      {/* Subscribed Activities Section */}
      {subscribedActivities.length > 0 && (
        <>
          <h2 className={styles.title}>الأنشطة الاجتماعية التي تم الاشتراك بها</h2>
          <div className={styles.activitiesGrid}>
            {subscribedActivities.map((activity, index) => (
              <div key={activity.id} className={styles.activityCard}>
                <img
                  src={`/src/Pages/UserPages/${index + 4}.jpg`}
                  alt={activity.ActName}
                  className={styles.activityImage}
                />
                <h3 className={styles.activityTitle}>{activity.ActName}</h3>
                <p className={styles.activityDescription}>{activity.ActDescription}</p>
                <p><strong>الفترة الزمنية:</strong> {activity.actIntervalDate}</p>
                <button
                  className={styles.unsubscribeButton}
                  onClick={() => handleUnsubscribe(activity.id)}
                >
                  إلغاء الاشتراك
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
