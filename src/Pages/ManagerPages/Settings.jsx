import React, { useState, useEffect } from "react";
import useUser from "../../hooks/useUser";
import styles from "./SettingPage.module.css";
import { useParams } from "react-router-dom";
import EditProfileModal from "../UserPages/EditProfileModal";
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";

export default function Settings() {
  const { id } = useParams();
  const { fetchManager, updateManager } = useUser();
  const [manager, setManager] = useState({});
  const [profileImage, setProfileImage] = useState("");
  const { logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchManager(id);
      setManager(data);
      setProfileImage(data.profileImage);
    };
    fetchData();
  }, [id]);

  // Handle profile image change
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = async () => {
        const newProfileImage = reader.result;

        setProfileImage(newProfileImage);

        try {
          await updateManager(id, {
            ...manager,
            profileImage: newProfileImage,
          });

          setManager((prevUser) => ({
            ...prevUser,
            profileImage: newProfileImage,
          }));

          toast.success("Profile picture updated successfully!");
        } catch (error) {
          console.error("Failed to update profile picture:", error);
          toast.error("An error occurred while updating the image.");
        }
      };

      reader.readAsDataURL(file);
    }
  };

  // State for the modal
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    setUserData({
      name: manager.name || "",
      phone: manager.phone || "",
      address: manager.address || "",
      profileImage: profileImage || "",
      email: manager.email || "",
      password: manager.password || "",
      Permissions: manager.Permissions || [],
    });
  }, [manager, profileImage]);

  // Save updated data
  const saveData = async (data) => {
    await updateManager(id, { ...manager, ...data });
    setManager((prevUser) => ({
      ...prevUser,
      ...data,
    }));
    toast.success("Data saved successfully!");
    setIsEditing(false);
  };

  return (
    <div className={styles.container}>
      {/* Profile Picture */}
      <div
        className={styles.profilePicture}
        onClick={() => document.getElementById("fileInput").click()}
      >
        <img src={profileImage} alt="Profile" className={styles.profileImage} />
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
          <strong>Manager Name:</strong>{" "}
          <input
            className={styles.inputField}
            name="name"
            value={userData.name}
            disabled={!isEditing}
          />
        </div>
        <div className={styles.profileField}>
          <strong>Phone Number:</strong>{" "}
          <input
            className={styles.inputField}
            name="phone"
            value={userData.phone}
            disabled={!isEditing}
          />
        </div>
        <div className={styles.profileField}>
          <strong>Address:</strong>{" "}
          <input
            className={styles.inputField}
            name="address"
            value={userData.address}
            disabled={!isEditing}
          />
        </div>
        <div className={styles.profileField}>
          <strong>Email:</strong>{" "}
          <input
            className={styles.inputField}
            name="email"
            value={userData.email}
            disabled
          />
        </div>
        <div className={styles.profileField}>
          <strong>Password:</strong>{" "}
          <input
            className={styles.inputField}
            type="text"
            name="password"
            value={userData.password}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Manager Permissions */}
      <div className={styles.permissions}>
        <h4>Manager Permissions</h4>
        {userData.Permissions &&
          userData.Permissions.map((permission, index) => (
            <p key={index}> {permission}</p>
          ))}
      </div>

      {/* Buttons */}
      <div className={styles.buttonContainer}>
        <button
          className={`${styles.button} ${styles.editButton}`}
          onClick={() => setIsEditing(true)}
        >
          Edit Profile
        </button>
        <button
          className={`${styles.button} ${styles.logoutButton}`}
          onClick={logout}
        >
          Logout
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <EditProfileModal
          userData={userData}
          saveData={saveData}
          closeModal={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
