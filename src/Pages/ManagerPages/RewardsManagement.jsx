import React, { useState, useEffect } from "react";
import useUser from "../../hooks/useUser";
import { Table, Button, Modal, Form, Input, DatePicker, Space, Typography, Tag, Avatar, Spin } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import styles from './RewardManagement.module.css';

dayjs.extend(isSameOrAfter);

const { Title, Text } = Typography;

const usePagination = (key, initialPage = 1) => {
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = sessionStorage.getItem(key);
    return saved ? parseInt(saved) : initialPage;
  });

  useEffect(() => {
    sessionStorage.setItem(key, currentPage);
  }, [currentPage, key]);

  return [currentPage, setCurrentPage];
};

export default function RewardManagement() {
  const {
    Rewards,
    UsersSignedUpForRewards,
    addReward,
    deleteReward,
    updateReward,
    deleteUsersSignedUpForReward,
    addUserNotification,
  } = useUser();

  const [isModalVisible, setModalVisible] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rewardPage, setRewardPage] = usePagination('rewardPage');
  const [userPage, setUserPage] = usePagination('userPage');
  const itemsPerPage = 5;

  const today = dayjs().startOf('day');
  const availableRewards = Rewards.filter(r => dayjs(r.ExpiryDate).isSameOrAfter(today));
  const unavailableRewards = Rewards.filter(r => dayjs(r.ExpiryDate).isBefore(today));

  const paginate = (data, page) => {
    const start = (page - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  };

  const handleDone = async (user) => {
    try {
      setLoading(true);
      await deleteUsersSignedUpForReward(user.id);
      await addUserNotification({
        userId: user.userId,
        notificationContent: `Congratulations! You've completed the ${user.rewardName} reward`,
        notificationDate: dayjs().format('YYYY-MM-DD')
      });
      toast.success(`Notification sent to ${user.name}`);
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteReward(id);
      toast.success("Reward deleted successfully");
    } catch (error) {
      toast.error("Failed to delete reward");
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      rewardName: "",
      rewardDesc: "",
      rewardRequirements: {
        numOfAcceptedAnnouncements: 0,
        numOfCompletedActivities: 0,
        numOfCompletedPolls: 0
      },
      ExpiryDate: null,
      rewardValue: "",
      imgFile: null,
    },
    validationSchema: Yup.object({
      rewardName: Yup.string().required("Required"),
      rewardDesc: Yup.string().required("Required"),
      rewardRequirements: Yup.object().shape({
        numOfAcceptedAnnouncements: Yup.number()
          .min(0, "Must be 0 or more")
          ,
        numOfCompletedActivities: Yup.number()
          .min(0, "Must be 0 or more")
          ,
        numOfCompletedPolls: Yup.number()
          .min(0, "Must be 0 or more")
          
      }).test(
        'at-least-one-requirement',
        'At least one requirement must be greater than 0',
        value => Object.values(value).some(v => v > 0)
      ),
      ExpiryDate: Yup.mixed().required("Expiry date is required"),
      rewardValue: Yup.string().required("Reward value is required"),
      imgFile: Yup.mixed().required("Image is required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const payload = {
          ...values,
          ExpiryDate: values.ExpiryDate.format('YYYY-MM-DD'),
        };

        if (editingReward) {
          await updateReward(editingReward.id, payload);
          toast.success("Reward updated successfully");
        } else {
          await addReward(payload);
          toast.success("Reward created successfully");
        }
        setModalVisible(false);
      } catch (error) {
        toast.error("Operation failed");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          formik.setFieldValue("imgFile", reader.result);
        } catch (error) {
          toast.error("Failed to upload image");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const userColumns = [
    { 
      title: 'User', 
      render: (_, r) => (
        <div className={styles.userCard}>
          <Avatar className={styles.userAvatar}>{r.name[0]}</Avatar>
          <div className={styles.userInfo}>
            <Text strong>{r.name}</Text>
            <Text type="secondary">{r.email}</Text>
          </div>
        </div>
      )
    },
    { title: 'Reward', dataIndex: 'rewardName', className: styles.tableCell },
    { title: 'Phone', dataIndex: 'PhoneNum', className: styles.tableCell },
    { 
      title: 'Actions', 
      render: (_, r) => (
        <Button
          type="primary"
          className={styles.doneButton}
          icon={<CheckOutlined />}
          onClick={() => handleDone(r)}
          loading={loading}
        >
          Mark Done
        </Button>
      )
    }
  ];

  const rewardColumns = [
    { title: 'Name', dataIndex: 'rewardName', className: styles.tableCell },
    { title: 'Description', dataIndex: 'rewardDesc', className: styles.tableCell },
    { 
      title: 'Requirements', 
      render: (_, r) => (
        <div className={styles.requirements}>
          {Object.entries(r.rewardRequirements).map(([key, value]) => (
            value > 0 && (
              <Tag key={key} className={styles.requirementTag}>
                {value} {key
                  .replace('numOf', '')
                  .replace(/([A-Z])/g, ' $1')
                  .trim()}
              </Tag>
            )
          ))}
        </div>
      )
    },
    { 
      title: 'Expiry Date', 
      render: (_, r) => (
        <span className={styles.dateCell}>
          {dayjs(r.ExpiryDate).format('DD/MM/YYYY')}
        </span>
      )
    },
    { title: 'Value', dataIndex: 'rewardValue', className: styles.tableCell },
    {
      title: 'Actions',
      render: (_, r) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            className={styles.editButton}
            onClick={() => {
              setEditingReward(r);
              formik.setValues({
                ...r,
                ExpiryDate: dayjs(r.ExpiryDate),
              });
              setModalVisible(true);
            }}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            className={styles.deleteButton}
            onClick={() => handleDelete(r.id)}
            loading={loading}
          />
        </Space>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <Spin spinning={loading} tip="Processing..." className={styles.loader}>
        <header className={styles.header}>
          <h1 className={styles.title}>🏆 Reward Management</h1>
          <Button
            className={styles.addButton}
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingReward(null);
              formik.resetForm();
              setModalVisible(true);
            }}
          >
            New Reward
          </Button>
        </header>

        {/* Available Rewards Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Active Rewards ({availableRewards.length})
          </h2>
          <Table
            className={styles.table}
            dataSource={paginate(availableRewards, rewardPage)}
            columns={rewardColumns}
            pagination={{
              current: rewardPage,
              pageSize: itemsPerPage,
              total: availableRewards.length,
              onChange: setRewardPage,
              hideOnSinglePage: true,
            }}
            scroll={{ x: true }}
            locale={{ emptyText: <div className={styles.emptyState}>No active rewards found 🌱</div> }}
            rowKey="id"
          />
        </section>

        {/* Expired Rewards Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Expired Rewards ({unavailableRewards.length})
          </h2>
          <Table
            className={styles.table}
            dataSource={paginate(unavailableRewards, rewardPage)}
            columns={rewardColumns}
            pagination={{
              current: rewardPage,
              pageSize: itemsPerPage,
              total: unavailableRewards.length,
              onChange: setRewardPage,
              hideOnSinglePage: true,
            }}
            scroll={{ x: true }}
            locale={{ emptyText: <div className={styles.emptyState}>No expired rewards found 🍂</div> }}
            rowKey="id"
          />
        </section>

        {/* Participants Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Participants ({UsersSignedUpForRewards.length})
          </h2>
          <Table
            className={styles.table}
            dataSource={paginate(UsersSignedUpForRewards, userPage)}
            columns={userColumns}
            pagination={{
              current: userPage,
              pageSize: itemsPerPage,
              total: UsersSignedUpForRewards.length,
              onChange: setUserPage,
              hideOnSinglePage: true,
            }}
            scroll={{ x: true }}
            locale={{ emptyText: <div className={styles.emptyState}>No participants yet 🤷♂️</div> }}
            rowKey="id"
          />
        </section>

        {/* Reward Form Modal */}
        <Modal
          title={editingReward ? "Edit Reward" : "Create Reward"}
          visible={isModalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          className={styles.modal}
          destroyOnClose
        >
          <Form layout="vertical" onFinish={formik.handleSubmit}>
            {/* Image Upload */}
            <Form.Item className={styles.formItem}>
              <label className={styles.fileLabel}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.fileInput}
                />
                📷 Upload Reward Image
              </label>
              {formik.errors.imgFile && (
                <Text type="danger" className={styles.errorText}>
                  {formik.errors.imgFile}
                </Text>
              )}
            </Form.Item>

            {/* Reward Name */}
            <Form.Item className={styles.formItem}>
              <label className={styles.formLabel}>Reward Name</label>
              <Input
                name="rewardName"
                value={formik.values.rewardName}
                onChange={formik.handleChange}
                className={styles.formInput}
              />
              {formik.errors.rewardName && (
                <Text type="danger" className={styles.errorText}>
                  {formik.errors.rewardName}
                </Text>
              )}
            </Form.Item>

            {/* Description */}
            <Form.Item className={styles.formItem}>
              <label className={styles.formLabel}>Description</label>
              <Input.TextArea
                name="rewardDesc"
                value={formik.values.rewardDesc}
                onChange={formik.handleChange}
                className={styles.formInput}
                rows={3}
              />
              {formik.errors.rewardDesc && (
                <Text type="danger" className={styles.errorText}>
                  {formik.errors.rewardDesc}
                </Text>
              )}
            </Form.Item>

            {/* Requirements */}
            <div className={styles.requirementsGrid}>
              <Form.Item className={styles.formItem}>
                <label className={styles.formLabel}>AcceptedAnnouncements</label>
                <Input
                  type="number"
                  name="rewardRequirements.numOfAcceptedAnnouncements"
                  value={formik.values.rewardRequirements.numOfAcceptedAnnouncements}
                  onChange={formik.handleChange}
                  className={styles.formInput}
                  min={0}
                />
              </Form.Item>

              <Form.Item className={styles.formItem}>
                <label className={styles.formLabel}>Completed Activities</label>
                <Input
                  type="number"
                  name="rewardRequirements.numOfCompletedActivities"
                  value={formik.values.rewardRequirements.numOfCompletedActivities}
                  onChange={formik.handleChange}
                  className={styles.formInput}
                  min={0}
                />
              </Form.Item>

              <Form.Item className={styles.formItem}>
                <label className={styles.formLabel}>Completed Polls</label>
                <Input
                  type="number"
                  name="rewardRequirements.numOfCompletedPolls"
                  value={formik.values.rewardRequirements.numOfCompletedPolls}
                  onChange={formik.handleChange}
                  className={styles.formInput}
                  min={0}
                />
              </Form.Item>
            </div>

            {formik.errors.rewardRequirements && (
              <Text type="danger" className={styles.errorText}>
                {typeof formik.errors.rewardRequirements === 'string' 
                  ? formik.errors.rewardRequirements
                  : Object.values(formik.errors.rewardRequirements).map((error, index) => (
                      <div key={index}>{error}</div>
                    ))
                }
              </Text>
            )}

            {/* Expiry Date */}
            <Form.Item className={styles.formItem}>
              <label className={styles.formLabel}>Expiry Date</label>
              <DatePicker
                name="ExpiryDate"
                value={formik.values.ExpiryDate}
                onChange={date => formik.setFieldValue('ExpiryDate', date)}
                className={styles.formInput}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
              {formik.errors.ExpiryDate && (
                <Text type="danger" className={styles.errorText}>
                  {formik.errors.ExpiryDate}
                </Text>
              )}
            </Form.Item>

            {/* Reward Value */}
            <Form.Item className={styles.formItem}>
              <label className={styles.formLabel}>Reward Value</label>
              <Input
                name="rewardValue"
                value={formik.values.rewardValue}
                onChange={formik.handleChange}
                className={styles.formInput}
              />
              {formik.errors.rewardValue && (
                <Text type="danger" className={styles.errorText}>
                  {formik.errors.rewardValue}
                </Text>
              )}
            </Form.Item>

            {/* Form Actions */}
            <div className={styles.formActions}>
              <Button 
                onClick={() => setModalVisible(false)} 
                className={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                htmlType="submit"
                className={styles.submitButton}
                loading={loading}
              >
                {editingReward ? 'Update Reward' : 'Create Reward'}
              </Button>
            </div>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
}