// src/pages/UserAnnouncementPage/EditAnnouncementModal.jsx
import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import { object, string, mixed } from "yup";
import styles from "./EditAnnouncementModal.module.css";

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
      is: (region) => region && region !== "None",
      then: (schema) => schema.required("Bin number is required"),
    }),
  photoFile: mixed().required("Photo is required"),
});

export default function EditAnnouncementModal({ 
  show, 
  onHide, 
  onSave, 
  announcement, 
  regions,
  bins 
}) {
  const modalRef = useRef();
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [regionId, setRegionId] = useState(null);
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null); // To track object URLs for cleanup

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
         const selectedBin = bins.find(
        (bin) => bin.binNumber == values.binNumber
      );
      
      values.siteLocation = selectedBin ? selectedBin.binLocation : "None";
      setSubmitting(true);
      try {
        await onSave(values);
      } catch (error) {
        console.error("Error saving announcement:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  // Find bins for the selected region
  const filteredBins = bins.filter((bin) => bin.regionId === regionId);

  // Update location when bin changes
  useEffect(() => {
    if (formik.values.region && formik.values.binNumber) {
      const selectedBin = bins.find(
        bin => bin.binNumber == formik.values.binNumber
      );
      if (selectedBin) {
        formik.setFieldValue("siteLocation", selectedBin.binLocation);
      }
    }
  }, [formik.values.binNumber, bins]);

  // Update region ID when region changes
  useEffect(() => {
    if (formik.values.region) {
      const selectedRegion = regions.find(
        r => r.regionName === formik.values.region
      );
      setRegionId(selectedRegion?.id || null);
    }
  }, [formik.values.region, regions]);

  // Initialize form when announcement changes
  useEffect(() => {
    if (announcement) {
      const region = regions.find(r => r.id === announcement.regionId);
      console.log("Initializing form with announcement data:", announcement);
      
      formik.setValues({
        AnnouncementType: announcement.announcementType || "",
        AnnouncementDescription: announcement.announcementDescription || "",
        // region: announcement.regionName !== "None" ? announcement.regionName : "",
        // binNumber: announcement.binNumber?.toString() || "",
        // siteLocation: announcement.siteLocation || "",
        photoFile: announcement.photoFile || null,
      });
      
      // Set preview for existing image
      if (announcement.photoFile) {
        setPhotoPreview(announcement.photoFile);
      }
      
      // Set region ID for bin filtering
      if (region) {
        setRegionId(region.id);
      }
    }
  }, [announcement, regions]);

  // Handle modal visibility
  useEffect(() => {
    if (show) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "auto";
    };
  }, [show]);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onHide();
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Clean up previous object URL if exists
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      
      // Create new object URL for preview
      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;
      
      // Update form and preview
      formik.setFieldValue("photoFile", file);
      setPhotoPreview(objectUrl);
    }
  };

  return (
    <div 
      className={`${styles.overlay} ${show ? styles.show : ""}`} 
      onClick={onHide}
    >
      <div 
        className={styles.modalContainer} 
        onClick={(e) => e.stopPropagation()} 
        ref={modalRef}
      >
        <h3 className={styles.title}>✏️ Edit Announcement</h3>
        
        <form onSubmit={formik.handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Announcement Type:</label>
            <select
              name="AnnouncementType"
              value={formik.values.AnnouncementType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`${styles.input} ${
                formik.touched.AnnouncementType && formik.errors.AnnouncementType 
                  ? styles.inputError : ""
              }`}
            >
              <option value="" disabled hidden>Select announcement type</option>
              <option value="Full Bin">Full Bin</option>
              <option value="Damaged Bin">Damaged Bin</option>
              <option value="Scattered Waste">Scattered Waste</option>
              <option value="Hazardous Garbage">Hazardous Garbage</option>
              <option value="Waste Not Collected">Waste Not Collected</option>
            </select>
            {formik.touched.AnnouncementType && formik.errors.AnnouncementType && (
              <div className="text-danger small">{formik.errors.AnnouncementType}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Announcement Description:</label>
            <textarea
              name="AnnouncementDescription"
              value={formik.values.AnnouncementDescription=="None"?"":formik.values.AnnouncementDescription}
              onChange={formik.handleChange} 
              //validate on region change


              // onBlur={formik.handleBlur}
              className={`${styles.input} ${styles.textarea} ${
                formik.touched.AnnouncementDescription && formik.errors.AnnouncementDescription 
                  ? styles.inputError : ""
              }`}          
                  style={{ height: "100px", resize: "none" }}
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
              e.target.style.borderColor = "#9ccc65";
              e.target.style.borderWidth = "2px";
            }}

            />
            {formik.touched.AnnouncementDescription && formik.errors.AnnouncementDescription &&(
                <p className="text-danger small">
                  {formik.errors.AnnouncementDescription}
                </p>
              )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Region:</label>
            <select
              name="region"
              value={formik.values.region}
              onChange={(e) => {
                formik.handleChange(e);
                formik.setFieldValue("binNumber", "");
                formik.setFieldValue("AnnouncementDescription", formik.values.AnnouncementDescription || "None");
              }}
              // onBlur={formik.handleBlur}
              className={styles.input}
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
              e.target.style.borderColor = "#9ccc65";
              e.target.style.borderWidth = "2px";
            }}
            >
              <option value="" disabled hidden>Select region</option>
              {regions.map((region) => (
                <option key={region.id} value={region.regionName}>
                  {region.regionName}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Bin Location:</label>
            <select
              name="binNumber"
              value={formik.values.binNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={!formik.values.region}
              className={`${styles.input} ${
                formik.touched.binNumber && formik.errors.binNumber 
                  ? styles.inputError : ""
              }`}
            >
              <option value="" disabled hidden>Select bin Location</option>
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
            {formik.touched.binNumber && formik.errors.binNumber && (
              <div className={styles.error}>{formik.errors.binNumber}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="photoFile" className={styles.label}>
              Image:
            </label>
            <input
              type="file"
              id="photoFile"
              name="photoFile"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
                         className={`form-control ${styles.input} ${formik.touched.photoFile && formik.errors.photoFile ? "is-invalid" : ""}`}

              onBlur={formik.handleBlur}
            />
            {formik.touched.photoFile && formik.errors.photoFile && (
              <div className={styles.error}>{formik.errors.photoFile}</div>
            )}
          </div>

          {photoPreview && (
            <div className={styles.previewContainer}>
              <img
                src={photoPreview}
                 alt="Uploaded"
              width="200"
              className="img-thumbnail mt-2"
              style={{ maxWidth: "100%", height: "auto" ,background:"#1bad1d"}} // Adjust the size as needed
              />
            </div>
          )}

       
             <div className={styles.modalButtons}>

            <button className={`${styles.button} ${styles.saveButton} ${formik.isSubmitting ? styles.disabled : ""}`} type="submit" style={{marginRight:"10px",marginTop:"10px"}}>
              {formik.isSubmitting ? "Updating..." : "💾 Update Announcement"}
            </button>
            <button
              className={`${styles.button} ${styles.cancelButton}${formik.isSubmitting ? styles.disabled : ""}`}
              type="button"
              onClick={onHide}              disabled={formik.isSubmitting}

            >
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
    id: PropTypes.number,
    announcementType: PropTypes.string,
    announcementDescription: PropTypes.string,
    regionId: PropTypes.number,
    binNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    photoUrl: PropTypes.string,
    siteLocation: PropTypes.string,
  }),
  regions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      regionName: PropTypes.string,
    })
  ).isRequired,
  bins: PropTypes.arrayOf(
    PropTypes.shape({
      binNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      binLocation: PropTypes.string,
      regionId: PropTypes.number,
    })
  ).isRequired,
};