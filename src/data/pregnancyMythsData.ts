export interface PregnancyMythItem {
  id: string;
  myth: string;
  commonBelief: string;
  medicalFact: string;
  scientificExplanation: string;
  clinicalAdvice: string;
  category: "Spices & Herbs" | "Fats & Oils" | "Fruits & Vegetables" | "General Diet";
  verdict: "Busted" | "Nuanced Truth" | "Dangerous";
  iconName?: string;
}

export const PREGNANCY_MYTHS_DATABASE: PregnancyMythItem[] = [
  {
    id: "myth-1",
    myth: "Drinking Saffron (Kesar) Milk makes the baby fair-complexioned",
    commonBelief: "Consuming strands of saffron in warm milk during pregnancy will lighten the baby's skin tone.",
    medicalFact: "Fetal skin pigmentation is 100% determined by maternal and paternal genetics (melanin synthesis), not dietary colors.",
    scientificExplanation: "Saffron contains natural carotenoids (crocin & safranal) which cannot alter the human genetic code for melanocytes. However, in small culinary amounts (2–3 strands), saffron acts as a gentle antioxidant, aids digestion, and promotes serotonin release to improve maternal mood and sleep.",
    clinicalAdvice: "Enjoy 2–3 strands of saffron in warm milk after the 1st trimester for mild mood and digestive support, but avoid high doses (>5g) which can stimulate uterine contractions.",
    category: "Spices & Herbs",
    verdict: "Busted"
  },
  {
    id: "myth-2",
    myth: "Consuming heavy Ghee in the 9th month 'lubricates' the birth canal for easy delivery",
    commonBelief: "Drinking warm milk with large tablespoons of pure ghee in late pregnancy oils the vagina and birth canal so the baby slides out easily.",
    medicalFact: "The digestive tract and reproductive birth canal are completely separate anatomical systems; ingested fats never coat vaginal tissues.",
    scientificExplanation: "Food travels through the esophagus, stomach, and intestines. Ghee never enters or touches the vagina or cervix. Consuming 2–3 tablespoons of ghee daily in late pregnancy spikes maternal caloric excess, accelerates unwanted gestational weight gain, and triggers severe acid reflux.",
    clinicalAdvice: "Limit ghee to 1–2 teaspoons daily for essential fatty acid absorption and fat-soluble vitamins (A, D, E, K). Do not drink large quantities of melted ghee in milk.",
    category: "Fats & Oils",
    verdict: "Busted"
  },
  {
    id: "myth-3",
    myth: "All Papaya must be strictly avoided as it always causes miscarriage",
    commonBelief: "Eating even a single piece of papaya at any time during pregnancy will trigger uterine bleeding and abortion.",
    medicalFact: "Fully ripe (golden yellow / orange) papaya is completely safe, highly nutritious, and relieves pregnancy constipation.",
    scientificExplanation: "The risk comes exclusively from RAW or UNRIPE green papaya. Unripe papaya contains concentrated milky white latex and active papain enzymes which mimic prostaglandins and oxytocin, triggering uterine contractions. In fully ripe yellow papaya, latex degrades completely to undetectable, safe levels.",
    clinicalAdvice: "You can safely enjoy 1 small cup of sweet, fully ripe yellow/orange papaya. Strictly avoid green unripe papaya used in raw salads, pickles, or curries.",
    category: "Fruits & Vegetables",
    verdict: "Nuanced Truth"
  },
  {
    id: "myth-4",
    myth: "You must 'Eat for Two' by doubling your portion sizes",
    commonBelief: "Since a mother is growing a whole human being, she needs to eat twice as much food at every meal.",
    medicalFact: "Pregnancy requires only an extra ~300 to 450 calories per day from the second trimester onwards — roughly equivalent to a bowl of curd with nuts.",
    scientificExplanation: "Doubling food intake leads to excessive gestational weight gain, significantly increasing the risk of Gestational Diabetes Mellitus (GDM), preeclampsia, fetal macrosomia (>4kg baby), and emergency C-section delivery. Fetal growth depends on micronutrient density (folate, iron, calcium, choline, DHA), not caloric volume.",
    clinicalAdvice: "Focus on nutrient density over quantity. Add 1 nutrient-dense mini-snack daily (e.g., roasted makhana, boiled egg, or a fistful of soaked walnuts and almonds).",
    category: "General Diet",
    verdict: "Busted"
  },
  {
    id: "myth-5",
    myth: "Drinking Castor Oil (Vilakkennai) at 38–39 weeks is a safe home trick to induce labor",
    commonBelief: "Taking 1–2 spoonfuls of castor oil in tea will gently start natural labor contractions.",
    medicalFact: "Castor oil is a violent purgative laxative and is clinically contraindicated without hospital supervision.",
    scientificExplanation: "Castor oil irritates the intestines with ricinoleic acid, causing severe explosive diarrhea, painful maternal intestinal cramping, and rapid dehydration. More dangerously, intestinal prostaglandins can stimulate fetal bowel movements in utero, leading to meconium aspiration syndrome (where the baby inhales its own stool in amniotic fluid).",
    clinicalAdvice: "Never consume castor oil to self-induce labor at home. Allow natural cervical ripening or consult your obstetrician for medically monitored induction.",
    category: "Fats & Oils",
    verdict: "Dangerous"
  },
  {
    id: "myth-6",
    myth: "Drinking Tender Coconut Water gives the baby thick black hair and fair skin",
    commonBelief: "Daily elaneer (tender coconut water) directly affects the baby's hair density and skin complexion.",
    medicalFact: "Baby's hair follicles and pigmentation are governed by maternal and paternal genetics, not coconut water.",
    scientificExplanation: "While it does not affect hair genes, tender coconut water is an outstanding maternal hydration elixir. It is naturally sterile, packed with bio-available potassium, magnesium, and chloride, which relieves maternal fatigue, replenishes amniotic fluid, and eases third-trimester leg cramps.",
    clinicalAdvice: "Drink 1 fresh tender coconut (at room temperature) mid-morning for electrolyte replenishment and kidney health, but drink it for its real hydration benefits!",
    category: "General Diet",
    verdict: "Nuanced Truth"
  }
];
