import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiTrash2, FiCalendar, FiClock, FiDollarSign, FiUser, FiHome, FiPhone, FiFileText, FiCreditCard   } from 'react-icons/fi';
import { FaPoundSign } from 'react-icons/fa';
const WasteRequestApp = () => {
  const [formData, setFormData] = useState({
    userName: '',
    institutionName: '',
    institutionType: '',
    contactNumber: '',
    institutionAddress: '',
    additionalNotes: '',
    subscriptionType: '',
    startDate: '',
    startTime: '',
    subscriptionDuration: '',
    paymentMethod: '',
    price: ''
  });

  const [loading, setLoading] = useState(false);

  const getToken = () => Cookies.get('token');

  const subscriptionOptions = {
    "1 - On time ": { key: "On time", price: 700 },
    "2 - Daily   ": { key: "Daily", price: 12000 },
    "3 - Weekly  ": { key: "Weekly", price: 2500 },
    "4 - Monthly ": { key: "Monthly", price: 700 },
  };

  const durationMultipliers = {
    "Monthly": 1,
    "3 monthly": 3,
    "6 monthly": 6,
    "12 monthly": 12,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      let selectedType = prev.subscriptionType;
      let selectedDuration = prev.subscriptionDuration;

      if (name === "subscriptionType") {
        selectedType = value;
      }
      if (name === "subscriptionDuration") {
        selectedDuration = value;
      }

      // استخراج النوع الحقيقى من الاسم المعروض
      const typeKey = subscriptionOptions[selectedType]?.key;

      if (typeKey === "On time") {
        updated.subscriptionDuration = ""; // نخليها فاضية
        updated.price = subscriptionOptions[selectedType]?.price.toString();
      } else if (typeKey && selectedDuration) {
        const basePrice = subscriptionOptions[selectedType]?.price || 0;
        const multiplier = durationMultipliers[selectedDuration] || 1;
        updated.price = (basePrice * multiplier).toString();
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = getToken();

    try {
      const reqData = new FormData();
      const finalData = {
        ...formData,
        subscriptionDuration:
          subscriptionOptions[formData.subscriptionType]?.key === "On time"
            ? '1 day'
            : formData.subscriptionDuration,
        subscriptionType: subscriptionOptions[formData.subscriptionType]?.key || ""
      };

      Object.entries(finalData).forEach(([key, val]) =>
        reqData.append(key, val)
      );

      const res = await axios.post(
        'https://greencityapi.runasp.net/api/PaidUserAnnouncements',
        reqData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.status === 200 || res.status === 201) {
        toast.success('✅ Waste request submitted successfully!');
        setFormData({
          userName: '',
          institutionName: '',
          institutionType: '',
          contactNumber: '',
          institutionAddress: '',
          additionalNotes: '',
          subscriptionType: '',
          startDate: '',
          startTime: '',
          subscriptionDuration: '',
          paymentMethod: '',
          price: ''
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('❌ Error submitting waste request');
    } finally {
      setLoading(false);
    }
  };

  const renderLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

  const getIconForField = (key) => {
    switch(key) {
      case 'userName': return <FiUser className="input-icon" />;
      case 'institutionName': return <FiHome className="input-icon" />;
      case 'contactNumber': return <FiPhone className="input-icon" />;
      case 'institutionAddress': return <FiHome className="input-icon" />;
      case 'additionalNotes': return <FiFileText className="input-icon" />;
      case 'startDate': return <FiCalendar className="input-icon" />;
      case 'startTime': return <FiClock className="input-icon" />;
      case 'price': return <FaPoundSign className="input-icon" />;
      case 'paymentMethod': return <FiCreditCard className="input-icon" />;
      default: return <FiTrash2 className="input-icon" />;
    }
  };

  return (
    <div className="waste-request-container">
      <div className="waste-request-header">
        <div className="header-icon">
          <FiTrash2 size={40} />
        </div>
        <h1>Waste Collection Request</h1>
        <p>Help us keep our city clean by scheduling your waste collection</p>
      </div>

      <form onSubmit={handleSubmit} className="waste-request-form">
        <div className="form-grid">
          {/* Personal Information Section */}
          <div className="form-section">
            <h3><FiUser /> Personal Information</h3>
            <div className="input-group">
              {getIconForField('userName')}
              <input
                name="userName"
                value={formData.userName}
                type="text"
                onChange={handleChange}
                placeholder="Your Full Name"
                required
              />
            </div>
            <div className="input-group">
              {getIconForField('contactNumber')}
              <input
                name="contactNumber"
                value={formData.contactNumber}
                type="text"
                onChange={handleChange}
                placeholder="Contact Number"
                required
              />
            </div>
          </div>

          {/* Institution Information Section */}
          <div className="form-section">
            <h3><FiHome /> Institution Information</h3>
            <div className="input-group">
              {getIconForField('institutionName')}
              <input
                name="institutionName"
                value={formData.institutionName}
                type="text"
                onChange={handleChange}
                placeholder="Institution Name"
                required
              />
            </div>
            
            <div className="input-group">
              {getIconForField('institutionType')}
              <select
                name="institutionType"
                value={formData.institutionType}
                onChange={handleChange}
                required
              >
                <option value="">Select Institution Type</option>
                <option value="Hospital">Hospital</option>
                <option value="School">School</option>
                <option value="Factory">Factory</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="input-group">
              {getIconForField('institutionAddress')}
              <input
                name="institutionAddress"
                value={formData.institutionAddress}
                type="text"
                onChange={handleChange}
                placeholder="Institution Address"
                required
              />
            </div>
          </div>

          {/* Collection Details Section */}
          <div className="form-section">
            <h3><FiCalendar /> Collection Details</h3>
            <div className="input-group">
              {getIconForField('startDate')}
              <input
                name="startDate"
                value={formData.startDate}
                type="date"
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="input-group">
              {getIconForField('startTime')}
              <input
                name="startTime"
                value={formData.startTime}
                type="time"
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="input-group">
              {getIconForField('subscriptionType')}
              <select
                name="subscriptionType"
                value={formData.subscriptionType}
                onChange={handleChange}
                required
              >
                <option value="">Select Subscription Type</option>
                {Object.keys(subscriptionOptions).map((label) => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
            </div>
            
            <div className="input-group">
              {getIconForField('subscriptionDuration')}
              <select
                name="subscriptionDuration"
                value={formData.subscriptionDuration}
                onChange={handleChange}
                disabled={subscriptionOptions[formData.subscriptionType]?.key === "On time"}
                required={subscriptionOptions[formData.subscriptionType]?.key !== "On time"}
              >
                <option value="">Select Duration</option>
                <option value="Monthly">Monthly</option>
                <option value="3 monthly">3 monthly</option>
                <option value="6 monthly">6 monthly</option>
                <option value="12 monthly">12 monthly</option>
              </select>
            </div>
          </div>

          {/* Payment Section */}
          <div className="form-section">
            <h3><FiCreditCard /> Payment Information</h3>
            <div className="input-group">
              {getIconForField('paymentMethod')}
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
              >
                <option value="">Select Payment Method</option>
                <option value="Vodafone Cash">Vodafone Cash</option>
                <option value="Cash">Cash</option>
                <option value="Delivery">Delivery</option>
              </select>
            </div>
            
            <div className="input-group">
              {getIconForField('price')}
              <input
                name="price"
                value={formData.price}
                type="text"
                readOnly
                placeholder="Calculated Price"
              />
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="form-section">
          <h3><FiFileText /> Additional Notes</h3>
          <div className="input-group">
            {getIconForField('additionalNotes')}
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              placeholder="Any special instructions or notes about your waste..."
              rows="3"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="submit-button"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Processing...
            </>
          ) : (
            <>
              <FiTrash2 /> Submit Request
            </>
          )}
        </button>
      </form>

      <div className="waste-facts">
        <h3>Did You Know?</h3>
        <ul>
          <li>♻ Recycling one ton of paper saves 17 trees and 7,000 gallons of water</li>
          <li>🌍 Proper waste disposal reduces greenhouse gas emissions by up to 30%</li>
          <li>💧 Organic waste in landfills produces methane, a potent greenhouse gas</li>
          <li>🏙️ Cities that implement proper waste management see 40% less pollution</li>
        </ul>
      </div>

      <style jsx>{`
        .waste-request-container {
          max-width: 1000px;
          margin: 2rem auto;
          padding: 2rem;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .waste-request-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .waste-request-header h1 {
          color: #2c3e50;
          margin: 0.5rem 0;
          font-size: 2.2rem;
        }

        .waste-request-header p {
          color: #7f8c8d;
          margin: 0;
          font-size: 1.1rem;
        }

        .header-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: #27ae60;
          border-radius: 50%;
          color: white;
          margin: 0 auto 1rem;
        }

        .waste-request-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .form-section {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.03);
        }

        .form-section h3 {
          color: #27ae60;
          margin-top: 0;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.2rem;
        }

        .input-group {
          position: relative;
          margin-bottom: 1rem;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #7f8c8d;
        }

        input, select, textarea {
          width: 100%;
          padding: 0.8rem 1rem 0.8rem 2.5rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          background-color: white;
        }

        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #27ae60;
          box-shadow: 0 0 0 2px rgba(39, 174, 96, 0.2);
        }

        input[readonly] {
          background-color: #f0f0f0;
          color: #555;
        }

        textarea {
          min-height: 100px;
          resize: vertical;
        }

        select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 0.7rem center;
          background-size: 1rem;
        }

        .submit-button {
          padding: 1rem;
          background: linear-gradient(135deg, #27ae60, #2ecc71);
          color: white;
          font-weight: bold;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }

        .submit-button:hover {
          background: linear-gradient(135deg, #219653, #27ae60);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
        }

        .submit-button:disabled {
          background: #95a5a6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .waste-facts {
          margin-top: 2rem;
          padding: 1.5rem;
          background: #e8f5e9;
          border-radius: 12px;
          color: #2c3e50;
        }

        .waste-facts h3 {
          margin-top: 0;
          color: #27ae60;
        }

        .waste-facts ul {
          padding-left: 1.2rem;
        }

        .waste-facts li {
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .waste-request-container {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default WasteRequestApp;