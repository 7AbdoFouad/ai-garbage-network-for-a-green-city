import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./Announcement.css";
import useUser from "../../hooks/useUser";

const UserAnnouncementPage = () => {
  const { id } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const announcementsPerPage = 5;

  const { usersAnnouncements } = useUser();
  const announcements = usersAnnouncements.filter(
    (announcement) => announcement.userId == id
  );
  console.log(id, usersAnnouncements);

  // تقسيم البيانات للصفحات
  const indexOfLastAnnouncement = currentPage * announcementsPerPage;
  const indexOfFirstAnnouncement = indexOfLastAnnouncement - announcementsPerPage;
  const currentAnnouncements = announcements.slice(
    indexOfFirstAnnouncement,
    indexOfLastAnnouncement
  );

  // تغيير الصفحة
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="announcement-container">
      <h2>عرض البلاغات الخاصة بي</h2>
      <table className="announcement-table">
        <thead>
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
                <button className="edit-btn">تعديل</button>
                <button className="delete-btn">حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* ترقيم الصفحات - يظهر فقط عند الحاجة للصفحة الثانية */}
      {announcements.length > announcementsPerPage && (
        <div className="pagination">
          {Array.from(
            { length: Math.ceil(announcements.length / announcementsPerPage) },
            (_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={currentPage === index + 1 ? "active" : ""}
              >
                {index + 1}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default UserAnnouncementPage;
