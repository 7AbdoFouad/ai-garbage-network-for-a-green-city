import React from 'react'
import useUser from "../../hooks/useUser";

export default function ManageAnnouncement() {
   const { usersAnnouncements,contactUs,deleteUsersAnnouncements } = useUser();
   /*
    usersAnnouncements has multiple objects with the following structure:
   {
      "id": "1",
      "userName": "Mohamed gamal",
      "email": "Hb6mW@example.com",
      "AnnouncementType": "damaged bin",
      "AnnouncementDescription": "the bin is damaged",
      "region": "Al-Qantra Garb",
      "binNumber": "1",
      "siteLocation": "in front of the mosque in street shehab",
      "todayDate": "2021-07-01",
      "photoFile": "bin1.jpg",
      "userId": "1"
    }
      --------------------
    contactUs has multiple objects with the following structure:

     {
      "id": "1",
      "name": "yassser mohamed",
      "email": "rszfk@example.com",
      "Message": "i suggest to add bin in El-Mahalla El-Kubra",
      "todayDate": "2021-07-01",
      "userId": "1"
    }
   */
  return (
    <div>ManageAnnouncement</div>
  )
}
