import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import { object, string, mixed } from "yup";
import useUser from "../../hooks/useUser";
import styles from "./EditAnnouncementModal.module.css";

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
  photoFile: mixed().required("Photo is required"),
});

export default function EditAnnouncementModal({ show, onHide, onSave, announcement, regions }) {
  const modalRef = useRef();
  const { bins } = useUser();
  const [submitting, setSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      AnnouncementType: "",
      AnnouncementDescription: "",
      region: "",
      binNumber: "",
      photoFile: null,
      siteLocation: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        await onSave(values);
        onHide();
      } catch (error) {
        console.error("Error saving announcement:", error);
      }
      setSubmitting(false);
    },
  });

  useEffect(() => {
    if (announcement) {
      formik.setValues({
        AnnouncementType: announcement.AnnouncementType || "",
        AnnouncementDescription: announcement.AnnouncementDescription || "",
        region: announcement.region || "",
        binNumber: announcement.binNumber || "",
        siteLocation: announcement.siteLocation || "",
        photoFile: announcement.photoFile || "",
      });
    }

    if (show) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "auto";
    };
  }, [show, announcement]);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onHide();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        formik.setFieldValue("photoFile", reader.result);
      };
      reader.readAsDataURL(file);
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
    <div className={`${styles.overlay} ${show ? styles.show : ""}`} onClick={onHide}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()} ref={modalRef}>
        <h3 className={styles.title}>✏️ Edit Announcement</h3>
        <form onSubmit={formik.handleSubmit}>
          <label className={styles.label}>Announcement Type:</label>
          <select
            name="AnnouncementType"
            value={formik.values.AnnouncementType}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-select ${styles.input} ${
              formik.touched.AnnouncementType && formik.errors.AnnouncementType ? "is-invalid" : ""
            }`}
          >
            <option value="" hidden>Select announcement type</option>
            <option value="Full Bin">Full Bin</option>
            <option value="Damaged Bin">Damaged Bin</option>
            <option value="Scattered Waste">Scattered Waste</option>
            <option value="hazardous garbage"> Hazardous garbage</option>
            <option value="Waste Not Collected">Waste Not Collected</option>
          </select>
          {formik.touched.AnnouncementType && formik.errors.AnnouncementType && (
            <div className="invalid-feedback">{formik.errors.AnnouncementType}</div>
          )}

          <label className={styles.label}>Announcement Description:</label>
          <textarea
            name="AnnouncementDescription"
            value={formik.values.AnnouncementDescription}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-control ${styles.input} ${
              formik.touched.AnnouncementDescription && formik.errors.AnnouncementDescription ? "is-invalid" : ""
            }`}
            style={{ height: "100px", resize: "none" }}
          />
          {formik.touched.AnnouncementDescription && formik.errors.AnnouncementDescription && (
            <div className="invalid-feedback">{formik.errors.AnnouncementDescription}</div>
          )}

          <label className={styles.label}>Region:</label>
          <select
            name="region"
            value={formik.values.region}
            onChange={(e) => {
              formik.handleChange(e);
              formik.setFieldValue("binNumber", "");
            }}
            onBlur={formik.handleBlur}
            className={`form-select ${styles.input}`}
          >
            <option value="" hidden>Select region</option>
            {regions.map((region) => (
              <option key={region.id} value={region.regionName}>
                {region.regionName}
              </option>
            ))}
          </select>

          <label className={styles.label}>Bin Number:</label>
          <select
            name="binNumber"
            value={formik.values.binNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={!formik.values.region}
            className={`form-select ${styles.input} ${
              formik.touched.binNumber && formik.errors.binNumber ? "is-invalid" : ""
            }`}
          >
            <option value="" hidden>Select bin number</option>
            {filteredBins.map((bin) => (
              <option key={bin.binNumber} value={bin.binNumber}>
                {bin.binNumber}
              </option>
            ))}
          </select>
          {!formik.values.region && (
            <p className="text-warning small">Please select a region first to choose a bin number.</p>
          )}
          {formik.touched.binNumber && formik.errors.binNumber && (
            <div className="invalid-feedback">{formik.errors.binNumber}</div>
          )}

          <label className={styles.label}> Attach Image:</label>
          <input
            type="file"
            name="photoFile"
            accept="image/*"
            onChange={handleImageChange}
            className={`form-control ${styles.input} ${
              formik.touched.photoFile && formik.errors.photoFile ? "is-invalid" : ""
            }`}
          />
          {formik.touched.photoFile && formik.errors.photoFile && (
            <div className="invalid-feedback">{formik.errors.photoFile}</div>
          )}
          {formik.values.photoFile && (
            <div className="mt-2">
              <img
                src={formik.values.photoFile}
                alt="Uploaded"
                width="200"
                className="img-thumbnail"
                style={{ maxWidth: "100%", height: "auto" ,background:"#1bad1d"}} // Adjust the size as needed
                />
            </div>
          )}

          <div className={styles.modalButtons}>
            <button className={`${styles.button} ${styles.saveButton}`} type="submit"
             disabled={submitting}>
              {submitting ? "Updating..." : "💾 Update"}
            </button>
            <button className={`${styles.button} ${styles.cancelButton}`}
            
            type="button"  onClick={onHide}>
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

EditAnnouncementModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  announcement: PropTypes.shape({
    AnnouncementType: PropTypes.string,
    AnnouncementDescription: PropTypes.string,
    region: PropTypes.string,
    binNumber: PropTypes.string,
    photoFile: PropTypes.any,
    siteLocation: PropTypes.string,
  }),
  regions: PropTypes.array.isRequired,
};
