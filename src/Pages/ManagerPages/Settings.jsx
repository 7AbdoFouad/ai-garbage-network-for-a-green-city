import React, { useState, useEffect } from "react";
import useUser from "../../hooks/useUser";
import styles from "../UserPages/SettingPage.module.css";
import { useParams } from "react-router-dom";
import EditProfileModal from "../UserPages/EditProfileModal"; // Import modal component
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";

export default function Settings() {
 const { id } = useParams();
   const { fetchManager,updateManager } = useUser();
   const [manager, setManager] = useState({});
   const [profileImage, setProfileImage] = useState("");
   const { logout } = useAuth();
 
   useEffect(() => {
     const fetchData = async () => {
       const data = await fetchManager(id);
       setManager(data);
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
           await updateManager(id, { ...manager, profileImage: newProfileImage });
   
           setManager((prevUser) => ({
             ...prevUser,
             profileImage: newProfileImage, // Update state after successful update
           }));
   
           toast.success("تم تحديث صورة الملف الشخصي بنجاح!"); 
         } catch (error) {
           console.error("فشل تحديث صورة الملف الشخصي:", error);
           toast.error("حدث خطأ أثناء تحديث الصورة.");
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
       Address: manager.Address || "",
       profileImage: profileImage || "",
       email: manager.email || "",
       password: manager.password || "",
       Permissions: manager.Permissions || "",
     });
   }, [manager, profileImage]);
 
   // Handle input change
 
   // Save data to JSON file
   const saveData =async (data) => {
     await updateManager(id, { ...manager, ...data });
      setManager((prevUser) => ({
        ...prevUser,
        ...data, // Update state after successful update
      }));
     toast.success("Data saved successfully!");
     setIsEditing(false);
   };
 
   return (
     <div className={styles.container}>
       {/* Profile Picture */}
       <div className={styles.profilePicture} onClick={() => document.getElementById("fileInput").click()}>
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
           <strong>اسم المدير:</strong>{" "}
           <input
             className={styles.inputField}
             name="username"
             value={userData.name}
            //  onChange={handleChange}
             disabled={!isEditing}
           />
         </div>
         <div className={styles.profileField}>
           <strong>رقم الهاتف:</strong>{" "}
           <input
             className={styles.inputField}
             name="phone"
             value={userData.phone}
            //  onChange={handleChange}
             disabled={!isEditing}
           />
         </div>
         <div className={styles.profileField}>
           <strong>العنوان:</strong>{" "}
           <input
             className={styles.inputField}
             name="address"
             value={userData.Address}
            //  onChange={handleChange}
             disabled={!isEditing}
           />
         </div>
         <div className={styles.profileField}>
           <strong>البريد الإلكتروني:</strong>{" "}
           <input
             className={styles.inputField}
             name="email"
             value={userData.email}
            //  onChange={handleChange}
             disabled
           />
         </div>
         <div className={styles.profileField}>
           <strong>كلمة المرور:</strong>{" "}
           <input
             className={styles.inputField}
             type="text"
             name="password"
             value={userData.password}
            //  onChange={handleChange}
             disabled={!isEditing}
           />
         </div>
       </div>
 
       {/* User Statistics */}
       <div className={styles.stats}>
        
         <h4>📌 صلاحيات المدير</h4>
         {
           userData.Permissions&&  userData.Permissions.map((permission, index) => (
            <p key={index}>
              📌 {permission}
            </p>
          ))
         }

       </div>
 
       {/* Buttons */}
       <div className={styles.buttonContainer}>
         <button className={`${styles.button} ${styles.editButton}`} onClick={() => setIsEditing(true)}>
           ✏️ تعديل الملف الشخصي
         </button>
         <button className={`${styles.button} ${styles.logoutButton}`} onClick={logout}>
           🚪 تسجيل الخروج
         </button>
       </div>
 
       {/* Edit Profile Modal */}
       {isEditing && <EditProfileModal userData={userData}  saveData={saveData} closeModal={() => setIsEditing(false)} />}
 
     </div>
   );
 }
 