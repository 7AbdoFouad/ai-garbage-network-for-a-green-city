import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { object, string } from "yup";
import { useFormik } from "formik";
import useUser from "../../hooks/useUser";

const schema = object().shape({
  AnnouncementType: string().required("يجب إدخال نوع البلاغ"),
  AnnouncementDescription: string()
    .nullable()
    .when("region", {
      is: (region) => !region,
      then: (schema) => schema.required("وصف البلاغ مطلوب"),
    }),
  region: string().nullable(),
  binNumber: string()
    .nullable()
    .when("region", {
      is: (region) => region,
      then: (schema) => schema.required("رقم البلاغ مطلوب"),
    }),
});

const EditAnnouncementModal = ({ show, onHide, onSave, announcement, regions }) => {
  const modalRef = useRef();
  const { bins } = useUser();
  const [submitting, setSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      AnnouncementType: announcement ? announcement.AnnouncementType : "",
      AnnouncementDescription: announcement ? announcement.AnnouncementDescription : "",
      region: announcement ? announcement.region : "",
      binNumber: announcement ? announcement.binNumber : "", 
      photoFile:  null,
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

  const handleFileChange = (event) => {
    formik.setFieldValue("photoFile", event.currentTarget.files[0]);
  };

  const filteredBins = bins.filter((bin) => bin.region === formik.values.region); 

  const siteLocation = filteredBins.find((bin) => bin.binNumber===formik.values.binNumber);
  if(siteLocation)formik.values.siteLocation=siteLocation.binLocation
  // if(announcement.photoFile)formik.values.photoFile=announcement.photoFile


  return (
    <div
      className={`modal ${show ? "show" : ""}`}
      style={{ display: show ? "block" : "none", backdropFilter: show ? "rgba(0, 0, 0, 0.5)" : "none" }}
      tabIndex="-1"
      aria-labelledby="editModalLabel"
      aria-hidden={!show}
    >
      <div className="modal-dialog">
        <div className="modal-content" ref={modalRef}>
          <div className="modal-header">
            <h5 className="modal-title">تعديل البلاغ</h5>
            <button type="button" className="btn-close" onClick={onHide} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <form onSubmit={formik.handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label">نوع البلاغ</label>
                <select
                  className="form-select"
                  {...formik.getFieldProps("AnnouncementType")}
                  value={formik.values.AnnouncementType}
                  onChange={formik.handleChange}
                >
                  <option value="" style={{ display: "none" }}>اختر نوع البلاغ</option>
                  <option value="صندوق ممتلئ">صندوق ممتلئ</option>
                  <option value="تلف صندوق">تلف صندوق</option>
                  <option value="نفايات متناثرة">نفايات متناثرة</option>
                  <option value="تسرب مواد خطرة">تسرب مواد خطرة</option>
                  <option value="عدم جمع النفايات">عدم جمع النفايات</option>
                </select>
                {formik.touched.AnnouncementType && formik.errors.AnnouncementType && (
                  <p className="text-danger small">{formik.errors.AnnouncementType}</p>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">وصف البلاغ</label>
                <textarea
                  className="form-control"
                  {...formik.getFieldProps("AnnouncementDescription")}
                ></textarea>
                {formik.touched.AnnouncementDescription && formik.errors.AnnouncementDescription && (
                  <p className="text-danger small">{formik.errors.AnnouncementDescription}</p>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">المنطقة</label>
                <select
                  className="form-select"
                  {...formik.getFieldProps("region")}
                  value={formik.values.region}
                  onChange={(e) => {
                    formik.handleChange(e);
                    formik.setFieldValue("binNumber", ""); // Reset binNumber when region changes
                  }}
                >
                  <option value="" style={{ display: "none" }}>اختر المنطقة</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.regionName}>
                      {region.regionName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">رقم الصندوق</label>
                <select
                  className="form-select"
                  {...formik.getFieldProps("binNumber")}
                  value={formik.values.binNumber}
                  onChange={formik.handleChange}
                  disabled={!formik.values.region}
                >
                  <option value="" style={{ display: "none" }}>اختر رقم الصندوق</option>
                  {filteredBins.map((bin) => (
                    <option key={bin.binNumber} value={bin.binNumber}>
                      {bin.binNumber}
                    </option>
                  ))}
                </select>
                {!formik.values.region && (
                  <p className="small mt-1" style={{ color: "#c6ad13", fontWeight: "600" }}>
                    الرجاء اختيار المنطقة أولاً لتتمكن من تحديد رقم الصندوق
                  </p>
                )}
                {formik.touched.binNumber && formik.errors.binNumber && (
                  <p className="text-danger small">{formik.errors.binNumber}</p>
                )}
              </div>

              <div className="col-12">
                <label className="form-label">إرفاق صورة (اختياري)</label>
                <input type="file" className="form-control" {...formik.getFieldProps("photoFile")}/>
              </div>

              <div className="col-12 d-flex justify-content-between">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "جاري الإرسال..." : "إرسال البلاغ"}
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
