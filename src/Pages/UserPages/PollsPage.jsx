// import React, { useEffect, useState } from "react";
// import useUser from "../../hooks/useUser";
// import styles from "./PollsPage.module.css";
// import PollPopup from "./PollPopup";
// import { useParams } from "react-router-dom";

// export default function PollsPage() {
//   const { id } = useParams();
//   const { Polls, fetchUser, updateUser, addSubscribersOfPoll, SubscribersOfPolls } = useUser(); 
//   const [selectedPoll, setSelectedPoll] = useState(null);
//   const [user, setUser] = useState(null);
//   const [filteredPolls, setFilteredPolls] = useState([]);
//   const [PollsPage, setPollsPage] = useState(
//     parseInt(sessionStorage.getItem("PollsPage")) || 1
//   );
//   const itemsPerPage = 6;
//   const paginatedPolls = filteredPolls.slice(
//     (PollsPage - 1) * itemsPerPage,
//     PollsPage * itemsPerPage
//   );
//   const totalPollsPages = Math.ceil(filteredPolls.length / itemsPerPage);

//   const handlePollsPageChange = (page) => {
//     setPollsPage(page);
//     sessionStorage.setItem("PollsPage", page);
//   };

//   useEffect(() => {
//     const fetchUserData = async () => {
//       const res = await fetchUser(id);
//       if (res) {
//         setUser(res);
//       }
//     };
//     fetchUserData();
//   }, [id, fetchUser]);

//   useEffect(() => {
//     if (user) {
//       // Get polls the user already participated in
//       const userPolls = SubscribersOfPolls
//         .filter((sub) => sub.userId === user.id)
//         .map((sub) => sub.pollId);

//       // Set today's date with time zeroed out for accurate comparison
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);

//       // Only include polls the user hasn't participated in and where poll end date is in the past.
//       const availablePolls = Polls.filter((poll) => {
//         // Convert poll end date string to a Date object.
//         const pollEndDate = new Date(poll.pollEndDate);
//         return (
//           !userPolls.includes(poll.id) &&
//           pollEndDate > today // Hide polls if end date is >= today.
//         );
//       });

//       setFilteredPolls(availablePolls);
//     }
//   }, [Polls, SubscribersOfPolls, user]);

//   const handlePollSubmit = (poll) => {
//     setSelectedPoll(null);

//     if (user) {
//       const newSubscriber = {
//         id: `${user.id}-${poll.id}`,
//         userId: user.id,
//         name: user.name,
//         email: user.email,
//         pollName: poll.pollName,
//         pollId: poll.id,
//       };

//       addSubscribersOfPoll(newSubscriber);

//       const updatedUser = {
//         ...user,
//         numOfCompletedPollsCount: user.numOfCompletedPollsCount + 1,
//       };
//       setUser(updatedUser);
//       updateUser(user.id, updatedUser);

//       setFilteredPolls((prevPolls) => prevPolls.filter((p) => p.id !== poll.id));
//     }
//   };

//   return (
//     <div className={styles.maincont}>
//       <div className={styles.container}>
//         <h2 className={styles.title}>🗳 Opinion Polls</h2>

//         {filteredPolls.length === 0 ? (
//           <p className={styles.noPollsMessage}>There are no surveys currently available</p>
//         ) : (
//           <div className={styles.pollsGrid}>
//             {paginatedPolls.map((poll) => (
//               <div key={poll.id} className={styles.pollCard}>
//                 <img
//                   src={poll.imgFile}
//                   alt={poll.pollName}
//                   className={styles.pollImage}
//                 />
//                 <div className={styles.pollContent}>
//                   <h3 className={styles.pollTitle}>{poll.pollName}</h3>
//                   <p className={styles.pollDescription}>{poll.pollDesc}</p>
//                   <p className={styles.pollDate}>
//                     <strong>Survey end date:</strong> {poll.pollEndDate}
//                   </p>
//                   <button
//                     className={styles.pollButton}
//                     onClick={() => setSelectedPoll(poll)}
//                   >
//                     🎯 Poll Now
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//         {totalPollsPages > 1 && (
//           <div className={styles.pagination}>
//             {Array.from({ length: totalPollsPages }, (_, i) => (
//               <button
//                 key={i}
//                 onClick={() => handlePollsPageChange(i + 1)}
//                 className={
//                   PollsPage === i + 1 ? styles.activePage : styles.pageButton
//                 }
//               >
//                 {i + 1}
//               </button>
//             ))}
//           </div>
//         )}

//         {selectedPoll && (
//           <PollPopup 
//             poll={selectedPoll} 
//             closePopup={() => setSelectedPoll(null)} 
//             onSubmit={() => handlePollSubmit(selectedPoll)} 
//           />
//         )}
//       </div>

//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import styles from "./PollsPage.module.css";
import PollPopup from "./PollPopup";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

export default function PollsPage() {
  const { id } = useParams(); // user id or role-based if needed
  const [polls, setPolls] = useState([]);
  const [subscribedPolls, setSubscribedPolls] = useState([]);
  const [filteredPolls, setFilteredPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [page, setPage] = useState(
    parseInt(sessionStorage.getItem("pollsPage")) || 1
  );
  const itemsPerPage = 6;
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  console.log(cookies.token);
  

  // fetch all polls
  useEffect(() => {
    async function loadPolls() {
      try {
        const res = await fetch(
          "/api/Polls",
          { 
      method: "GET",
            headers: {
                "Authorization": `Bearer ${cookies.token}`,
                "Content-Type": "application/json"
            }
        }
        );
        const data = await res.json();
        setPolls(data);
      } catch (err) {
        console.error("Failed to load polls:", err);
      }
    }
    loadPolls();
  }, []);

  // fetch user subscribed polls
  useEffect(() => {
    async function loadSubscribed() {
      try {
        const res = await fetch(
          "/api/Polls/subscribed",
          { headers: { 
             "Authorization": `Bearer ${cookies.token}`,
            'Content-Type': 'application/json' } }
        );
        const data = await res.json();
        setSubscribedPolls(data.map(p => p.id));
      } catch (err) {
        console.error("Failed to load subscribed polls:", err);
      }
    }
    loadSubscribed();
  }, []);

  // filter available polls
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const available = polls.filter(p => {
      const end = new Date(p.pollEndDate);
      return end > today && !subscribedPolls.includes(p.id);
    });

    setFilteredPolls(available);
  }, [polls, subscribedPolls]);

  // pagination
  const totalPages = Math.ceil(filteredPolls.length / itemsPerPage);
  const paginated = filteredPolls.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (num) => {
    setPage(num);
    sessionStorage.setItem("pollsPage", num);
  };

  const handleSubscribe = async (pollId) => {
    try {
      const res = await fetch(
        `/api/Polls/${pollId}/subscribe`,
        { method: 'POST'
          , headers: { 
             "Authorization": `Bearer ${cookies.token}`,
            'Content-Type': 'application/json' }
         }

      );
      if (!res.ok) throw new Error('Subscription failed');
      // update state
      setSubscribedPolls(prev => [...prev, pollId]);
      setFilteredPolls(prev => prev.filter(p => p.id !== pollId));
      setSelectedPoll(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.maincont}>
      <div className={styles.container}>
        <h2 className={styles.title}>🗳 Opinion Polls</h2>

        {paginated.length === 0 ? (
          <p className={styles.noPollsMessage}>
            There are no surveys currently available
          </p>
        ) : (
          <div className={styles.pollsGrid}>
            {paginated.map(poll => (
              <div key={poll.id} className={styles.pollCard}>
                <img
                  src={poll.photo || poll.imgFile}
                  alt={poll.pollName}
                  className={styles.pollImage}
                />
                <div className={styles.pollContent}>
                  <h3 className={styles.pollTitle}>{poll.pollName}</h3>
                  <p className={styles.pollDescription}>
                    {poll.pollDesc}
                  </p>
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

        {totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={
                  page === i + 1 ? styles.activePage : styles.pageButton
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
            onSubmit={() => handleSubscribe(selectedPoll.id)}
          />
        )}
      </div>
    </div>
  );
}