import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Announcement.css";
import useUser from "../../hooks/useUser";
import { useFormik } from "formik";
import { object, string } from "yup"; // Ensure you import Yup correctly
import { toast } from "react-toastify";
import { useEffect } from "react";
import { useRef } from "react";
import EditAnnouncementModal from "./EditAnnouncementModal";
import { useSearchParams } from "react-router-dom";

const schema = object().shape({
  // userName: string()
  //   .required("اسم المستخدم مطلوب")
  //   .min(3, "يجب أن يحتوي الاسم على أكثر من 3 أحرف"),

  AnnouncementType: string().required("يجب إدخال نوع البلاغ"),

  AnnouncementDescription: string()
    .nullable() // First, allow null values
    .when("region", {
      is: (region) => !region, // If `region` is null or empty, description is required
      then: (schema) => schema.required("وصف البلاغ مطلوب"),
    }),
    
  region: string().nullable(), // Allow region to be nullable

  binNumber: string().nullable() .when("region", {
    is: (region) => region, // If `region` is null or empty, description is required
    then: (schema) => schema.required("رقم البلاغ مطلوب"),
  }),
});

const UserAnnouncementPage = () => {
  const { id } = useParams();
  const [submitting, setSubmitting] = useState(false);
  // const [currentPage, setCurrentPage] = useState(1);
  // const announcementsPerPage = 5;
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const { usersAnnouncements, regions, bins, fetchUser,addUsersAnnouncements ,deleteUsersAnnouncements, updateUsersAnnouncements } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();

  // const announcements = usersAnnouncements.filter(
  //   (announcement) => announcement.userId == id
  // );

  // const indexOfLastAnnouncement = currentPage * announcementsPerPage;
  // const indexOfFirstAnnouncement =
  //   indexOfLastAnnouncement - announcementsPerPage;
  // const currentAnnouncements = announcements.slice(
  //   indexOfFirstAnnouncement,
  //   indexOfLastAnnouncement
  // );


  // const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const inputRef = useRef(); 


    // Get current page from URL, default to 1
    const currentPage = Number(searchParams.get("page")) || 1;
    const announcementsPerPage = 5;
      // Pagination logic
    const announcements = usersAnnouncements.filter((a) => a.userId == id);
    const indexOfLastAnnouncement = currentPage * announcementsPerPage;
    const indexOfFirstAnnouncement = indexOfLastAnnouncement - announcementsPerPage;
    const currentAnnouncements = announcements.slice(indexOfFirstAnnouncement, indexOfLastAnnouncement);
  

    const paginate = (pageNumber) => {
      setSearchParams({ page: pageNumber }); // Update URL parameter
    };
  
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      await addUsersAnnouncements(values);
      toast.success("Announcement added successfully!");
      // formik.setFieldValue("photoFile", null);
      inputRef.current.value = null;
      formik.resetForm();
    } catch (e) { 
      console.log(e);
      toast.error("Failed to add announcement. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  }


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
  }, [id, fetchUser, formik]);

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);    
    setShowModal(true);
  };

  const handleSave = async (values) => {
    // values is now the object with form values
    const updatedValues = {
      ...selectedAnnouncement,
      ...values, // Spread the values from the form
      siteLocation: values.siteLocation || "", // Ensure siteLocation is included if necessary
    };
  
    try {
      await updateUsersAnnouncements(updatedValues.id, updatedValues);
      toast.success("Announcement updated successfully!");
      setShowModal(false);
      setSelectedAnnouncement(null);
    } catch (e) {
      console.log(e);
      toast.error("Failed to update announcement. Please try again later.");
    }
  };


  const handleDelete = async (announcementId) => {
    try {
      await deleteUsersAnnouncements(announcementId);
      toast.success("Announcement deleted successfully!");

      // Check if the current page still has announcements
      const newAnnouncements = announcements.filter(a => a.id !== announcementId);
      const totalAnnouncements = newAnnouncements.length;

      // If the current page is now invalid, navigate to the previous page
      if (totalAnnouncements === 0 || (currentPage > Math.ceil(totalAnnouncements / announcementsPerPage))) {
        const newPage = Math.max(currentPage - 1, 1); // Ensure the page doesn't go below 1
        setSearchParams({ page: newPage });
      }
    } catch (e) {
      console.log(e);
      toast.error("Failed to delete announcement. Please try again later.");
    }
  };

  // Filter bins based on the selected region
  const filteredBins = bins.filter(
    (bin) => bin.region === formik.values.region
  );
  const siteLocation = filteredBins.find((bin) => bin.binNumber===formik.values.binNumber);
  if(siteLocation)formik.values.siteLocation=siteLocation.binLocation

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4 fw-bold">📢 عرض البلاغات الخاصة بي</h2>
      <h3 className="mt-5 text-center fw-semibold">📜 قائمة البلاغات</h3>
      <table className="table table-striped mt-3">
        <thead className="table-dark">
          <tr>
            <th>رقم البلاغ</th>
            <th>نوع البلاغ</th>
            <th>وصف البلاغ</th>
            <th>تاريخ البلاغ</th>
            <th>المنطقة</th>
            <th>رقم الصندوق</th>
            <th>الموقع</th>
            <th>خيارات</th>
          </tr>
        </thead>
        <tbody>
          {currentAnnouncements.map((announcement, index) => (
            <tr key={announcement.id}>
              <td>{index + 1}</td>
              <td>{announcement.AnnouncementType}</td>
              <td>{announcement.AnnouncementDescription}</td>
              <td>{announcement.todayDate}</td>
              <td>{announcement.region}</td>
              <td>{announcement.binNumber}</td>
              <td>{announcement.siteLocation}</td>
              <td>
                <button className="btn btn-warning me-2" onClick={() => handleEdit(announcement)}>تعديل</button>
                <button className="btn btn-danger" onClick={() => handleDelete(announcement.id)}>حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
       {/* Pagination */}
       {announcements.length > announcementsPerPage && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            {Array.from({ length: Math.ceil(announcements.length / announcementsPerPage) }, (_, index) => (
              <li key={index + 1} className="page-item">
                <button
                  onClick={() => paginate(index + 1)}
                  className={`page-link ${currentPage === index + 1 ? "active" : ""}`}
                >
                  {index + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )} 
            {/* Check if user has reached the announcement limit */}
            {announcements.length >= 10 && (
        <div className="alert alert-warning" role="alert">
          لقد وصلت الحد الأقصى من البلاغات (10 بلاغات). لا يمكنك إضافة بلاغات جديدة.
        </div>
      )}
    <h1>اضافة بلاغ</h1>  
    <div className="p-4 bg-white shadow-lg rounded">
        
        <form onSubmit={formik.handleSubmit} className="row g-3">
          {/* <div className="col-md-6">
            <label className="form-label">اسم المستخدم</label>
            <input
              type="text"
              className="form-control"
              placeholder="أدخل اسم المستخدم"
              {...formik.getFieldProps("userName")}
            />
            {formik.errors.userName && formik.touched.userName && (
              <p className="text-danger small">{formik.errors.userName}</p>
            )}
          </div> */}
          <div className="col-md-6">
            <label className="form-label">نوع البلاغ</label>
            <select
              className="form-select"
              {...formik.getFieldProps("AnnouncementType")}
            >
              <option value="" style={{ display: "none" }}>
                اختر نوع البلاغ
              </option>
              <option value="صندوق ممتلئ">صندوق ممتلئ</option>
              <option value="تلف صندوق">تلف صندوق</option>
              <option value="نفايات متناثرة">نفايات متناثرة</option>
              <option value="تسرب مواد خطرة">تسرب مواد خطرة</option>
              <option value="عدم جمع النفايات">عدم جمع النفايات</option>
            </select>
            {formik.errors.AnnouncementType &&
              formik.touched.AnnouncementType && (
                <p className="text-danger small">
                  {formik.errors.AnnouncementType}
                </p>
              )}
          </div>
          <div className="col-md-6">
            <label className="form-label">وصف البلاغ</label>
            <textarea
              className="form-control"
              placeholder="ادخل وصف البلاغ"
              {...formik.getFieldProps("AnnouncementDescription")}
            ></textarea>
            {formik.errors.AnnouncementDescription &&
              formik.touched.AnnouncementDescription && (
                <p className="text-danger small">
                  {formik.errors.AnnouncementDescription}
                </p>
              )}
          </div>
          <div className="col-md-6">
            <label className="form-label">المنطقة</label>
            <select className="form-select" {...formik.getFieldProps("region")}>
              <option value="" style={{ display: "none" }}>
                اختر المنطقة
              </option>
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
              disabled={!formik.values.region} // Disable if no region is selected
            >
              <option value="" style={{ display: "none" }}>
                اختر رقم الصندوق
              </option>
              {filteredBins.map((bin) => (
                <option key={bin.binNumber} value={bin.binNumber}>
                  {bin.binNumber}
                </option>
              ))}
            </select>
            {/* Show warning if no region is selected */}
            {!formik.values.region && (
              <p
                className="small mt-1"
                style={{ color: "#c6ad13", fontWeight: "600" }}
              >
                الرجاء اختيار المنطقة أولاً لتتمكن من تحديد رقم الصندوق
              </p>
            )}
            {formik.errors.binNumber && formik.touched.binNumber && (
              <p className="text-danger small">{formik.errors.binNumber}</p>
            )}
          </div>

          <div className="col-12">
            <label className="form-label">إرفاق صورة (اختياري)</label>
            <input
              type="file"
              className="form-control"
              ref={inputRef}
              {...formik.getFieldProps("photoFile")}
              // onChange={(e) => formik.setFieldValue("photoFile", e.target.files[0])}
            />
          </div>
          <div className="col-12 d-flex justify-content-between">
            <button type="submit" className="btn btn-primary" disabled={submitting || announcements.length >= 10}>

              {submitting ? "جاري الإرسال..." : ""}
              إرسال البلاغ
            </button>
            {/* <button type="reset" className="btn btn-secondary">
              إلغاء
            </button> */}
          </div>
        </form>
  {/* render the EditAnnouncementModal only if announcementId is provided with a value */}
        {selectedAnnouncement &&showModal && (
           <EditAnnouncementModal 
           show={showModal} 
           onHide={() => setShowModal(false)} 
           onSave={handleSave} 
           announcement={selectedAnnouncement || { AnnouncementType: '', AnnouncementDescription: '', region: '', binNumber: '' }} 
           regions={regions} 
           filteredBins={filteredBins} 
         />
          /*
            
          */ 
        )}
      </div>
    </div>
  );
};

export default UserAnnouncementPage;  
