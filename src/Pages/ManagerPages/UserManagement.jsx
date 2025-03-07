import React from 'react'
import useUser from "../../hooks/useUser";

export default function UserManagement() {
  const { users, managers,truckDrivers } = useUser();

  // user data
  // name | email  | phone | password | Address

  // manager data
  // name | email  | phone | password | Address | Permissions


  // truck driver data
  // name | email  | phone | password | Address | truckNumber


  return (
    <div>UserManagement</div>
  )
}
