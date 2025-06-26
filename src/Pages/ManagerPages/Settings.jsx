// src/components/UserPages/Settings.js
import React, { useState, useEffect } from "react";
import styles from "./SettingPage.module.css";
import EditProfileModal from "../UserPages/EditProfileModal";
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";

export default function Settings() {
 const { id } = useParams();
  const [manager, setManager] = useState(() => {
    const savedManager = localStorage.getItem('managerProfile');
    return savedManager ? JSON.parse(savedManager) : {};
  });
  const [profileImage, setProfileImage] = useState("");
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch manager profile from API
  const fetchManagerProfile = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      const response = await fetch("/api/Users/my-profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch manager profile");
      
      const data = await response.json();
      
      // Save to state and localStorage
      setManager(data);
      localStorage.setItem('managerProfile', JSON.stringify(data));
      
      // Set profile image
      setProfileImage(data.profileImage || "");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerProfile();
  }, []);

  // Handle profile image change
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const token = Cookies.get("token");
      const formData = new FormData();
      formData.append("profileImage", file);
      
      // Add other manager fields that need to be preserved
      formData.append("name", manager.name);
      formData.append("phone", manager.phone);
      formData.append("address", manager.address);

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
      await fetchManagerProfile();
      toast.success("Profile image updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update profile image");
    }
  };

  // Update manager profile
  const updateManagerProfile = async (updatedData) => {
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
      await fetchManagerProfile();
      toast.success("Profile updated successfully!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update profile");
      return false;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Profile Picture */}
      <div
        className={styles.profilePicture}
        onClick={() => document.getElementById("fileInput").click()}
      >
        <img 
          src={profileImage || "https://www.placeholderimage.online/images/generic/user-profile-images.jpg"} 
          alt="Profile" 
          className={styles.profileImage} 
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
      <div className={styles.profileInfo}>
        <div className={styles.profileField}>
          <strong>Name:</strong>{" "}
          <input
            className={styles.inputField}
            value={manager.name || ""}
            disabled
          />
        </div>

        <div className={styles.profileField}>
          <strong>Email:</strong>{" "}
          <input
            className={styles.inputField}
            value={manager.email || ""}
            disabled
          />
        </div>

        <div className={styles.profileField}>
          <strong>Phone:</strong>{" "}
          <input
            className={styles.inputField}
            value={manager.phone || ""}
            disabled
          />
        </div>

        <div className={styles.profileField}>
          <strong>Address:</strong>{" "}
          <input
            className={styles.inputField}
            value={manager.address || ""}
            disabled
          />
        </div>

      </div>

      {/* Manager Permissions */}
      <div className={styles.permissions}>
        <h4>Manager Permissions</h4>
        <ul>
         <li>{manager.role || ""}  </li>
        </ul>
      </div>

      {/* Buttons */}
      <div className={styles.buttonContainer}>
        <button
          className={`${styles.button} ${styles.editButton}`}
          onClick={() => setIsEditing(true)}
        >
          ✏️ Edit Profile
        </button>
        <button
          className={`${styles.button} ${styles.logoutButton}`}
          onClick={logout}
        >
          🚪 Log Out
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <EditProfileModal
          userData={manager}
          updateUserProfile={updateManagerProfile}
          closeModal={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}