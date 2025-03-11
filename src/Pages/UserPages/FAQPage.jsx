import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import styles from "./FAQ.module.css"; // Import CSS module
import faqImage from "./faq3.jpg"; // Ensure the image exists in the correct directory

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
    <div className={styles.faqSection}>
      <div className={styles.faqContainer}>
        {/* Left: FAQ Content */}
        <div className={styles.faqContent}>
          <h2 className={styles.title}>📖 Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`${styles.faqItem} ${openIndex === index ? styles.faqItemActive : ""}`}
              >
                <div className={styles.faqQuestion} onClick={() => toggleFAQ(index)}>
                  <h5>{faq.question}</h5>
                  {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                <div
                  className={styles.faqAnswer}
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
        <div className={styles.faqImage}>
          <img src={faqImage} alt="FAQ Illustration" />
        </div>
      </div>
    </div>
  );
}
