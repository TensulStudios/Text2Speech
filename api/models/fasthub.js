// models/api/FastHub.js
// https://github.com/TensulStudios/Text2Speech/

export default async function handler(req, res) 
{
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");


  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const params = req.method === "GET"
      ? req.query
      : req.body;

    const {
      text = "Welcome to Fast Hub.\nRecord, Translate and Speak.\nI would like to order a Pizza.",
      lang = "en-us en en-US",
      langTrans = "en-us en en-US",
      voiceType = "m1",
      amplitude = "100",
      pitch = "50",
      speed = "125",
      repeat = "0"
    } = params;

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

    if (!data.includes("##########")) {
      return res.status(500).send("Unexpected response from https://fasthub.net/plauder: " + data);
    }

    const [mp3Id] = data.split("##########");
    const mp3Url = `https://fasthub.net/speak/${mp3Id}.mp3`;

    const mp3Response = await fetch(mp3Url);
    const buffer = Buffer.from(await mp3Response.arrayBuffer());

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", 'inline; filename="speech.mp3"');
    res.status(200).send(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error: " + err.message);
  }
}
