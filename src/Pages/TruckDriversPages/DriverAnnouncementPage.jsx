import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import useDriver from "../../hooks/useDriver";
import { useFormik } from "formik";
import { mixed, object, string } from "yup";
import { toast } from "react-toastify";
import EditDriverAnnouncementModal from "./EditDriverAnnouncementModal";
import styles from "./DriverAnnouncementPage.module.css";

const schema = object().shape({
  collectionStatus: string().required("Collection status is required"),
  notes: string().nullable(),
  binNumber: string().required("Bin number is required"),
  photoFile: mixed().required("Photo proof is required"),
});

const DriverAnnouncementPage = () => {
  const { id } = useParams();
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [currentPage, setCurrentPage] = useState(
    parseInt(sessionStorage.getItem("driverAnnouncementPage")) || 1
  );
  const itemsPerPage = 5;

  const {
    driverAnnouncements,
    regions,
    bins,
    fetchDriver,
    addDriverAnnouncement,
    deleteDriverAnnouncement,
    updateDriverAnnouncement,
    markAsCollected,
  } = useDriver();

  const inputRef = useRef();
  const announcements = driverAnnouncements.filter((a) => a.driverId === id);

  const paginatedAnnouncements = announcements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(announcements.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    sessionStorage.setItem("driverAnnouncementPage", page);
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      await addDriverAnnouncement(values);
      toast.success("Collection record added successfully!");
      inputRef.current.value = null;
      formik.resetForm();
    } catch (e) {
      console.error(e);
      toast.error("Failed to add collection record. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      driverName: "",
      licenseNumber: "",
      collectionStatus: "",
      notes: "",
      binNumber: "",
      collectionDate: new Date().toISOString().split("T")[0],
      photoFile: null,
      driverId: id,
    },
    validationSchema: schema,
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    const fetchData = async () => {
      const driver = await fetchDriver(id);
      formik.setFieldValue("driverName", driver.name);
      formik.setFieldValue("licenseNumber", driver.licenseNumber);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchDriver, id]);

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowModal(true);
  };

  const handleSave = async (values) => {
    const updatedValues = {
      ...selectedAnnouncement,
      ...values,
    };

    try {
      await updateDriverAnnouncement(updatedValues.id, updatedValues);
      toast.success("Collection record updated successfully!");
      setShowModal(false);
      setSelectedAnnouncement(null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update record. Please try again later.");
    }
  };

  const handleMarkCollected = async (announcementId) => {
    try {
      await markAsCollected(announcementId);
      toast.success("Collection marked as completed!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update collection status.");
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
      await deleteDriverAnnouncement(announcementId);
      toast.success("Collection record deleted successfully!");

      const newAnnouncements = announcements.filter((a) => a.id !== announcementId);
      const totalAnnouncements = newAnnouncements.length;

      if (
        totalAnnouncements === 0 ||
        currentPage > Math.ceil(totalAnnouncements / itemsPerPage)
      ) {
        const newPage = Math.max(currentPage - 1, 1);
        setCurrentPage(newPage);
        sessionStorage.setItem("driverAnnouncementPage", newPage);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete record. Please try again later.");
    }
  };

  return (
    <div className={styles.container}>
      {paginatedAnnouncements.length > 0 && (
        <>
          <h2 className={styles.header}>🚛 My Collection Records</h2>
          <div className={`table-responsive ${styles.tableResponsive}`}>
            <table className={`table ${styles.table}`}>
              <thead>
                <tr>
                  <th>Record No.</th>
                  <th>Bin Number</th>
                  <th>Status</th>
                  <th>Collection Date</th>
                  <th>Notes</th>
                  <th>Options</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAnnouncements.map((announcement, index) => (
                  <tr key={announcement.id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{announcement.binNumber}</td>
                    <td>
                      <span className={`badge ${announcement.collectionStatus === 'Completed' ? 
                        'bg-success' : 'bg-warning text-dark'}`}>
                        {announcement.collectionStatus}
                      </span>
                    </td>
                    <td>{announcement.collectionDate}</td>
                    <td>{announcement.notes || 'N/A'}</td>
                    <td>
                      <button
                        className={`btn ${styles.button} ${styles.editButton} mb-1`}
                        onClick={() => handleEdit(announcement)}
                      >
                        Edit
                      </button>
                      <button
                        className={`btn ${styles.button} ${styles.completeButton} mb-1`}
                        onClick={() => handleMarkCollected(announcement.id)}
                        disabled={announcement.collectionStatus === 'Completed'}
                      >
                        Mark Completed
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

      {totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={
                currentPage === i + 1 ? styles.activePage : styles.pageButton
              }
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <h1 className={styles.header}>Add Collection Record</h1>
      <div className={`p-4 shadow-lg rounded ${styles.formContainer}`}>
        <form onSubmit={formik.handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Collection Status</label>
            <select
              className="form-select"
              {...formik.getFieldProps("collectionStatus")}
            >
              <option value="" style={{ display: "none" }}>
                Select collection status
              </option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Missed">Missed</option>
            </select>
            {formik.errors.collectionStatus &&
              formik.touched.collectionStatus && (
                <p className="text-danger small">
                  {formik.errors.collectionStatus}
                </p>
              )}
          </div>

          <div className="col-md-6">
            <label className="form-label">Bin Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter bin number"
              {...formik.getFieldProps("binNumber")}
            />
            {formik.errors.binNumber && formik.touched.binNumber && (
              <p className="text-danger small">{formik.errors.binNumber}</p>
            )}
          </div>

          <div className="col-12">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              placeholder="Enter any notes about the collection"
              {...formik.getFieldProps("notes")}
              style={{ height: "100px", resize: "none" }}
            ></textarea>
          </div>

          <div className="col-12">
            <label className="form-label">Attach Proof Image</label>
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
                  alt="Uploaded proof"
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
              disabled={submitting}
              style={{width:"18%",backgroundColor:"#0d6efd"}}
            >
              {submitting ? "Adding..." : "Add Record"}
            </button>
          </div>
        </form>
      </div>

      {selectedAnnouncement && showModal && (
        <EditDriverAnnouncementModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSave={handleSave}
          announcement={selectedAnnouncement}
        />
      )}
    </div>
  );
};

export default DriverAnnouncementPage;