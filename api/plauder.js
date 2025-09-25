export default async function handler(req, res) {
  // Allow cross-origin use
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Support both GET (query params) and POST (form body)
    const params = req.method === "GET"
      ? req.query
      : req.body;

    const {
      text = "Hello world!",
      lang = "en-us en en-US",
      langTrans = "en-us en en-US",
      voiceType = "m1",
      amplitude = "100",
      pitch = "50",
      speed = "125",
      repeat = "0"
    } = params;

    // Forward request to fasthub
    const response = await fetch("https://fasthub.net/plauder", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        text,
        lang,
        langTrans,
        voiceType,
        amplitude,
        pitch,
        speed,
        repeat
      })
    });

    const data = await response.text();
    console.log("fasthub response:", data);

    if (!data.includes("##########")) {
      return res.status(500).json({ error: "Unexpected response", raw: data });
    }

    const [mp3Id, returnedText] = data.split("##########");
    const mp3Url = `https://fasthub.net/speak/${mp3Id}.mp3`;

    // Return JSON with the MP3 link
    return res.status(200).json({
      mp3Url,
      text: returnedText
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
