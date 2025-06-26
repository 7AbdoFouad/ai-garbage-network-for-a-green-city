import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EditProfileModal from "./EditProfileModal";
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";
import settingstyle from "./setting.module.css";
import Cookies from "js-cookie";

export default function SettingPage() {
  const { id } = useParams();
  const [user, setUser] = useState(() => {
    // Initialize from localStorage if available
    const savedUser = localStorage.getItem('userProfile');
    return savedUser ? JSON.parse(savedUser) : {};
  });
  const [profileImage, setProfileImage] = useState("");
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from API
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      const response = await fetch("/api/Users/my-profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch user profile");
      
      const data = await response.json();
      
      // Save to state and localStorage
      setUser(data);
      localStorage.setItem('userProfile', JSON.stringify(data));
      
      // Set profile image
      setProfileImage(data.profileImage || "");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Handle profile image change
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const token = Cookies.get("token");
      const formData = new FormData();
      formData.append("profileimage", file);
      
      // Add other user fields that need to be preserved
      formData.append("name", user.name);
      formData.append("phone", user.phone);
      formData.append("address", user.address);

      const response = await fetch("/api/Users/my-profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile image");
      }

      // Success - refetch updated profile data
      await fetchUserProfile();
      toast.success("Profile image updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update profile image");
    }
  };

  // Update user profile
  const updateUserProfile = async (updatedData) => {
    try {
      const token = Cookies.get("token");
      const formData = new FormData();
      
      // Append updated fields
      formData.append("name", updatedData.name);
      formData.append("phone", updatedData.phone);
      formData.append("address", updatedData.address);
      
      const response = await fetch("/api/Users/my-profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      // Success - refetch updated profile data
      await fetchUserProfile();
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update profile");
      throw error;
    }
  };

  if (loading) {
    return (
      <div className={settingstyle.container}>
        <div className={settingstyle.loading}>
          <div className={settingstyle.spinner}></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={settingstyle.container}>
      {/* Profile Picture */}
      <div
        className={settingstyle.profilePicture}
        onClick={() => document.getElementById("fileInput").click()}
      >
        <img 
          src={profileImage || "https://www.placeholderimage.online/images/generic/user-profile-images.jpg"} 
          alt="Profile" 
          className={settingstyle.profileImage} 
        />
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageChange}
        />
      </div>

   {/* Profile Info */}
      <div className={settingstyle.profileInfo}>
        <div className={settingstyle.profileField}>
          <strong>Name:</strong>{" "}
          <input
            className={settingstyle.inputField}
            value={user.name || ""}
            disabled
          />
        </div>

        <div className={settingstyle.profileField}>
          <strong>Email:</strong>{" "}
          <input
            className={settingstyle.inputField}
            value={user.email || ""}
            disabled
          />
        </div>

        <div className={settingstyle.profileField}>
          <strong>Phone:</strong>{" "}
          <input
            className={settingstyle.inputField}
            value={user.phone || ""}
            disabled
          />
        </div>

        <div className={settingstyle.profileField}>
          <strong>Address:</strong>{" "}
          <input
            className={settingstyle.inputField}
            value={user.address || ""}
            disabled
          />
        </div>
      </div>

      {/* User Statistics */}
      <div className={settingstyle.permissions}>
        <h4>User Statistics</h4>
        <li style={{ listStyleType: "none" }}>
          📌 Accepted announcements:{" "}
          <strong>{user.numOfAcceptedAnnouncementsCount || 0}</strong>
        </li>
        <li style={{ listStyleType: "none" }}>
          📌 Completed activities:{" "}
          <strong>{user.numOfCompletedActivitiesCount || 0}</strong>
        </li>
        <li style={{ listStyleType: "none" }}>
          📌 Completed polls:{" "}
          <strong>{user.numOfCompletedPollsCount || 0}</strong>
        </li>
      </div>

      {/* Buttons */}
      <div className={settingstyle.buttonContainer}>
        <button
          className={`${settingstyle.button} ${settingstyle.editButton}`}
          onClick={() => setIsEditing(true)}
        >
          ✏️ Edit Profile
        </button>
        <button
          className={`${settingstyle.button} ${settingstyle.logoutButton}`}
          onClick={logout}
        >
          🚪 Log Out
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <EditProfileModal
          userData={user}
          updateUserProfile={updateUserProfile}
          closeModal={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}