import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import * as XLSX from "xlsx";
import styles from "./PollResultsPopup.module.css";
import PropTypes from "prop-types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function PollResultsPopup({ poll,  onClose }) {
  // State to store the analysis results from the external Excel file.
  const [excelAnalysis, setExcelAnalysis] = useState(null);
  // Array of questions (column names) extracted from the sheet (except the "طابع زمني" column).
  const [questions, setQuestions] = useState([]);

  // useEffect to fetch and analyze the Excel file using row-based parsing.
  
  useEffect(() => {
    async function fetchAndAnalyzeExcel() {
      try {
        if (poll.excelFileLink) {
          console.log("Fetching Excel file from:", poll.excelFileLink);
          const response = await fetch(poll.excelFileLink);
          if (!response.ok) {
            throw new Error("Failed to fetch the Excel file.");
          }
          const arrayBuffer = await response.arrayBuffer();

          // Convert the array buffer to a binary string
          const binaryStr = new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          );
          // Parse the workbook
          const workbook = XLSX.read(binaryStr, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Parse the sheet into an array of arrays using header: 1.
          const rawData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1, // each row becomes an array
            defval: "", // use empty string for empty cells
          });
          console.log("Raw row-based data:", rawData);

          if (rawData.length > 1) {
            // Assume the first row contains the column headers.
            const [headerRow, ...contentRows] = rawData;
            console.log("Header row:", headerRow);
            console.log("Content rows:", contentRows);

            // Build an array of objects where keys are from the header row.
            const structuredData = contentRows.map((row) => {
              const obj = {};
              headerRow.forEach((header, index) => {
                obj[header] = row[index] || "";
              });
              return obj;
            });
            console.log("Structured Data:", structuredData);

            if (structuredData.length > 0) {
              // Filter out the timestamp column (adjust header name if needed)
              const keys = Object.keys(structuredData[0]);
              console.log("Keys:", keys);

              const qs = keys.filter((k) => k !== "طابع زمني");
              console.log("Questions:", qs);
              setQuestions(qs);

              // Aggregate responses for each question.
              const aggregateResults = {};
              
              qs.forEach((q) => {
                aggregateResults[q] = {};
              });
              structuredData.forEach((row) => {
                qs.forEach((q) => {
                  const answer = row[q];
                  if (answer) {
                    aggregateResults[q][answer] =
                      (aggregateResults[q][answer] || 0) + 1;
                  }
                });
              });
              console.log("Aggregate Excel analysis:", aggregateResults);
              setExcelAnalysis(aggregateResults);
            }
          } else {
            console.log("Excel file appears empty or has insufficient rows.");
          }
        }
      } catch (error) {
        console.error("Error analyzing external Excel:", error);
      }
    }
    fetchAndAnalyzeExcel();
  }, [poll.excelFileLink]);

  // Fallback: Analyze local subscriber data by summarizing the "choice" field if needed.
  // const localResults = {};
  // subscribers.forEach((sub) => {
  //   const choice = sub.choice;
  //   if (choice) {
  //     const key = JSON.stringify(choice); // convert choice object into a string for display
  //     localResults[key] = (localResults[key] || 0) + 1;
  //   }
  // });

  // Helper function to get cleaned numeric responses from an Excel row.
  const getCleanedResponseData = (responses) => {
    // Create a new object, skipping the header entry.
    const cleanedResponses = {};
    Object.keys(responses)
      .slice(1) // skip the header property
      .forEach((key) => {
        const numericVal = Number(responses[key]);
        if (!isNaN(numericVal)) {
          cleanedResponses[key] = numericVal;
        }
      });
    return cleanedResponses;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}         onClick={(e) => e.stopPropagation()}
 >
        <h2>{poll.pollName} - Results</h2>

        {poll.excelFileLink && excelAnalysis ? (
          <div>
            <h3>Analysis from External Excel Data</h3>
            {/*
              We now assume that:
              - questions[0] is excluded (assumed to be timestamp)
              - questions[1] is the actual question text (header)
              - questions[2..n] are vote choices or subsequent questions.
              Adjust indices as needed.
            */}
            {questions.slice(2, 7).map((questionKey) => {
              console.log("Rendering chart for question key:", questionKey);
              const responses = excelAnalysis[questionKey];
              console.log("Initial responses for question:", questionKey, responses);
              
              if (!responses) return null;
              
              // Use the first entry as header information
              const header = Object.keys(responses)[0];

              // Instead of modifying the responses object, build a new cleaned object.
              const cleanedResponses = getCleanedResponseData(responses);
              const labels = Object.keys(cleanedResponses);
              const rawValues = Object.values(cleanedResponses);
              const values = rawValues.map((val) => Number(val));
              console.log("Cleaned labels:", labels);
              console.log("Cleaned numeric values:", values);

              // Always force the maximum as one more than the highest value
              const maxValue = Math.max(...values, 0);
              const forcedMax = maxValue + 1;

              const chartData = {
                labels,
                datasets: [
                  {
                    // We show the question as the chart title below in options.
                    label: "Responses",
                    data: values,
                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                  },
                ],
              };

              const options = {
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    min: 0,
                    max: forcedMax-1,
                    ticks: {
                      stepSize: 1,
                      precision: 0,
                      autoSkip: false, // disable auto-skip to force every tick to be displayed
                      callback: function (value) {
                        return Number(value).toFixed(0);
                      },
                    },
                  },
                },
                plugins: {
                  title: {
                    display: true,
                    text: header, // Use header from responses as the chart title.
                  },
                },
              };

              return (
                <div key={header} style={{ marginBottom: "2rem" }}>
                  <Bar data={chartData} options={options} />
                </div>
              );
            })}
          </div>
        ) : (
          <div>
          <p>There is No Votes Recorded</p>

            {/* <h3>Local Result Summary</h3>
            {Object.keys(localResults).length > 0 ? (
              <Bar
                data={{
                  labels: Object.keys(localResults),
                  datasets: [
                    {
                      label: "Votes",
                      data: Object.values(localResults).map((val) =>
                        Number(val)
                      ),
                      backgroundColor: "rgba(75, 192, 192, 0.6)",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                        precision: 0,
                        autoSkip: false,
                        callback: function (value) {
                          return Number(value).toFixed(0);
                        },
                      },
                    },
                  },
                  plugins: {
                    title: {
                      display: true,
                      text: "Local Poll Results",
                    },
                  },
                }}
              />
            ) : (
              <p>No local votes recorded.</p>
            )} */}
          </div>
        )}

        {poll.excelFileLink && (
          <div style={{ marginTop: "20px" }}>
            <a
              href={poll.excelFileLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.excelLink}
            >
              View External Excel Sheet
            </a>
          </div>
        )}
        <button className={styles.closeButton} onClick={onClose}>
          Close
        </button>
      </div>
    </div></div>
  );
}
