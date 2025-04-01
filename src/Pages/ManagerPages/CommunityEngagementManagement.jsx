import React, { useState, useEffect,useRef } from "react";
import useUser from "../../hooks/useUser";
import { Table, Button, Modal, Form, Input, Pagination } from "antd";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "./CommunityEngagementManagement.module.css";

export default function CommunityEngagementManagement() {
  const {
    CommunityActivities,
    addCommunityActivity,
    deleteCommunityActivity,
    deleteSubscribersOfCommunityActivity,
    SubscribersOfCommunityActivities,
    users,
    updateUser

  } = useUser();

  const [visible, setVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = async () => {
        const newProfileImage = reader.result;

        try {
          formik.setFieldValue("imgFile", newProfileImage);
        } catch (error) {
          console.error("Failed to update profile image:", error);
          toast.error("An error occurred while updating the image.");
        }
      };

      reader.readAsDataURL(file);
    }
  };
    const inputRef = useRef();
  
  const formik = useFormik({
    initialValues: {
      ActName: "",
      ActDescription: "",
      actIntervalDate: "",
      actstate: "متاحة",
      imgFile: "",
      NumOfSubscribers: 0,
      NumOfRequiredSubscribers: "",
    },
    validationSchema: Yup.object({
      ActName: Yup.string().required("اسم النشاط مطلوب"),
      ActDescription: Yup.string()
        .required("الوصف مطلوب")
        .min(10, "الوصف يجب ان يكون على الاقل 10 حروف"),
      actIntervalDate: Yup.string()
        .required("الفترة الزمنية مطلوبة")
        .matches(
          /^\d{4}-\d{2}-\d{2} - \d{4}-\d{2}-\d{2}$/,
          "يجب أن تكون الفترة الزمنية بالتنسيق YYYY-MM-DD - YYYY-MM-DD"
        )
        .test(
          "is-future",
          "يجب أن تكون الفترة الزمنية في المستقبل",
          function (value) {
            const [start, end] = value
              .split(" - ")
              .map((date) => new Date(date));
            const today = new Date();
            return start > today && end > today;
          }
        ),
      imgFile: Yup.mixed().required("صورة النشاط مطلوبة"),
      NumOfRequiredSubscribers: Yup.number().required(
        "عدد المشتركين المطلوبين مطلوب"
      ),
    }),
    onSubmit: (values) => {
      addCommunityActivity(values);
      toast.success("تم اضافة النشاط بنجاح");
      setFormVisible(false);
      inputRef.current.value = null;

      formik.resetForm();
    },
  });
  const [savedPage, setSavedPage] = useState(null);

  useEffect(() => {
    if (searchTerm.length > 0) {
      if (savedPage === null) {
        setSavedPage(currentPage); // Save the page only once when starting a search
      }
      setCurrentPage(1); // Move to page 1 when searching
    } else {
      if (savedPage !== null) {
        setCurrentPage(savedPage); // Restore previous page
        setSavedPage(null); // Reset saved page after restoring
      }
    }
  }, [searchTerm]);
  

  const openModal = (activity) => {
    setSelectedActivity(activity);
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
    setSelectedActivity(null);
  };

  const openFormModal = () => {
    setFormVisible(true);
  };

  const closeFormModal = () => {
    setFormVisible(false);
  };

  const filteredSubscribers = SubscribersOfCommunityActivities.filter(
    (sub) =>
      selectedActivity &&
      sub.ActivityId === selectedActivity.id &&
      sub.name.includes(searchTerm)
  );
  
  // Apply pagination after filtering
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  

  const handleDeleteSubscriber = (userId) => {
    try {
      const subscriberEntry = SubscribersOfCommunityActivities.find(
        (sub) => sub.userId === userId && sub.ActivityId === selectedActivity.id
      );
      if (!subscriberEntry) {
        toast.error("لم يتم العثور على الاشتراك!");
        return;
      }
      deleteSubscribersOfCommunityActivity(subscriberEntry.id);
      toast.success("تم إلغاء الاشتراك بنجاح!");
    } catch (error) {
      console.error("Failed to delete subscriber:", error);
      toast.error("Failed to delete subscriber. Please try again.");
    }
  };

  const handleAcceptAll = () => {
    // Handle accepting all users, updating activity count, sending message, deleting users and activity
    // filteredSubscribers , users to get users in activity
    const acceptedUsers = users.filter((user) => filteredSubscribers.some((sub) => sub.userId === user.id));
    try{
      acceptedUsers.forEach((user)  => {
         updateUser(user.id, {
          ...user,
          numOfCompletedActivitiesCount: user.numOfCompletedActivitiesCount + 1
        })
      });
    }
    catch(error){
      console.log(error);
    }
  };

  const activitiesTable = (status) => {
    return (CommunityActivities || [])
      .filter((activity) => {
        if (!activity || !activity.actIntervalDate) return false;
        const intervalParts = activity.actIntervalDate.split(" - ");
        if (intervalParts.length !== 2) return false;

        const [start, end] = intervalParts.map((date) => new Date(date));
        const currentDate = new Date();

        return (
          (status === "متاحة" && currentDate <= end) ||
          (status === "مكتملة" && currentDate > end)
        );
      })
      .map((activity) => ({
        key: activity.id,
        name: activity.ActName,
        description: activity.ActDescription,
        interval: activity.actIntervalDate,
        state: status,
        actions: (
          <>
          {status === "مكتملة"? <Button onClick={() => openModal(activity)}>عرض المشتركين</Button>: null} 
            <Button danger onClick={() => deleteCommunityActivity(activity.id)}>
              حذف
            </Button>
          </>
        ),
        subscribers: activity.NumOfSubscribers,
        required: activity.NumOfRequiredSubscribers,
      }));
  };
  const columns = [
    {
      title: "اسم النشاط",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "الوصف",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "الفترة الزمنية",
      dataIndex: "interval",
      key: "interval",
    },
    {
      title: "الحالة",
      dataIndex: "state",
      key: "state",
    },
    {
      title: "الإجراءات",
      dataIndex: "actions",
      key: "actions",
    },
    {
      title: "عدد المشتركين",
      dataIndex: "subscribers",
      key: "subscribers",
    },
    {
      title: "المطلوب",
      dataIndex: "required",
      key: "required",
    },
  ];

  return (
    <div>
      <h2>إدارة الفعاليات الاجتماعية</h2>
      <p>عدد الفعاليات المتاحة: {activitiesTable("متاحة").length}</p>
      <p>عدد الفعاليات المكتملة: {activitiesTable("مكتملة").length}</p>

      <h3>الأنشطة الاجتماعية المتاحة</h3>
      <Table columns={columns} dataSource={activitiesTable("متاحة")} />
      <h3>الأنشطة الاجتماعية المكتملة</h3>
      <Table columns={columns} dataSource={activitiesTable("مكتملة")} />

      <Modal
        visible={visible}
        onCancel={closeModal}
        footer={null}
        title="المشتركين"
      >
        <Input
          placeholder="بحث عن مشترك"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Table
          dataSource={filteredSubscribers.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          )}
          columns={[{ title: "الاسم", dataIndex: "name" }]}
        />
        <Pagination
          current={currentPage}
          pageSize={itemsPerPage}
          total={filteredSubscribers.length}
          onChange={setCurrentPage}
        />
      </Modal>

      <h2>➕ إضافة نشاط جديد</h2>
      <form onSubmit={formik.handleSubmit} className={styles.pollForm}>
        {/* اسم النشاط */}
        <label htmlFor="ActName">📌 اسم النشاط:</label>
        <input
          type="text"
          id="ActName"
          name="ActName"
          placeholder="أدخل اسم النشاط"
          value={formik.values.ActName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`form-control ${formik.touched.ActName && formik.errors.ActName ? "is-invalid" : ""}`}
        />
        {formik.touched.ActName && formik.errors.ActName && (
          <div className="invalid-feedback">{formik.errors.ActName}</div>
        )}

        {/* وصف النشاط */}
        <label htmlFor="ActDescription">📄 وصف النشاط:</label>
        <textarea
          id="ActDescription"
          name="ActDescription"
          placeholder="أدخل وصف النشاط"
          value={formik.values.ActDescription}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`form-control ${formik.touched.ActDescription && formik.errors.ActDescription ? "is-invalid" : ""}`}
        />
        {formik.touched.ActDescription && formik.errors.ActDescription && (
          <div className="invalid-feedback">{formik.errors.ActDescription}</div>
        )}

        {/* الفترة الزمنية */}
        <label htmlFor="actIntervalDate">📅 الفترة الزمنية:</label>
        <input
          type="text"
          id="actIntervalDate"
          name="actIntervalDate"
          placeholder="2025-06-01 - 2025-06-15"
          value={formik.values.actIntervalDate}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`form-control ${formik.touched.actIntervalDate && formik.errors.actIntervalDate ? "is-invalid" : ""}`}
        />
        {formik.touched.actIntervalDate && formik.errors.actIntervalDate && (
          <div className="invalid-feedback">
            {formik.errors.actIntervalDate}
          </div>
        )}

        {/* عدد المشتركين المطلوبين */}
        <label htmlFor="NumOfRequiredSubscribers">
          📋 عدد المشتركين المطلوبين:
        </label>
        <input
          type="number"
          id="NumOfRequiredSubscribers"
          name="NumOfRequiredSubscribers"
          value={formik.values.NumOfRequiredSubscribers}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`form-control ${formik.touched.NumOfRequiredSubscribers && formik.errors.NumOfRequiredSubscribers ? "is-invalid" : ""}`}
        />
        {formik.touched.NumOfRequiredSubscribers &&
          formik.errors.NumOfRequiredSubscribers && (
            <div className="invalid-feedback">
              {formik.errors.NumOfRequiredSubscribers}
            </div>
          )}

        {/* صورة النشاط */}
        <label htmlFor="imgFile">🖼️ صورة النشاط:</label>
        <input
          type="file"
          id="imgFile"
          name="imgFile"
          ref={inputRef}
          accept="image/*"
          onChange={handleImageChange}
          className={`form-control ${formik.touched.imgFile && formik.errors.imgFile ? "is-invalid" : ""}`}
        />
        {formik.touched.imgFile && formik.errors.imgFile && (
          <div className="invalid-feedback">{formik.errors.imgFile}</div>
        )}

        {formik.values.imgFile && (
          <div className="mt-2">
            <img
              src={formik.values.imgFile} // Directly use the base64 string
              alt="Uploaded"
              className="img-thumbnail"

              width="200"
            />
          </div>
        )}

        <button type="submit" className={styles.submitButton}>
          ➕ إضافة النشاط
        </button>
      </form>

      <Modal
        visible={visible}
        onCancel={closeModal}
        footer={null}
        title="المشتركين"
      >
        <Input
          placeholder="بحث عن مشترك"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
       <Table
  dataSource={paginatedSubscribers}
  pagination={false} // Disable pagination
  columns={[
    { title: "الاسم", dataIndex: "name" },
    {
      title: "الإجراء",
      render: (_, record) => (
        <Button danger onClick={() => handleDeleteSubscriber(record.userId)}>
          حذف
        </Button>
      ),
    },
  ]}
/>
        <Pagination
          current={currentPage}
          pageSize={itemsPerPage}
          total={filteredSubscribers.length}
          onChange={setCurrentPage}
        />
        <Button type="primary" danger onClick={handleAcceptAll}>
          قبول الجميع
        </Button>
      </Modal>
    </div>
  );
}
