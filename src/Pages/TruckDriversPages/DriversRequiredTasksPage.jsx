import React from "react";
import useUser from "../../hooks/useUser";

/*
  "Available_UsersAnnouncements_Tasks": [
    {
      "id": "1",
      "requestId": "1747190988244"
    },
    {
      "id": "fa44",
      "requestId": "b9fd"
    }
  ]
 _______________________________
 "UsersAnnouncements": [
    {
      "id": "b9fd",
      "userName": "ramy",
      "email": "ghghg5@jhjh.com",
      "AnnouncementType": "Damaged Bin",
      "AnnouncementDescription": "Minor scratches on the bin surface. Still functional but could be improved",
      "region": "Al-Qantra Garb",
      "binNumber": "2",
      "siteLocation": "behind the supermarket in street El-Gamal",
      "todayDate": "2025-03-08",
      "photoFile":"",
      "userId": "2188"
    }
      ________________________
      "Acceptted_Users_And_SpecialOrder": [
    {
      "id": "1",
      "requestId": "1747190988244",
      "Type": "1"
    },
    {
      "id": "c266",
      "requestId": "1747423693884",
      "Type": "1"
    }
  ]  
*/
export default function DriversAvailableTasks() {
  const {
    Acceptted_Users_And_SpecialOrder,
    
  } = useUser();

  return <div>DriversAvailableTasks</div>;
}
