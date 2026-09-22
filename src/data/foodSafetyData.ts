export interface FoodSafetyItem {
  id: string;
  food: string;
  category: "Fruits" | "Dairy" | "Spices & Herbs" | "Protein & Nuts" | "Seafood & Meat" | "Beverages";
  status: "safe" | "moderation" | "avoid";
  limitOrRule: string;
  explanation: string;
  safeAlternative?: string;
  keyNutrients?: string[];
}

export const EXPANDED_FOOD_SAFETY_DATABASE: FoodSafetyItem[] = [
  // --- FRUITS ---
  {
    id: "fs-1",
    food: "Ripe Papaya (Golden Yellow / Orange)",
    category: "Fruits",
    status: "safe",
    limitOrRule: "1 cup (150g) fully ripe fruit 2–3 times a week",
    explanation: "Fully ripe papaya has completely degraded latex levels and is rich in beta-carotene, vitamin C, folate, and dietary fiber. It is gentle on digestion and prevents pregnancy constipation.",
    safeAlternative: "Ensure skin is completely yellow/orange with no green patches.",
    keyNutrients: ["Vitamin C", "Folate", "Fiber", "Potassium"]
  },
  {
    id: "fs-2",
    food: "Raw / Unripe Green Papaya",
    category: "Fruits",
    status: "avoid",
    limitOrRule: "STRICTLY AVOID throughout pregnancy",
    explanation: "Unripe green papaya contains concentrated milky white latex and papain enzymes. Latex acts as a potent prostaglandin and oxytocin stimulator, triggering uterine contractions and increasing miscarriage or premature labor risks.",
    safeAlternative: "Consume sweet, fully ripe yellow papaya or cooked squash instead.",
    keyNutrients: ["Papain enzyme (Abortifacient risk)"]
  },
  {
    id: "fs-3",
    food: "Pineapple (Fresh)",
    category: "Fruits",
    status: "moderation",
    limitOrRule: "Limit to 1–2 fresh slices occasionally",
    explanation: "Pineapple contains the proteolytic enzyme bromelain. While theoretical laboratory models link bromelain to cervical softening, culinary servings (1–2 slices) do not contain enough bromelain to trigger labor. However, avoid high-dose pineapple core juice extracts.",
    safeAlternative: "Sweet oranges, sweet lime (mosambi), or watermelon.",
    keyNutrients: ["Bromelain", "Vitamin C", "Manganese"]
  },
  {
    id: "fs-4",
    food: "Watermelon",
    category: "Fruits",
    status: "safe",
    limitOrRule: "1–2 cups daily during warm days",
    explanation: "Superb hydration fruit containing 92% water. Highly rich in lycopene (antioxidant) and potassium. Relieves morning sickness, heartburn, and reduces third-trimester leg swelling (edema).",
    keyNutrients: ["Lycopene", "Hydration Fluids", "Potassium", "Vitamin A"]
  },
  {
    id: "fs-5",
    food: "Bananas",
    category: "Fruits",
    status: "safe",
    limitOrRule: "1–2 bananas daily",
    explanation: "One of the best pregnancy superfoods. Rich in Vitamin B6 (mitigates first-trimester nausea), potassium (prevents nocturnal calf cramps), and pectin fiber (promotes smooth stool transit).",
    keyNutrients: ["Vitamin B6", "Potassium", "Folate", "Pectin"]
  },
  {
    id: "fs-6",
    food: "Grapes (Especially in 3rd Trimester)",
    category: "Fruits",
    status: "moderation",
    limitOrRule: "Limit to a small cup (10–12 grapes) / Avoid unripe sour grapes",
    explanation: "Grapes contain resveratrol which in high supplemental amounts raises fetal concerns; sour grapes also aggravate heartburn and late-pregnancy acidity. Consume in moderation and wash thoroughly to remove pesticide residues.",
    safeAlternative: "Blueberries, strawberries, or pomegranate arils.",
    keyNutrients: ["Resveratrol", "Antioxidants"]
  },
  {
    id: "fs-7",
    food: "Dates (Khajoor)",
    category: "Fruits",
    status: "safe",
    limitOrRule: "2–3 daily in T1/T2; 4–6 daily from Week 36 onwards",
    explanation: "Rich in iron, magnesium, and natural fiber. Landmark clinical trials demonstrate that consuming 4–6 dates daily in the final 4 weeks of gestation significantly enhances cervical dilation, reduces labor duration, and lowers induction rates.",
    keyNutrients: ["Non-heme Iron", "Fiber", "Magnesium", "Natural Fructose"]
  },

  // --- DAIRY & PROBIOTICS ---
  {
    id: "fs-8",
    food: "Pasteurized Curd / Greek Yogurt",
    category: "Dairy",
    status: "safe",
    limitOrRule: "1–2 bowls (150–200g) daily with meals",
    explanation: "Outstanding source of bioavailable calcium, complete protein, and active live lactic acid bacteria (probiotics). Keeps vaginal yeast infections at bay and optimizes gut nutrient absorption.",
    keyNutrients: ["Live Probiotics", "Calcium (250mg/cup)", "Protein (10g)"]
  },
  {
    id: "fs-9",
    food: "Fresh Cooked Paneer (Cottage Cheese)",
    category: "Dairy",
    status: "safe",
    limitOrRule: "50–100g cooked paneer 3–4 times weekly",
    explanation: "Excellent vegetarian protein and calcium builder, provided it is prepared from pasteurized milk and thoroughly cooked (paneer bhurji, tikka, curry). Do not consume stale or raw refrigerated street paneer.",
    keyNutrients: ["Complete Protein", "Calcium", "Phosphorus"]
  },
  {
    id: "fs-10",
    food: "Unpasteurized Soft Cheese (Brie, Feta, Camembert, Blue)",
    category: "Dairy",
    status: "avoid",
    limitOrRule: "STRICTLY AVOID unless cooked bubbling hot (>75°C)",
    explanation: "Unpasteurized soft cheeses harbor high contamination risk for Listeria monocytogenes. Listeria bacteria penetrate the placenta, leading to listeriosis, septicemia, spontaneous miscarriage, or fetal stillbirth.",
    safeAlternative: "Pasteurized hard cheddar, mozzarella, or pasteurized cottage cheese.",
    keyNutrients: ["Listeria monocytogenes (Pathogen risk)"]
  },
  {
    id: "fs-11",
    food: "Raw Unpasteurized Milk",
    category: "Dairy",
    status: "avoid",
    limitOrRule: "STRICTLY AVOID direct consumption",
    explanation: "Unboiled, unpasteurized milk can carry Salmonella, E. coli, Campylobacter, and Listeria. Always boil farm milk vigorously for at least 3–5 minutes before drinking.",
    safeAlternative: "Commercial pasteurized toned or full-cream milk, thoroughly boiled.",
    keyNutrients: ["Bacterial Pathogen Risk"]
  },

  // --- HERBS, SPICES & TRADITIONAL ---
  {
    id: "fs-12",
    food: "Saffron (Kesar)",
    category: "Spices & Herbs",
    status: "moderation",
    limitOrRule: "Strictly 2–3 strands infused in warm milk (never heavy medicinal doses)",
    explanation: "A traditional maternal mood enhancer that aids digestion and blood pressure regulation when used as 2–3 fragrant strands in bedtime milk. Excessive doses (>10g) are toxic and stimulate uterine hyper-motility.",
    keyNutrients: ["Crocin", "Safranal", "Antioxidants"]
  },
  {
    id: "fs-13",
    food: "Fenugreek Seeds (Methi / Vendhayam)",
    category: "Spices & Herbs",
    status: "moderation",
    limitOrRule: "Safe as pinch in cooking tadka; avoid concentrated methi water/powders in early pregnancy",
    explanation: "Fenugreek contains phytoestrogens and saponins with mild oxytocic uterine stimulation effects when consumed in heavy medicinal quantities. Standard culinary seasoning (e.g. In sambar or kootu) is completely safe.",
    safeAlternative: "Cumin seeds (jeera) or fennel seeds (saunf) for digestion.",
    keyNutrients: ["Diosgenin", "Soluble Galactomannan Fiber"]
  },
  {
    id: "fs-14",
    food: "Ajwain (Carom Seeds / Omam)",
    category: "Spices & Herbs",
    status: "safe",
    limitOrRule: "1/4 tsp boiled in water or used in paratha/dal tempering",
    explanation: "Thymol in ajwain relieves severe pregnancy gas, flatulence, and indigestion. It is a time-tested Indian household remedy for maternal gastrointestinal spasms.",
    keyNutrients: ["Thymol", "Digestive Carminatives"]
  },
  {
    id: "fs-15",
    food: "Fresh Ginger (Adrak)",
    category: "Spices & Herbs",
    status: "safe",
    limitOrRule: "Up to 1 gram fresh grated root daily (equivalent to 2–3 cups ginger tea)",
    explanation: "Gold standard evidence-based natural remedy for hyperemesis gravidarum (morning sickness). Active gingerols block serotonin receptors in the gut, silencing the vomiting reflex.",
    keyNutrients: ["Gingerols", "Shogaols", "Anti-emetics"]
  },
  {
    id: "fs-16",
    food: "Tulsi (Holy Basil)",
    category: "Spices & Herbs",
    status: "moderation",
    limitOrRule: "Limit to 1–2 occasional leaves in tea; avoid daily large decoctions",
    explanation: "Tulsi contains eugenol and compounds that may lower blood sugar and can cause mild uterine contractions in excessive doses. Avoid concentrated medicinal tulsi tinctures during pregnancy.",
    safeAlternative: "Fresh mint (pudina) or ginger herbal infusion.",
    keyNutrients: ["Eugenol", "Ursolic acid"]
  },
  {
    id: "fs-17",
    food: "Fennel Seeds (Saunf / Sombu)",
    category: "Spices & Herbs",
    status: "safe",
    limitOrRule: "1/2 tsp chewed after meals or infused in warm water",
    explanation: "Excellent carminative that cools the digestive tract, soothes acid reflux, sweetens breath, and relieves bloating without triggering uterine sensitivity in culinary amounts.",
    keyNutrients: ["Anethole", "Volatile Oils", "Flavonoids"]
  },

  // --- PROTEIN, NUTS & SEEDS ---
  {
    id: "fs-18",
    food: "Overnight Soaked & Peeled Almonds (Badam)",
    category: "Protein & Nuts",
    status: "safe",
    limitOrRule: "5–8 soaked almonds every morning",
    explanation: "Soaking removes enzyme inhibitors (tannins and phytic acid) in the skin, releasing maximum vitamin E, plant protein, magnesium, and dietary calcium for fetal brain cell construction.",
    keyNutrients: ["Vitamin E", "Magnesium", "Plant Protein", "Riboflavin"]
  },
  {
    id: "fs-19",
    food: "Walnuts (Akhrot)",
    category: "Protein & Nuts",
    status: "safe",
    limitOrRule: "3–4 whole walnut halves daily",
    explanation: "Highest nut source of Alpha-Linolenic Acid (plant Omega-3). Vital for early neurodevelopment, cognitive vision synthesis, and maternal cholesterol balance.",
    keyNutrients: ["Omega-3 ALA", "Melatonin", "Polyphenols"]
  },
  {
    id: "fs-20",
    food: "Hard-Boiled Eggs (Fully Cooked Yolk & White)",
    category: "Protein & Nuts",
    status: "safe",
    limitOrRule: "1–2 eggs daily",
    explanation: "The ultimate prenatal brain fuel. Eggs are one of the very few dietary sources dense in Choline (147mg/egg), critical for closing the neural tube and establishing lifelong cognitive memory capacity.",
    keyNutrients: ["Choline (147mg)", "Complete Protein (6g)", "Vitamin B12", "Lutein"]
  },
  {
    id: "fs-21",
    food: "Soft-Boiled, Poached, or Runny Raw Eggs",
    category: "Protein & Nuts",
    status: "avoid",
    limitOrRule: "STRICTLY AVOID runny eggs, homemade raw mayonnaise, and eggnog",
    explanation: "Undercooked egg yolks carry virulent Salmonella enterica strains. Salmonella food poisoning causes severe maternal dehydration, high fever, delirium, vomiting, and can induce premature labor.",
    safeAlternative: "Hard-boiled eggs, fully set omelettes, or scrambled eggs cooked solid.",
    keyNutrients: ["Salmonella enterica (Infection risk)"]
  },
  {
    id: "fs-22",
    food: "Chia Seeds & Flaxseeds (Soaked / Ground)",
    category: "Protein & Nuts",
    status: "safe",
    limitOrRule: "1 tablespoon soaked chia or 1 tsp roasted ground flaxseed daily",
    explanation: "Powerhouse sources of soluble mucilage fiber and omega-3 fatty acids. Creates a protective gel coating in the stomach that treats chronic pregnancy constipation and acid burn.",
    keyNutrients: ["Soluble Fiber", "Omega-3", "Lignans", "Iron"]
  },
  {
    id: "fs-23",
    food: "Peanuts (Groundnuts)",
    category: "Protein & Nuts",
    status: "safe",
    limitOrRule: "Handful (25g) boiled or dry-roasted peanuts daily",
    explanation: "Unless you have a diagnosed maternal peanut allergy, maternal peanut consumption is safe and rich in folate, biotin, and protein. Studies indicate prenatal peanut consumption does not cause childhood allergy.",
    keyNutrients: ["Folate", "Biotin", "Monounsaturated Fats"]
  },

  // --- SEAFOOD & POULTRY ---
  {
    id: "fs-24",
    food: "Well-Cooked Salmon & Freshwater Rohu/Katla",
    category: "Seafood & Meat",
    status: "safe",
    limitOrRule: "2 portions (200–250g total) per week, thoroughly cooked",
    explanation: "Low-mercury fish varieties loaded with preformed marine EPA and DHA Omega-3 fatty acids. Dramatically supports fetal visual acuity, central nervous system development, and prevents maternal postpartum depression.",
    keyNutrients: ["DHA (Docosahexaenoic Acid)", "EPA", "Vitamin D", "Selenium"]
  },
  {
    id: "fs-25",
    food: "Raw Fish, Sashimi & Sushi",
    category: "Seafood & Meat",
    status: "avoid",
    limitOrRule: "STRICTLY AVOID uncooked, cured, or raw seafood",
    explanation: "Raw fish harbors Listeria monocytogenes, Salmonella, Vibrio vulnificus, and parasitic roundworms that bypass maternal defense systems and cross the placental membrane.",
    safeAlternative: "Fully cooked grilled, steamed, or baked fish cooked to >63°C (145°F).",
    keyNutrients: ["Listeria & Parasitic Toxins"]
  },
  {
    id: "fs-26",
    food: "High-Mercury Fish (King Mackerel, Shark, Swordfish, Tilefish)",
    category: "Seafood & Meat",
    status: "avoid",
    limitOrRule: "STRICTLY AVOID throughout pregnancy and lactation",
    explanation: "Apex predatory ocean fish bioaccumulate heavy concentrations of methylmercury. Methylmercury easily crosses the blood-brain and placental barriers, irreversibly damaging the baby's developing brain and nervous system.",
    safeAlternative: "Salmon, sardines, freshwater trout, shrimp (all well-cooked).",
    keyNutrients: ["Methylmercury (Neurotoxin)"]
  },
  {
    id: "fs-27",
    food: "Thoroughly Cooked Chicken & Mutton",
    category: "Seafood & Meat",
    status: "safe",
    limitOrRule: "100–150g portion, well-cooked, avoiding burnt char",
    explanation: "Supreme source of readily absorbed heme iron and complete animal protein. Helps build high maternal hemoglobin to meet placental blood exchange demands. Ensure zero pinkness in the center.",
    keyNutrients: ["Heme Iron", "Complete Protein", "Vitamin B12", "Zinc"]
  },

  // --- BEVERAGES & TEAS ---
  {
    id: "fs-28",
    food: "Fresh Tender Coconut Water (Elaneer / Nariyal Pani)",
    category: "Beverages",
    status: "safe",
    limitOrRule: "1 tender coconut (250–300ml) daily, preferably in morning or mid-day",
    explanation: "Nature's premier isotonic beverage. Rich in bio-potassium, magnesium, and chloride. Rehydrates immediately, calms gastrointestinal burning, eases morning nausea, and replenishes amniotic fluid.",
    keyNutrients: ["Potassium (600mg)", "Magnesium", "Natural Electrolytes"]
  },
  {
    id: "fs-29",
    food: "Caffeinated Coffee & Black/Milk Tea",
    category: "Beverages",
    status: "moderation",
    limitOrRule: "Limit to strictly < 200 mg caffeine/day (~1 small cup of coffee or 2 light cups of tea)",
    explanation: "Caffeine readily traverses the placental villi. Because the fetal liver lacks the CYP1A2 enzyme to metabolize caffeine, excessive intake (>200mg/day) constricts placental blood vessels and is associated with low birth weight and fetal tachycardia.",
    safeAlternative: "Decaf coffee, caffeine-free herbal teas, or warm turmeric milk.",
    keyNutrients: ["Caffeine (Vasoconstrictor)"]
  },
  {
    id: "fs-30",
    food: "Alcohol (Wine, Beer, Spirits)",
    category: "Beverages",
    status: "avoid",
    limitOrRule: "ZERO SAFE AMOUNT - Strictly Avoid Entirely",
    explanation: "Alcohol diffuses freely across the placenta. Fetal Alcohol Spectrum Disorder (FASD) causes irreversible facial dysmorphology, microcephaly, profound intellectual disability, and structural heart defects. There is no known safe trimester or quantity.",
    safeAlternative: "Sparkling water with fresh mint, lime, and crushed pomegranate.",
    keyNutrients: ["Teratogenic Neurotoxin"]
  },
  {
    id: "fs-31",
    food: "Chamomile & Peppermint Tea",
    category: "Beverages",
    status: "safe",
    limitOrRule: "1 cup daily, mildly brewed",
    explanation: "Naturally caffeine-free herbal options. Peppermint relaxes esophageal spasms and morning nausea; chamomile calms the nervous system and encourages deep sleep.",
    keyNutrients: ["Apigenin", "Menthol", "Flavonoids"]
  },
  {
    id: "fs-32",
    food: "Cooked Drumstick & Moringa Leaves (Murungai)",
    category: "Spices & Herbs",
    status: "safe",
    limitOrRule: "1 cup cooked drumstick / moringa leaves in soup or sambar 2–3 times a week",
    explanation: "Powerhouse of bioavailable plant iron, calcium, vitamin C, and folate. Highly revered in traditional maternal diets to elevate hemoglobin levels and prepare the body for lactation. Ensure thoroughly cooked.",
    safeAlternative: "Cooked in dal, sambar, or light peppery soup.",
    keyNutrients: ["Bioavailable Iron", "Calcium", "Vitamin C", "Folate"]
  },
  {
    id: "fs-33",
    food: "Castor Oil (Vilakkennai)",
    category: "Beverages",
    status: "avoid",
    limitOrRule: "STRICTLY AVOID throughout pregnancy",
    explanation: "Historically used in folk traditions to induce labor, castor oil causes severe maternal diarrhea, severe dehydration, and dangerous unpredictable uterine hyperstimulation that can lead to fetal distress and meconium aspiration.",
    safeAlternative: "Safe dietary fiber (prunes, isabgol, soaked chia seeds) for bowel regularity under doctor supervision.",
    keyNutrients: ["Ricinoleic acid (Violent purgative & uterotonic)"]
  },
  {
    id: "fs-34",
    food: "Traditional Jaggery & Palm Jaggery (Vellam / Karupatti)",
    category: "Spices & Herbs",
    status: "moderation",
    limitOrRule: "1–2 teaspoons daily in milk or cooking; monitor blood sugar if diagnosed with GDM",
    explanation: "Natural unrefined sweetener packed with iron, potassium, and magnesium. Helps prevent pregnancy anemia and aids digestion when consumed in culinary amounts.",
    safeAlternative: "Soaked dates or black raisins for natural sweetness.",
    keyNutrients: ["Plant Iron", "Potassium", "Magnesium"]
  },
  {
    id: "fs-35",
    food: "Street Pani Puri, Chaat & Uncooked Chutneys",
    category: "Beverages",
    status: "avoid",
    limitOrRule: "STRICTLY AVOID street-side versions; prepare hygienically at home",
    explanation: "Street pani puri water and unpasteurized tamarind/mint chutneys have extremely high rates of contamination with E. Coli, Salmonella, and Hepatitis A, which can cause severe maternal gastroenteritis and typhoid.",
    safeAlternative: "Homemade pani puri made with RO-purified/boiled water and pressure-cooked potatoes/chana.",
    keyNutrients: ["Waterborne Pathogen Risk"]
  },
  {
    id: "fs-36",
    food: "Asafoetida (Hing / Perungayam)",
    category: "Spices & Herbs",
    status: "moderation",
    limitOrRule: "Safe as a tiny culinary pinch (1/8 tsp) in dal/sambar tempering; avoid heavy medicinal doses",
    explanation: "An effective carminative spice that relieves pregnancy gas and bloating. In normal small cooking amounts it is completely safe, but large supplemental doses are contraindicated as they may stimulate uterine blood flow.",
    safeAlternative: "Cumin seeds (seeragam) or carom seeds (ajwain).",
    keyNutrients: ["Ferulic acid", "Digestive Carminatives"]
  },
  {
    id: "fs-37",
    food: "Dragon Fruit (Pitaya)",
    category: "Fruits",
    status: "safe",
    limitOrRule: "1 medium fruit (150–200g) 2–3 times a week",
    explanation: "Low-glycemic exotic fruit rich in non-heme iron, vitamin C (which enhances iron uptake), magnesium, and prebiotic fiber. Helps maintain steady blood sugar levels while supporting fetal skeletal bone density.",
    keyNutrients: ["Vitamin C", "Plant Iron", "Prebiotic Fiber", "Magnesium"]
  },
  {
    id: "fs-38",
    food: "Steamed Momos & Dumplings",
    category: "Seafood & Meat",
    status: "safe",
    limitOrRule: "4–5 steamed momos from clean hygienic kitchens, served piping hot",
    explanation: "Steamed vegetable, paneer, or chicken momos are nutrient-friendly and low in fat when thoroughly cooked. Avoid raw street-side cabbage fillings, stale red chili chutneys, or undercooked meat.",
    safeAlternative: "Ensure momos are steamed >10 minutes and fillings are steaming hot (>75°C).",
    keyNutrients: ["Lean Protein", "Complex Carbs", "Vitamins"]
  },
  {
    id: "fs-39",
    food: "Ragi / Finger Millet (Kezhvaragu)",
    category: "Protein & Nuts",
    status: "safe",
    limitOrRule: "1–2 ragi dosas, ragi kali, or porridge 3–4 times weekly",
    explanation: "One of the greatest maternal supergrains on earth. Contains 344mg calcium per 100g (more than 3x milk), plus non-heme iron and low-GI dietary fiber. Crucial for building fetal bones and preventing maternal osteopenia.",
    keyNutrients: ["Calcium (344mg/100g)", "Iron", "Dietary Fiber", "Polyphenols"]
  }
];
