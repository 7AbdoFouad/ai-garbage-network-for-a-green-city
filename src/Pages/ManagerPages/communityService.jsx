// src/services/communityService.js
import { toast } from "react-toastify";

const API_URL = "https://your-api-base-url";

// Fetch all community activities
export const fetchCommunityActivities = async () => {
  try {
    const response = await fetch(`/api/CommunityActivities`);
    if (!response.ok) throw new Error("Failed to fetch activities");
    return await response.json();
  } catch (error) {
    toast.error(error.message);
    return [];
  }
};

// Create new activity
export const createCommunityActivity = async (activity) => {
  const formData = new FormData();
  Object.entries(activity).forEach(([key, value]) => {
    if (key !== "imgFile") formData.append(key, value);
  });
  
  if (activity.imgFile) {
    // Convert base64 to blob if needed
    const blob = await fetch(activity.imgFile).then(res => res.blob());
    formData.append("photo", blob, "activity-image.png");
  }

  try {
    const response = await fetch(`/api/CommunityActivities`, {
      method: "POST",
      body: formData
    });
    return await response.json();
  } catch (error) {
    toast.error("Failed to create activity");
    throw error;
  }
};

// Update activity
export const updateCommunityActivity = async (id, activity) => {
  const formData = new FormData();
  Object.entries(activity).forEach(([key, value]) => {
    if (key !== "imgFile") formData.append(key, value);
  });

  if (activity.imgFile && activity.imgFile.startsWith("data:image")) {
    const blob = await fetch(activity.imgFile).then(res => res.blob());
    formData.append("photo", blob, "activity-image.png");
  }

  try {
    const response = await fetch(`/api/CommunityActivities/${id}`, {
      method: "PUT",
      body: formData
    });
    return await response.json();
  } catch (error) {
    toast.error("Failed to update activity");
    throw error;
  }
};

// Delete activity
export const deleteCommunityActivity = async (id) => {
  try {
    await fetch(`/api/CommunityActivities/${id}`, {
      method: "DELETE"
    });
    return true;
  } catch (error) {
    toast.error("Failed to delete activity");
    return false;
  }
};

// Get subscribers for activity
export const fetchSubscribers = async (activityId) => {
  try {
    const response = await fetch(
      `/api/CommunityActivities/${activityId}/subscriptions`
    );
    return await response.json();
  } catch (error) {
    toast.error("Failed to fetch subscribers");
    return [];
  }
};

// Delete subscriber
export const deleteSubscription = async (activityId, userId) => {
  try {
    await fetch(
      `/api/CommunityActivities/${activityId}/DeletesSubscripers?uid=${userId}`,
      { method: "POST" }
    );
    return true;
  } catch (error) {
    toast.error("Failed to delete subscription");
    return false;
  }
};

// Complete activity
export const completeActivity = async (activityId) => {
  try {
    await fetch(
      `/api/CommunityActivities/${activityId}/complete-activity`,
      { method: "POST" }
    );
    return true;
  } catch (error) {
    toast.error("Failed to complete activity");
    return false;
  }
};

// Add public notification
export const addPublicNotification = async (content) => {
  try {
    await fetch(`/api/PublicNotifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notificationContent: content,
        notificationDate: new Date().toISOString().split("T")[0]
      })
    });
  } catch (error) {
    console.error("Failed to add public notification:", error);
  }
};

// Add user notification
export const addUserNotification = async (userId, content) => {
  try {
    await fetch(`/api/UserNotifications?id=${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notificationContent: content,
        notificationDate: new Date().toISOString().split("T")[0],
        isRead: false
      })
    });
  } catch (error) {
    console.error("Failed to add user notification:", error);
  }
};