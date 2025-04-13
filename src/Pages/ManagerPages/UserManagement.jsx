import React, { useEffect, useState } from "react";
import { Table, Button, Form, Modal } from "react-bootstrap";
import { object, string, array } from "yup";
import useUser from "../../hooks/useUser";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import EditManagerModel from "./EditManagerModel";
import EditTruckDriverModel from "./EditTruckDriverModel";
import { useFormik } from "formik";
import styles from "./EditProfileModal.module.css";

const schema = object().shape({
  name: string()
    .required("Name is required")
    .min(3, "Name must be more than 3 characters")
    .matches(/^[a-zA-Z\s]+$/, "Invalid Name, must contain letters only"),

  phone: string()
    .required("Phone number is required")
    .matches(/^\d+$/, "Phone number must contain only numbers")
    .length(11, "Phone number must be exactly 11 digits"),
  email: string()
    .required("Email is required")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Email is not valid"
    ),
  password: string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters "),
  Address: string().min(3, "Address must be more than 3 characters"),
  Permissions: array().min(1, "At least one permission is required"),
});
const schema2 = object().shape({
  name: string()
    .required("Name is required")
    .min(3, "Name must be more than 3 characters")
    .matches(/^[a-zA-Z\s]+$/, "Invalid Name, must contain letters only"),
  email: string()
    .required("Email is required")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Email is not valid"
    ),
  phone: string()
    .required("Phone number is required")
    .matches(/^\d+$/, "Phone number must contain only numbers")
    .length(11, "Phone number must be exactly 11 digits"),
  password: string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters "),
  Address: string().min(3, "Address must be more than 3 characters"),
  truckNumber: string()
    .required("Truck Number is required")
    .matches(/^[0-9]+$/, "Invalid Truck Number, must contain only numbers"),
});
const notifySchema = object().shape({
  reason: string()
    .required("Reply is required")
    .min(10, "Message is too short"),
});
export default function UserManagement() {
  const {
    users,
    managers,
    truckDrivers,
    deleteUser,
    deleteManager,
    deleteTruckDriver,
    updateManager,
    updateTruckDriver,
    fetchManager,
    addManager,
    addTruckDriver,
    addUserNotification,
  } = useUser();
  const { id } = useParams();
  const [currentUser, setUser] = useState({});

  const [isEditingManager, setIsEditingManager] = useState(false);
  const [isEditingTruckDriver, setIsEditingTruckDriver] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedTruckDriver, setSelectedTruckDriver] = useState(null);

  // const [loadingDeleteUser, setloadingDeleteUser] = useState(false);
  // const [loadingDeleteManager, setloadingDeleteManager] = useState(false);
  // const [loadingDeleteTruckDriver, setloadingDeleteTruckDriver] =
  //   useState(false);

  // const [error, setError] = useState(null);
  // const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const user = await fetchManager(id);
      setUser(user);
    };
    fetchUsers();
  }, []);
  const loggedInPermissions = currentUser?.Permissions || [];
  // console.log(loggedInPermissions);

  // Filter managers based on permissions
  const filteredManagers = managers.filter((manager) => {
    if (loggedInPermissions.includes("admin")) {
      return !(manager.id === currentUser.id); // Admin see other admins, but not themselves
    } else if (loggedInPermissions.includes("UserManagement")) {
      return (
        !manager.Permissions.includes("admin") &&
        !(manager.id === currentUser.id)
      );
    }
    return true;
  });
  const [loadingDeleteUsers, setLoadingDeleteUsers] = useState({});
  const handleDeleteUser = async (userId) => {
    //    try {
    //     await deleteUser(userId);
    //  toast.success("User deleted successfully.");
    //    } catch (error) {
    //     toast.error("Failed to delete user. Please try again later.");
    //    }
    //----------------------------
    setLoadingDeleteUsers((prev) => ({ ...prev, [userId]: true }));

    // setloadingDeleteUser(true);
    // setError(null);
    //  setSuccess(null);
    try {
      const user = users.find((user) => user.id === userId);
      const res = await fetch("http://localhost:5000/delUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send email.");
      }
      await deleteUser(userId);
                      // Fix pagination if page becomes empty
    const newTotalPages = Math.ceil((filteredUsers.length - 1) / usersPerPage);
    if (availableCurrentPage3 > newTotalPages) {
      const newPage = Math.max(newTotalPages - 1, 1);
      setAvailableCurrentPage3(newPage);
      sessionStorage.setItem("availableCurrentPage3", newPage);
    }
      // setSuccess("Password reset link sent");
      toast.success("User deleted successfully, an email has been sent.");
    } catch (error) {
      console.log(error);
      // setError(error.message);
    } finally {
      // setloadingDeleteUser(false);
      setLoadingDeleteUsers((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const [loadingDeleteManager, setloadingDeleteManager] = useState({});
  const handleDeleteManager = async (userId) => {
    // try {
    //   await deleteManager(userId);

    //   toast.success("Manager deleted successfully.");
    // } catch (error) {
    //   toast.error("Failed to delete Manager. Please try again later.");
    // }
    //----------------------------
    setloadingDeleteManager((prev) => ({ ...prev, [userId]: true }));
    // setError(null);
    try {
      const user = managers.find((user) => user.id === userId);
      const res = await fetch("http://localhost:5000/delMang", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send email.");
      }
      await deleteManager(userId);
                // Fix pagination if page becomes empty
    const newTotalPages = Math.ceil((filteredManagersSearch.length - 1) / managersPerPage);
    if (availableCurrentPage > newTotalPages) {
      const newPage = Math.max(newTotalPages - 1, 1);
      setAvailableCurrentPage(newPage);
      sessionStorage.setItem("availableCurrentPage", newPage);
    }
      // setSuccess("Password reset link sent");
      toast.success("Manager deleted successfully, an email has been sent.");
    } catch (error) {
      console.log(error);
      // setError(error.message);
    } finally {
      setLoadingDeleteUsers((prev) => ({ ...prev, [userId]: false }));
    }
  };
  const [loadingDeleteTruckDriver, setloadingDeleteTruckDriver] = useState({});
  const handleDeleteTruckDriver = async (userId) => {
    // try {
    //   await deleteTruckDriver(userId);
    //   toast.success("Truck Driver deleted successfully.");
    // } catch (error) {
    //   toast.error("Failed to delete Truck Driver. Please try again later.");
    // }
    //-----------------------------
    setloadingDeleteTruckDriver((prev) => ({ ...prev, [userId]: true }));
    // setError(null);
    try {
      const user = truckDrivers.find((user) => user.id === userId);
      const res = await fetch("http://localhost:5000/delTruck", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send email.");
      }
      await deleteTruckDriver(userId); 
          // Fix pagination if page becomes empty
    const newTotalPages = Math.ceil((filteredTruckDrivers.length - 1) / driversPerPage);
    if (availableCurrentPage2 > newTotalPages) {
      const newPage = Math.max(newTotalPages - 1, 1);
      setAvailableCurrentPage2(newPage);
      sessionStorage.setItem("availableCurrentPage2", newPage);
    }
      // setSuccess("Password reset link sent");
      toast.success(
        "Truck Driver deleted successfully, an email has been sent."
      );
    } catch (error) {
      // setError(error.message);
      console.log(error);
    } finally {
      setloadingDeleteTruckDriver((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleEditManager = (ManagerData) => {
    setSelectedManager(ManagerData);
    setIsEditingManager(true);
  };
  const handleSaveManagerData = async (values) => {
    // values is now the object with form values
    const updatedValues = {
      ...selectedManager,
      ...values, // Spread the values from the form
    };

    try {
      const res = await fetch("http://localhost:5000/edMang", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: updatedValues.email,
          data: updatedValues,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send email.");
      }
      await updateManager(updatedValues.id, updatedValues);
      toast.success("Manager updated successfully!, an email has been sent.");
      setIsEditingManager(false);
      setSelectedManager(null);
    } catch (e) {
      console.log(e);
      toast.error("Failed to update Manager. Please try again later.");
    }
  };
  const handleEditTruckDriver = (TruckDriverData) => {
    setSelectedTruckDriver(TruckDriverData);
    setIsEditingTruckDriver(true);
  };
  const handleSaveTruckDriver = async (values) => {
    // values is now the object with form values
    const updatedValues = {
      ...selectedTruckDriver,
      ...values, // Spread the values from the form
    };

    try {
      const res = await fetch("http://localhost:5000/edTruck", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: updatedValues.email,
          data: updatedValues,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send email.");
      }
      await updateTruckDriver(updatedValues.id, updatedValues);
      toast.success("Truck Driver updated successfully!");
      setIsEditingTruckDriver(false);
      setSelectedTruckDriver(null);
    } catch (e) {
      console.log(e);
      toast.error("Failed to update Truck Driver. Please try again later.");
    }
  };

  const [submitingManager, setSubmitingManager] = useState(false); // ✅ Add submitting state
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      Address: "",
      profileImage:
        "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png",
      Permissions: [],
    },
    validationSchema: schema,
    onSubmit: async (data) => {
      // ✅ Make it async
      setSubmitingManager(true); // ✅ Set submitting to true before saving
      try {
        // await saveData(data); // ✅ Ensure saveData is awaited
        await addManager({ ...data, profileImage: formik.values.profileImage });
        toast.success("Manager added successfully!");
      } catch (error) {
        console.log(error);
        toast.error("Failed to add Manager. Please try again later.");
      } finally {
        setSubmitingManager(false); // ✅ This will now execute correctly after awaiting saveData
        formik.resetForm();
      }
    },
  });
  const [submitingDriver, setSubmitingDriver] = useState(false); // ✅ Add submitting state
  const formik2 = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      Address: "",
      password: "",
      truckNumber: "",
      profileImage:
        "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png",
    },
    validationSchema: schema2,

    onSubmit: async (data) => {
      // ✅ Make it async
      setSubmitingDriver(true); // ✅ Set submitting to true before saving
      try {
        // await saveData(data); // ✅ Ensure saveData is awaited
        await addTruckDriver({
          ...data,
          profileImage: formik2.values.profileImage,
        });
        toast.success("Truck Driver added successfully!");
      } catch (error) {
        console.log(error);
        toast.error("Failed to add Truck Driver. Please try again later.");
      } finally {
        setSubmitingDriver(false); // ✅ This will now execute correctly after awaiting saveData
        formik2.resetForm();
      }
    },
  });
  const [currentManager, setCurrentManager] = useState(null);
  useEffect(() => {
    const fetchmanager = async () => {
      const manager = await fetchManager(id);
      setCurrentManager(manager);
    };
    fetchmanager();
  });
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    const updatedPermissions = checked
      ? [...formik.values.Permissions, value] // Add if checked
      : formik.values.Permissions.filter((perm) => perm !== value); // Remove if unchecked

    formik.setFieldValue("Permissions", updatedPermissions);
    if (updatedPermissions.length == 0) formik.touched.Permissions = true;
  };

  const [selectedContactUs, setselectedContactUs] = useState(null);
  const [modalShowNotify, setModalShowNotify] = useState(false);
  const formikNotify = useFormik({
    initialValues: { reason: "" },
    validationSchema: notifySchema,
    onSubmit: (values) => {
      if (selectedContactUs) {
        addUserNotification({
          notificationContent: `Reply: "${selectedContactUs.message}" - ${values.reason}`,
          notificationDate: new Date().toISOString().split("T")[0],
          isRead: "false",
          userId: selectedContactUs.userId,
        });
        toast.success("Reply sent successfully");
        setModalShowNotify(false);
        setselectedContactUs(null);
        formikNotify.resetForm();
      }
    },
  });
  const handleNotify = (report) => {
    setselectedContactUs(report);
    setModalShowNotify(true);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const filteredUsers = users.filter(
    (sub) =>sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [searchTerm2, setSearchTerm2] = useState("");
  const filteredManagersSearch = filteredManagers.filter(
    (sub) =>sub.name.toLowerCase().includes(searchTerm2.toLowerCase())
  )
  const [searchTerm3, setSearchTerm3] = useState("");
  const filteredTruckDrivers = truckDrivers.filter(
    (sub) =>sub.name.toLowerCase().includes(searchTerm3.toLowerCase())
  );

  const [availableCurrentPage, setAvailableCurrentPage] = useState(
    parseInt(sessionStorage.getItem("availableCurrentPage")) || 1
  );
  const managersPerPage = 5;
  const paginatedManagers = filteredManagersSearch.slice(
    (availableCurrentPage - 1) * managersPerPage,
    availableCurrentPage * managersPerPage
  );
  const totalAvailablePages = Math.ceil(
    filteredManagersSearch.length / managersPerPage
  );
  const handleAvailablePageChange = (page) => {
    setAvailableCurrentPage(page);
    sessionStorage.setItem("availableCurrentPage", page);
  };
  //-------------------------
  const [availableCurrentPage2, setAvailableCurrentPage2] = useState(
    parseInt(sessionStorage.getItem("availableCurrentPage2")) || 1
  );
  const driversPerPage = 5;
  const paginatedDrivers = filteredTruckDrivers.slice(
    (availableCurrentPage2 - 1) * driversPerPage,
    availableCurrentPage2 * driversPerPage
  );
  const totalAvailablePages2 = Math.ceil(
    filteredTruckDrivers.length / driversPerPage
  );
  const handleAvailablePageChange2 = (page) => {
    setAvailableCurrentPage2(page);
    sessionStorage.setItem("availableCurrentPage2", page);
  };
  //-------------------------
  const [availableCurrentPage3, setAvailableCurrentPage3] = useState(
    parseInt(sessionStorage.getItem("availableCurrentPage3")) || 1
  );
  const usersPerPage = 5;
  const paginatedUsers = filteredUsers.slice(
    (availableCurrentPage3 - 1) * usersPerPage,
    availableCurrentPage3 * usersPerPage
  );
  const totalAvailablePages3 = Math.ceil(filteredUsers.length / usersPerPage);
  const handleAvailablePageChange3 = (page) => {
    setAvailableCurrentPage3(page);
    sessionStorage.setItem("availableCurrentPage3", page);
  };

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">إدارة حسابات المستخدمين</h2>
      <Form.Control
            type="text"
            placeholder="Search User"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            // onFocus={()=>{document.activeElement.blur()}}
                  style={{marginTop: "20px", marginBottom: "20px"}}
                  //onfocus remove outline
                  onFocus={(e) => {
                    e.target.style.outline = "none";
                    e.target.style.boxShadow = "none";
                    e.target.style.borderColor = "#ced4da";
                  }}
          />      <Table striped bordered hover responsive>
        <thead className="bg-dark text-white">
          <tr>
            <th>الاسم</th>
            <th>البريد الإلكتروني</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.slice(0, 10).map((user, index) => (
            <tr key={index}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <Button
                  variant="danger"
                  className="me-2"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  {loadingDeleteUsers[user.id] ? "...جاري الحذف" : "حذف  "}
                </Button>
                {/* {error && <div className="text-danger mt-2">{error}</div>} */}
                {/* {success && <div className="text-success mt-2">{success}</div>} */}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleNotify(user)}
                  className={styles.notifyButton}
                >
                  Notify
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div>
                  {Array.from({ length: totalAvailablePages3 }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={availableCurrentPage3 === i + 1 ? "primary" : "light"}
                      style={{backgroundColor:availableCurrentPage3 === i + 1 ? "#2e7d32" : "white",
                        color: availableCurrentPage3 === i + 1 ? "white" : "black",
                        border: availableCurrentPage3 === i + 1 ? "#2e7d32" : "white",
                      }}
                      onClick={() =>  handleAvailablePageChange3(i + 1)}
                      className={styles.paginationButton}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
      <div className="container py-4">
        <h2 className="text-center mt-5 mb-4">إدارة حسابات المديرين</h2>
        <Form.Control
            type="text"
            placeholder="Search Manager"
            value={searchTerm2}
            onChange={(e) => setSearchTerm2(e.target.value)}
            className={styles.searchInput}
            // onFocus={()=>{document.activeElement.blur()}}
                  style={{marginTop: "20px", marginBottom: "20px"}}
                  //onfocus remove outline
                  onFocus={(e) => {
                    e.target.style.outline = "none";
                    e.target.style.boxShadow = "none";
                    e.target.style.borderColor = "#ced4da";
                  }}
          />          <Table striped bordered hover responsive>
          <thead className="bg-dark text-white">
            <tr>
              <th>الاسم</th>
              <th>البريد الإلكتروني</th>
              <th>الهاتف</th>
              <th>العنوان</th>
              <th>الصلاحيات</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {paginatedManagers.slice(0, 10).map((manager, index) => (
              <tr key={index}>
                <td>{manager.name}</td>
                <td>{manager.email}</td>
                <td>{manager.phone}</td>
                <td>{manager.Address}</td>
                <td>
                  {Array.isArray(manager.Permissions)
                    ? manager.Permissions.join(", ")
                    : "لا توجد صلاحيات"}
                </td>
                <td>
                  <Button
                    variant="warning"
                    className="me-2"
                    onClick={() => handleEditManager(manager)}
                  >
                    تعديل
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteManager(manager.id)}
                  >
                    {loadingDeleteManager[manager.id] ? "...جاري الحذف" : "حذف"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
        <div>
                  {Array.from({ length: totalAvailablePages }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={availableCurrentPage === i + 1 ? "primary" : "light"}
                      style={{backgroundColor:availableCurrentPage === i + 1 ? "#2e7d32" : "white",
                        color: availableCurrentPage === i + 1 ? "white" : "black",
                        border: availableCurrentPage === i + 1 ? "#2e7d32" : "white",
                      }}
                      onClick={() =>  handleAvailablePageChange(i + 1)}
                      className={styles.paginationButton}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
      <h3 className="text-center mt-5">إضافة مدير</h3>
      <form onSubmit={formik.handleSubmit}>
        <label htmlFor="username" className={styles.label}>
          اسم المدير:
        </label>
        <input
          type="text"
          name="name"
          id="username"
          placeholder="Enter Your Name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`form-control ${styles.input} ${
            formik.touched.name && formik.errors.name ? "is-invalid" : ""
          }`}
        />
        {formik.touched.name && formik.errors.name && (
          <div className="invalid-feedback">{formik.errors.name}</div>
        )}
        <label htmlFor="email" className={styles.label}>
          البريد الإلكتروني:
        </label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Enter Your Email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`form-control ${styles.input} ${
            formik.touched.email && formik.errors.email ? "is-invalid" : ""
          }`}
        />
        {formik.touched.email && formik.errors.email && (
          <div className="invalid-feedback">{formik.errors.email}</div>
        )}

        <label htmlFor="phone" className={styles.label}>
          رقم الهاتف:
        </label>
        <input
          type="text"
          name="phone"
          id="phone"
          placeholder="Enter Your Phone Number"
          value={formik.values.phone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`form-control ${styles.input} ${
            formik.touched.phone && formik.errors.phone ? "is-invalid" : ""
          }`}
        />
        {formik.touched.phone && formik.errors.phone && (
          <div className="invalid-feedback">{formik.errors.phone}</div>
        )}

        <label htmlFor="Address" className={styles.label}>
          العنوان:
        </label>
        <input
          type="text"
          name="Address"
          id="Address"
          placeholder="Enter Your Address"
          value={formik.values.Address}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`form-control ${styles.input} ${
            formik.touched.Address && formik.errors.Address ? "is-invalid" : ""
          }`}
        />
        {formik.touched.Address && formik.errors.Address && (
          <div className="invalid-feedback">{formik.errors.Address}</div>
        )}
        <label htmlFor="password" className={styles.label}>
          كلمة المرور:
        </label>
        <input
          type="text"
          name="password"
          id="password"
          placeholder="Enter Your Password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`form-control ${styles.input} ${
            formik.touched.password && formik.errors.password
              ? "is-invalid"
              : ""
          }`}
        />
        {formik.touched.password && formik.errors.password && (
          <div className="invalid-feedback">{formik.errors.password}</div>
        )}
        <label htmlFor="Permissions" className={styles.label}>
          الصلاحيات:
        </label>
        {/* chexkbox */}
        <div
          className={`${styles.checkboxContainer}   ${
            formik.touched.Permissions && formik.errors.Permissions
              ? "is-invalid"
              : ""
          }`}
        >
          <div
            className={styles.checkboxItem}
            style={{
              display: !currentManager?.Permissions?.includes("admin")
                ? "none"
                : "block",
            }}
          >
            <input
              type="checkbox"
              name="Permissions"
              value="admin"
              onChange={handleCheckboxChange}
              id="admin"
              checked={formik.values.Permissions.includes("admin")}
            />
            <label htmlFor="admin">مدير عام</label>
          </div>
          <div className={styles.checkboxItem}>
            <input
              type="checkbox"
              name="Permissions"
              value="ManageTrucks"
              onChange={handleCheckboxChange}
              id="ManageTrucks"
              checked={formik.values.Permissions.includes("ManageTrucks")}
            />
            <label htmlFor="ManageTrucks">مدير شاحنات</label>
          </div>
          <div className={styles.checkboxItem}>
            <input
              type="checkbox"
              name="Permissions"
              value="ManageAnnouncement"
              onChange={handleCheckboxChange}
              id="ManageAnnouncement"
              checked={formik.values.Permissions.includes("ManageAnnouncement")}
            />
            <label htmlFor="ManageAnnouncement">مدير بلاغات</label>
          </div>
          <div className={styles.checkboxItem}>
            <input
              type="checkbox"
              name="Permissions"
              value="ManageReportsAndDataAnalysis"
              onChange={handleCheckboxChange}
              id="ManageReportsAndDataAnalysis"
              checked={formik.values.Permissions.includes(
                "ManageReportsAndDataAnalysis"
              )}
            />
            <label htmlFor="ManageReportsAndDataAnalysis">
              مدير تقارير وتحليل البيانات
            </label>
          </div>
          <div className={styles.checkboxItem}>
            <input
              type="checkbox"
              name="Permissions"
              value="CommunityEngagementManagement"
              onChange={handleCheckboxChange}
              id="CommunityEngagementManagement"
              checked={formik.values.Permissions.includes(
                "CommunityEngagementManagement"
              )}
            />
            <label htmlFor="CommunityEngagementManagement">مدير فعاليات</label>
          </div>
          <div className={styles.checkboxItem}>
            <input
              type="checkbox"
              name="Permissions"
              value="UserManagement"
              onChange={handleCheckboxChange}
              id="UserManagement"
              checked={formik.values.Permissions.includes("UserManagement")}
            />
            <label htmlFor="UserManagement">مدير مستخدمين</label>
          </div>
          <div className={styles.checkboxItem}>
            <input
              type="checkbox"
              name="Permissions"
              value="PollsManagement"
              onChange={handleCheckboxChange}
              id="PollsManagement"
              checked={formik.values.Permissions.includes("PollsManagement")}
            />
            <label htmlFor="PollsManagement">مدير استطلاعات</label>
          </div>
          <div className={styles.checkboxItem}>
            <input
              type="checkbox"
              name="Permissions"
              value="RewardsManagement"
              onChange={handleCheckboxChange}
              id="RewardsManagement"
              checked={formik.values.Permissions.includes("RewardsManagement")}
            />
            <label htmlFor="RewardsManagement">مدير مكافئات</label>
          </div>
          <div className={styles.checkboxItem}>
            <input
              type="checkbox"
              name="Permissions"
              value="WasteBinManagement"
              onChange={handleCheckboxChange}
              id="WasteBinManagement"
              checked={formik.values.Permissions.includes("WasteBinManagement")}
            />
            <label htmlFor="WasteBinManagement">مدير صناديق نفايات</label>
          </div>
        </div>
        {formik.touched.Permissions && formik.errors.Permissions && (
          <div className="invalid-feedback ">{formik.errors.Permissions}</div>
        )}
        <div className={styles.modalButtons}>
          <button
            className={`${styles.button} ${submitingManager ? styles.disabled : styles.saveButton}`}
            type="submit"
            disabled={submitingManager}
          >
            {submitingManager ? "...جاري الاضافة" : " 🧑🏻‍💼 اضافة"}
          </button>
        </div>
      </form>

      <h2 className="text-center mt-5 mb-4">إدارة حسابات السائقين</h2>
      <Form.Control
            type="text"
            placeholder="Search Truck Driver"
            value={searchTerm3}
            onChange={(e) => setSearchTerm3(e.target.value)}
            className={styles.searchInput}
            // onFocus={()=>{document.activeElement.blur()}}
                  style={{marginTop: "20px", marginBottom: "20px"}}
                  //onfocus remove outline
                  onFocus={(e) => {
                    e.target.style.outline = "none";
                    e.target.style.boxShadow = "none";
                    e.target.style.borderColor = "#ced4da";
                  }}
          />        
      <Table striped bordered hover responsive>
        <thead className="bg-dark text-white">
          <tr>
            <th>الاسم</th>
            <th>البريد الإلكتروني</th>
            <th>الهاتف</th>
            <th>العنوان</th>
            <th>رقم الشاحنة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredTruckDrivers.slice(0, 10).map((driver, index) => (
            <tr key={index}>
              <td>{driver.name}</td>
              <td>{driver.email}</td>
              <td>{driver.phone}</td>
              <td>{driver.Address}</td>
              <td>{driver.truckNumber}</td>
              <td>
                <Button
                  variant="warning"
                  className="me-2"
                  onClick={() => handleEditTruckDriver(driver)}
                >
                  تعديل
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteTruckDriver(driver.id)}
                >
                  {loadingDeleteTruckDriver[driver.id]
                    ? "...جاري الحذف"
                    : "حذف"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div>
                  {Array.from({ length: totalAvailablePages2 }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={availableCurrentPage2 === i + 1 ? "primary" : "light"}
                      style={{backgroundColor:availableCurrentPage2 === i + 1 ? "#2e7d32" : "white",
                        color: availableCurrentPage2 === i + 1 ? "white" : "black",
                        border: availableCurrentPage2 === i + 1 ? "#2e7d32" : "white",
                      }}
                      onClick={() =>  handleAvailablePageChange2(i + 1)}
                      className={styles.paginationButton}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
      <h3 className="text-center mt-5">إضافة سائق</h3>
      <form onSubmit={formik2.handleSubmit}>
        <label htmlFor="username" className={styles.label}>
          اسم المستخدم:
        </label>
        <input
          type="text"
          name="name"
          id="username"
          placeholder="Enter Your Name"
          value={formik2.values.name}
          onChange={formik2.handleChange}
          onBlur={formik2.handleBlur}
          className={`form-control ${styles.input} ${
            formik2.touched.name && formik2.errors.name ? "is-invalid" : ""
          }`}
        />
        {formik2.touched.name && formik2.errors.name && (
          <div className="invalid-feedback">{formik2.errors.name}</div>
        )}
        <label htmlFor="email" className={styles.label}>
          البريد الإلكتروني:
        </label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Enter Your Email"
          value={formik2.values.email}
          onChange={formik2.handleChange}
          onBlur={formik2.handleBlur}
          className={`form-control ${styles.input} ${
            formik2.touched.email && formik2.errors.email ? "is-invalid" : ""
          }`}
        />
        {formik2.touched.email && formik2.errors.email && (
          <div className="invalid-feedback">{formik2.errors.email}</div>
        )}

        <label htmlFor="phone" className={styles.label}>
          رقم الهاتف:
        </label>
        <input
          type="text"
          name="phone"
          id="phone"
          placeholder="Enter Your Phone Number"
          value={formik2.values.phone}
          onChange={formik2.handleChange}
          onBlur={formik2.handleBlur}
          className={`form-control ${styles.input} ${
            formik2.touched.phone && formik2.errors.phone ? "is-invalid" : ""
          }`}
        />
        {formik2.touched.phone && formik2.errors.phone && (
          <div className="invalid-feedback">{formik2.errors.phone}</div>
        )}

        <label htmlFor="Address" className={styles.label}>
          العنوان:
        </label>
        <input
          type="text"
          name="Address"
          id="Address"
          placeholder="Enter Your Address"
          value={formik2.values.Address}
          onChange={formik2.handleChange}
          onBlur={formik2.handleBlur}
          className={`form-control ${styles.input} ${
            formik2.touched.Address && formik2.errors.Address
              ? "is-invalid"
              : ""
          }`}
        />
        {formik2.touched.Address && formik2.errors.Address && (
          <div className="invalid-feedback">{formik2.errors.Address}</div>
        )}
        <label htmlFor="password" className={styles.label}>
          كلمة المرور:
        </label>
        <input
          type="text"
          name="password"
          id="password"
          placeholder="Enter Your Password"
          value={formik2.values.password}
          onChange={formik2.handleChange}
          onBlur={formik2.handleBlur}
          className={`form-control ${styles.input} ${
            formik2.touched.password && formik2.errors.password
              ? "is-invalid"
              : ""
          }`}
        />
        {formik2.touched.password && formik2.errors.password && (
          <div className="invalid-feedback">{formik2.errors.password}</div>
        )}
        <label htmlFor="truckNumber" className={styles.label}>
          رقم الشاحنة:
        </label>
        <input
          type="text"
          name="truckNumber"
          id="truckNumber"
          placeholder="Enter Your Truck Number"
          value={formik2.values.truckNumber}
          onChange={formik2.handleChange}
          onBlur={formik2.handleBlur}
          className={`form-control ${styles.input} ${
            formik2.touched.truckNumber && formik2.errors.truckNumber
              ? "is-invalid"
              : ""
          }`}
        />
        {formik2.touched.truckNumber && formik2.errors.truckNumber && (
          <div className="invalid-feedback">{formik2.errors.truckNumber}</div>
        )}

        <div className={styles.modalButtons}>
          <button
            className={`${styles.button} ${submitingDriver ? styles.disabled : styles.saveButton}`}
            type="submit"
            disabled={submitingDriver}
          >
            {submitingDriver ? "...جاري الاضافة" : " 🧑🏻‍💼 اضافة"}
          </button>
        </div>
      </form>
      {selectedManager && isEditingManager && (
        <EditManagerModel
          // show={isEditing}
          closeModal={() => setIsEditingManager(false)}
          saveData={handleSaveManagerData}
          userData={selectedManager}
        />
      )}
      {selectedTruckDriver && isEditingTruckDriver && (
        <EditTruckDriverModel
          // show={showModal}
          closeModal={() => setIsEditingTruckDriver(false)}
          saveData={handleSaveTruckDriver}
          userData={selectedTruckDriver}
        />
      )}
      {/* Notify Modal */}
      <Modal
        show={modalShowNotify}
        onHide={() => setModalShowNotify(false)}
        centered
      >
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title>Notify User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={formikNotify.handleSubmit}>
            <Form.Group>
              <Form.Label>Reply:</Form.Label>
              <Form.Control
                as="textarea"
                name="reason"
                rows={3}
                value={formikNotify.values.reason}
                onChange={formikNotify.handleChange}
                // onBlur={formikNotify.handleBlur}
                className={`form-control  ${
                  formikNotify.touched.reason && formikNotify.errors.reason
                    ? "is-invalid"
                    : ""
                }`}
                style={{ height: "100px", resize: "none" }}
                // onFocus={()=>{document.activeElement.blur()}}
                onFocus={(e) => {
                  e.target.style.outline = "none";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = "#00980DFF";
                  e.target.style.borderWidth = "2px";
                }}
                onBlur={(e) => {
                  formikNotify.handleBlur(e);
                  e.target.style.outline = "none";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = "none";
                  e.target.style.borderWidth = "0px";
                }}
              />
              {formikNotify.touched.reason && formikNotify.errors.reason && (
                <div className="invalid-feedback">
                  {formikNotify.errors.reason}
                </div>
              )}
            </Form.Group>
            <Modal.Footer className={styles.modalFooter}>
              <Button
                variant="secondary"
                onClick={() => setModalShowNotify(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" type="submit">
                Send Notification
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
