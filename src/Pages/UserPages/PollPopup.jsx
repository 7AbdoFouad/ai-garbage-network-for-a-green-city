import React from "react";
import PropTypes from "prop-types";
import styles from "./PollPopup.module.css";
import FormfacadeEmbed from "@formfacade/embed-react";


export default function PollPopup({ poll, closePopup, onSubmit }) {
  return (
    <div className={styles.overlay} onClick={closePopup}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>📋 {poll.pollName}</h3>
        <p className={styles.description}>{poll.pollDesc}</p>

        <div className={styles.pollIframeContainer}>
        <FormfacadeEmbed
  formFacadeURL={poll.pollFormLink}
  onSubmitForm={onSubmit}
/>



</div>


        {/* <button className={styles.closeButton} onClick={closePopup}>❌ إغلاق</button> */}
      </div>
    </div>
  );
}

PollPopup.propTypes = {
  poll: PropTypes.object.isRequired,
  closePopup: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
