import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { object, string } from "yup";
import { useFormik } from "formik";
import useUser from "../../hooks/useUser";
import styles from "./EditAnnouncementModal.module.css"; 
// import styles from "./EditAnnouncementModal.module.css"; // Import the CSS module

const schema = object().shape({
  AnnouncementType: string().required("Announcement type is required"),
  AnnouncementDescription: string()
    .nullable()
    .when("region", {
      is: (region) => !region,
      then: (schema) => schema.required("Announcement description is required"),
    }),
  region: string().nullable(),
  binNumber: string()
    .nullable()
    .when("region", {
      is: (region) => region,
      then: (schema) => schema.required("Bin number is required"),
    }),
});

const EditAnnouncementModal = ({
  show,
  onHide,
  onSave,
  announcement,
  regions,
}) => {
  const modalRef = useRef();
  const { bins } = useUser();
  const [submitting, setSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      AnnouncementType: announcement ? announcement.AnnouncementType : "",
      AnnouncementDescription: announcement
        ? announcement.AnnouncementDescription
        : "",
      region: announcement ? announcement.region : "",
      binNumber: announcement ? announcement.binNumber : "",
      photoFile: null,
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        await onSave(values); // Call handleSave with the values
        onHide();
      } catch (error) {
        console.error("Error saving announcement:", error);
      }
      setSubmitting(false);
    },
  });

  useEffect(() => {
    if (show) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [show]);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onHide();
    }
  };

  const filteredBins = bins.filter(
    (bin) => bin.region === formik.values.region
  );
  const siteLocation = filteredBins.find(
    (bin) => bin.binNumber === formik.values.binNumber
  );
  if (siteLocation) formik.values.siteLocation = siteLocation.binLocation;

  return (
    <div
      className={`modal ${show ? "show" : ""}`}
      style={{
        display: show ? "block" : "none",
        backgroundColor: show ? "rgba(0, 0, 0, 0.5)" : "transparent",
      }}
      tabIndex="-1"
      aria-labelledby="editModalLabel"
      aria-hidden={!show}
    >
      <div className="modal-dialog">
        <div className={`modal-content ${styles.modalContent}`} ref={modalRef}>
          <div className={`modal-header ${styles.modalHeader}`}>
            <h5 className="modal-title">Edit Announcement</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={formik.handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Announcement Type</label>
                <select
                  className={`form-select ${styles.inputField}`}
                  {...formik.getFieldProps("AnnouncementType")}
                  value={formik.values.AnnouncementType}
                  onChange={formik.handleChange}
                >
                  <option value="" style={{ display: "none" }}>
                    Select announcement type
                  </option>
                  <option value="Full Bin">Full Bin</option>
                  <option value="Damaged Bin">Damaged Bin</option>
                  <option value="Scattered Waste">Scattered Waste</option>
                  <option value="Hazardous Material Leak">
                    Hazardous Material Leak
                  </option>
                  <option value="Waste Not Collected">Waste Not Collected</option>
                </select>
                {formik.touched.AnnouncementType &&
                  formik.errors.AnnouncementType && (
                    <p className="text-danger small">
                      {formik.errors.AnnouncementType}
                    </p>
                  )}
              </div>

              <div className="col-md-6">
                <label className="form-label">Announcement Description</label>
                <textarea
                  className={`form-control ${styles.inputField}`}
                  {...formik.getFieldProps("AnnouncementDescription")}
                ></textarea>
                {formik.touched.AnnouncementDescription &&
                  formik.errors.AnnouncementDescription && (
                    <p className="text-danger small">
                      {formik.errors.AnnouncementDescription}
                    </p>
                  )}
              </div>

              <div className="col-md-6">
                <label className="form-label">Region</label>
                <select
                  className={`form-select ${styles.inputField}`}
                  {...formik.getFieldProps("region")}
                  value={formik.values.region}
                  onChange={(e) => {
                    formik.handleChange(e);
                    formik.setFieldValue("binNumber", ""); // Reset binNumber when region changes
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
              </div>

              <div className="col-md-6">
                <label className="form-label">Bin Number</label>
                <select
                  className={`form-select ${styles.inputField}`}
                  {...formik.getFieldProps("binNumber")}
                  value={formik.values.binNumber}
                  onChange={formik.handleChange}
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
                  <p
                    className="small mt-1"
                    style={{ color: "#c6ad13", fontWeight: "600" }}
                  >
                    Please select a region first to choose a bin number.
                  </p>
                )}
                {formik.touched.binNumber && formik.errors.binNumber && (
                  <p className="text-danger small">{formik.errors.binNumber}</p>
                )}
              </div>

              <div className="col-12">
                <label className="form-label">Attach Image (Optional)</label>
                <input
                  type="file"
                  className={`form-control ${styles.inputField}`}
                  {...formik.getFieldProps("photoFile")}
                />
              </div>

              <div className="col-12 d-flex justify-content-between">
                <button
                  type="submit"
                  className={`btn btn-primary ${styles.button}`}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

EditAnnouncementModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  announcement: PropTypes.shape({
    AnnouncementType: PropTypes.string,
    AnnouncementDescription: PropTypes.string,
    region: PropTypes.string,
    binNumber: PropTypes.string,
    photoFile: PropTypes.object,
  }),
  regions: PropTypes.array.isRequired,
};

export default EditAnnouncementModal;