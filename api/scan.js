export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { imageBase64, mediaType } = req.body;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/jpeg",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `Look at this drink label and extract the following information. Respond ONLY with a JSON object, no markdown, no explanation.

{
  "name": "the drink or product name",
  "brewery": "the brewery or winery name",
  "style": "the beer style or wine variety (e.g. Pilsner, Saison, Chardonnay, Pet Nat)",
  "type": "one of: Beer, Wine, or Cider"
}

If you cannot determine a field, use an empty string. Do not guess.`,
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || "{}";

  try {
    const parsed = JSON.parse(text);
    res.status(200).json(parsed);
  } catch {
    res.status(200).json({ name: "", brewery: "", style: "", type: "Beer" });
  }
}
