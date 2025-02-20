// useAuth.js
import { useContext } from "react";
import {AuthContext} from "../Components/AuthContext";

// Custom hook for accessing AuthContext
export default function useAuth() {
  return useContext(AuthContext);
}
