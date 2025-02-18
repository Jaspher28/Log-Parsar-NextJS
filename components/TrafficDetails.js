export default function TrafficDetails({ details }) {
    if (!details) return null;
    return (
      <div>
        <h2>Traffic Contributors</h2>
        <div style={{ display: "flex", gap: "2rem" }}>
          <div>
            <h3>IP Addresses (85% of traffic)</h3>
            <ul>
              {details.topIPs85.map((ip) => <li key={ip}>{ip}</li>)}
            </ul>
          </div>
          <div>
            <h3>Hours (70% of traffic)</h3>
            <ul>
              {details.topHours70.map((hour) => <li key={hour}>{hour}</li>)}
            </ul>
          </div>
        </div>
      </div>
    );
  }
  