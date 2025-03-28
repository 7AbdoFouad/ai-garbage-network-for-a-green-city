import React, { useState } from "react";
import styles from "./PollPopup.module.css"; // Using the same styles as PollPopup
import useUser from "../../hooks/useUser";
import PropTypes from "prop-types";
import { object, string } from "yup";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "react-toastify"; // Assuming you have a toast library for notifications

// ✅ Validation Schema
const schema = object().shape({
  bankAccount: string()
  .required("رقم الحساب البنكي مطلوب")
  .matches(/^[A-Za-z0-9]{29}$/, "يجب أن يتكون رقم الحساب من 29 حرفًا أو رقمًا.")
});

export default function RewordPopUp({
  selectedReward,
  user,
  setAvailableRewards,
  availableRewards,
  onClose,
}) {
  const { addUsersSignedUpForReward,updateUser } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const {id}=useParams();

  const formik = useFormik({
    initialValues: { bankAccount: "" },
    validationSchema: schema,
    onSubmit: async (values) => {
        if (!selectedReward || !user) return;
        setSubmitting(true);
      
        const payload = {
          name: user.name,
          email: user.email,
          rewardName: selectedReward.rewardName,
          userId: user.id,
          BankAccountNumber: values.bankAccount,
        };
      
        try {
          await addUsersSignedUpForReward(payload);
      
          // Update user counts based on the claimed reward
          const req = selectedReward.rewardRequirements;
          const updatedUser = {
            ...user,
            numOfAcceptedAnnouncementsCount: user.numOfAcceptedAnnouncementsCount - (req.numOfAcceptedAnnouncements || 0),
            numOfCompletedActivitiesCount: user.numOfCompletedActivitiesCount - (req.numOfCompletedActivities || 0),
            numOfCompletedPollsCount: user.numOfCompletedPollsCount - (req.numOfCompletedPolls || 0),
          };
      
          await updateUser(user.id, updatedUser);
      
          // Remove the claimed reward from the list
          setAvailableRewards(
            availableRewards.filter((r) => r.rewardName !== selectedReward.rewardName)
          );
      
        } catch (error) {
          console.error("Error updating user:", error);
          alert("حدث خطأ أثناء تحديث الحساب. حاول مرة أخرى."); // Display user-friendly error
        }
      
        setSubmitting(false);
        toast.success(
          ` تم الحصول على  "${selectedReward.rewardName}" بنجاح!
          , و سيتم تحويل المبلغ لرقم الحساب قريبا
          `);
        onClose(); // Close the modal properly
      }
      ,
  });

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>🎁 أدخل رقم الحساب البنكي</h3>
        <form onSubmit={formik.handleSubmit}>
          <input
            type="text"
            className={styles.inputField}
            placeholder="رقم الحساب البنكي"
            {...formik.getFieldProps("bankAccount")}
          />
          {formik.touched.bankAccount && formik.errors.bankAccount && (
            <p className={styles.errorText}>{formik.errors.bankAccount}</p>
          )}
          <div className={styles.modalButtons}>
            <button type="submit" className={styles.submitButton} disabled={submitting}>
              {submitting ? "⏳ جاري الإرسال..." : "✅ إرسال"}
            </button>
            <button type="button" className={styles.closeButton} onClick={onClose}>
              ❌ إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

RewordPopUp.propTypes = {
  selectedReward: PropTypes.shape({
    rewardName: PropTypes.string.isRequired,
    rewardRequirements: PropTypes.shape({
      numOfAcceptedAnnouncements: PropTypes.number,
      numOfCompletedActivities: PropTypes.number,
      numOfCompletedPolls: PropTypes.number,
    }).isRequired,
  }).isRequired,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    numOfAcceptedAnnouncementsCount: PropTypes.number.isRequired,
    numOfCompletedActivitiesCount: PropTypes.number.isRequired,
    numOfCompletedPollsCount: PropTypes.number.isRequired,
  }).isRequired,
  setUser: PropTypes.func.isRequired,
  setAvailableRewards: PropTypes.func.isRequired,
  availableRewards: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
};
