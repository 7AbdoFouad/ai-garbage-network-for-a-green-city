import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Announcement.css";

const UserAnnouncementPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [newAnnouncement, setNewAnnouncement] = useState({
        userName: "",
        AnnouncementType: "",
        AnnouncementDescription: "",
        region: "",
        binNumber: "",
        siteLocation: "",
        todayDate: new Date().toISOString().split("T")[0],
        AnnouncementStatus: "New",
        photoFile: null,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const announcementsPerPage = 5;

    useEffect(() => {
        // Simulated fetch call
        const mockData = [
            { id: 1, userName: "Mohamed gamal", AnnouncementType: "damaged bin", AnnouncementDescription: "the bin is damaged", region: "Al-Qantra Garb", binNumber: "1", siteLocation: "in front of the mosque in street shehab", todayDate: "2021-07-01", AnnouncementStatus: "Processed" },
            { id: 2, userName: "Ahmed Ali", AnnouncementType: "full bin", AnnouncementDescription: "the bin is full", region: "Downtown", binNumber: "3", siteLocation: "Near the market", todayDate: "2023-10-15", AnnouncementStatus: "Pending" },
        ];
        setAnnouncements(mockData);
        setFilteredAnnouncements(mockData);
    }, []);

    useEffect(() => {
        if (selectedStatus === "All") {
            setFilteredAnnouncements(announcements);
        } else {
            setFilteredAnnouncements(
                announcements.filter(announcement => announcement.AnnouncementStatus === selectedStatus)
            );
        }
    }, [selectedStatus, announcements]);

    const handleFilterChange = (status) => {
        setSelectedStatus(status);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAnnouncement({ ...newAnnouncement, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setAnnouncements([...announcements, { ...newAnnouncement, id: announcements.length + 1 }]);
        setNewAnnouncement({
            userName: "",
            AnnouncementType: "",
            AnnouncementDescription: "",
            region: "",
            binNumber: "",
            siteLocation: "",
            todayDate: new Date().toISOString().split("T")[0],
            AnnouncementStatus: "New",
            photoFile: null,
        });
    };

    const indexOfLastAnnouncement = currentPage * announcementsPerPage;
    const indexOfFirstAnnouncement = indexOfLastAnnouncement - announcementsPerPage;
    const currentAnnouncements = filteredAnnouncements.slice(indexOfFirstAnnouncement, indexOfLastAnnouncement);

    return (
        <div className="container mt-4">
            <h2 className="text-center">إدارة البلاغات</h2>
            <div className="filter-section">
                <strong>تصفية البلاغات حسب الحالة:</strong>
                {['All', 'Pending', 'Processed', 'Completed', 'Rejected'].map(status => (
                    <button key={status} className="btn btn-secondary mx-2" onClick={() => handleFilterChange(status)}>
                        {status}
                    </button>
                ))}
            </div>
            
            <table className="table table-striped mt-3">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>اسم المستخدم</th>
                        <th>نوع البلاغ</th>
                        <th>الحالة</th>
                        <th>التاريخ</th>
                        <th>المنطقة</th>
                        <th>رقم الصندوق</th>
                        <th>خيارات</th>
                    </tr>
                </thead>
                <tbody>
                    {currentAnnouncements.map((announcement) => (
                        <tr key={announcement.id}>
                            <td>{announcement.id}</td>
                            <td>{announcement.userName}</td>
                            <td>{announcement.AnnouncementType}</td>
                            <td>{announcement.AnnouncementStatus}</td>
                            <td>{announcement.todayDate}</td>
                            <td>{announcement.region}</td>
                            <td>{announcement.binNumber || 'N/A'}</td>
                            <td>
                                <button className="btn btn-warning btn-sm">تعديل</button>
                                <button className="btn btn-danger btn-sm mx-2">حذف</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div className="pagination">
                {Array.from({ length: Math.ceil(filteredAnnouncements.length / announcementsPerPage) }, (_, i) => (
                    <button key={i + 1} className="btn btn-light mx-1" onClick={() => setCurrentPage(i + 1)}>
                        {i + 1}
                    </button>
                ))}
            </div>

            <h3 className="mt-4">إضافة بلاغ جديد</h3>
            <form onSubmit={handleSubmit}>
                <input type="text" name="userName" placeholder="اسم المستخدم" className="form-control mb-2" value={newAnnouncement.userName} onChange={handleInputChange} required />
                <select name="AnnouncementType" className="form-control mb-2" value={newAnnouncement.AnnouncementType} onChange={handleInputChange} required>
                    <option value="">اختر نوع البلاغ</option>
                    <option value="full bin">صندوق ممتلئ</option>
                    <option value="damaged bin">تلف صندوق</option>
                    <option value="scattered waste">نفايات متناثرة</option>
                    <option value="hazardous waste">تسرب مواد خطرة</option>
                    <option value="missed collection">عدم جمع النفايات</option>
                </select>
                <input type="text" name="region" placeholder="المنطقة" className="form-control mb-2" value={newAnnouncement.region} onChange={handleInputChange} required />
                <input type="file" name="photoFile" className="form-control mb-2" onChange={(e) => setNewAnnouncement({ ...newAnnouncement, photoFile: e.target.files[0] })} />
                <button type="submit" className="btn btn-primary">إرسال البلاغ</button>
            </form>
        </div>
    );
};

export default UserAnnouncementPage;
