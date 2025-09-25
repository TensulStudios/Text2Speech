export default async function handler(req, res) {
  try {
    // Forward the request to fasthub
    const response = await fetch("https://fasthub.net/plauder", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams(req.body) // forward body data
    });

    const data = await response.text();
    console.log("fasthub returned:", data);
    
    // fasthub returns something like: "123456##########Your text"
    const mp3Id = data.split("##########")[0];
    const textReturned = data.split("##########")[1];

    const mp3Url = `https://fasthub.net/speak/${mp3Id}.mp3`;

    // Optional: fetch the actual mp3 bytes and stream it back
    const mp3Res = await fetch(mp3Url);
    const arrayBuffer = await mp3Res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", `inline; filename="output.mp3"`);
    res.send(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
