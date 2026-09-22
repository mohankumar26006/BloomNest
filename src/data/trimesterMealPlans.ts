export interface MealItem {
  id: string;
  timeSlot: string; // e.g. "6:30 AM – 7:00 AM"
  slotName: "Early Morning" | "Breakfast" | "Mid-Morning Snack" | "Lunch" | "Evening Snack" | "Dinner" | "Bedtime Drink";
  title: string;
  description: string;
  recommendedDishes: string[];
  keyNutrients: string[];
  clinicalBenefit: string;
  chefTips: string;
}

export interface TrimesterMealPlan {
  trimester: 1 | 2 | 3;
  trimesterTitle: string;
  weeksRange: string;
  clinicalTheme: string;
  keyMaternalFocus: string[];
  dailyHydrationTarget: string;
  nutritionalPriorities: {
    nutrient: string;
    dailyTarget: string;
    whyNeeded: string;
  }[];
  meals: MealItem[];
  cautionaryNotes: string[];
}

export const TRIMESTER_MEAL_PLANS: TrimesterMealPlan[] = [
  {
    trimester: 1,
    trimesterTitle: "First Trimester: Foundation & Morning Sickness Ease",
    weeksRange: "Weeks 1 – 12",
    clinicalTheme: "Combating nausea, supporting neural tube closure, and keeping blood sugar steady with light, easily digestible meals.",
    keyMaternalFocus: [
      "Folate / Folic Acid for embryonic neural development",
      "Vitamin B6 & Ginger for easing morning nausea",
      "Electrolytes & frequent small sips for hydration",
      "Bland complex carbs to prevent hypoglycemia-triggered queasiness"
    ],
    dailyHydrationTarget: "2.5 – 3.0 Liters (Water, tender coconut water, diluted lemon mint water, ginger infusion)",
    nutritionalPriorities: [
      { nutrient: "Folate (Vitamin B9)", dailyTarget: "600 µg", whyNeeded: "Crucial for embryonic neural tube closure and early organogenesis." },
      { nutrient: "Vitamin B6 (Pyridoxine)", dailyTarget: "1.9 mg", whyNeeded: "Clinically proven to mitigate pregnancy-induced nausea and vomiting." },
      { nutrient: "Iron", dailyTarget: "27 mg", whyNeeded: "Supports expanding maternal blood volume and placental tissue growth." },
      { nutrient: "Hydration & Electrolytes", dailyTarget: "2.5 – 3 L", whyNeeded: "Prevents dizziness, dehydration from morning sickness, and constipation." }
    ],
    cautionaryNotes: [
      "Avoid eating large, heavy meals; instead eat small portions every 2 to 2.5 hours.",
      "Keep dry crackers or roasted makhana on your bedside table to eat before swinging feet out of bed.",
      "Strictly avoid raw/unpasteurized milk, raw papaya, and runny/undercooked eggs."
    ],
    meals: [
      {
        id: "t1-m1",
        timeSlot: "6:30 AM – 7:00 AM",
        slotName: "Early Morning",
        title: "Gentle Stomach Settler",
        description: "Wake-up snack to neutralize overnight gastric acids and prevent empty-stomach nausea before getting out of bed.",
        recommendedDishes: [
          "Warm ginger water with 1/2 tsp honey",
          "5 overnight soaked and peeled almonds",
          "2 plain whole-wheat crackers or dry toast"
        ],
        keyNutrients: ["Gingerols (Anti-emetic)", "Vitamin E", "Magnesium"],
        clinicalBenefit: "Soothes gastrointestinal lining and prevents sudden blood sugar drops that trigger morning retching.",
        chefTips: "Keep dry biscuits or almonds beside your pillow. Chew slowly before sitting upright in bed."
      },
      {
        id: "t1-m2",
        timeSlot: "8:30 AM – 9:00 AM",
        slotName: "Breakfast",
        title: "Nutrient-Dense Mild Breakfast",
        description: "Gentle on the stomach yet rich in complex carbohydrates and high-bioavailability folate.",
        recommendedDishes: [
          "Steamed Idlis with mild coriander-mint chutney and light vegetable sambar",
          "Oats porridge topped with chia seeds and sliced banana",
          "Vegetable Moong Dal Chilla cooked with minimal cold-pressed sesame oil"
        ],
        keyNutrients: ["Folate", "Complex B-Vitamins", "Digestible Plant Protein"],
        clinicalBenefit: "Fermented foods like idlis are easily broken down and provide gentle probiotics for digestion.",
        chefTips: "Avoid overpowering pungent garlic or strong tadka aroma if nausea is triggered by cooking smells."
      },
      {
        id: "t1-m3",
        timeSlot: "11:00 AM – 11:30 AM",
        slotName: "Mid-Morning Snack",
        title: "Hydrating Electrolyte & Vitamin Boost",
        description: "Mid-day hydration refuel with essential potassium and bioflavonoids.",
        recommendedDishes: [
          "Fresh Tender Coconut Water (Elaneer) with pulp",
          "A bowl of fresh sweet pomegranate arils or seasonal sweet apple slices",
          "Handful of roasted unsalted Makhana (foxnuts)"
        ],
        keyNutrients: ["Potassium", "Vitamin C", "Natural Electrolytes"],
        clinicalBenefit: "Replenishes cellular hydration and restores electrolytes lost if experiencing morning sickness.",
        chefTips: "Sip coconut water at room temperature rather than chilled to prevent throat sensitivity."
      },
      {
        id: "t1-m4",
        timeSlot: "1:00 PM – 1:45 PM",
        slotName: "Lunch",
        title: "Balanced Indian Trimester 1 Thali",
        description: "Well-portioned combination of whole grains, easy lentils, gut-friendly curd, and cooked greens.",
        recommendedDishes: [
          "Soft Moong Dal & Spinach (Palak) Khichdi with 1 tsp A2 Cow Ghee",
          "2 soft Phulkas with Yellow Dal Tadka, Lauki (Bottle Gourd) Sabzi & Fresh Curd",
          "Steamed brown or sona masoori rice with mild rasam and boiled carrot-beans poriyal"
        ],
        keyNutrients: ["Iron", "Calcium", "Dietary Fiber", "Probiotics"],
        clinicalBenefit: "Moong dal and cooked gourds prevent bloating while delivering bioavailable iron and protein.",
        chefTips: "Drizzle 1 tsp pure cow ghee over warm khichdi—it enhances the absorption of fat-soluble vitamins (A, D, E, K)."
      },
      {
        id: "t1-m5",
        timeSlot: "4:30 PM – 5:00 PM",
        slotName: "Evening Snack",
        title: "Energy & Mineral Sustain Crunch",
        description: "Combats the typical 4 PM maternal slump and keeps hemoglobin synthesis active.",
        recommendedDishes: [
          "Steamed Sundal (boiled chickpeas or green gram with coconut sprinkle)",
          "1 glass warm buttermilk (chaas) infused with roasted cumin powder and mint",
          "Handful of roasted walnuts & 2 soft Medjool dates"
        ],
        keyNutrients: ["Omega-3 Alpha-Linolenic Acid", "Iron", "Zinc"],
        clinicalBenefit: "Walnuts provide plant-based DHA precursors essential for earliest embryonic brain foundation.",
        chefTips: "Lightly dry-roast cumin seeds and crush them fresh into your buttermilk for optimal digestion."
      },
      {
        id: "t1-m6",
        timeSlot: "7:30 PM – 8:15 PM",
        slotName: "Dinner",
        title: "Light & Soothing Dinner Plate",
        description: "Early, light dinner to prevent acid reflux and heartburn when lying down later.",
        recommendedDishes: [
          "Warm Bottle Gourd / Mixed Vegetable Soup with toasted whole-grain bread",
          "2 soft Multigrain Rotis with Paneer Bhurji (pasteurized) and steamed beetroot",
          "Millet Pongal with mild cumin-pepper tempering and vegetable stew"
        ],
        keyNutrients: ["Lean Protein", "Calcium", "Magnesium"],
        clinicalBenefit: "Finishing dinner at least 2 hours before bedtime drastically cuts down nocturnal acid reflux.",
        chefTips: "Keep dinner low in deep-fried gravies and hot spices to ensure restful sleep."
      },
      {
        id: "t1-m7",
        timeSlot: "9:30 PM – 10:00 PM",
        slotName: "Bedtime Drink",
        title: "Restorative Sleep Elixir",
        description: "Warm calming beverage promoting serotonin synthesis, restful REM sleep, and overnight bone mineralization.",
        recommendedDishes: [
          "Warm organic pasteurized milk with a pinch of nutmeg and crushed cardamom",
          "Warm almond milk with 2 saffron (kesar) strands and crushed pistachios"
        ],
        keyNutrients: ["Tryptophan", "Calcium", "Phosphorus"],
        clinicalBenefit: "Tryptophan promotes sound sleep while calcium prevents nocturnal calf muscle twitches.",
        chefTips: "Drink warm, not scalding hot, 30 minutes before sleep for optimal relaxation."
      }
    ]
  },
  {
    trimester: 2,
    trimesterTitle: "Second Trimester: Rapid Growth & Vitality",
    weeksRange: "Weeks 13 – 27",
    clinicalTheme: "The 'Golden Trimester'—energy rebounds, appetite increases. Peak maternal blood volume expansion requires high Iron, Calcium, and lean Protein.",
    keyMaternalFocus: [
      "Dietary Iron & Vitamin C pairing to prevent gestational anemia",
      "Calcium (1,000 mg) for fetal skeleton and tooth bud mineralization",
      "High quality Protein (75g+) for rapid fetal muscle and organ development",
      "High fiber to preempt hormone-induced bowel sluggishness"
    ],
    dailyHydrationTarget: "3.0 Liters (Water, coconut water, fresh fruit infused water, buttermilk)",
    nutritionalPriorities: [
      { nutrient: "Elemental Iron", dailyTarget: "27 mg", whyNeeded: "Maternal blood volume expands by ~45%; essential to prevent iron deficiency anemia." },
      { nutrient: "Calcium", dailyTarget: "1,000 mg", whyNeeded: "Fetal skeletal calcification accelerates rapidly during weeks 16–26." },
      { nutrient: "Protein", dailyTarget: "75 – 80 g", whyNeeded: "Supports doubling of fetal weight, placental growth, and uterine expansion." },
      { nutrient: "DHA (Omega-3)", dailyTarget: "200 – 300 mg", whyNeeded: "Crucial for fetal cerebral cortex and retinal photoreceptor maturation." }
    ],
    cautionaryNotes: [
      "Avoid drinking strong tea or coffee along with iron-rich meals (tannins inhibit iron absorption).",
      "Pair iron foods (spinach, lentils) with Vitamin C (lemon juice, amla, bell peppers) to boost absorption by up to 300%.",
      "Watch sodium intake if noticing moderate ankle puffiness."
    ],
    meals: [
      {
        id: "t2-m1",
        timeSlot: "6:30 AM – 7:00 AM",
        slotName: "Early Morning",
        title: "Mineral & Energy Awakening",
        description: "Early natural sugars and micronutrient kick to start an active day.",
        recommendedDishes: [
          "1 glass warm water with 5 drops lemon juice",
          "5 soaked almonds, 2 soaked walnuts, and 2 soaked black raisins (kishmish)",
          "1 fresh ripe banana or 2 soft dates"
        ],
        keyNutrients: ["Natural Iron", "Boron", "Potassium", "Omega-3"],
        clinicalBenefit: "Soaked black raisins provide quick non-heme iron and help stimulate regular morning peristalsis.",
        chefTips: "Always discard the almond skin after soaking for easier tannin-free digestion."
      },
      {
        id: "t2-m2",
        timeSlot: "8:30 AM – 9:15 AM",
        slotName: "Breakfast",
        title: "High-Protein Supergrain Power Breakfast",
        description: "Substantial breakfast packing sustained energy, iron, and rich calcium.",
        recommendedDishes: [
          "Ragi (Finger Millet) & Spinach Dosa with fresh mint-coconut chutney and sambar",
          "Paneer & Vegetable Paratha cooked with light ghee + 1 bowl fresh homemade curd",
          "2 Boiled Eggs (well-cooked yolk) with 100% whole grain toast and sauteed mushrooms"
        ],
        keyNutrients: ["Calcium (340mg)", "Protein (18g)", "Choline", "Dietary Iron"],
        clinicalBenefit: "Ragi is the highest plant-based calcium source (344mg per 100g), building strong fetal bones.",
        chefTips: "Grate fresh carrots and spinach directly into the dosa batter for added beta-carotene."
      },
      {
        id: "t2-m3",
        timeSlot: "11:00 AM – 11:30 AM",
        slotName: "Mid-Morning Snack",
        title: "Antioxidant & Hydration Infusion",
        description: "Fresh vitamin C rich fruits that prepare the gut for iron absorption at lunch.",
        recommendedDishes: [
          "1 bowl fresh Guava / Sweet Orange / Papaya (fully ripe yellow only) cubes",
          "1 glass fresh buttermilk (chaas) tempered with curry leaves and mustard seeds",
          "Chia seed pudding prepared with pasteurized milk and strawberry garnish"
        ],
        keyNutrients: ["Vitamin C", "Pectin Fiber", "Lactic Probiotics"],
        clinicalBenefit: "High dietary fiber keeps digestive transit active and avoids constipation from prenatal iron supplements.",
        chefTips: "Eating fresh fruit whole is much better than straining into juice because the dietary fiber remains intact."
      },
      {
        id: "t2-m4",
        timeSlot: "1:00 PM – 2:00 PM",
        slotName: "Lunch",
        title: "Wholesome Maternal Power Thali",
        description: "A complete nutrient-dense plate ensuring steady glycemic index and maximum iron bioavailability.",
        recommendedDishes: [
          "2 Multigrain / Jowar Rotis with Palak Dal, Aloo Methi sabzi, and cucumber koshimbir",
          "Brown Rice / Quinoa Bowl with grilled chicken breast / grilled paneer, sauteed broccoli, and curd",
          "Traditional Tamil Lunch: Keerai Kootu (spinach lentil stew), Rice, Sundakkai Vatha Kuzhambu, Mor (buttermilk)"
        ],
        keyNutrients: ["Non-Heme Iron", "Lean Protein (22g)", "Calcium", "Zinc"],
        clinicalBenefit: "Squeezing fresh lemon over your dal/sabzi instantly converts ferric iron to the easily absorbed ferrous state.",
        chefTips: "Cook in a cast-iron skillet (kadai) to naturally fortify meals with trace dietary iron."
      },
      {
        id: "t2-m5",
        timeSlot: "4:30 PM – 5:15 PM",
        slotName: "Evening Snack",
        title: "Brain Booster & Crunch Snack",
        description: "Crunchy, healthy snack curbing gestational evening hunger spikes without empty calories.",
        recommendedDishes: [
          "Sprouted Green Moong Salad with chopped cucumber, tomatoes, lemon juice, and chaat masala",
          "Roasted Lotus Seeds (Makhana) tossed in ghee with rock salt and roasted peanuts",
          "Warm cup of Decaf Turmeric Latte or Herbal Rooibos tea with 2 oatmeal cookies"
        ],
        keyNutrients: ["Sprouted Enzymes", "Magnesium", "Flavonoids"],
        clinicalBenefit: "Sprouting green gram increases vitamin C content and reduces phytates that block mineral uptake.",
        chefTips: "Lightly steam sprouted moong for 3 minutes if raw sprouts feel heavy on your digestion."
      },
      {
        id: "t2-m6",
        timeSlot: "7:45 PM – 8:30 PM",
        slotName: "Dinner",
        title: "Comforting Digestible Protein Dinner",
        description: "Nourishing dinner that supplies tissue-building amino acids without heaviness.",
        recommendedDishes: [
          "Vegetable & Soya / Paneer Pulao served with cucumber-onion raita",
          "2 soft Phulkas with Dal Makhani (low butter, high lentil) and Steamed Beans Poriyal",
          "Light Fish Curry (well-cooked freshwater Rohu or Salmon) with steamed rice and cabbage thoran"
        ],
        keyNutrients: ["DHA", "Complete Amino Acids", "Phosphorus"],
        clinicalBenefit: "Salmon or cooked freshwater fish delivers preformed DHA directly used for fetal neuronal arborization.",
        chefTips: "Ensure fish is thoroughly cooked to an internal temperature of at least 63°C (145°F)."
      },
      {
        id: "t2-m7",
        timeSlot: "9:45 PM – 10:15 PM",
        slotName: "Bedtime Drink",
        title: "Calcium & Sleep Mineral Fortifier",
        description: "Sustains overnight bone remineralization and calms restless legs.",
        recommendedDishes: [
          "1 cup warm pasteurized milk with a pinch of Turmeric (Haldi), Cardamom, and 1 tsp crushed almonds",
          "Warm chamomile tea with a splash of oat milk (caffeine-free)"
        ],
        keyNutrients: ["Curcumin", "Calcium (300mg)", "Bioactive Peptides"],
        clinicalBenefit: "Calcium taken at night is efficiently absorbed and helps prevent middle-of-the-night calf cramps.",
        chefTips: "Add a microscopic pinch of black pepper to turmeric milk to enhance curcumin absorption by 2000%."
      }
    ]
  },
  {
    trimester: 3,
    trimesterTitle: "Third Trimester: Peak Baby Weight & Delivery Prep",
    weeksRange: "Weeks 28 – 40+",
    clinicalTheme: "Baby gains ~200-250g per week. Growing uterus compresses stomach and diaphragm, making smaller, frequent, high-density meals essential to avoid heartburn and breathlessness.",
    keyMaternalFocus: [
      "Frequent small, high-density meals to relieve acid reflux and stomach compression",
      "Prebiotic & Soluble Fiber to prevent hemorrhoids and late-stage constipation",
      "Omega-3 DHA for explosive third-trimester fetal brain growth",
      "Gentle labor-preparatory foods (dates from week 36 onwards, hydration)"
    ],
    dailyHydrationTarget: "3.0 – 3.2 Liters (Water, coconut water, barley water, ginger infusions)",
    nutritionalPriorities: [
      { nutrient: "Omega-3 DHA", dailyTarget: "300 mg", whyNeeded: "Brain weight triples during the 3rd trimester; critical for cerebral synapse development." },
      { nutrient: "Dietary Fiber", dailyTarget: "30 – 35 g", whyNeeded: "High progesterone and abdominal pressure slow bowel motility; fiber prevents constipation." },
      { nutrient: "Vitamin K", dailyTarget: "90 µg", whyNeeded: "Essential for neonatal blood clotting pathways and maternal post-delivery recovery." },
      { nutrient: "Choline", dailyTarget: "450 mg", whyNeeded: "Supports placental gene expression and lifelong cognitive memory foundation." }
    ],
    cautionaryNotes: [
      "Never lie flat right after eating; maintain an upright sitting posture for 45 minutes to prevent acid regurgitation.",
      "Limit high-sodium processed foods to manage physiological third-trimester peripheral edema.",
      "Consult your obstetrician before starting evening primrose or raspberry leaf teas."
    ],
    meals: [
      {
        id: "t3-m1",
        timeSlot: "6:30 AM – 7:00 AM",
        slotName: "Early Morning",
        title: "Peristalsis & Bowel Awakening",
        description: "Stimulates sluggish late-pregnancy digestive transit and supplies instantaneous morning energy.",
        recommendedDishes: [
          "1 glass warm water with 1 tsp soaked chia seeds or basil seeds (sabja)",
          "3 soft Medjool dates (especially recommended from week 36 onward) + 5 soaked almonds",
          "Fresh cut sweet kiwi or papaya (strictly fully ripe orange only)"
        ],
        keyNutrients: ["Mucilage Fiber", "Natural Fructose", "Magnesium"],
        clinicalBenefit: "Clinical trials show consuming 3-4 dates daily in the final 4 weeks improves cervical ripening and labor progression.",
        chefTips: "Soaking chia seeds overnight creates a soothing gel coating that lubricates the gastrointestinal tract."
      },
      {
        id: "t3-m2",
        timeSlot: "8:30 AM – 9:15 AM",
        slotName: "Breakfast",
        title: "Compact High-Density Protein Breakfast",
        description: "Portion is kept compact to avoid post-prandial diaphragmatic fullness.",
        recommendedDishes: [
          "Vegetable Oats & Moong Dal Khichdi cooked soft with grated ginger and ghee",
          "2 Egg Omelette (well-cooked) packed with diced bell peppers, spinach, and cheese + 1 toast",
          "Poha (Flattened rice) loaded with peanuts, green peas, carrots, and fresh lemon juice"
        ],
        keyNutrients: ["Choline (250mg)", "Bioavailable Iron", "Complex Carbohydrates"],
        clinicalBenefit: "Poha cooked with peanuts and lemon juice is an Indian classic superfood delivering easy-to-digest iron.",
        chefTips: "Eat slowly, chew each bite 20 times, and refrain from drinking a tall glass of water during the meal."
      },
      {
        id: "t3-m3",
        timeSlot: "11:00 AM – 11:30 AM",
        slotName: "Mid-Morning Snack",
        title: "Hydrating Edema-Control Snack",
        description: "Natural mild diuretic hydration to flush excess fluid retention without pharmaceutical stress.",
        recommendedDishes: [
          "Fresh Tender Coconut Water with a slice of lime",
          "1 bowl fresh watermelon cubes (natural lycopene & hydration)",
          "1 glass fresh cooling cucumber & mint blended cooler"
        ],
        keyNutrients: ["Potassium", "Lycopene", "Hydration Fluids"],
        clinicalBenefit: "High potassium balances maternal sodium, reducing swollen feet and physiological edema.",
        chefTips: "Avoid adding table salt to fresh fruit platters to keep sodium load minimal."
      },
      {
        id: "t3-m4",
        timeSlot: "1:00 PM – 1:45 PM",
        slotName: "Lunch",
        title: "Heartburn-Safe Balanced Plate",
        description: "Easily digestible proteins paired with low-acid vegetables and cooling probiotics.",
        recommendedDishes: [
          "2 soft Phulkas with Paneer & Spinach sabzi, Yellow Dal, and fresh homemade Curd",
          "Steamed Rice with Drumstick (Murungakkai) Sambar, Beetroot Poriyal, and Cumin Rasam",
          "Grilled Tofu or Chicken bowl with roasted sweet potato mash and sauteed zucchini"
        ],
        keyNutrients: ["Calcium", "Folate", "Beta-Carotene", "Probiotics"],
        clinicalBenefit: "Drumsticks provide high bioavailable calcium, phosphorus, and vitamin C for baby's final bone hardening.",
        chefTips: "Keep gravies non-oily and avoid red chili powder; use cumin, coriander, and turmeric for flavor."
      },
      {
        id: "t3-m5",
        timeSlot: "4:30 PM – 5:00 PM",
        slotName: "Evening Snack",
        title: "Brain-DHA & Satiety Recharger",
        description: "Provides concentrated calories and essential fatty acids in a small, easily digestible volume.",
        recommendedDishes: [
          "Avocado & Paneer Toast on seeded whole wheat sourdough bread",
          "Handful of walnuts, pumpkin seeds, sunflower seeds, and dried figs (anjeer)",
          "1 cup warm vegetable broth with boiled sweet corn and carrots"
        ],
        keyNutrients: ["Plant DHA Precursors", "Zinc", "Fiber"],
        clinicalBenefit: "Zinc from pumpkin seeds supports cellular division and optimal immune barrier preparation for delivery.",
        chefTips: "Figs (anjeer) are powerhouse sources of calcium and soluble fiber; soak 2 figs in water for soft chewing."
      },
      {
        id: "t3-m6",
        timeSlot: "7:15 PM – 8:00 PM",
        slotName: "Dinner",
        title: "Early Heartburn-Free Soothing Dinner",
        description: "Served strictly before 8 PM to allow 2.5 hours of digestion before sleep.",
        recommendedDishes: [
          "Warm Mixed Vegetable Soup with 1 soft Ragi Roti / Jowar Bhakri and tender green dal",
          "Moong Dal Khichdi cooked with diced carrots, peas, and 1 tsp cow ghee",
          "Soft Idlis with vegetable sambar and coriander chutney"
        ],
        keyNutrients: ["Easy-to-digest Amino Acids", "Potassium", "Gentle Fiber"],
        clinicalBenefit: "Light dinners allow the diaphragm to relax, drastically improving third-trimester sleep quality and breathing.",
        chefTips: "Take a gentle 15-minute indoor stroll after dinner; avoid lying down on the couch immediately."
      },
      {
        id: "t3-m7",
        timeSlot: "9:30 PM – 10:00 PM",
        slotName: "Bedtime Drink",
        title: "Cramp Relief & Deep Sleep Tonic",
        description: "Calms nocturnal uterine braxton-hicks sensations and prevents sleep interruptions.",
        recommendedDishes: [
          "1 cup warm pasteurized milk with a pinch of Nutmeg (jaiphal), Cardamom, and 2 saffron strands",
          "Warm almond milk with 1/2 tsp roasted fennel (saunf) powder for digestive calm"
        ],
        keyNutrients: ["Magnesium", "Melatonin Precursors", "Calcium"],
        clinicalBenefit: "Fennel relaxes smooth gastrointestinal muscles, preventing late-night gas pains and bloating.",
        chefTips: "Sleep on your left side (Left Lateral Position) with a pregnancy pillow between knees for peak placental blood flow."
      }
    ]
  }
];

export type MaternalConditionType = "standard" | "gdm" | "anemia" | "nausea";

export interface ConditionGuidance {
  id: MaternalConditionType;
  name: string;
  badge: string;
  color: string;
  clinicalSummary: string;
  keyRule: string;
  substitutions: {
    slotName: string;
    advice: string;
  }[];
}

export const CONDITION_GUIDANCE_PROFILES: Record<MaternalConditionType, ConditionGuidance> = {
  standard: {
    id: "standard",
    name: "Standard Balanced Diet",
    badge: "Balanced Health",
    color: "rose",
    clinicalSummary: "Optimal whole-food balance designed to nourish both mother and baby throughout typical gestational development.",
    keyRule: "Prioritize diverse micronutrients: Folate (600µg), Elemental Iron (27mg), Calcium (1000mg) and 2.5–3L pure hydration daily.",
    substitutions: []
  },
  gdm: {
    id: "gdm",
    name: "Gestational Diabetes (GDM)",
    badge: "Sugar-Safe Low GI",
    color: "amber",
    clinicalSummary: "Stabilizes postprandial glucose surges, blunts insulin resistance, and reduces fetal macrosomia risks.",
    keyRule: "Replace simple sugars and white rice with low-GI millets (Ragi, Foxtail, Jowar). Always pair carbohydrates with protein and healthy fats.",
    substitutions: [
      { slotName: "Breakfast", advice: "Swap white rice idli/dosa for Sprouted Moong Chilla or Vegetable Oats Upma topped with flaxseeds." },
      { slotName: "Mid-Morning Snack", advice: "Avoid fruit juices or high-sugar fruits like mango/sapota. Choose roasted Makhana with 8 almonds or Greek curd." },
      { slotName: "Lunch", advice: "Limit brown/white rice to 1/2 cup; double your salad and Dal/Paneer portion to stabilize glycemic response." },
      { slotName: "Evening Snack", advice: "Boiled chana sundal or roasted pumpkin seeds instead of biscuits or sweetened drinks." },
      { slotName: "Dinner", advice: "Strictly finish dinner by 7:30 PM. 2 Multigrain rotis with leafy greens sabzi and paneer curry." }
    ]
  },
  anemia: {
    id: "anemia",
    name: "Iron-Deficiency Anemia",
    badge: "Hemoglobin Booster",
    color: "emerald",
    clinicalSummary: "Accelerates red blood cell synthesis, reverses maternal exhaustion, and protects placental oxygen delivery.",
    keyRule: "Pair non-heme plant iron with Vitamin C (lemon squeeze, amla) for 300% greater absorption. Never drink tea, coffee, or calcium pills within 2 hours of iron meals.",
    substitutions: [
      { slotName: "Early Morning", advice: "Add 2 soaked black raisins and 1 soaked fig (anjeer) alongside warm lemon water." },
      { slotName: "Breakfast", advice: "Choose Ragi Spinach Dosa or Beetroot-Moong Chilla squeezed with fresh lemon." },
      { slotName: "Mid-Morning Snack", advice: "1 glass of fresh amla-pomegranate juice or Murungai Keerai (moringa leaf) clear soup." },
      { slotName: "Lunch", advice: "Iron-rich Dal Palak Khichdi or Green Moong with squeeze of lime; avoid curd or dairy during this meal to prevent calcium interference." },
      { slotName: "Bedtime Drink", advice: "Consume your daily calcium supplement now with bedtime milk, far away from your daytime iron-rich lunch!" }
    ]
  },
  nausea: {
    id: "nausea",
    name: "Nausea & Acid Reflux Relief",
    badge: "Gentle Gastric Soother",
    color: "sky",
    clinicalSummary: "Alleviates first and third trimester hyperemesis, morning nausea, and painful diaphragmatic acid reflux.",
    keyRule: "Eat dry, bland complex carbs before getting out of bed. Eat small portions every 2 hours; never drink fluids while chewing food.",
    substitutions: [
      { slotName: "Early Morning", advice: "Chew 2 dry whole-wheat crackers or roasted makhana 15 minutes BEFORE swinging legs out of bed." },
      { slotName: "Breakfast", advice: "Steamed plain idli with mild coconut chutney or warm ginger-infused oats porridge. Avoid strong tadka or garlic aromas." },
      { slotName: "Mid-Morning Snack", advice: "Sip room-temperature tender coconut water or ginger-mint lemonade in tiny slow sips through a straw." },
      { slotName: "Lunch", advice: "Very light yellow moong dal with soft mashed rice and 1/2 tsp ghee; avoid deep-fried gravies and hot spices." },
      { slotName: "Bedtime Drink", advice: "Warm fennel (saunf) and cumin water with 1/2 tsp honey to relax the esophageal sphincter." }
    ]
  }
};
