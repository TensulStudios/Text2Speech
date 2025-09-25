export default async function handler(req, res) {
  // Allow all origins (for testing)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // preflight response
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch("https://fasthub.net/plauder", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams(req.body)
    });

    const data = await response.text();
    console.log("fasthub response:", data);

    if (!data.includes("##########")) {
      return res.status(500).json({ error: "Unexpected response", raw: data });
    }

    const [mp3Id, returnedText] = data.split("##########");
    const mp3Url = `https://fasthub.net/speak/${mp3Id}.mp3`;

    return res.status(200).json({
      mp3Url,
      text: returnedText
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
