import { useState } from "react";
import FileUpload from "../components/FileUpload";
import ChartDisplay from "../components/ChartDisplay";
import TrafficDetails from "../components/TrafficDetails";

export default function Home() {
  const [parsedData, setParsedData] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const handleFileUpload = async (fileContent) => {
    try {
      const res = await fetch("/api/parse-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileContent })
      });
      const data = await res.json();
      setParsedData(data);
      const days = Object.keys(data.days);
      if (days.length > 0) {
        setSelectedDate(days[0]);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  let ipChartData = null;
  let hourChartData = null;
  let trafficDetails = null;

  if (parsedData && selectedDate && parsedData.days[selectedDate]) {
    const dayData = parsedData.days[selectedDate];

    // Prepare IP histogram data
    ipChartData = {
      labels: Object.keys(dayData.ipCounts),
      datasets: [{
        label: "Occurrences",
        data: Object.values(dayData.ipCounts),
        backgroundColor: "rgba(75,192,192,0.6)"
      }]
    };

    // Prepare hourly traffic histogram data
    const allHours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
    const hourCounts = allHours.map((hr) => dayData.hourCounts[hr] || 0);
    hourChartData = {
      labels: allHours,
      datasets: [{
        label: "Visitors",
        data: hourCounts,
        backgroundColor: "rgba(153,102,255,0.6)"
      }]
    };

    trafficDetails = {
      topIPs85: dayData.topIPs85,
      topHours70: dayData.topHours70
    };
  }

  return (
    <div style={{ padding: "2rem", paddingTop:"0", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{backgroundColor:"#28282B",borderRadius:"10px", color: "white", padding:"1rem"}}>LOG PRASAR</h1>

      <h1 style={{display:"flex", justifyContent:"center", fontSize:"1rem"}}>Unlock the Power of Your Server Logs</h1>
      <p style={{display:"flex", justifyContent:"center"}}>Transform raw data into actionable insights with our intuitive analytics platform.</p>
      <FileUpload onFileUpload={handleFileUpload} />

      {parsedData && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Select Date</h2>
          <select value={selectedDate} onChange={handleDateChange}>
            {Object.keys(parsedData.days).map((date) => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>

          <div style={{ marginTop: "2rem" }}>
            <h2>Distinct IP Addresses Histogram</h2>
            {ipChartData ? (
              <ChartDisplay chartData={ipChartData} chartLabel="IP Addresses" />
            ) : (
              <p>No data available for IP histogram.</p>
            )}
          </div>

          <div style={{ marginTop: "2rem" }}>
            <h2>Hourly Traffic Histogram</h2>
            {hourChartData ? (
              <ChartDisplay chartData={hourChartData} chartLabel="Hourly Visitors" />
            ) : (
              <p>No data available for hourly histogram.</p>
            )}
          </div>

          <div style={{ marginTop: "2rem" }}>
            <TrafficDetails details={trafficDetails} />
          </div>
        </div>
      )}
    </div>
  );
}
