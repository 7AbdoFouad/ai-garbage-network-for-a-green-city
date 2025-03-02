import React from 'react';
import useUser from "../../hooks/useUser.jsx";
import './CommunityEngagementPage.css'; // Import CSS for styling
import { div } from '@tensorflow/tfjs';

export default function CommunityEngagementPage() {
  const { CommunityActivities } = useUser();

  return (
    <div className="container">
      <h2 className="text-center my-4">الأنشطة الاجتماعية المتاحة</h2>
      <div className="activities-grid">
        {CommunityActivities.map((activity) => (
          <div key={activity.id} className="activity-card">
            <img src={activity.image || 'placeholder.jpg'} alt={activity.name} className="activity-image" />
            <h3>{activity.name}</h3>
            <p>{activity.description}</p>
            <p><strong>الفترة الزمنية:</strong> {activity.dateRange}</p>
            <p><strong>حالة الفاعلية:</strong> {activity.status}</p>
            <p><strong>عدد المشتركين:</strong> {activity.currentSubscribers} / {activity.requiredSubscribers}</p>
            <button className="btn btn-primary">اشترك في الفاعلية</button>
          </div>
        ))}
       
      </div>
    </div>

  );
}