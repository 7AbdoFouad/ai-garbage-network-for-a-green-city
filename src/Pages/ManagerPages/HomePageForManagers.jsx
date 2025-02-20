import React, { useState, useEffect } from "react";
import { object, string ,date} from "yup";
import { useFormik } from "formik";
// import useUser from "../hocks/useUser";
import { MdDelete, MdEdit } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";


const HomePageForManagers = () => {

    return (
        <div>
            <h1>HomePageForManagers</h1>
        </div>
    );
}

export default HomePageForManagers;