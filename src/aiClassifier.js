class AIClassifier {
  constructor() {
    // Load from environment instead of /api-key.txt
    // Works for Vite: import.meta.env.VITE_OPENAI_API_KEY
    // (If you use CRA, rename to process.env.REACT_APP_OPENAI_API_KEY)
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY?.trim() || null;
  }

  async classifyTextAnswer(question, answer, availablePaths) {
    if (!this.apiKey) {
      console.error("OPENAI_API_KEY not loaded. Using fallback.");
      return this.localTextRouting(answer, availablePaths);
    }

    console.log("AI Classification starting for:", question.id);
    const prompt = this.buildClassificationPrompt(
      question,
      answer,
      availablePaths
    );

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "You are an AI fragrance consultant who classifies user responses into personality-based fragrance categories. You must respond with ONLY the path ID, nothing else.",
              },
              { role: "user", content: prompt },
            ],
            max_tokens: 50,
            temperature: 0.3,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok)
        throw new Error(`API request failed: ${response.status}`);

      const data = await response.json();
      const classification = data.choices[0].message.content.trim();

      if (availablePaths.includes(classification)) return classification;

      console.warn("Invalid classification returned:", classification);
      // fallback to local
      return this.localTextRouting(answer, availablePaths);
    } catch (error) {
      console.error("Classification error:", error);
      return this.localTextRouting(answer, availablePaths);
    }
  }

  localTextRouting(answer, availablePaths) {
    const a = (answer || "").toLowerCase();

    // more sensible mapping
    if (
      a.includes("nostalgic") ||
      a.includes("memory") ||
      a.includes("romantic") ||
      a.includes("love")
    ) {
      const romantic =
        availablePaths.find((p) => p.startsWith("PathA_")) || availablePaths[0];
      return romantic;
    }
    if (a.includes("calm") || a.includes("peace") || a.includes("nature")) {
      const calm =
        availablePaths.find((p) => p.startsWith("PathC_")) || availablePaths[0];
      return calm;
    }
    if (a.includes("happy") || a.includes("fun") || a.includes("joy")) {
      const joy =
        availablePaths.find((p) => p.startsWith("PathD_")) || availablePaths[0];
      return joy;
    }
    if (a.includes("confident") || a.includes("bold") || a.includes("power")) {
      const bold =
        availablePaths.find((p) => p.startsWith("PathB_")) || availablePaths[0];
      return bold;
    }
    if (a.includes("secret") || a.includes("mystery") || a.includes("dark")) {
      const myst =
        availablePaths.find((p) => p.startsWith("PathE_")) || availablePaths[0];
      return myst;
    }

    // default
    return availablePaths[0];
  }

  buildClassificationPrompt(question, answer, availablePaths) {
    const pathDescriptions = {
      PathA_Choice:
        "Sensual & Romantic - for users who want intimate, romantic, sensual fragrances",
      PathB_Choice:
        "Confident & Bold - for users who want powerful, assertive, commanding fragrances",
      PathC_Choice:
        "Calm & Grounded - for users who want peaceful, natural, balanced fragrances",
      PathD_Choice:
        "Joyful & Playful - for users who want happy, fun, energetic fragrances",
      PathE_Choice:
        "Mysterious & Unique - for users who want unusual, complex, intriguing fragrances",
      A2_1_Elegant: "Elegant Evening - sophisticated, formal romantic settings",
      A2_2_Cozy: "Cozy Intimacy - comfortable, intimate, personal settings",
      A2_3_Adventure:
        "Adventurous Escape - exciting, spontaneous romantic moments",
      B2_1_Pro: "Professional / Boardroom - workplace confidence and authority",
      B2_2_Social: "Social Event / Gala - social confidence and charisma",
      B2_3_Personal:
        "Personal Triumph / Solo - individual achievement and self-assurance",
      C2_1_Nature: "A walk in nature / Forest - natural, outdoorsy peace",
      C2_2_CozyHome:
        "A quiet corner of my home - domestic, comfortable tranquility",
      C2_3_ByWater: "Near the ocean or a lake - water-based serenity",
      E2_1_Intellect:
        "An intellectual secret / Ancient knowledge - scholarly, mysterious wisdom",
      E2_2_Forbidden: "A forbidden, dark secret - edgy, dangerous intrigue",
      E2_3_Whimsical:
        "A whimsical, magical secret - playful, fantastical mystery",
    };

    const pathOptions = availablePaths
      .map((path) => `${path}: ${pathDescriptions[path] || path}`)
      .join("\n");

    return `Question: "${question.question}"
User's Answer: "${answer}"

Available classification paths:
${pathOptions}

Based on the user's answer, which path best matches their personality and preferences for fragrance?

Respond with ONLY the path ID (e.g., "PathA_Choice" or "A2_1_Elegant").`;
  }

  classifyImageChoice(selectedOption, availablePaths) {
    const imageToPath = {
      ImageA1_Floral: "A2_1_Elegant",
      ImageA2_Gourmand: "A2_2_Cozy",
      ImageA3_Woody: "A2_3_Adventure",
      ImageB1_Citrus: "B2_1_Pro",
      ImageB2_Leather: "B2_2_Social",
      ImageB3_Smoky: "B2_3_Personal",
      ImageD1_Fruity: "D2_1_Fruity",
      ImageD2_Sweet: "D2_2_Sweet",
      ImageD3_Tropical: "D2_3_Tropical",
      ImageE1_Incense: "E2_1_Intellect",
      ImageE2_Mineral: "E2_2_Forbidden",
      ImageE3_Exotic: "E2_3_Whimsical",
    };

    const directPath = imageToPath[selectedOption.id];
    return directPath && availablePaths.includes(directPath)
      ? directPath
      : availablePaths[0];
  }

  pickLocalFinalFromAnswers(userAnswers, availableFinals) {
    // try to detect main path from answers
    const allAnswers = Object.values(userAnswers)
      .map((a) => (a.answer || "").toLowerCase())
      .join(" ");

    // very rough routing based on user language
    if (
      allAnswers.includes("romantic") ||
      allAnswers.includes("love") ||
      allAnswers.includes("date")
    ) {
      // A finals if available
      const aFinal = availableFinals.find((f) => f.startsWith("Final_A_"));
      if (aFinal) return aFinal;
    }
    if (
      allAnswers.includes("power") ||
      allAnswers.includes("confident") ||
      allAnswers.includes("bold")
    ) {
      const bFinal = availableFinals.find((f) => f.startsWith("Final_B_"));
      if (bFinal) return bFinal;
    }
    if (
      allAnswers.includes("calm") ||
      allAnswers.includes("peace") ||
      allAnswers.includes("nature")
    ) {
      const cFinal = availableFinals.find((f) => f.startsWith("Final_C_"));
      if (cFinal) return cFinal;
    }
    if (
      allAnswers.includes("happy") ||
      allAnswers.includes("fun") ||
      allAnswers.includes("joy")
    ) {
      const dFinal = availableFinals.find((f) => f.startsWith("Final_D_"));
      if (dFinal) return dFinal;
    }
    if (
      allAnswers.includes("mystery") ||
      allAnswers.includes("secret") ||
      allAnswers.includes("unique")
    ) {
      const eFinal = availableFinals.find((f) => f.startsWith("Final_E_"));
      if (eFinal) return eFinal;
    }

    // fallback to first available
    return availableFinals[0];
  }

  async classifyForFinalResult(userAnswers, availableFinals) {
    const journeyContext = Object.values(userAnswers)
      .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`)
      .join("\n\n");

    if (!this.apiKey) {
      return this.pickLocalFinalFromAnswers(userAnswers, availableFinals);
    }

    const finalDescriptions = {
      Final_A_1:
        "Romantic Floral with Intimate Sillage - soft, close-to-skin romantic scents",
      Final_A_2:
        "Romantic Floral with Moderate Sillage - balanced romantic presence",
      Final_A_3:
        "Romantic Floral with Strong Sillage - bold romantic statement",
      Final_B_1:
        "Bold Leather with Reserved Projection - subtle confident power",
      Final_B_2:
        "Bold Leather with Assertive Projection - noticeable confident presence",
      Final_B_3:
        "Bold Leather with Unmistakable Projection - commanding confident aura",
      Final_C_1:
        "Clean & Musky with Solitary Character - personal peaceful moments",
      Final_C_2:
        "Clean & Musky with Shared Character - peaceful connections with others",
      Final_D_1:
        "Playful Gourmand with Vibrant Energy - energetic joyful presence",
      Final_D_2: "Playful Gourmand with Gentle Glow - soft joyful warmth",
      Final_E_1:
        "Unique Incense with Inviting Character - mysterious but approachable",
      Final_E_2:
        "Unique Incense with Distant Character - mysterious and enigmatic",
    };

    const finalOptions = availableFinals
      .map((f) => `${f}: ${finalDescriptions[f] || f}`)
      .join("\n");

    const prompt = `Based on this user's complete fragrance discovery journey, determine their ideal fragrance profile:

${journeyContext}

Available final profiles:
${finalOptions}

Which profile best matches this user's responses and personality? Respond with ONLY the profile ID.`;

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "You are an expert fragrance consultant. Analyze the user's complete journey and select the most appropriate final fragrance profile. Respond with ONLY the profile ID.",
              },
              { role: "user", content: prompt },
            ],
            max_tokens: 50,
            temperature: 0.2,
          }),
        }
      );

      const data = await response.json();
      const finalResult = data.choices[0].message.content.trim();
      return availableFinals.includes(finalResult)
        ? finalResult
        : availableFinals[0];
    } catch (error) {
      console.error("Final classification error:", error);
      return availableFinals[0];
    }
  }

  async generatePersonalizedPoem(userAnswers, finalProfile) {
    if (!this.apiKey) {
      console.error("API key not loaded for poem generation");
      return this.getFallbackPoem(finalProfile);
    }

    console.log("Generating personalized poem...");
    const prompt = this.buildPoemPrompt(userAnswers, finalProfile);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "You are a masterful fragrance stylist, a literary genius, and a poet extraordinaire. You craft beautiful, evocative poems that capture the essence of a person's fragrance journey. You must respond with ONLY the poem.",
              },
              { role: "user", content: prompt },
            ],
            max_tokens: 300,
            temperature: 0.8,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok)
        throw new Error(
          `Poem generation API request failed: ${response.status}`
        );

      const data = await response.json();
      const poem = data.choices[0].message.content.trim();
      console.log("Poem generated successfully");
      return poem;
    } catch (error) {
      console.error("Poem generation error:", error);
      return this.getFallbackPoem(finalProfile);
    }
  }

  buildPoemPrompt(userAnswers, finalProfile) {
    const journeyText = Object.values(userAnswers)
      .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`)
      .join("\n\n");

    return `Create a beautiful, personalized poem based on this person's fragrance discovery journey. The poem should capture their essence, personality, and the scents that speak to their soul.

FRAGRANCE PROFILE: ${finalProfile.profile} - ${finalProfile.character}

COMPLETE JOURNEY:
${journeyText}

INSTRUCTIONS:
- Write a creative, evocative poem (8-12 lines)
- Incorporate elements from their answers and personality
- Use sensual, fragrance-related imagery
- Be poetic, artistic, and beautiful
- Focus on their unique fragrance story

Write ONLY the poem, nothing else:`;
  }

  getFallbackPoem(finalProfile) {
    const fallbackPoems = {
      "Playful Gourmand": `Sweet whispers of vanilla dance on air,\nLike childhood dreams beyond compare.\nJoyful notes of sugar and spice,\nA fragrance warm, a heart so nice.\n\nYour scent tells tales of laughter bright,\nOf gentle glows and pure delight.\nA gourmand soul with spirit free,\nYour fragrance sings of sweet harmony.`,
      "Romantic Floral": `In gardens where the roses bloom,\nYour essence fills each sacred room.\nFloral whispers soft and true,\nSpeak of love that lives in you.\n\nPetals dance upon the breeze,\nCarrying your mysteries.\nA romantic heart that beats so deep,\nYour fragrance is love's promise to keep.`,
      "Bold Leather": `Confident strides on leather ground,\nYour powerful presence knows no bound.\nStrong and bold, your spirit flies,\nLike smoky scents that touch the skies.\n\nWith every breath, you claim your space,\nA fragrance bold, with timeless grace.\nLeather whispers of your might,\nA scent that conquers day and night.`,
      "Clean & Musky": `In quiet moments, peace you find,\nA clean, pure scent that calms the mind.\nMusky notes of earth and rain,\nWash away all stress and strain.\n\nYour grounded soul seeks harmony,\nIn nature's sweet symphony.\nA fragrance clean, a spirit free,\nYour essence speaks serenity.`,
      "Unique Incense": `Mysterious paths through ancient halls,\nWhere incense smoke around you falls.\nUnique and rare, your spirit soars,\nTo mystical and distant shores.\n\nWith every note both strange and deep,\nYour secrets safe, yours to keep.\nAn incense soul, enigmatic and true,\nYour fragrance speaks the mystery of you.`,
    };
    const profileName = finalProfile.profile;
    return fallbackPoems[profileName] || fallbackPoems["Playful Gourmand"];
  }
}

export default AIClassifier;
