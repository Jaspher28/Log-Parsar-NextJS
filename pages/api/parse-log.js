// pages/api/parse-log.js
export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { fileContent } = req.body;
  if (!fileContent) {
    res.status(400).json({ error: "No file content provided" });
    return;
  }

  const daysData = {};
  // Map for converting three-letter month abbreviations to numbers
  const monthsMap = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04",
    May: "05", Jun: "06", Jul: "07", Aug: "08",
    Sep: "09", Oct: "10", Nov: "11", Dec: "12"
  };

  const lines = fileContent.split("\n");
  lines.forEach((line) => {
    if (!line.trim()) return;

    // Extract IP address (assumes the first token is the IP)
    const ipMatch = line.match(/^([\d.]+)\s/);
    if (!ipMatch) return;
    const ip = ipMatch[1];

    // Extract timestamp (the part inside square brackets)
    const timeMatch = line.match(/\[([^\]]+)\]/);
    if (!timeMatch) return;
    const timestamp = timeMatch[1]; // e.g., "17/May/2015:10:05:03 +0000"

    // Split timestamp into date and hour parts
    const [datePart, hour] = timestamp.split(":");
    const [day, mon, year] = datePart.split("/");
    const isoDate = `${year}-${monthsMap[mon]}-${day.padStart(2, "0")}`;
    const hourStr = hour.padStart(2, "0");

    if (!daysData[isoDate]) {
      daysData[isoDate] = { ipCounts: {}, hourCounts: {}, total: 0 };
    }
    daysData[isoDate].ipCounts[ip] = (daysData[isoDate].ipCounts[ip] || 0) + 1;
    daysData[isoDate].hourCounts[hourStr] = (daysData[isoDate].hourCounts[hourStr] || 0) + 1;
    daysData[isoDate].total += 1;
  });

  // For each day, calculate:
  // - The list of IP addresses that cumulatively contribute to 85% of the traffic.
  // - The list of hours that cumulatively contribute to 70% of the traffic.
  for (const date in daysData) {
    const dayData = daysData[date];
    const total = dayData.total;

    const ipEntries = Object.entries(dayData.ipCounts).sort((a, b) => b[1] - a[1]);
    let cumulative = 0;
    const topIPs85 = [];
    for (const [ip, count] of ipEntries) {
      cumulative += count;
      topIPs85.push(ip);
      if (cumulative / total >= 0.85) break;
    }
    dayData.topIPs85 = topIPs85;

    const hourEntries = Object.entries(dayData.hourCounts).sort((a, b) => b[1] - a[1]);
    cumulative = 0;
    const topHours70 = [];
    for (const [hr, count] of hourEntries) {
      cumulative += count;
      topHours70.push(hr);
      if (cumulative / total >= 0.70) break;
    }
    dayData.topHours70 = topHours70;
  }

  res.status(200).json({ days: daysData });
}
