import React, { useState, useEffect } from 'react';
import { Card, Button, ProgressBar, Alert } from 'react-bootstrap';
import axios from 'axios';
import styles from './DriverPolls.module.css';

const DriverPollsPage = ({ driverId }) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await axios.get(`/api/drivers/${driverId}/polls`);
        setPolls(response.data);
        // تهيئة الخيارات المحددة
        const initialSelections = {};
        response.data.forEach(poll => {
          initialSelections[poll.id] = null;
        });
        setSelectedOptions(initialSelections);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch polls');
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, [driverId]);

  const handleVote = async (pollId) => {
    if (!selectedOptions[pollId]) {
      alert('Please select an option before voting');
      return;
    }

    try {
      await axios.post(`/api/polls/${pollId}/vote`, {
        optionId: selectedOptions[pollId],
        driverId
      });
      
      // تحديث النتائج بدون إعادة جلب كل البيانات
      setPolls(polls.map(poll => {
        if (poll.id === pollId) {
          return {
            ...poll,
            options: poll.options.map(option => {
              if (option.id === selectedOptions[pollId]) {
                return { ...option, votes: option.votes + 1 };
              }
              return option;
            }),
            hasVoted: true
          };
        }
        return poll;
      }));
      
      alert('Thank you for your vote!');
    } catch (err) {
      alert('Failed to submit vote. Please try again.');
    }
  };

  const handleOptionSelect = (pollId, optionId) => {
    setSelectedOptions({
      ...selectedOptions,
      [pollId]: optionId
    });
  };

  if (loading) return <div className={styles.loading}>Loading polls...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (polls.length === 0) return <Alert variant="info">No active polls available.</Alert>;

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>📊 Driver Polls</h2>
      <p className={styles.subHeader}>Share your opinion on important topics</p>
      
      {polls.map(poll => (
        <Card key={poll.id} className={styles.pollCard}>
          <Card.Body>
            <Card.Title>{poll.question}</Card.Title>
            <Card.Text className="text-muted">
              {poll.description}
            </Card.Text>
            
            {poll.hasVoted ? (
              <div className={styles.results}>
                <h5>Results:</h5>
                {poll.options.map(option => (
                  <div key={option.id} className={styles.resultItem}>
                    <div className={styles.optionInfo}>
                      <span>{option.text}</span>
                      <span>{option.votes} votes ({(option.votes / poll.totalVotes * 100).toFixed(1)}%)</span>
                    </div>
                    <ProgressBar 
                      now={option.votes / poll.totalVotes * 100} 
                      label={`${(option.votes / poll.totalVotes * 100).toFixed(1)}%`}
                    />
                  </div>
                ))}
                <div className={styles.totalVotes}>Total votes: {poll.totalVotes}</div>
              </div>
            ) : (
              <div className={styles.options}>
                {poll.options.map(option => (
                  <div 
                    key={option.id} 
                    className={`${styles.option} ${selectedOptions[poll.id] === option.id ? styles.selected : ''}`}
                    onClick={() => handleOptionSelect(poll.id, option.id)}
                  >
                    {option.text}
                  </div>
                ))}
                <Button 
                  variant="primary" 
                  className={styles.voteButton}
                  onClick={() => handleVote(poll.id)}
                >
                  Submit Vote
                </Button>
              </div>
            )}
          </Card.Body>
          <Card.Footer className="text-muted">
            Created on: {new Date(poll.createdAt).toLocaleDateString()}
          </Card.Footer>
        </Card>
      ))}
    </div>
  );
};

export default DriverPollsPage;