import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import styles from "./EditDriverAnnouncementModal.module.css";

const EditDriverAnnouncementModal = ({
  show,
  onHide,
  onSave,
  announcement,
  regions,
  filteredBins,
}) => {
  const formik = useFormik({
    initialValues: {
      collectionStatus: announcement?.collectionStatus || "",
      notes: announcement?.notes || "",
      binNumber: announcement?.binNumber || "",
      region: announcement?.region || "",
    },
    onSubmit: async (values) => {
      try {
        await onSave(values);
      } catch (error) {
        toast.error("Failed to update collection record");
        console.error(error);
      }
    },
  });

  return (
    <Modal show={show} onHide={onHide} centered className={styles.modal}>
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title>Edit Collection Record</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={formik.handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Collection Status</Form.Label>
            <Form.Select
              name="collectionStatus"
              value={formik.values.collectionStatus}
              onChange={formik.handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Missed">Missed</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Region</Form.Label>
            <Form.Select
              name="region"
              value={formik.values.region}
              onChange={formik.handleChange}
            >
              <option value="">Select region</option>
              {regions.map((region) => (
                <option key={region.id} value={region.regionName}>
                  {region.regionName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Bin Number</Form.Label>
            <Form.Select
              name="binNumber"
              value={formik.values.binNumber}
              onChange={formik.handleChange}
              disabled={!formik.values.region}
            >
              <option value="">Select bin number</option>
              {filteredBins.map((bin) => (
                <option key={bin.binNumber} value={bin.binNumber}>
                  {bin.binNumber}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={formik.values.notes}
              onChange={formik.handleChange}
              placeholder="Add any additional notes"
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button
              variant="secondary"
              onClick={onHide}
              className={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className={styles.saveButton}
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditDriverAnnouncementModal;