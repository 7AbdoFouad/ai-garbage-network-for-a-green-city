import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./FAQ.css";
import faqImage from "./3.jpg"; // Make sure the image exists in the same directory

const faqs = [
  {
    question: "How can I report an issue?",
    answer: "You can report an issue through the CleanCity app or website.",
  },
  {
    question: "What are the waste collection schedules?",
    answer: "The schedules are determined based on your specific area.",
  },
  {
    question: "How can I improve recycling?",
    answer: "You can separate waste by type to enhance recycling efficiency.",
  },
  {
    question: "Why might a report be rejected?",
    answer: (
      <ul>
        <li><strong>No actual issue:</strong> The problem was resolved or never existed.</li>
        <li><strong>Insufficient details:</strong> The report lacks necessary information like exact location or description.</li>
        <li><strong>Incorrect report:</strong> False or misleading information.</li>
        <li><strong>Duplicate reports:</strong> Multiple reports of the same issue.</li>
        <li><strong>Resource priority:</strong> Limited resources, delaying issue resolution.</li>
      </ul>
    ),
  },
  {
    question: "How are bin locations and collection frequency determined?",
    answer:
      "Bin locations are adjusted based on field studies, waste generation rates, and community feedback. Collection frequency is optimized based on demand in different areas.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-section">
      <div className="faq-container">
        {/* Left: FAQ Content */}
        <div className="faq-content">
          <h2 className="title">📖 Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${openIndex === index ? "active" : ""}`}
              >
                <div className="faq-question" onClick={() => toggleFAQ(index)}>
                  <h5>{faq.question}</h5>
                  {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                <div
                  className="faq-answer"
                  style={{
                    maxHeight: openIndex === index ? "250px" : "0px",
                    padding: openIndex === index ? "10px" : "0px",
                  }}
                >
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Fixed Image */}
        <div className="faq-image">
          <img src={faqImage} alt="FAQ Illustration" />
        </div>
      </div>
    </div>
  );
}
