import React, { useState, useEffect } from "react";
import useUser from "../../hooks/useUser";
import styles from "../UserPages/SettingPage.module.css";
import { useParams } from "react-router-dom";
import EditProfileModal from "../UserPages/EditProfileModal"; // Import modal component
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";

export default function Settings() {
 const { id } = useParams();
   const { fetchTruckDriver,updateTruckDriver } = useUser();
   const [TruckDriver, setTruckDriver] = useState({});
   const [profileImage, setProfileImage] = useState("");
   const { logout } = useAuth();
 
   useEffect(() => {
     const fetchData = async () => {
       const data = await fetchTruckDriver(id);
       setTruckDriver(data);
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
           await updateTruckDriver(id, { ...TruckDriver, profileImage: newProfileImage });
   
           setTruckDriver((prevUser) => ({
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
       name: TruckDriver.name || "",
       phone: TruckDriver.phone || "",
       Address: TruckDriver.Address || "",
       profileImage: profileImage || "",
       email: TruckDriver.email || "",
       password: TruckDriver.password || "",
       truckNumber: TruckDriver.truckNumber || "",
       numOfAcceptedAnnouncementsCount: TruckDriver.numOfAcceptedAnnouncementsCount || 0,
      numberOfCompletedTasks: TruckDriver.numberOfCompletedTasks || 0,
      numOfCompletedPollsCount: TruckDriver.numOfCompletedPollsCount || 0,
       
     });
   }, [TruckDriver, profileImage]);
 
   // Handle input change
 
   // Save data to JSON file
   const saveData =async (data) => {
     await updateTruckDriver(id, { ...TruckDriver, ...data });
      setTruckDriver((prevUser) => ({
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
         <div className={styles.profileField}>
           <strong>رقم الشاحنة:</strong>{" "}
           <input
             className={styles.inputField}
             type="text"
             name="truckNumber"
             value={userData.truckNumber}
            //  onChange={handleChange}
             disabled={!isEditing}
           />
         </div>
       </div>
 
       {/* User Statistics */}
       <div className={styles.stats}>
        
         <h4>📌احصائيات السائق</h4>
         <p>
          📌 عدد البلاغات المقبولة التي قدمتها: <strong>{userData.numOfAcceptedAnnouncementsCount}</strong>
        </p>
        <p>
          📌 عدد المهام التي اتممتها: <strong>{userData.numberOfCompletedTasks}</strong>
        </p>
        <p>
          📌 عدد الاستطلاعات التي اكملتها: <strong>{userData.numOfCompletedPollsCount}</strong>
        </p>

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
 