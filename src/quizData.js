// Quiz data structure extracted from the HTML file
const quizData = {
  Q1: {
    id: "Q1",
    type: "text",
    question: "What feeling or core memory do you want your fragrance to evoke?",
    description: "Tell us about the emotion or memory you'd like to capture in your signature scent...",
    background: "bg1.jpg",
    paths: ["PathA_Choice", "PathB_Choice", "PathC_Choice", "PathD_Choice", "PathE_Choice"]
  },
  
  // Path A - Sensual & Romantic
  PathA_Choice: {
    id: "PathA_Choice",
    type: "classification",
    classification: "Sensual & Romantic",
    next: "Q_A2"
  },
  Q_A2: {
    id: "Q_A2",
    type: "text",
    question: "Where does this connection happen? Paint a picture of the scene...",
    description: "Describe the setting where you feel most romantically connected",
    background: "romantic-bg.jpg",
    paths: ["A2_1_Elegant", "A2_2_Cozy", "A2_3_Adventure"]
  },
  A2_1_Elegant: {
    id: "A2_1_Elegant",
    type: "classification",
    classification: "Elegant Evening",
    next: "Q_A2_1_3_Image"
  },
  A2_2_Cozy: {
    id: "A2_2_Cozy",
    type: "classification", 
    classification: "Cozy Intimacy",
    next: "Q_A2_1_3_Image"
  },
  A2_3_Adventure: {
    id: "A2_3_Adventure",
    type: "classification",
    classification: "Adventurous Escape", 
    next: "Q_A2_1_3_Image"
  },
  Q_A2_1_3_Image: {
    id: "Q_A2_1_3_Image",
    type: "image",
    question: "Which of these captures the essence?",
    description: "Select the image that resonates most with your romantic vision",
    background: "essence-bg.jpg",
    options: [
      {
        id: "ImageA1_Floral",
        image: "lush_florals.png",
        description: "Lush Florals (Rose, Gardenia)",
        answer: "The scent of blooming roses and gardenias in a moonlit garden",
        nextPath: "Q_A2_1_1_4"
      },
      {
        id: "ImageA2_Gourmand", 
        image: "decandent_dessert.png",
        description: "Decadent Dessert (Vanilla, Spice)",
        answer: "The warm sweetness of vanilla and exotic spices",
        nextPath: "Q_A2_1_1_4"
      },
      {
        id: "ImageA3_Woody",
        image: "old_library.png", 
        description: "Old Library (Wood, Leather)",
        answer: "The rich scent of aged wood and leather-bound books",
        nextPath: "Q_A2_1_1_4"
      }
    ],
    imageNext: true
  },
  Q_A2_1_1_4: {
    id: "Q_A2_1_1_4",
    type: "text",
    question: "Whisper or Statement?",
    description: "How do you want your fragrance to express itself?",
    background: "whisper-statement-bg.jpg",
    finals: ["Final_A_1", "Final_A_2", "Final_A_3"]
  },

  // Path B - Confident & Bold
  PathB_Choice: {
    id: "PathB_Choice",
    type: "classification",
    classification: "Confident & Bold", 
    next: "Q_B2"
  },
  Q_B2: {
    id: "Q_B2",
    type: "text",
    question: "When you feel this powerful, what is the setting?",
    description: "Describe where you feel most confident and in control",
    background: "powerful-bg.jpg",
    paths: ["B2_1_Pro", "B2_2_Social", "B2_3_Personal"]
  },
  B2_1_Pro: {
    id: "B2_1_Pro",
    type: "classification",
    classification: "Professional / Boardroom",
    next: "Q_B2_1_3_Image"
  },
  B2_2_Social: {
    id: "B2_2_Social",
    type: "classification",
    classification: "Social Event / Gala", 
    next: "Q_B2_1_3_Image"
  },
  B2_3_Personal: {
    id: "B2_3_Personal",
    type: "classification",
    classification: "Personal Triumph / Solo",
    next: "Q_B2_1_3_Image"
  },
  Q_B2_1_3_Image: {
    id: "Q_B2_1_3_Image",
    type: "image", 
    question: "Which of these best represents your style of confidence?",
    description: "Choose the image that embodies your bold essence",
    background: "confidence-bg.jpg",
    options: [
      {
        id: "ImageB1_Citrus",
        image: "sharp_architecture.png",
        description: "Sharp Architecture (Citrus, Aromatic, Clean)",
        answer: "The crisp clarity of citrus and clean architectural lines",
        nextPath: "Q_B2_1_1_4"
      },
      {
        id: "ImageB2_Leather",
        image: "luxurious_car_interior.png", 
        description: "Luxury Car Interior (Leather, Saffron, Spice)",
        answer: "The luxurious scent of leather, saffron and warm spices",
        nextPath: "Q_B2_1_1_4"
      },
      {
        id: "ImageB3_Smoky",
        image: "grand_fireplace.png",
        description: "Grand Fireplace (Smoky, Woody, Incense)",
        answer: "The smoky warmth of wood and sacred incense",
        nextPath: "Q_B2_1_1_4"
      }
    ],
    imageNext: true
  },
  Q_B2_1_1_4: {
    id: "Q_B2_1_1_4",
    type: "text",
    question: "How do you project this confidence?", 
    description: "Tell us how you want your boldness to be perceived",
    background: "project-confidence-bg.jpg",
    finals: ["Final_B_1", "Final_B_2", "Final_B_3"]
  },

  // Path C - Calm & Grounded
  PathC_Choice: {
    id: "PathC_Choice",
    type: "classification",
    classification: "Calm & Grounded",
    next: "Q_C2"
  },
  Q_C2: {
    id: "Q_C2", 
    type: "text",
    question: "Describe your perfect place of peace. Your personal sanctuary.",
    description: "Paint a picture of where you find your deepest calm",
    background: "sanctuary-bg.jpg",
    paths: ["C2_1_Nature", "C2_2_CozyHome", "C2_3_ByWater"]
  },
  C2_1_Nature: {
    id: "C2_1_Nature",
    type: "classification",
    classification: "A walk in nature / Forest",
    next: "Q_C2_1_3_Choice"
  },
  C2_2_CozyHome: {
    id: "C2_2_CozyHome",
    type: "classification",
    classification: "A quiet corner of my home", 
    next: "Q_C2_1_3_Choice"
  },
  C2_3_ByWater: {
    id: "C2_3_ByWater",
    type: "classification",
    classification: "Near the ocean or a lake",
    next: "Q_C2_1_3_Choice"
  },
  Q_C2_1_3_Choice: {
    id: "Q_C2_1_3_Choice",
    type: "text",
    question: "Which scent brings you the most comfort?",
    description: "Tell us about the scent that makes you feel most at peace",
    background: "comfort-bg.jpg",
    next: "Q_C2_1_1_4"
  },
  Q_C2_1_1_4: {
    id: "Q_C2_1_1_4",
    type: "text", 
    question: "Is this a moment of solitary peace or shared warmth?",
    description: "How do you experience your most grounding moments?",
    background: "peace-warmth-bg.jpg",
    finals: ["Final_C_1", "Final_C_2"]
  },

  // Path D - Joyful & Playful
  PathD_Choice: {
    id: "PathD_Choice",
    type: "classification", 
    classification: "Joyful & Playful",
    next: "Q_D2"
  },
  Q_D2: {
    id: "Q_D2",
    type: "image",
    question: "What does this moment of pure joy look like?",
    description: "Choose the scene that captures your happiest moments",
    background: "joy-bg.jpg",
    options: [
      {
        id: "ImageD1_Fruity",
        image: "fruit_market.png",
        description: "A vibrant fruit market (Fruity)",
        answer: "The vibrant energy of a colorful fruit market with fresh, juicy scents",
        nextPath: "Q_D2_1_3_Choice"
      },
      {
        id: "ImageD2_Sweet",
        image: "candy_shop.png",
        description: "A colorful candy store (Gourmand / Sweet)", 
        answer: "The playful sweetness of a whimsical candy wonderland",
        nextPath: "Q_D2_1_3_Choice"
      },
      {
        id: "ImageD3_Tropical",
        image: "sun_drenched_beach.png",
        description: "A sun-drenched beach (Tropical / Coconut)",
        answer: "The tropical bliss of sun-warmed skin and coconut breeze",
        nextPath: "Q_D2_1_3_Choice"
      }
    ],
    imageNext: true
  },
  Q_D2_1_3_Choice: {
    id: "Q_D2_1_3_Choice",
    type: "text",
    question: "What kind of sweetness comes to mind?",
    description: "Describe the sweetness that brings you the most joy",
    background: "sweetness-bg.jpg", 
    next: "Q_D2_1_1_4"
  },
  Q_D2_1_1_4: {
    id: "Q_D2_1_1_4",
    type: "text",
    question: "Is this a burst of vibrant energy or a soft, happy glow?",
    description: "How does your joy express itself?",
    background: "energy-glow-bg.jpg",
    finals: ["Final_D_1", "Final_D_2"]
  },

  // Path E - Mysterious & Unique
  PathE_Choice: {
    id: "PathE_Choice",
    type: "classification",
    classification: "Mysterious & Unique",
    next: "Q_E2"
  },
  Q_E2: {
    id: "Q_E2",
    type: "text",
    question: "If your scent was a secret, what kind of secret would it be?",
    description: "Tell us about the mystery you want to embody",
    background: "secret-bg.jpg",
    paths: ["E2_1_Intellect", "E2_2_Forbidden", "E2_3_Whimsical"]
  },
  E2_1_Intellect: {
    id: "E2_1_Intellect",
    type: "classification",
    classification: "An intellectual secret / Ancient knowledge",
    next: "Q_E2_1_3_Image"
  },
  E2_2_Forbidden: {
    id: "E2_2_Forbidden",
    type: "classification", 
    classification: "A forbidden, dark secret",
    next: "Q_E2_1_3_Image"
  },
  E2_3_Whimsical: {
    id: "E2_3_Whimsical",
    type: "classification",
    classification: "A whimsical, magical secret",
    next: "Q_E2_1_3_Image"
  },
  Q_E2_1_3_Image: {
    id: "Q_E2_1_3_Image",
    type: "image",
    question: "Which of these forgotten places holds the secret?",
    description: "Select the mystical setting that speaks to your soul",
    background: "forgotten-bg.jpg",
    options: [
      {
        id: "ImageE1_Incense",
        image: "old_grimoire.png",
        description: "An old grimoire (Incense, Papyrus)",
        answer: "The ancient wisdom of incense and aged papyrus",
        nextPath: "Q_E2_1_1_4"
      },
      {
        id: "ImageE2_Mineral",
        image: "rain_slicked_neon_street.png",
        description: "A rain-slicked neon street (Ozonic, Mineral)",
        answer: "The electric mystery of rain-soaked city nights",
        nextPath: "Q_E2_1_1_4"
      },
      {
        id: "ImageE3_Exotic", 
        image: "jungle-temple.jpg",
        description: "A forgotten jungle temple (Exotic Florals, Spice)",
        answer: "The exotic allure of forgotten temple gardens",
        nextPath: "Q_E2_1_1_4"
      }
    ],
    imageNext: true
  },
  Q_E2_1_1_4: {
    id: "Q_E2_1_1_4",
    type: "text",
    question: "Does this scent invite others closer, or keep them guessing?",
    description: "How does your mystery interact with the world?",
    background: "mystery-bg.jpg",
    finals: ["Final_E_1", "Final_E_2"]
  },

  // Final Results
  Final_A_1: { profile: "Romantic Floral", character: "Sillage: Intimate" },
  Final_A_2: { profile: "Romantic Floral", character: "Sillage: Moderate" },
  Final_A_3: { profile: "Romantic Floral", character: "Sillage: Strong" },
  Final_B_1: { profile: "Bold Leather", character: "Projection: Reserved" },
  Final_B_2: { profile: "Bold Leather", character: "Projection: Assertive" },
  Final_B_3: { profile: "Bold Leather", character: "Projection: Unmistakable" },
  Final_C_1: { profile: "Clean & Musky", character: "Character: Solitary" },
  Final_C_2: { profile: "Clean & Musky", character: "Character: Shared" },
  Final_D_1: { profile: "Playful Gourmand", character: "Energy: Vibrant" },
  Final_D_2: { profile: "Playful Gourmand", character: "Energy: Gentle Glow" },
  Final_E_1: { profile: "Unique Incense", character: "Character: Inviting" },
  Final_E_2: { profile: "Unique Incense", character: "Character: Distant" }
};

export default quizData;