import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import useUser from "../../hooks/useUser";
import { useFormik } from "formik";
import { mixed, object, string } from "yup";
import { toast } from "react-toastify";
import EditAnnouncementModal from "./EditAnnouncementModal";
import styles from "./UserAnnouncementPage.module.css";

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
    .nullable()
    .when("region", {
      is: (region) => region,
      then: (schema) => schema.required("Bin number is required"),
    }),
  photoFile: mixed().required("Photo is required"),
});

const UserAnnouncementPage = () => {
  const { id } = useParams();
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [AnnouncementPage, setAnnouncementPage] = useState(
    parseInt(sessionStorage.getItem("AnnouncementPage")) || 1
  );
  const itemsPerPage = 5;

  const {
    usersAnnouncements,
    regions,
    bins,
    fetchUser,
    addUsersAnnouncements,
    deleteUsersAnnouncements,
    updateUsersAnnouncements,
  } = useUser();

  const inputRef = useRef();
  const announcements = usersAnnouncements.filter((a) => a.userId === id);

  const paginatedAnnouncement = announcements.slice(
    (AnnouncementPage - 1) * itemsPerPage,
    AnnouncementPage * itemsPerPage
  );

  const totalAnnouncementPages = Math.ceil(announcements.length / itemsPerPage);

  const handleAnnouncementPageChange = (page) => {
    setAnnouncementPage(page);
    sessionStorage.setItem("AnnouncementPage", page);
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      await addUsersAnnouncements(values);
      toast.success("Announcement added successfully!");
      inputRef.current.value = null;
      formik.resetForm();
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

  useEffect(() => {
    const fetchData = async () => {
      const user = await fetchUser(id);
      formik.setFieldValue("userName", user.name);
      formik.setFieldValue("email", user.email);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUser, id]);

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowModal(true);
  };

  const handleSave = async (values) => {
    const updatedValues = {
      ...selectedAnnouncement,
      ...values,
      siteLocation: values.siteLocation || "",
    };

    try {
      await updateUsersAnnouncements(updatedValues.id, updatedValues);
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
      const reader = new FileReader();
      reader.onloadend = () => {
        formik.setFieldValue("photoFile", reader.result);
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
        AnnouncementPage > Math.ceil(totalAnnouncements / itemsPerPage)
      ) {
        const newPage = Math.max(AnnouncementPage - 1, 1);
        setAnnouncementPage(newPage);
        sessionStorage.setItem("AnnouncementPage", newPage);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete announcement. Please try again later.");
    }
  };

  const filteredBins = bins.filter((bin) => bin.region === formik.values.region);
  useEffect(() => {
    const siteLocation = filteredBins.find(
      (bin) => bin.binNumber === formik.values.binNumber
    );
  
    if (
      siteLocation &&
      formik.values.siteLocation !== siteLocation.binLocation
    ) {
      formik.setFieldValue("siteLocation", siteLocation.binLocation);
    }
  }, [formik.values.binNumber, filteredBins]);
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
                  <th>Bin No.</th>
                  <th>Location</th>
                  <th>Options</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAnnouncement.map((announcement, index) => (
                  <tr key={announcement.id}>
                    <td>{(AnnouncementPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{announcement.AnnouncementType}</td>
                    <td>{announcement.AnnouncementDescription}</td>
                    <td>{announcement.todayDate}</td>
                    <td>{announcement.region}</td>
                    <td>{announcement.binNumber}</td>
                    <td>{announcement.siteLocation}</td>
                    <td>
                      <button
                        className={`btn ${styles.button} ${styles.editButton} me-2`}
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
                AnnouncementPage === i + 1 ? styles.activePage : styles.pageButton
              }
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {announcements.length >= 10 && (
        <div className="alert alert-warning" role="alert" style={{color:"#1b5e20",backgroundColor:"rgb(232 245 233)",borderColor:"rgb(232 245 233)"}}>
          You have reached the maximum number of announcements (10 announcements). You cannot add new announcements.
        </div>
      )}

      <h1 className={styles.header}>Add Announcement</h1>
      <div className={`p-4 shadow-lg rounded ${styles.formContainer}`}>
        <form onSubmit={formik.handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Announcement Type</label>
            <select
              className="form-select"
              {...formik.getFieldProps("AnnouncementType")}
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
            <select className="form-select" {...formik.getFieldProps("region")}>
              <option value="" style={{ display: "none" }}>
                Select region
              </option>
              {regions.map((region) => (
                <option key={region.id} value={region.regionName}>
                  {region.regionName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Bin Number</label>
            <select
              className="form-select"
              {...formik.getFieldProps("binNumber")}
              disabled={!formik.values.region}
            >
              <option value="" style={{ display: "none" }}>
                Select bin number
              </option>
              {filteredBins.map((bin) => (
                <option key={bin.binNumber} value={bin.binNumber}>
                  {bin.binNumber}
                </option>
              ))}
            </select>
            {!formik.values.region && (
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
              ref={inputRef}
              name="photoFile"
              onChange={handleChange}
              accept="image/*"
            />
            {formik.errors.photoFile && formik.touched.photoFile && (
              <p className="text-danger small">{formik.errors.photoFile}</p>
            )}
            {formik.values.photoFile && (
              <div className="mt-2">
                <img
                  src={formik.values.photoFile}
                  alt="Uploaded"
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
              disabled={submitting || announcements.length >= 10}
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
          filteredBins={filteredBins}
        />
      )}
    </div>
  );
};

export default UserAnnouncementPage;
