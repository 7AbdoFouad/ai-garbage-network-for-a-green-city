import React, { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Pagination } from "react-bootstrap";
import useUser from "../../hooks/useUser";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import EditManagerModel from "./EditManagerModel";
import EditTruckDriverModel from "./EditTruckDriverModel";

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
  } = useUser();
  const { id } = useParams();
  const [currentUser, setUser] = useState({});

  const [isEditingManager, setIsEditingManager] = useState(false);
  const [isEditingTruckDriver, setIsEditingTruckDriver] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedTruckDriver, setSelectedTruckDriver] = useState(null);

  const [loadingDeleteUser, setloadingDeleteUser] = useState(false);
  const [loadingDeleteManager, setloadingDeleteManager] = useState(false);
  const [loadingDeleteTruckDriver, setloadingDeleteTruckDriver] =
    useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const user = await fetchManager(id);
      setUser(user);
    };
    fetchUsers();
  }, []);
  const loggedInPermissions = currentUser?.Permissions || [];
  console.log(loggedInPermissions);

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
  const handleDeleteUser = async (userId) => {
    //    try {
    //     await deleteUser(userId);
    //  toast.success("User deleted successfully.");
    //    } catch (error) {
    //     toast.error("Failed to delete user. Please try again later.");
    //    }
    //----------------------------
    setloadingDeleteUser(true);
    setError(null);
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
      // setSuccess("Password reset link sent");
      toast.success("User deleted successfully, an email has been sent.");
    } catch (error) {
      setError(error.message);
    } finally {
      setloadingDeleteUser(false);
    }
  };
  const handleDeleteManager = async (userId) => {
    // try {
    //   await deleteManager(userId);

    //   toast.success("Manager deleted successfully.");
    // } catch (error) {
    //   toast.error("Failed to delete Manager. Please try again later.");
    // }
    //----------------------------
    setloadingDeleteManager(true);
    setError(null);
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
      // setSuccess("Password reset link sent");
      toast.success("Manager deleted successfully, an email has been sent.");
    } catch (error) {
      setError(error.message);
    } finally {
      setloadingDeleteManager(false);
    }
  };
  const handleDeleteTruckDriver = async (userId) => {
    // try {
    //   await deleteTruckDriver(userId);
    //   toast.success("Truck Driver deleted successfully.");
    // } catch (error) {
    //   toast.error("Failed to delete Truck Driver. Please try again later.");
    // }
    //-----------------------------
    setloadingDeleteTruckDriver(true);
    setError(null);
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
      // setSuccess("Password reset link sent");
      toast.success(
        "Truck Driver deleted successfully, an email has been sent."
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setloadingDeleteTruckDriver(false);
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
      await updateManager(updatedValues.id, updatedValues);
      toast.success("Manager updated successfully!");
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
      await updateTruckDriver(updatedValues.id, updatedValues);
      toast.success("Truck Driver updated successfully!");
      setIsEditingTruckDriver(false);
      setSelectedTruckDriver(null);
    } catch (e) {
      console.log(e);
      toast.error("Failed to update Truck Driver. Please try again later.");
    }
  };

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">إدارة حسابات المستخدمين</h2>
      <Form.Control type="text" placeholder="بحث..." className="mb-3" />
      <Table striped bordered hover responsive>
        <thead className="bg-dark text-white">
          <tr>
            <th>الاسم</th>
            <th>البريد الإلكتروني</th>
            <th>الهاتف</th>
            <th>العنوان</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {users.slice(0, 10).map((user, index) => (
            <tr key={index}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.Address}</td>
              <td>
                <Button
                  variant="danger"
                  className="me-2"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  {loadingDeleteUser ? "جاري الحذف..." : "حذف"}
                </Button>
                {error && <div className="text-danger mt-2">{error}</div>}
                {/* {success && <div className="text-success mt-2">{success}</div>} */}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="container py-4">
        <h2 className="text-center mt-5 mb-4">إدارة حسابات المديرين</h2>
        <Form.Control type="text" placeholder="بحث..." className="mb-3" />
        <Table striped bordered hover responsive>
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
            {filteredManagers.slice(0, 10).map((manager, index) => (
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
                    {loadingDeleteManager ? "جاري الحذف..." : "حذف"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <h3 className="text-center mt-5">إضافة مدير</h3>
      <Form className="mt-3">
        <Form.Group className="mb-3">
          <Form.Label>اسم المدير</Form.Label>
          <Form.Control type="text" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>البريد الإلكتروني</Form.Label>
          <Form.Control type="email" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>الرقم السري</Form.Label>
          <Form.Control type="password" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>رقم الهاتف</Form.Label>
          <Form.Control type="text" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>العنوان</Form.Label>
          <Form.Control type="text" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>تحديد الصلاحيات</Form.Label>
          <Form.Check type="checkbox" label="Admin" />
          <Form.Check type="checkbox" label="ManageTrucks" />
          <Form.Check type="checkbox" label="ManageAnnouncement" />
          <Form.Check type="checkbox" label="ManageReportsAndDataAnalysis" />
          <Form.Check type="checkbox" label="CommunityEngagementManagement" />
          <Form.Check type="checkbox" label="UserManagement" />
          <Form.Check type="checkbox" label="PollsManagement" />
          <Form.Check type="checkbox" label="RewardsManagement" />
          <Form.Check type="checkbox" label="WasteBinManagement" />
        </Form.Group>
        <Button variant="success" className="me-2">
          إضافة
        </Button>
        <Button variant="secondary">إعادة تعيين</Button>
      </Form>

      <h2 className="text-center mt-5 mb-4">إدارة حسابات السائقين</h2>
      <Form.Control type="text" placeholder="بحث..." className="mb-3" />
      <Button variant="primary" className="mb-3">
        عرض السائقين
      </Button>
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
          {truckDrivers.slice(0, 10).map((driver, index) => (
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
                  {loadingDeleteTruckDriver ? "جاري الحذف..." : "حذف"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h3 className="text-center mt-5">إضافة سائق</h3>
      <Form className="mt-3">
        <Form.Group className="mb-3">
          <Form.Label>اسم السائق</Form.Label>
          <Form.Control type="text" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>البريد الإلكتروني</Form.Label>
          <Form.Control type="email" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>الرقم السري</Form.Label>
          <Form.Control type="password" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>رقم الهاتف</Form.Label>
          <Form.Control type="text" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>العنوان</Form.Label>
          <Form.Control type="text" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>رقم الشاحنة</Form.Label>
          <Form.Control type="text" />
        </Form.Group>
        <Button variant="success" className="me-2">
          إضافة
        </Button>
        <Button variant="secondary">إعادة تعيين</Button>
      </Form>
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
    </div>
  );
}
