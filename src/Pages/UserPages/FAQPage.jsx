import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';

const faqs = [
  { question: "How can I report an issue?", answer: "You can use the app or the official website to report issues." },
  { question: "What are the waste collection schedules?", answer: "Schedules vary by area. You can check the schedule via the app or website." },
  { question: "How can I improve recycling?", answer: "It is recommended to separate waste by type, such as plastic, paper, and metals, to ensure better recycling." },
  { question: "What are the reasons for report rejection?", answer: "A report may be rejected for the following reasons:\n - No actual issue\n - Lack of information\n - Incorrect or misleading report\n - Duplicate reports\n - Report prioritization" },
  { question: "What factors affect the placement of waste bins?", answer: "The need to modify waste bin locations is determined based on waste density, population, and general cleanliness requirements." }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center ">Frequently Asked Questions</h1>
      <div className="accordion" id="faqAccordion">
        {faqs.map((faq, index) => (
          <div key={index} className="accordion-item mb-3">
            <h2 className="accordion-header" id={`heading${index}`}>
              <button
                className="accordion-button collapsed text-success"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse${index}`}
                aria-expanded="false"
                aria-controls={`collapse${index}`}
                onClick={() => toggleFAQ(index)}
              >
                {faq.question}
              </button>
            </h2>
            <div
              id={`collapse${index}`}
              className={`accordion-collapse collapse ${openIndex === index ? 'show' : ''}`}
              aria-labelledby={`heading${index}`}
              data-bs-parent="#faqAccordion"
            >
              <div className="accordion-body">
                {faq.answer.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}