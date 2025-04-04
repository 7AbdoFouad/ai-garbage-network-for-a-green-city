// import React from "react";
// import useUser from "../../hooks/useUser";

// export default function ManageAnnouncement() {
//   const {
//     usersAnnouncements,
//     contactUs,
//     deleteUsersAnnouncements,
//     regions,
//     UserNotifications,
//     addUserNotification,
//     users
//   } = useUser();
  /*
    usersAnnouncements has multiple objects with the following structure:
   {
      "id": "1",
      "userName": "Mohamed gamal",
      "email": "Hb6mW@example.com",
      "AnnouncementType": "damaged bin",
      "AnnouncementDescription": "the bin is damaged",
      "region": "Al-Qantra Garb",
      "binNumber": "1",
      "siteLocation": "in front of the mosque in street shehab",
      "todayDate": "2021-07-01",
      "photoFile": "bin1.jpg",
      "userId": "1"
    }
      --------------------
    contactUs has multiple objects with the following structure:

     {
      "id": "1",
      "name": "yassser mohamed",
      "email": "rszfk@example.com",
      "Message": "i suggest to add bin in El-Mahalla El-Kubra",
      "todayDate": "2021-07-01",
      "userId": "1"
    }
      ______________________
    regions has multiple objects with the following structure:
    {
      "id": "1",
      "regionName": "Al-Qantra Garb",
      "numOfBins": "3"
    }
      ______________________
    UserNotifications has multiple objects with the following structure:
        {
      "id": "1",
      "notificationContent": "تم تحديث حالة النشاط المجتمعي: ورشة إعادة التدوير المنزلي",
      "notificationDate": "2025-07-01",
      "userId": "1"
    }
   */
//   return <div>ManageAnnouncement</div>;
// }
import React, { useState } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
import useUser from "../../hooks/useUser";

export default function ManageAnnouncement() {
  const {
    usersAnnouncements,
    contactUs,
    deleteUsersAnnouncements,
    regions,
    addUserNotification,
  } = useUser();

  const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [message, setMessage] = useState("");

  const handleAccept = (report) => {
    addUserNotification({
      userId: report.userId,
      notificationContent: `تم قبول البلاغ: ${report.AnnouncementType}`,
      notificationDate: new Date().toISOString().split("T")[0],
    });
    deleteUsersAnnouncements(report.id);
  };

  const handleReject = (report) => {
    setSelectedReport(report);
    setModalShow(true);
  };

  const sendRejectionNotification = () => {
    addUserNotification({
      userId: selectedReport.userId,
      notificationContent: `تم رفض البلاغ: ${selectedReport.AnnouncementType} - السبب: ${message}`,
      notificationDate: new Date().toISOString().split("T")[0],
    });
    deleteUsersAnnouncements(selectedReport.id);
    setModalShow(false);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">بلاغات المستخدمين</h2>
      
      {/* Filters */}
      <div className="d-flex gap-2 mb-3">
        <Form.Select onChange={(e) => setFilterType(e.target.value)}>
          <option value="">تصفية حسب: نوع البلاغ</option>
          <option value="Full Bin">Full Bin</option>
          <option value="Damaged Bin">Damaged Bin</option>
          <option value="Scattered Waste">Scattered Waste</option>
          <option value="Hazardous Material Leak">Hazardous Material Leak</option>
          <option value="Waste Not Collected">Waste Not Collected</option>
        </Form.Select>
        <Form.Select onChange={(e) => setFilterDate(e.target.value)}>
          <option value="">تصفية حسب: تاريخ البلاغ</option>
          <option value="newest">من الأحدث إلى الأقدم</option>
          <option value="oldest">من الأقدم إلى الأحدث</option>
        </Form.Select>
        <Form.Select onChange={(e) => setFilterRegion(e.target.value)}>
          <option value="">تصفية حسب: الموقع</option>
          {regions.map((region) => (
            <option key={region.id} value={region.regionName}>{region.regionName}</option>
          ))}
        </Form.Select>
      </div>
      
      {/* Reports Table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>نوع البلاغ</th>
            <th>تاريخ البلاغ</th>
            <th>اسم المستخدم</th>
            <th>رسالة البلاغ</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {usersAnnouncements.map((report) => (
            <tr key={report.id}>
              <td>{report.AnnouncementType}</td>
              <td>{report.todayDate}</td>
              <td>{report.userName}</td>
              <td>{report.AnnouncementDescription}</td>

              <td>
                <Button variant="success" size="sm" onClick={() => handleAccept(report)}>قبول</Button>
                <Button variant="danger" size="sm" className="ms-2" onClick={() => handleReject(report)}>رفض</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      <p>إجمالي البلاغات: {usersAnnouncements.length}</p>
      
      {/* Reject Modal */}
      <Modal show={modalShow} onHide={() => setModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>رفض البلاغ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>سبب الرفض:</Form.Label>
            <Form.Control as="textarea" rows={3} onChange={(e) => setMessage(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalShow(false)}>إلغاء</Button>
          <Button variant="danger" onClick={sendRejectionNotification}>إرسال الرفض</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
