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
  const [PollsPage, setPollsPage] = useState(
    parseInt(sessionStorage.getItem("PollsPage")) || 1
  );
  const itemsPerPage = 6;
  const paginatedPolls = filteredPolls.slice(
    (PollsPage - 1) * itemsPerPage,
    PollsPage * itemsPerPage
  );
  const totalPollsPages = Math.ceil(filteredPolls.length / itemsPerPage);

  const handlePollsPageChange = (page) => {
    setPollsPage(page);
    sessionStorage.setItem("PollsPage", page);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const res = await fetchUser(id);
      if (res) {
        setUser(res);
      }
    };
    fetchUserData();
  }, [id, fetchUser]);

  useEffect(() => {
    if (user) {
      // Get polls the user already participated in
      const userPolls = SubscribersOfPolls
        .filter((sub) => sub.userId === user.id)
        .map((sub) => sub.pollId);

      // Set today's date with time zeroed out for accurate comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Only include polls the user hasn't participated in and where poll end date is in the past.
      const availablePolls = Polls.filter((poll) => {
        // Convert poll end date string to a Date object.
        const pollEndDate = new Date(poll.pollEndDate);
        return (
          !userPolls.includes(poll.id) &&
          pollEndDate > today // Hide polls if end date is >= today.
        );
      });

      setFilteredPolls(availablePolls);
    }
  }, [Polls, SubscribersOfPolls, user]);

  const handlePollSubmit = (poll) => {
    setSelectedPoll(null);

    if (user) {
      const newSubscriber = {
        id: `${user.id}-${poll.id}`,
        userId: user.id,
        name: user.name,
        email: user.email,
        pollName: poll.pollName,
        pollId: poll.id,
      };

      addSubscribersOfPoll(newSubscriber);

      const updatedUser = {
        ...user,
        numOfCompletedPollsCount: user.numOfCompletedPollsCount + 1,
      };
      setUser(updatedUser);
      updateUser(user.id, updatedUser);

      setFilteredPolls((prevPolls) => prevPolls.filter((p) => p.id !== poll.id));
    }
  };

  return (
    <div className={styles.maincont}>
      <div className={styles.container}>
        <h2 className={styles.title}>🗳 Opinion Polls</h2>

        {filteredPolls.length === 0 ? (
          <p className={styles.noPollsMessage}>There are no surveys currently available</p>
        ) : (
          <div className={styles.pollsGrid}>
            {paginatedPolls.map((poll) => (
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
                    <strong>Survey end date:</strong> {poll.pollEndDate}
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
        {totalPollsPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPollsPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePollsPageChange(i + 1)}
                className={
                  PollsPage === i + 1 ? styles.activePage : styles.pageButton
                }
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {selectedPoll && (
          <PollPopup 
            poll={selectedPoll} 
            closePopup={() => setSelectedPoll(null)} 
            onSubmit={() => handlePollSubmit(selectedPoll)} 
          />
        )}
      </div>

    </div>
  );
}
