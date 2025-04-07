import React, { useEffect, useState } from "react";
import useUser from "../../hooks/useUser";
import styles from "./PollsPage.module.css";
import PollPopup from "./PollPopup";
import { useParams } from "react-router-dom";

export default function PollsPage() {
  const { id } = useParams();
  const { Polls, fetchUser, updateUser, addSubscribersOfPoll, SubscribersOfPolls } = useUser(); 
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [user, setUser] = useState(null);
  const [filteredPolls, setFilteredPolls] = useState([]);



  useEffect(() => {
    const fetchUserData = async () => {
      const res = await fetchUser(id);
      if (res) {
        setUser(res);
      }
    };
    fetchUserData();
  }, [id]);

  useEffect(() => {
    // تصفية الاستطلاعات بحيث لا تظهر الاستطلاعات التي قام المستخدم بالتصويت فيها
    if (user) {
      const userPolls = SubscribersOfPolls
        .filter((sub) => sub.userId === user.id)
        .map((sub) => sub.pollId);

      setFilteredPolls(Polls.filter((poll) => !userPolls.includes(poll.id)));
    }
  }, [Polls, SubscribersOfPolls, user]);

  const handlePollSubmit = (poll) => {
    setSelectedPoll(null);

    if (user) {
      // تحديث قائمة المشاركين في الاستطلاع
      const newSubscriber = {
        id: `${user.id}-${poll.id}`, // تحديد ID فريد بناءً على المستخدم والاستطلاع
        userId: user.id,
        name: user.name,
        email: user.email,
        pollName: poll.pollName,
        pollId: poll.id,
      };

      addSubscribersOfPoll(newSubscriber); // ✅ إضافة المستخدم إلى SubscribersOfPolls

      // تحديث حالة المستخدم
      const updatedUser = {
        ...user,
        numOfCompletedPollsCount: user.numOfCompletedPollsCount + 1,
      };
      setUser(updatedUser);
      updateUser(user.id, updatedUser);

      // تحديث القائمة بحيث لا يظهر الاستطلاع الذي تم التصويت عليه
      setFilteredPolls((prevPolls) => prevPolls.filter((p) => p.id !== poll.id));
    }
  };

  return (
    
    <div className={styles.container}>
      <h2>🗳 Opinion polls 🗳</h2>

      {filteredPolls.length === 0 ? (
        <p className={styles.noPollsMessage}>There are no surveys currently available</p>
      ) : (
        <div className={styles.pollGrid}>
          {filteredPolls.map((poll, index) => (
            <div key={poll.id} className={styles.pollCard}>
              <img
                src={poll.imgFile}
                alt={poll.pollName}
                className={styles.pollImage}
              />
              <div className={styles.pollContent}>
                <h3 className={styles.pollTitle}>{poll.pollName}</h3>
                <p className={styles.pollDescription}>{poll.pollDesc}</p>
                <p className={styles.pollDate}>
                  🗓 <strong>Survey end date:</strong> {poll.pollEndDate}
                </p>
                <button
                  className={styles.pollButton}
                  onClick={() => setSelectedPoll(poll)}
                >
                  🎯 Poll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPoll && (
        <PollPopup poll={selectedPoll} closePopup={() => setSelectedPoll(null)} onSubmit={() => handlePollSubmit(selectedPoll)} />
      )}
</div>
);
}
