import React, { useState, useEffect } from "react";
import useUser from "../../hooks/useUser";
 import { useParams } from "react-router-dom";
import EditProfileModal from "./EditProfileModal"; // Import modal component
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";
import settingstyle from "./setting.module.css";

export default function SettingPage() {
  const { id } = useParams();
  const { fetchUser, updateUser } = useUser();
  const [user, setUser] = useState({});
  const [profileImage, setProfileImage] = useState("");
  const { logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchUser(id);
      setUser(data);
      setProfileImage(data.profileImage); // Set initial profile image
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

        setProfileImage(newProfileImage); // Set preview image

        try {
          await updateUser(id, { ...user, profileImage: newProfileImage });

          setUser((prevUser) => ({
            ...prevUser,
            profileImage: newProfileImage, // Update state after successful update
          }));

          toast.success("Profile image updated successfully!");
        } catch (error) {
          console.error("Failed to update profile image:", error);
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
      name: user.name || "",
      address: user.Address || "", // Renamed to "address"
      profileImage: profileImage || "",
      email: user.email || "",
      password: user.password || "",
      numOfAcceptedAnnouncementsCount:
        user.numOfAcceptedAnnouncementsCount || 0,
      numOfCompletedActivitiesCount: user.numOfCompletedActivitiesCount || 0,
      numOfCompletedPollsCount: user.numOfCompletedPollsCount || 0,
    });
  }, [user, profileImage]);

  // Handle input change
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // Save data to JSON file
  const saveData = async (data) => {
    await updateUser(id, { ...user, ...data });
    setUser((prevUser) => ({
      ...prevUser,
      ...data, // Update state after successful update
    }));
    toast.success("Data saved successfully!");
    setIsEditing(false);
  };

  return (
    <div className={settingstyle.container}>
      {/* Profile Picture */}
      <div
        className={settingstyle.profilePicture}
        onClick={() => document.getElementById("fileInput").click()}
      >
        <img src={profileImage} alt="Profile" className={settingstyle.profileImage} />
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
          <strong>Username:</strong>{" "}
          <input
            className={settingstyle.inputField}
            name="username"
            value={userData.name}
            // onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        <div className={settingstyle.profileField}>
          <strong>Address:</strong>{" "}
          <input
            className={settingstyle.inputField}
            name="address"
            value={userData.address}
            // onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
        <div className={settingstyle.profileField}>
          <strong>Email:</strong>{" "}
          <input
            className={settingstyle.inputField}
            name="email"
            value={userData.email}
            // onChange={handleChange}
            disabled
          />
        </div>
        <div className={settingstyle.profileField}>
          <strong>Password:</strong>{" "}
          <input
            className={ settingstyle.inputField}
            type="text"
            name="password"
            value={userData.password}
            // onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* User Statistics */}
      <div className={settingstyle.permissions}>
                <h4>User Statistics</h4>
        <li style={{ listStyleType: "none" }}>
          📌 Number of accepted announcements you have submitted:{" "}
          <strong>{userData.numOfAcceptedAnnouncementsCount}</strong>
        </li>
        <li style={{ listStyleType: "none" }}>
          📌 Number of social activities you registered and completed successfully:{" "}
          <strong>{userData.numOfCompletedActivitiesCount}</strong>
        </li>
        <li style={{ listStyleType: "none" }}>
          📌 Number of completed polls:{" "}
          <strong>{userData.numOfCompletedPollsCount}</strong>
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
          userData={userData}
          handleChange={handleChange}
          saveData={saveData}
          closeModal={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
