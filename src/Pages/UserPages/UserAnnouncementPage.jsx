// src/pages/UserAnnouncementPage/UserAnnouncementPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useFormik } from "formik";
import { mixed, object, string } from "yup";
import { toast } from "react-toastify";
import EditAnnouncementModal from "./EditAnnouncementModal";
import styles from "./UserAnnouncementPage.module.css";
import Cookies from "js-cookie";

const base_url = "https://greencityapi.runasp.net";
const getAuthToken = () => Cookies.get("token");

const schema = object().shape({
  AnnouncementType: string().required("Announcement type is required"),
  AnnouncementDescription: string()
    .nullable()
    .when("region", {
      is: (region) => !region,
      then: (schema) =>
        schema.required("Announcement description is required"),
    }),
  region: string().nullable(),
  binNumber: string()
   .when("region", {
  is: (region) => region && region !== "None",
  then: (schema) => schema.required("Bin number is required"),
})
,
  photoFile: mixed().required("Photo is required"),
});

const UserAnnouncementPage = () => {
  const { id } = useParams();
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [announcementPage, setAnnouncementPage] = useState(
    parseInt(sessionStorage.getItem("announcementPage")) || 1
  );
  const [usersAnnouncements, setUsersAnnouncements] = useState([]);
  const [regions, setRegions] = useState([]);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 5;
  const inputRef = useRef();

  // Fetch user data
//   const fetchUser = async (userId) => {
//     try {
//  const payload = {
//         EmailAddress: "Admin123@example.com",
//         Password: "Admin@12345",
//         deviceInfo: { deviceId: "browser", deviceType: "WEB_BROWSER" },
//       };

//       const response = await fetch("/api/Auth/Login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });      const data = await response.json();
//       const tok=data.jwtToken;
//       // console.log("Authentication token:", tok);
//       const res2= await fetch("/api/Users", {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${tok}`,
//           "Content-Type": "application/json"
//         }
//       });
//             const allusers = await res2.json();

//       const storedCredentials = localStorage.getItem("authCredentials");
//       const { email, password } = JSON.parse(storedCredentials);
//       // search for user by email
//       const user = allusers.find((user) => user.email === email);
//       const userId = user ? user.id : null;
//       return user;
//     } catch (error) {
//       console.error("Error fetching user:", error);
//       throw error;
//     }
//   };

  // Fetch user announcements
  const fetchUsersAnnouncements = async (userId) => {
    try {
      const response = await fetch(
        `/api/UsersAnnouncements/my-announcements?userId=${userId}`,
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );
      const data = await response.json();
      setUsersAnnouncements(data);
      return data;
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error("Failed to load announcements");
      return [];
    }
  };

  // Fetch regions
  const fetchRegions = async () => {
    try {
      const response = await fetch(`/api/Regions`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await response.json();
      // remove "None" region if it exists
      const filteredData = data.filter(region => region.regionName !== "None");
      setRegions(filteredData);
      return data;
    } catch (error) {
      console.error("Error fetching regions:", error);
      toast.error("Failed to load regions");
      return [];
    }
  };

  // Fetch bins
  const fetchBins = async () => {
    try {
      const response = await fetch(`/api/Bins`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await response.json();
      setBins(data);
      return data;
    } catch (error) {
      console.error("Error fetching bins:", error);
      toast.error("Failed to load bins");
      return [];
    }
  };

  // Add new announcement
  const addUsersAnnouncements = async (formData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/UsersAnnouncements`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) throw new Error("Failed to add announcement");
      
      const newAnnouncement = await response.json();
      setUsersAnnouncements(prev => [...prev, newAnnouncement]);
      return newAnnouncement;
    } catch (error) {
      console.error("Error adding announcement:", error);
      throw error;
    }
  };

  // Update announcement
  const updateUsersAnnouncements = async (id, formData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/UsersAnnouncements/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) throw new Error("Failed to update announcement");
      
      const updatedAnnouncement = await response.json();
      setUsersAnnouncements(prev => 
        prev.map(a => a.id === id ? updatedAnnouncement : a)
      );
      return updatedAnnouncement;
    } catch (error) {
      console.error("Error updating announcement:", error);
      throw error;
    }
  };

  // Delete announcement
  const deleteUsersAnnouncements = async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/UsersAnnouncements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error("Failed to delete announcement");
      
      setUsersAnnouncements(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting announcement:", error);
      throw error;
    }
  };

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchUsersAnnouncements(id);
        await fetchRegions();
        await fetchBins();

           const token = getAuthToken();

           const response = await fetch("/api/Users/my-profile", {
      method: "get",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });      
      const data = await response.json();
      console.log(data);
        localStorage.setItem("userName", data.name);
      localStorage.setItem("useremail", data.email);
      
        formik.setFieldValue("userName", data.name);
        formik.setFieldValue("email", data.email);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  const announcements = usersAnnouncements.filter((a) => a.userId === id && a.status=="Pending");
  const paginatedAnnouncement = announcements.slice(
    (announcementPage - 1) * itemsPerPage,
    announcementPage * itemsPerPage
  );

  const totalAnnouncementPages = Math.ceil(announcements.length / itemsPerPage);

  const handleAnnouncementPageChange = (page) => {
    setAnnouncementPage(page);
    sessionStorage.setItem("announcementPage", page);
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      values.region= values.region||"None";
      values.binNumber= values.binNumber||0;
      console.log("Form values:", values);

      formData.append("UserName", values.userName);
      formData.append("Email", values.email);
      formData.append("AnnouncementType", values.AnnouncementType);
      formData.append("AnnouncementDescription", values.AnnouncementDescription || "None");
      formData.append("BinNumber", values.binNumber);
      //seaech binLocation
      const selectedBin = bins.find(
        (bin) => bin.binNumber == values.binNumber
      );
      console.log(selectedBin);
      
      values.siteLocation = selectedBin ? selectedBin.binLocation : "None";
      formData.append("SiteLocation", values.siteLocation); 
      formData.append("TodayDate", values.todayDate);
      formData.append("PhotoFile", values.photoFile);
      formData.append("regionName", values.region);

      await addUsersAnnouncements(formData);
      toast.success("Announcement added successfully!");
      inputRef.current.value = null;
      formik.resetForm();
              formik.setFieldValue("userName", localStorage.getItem("userName") || "");
        formik.setFieldValue("email", localStorage.getItem("useremail") || "");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add announcement. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      userName: "",
      email: "",
      AnnouncementType: "",
      AnnouncementDescription: "",
      region: "",
      binNumber: "",
      siteLocation: "",
      todayDate: new Date().toISOString().split("T")[0],
      photoFile: null,
      userId: id,
    },
    validationSchema: schema,
    onSubmit: handleSubmit,
  });

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowModal(true);
  };

  const handleSave = async (values) => {
    try {
      console.log(values);
      
           values.region= values.region||"None";
      values.binNumber= values.binNumber||0;
      const formData = new FormData();
      formData.append("AnnouncementType", values.AnnouncementType);
      formData.append("AnnouncementDescription", values.AnnouncementDescription||"None");
      formData.append("BinNumber", values.binNumber);
      formData.append("SiteLocation", values.siteLocation);
      formData.append("regionName", values.region);
      
      if (values.photoFile instanceof File) {
        formData.append("PhotoFile", values.photoFile);
      } else if (typeof values.photoFile === "string") {
        formData.append("PhotoUrl", values.photoFile);
      }
      
      formData.append("userId", id);

      await updateUsersAnnouncements(selectedAnnouncement.id, formData);
      toast.success("Announcement updated successfully!");
      setShowModal(false);
      setSelectedAnnouncement(null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update announcement. Please try again later.");
    }
  };

  const handleChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      formik.setFieldValue("photoFile", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        formik.setFieldValue("photoPreview", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (announcementId) => {
    try {
      await deleteUsersAnnouncements(announcementId);
      toast.success("Announcement deleted successfully!");

      const newAnnouncements = announcements.filter((a) => a.id !== announcementId);
      const totalAnnouncements = newAnnouncements.length;

      if (
        totalAnnouncements === 0 ||
        announcementPage > Math.ceil(totalAnnouncements / itemsPerPage)
      ) {
        const newPage = Math.max(announcementPage - 1, 1);
        setAnnouncementPage(newPage);
        sessionStorage.setItem("announcementPage", newPage);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete announcement. Please try again later.");
    }
  };
 // find region id
  const regionId = regions.find((region) => region.regionName === formik.values.region)?.id || null;
  const filteredBins = bins.filter((bin) => bin.regionId === regionId);
  
  useEffect(() => {
    if (formik.values.region && formik.values.binNumber) {
      const bin = bins.find(
        (b) => 
          b.binNumber === formik.values.binNumber && 
          b.region === formik.values.region
      );
      
      if (bin) {
        formik.setFieldValue("siteLocation", bin.binLocation);
      }
    }
  }, [formik.values.binNumber, formik.values.region, bins]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {paginatedAnnouncement.length > 0 && (
        <>
          <h2 className={styles.header}>📜 My Announcements List</h2>
          <div className={`table-responsive ${styles.tableResponsive}`}>
            <table className={`table ${styles.table}`}>
              <thead>
                <tr>
                  <th>Announcement No.</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Region</th>
                  {/* <th>Bin No.</th> */}
                  <th>Location</th>
                  <th>Options</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAnnouncement.map((announcement, index) => (
                  <tr key={announcement.id}>
                    <td>{(announcementPage - 1) * itemsPerPage + index + 1}</td>
                    <td style={{ maxWidth: "150px", whiteSpace: "normal", wordWrap: "break-word" }}>{announcement.announcementType}</td>
                    <td style={{ maxWidth: "167px", whiteSpace: "normal", wordWrap: "break-word" }}>{announcement.announcementDescription!="None"?announcement.announcementDescription:"-"}</td>
                    <td>{new Date(announcement.todayDate).toLocaleDateString()}</td>
                    <td>{announcement.regionName!="None"?announcement.regionName:"-"}</td>
                    {/* <td>{announcement.binNumber?announcement.binNumber:"-"}</td> */}
                    <td>{announcement.siteLocation !="None"?announcement.siteLocation:"-"}</td>
                    <td style={{ minWidth: "220px" }}>
                      <button
                        className={`btn ${styles.button} ${styles.editButton} `}
                        onClick={() => handleEdit(announcement)}
                      >
                        Edit
                      </button>
                      <button
                        className={`btn ${styles.button} ${styles.deleteButton}`}
                        onClick={() => handleDelete(announcement.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {totalAnnouncementPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalAnnouncementPages }, (_, i) => (
            <button
              key={i}
              onClick={() => handleAnnouncementPageChange(i + 1)}
              className={
                announcementPage === i + 1 
                  ? styles.activePage 
                  : styles.pageButton
              }
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {announcements.length >= 3 && (
        <div className="alert alert-warning" role="alert" style={{color:"#1b5e20",backgroundColor:"rgb(232 245 233)",borderColor:"rgb(232 245 233)"}}>
          You have reached the maximum number of announcements (3 announcements). You cannot add new announcements.
        </div>
      )}

      <h1 className={styles.header}>Add Announcement</h1>
      <div className={`p-4 shadow-lg rounded ${styles.formContainer}`}>
        <form onSubmit={formik.handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Announcement Type</label>
            <select
              className="form-select"
              {...formik.getFieldProps("AnnouncementType")}disabled={announcements.length >= 3}
onFocus={(e) => {
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = "#00980DFF";
              e.target.style.borderWidth = "2px";
            }}
            onBlur={(e) => {
              formik.handleBlur(e);
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = formik.errors.AnnouncementType ?"red" : 'transparent';
              e.target.style.borderWidth = "1.5px";
            }}

            >
              <option value="" style={{ display: "none" }}>
                Select announcement type
              </option>
              <option value="Full Bin">Full Bin</option>
              <option value="Damaged Bin">Damaged Bin</option>
              <option value="Scattered Waste">Scattered Waste</option>
              <option value="Hazardous Garbage">Hazardous Garbage</option>
              <option value="Waste Not Collected">Waste Not Collected</option>
            </select>
            {formik.errors.AnnouncementType &&
              formik.touched.AnnouncementType && (
                <p className="text-danger small">
                  {formik.errors.AnnouncementType}
                </p>
              )}
          </div>

          <div className="col-md-6">
            <label className="form-label">Announcement Description</label>
            <textarea
              className="form-control"
              placeholder="Enter announcement description"
              {...formik.getFieldProps("AnnouncementDescription")}
              style={{ height: "100px", resize: "none" }}
              disabled={announcements.length >= 3}
onFocus={(e) => {
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = "#00980DFF";
              e.target.style.borderWidth = "2px";
            }}
            onBlur={(e) => {
              formik.handleBlur(e);
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = formik.errors.AnnouncementDescription ?"red" : 'transparent';
              e.target.style.borderWidth = "1.5px";
            }}

            ></textarea>
            {formik.errors.AnnouncementDescription &&
              formik.touched.AnnouncementDescription && (
                <p className="text-danger small">
                  {formik.errors.AnnouncementDescription}
                </p>
              )}
          </div>

          <div className="col-md-6">
            <label className="form-label">Region</label>
            <select className="form-select" {...formik.getFieldProps("region")}disabled={announcements.length >= 3}
onFocus={(e) => {
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = "#00980DFF";
              e.target.style.borderWidth = "2px";
            }}
            onBlur={(e) => {
              formik.handleBlur(e);
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = formik.errors.region ?"red" : 'transparent';
              e.target.style.borderWidth = "1.5px";
            }}
>
              <option value="" style={{ display: "none" }}>
                Select region
              </option>
              {regions.map((region) => (
                <option key={region.id} value={region.regionName}>
                  {region.regionName}
                </option>
              ))}
            </select>
            {formik.errors.region && formik.touched.region && (
              <p className="text-danger small">{formik.errors.region}</p>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">Bin Location</label>
            <select
              className="form-select"
              {...formik.getFieldProps("binNumber")}
              disabled={!formik.values.region|| formik.values.region =="None"|| announcements.length >= 3}
        onFocus={(e) => {
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = "#00980DFF";
              e.target.style.borderWidth = "2px";
            }}
            onBlur={(e) => {
              formik.handleBlur(e);
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = formik.errors.binNumber ?"red" : 'transparent';
              e.target.style.borderWidth = "1.5px";
            }}
    >
              <option value="" style={{ display: "none" }}>
                Select bin Location
              </option>
              {filteredBins.map((bin) => (
                <option key={bin.binNumber} value={bin.binNumber}>
                  {bin.binLocation}
                </option>
              ))}
            </select>
            {(!formik.values.region|| formik.values.region =="None") && (
              <p className="small mt-1" style={{ color: "#1b5e20", fontWeight: "600",marginLeft:"2px" }}>
                Please select a region first to choose a bin number
              </p>
            )}
            {formik.errors.binNumber && formik.touched.binNumber && (
              <p className="text-danger small">{formik.errors.binNumber}</p>
            )}
          </div>

          <div className="col-12">
            <label className="form-label">Attach Image</label>
            <input
              type="file"
              className="form-control"
              ref={inputRef}disabled={announcements.length >= 3}
onFocus={(e) => {
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = "#00980DFF";
              e.target.style.borderWidth = "2px";
            }}
            onBlur={(e) => {
              formik.handleBlur(e);
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = formik.errors.photoFile ?"red" : 'transparent';
              e.target.style.borderWidth = "1.5px";
            }}

              name="photoFile"
              onChange={handleChange}
              accept="image/*"
            />
            {formik.errors.photoFile && formik.touched.photoFile && (
              <p className="text-danger small">{formik.errors.photoFile}</p>
            )}
            {formik.values.photoPreview && (
              <div className="mt-2">
                <img
                  src={formik.values.photoPreview}
                  alt="Uploaded preview"
                  className="img-thumbnail"
                  width="200"
                />
              </div>
            )}
          </div>
          <div className="col-12 d-flex justify-content-between">
            <button
              type="submit"
              className={`btn btn-primary ${styles.button}`}
              disabled={submitting || announcements.length >= 3}
              style={{width:"18%",backgroundColor:"#1b5e20"}}
            >
              {submitting ? "Adding..." : "Add Announcement"}
            </button>
          </div>
        </form>
      </div>

      {selectedAnnouncement && showModal && (
        <EditAnnouncementModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSave={handleSave}
          announcement={selectedAnnouncement}
          regions={regions}
          bins={bins}
        />
      )}
    </div>
  );
};

export default UserAnnouncementPage;