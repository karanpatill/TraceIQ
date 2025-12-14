require("dotenv").config();
const OpenAI = require("openai");

console.log(
  "OPENAI KEY LOADED:",
  process.env.OPENAI_API_KEY?.slice(0, 10),
  "length:",
  process.env.OPENAI_API_KEY?.length
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

(async () => {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Say hello in one word" }],
      max_tokens: 10,
    });

    console.log("SUCCESS:", res.choices[0].message.content);
  } catch (err) {
    console.error("FAIL:", err);
  }
})();
