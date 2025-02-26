import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Announcement.css";
import useUser from "../../hooks/useUser";
import { useFormik } from "formik";
import { object, string } from "yup";

const schema = object().shape({
  name: string().required("اسم المستخدم مطلوب").min(3, "يجب أن يحتوي الاسم على أكثر من 3 أحرف"),
  description: string().required("يجب إدخال وصف البلاغ"),
  region: string().nullable(),
  binNumber: string().nullable(),
});

const UserAnnouncementPage = () => {
  const { id } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const announcementsPerPage = 5;
  const { usersAnnouncements } = useUser();
  const announcements = usersAnnouncements.filter(
    (announcement) => announcement.userId == id
  );

  const indexOfLastAnnouncement = currentPage * announcementsPerPage;
  const indexOfFirstAnnouncement = indexOfLastAnnouncement - announcementsPerPage;
  const currentAnnouncements = announcements.slice(
    indexOfFirstAnnouncement,
    indexOfLastAnnouncement
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formik = useFormik({
    initialValues: { name: "", description: "", region: "", binNumber: "", image: null },
    validationSchema: schema,
    onSubmit: (values) => {
      console.log("Submitted Data:", values);
    },
  });

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4 fw-bold">📢 عرض البلاغات الخاصة بي</h2>
   
      <h3 className="mt-5 text-center fw-semibold">📜 قائمة البلاغات</h3>
      <table className="table table-striped mt-3">
        <thead className="table-dark">
          <tr>
            <th>بلاغ ID</th>
            <th>نوع البلاغ</th>
            <th>تاريخ البلاغ</th>
            <th>المنطقة</th>
            <th>رقم الصندوق</th>
            <th>الموقع</th>
            <th>خيارات</th>
          </tr>
        </thead>
        <tbody>
          {currentAnnouncements.map((announcement) => (
            <tr key={announcement.id}>
              <td>{announcement.id}</td>
              <td>{announcement.AnnouncementType}</td>
              <td>{announcement.todayDate}</td>
              <td>{announcement.region}</td>
              <td>{announcement.binNumber}</td>
              <td>{announcement.siteLocation}</td>
              <td>
                <button className="btn btn-warning me-2">تعديل</button>
                <button className="btn btn-danger">حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {announcements.length > announcementsPerPage && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            {Array.from(
              { length: Math.ceil(announcements.length / announcementsPerPage) },
              (_, index) => (
                <li key={index + 1} className="page-item">
                  <button
                    onClick={() => paginate(index + 1)}
                    className={`page-link ${currentPage === index + 1 ? "active" : ""}`}
                  >
                    {index + 1}
                  </button>
                </li>
              )
            )}
          </ul>
        </nav>
      )}   <div className="p-4 bg-white shadow-lg rounded">
        <form onSubmit={formik.handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">اسم المستخدم</label>
            <input type="text" className="form-control" placeholder="أدخل اسم المستخدم" {...formik.getFieldProps("name")} />
            {formik.errors.name && formik.touched.name && <p className="text-danger small">{formik.errors.name}</p>}
          </div>
          <div className="col-md-6">
            <label className="form-label">نوع البلاغ</label>
            <select className="form-select" {...formik.getFieldProps("description")}>
              <option value="">اختر نوع البلاغ</option>
              <option value="صندوق ممتلئ">صندوق ممتلئ</option>
              <option value="تلف صندوق">تلف صندوق</option>
              <option value="نفايات متناثرة">نفايات متناثرة</option>
              <option value="تسرب مواد خطرة">تسرب مواد خطرة</option>
              <option value="عدم جمع النفايات">عدم جمع النفايات</option>
            </select>
            {formik.errors.description && <p className="text-danger small">{formik.errors.description}</p>}
          </div>
          <div className="col-md-6">
            <label className="form-label">المنطقة</label>
            <input type="text" className="form-control" placeholder="حدد المنطقة" {...formik.getFieldProps("region")} />
          </div>
          <div className="col-md-6">
            <label className="form-label">رقم الصندوق</label>
            <input type="text" className="form-control" placeholder="حدد رقم الصندوق" {...formik.getFieldProps("binNumber")} />
          </div>
          <div className="col-12">
            <label className="form-label">إرفاق صورة (اختياري)</label>
            <input type="file" className="form-control" onChange={(e) => formik.setFieldValue("image", e.target.files[0])} />
          </div>
          <div className="col-12 d-flex justify-content-between">
            <button type="submit" className="btn btn-primary">إرسال البلاغ</button>
            <button type="reset" className="btn btn-secondary">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserAnnouncementPage;
