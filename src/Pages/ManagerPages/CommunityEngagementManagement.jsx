import React from 'react'
import useUser from "../../hooks/useUser";

export default function CommunityEngagementManagement() {
  const { CommunityActivities, addCommunityActivity,
    deleteCommunityActivity,
    fetchCommunityActivity,
    updateCommunityActivity,
    SubscribersOfCommunityActivities } = useUser();

    /*
    CommunityActivities has multiple objects with the following structure:
     {
      "id": "1",
      "ActName": "ورشة إعادة التدوير المنزلي",
      "ActDescription": "ورشة عمل لتعليم الأطفال كيفية إعادة تدوير النفايات المنزلية",
      "actIntervalDate": "2025-04-22 - 2025-04-30",
      "actstate": "متاحة",
      "imgFile":""
      "NumOfSubscribers": 10,
      "NumOfRequiredSubscribers": 40
    }
    ----------------
    SubscribersOfCommunityActivities has multiple objects with the following structure:
       {
      "id": "8c70",
      "userId": "100303883084526901084",
      "name": "عبدالرحمن محمد فواد محمد",
      "email": "bdalrhmnfwad15@gmail.com",
      "ActivityName": "ورشة إعادة التدوير المنزلي",
      "ActivityId": "1"
    }
    */
  return (
    <div>CommunityEngagementManagement</div>
  )
}
