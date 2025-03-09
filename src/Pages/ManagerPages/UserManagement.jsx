import React, { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Pagination } from "react-bootstrap";
import useUser from "../../hooks/useUser";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";


export default function UserManagement() {
  const {
    users,
    managers,
    truckDrivers,
    deleteUser,
    deleteManager,
    updateManager,
    deleteTruckDriver,
    updateTruckDriver,
    fetchManager
  } = useUser();
  const {id} = useParams();
  const [currentUser, setUser] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedUser(null);
  };
  useEffect(() => {
    const fetchUsers = async () => {
     const user= await fetchManager(id);
      setUser(user);
    };
    fetchUsers();
  }, []);
  const loggedInPermissions = currentUser?.Permissions || [];
  console.log(loggedInPermissions);
  

  // Filter managers based on permissions
  const filteredManagers = managers.filter((manager) => {
    if (loggedInPermissions.includes("admin")) {
      return !manager.Permissions.includes("admin"); // Admin can't see other admins
    } else if (loggedInPermissions.includes("UserManagement")) {
      return !manager.Permissions.includes("admin") && !manager.Permissions.includes("UserManagement");
    }
    return true;
  });
  const handleDeleteUser = async(userId) => {
         try {
          await deleteUser(userId);
       toast.success("User deleted successfully.");
         } catch (error) {
          toast.error("Failed to delete user. Please try again later.");
         }  
  }
  const handleDeleteManager = async(userId) => {
    try {
     await deleteManager(userId);

  toast.success("Manager deleted successfully.");
    } catch (error) {
     toast.error("Failed to delete Manager. Please try again later.");
    }  
}
const handleDeleteTruckDriver = async(userId) => {
  try {
   await deleteTruckDriver(userId);
    toast.success("Truck Driver deleted successfully.");
  } catch (error) {
   toast.error("Failed to delete Truck Driver. Please try again later.");
  }  
}

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
                <Button variant="danger" className="me-2" onClick={() => handleDeleteUser(user.id)}>
                  حذف
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination className="justify-content-center">
        <Pagination.Prev />
        <Pagination.Item active>1</Pagination.Item>
        <Pagination.Next />
      </Pagination>

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
              <td>{Array.isArray(manager.Permissions) ? manager.Permissions.join(", ") : "لا توجد صلاحيات"}</td>
              <td>
                <Button variant="warning" className="me-2">
                  تعديل
                </Button>
                <Button variant="danger" onClick={() => handleDeleteManager(manager.id)}>حذف</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination className="justify-content-center">
        <Pagination.Prev />
        <Pagination.Item active>1</Pagination.Item>
        <Pagination.Next />
      </Pagination>
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
                <Button variant="warning" className="me-2">
                  تعديل
                </Button>
                <Button variant="danger" onClick={() => handleDeleteTruckDriver(driver.id)}>حذف</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination className="justify-content-center">
        <Pagination.Prev />
        <Pagination.Item active>1</Pagination.Item>
        <Pagination.Next />
      </Pagination>
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
    </div>
  );
}
