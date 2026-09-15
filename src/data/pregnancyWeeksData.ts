export interface PregnancyWeekDetail {
  week: number;
  trimester: number;
  babySize: {
    name: string;
    length: string;
    weight: string;
    category: string;
    emoji: string;
    indianComparison?: string;
  };
  milestones: string[];
  motherChanges: string[];
  symptoms: string[];
  nutritionAdvice: string[];
  exerciseTips: string[];
  checkups: string[];
  thingsToAvoid: string[];
  funFact: string;
}

// Clinically authentic, week-by-week gestational dataset for all 40 weeks of pregnancy
export const PREGNANCY_WEEKS_DATA: PregnancyWeekDetail[] = [
  // --- TRIMESTER 1: WEEKS 1 TO 13 ---
  {
    week: 1,
    trimester: 1,
    babySize: { name: "Single Cell", length: "0.1 mm", weight: "< 0.01 g", category: "Pre-Conception", emoji: "🌱", indianComparison: "Cell stage" },
    milestones: [
      "Your menstrual cycle begins; the uterine endometrium prepares for potential conception.",
      "Ovarian follicles mature under the influence of Follicle-Stimulating Hormone (FSH)."
    ],
    motherChanges: [
      "Uterine shedding occurs as your body resets its fertile cycle.",
      "Estrogen levels begin to rise toward the end of the week to thicken the uterine wall."
    ],
    symptoms: ["Menstrual cramping", "Fatigue", "Mild lower back ache", "Headache"],
    nutritionAdvice: [
      "Start or continue 400-800 mcg of daily Folic Acid to prevent neural tube defects.",
      "Incorporate iron-rich lentils, spinach, and pomegranate to replenish menstrual iron loss."
    ],
    exerciseTips: [
      "Gentle walking and light restorative yoga stretches.",
      "Focus on deep diaphragmatic breathing to release pelvic floor tension."
    ],
    checkups: ["Pre-conception counseling checkup, Rubella immunity, and basic blood count (Hb)."],
    thingsToAvoid: ["Alcohol, smoking, unprescribed over-the-counter NSAIDs, and saunas."],
    funFact: "Although you are considered 1 week pregnant, conception hasn't occurred yet — gestational age is counted from the first day of your last period!"
  },
  {
    week: 2,
    trimester: 1,
    babySize: { name: "Ovum", length: "0.15 mm", weight: "< 0.01 g", category: "Ovulation Stage", emoji: "✨", indianComparison: "Single Ovum" },
    milestones: [
      "Luteinizing Hormone (LH) surges, prompting the dominant follicle to release a mature egg.",
      "The egg travels down the fallopian tube, awaiting fertilization by a single sperm cell."
    ],
    motherChanges: [
      "Cervical mucus becomes clear, slippery, and stretchy (like raw egg white) to assist sperm motility.",
      "Basal body temperature dips slightly and then rises sharply following ovulation."
    ],
    symptoms: ["One-sided mild pelvic twinge (Mittelschmerz)", "Heightened sense of smell", "Increased libido"],
    nutritionAdvice: [
      "Consume zinc-rich seeds (pumpkin seeds, sesame) and antioxidant berries to support egg health.",
      "Stay well-hydrated with 2.5 Liters of water and electrolyte-rich tender coconut water."
    ],
    exerciseTips: [
      "Moderate aerobic activity like brisk walking or swimming.",
      "Pelvic opening stretches (Butterfly pose / Baddha Konasana) to enhance pelvic blood flow."
    ],
    checkups: ["Ovulation tracking with LH test strips if planning conception."],
    thingsToAvoid: ["Excessive heat exposure, chemical douching, and high stress levels."],
    funFact: "Out of 200 million sperm racing toward the egg, only one single sperm will successfully penetrate the outer zona pellucida!"
  },
  {
    week: 3,
    trimester: 1,
    babySize: { name: "Blastocyst", length: "0.2 mm", weight: "< 0.01 g", category: "Microscopic Stage", emoji: "🔬", indianComparison: "Microscopic Ball" },
    milestones: [
      "Fertilization creates a single-celled zygote which rapidly divides into a 16-cell morula.",
      "The ball of cells hollows out to become a blastocyst and enters the uterine cavity."
    ],
    motherChanges: [
      "The blastocyst implants into the blood-rich uterine lining (endometrium).",
      "Cells destined to become the placenta begin secreting human Chorionic Gonadotropin (hCG)."
    ],
    symptoms: ["Light implantation spotting (pinkish/brownish)", "Mild uterine twinges", "Early breast tenderness"],
    nutritionAdvice: [
      "Continue daily prenatal vitamins with active methylfolate and Vitamin B6.",
      "Eat complex carbohydrates (oats, brown rice) to sustain steady cellular energy."
    ],
    exerciseTips: [
      "Maintain regular gentle walks; avoid high-impact abdominal jarring or heavy lifting.",
      "Practice gentle posture resets: maintain an elongated spine without hyperextending lower back."
    ],
    checkups: ["Home pregnancy tests may show a faint positive line toward the end of this week."],
    thingsToAvoid: ["Raw unpasteurized cheeses, alcohol, hot tubs, and heavy contact sports."],
    funFact: "At this microscopic stage, baby's sex, eye color, blood type, and genetic blueprint are already 100% determined!"
  },
  {
    week: 4,
    trimester: 1,
    babySize: { name: "Poppy Seed", length: "1.5 mm", weight: "< 0.1 g", category: "Embryonic Stage", emoji: "🌱", indianComparison: "Khas Khas" },
    milestones: [
      "The blastocyst splits into two groups: one becomes the embryo, the other forms the placenta.",
      "The neural tube (brain and spinal cord precursor) begins to fold and take shape."
    ],
    motherChanges: [
      "Missed period occurs; hCG levels double approximately every 48 hours.",
      "Progesterone surges from the corpus luteum to prevent the uterine lining from shedding."
    ],
    symptoms: ["Heightened fatigue", "Frequent urination", "Tender swollen breasts", "Mild bloating"],
    nutritionAdvice: [
      "Focus on folate-rich foods: asparagus, broccoli, lentils, and fortified grains.",
      "Incorporate Vitamin C (oranges, amla) to boost iron absorption and tissue growth."
    ],
    exerciseTips: [
      "Low-impact 20-minute morning walks.",
      "Begin practicing gentle pelvic floor Kegels: hold for 3 seconds, release for 3 seconds."
    ],
    checkups: ["Confirm pregnancy with early morning urine pregnancy test or serum beta-hCG blood test."],
    thingsToAvoid: ["Unprescribed medications, X-ray radiation, and unwashed raw vegetables."],
    funFact: "The amniotic sac and yolk sac are already formed, cushioning the embryo and providing nutrients until the placenta takes over!"
  },
  {
    week: 5,
    trimester: 1,
    babySize: { name: "Apple Seed", length: "3.0 mm", weight: "0.1 g", category: "Embryo", emoji: "🍎", indianComparison: "Seb Beej" },
    milestones: [
      "A primitive tubular heart forms and begins rhythmic, involuntary contractions.",
      "The three embryonic germ layers (ectoderm, mesoderm, endoderm) develop into distinct organ systems."
    ],
    motherChanges: [
      "Rapid hormone changes can trigger morning sickness and olfactory sensitivity.",
      "Blood volume begins its 45% pregnancy expansion, increasing kidney filtration."
    ],
    symptoms: ["Nausea / food aversions", "Extreme afternoon exhaustion", "Metallic taste in mouth", "Mood swings"],
    nutritionAdvice: [
      "Keep ginger tea or lemon water nearby to soothe early morning nausea.",
      "Eat small, frequent meals every 2-3 hours to keep blood sugar stable."
    ],
    exerciseTips: [
      "Gentle Cat-Cow stretches on hands and knees to ease early spinal tension.",
      "Listen to your body: rest whenever fatigue hits rather than pushing through workouts."
    ],
    checkups: ["Schedule first formal prenatal appointment with your OB-GYN."],
    thingsToAvoid: ["Skipping meals, raw sprouts, unpasteurized juices, and handling cat litter (toxoplasmosis)."],
    funFact: "The baby's tiny heart tube beats at around 80-100 BPM this week, even before all four chambers are fully carved out!"
  },
  {
    week: 6,
    trimester: 1,
    babySize: { name: "Sweet Pea", length: "6.0 mm", weight: "0.2 g", category: "Embryo", emoji: "🫛", indianComparison: "Matar" },
    milestones: [
      "Cardiac rate increases to ~108 BPM; audible on high-resolution transvaginal ultrasound.",
      "Tiny bud-like paddle protrusions appear which will become baby's arms and legs.",
      "Retinal eye spots and nasal indentations begin to etch the facial profile."
    ],
    motherChanges: [
      "Cervix softens and takes on a bluish hue (Goodell's and Chadwick's signs).",
      "Morning sickness may peak as hCG and estrogen continue their steep climb."
    ],
    symptoms: ["Morning sickness (often all-day)", "Food smell aversions", "Heightened saliva production (ptyalism)", "Breast sensitivity"],
    nutritionAdvice: [
      "Nibble dry crackers or roasted makhana right after waking before getting out of bed.",
      "Consume Vitamin B6-rich bananas and chickpeas to naturally relieve pregnancy nausea."
    ],
    exerciseTips: [
      "Gentle 15-20 minute stroll in cool fresh air to clear nausea.",
      "Child's pose (Balasana) with knees wide apart to release lower back tension."
    ],
    checkups: ["Early dating ultrasound (viability scan) to confirm intrauterine gestational sac and cardiac flicker."],
    thingsToAvoid: ["Lying flat immediately after meals, spicy/greasy triggers, and caffeine over 200mg."],
    funFact: "Baby's neural tube closes completely at both ends this week — neural cells are multiplying at 100,000 per minute!"
  },
  {
    week: 7,
    trimester: 1,
    babySize: { name: "Blueberry", length: "1.3 cm", weight: "0.5 g", category: "Embryo", emoji: "🫐", indianComparison: "Jamun" },
    milestones: [
      "Brain divides into three primary vesicles: forebrain, midbrain, and hindbrain.",
      "Arm buds lengthen and divide into hand, forearm, and shoulder segments.",
      "Primitive mouth, tongue, and tooth buds are forming under the gums."
    ],
    motherChanges: [
      "Your uterus has doubled in size from a small lemon to a medium orange.",
      "Increased blood volume may cause slight nasal congestion or vivid dreams."
    ],
    symptoms: ["Frequent bathroom visits", "Food cravings or sudden disgust", "Mild pelvic fullness", "Skin breakouts"],
    nutritionAdvice: [
      "Prioritize calcium-rich foods (milk, paneer, curd, fortified ragi) for developing bones.",
      "Drink warm ginger-lemon water to stay hydrated while fighting stomach acidity."
    ],
    exerciseTips: [
      "Side-lying stretches to relieve tension without putting pressure on the abdomen.",
      "Maintain upright posture when sitting: avoid slouching forward over laptops."
    ],
    checkups: ["Initial prenatal blood panel: Complete Blood Count, Blood Group & Rh factor, Rubella, Hepatitis B."],
    thingsToAvoid: ["Hot yoga, saunas, high-mercury fish (swordfish, shark), and artificial sweeteners."],
    funFact: "Baby has doubled in size since last week and is generating about 250,000 new neurons every single minute!"
  },
  {
    week: 8,
    trimester: 1,
    babySize: { name: "Raspberry", length: "1.6 cm", weight: "1.0 g", category: "Embryo", emoji: "🍓", indianComparison: "Chhoti Ber" },
    milestones: [
      "Webbed digital rays on hands and feet begin separating into distinct fingers and toes.",
      "Eyelids form and fold over baby's eyes, fusing shut until week 26.",
      "Involuntary twitching and limb reflex movements begin inside the amniotic sac."
    ],
    motherChanges: [
      "Bra size increases; Montgomery's tubercles (little bumps on areolas) become prominent.",
      "Blood pressure may dip slightly, occasionally causing mild postural dizziness."
    ],
    symptoms: ["Lower back dull ache", "Constipation or slower digestion", "Heightened sense of smell", "Fatigue"],
    nutritionAdvice: [
      "Eat soluble fiber (apples, chia seeds, oats) and drink plenty of water to prevent constipation.",
      "Include healthy fats like walnuts and avocados for embryonic brain cell membrane formation."
    ],
    exerciseTips: [
      "Pelvic tilts on hands and knees to relieve lumbar tension.",
      "Rise slowly from sitting or lying down to prevent postural lightheadedness."
    ],
    checkups: ["First comprehensive prenatal consultation: medical history, pap smear if due, baseline blood pressure."],
    thingsToAvoid: ["Dehydration, holding your breath during stretches (Valsalva maneuver), and unpasteurized milk."],
    funFact: "Baby's taste buds are already forming on the tiny tongue, and the embryonic tail has completely disappeared!"
  },
  {
    week: 9,
    trimester: 1,
    babySize: { name: "Green Grape", length: "2.3 cm", weight: "2.0 g", category: "Fetus Transition", emoji: "🍇", indianComparison: "Angoor" },
    milestones: [
      "The embryonic stage officially ends — your little one is now medical designated a **Fetus**!",
      "All four heart chambers are fully partitioned, pumping vigorously at ~165-175 BPM.",
      "Tiny joints (shoulders, elbows, wrists, and knees) are fully functional and bending."
    ],
    motherChanges: [
      "Your waistline may feel snug as your uterus expands above the pelvic bone.",
      "hCG levels reach their peak this week, after which morning sickness often starts to subside."
    ],
    symptoms: ["Peak morning sickness", "Heartburn/acid reflux", "Visible veins across breasts and chest", "Mood volatility"],
    nutritionAdvice: [
      "Eat small, easily digestible meals; avoid heavy oils and fried foods.",
      "Snack on almonds, soaked walnuts, and tender coconut water between meals."
    ],
    exerciseTips: [
      "Modified prenatal sun salutations with wide-knee lunges.",
      "Standing posture check: lift chest, soften shoulders, and avoid pushing belly forward."
    ],
    checkups: ["Non-Invasive Prenatal Testing (NIPT) cell-free DNA blood screening can be done starting this week."],
    thingsToAvoid: ["Tight waistbands, lying on your back for prolonged periods, and intense core crunches."],
    funFact: "Baby's reproductive organs are forming internally, though external genitalia look identical on ultrasound for another 4 weeks!"
  },
  {
    week: 10,
    trimester: 1,
    babySize: { name: "Prune", length: "3.1 cm", weight: "4.0 g", category: "Fetus", emoji: "🫐", indianComparison: "Aloo Bukhara" },
    milestones: [
      "All vital organs (brain, kidneys, liver, intestines) are fully formed and functioning.",
      "Baby actively swallows amniotic fluid and produces tiny amounts of digestive bile.",
      "Translucent skin allows delicate networks of blood vessels to be seen."
    ],
    motherChanges: [
      "Blood volume has increased by ~30%, giving you that warm 'pregnancy glow'.",
      "Round ligaments supporting the uterus stretch, causing occasional quick side twinges."
    ],
    symptoms: ["Round ligament twinges when coughing or turning", "Clear cervical discharge (leukorrhea)", "Mild headache"],
    nutritionAdvice: [
      "Incorporate Vitamin D and Calcium (curd, fortified dairy, ragi) for developing fetal teeth and bones.",
      "Drink 8-10 glasses of water daily to maintain amniotic fluid renewal every few hours."
    ],
    exerciseTips: [
      "Low-impact water aerobics or swimming — water buoyancy eliminates joint pressure completely.",
      "Pelvic floor elevator contractions (slow lift, hold for 5 seconds, gentle controlled release)."
    ],
    checkups: ["Chorionic Villus Sampling (CVS) diagnostic testing window opens for high-risk profiles."],
    thingsToAvoid: ["Sudden twisting movements that jerk the round ligaments, and artificial food coloring."],
    funFact: "Baby's tiny fingernails and toenails are forming in their nail beds, and peach-fuzz lanugo hair is beginning to sprout!"
  },
  {
    week: 11,
    trimester: 1,
    babySize: { name: "Lime", length: "4.1 cm", weight: "7.0 g", category: "Fetus", emoji: "🍋", indianComparison: "Nimbu" },
    milestones: [
      "Fetal head makes up nearly half of baby's total length as the cerebral cortex balloons in size.",
      "Baby practices breathing movements by rhythmically expanding and contracting the diaphragm.",
      "Tooth buds have formed deep inside the gums for all 20 primary baby teeth."
    ],
    motherChanges: [
      "Morning sickness typically starts easing up; appetite begins its gradual return.",
      "Nails and hair may grow noticeably faster due to estrogen and heightened blood supply."
    ],
    symptoms: ["Less severe nausea", "Occasional gas or indigestion", "Dry skin or mild itchiness around bump"],
    nutritionAdvice: [
      "Prioritize zinc and protein: paneer, lentils, boiled eggs, or tofu for fetal tissue building.",
      "Snack on fresh papaya (only fully ripe!) or sweet apples for dietary enzymes."
    ],
    exerciseTips: [
      "Tailor sitting (cross-legged on a floor cushion) with upright spine to open inner thighs.",
      "Cat-Cow flow synchronized with calm inhalations and exhalations."
    ],
    checkups: ["Nuchal Translucency (NT) scan appointment window (between Weeks 11 and 13+6)."],
    thingsToAvoid: ["Raw unpasteurized honey, deep backbends, and lifting objects heavier than 10kg."],
    funFact: "Baby can now open and close their tiny fists, stretch, and perform full somersaults in the amniotic pool!"
  },
  {
    week: 12,
    trimester: 1,
    babySize: { name: "Plum", length: "5.4 cm", weight: "14.0 g", category: "Fetus", emoji: "🍑", indianComparison: "Aloo" },
    milestones: [
      "Involuntary neurological reflexes are active: baby curls toes, suckles, and squints.",
      "Kidneys actively filter amniotic fluid, producing sterile fetal urine.",
      "Intestines, which grew inside the umbilical cord due to limited space, move safely into the abdomen."
    ],
    motherChanges: [
      "Uterus rises out of the pelvic basin into the lower abdomen, reducing pressure on the bladder.",
      "The risk of miscarriage drops dramatically by over 80% as you near the end of Trimester 1."
    ],
    symptoms: ["Dizziness when standing quickly", "Dramatically reduced nausea", "Hunger surges", "Mild heartburn"],
    nutritionAdvice: [
      "Iron intake is critical: pair dates, spinach, and beetroot with citrus fruit for maximum absorption.",
      "Eat smaller, high-protein snacks like Greek yogurt, roasted chana, and boiled sprouts."
    ],
    exerciseTips: [
      "Standing mountain pose (Tadasana) against a wall: check head-shoulder-pelvic alignment.",
      "Light 25-minute brisk walk in nature to boost oxygenation and serotonin."
    ],
    checkups: ["Combined First Trimester Screening: NT ultrasound + Double Marker blood test (PAPP-A & Free beta-hCG)."],
    thingsToAvoid: ["Standing still in one place for long periods, hot baths, and skipping breakfast."],
    funFact: "Baby's vocal cords are fully sculpted this week — though without air, baby cannot make a sound yet!"
  },
  {
    week: 13,
    trimester: 1,
    babySize: { name: "Peach", length: "7.4 cm", weight: "23.0 g", category: "Trimester End", emoji: "🍑", indianComparison: "Adoo" },
    milestones: [
      "Unique epidermal ridges etch permanent fingerprints onto baby's tiny fingertips.",
      "The placenta is now fully functional, supplying all oxygen, nutrients, and waste filtration.",
      "Bones in the skull and long limbs are hardening from cartilage into solid bone."
    ],
    motherChanges: [
      "Congratulations — you are completing your First Trimester! Energy levels start bouncing back.",
      "Linea nigra (dark vertical abdominal line) and darkened areolas may begin to appear."
    ],
    symptoms: ["Energy returning", "Mild round ligament stretching", "Clearer skin", "Increased appetite"],
    nutritionAdvice: [
      "Ensure 300 extra healthy calories daily (handful of mixed nuts, fruit smoothie, or boiled egg).",
      "Stay well-hydrated to help the placenta circulate ~50 Liters of maternal fluid daily."
    ],
    exerciseTips: [
      "Begin second trimester prenatal fitness: gentle squats holding a sturdy chair for pelvic floor tone.",
      "Side stretches and gentle chest openers to prepare for expanding ribcage."
    ],
    checkups: ["Finalize first trimester screening review with your doctor; review genetic carrier screening."],
    thingsToAvoid: ["High-impact aerobics, laying flat on back for core work, and unwashed raw salads."],
    funFact: "Your baby's vocal cords, taste buds, and unique fingerprints are all fully etched — ready for Trimester 2!"
  },

  // --- TRIMESTER 2: WEEKS 14 TO 27 ---
  {
    week: 14,
    trimester: 2,
    babySize: { name: "Lemon", length: "8.7 cm", weight: "43.0 g", category: "Golden Trimester", emoji: "🍋", indianComparison: "Bada Nimbu" },
    milestones: [
      "Baby can make facial expressions: squinting, frowning, and grimacing using facial nerve pathways.",
      "Ultra-fine, downy lanugo hair blankets baby's body to hold protective vernix wax in place.",
      "Thyroid gland matures and begins producing thyroxine hormone."
    ],
    motherChanges: [
      "Welcome to the Second Trimester ('The Golden Trimester')! Nausea fades and vitality peaks.",
      "Your bump is becoming gently visible as a firm rounding above the pubic bone."
    ],
    symptoms: ["Increased energy", "Mild nasal stuffiness (pregnancy rhinitis)", "Round ligament side pulls", "Glowing complexion"],
    nutritionAdvice: [
      "Prioritize high-quality protein (paneer, lentils, fish, chicken, eggs) to support rapid fetal muscle growth.",
      "Drink tender coconut water daily for natural potassium, magnesium, and hydration."
    ],
    exerciseTips: [
      "Desk posture: place a small lumbar roll behind lower back to preserve natural lumbar lordosis.",
      "Wide-legged squats (Malasana) with chair support to condition pelvic floor muscles for labor."
    ],
    checkups: ["Routine 2nd trimester checkup: blood pressure, fundal height check, and fetal Doppler heartbeat."],
    thingsToAvoid: ["Sleeping completely flat on your back, heavy single-arm carrying, and sudden abdominal twists."],
    funFact: "Baby can suck their thumb this week, and their hands can reach all the way to touch their own face!"
  },
  {
    week: 15,
    trimester: 2,
    babySize: { name: "Apple", length: "10.1 cm", weight: "70.0 g", category: "Second Trimester", emoji: "🍎", indianComparison: "Seb" },
    milestones: [
      "Baby's legs have grown longer than arms and are kicking rhythmically in the amniotic pool.",
      "Although eyelids remain fused, baby can sense bright light shining on mother's belly.",
      "Scalp hair pattern is beginning to form."
    ],
    motherChanges: [
      "Pregnancy brain (mild forgetfulness) is common due to progesterone surges and multitasking.",
      "Weight gain picks up: an average of 0.4 to 0.5 kg per week is standard during this trimester."
    ],
    symptoms: ["Occasional bleeding gums when brushing", "Mild shortness of breath on stairs", "Indigestion"],
    nutritionAdvice: [
      "Include foods rich in Vitamin C to support gum health and strengthen capillary walls.",
      "Eat calcium-rich sesame seeds, chia seeds, and fortified yogurt to support rapid bone ossification."
    ],
    exerciseTips: [
      "Birthing ball pelvic circles: sit on a 65cm exercise ball and rotate hips in slow circles for 10 minutes.",
      "Wall pushups to maintain shoulder and pectoral strength for holding baby."
    ],
    checkups: ["Quadruple Marker blood screening window opens (Weeks 15-20) for neural tube and chromosome assessment."],
    thingsToAvoid: ["Hard toothbrushes (use soft bristles), sitting cross-legged for hours, and overeating heavy sweets."],
    funFact: "Baby practices swallowing about 500 ml of amniotic fluid daily, which helps develop their digestive tract!"
  },
  {
    week: 16,
    trimester: 2,
    babySize: { name: "Avocado", length: "11.6 cm", weight: "100.0 g", category: "Second Trimester", emoji: "🥑", indianComparison: "Makhanfal" },
    milestones: [
      "Baby's head is held erect and limbs are well-coordinated.",
      "Eyes can perform slow tracking movements behind fused eyelids.",
      "Circulatory system is fully functioning, pumping ~25 Liters of blood through baby's heart daily."
    ],
    motherChanges: [
      "Mothers may feel 'Quickening' — tiny fluttery butterfly sensations of baby moving for the first time!",
      "Breasts may begin producing colostrum (early liquid gold milk)."
    ],
    symptoms: ["Fluttery quickening kicks", "Dry irritated eyes", "Glowing skin", "Occasional backache"],
    nutritionAdvice: [
      "Focus on Iron & Folate: spinach soup, beetroot salads, lentils, and pomegranate juice.",
      "Eat small handfuls of roasted walnuts and almonds for Omega-3 DHA brain development."
    ],
    exerciseTips: [
      "The 'Plumb Line' walk: imagine an invisible string pulling the crown of your head up toward the sky.",
      "Cat-Cow tilts on hands and knees to release lower lumbar facet joint compression."
    ],
    checkups: ["Routine prenatal checkup: measure fundal height, maternal weight gain, and fetal heart tones."],
    thingsToAvoid: ["Lying flat on your back during workouts — use a 30-degree incline wedge."],
    funFact: "Your baby's heart is now large enough that you can hear it clearly in the clinic using an acoustic ultrasound Doppler!"
  },
  {
    week: 17,
    trimester: 2,
    babySize: { name: "Turnip", length: "13.0 cm", weight: "140.0 g", category: "Second Trimester", emoji: "🧅", indianComparison: "Shalgam" },
    milestones: [
      "Adipose brown fat reserves begin accumulating under baby's skin for temperature regulation.",
      "The umbilical cord is growing thicker, stronger, and more resilient to support heavy blood flow.",
      "Skeleton continues hardening from soft flexible cartilage into rigid bone."
    ],
    motherChanges: [
      "Your center of gravity starts shifting forward as your uterus tilts upward into the abdominal cavity.",
      "Appetite is strong — baby's growth spurts demand consistent, wholesome nutrition."
    ],
    symptoms: ["Sciatica or lower back twinges", "Increased vaginal discharge", "Occasional vivid dreams", "Mild carpal tunnel"],
    nutritionAdvice: [
      "Incorporate complex carbs with low glycemic index (quinoa, millets, sweet potatoes) for lasting energy.",
      "Ensure 1000mg of dietary Calcium daily (paneer, tofu, fortified soy or cow's milk)."
    ],
    exerciseTips: [
      "Piriformis stretch: sit on a chair, place right ankle across left knee, and gently hinge forward to ease sciatica.",
      "Keep knees soft and unlocked when standing in kitchen or waiting in line."
    ],
    checkups: ["Schedule your comprehensive Level-II Anomaly Scan (targeted for Weeks 18-22)."],
    thingsToAvoid: ["High heels (opt for supportive arch footwear to prevent pelvic tilt), and unpasteurized soft cheeses."],
    funFact: "Baby's sweat glands are developing all over the skin, and baby will occasionally hiccup in the womb!"
  },
  {
    week: 18,
    trimester: 2,
    babySize: { name: "Bell Pepper", length: "14.2 cm", weight: "190.0 g", category: "Second Trimester", emoji: "🫑", indianComparison: "Shimla Mirch" },
    milestones: [
      "The inner ear cochlea and auditory nerve pathways mature — **baby can now hear sounds inside the womb**!",
      "Baby hears mother's aortic pulse, whooshing blood, digestive gurgles, and muffled external voices.",
      "Protective myelin sheaths begin insulating nerve fibers in the spinal cord."
    ],
    motherChanges: [
      "Your cardiovascular system has relaxed vascular resistance, meaning blood pressure may be at its lowest point.",
      "Movements become more frequent and distinct — especially in the evening when mom rests."
    ],
    symptoms: ["Noticeable baby flutters and nudges", "Mild foot swelling in evening", "Leg cramps at night", "Food cravings"],
    nutritionAdvice: [
      "Combat nighttime calf cramps by consuming magnesium and potassium (bananas, pumpkin seeds, coconut water).",
      "Pair iron foods with Vitamin C to avoid maternal gestational anemia."
    ],
    exerciseTips: [
      "Calf stretches against a wall before bed to prevent nocturnal charley horse cramps.",
      "Pelvic-safe squatting: keep stance wider than hips and push through your heels to stand up."
    ],
    checkups: ["Level-II Anomaly Scan (TIFFA / Target Scan) window begins: detailed anatomical survey of organs."],
    thingsToAvoid: ["Jumping or ballistic bounce stretches, hot tubs, and skipping hydration."],
    funFact: "Talk, sing, or read to your belly! Studies prove that newborns show preference for melodies heard repeatedly at this stage!"
  },
  {
    week: 19,
    trimester: 2,
    babySize: { name: "Mango", length: "15.3 cm", weight: "240.0 g", category: "Second Trimester", emoji: "🥭", indianComparison: "Aam" },
    milestones: [
      "Vernix caseosa — a greasy, cheese-like protective biofilm — coats baby's skin to shield it from amniotic chapping.",
      "Sensory specialization in the brain: dedicated areas for taste, smell, hearing, vision, and touch are active.",
      "If carrying a girl, baby already has 6 million primitive eggs in her tiny ovaries."
    ],
    motherChanges: [
      "Round ligament stretches reach a peak as the fundus reaches just below your belly button.",
      "Hip joints may feel loose due to elevated relaxin hormone."
    ],
    symptoms: ["Sharp groin pulls when sneezing or turning", "Mild hip aches", "Occasional dizziness when standing", "Dry skin"],
    nutritionAdvice: [
      "Omega-3 fatty acids are critical for retinal and brain development (walnuts, flaxseed, chia, or algae DHA).",
      "Stay hydrated with herbal teas, tender coconut water, and infused cucumber water."
    ],
    exerciseTips: [
      "Tailor sitting (Baddha Konasana): open hips gently while sitting against a wall with upright spine.",
      "Cat-Cow and pelvic rocking to ease round ligament stiffness."
    ],
    checkups: ["Complete your Level-II Targeted Ultrasound (TIFFA scan) to inspect heart chambers, kidneys, and spine."],
    thingsToAvoid: ["Lying flat on your back after Week 20 — transition to sleeping on your left side with knee pillows."],
    funFact: "Baby's skin would wrinkle and soften like a long bath without the water-repellent coat of creamy vernix caseosa!"
  },
  {
    week: 20,
    trimester: 2,
    babySize: { name: "Banana", length: "25.6 cm", weight: "300.0 g", category: "Halfway Milestone", emoji: "🍌", indianComparison: "Kela" },
    milestones: [
      "**You have reached the Halfway Mark of pregnancy (20 Weeks / 140 Days)!**",
      "Baby's measurements shift from Crown-Rump Length (CRL) to Crown-to-Heel Length.",
      "Baby develops regular sleep and wake cycles, often waking when mother sits down to relax."
    ],
    motherChanges: [
      "Your belly button (navel) may pop outward as the top of your uterus reaches the exact level of your belly button.",
      "Partner can often feel baby's kicks by placing a warm, patient hand on your lower belly."
    ],
    symptoms: ["Distinct kicks and rolling pushes", "Heartburn/acid reflux", "Mild shortness of breath", "Braxton Hicks practice tightness"],
    nutritionAdvice: [
      "Prevent heartburn: eat 5-6 smaller meals daily; avoid lying down for 45 minutes after eating.",
      "Ensure 1000mg Calcium and 400 IU Vitamin D daily to support baby's hardening bone structure."
    ],
    exerciseTips: [
      "Active Sitting: sit on a 65cm birthing ball with hips higher than knees to encourage baby into anterior position.",
      "Kegel elevator workouts: 3 sets of 10 contractions to strengthen pelvic floor under growing weight."
    ],
    checkups: ["Review Level-II scan results with your doctor: check placental location, amniotic fluid index (AFI), and cervical length."],
    thingsToAvoid: ["Large heavy late-night dinners, tight restrictive belts, and slumping backward on soft couches."],
    funFact: "Your baby is now swallowing up to several ounces of amniotic fluid every day, tasting subtle flavors from your meals!"
  },
  {
    week: 21,
    trimester: 2,
    babySize: { name: "Carrot", length: "26.7 cm", weight: "360.0 g", category: "Second Trimester", emoji: "🥕", indianComparison: "Gajar" },
    milestones: [
      "Bone marrow takes over the primary production of red blood cells from the liver and spleen.",
      "Baby's digestive system produces meconium (a dark, tarry byproduct) which remains in bowels until delivery.",
      "Rapid eye movement (REM) brainwaves confirm baby experiences active dream states in the womb."
    ],
    motherChanges: [
      "Your center of gravity is visibly moving forward; compensatory lumbar lordosis begins.",
      "Varicose veins or mild spider veins may appear due to heightened pelvic venous pressure."
    ],
    symptoms: ["Increased appetite", "Oily skin or healthy hair sheen", "Braxton Hicks contractions", "Occasional calf cramps"],
    nutritionAdvice: [
      "Include Vitamin K and Vitamin C-rich leafy greens to support healthy blood clotting mechanisms.",
      "Snack on fiber-rich prunes, dried figs, and soaked chia seeds to maintain comfortable bowel regularity."
    ],
    exerciseTips: [
      "Elevate legs against a wall or on pillows for 15 minutes in the evening to reduce leg venous pooling.",
      "The 'Wall Check': stand with head, shoulders, and buttocks touching a wall to reset upright neutral posture."
    ],
    checkups: ["Mid-pregnancy blood count check (Hb / Ferritin) to catch and treat early gestational iron deficiency."],
    thingsToAvoid: ["Crossing legs at the knees (impairs venous return and twists pelvic balance), and heavy lifting."],
    funFact: "Baby's taste buds now recognize sweet, salty, and bitter flavors in the amniotic fluid based on what mom eats!"
  },
  {
    week: 22,
    trimester: 2,
    babySize: { name: "Spaghetti Squash", length: "27.8 cm", weight: "430.0 g", category: "Second Trimester", emoji: "🎃", indianComparison: "Khaddu" },
    milestones: [
      "Facial features (eyebrows, eyelashes, lips) are exquisitely sculpted and look like a miniature newborn.",
      "Baby's sense of touch is highly active: baby touches their own face, explores the uterine wall, and grasps the cord.",
      "Pancreatic beta cells are developing to regulate fetal blood glucose levels."
    ],
    motherChanges: [
      "Stretch marks (striae gravidarum) may appear on the lower abdomen, breasts, or hips.",
      "Foot ligaments soften under relaxin hormone — shoes may feel a half-size tighter."
    ],
    symptoms: ["Mild swelling in feet and ankles", "Backache along lumbar spine", "Increased vaginal discharge", "Hot flashes"],
    nutritionAdvice: [
      "Moisturize skin from the inside out: drink 2.5 - 3 Liters of water and consume healthy fats (avocados, ghee in moderation).",
      "Ensure steady protein intake: dal, paneer, tofu, fish, or chicken to supply collagen building blocks."
    ],
    exerciseTips: [
      "Piriformis and glute stretches to relieve pressure on the sciatic nerve.",
      "Keep feet hip-width apart when standing to maintain a wide, stable base of support."
    ],
    checkups: ["Routine prenatal checkup: urine albumin and sugar screening, blood pressure monitoring."],
    thingsToAvoid: ["Scratching itchy stretch marks (use gentle virgin coconut oil or shea butter instead), and dehydration."],
    funFact: "Baby can perceive the difference between light and dark through mom's abdominal wall, and will turn toward bright flashlights!"
  },
  {
    week: 23,
    trimester: 2,
    babySize: { name: "Grapefruit", length: "28.9 cm", weight: "500.0 g", category: "Second Trimester", emoji: "🍊", indianComparison: "Chakotra" },
    milestones: [
      "**Baby hits the major 500-gram milestone!**",
      "Lungs develop alveolar terminal sacs and begin producing **surfactant** to prevent air sac collapse.",
      "Inner ear balance structures are mature — baby knows whether they are right side up or upside down."
    ],
    motherChanges: [
      "Swelling (edema) in ankles and feet may be noticeable by late afternoon.",
      "Linea nigra (dark pregnancy line) extends from pubic bone past the navel toward the sternum."
    ],
    symptoms: ["Swollen ankles after standing", "Mild carpal tunnel tingling in fingers", "Occasional gum sensitivity", "Vivid dreams"],
    nutritionAdvice: [
      "Drink plenty of water (counter-intuitively, staying hydrated flushes excess sodium and reduces edema!).",
      "Limit high-sodium packaged chips, pickles, and processed snacks to prevent water retention."
    ],
    exerciseTips: [
      "Ankle pumps and foot circles: rotate ankles 20 times clockwise and counter-clockwise to pump venous blood back up.",
      "Brisk walking in comfortable, arch-supportive sneakers."
    ],
    checkups: ["Schedule Oral Glucose Tolerance Test (OGTT) for gestational diabetes screening (due Weeks 24-28)."],
    thingsToAvoid: ["Standing still without moving your feet, tight socks with constrictive elastic bands, and excessive sodium."],
    funFact: "Baby's skin has a reddish hue because blood capillaries are multiplying rapidly just beneath the delicate surface!"
  },
  {
    week: 24,
    trimester: 2,
    babySize: { name: "Corn Cob", length: "35.6 cm", weight: "760.0 g", category: "Viability Milestone", emoji: "🌽", indianComparison: "Bhutta" },
    milestones: [
      "**Clinical Viability Milestone Reached!** (With specialized NICU care, babies born at 24 weeks can survive).",
      "Auditory reflexes are razor-sharp: baby may jump or kick in response to a sudden loud door slam or siren.",
      "Footprints and handprints are permanently etched onto baby's skin."
    ],
    motherChanges: [
      "Your uterus is now the size of a soccer ball, sitting about 2 inches above your navel.",
      "You may notice painless, irregular uterine tightenings known as **Braxton Hicks contractions**."
    ],
    symptoms: ["Braxton Hicks practice contractions", "Lower back lumbar ache", "Leg cramps", "Occasional dry eyes"],
    nutritionAdvice: [
      "Omega-3 DHA (300mg daily) is critical as baby's brain cells form trillions of synaptic connections.",
      "Include choline-rich eggs, broccoli, and roasted seeds for memory and cognitive center wiring."
    ],
    exerciseTips: [
      "Desk posture reset: sit all the way back into your chair, knees at 90°, and feet flat on the floor or a footstool.",
      "Modified Child's Pose with wide knees: breathe deeply into the belly to relax pelvic floor muscles."
    ],
    checkups: ["Oral Glucose Tolerance Test (OGTT / GTT) fasting blood test to screen for Gestational Diabetes Mellitus (GDM)."],
    thingsToAvoid: ["Lying flat on your back — place a firm pillow under your right hip if reclining to avoid IVC compression."],
    funFact: "Baby's brain is growing so fast that it has developed distinct sleep cycles: deep sleep, light sleep, and dream-filled REM sleep!"
  },
  {
    week: 25,
    trimester: 2,
    babySize: { name: "Cauliflower", length: "36.6 cm", weight: "875.0 g", category: "Second Trimester", emoji: "🥦", indianComparison: "Phool Gobhi" },
    milestones: [
      "Capillaries in the lungs and beneath skin fill with oxygenated blood, giving baby a rosy newborn tint.",
      "Baby's nostrils, which were plugged shut since early pregnancy, begin to open up.",
      "Spinal column structures (33 vertebrae, 150 joints, 1000 ligaments) consolidate."
    ],
    motherChanges: [
      "Hair appears thicker and shinier because pregnancy hormones delay normal daily hair shedding.",
      "Hemorrhoids or pelvic pressure may occur due to increased uterine weight on pelvic veins."
    ],
    symptoms: ["Pelvic heaviness", "Constipation/hemorrhoids", "Restless legs in bed", "Occasional heartburn"],
    nutritionAdvice: [
      "High fiber is non-negotiable: oats, bran, soaked prunes, lentils, and unpeeled apples.",
      "Drink warm water with soaked isabgol (psyllium husk) before bed if constipation persists."
    ],
    exerciseTips: [
      "Pelvic floor Kegels combined with deep exhalations: lift pelvic floor, hold for 5, release fully.",
      "Birthing ball figure-8 hip movements to decompress the sacroiliac (SI) joints."
    ],
    checkups: ["Repeat Complete Blood Count (CBC) and check Ferritin levels to rule out second-trimester iron deficiency anemia."],
    thingsToAvoid: ["Straining during bowel movements (use a footstool/Squatty Potty to align colon), and heavy lifting."],
    funFact: "Your baby can now tell the difference between your voice and your partner's voice — calming down to familiar rhythms!"
  },
  {
    week: 26,
    trimester: 2,
    babySize: { name: "Lettuce", length: "37.6 cm", weight: "1.0 kg", category: "1 Kilogram Milestone", emoji: "🥬", indianComparison: "Salad Patta" },
    milestones: [
      "**Baby hits the 1 Kilogram (1000 grams) milestone!**",
      "**Baby opens their eyes for the first time!** Retinas can detect light and pupils dilate and constrict.",
      "Baby inhales and exhales amniotic fluid consistently, preparing lung muscles for air breathing."
    ],
    motherChanges: [
      "Your blood pressure, which hit a low in mid-pregnancy, begins climbing back to its pre-pregnancy baseline.",
      "You might feel rhythmic, repetitive tap-tap-tap movements inside — baby has the hiccups!"
    ],
    symptoms: ["Rhythmic baby hiccups", "Difficulty finding a comfortable sleeping position", "Mild swelling in hands and feet", "Rib soreness"],
    nutritionAdvice: [
      "Continue 1000mg Calcium daily — baby's skeleton is drawing calcium rapidly to harden long bones.",
      "Eat dark leafy greens (methi, palak), fortified milk, sesame seeds, and ragi for natural calcium."
    ],
    exerciseTips: [
      "Sleep Ergonomics: sleep on your left side with a pillow between knees and a wedge under the bump.",
      "Cat-Cow stretches and thoracic twists on hands and knees to relieve ribcage soreness."
    ],
    checkups: ["If Rh-negative blood type, an antibody screen is checked in preparation for Anti-D immunoglobulin injection."],
    thingsToAvoid: ["Sleeping flat on back, skipping evening walks, and eating large heavy meals within 2 hours of sleep."],
    funFact: "Baby's eyes are blue/slate colored right now — permanent eye pigment takes up to 6-9 months after birth to settle!"
  },
  {
    week: 27,
    trimester: 2,
    babySize: { name: "Cabbage", length: "38.6 cm", weight: "1.15 kg", category: "Trimester End", emoji: "🥬", indianComparison: "Patta Gobhi" },
    milestones: [
      "Brain tissue expands rapidly with characteristic convolutions, gyri, and sulci folding into the cerebral cortex.",
      "Lungs are mature enough to breathe air with minimal ventilator assistance in the event of premature birth.",
      "Baby recognizes rhythms of mother's speech cadences and calms to familiar lullabies."
    ],
    motherChanges: [
      "You are completing your Second Trimester! Uterus is now about 3 inches above your navel.",
      "Diaphragm is pushed upward by ~4 cm, meaning lung capacity may feel slightly compressed."
    ],
    symptoms: ["Shortness of breath on exertion", "Leg cramps", "Restless sleep", "Mild hemorrhoids or pelvic fullness"],
    nutritionAdvice: [
      "Eat smaller meals more frequently to prevent acid reflux caused by the stomach being crowded upward.",
      "Keep snacking on iron-rich raisins, soaked figs, almonds, and roasted chana."
    ],
    exerciseTips: [
      "Elevate arms overhead and interlace fingers while taking slow deep breaths to create space in the ribcage.",
      "Brisk 20-minute evening walk in comfortable, supportive sneakers."
    ],
    checkups: ["Tdap vaccination (protects newborn against whooping cough / pertussis) recommended between Weeks 27 and 36."],
    thingsToAvoid: ["Slumping backward into deep couches (encourages posterior fetal position), and dehydration."],
    funFact: "Baby's taste buds have developed so thoroughly that baby actually swallows more amniotic fluid when mom eats sweet foods!"
  },

  // --- TRIMESTER 3: WEEKS 28 TO 40 ---
  {
    week: 28,
    trimester: 3,
    babySize: { name: "Coconut", length: "39.9 cm", weight: "1.3 kg", category: "Welcome to Trimester 3", emoji: "🥥", indianComparison: "Nariyal" },
    milestones: [
      "**Welcome to the Third & Final Trimester! The countdown begins.**",
      "Many babies begin settling into the **cephalic (head-down)** position in preparation for birth.",
      "Baby blinks, has eyelashes, and turns toward light sources outside the womb."
    ],
    motherChanges: [
      "Your center of gravity has shifted dramatically forward; exaggerated lumbar lordosis is common.",
      "Anti-D Rh immunoglobulin injection is administered if mom is Rh-negative and baby may be Rh-positive."
    ],
    symptoms: ["Sciatica / lower back strain", "Braxton Hicks contractions become more noticeable", "Heartburn", "Frequent urination returns"],
    nutritionAdvice: [
      "Focus on brain nutrition: DHA Omega-3, Choline, and Vitamin B12 for the final fetal brain growth surge.",
      "Drink warm milk with a pinch of turmeric and cardamom before bed to relax muscles and sleep deeper."
    ],
    exerciseTips: [
      "Begin daily 'Spinning Babies' principles: 10 minutes of Cat-Cow and sitting upright on a birth ball.",
      "Avoid slumping back on sofas — sit forward on your sitz bones so baby's spine swings toward your belly (LOA position)."
    ],
    checkups: ["RhoGAM (Anti-D) injection for Rh-negative mothers; prenatal checkups now move to every 2 weeks."],
    thingsToAvoid: ["Heavy lifting over 10kg, sleeping on back, and prolonged periods of standing still."],
    funFact: "Baby can dream! EEG scans show that 28-week fetuses spend over 60% of their sleep time in active REM dream states!"
  },
  {
    week: 29,
    trimester: 3,
    babySize: { name: "Butternut Squash", length: "41.1 cm", weight: "1.5 kg", category: "Third Trimester", emoji: "🎃", indianComparison: "Meetha Kaddu" },
    milestones: [
      "Bones are fully developed and hardening, but skull bones remain soft and flexible with open sutures for delivery.",
      "Baby's brain can now regulate rhythmic breathing and monitor body temperature independently.",
      "Kicks feel more like rolling pushes and elbow stretches as uterine space becomes snug."
    ],
    motherChanges: [
      "Uterine fundus sits about 3.5 to 4 inches above your navel, putting pressure on your diaphragm and stomach.",
      "You may experience pelvic girdle loosening as relaxin levels peak for late pregnancy."
    ],
    symptoms: ["Shortness of breath", "Heartburn/GERD", "Varicose veins", "Difficulty sleeping through the night"],
    nutritionAdvice: [
      "Ensure adequate dietary Calcium (1200 mg/day) as baby deposits ~250 mg of calcium directly into bones daily.",
      "Include chia seeds, ragi rotis, paneer, and sesame chikki for high bio-available calcium."
    ],
    exerciseTips: [
      "Pelvic tilts on hands and knees: exhale, tuck tailbone, arch back like a cat, hold for 3 seconds, release.",
      "Sleep with a full-body pregnancy pillow or sandwich pillows between knees, under belly, and behind back."
    ],
    checkups: ["Third trimester routine checkup: measure fundal height, check for swelling/preeclampsia signs, and monitor fetal heartbeat."],
    thingsToAvoid: ["Large spicy meals within 2 hours of bedtime, and lifting heavy toddlers without bending knees."],
    funFact: "Baby is absorbing about 200 mg of calcium every single day straight from mom's bloodstream to fortify their skeleton!"
  },
  {
    week: 30,
    trimester: 3,
    babySize: { name: "Pineapple", length: "42.4 cm", weight: "1.7 kg", category: "Third Trimester", emoji: "🍍", indianComparison: "Ananas" },
    milestones: [
      "Amniotic fluid volume reaches its peak of approximately 800-1000 ml before gradually decreasing as baby fills the uterus.",
      "Baby's bone marrow is now fully in charge of producing all red blood cells.",
      "Pupils can dilate and constrict in response to light filtering through mother's abdomen."
    ],
    motherChanges: [
      "Fatigue may return as carrying an extra 10-12 kg places greater demands on your cardiovascular system.",
      "Relaxin hormone causes pelvic joints and pubic symphysis to widen, leading to the characteristic 'pregnancy waddle'."
    ],
    symptoms: ["Pelvic girdle pain (PGP/SPD)", "Fatigue", "Mood fluctuations", "Swollen fingers and ankles"],
    nutritionAdvice: [
      "Maintain iron intake to prevent third-trimester anemia: lentils, dates, spinach, and beetroot.",
      "Drink 2.5 Liters of water daily — proper hydration helps prevent premature uterine contractions."
    ],
    exerciseTips: [
      "The 10-Second Wall Reset: stand against a wall, ensure head, shoulders, and hips align without deep lower back sway.",
      "Log-roll technique: always roll to your side first before pushing up to sit out of bed to protect abdominal rectus muscles."
    ],
    checkups: ["Growth ultrasound scan may be scheduled to assess fetal weight percentile, placental grade, and amniotic fluid index (AFI)."],
    thingsToAvoid: ["Sitting straight up from a flat lying position (causes diastasis recti separation), and crossing legs."],
    funFact: "Baby's brain is growing so rapidly that its surface has transformed from completely smooth to deeply creased with intellectual folds!"
  },
  {
    week: 31,
    trimester: 3,
    babySize: { name: "Honeydew Melon", length: "43.7 cm", weight: "1.9 kg", category: "Third Trimester", emoji: "🍈", indianComparison: "Kharbooza" },
    milestones: [
      "Baby is gaining weight rapidly — packing on about 200-250 grams of healthy subcutaneous fat per week.",
      "All five primary senses (sight, hearing, touch, taste, balance) are fully functional.",
      "Central nervous system coordinates breathing motions, swallowing, and body temperature control."
    ],
    motherChanges: [
      "Your uterus pushes up against your ribs; you may feel baby's tiny feet kicking up into your right ribcage.",
      "Braxton Hicks contractions become more frequent, practicing and toning the uterine muscle fibers."
    ],
    symptoms: ["Rib pain from baby kicks", "Shortness of breath", "Braxton Hicks contractions", "Frequent daytime and nighttime urination"],
    nutritionAdvice: [
      "Ensure steady protein and Omega-3 intake for the final push of fetal brain and muscle growth.",
      "Eat cooling foods like tender coconut water, cucumber, and fresh fruit bowls to counter metabolic hot flashes."
    ],
    exerciseTips: [
      "Hands-and-knees hip circles: 10 circles clockwise, 10 counter-clockwise to encourage baby's head to engage properly.",
      "Gentle prenatal yoga stretches to relieve pressure between the ribcage and pelvis."
    ],
    checkups: ["Routine bi-weekly checkup: check fetal presentation (cephalic vs breech) and maternal blood pressure."],
    thingsToAvoid: ["Dehydration (a major trigger for false-labor contractions), and high-sodium packaged snacks."],
    funFact: "Your baby produces about 500 ml of urine daily, which is continuously recycled and filtered by the amniotic fluid system!"
  },
  {
    week: 32,
    trimester: 3,
    babySize: { name: "Cantaloupe", length: "45.0 cm", weight: "2.1 kg", category: "Third Trimester", emoji: "🍈", indianComparison: "Melon" },
    milestones: [
      "**Baby surpasses 2 Kilograms!**",
      "Baby practices coordinating breathing, sucking, and swallowing simultaneously — vital for nursing at birth.",
      "Toenails have completely grown to the tips of baby's toes.",
      "Lanugo hair begins shedding into amniotic fluid as subcutaneous fat smooths out baby's wrinkles."
    ],
    motherChanges: [
      "Your blood volume is 40-50% higher than before pregnancy to support both mother and growing placenta.",
      "Colostrum (thick yellowish early breast milk) may occasionally leak from your nipples."
    ],
    symptoms: ["Occasional colostrum leaking", "Pelvic pressure", "Backache along lumbar spine", "Vivid labor dreams"],
    nutritionAdvice: [
      "Incorporate complex fiber, probiotics (fresh curd/buttermilk), and prunes to maintain smooth digestion.",
      "Keep eating small, frequent snacks rather than heavy meals to manage stomach compression."
    ],
    exerciseTips: [
      "Daily 20-minute walk: focus on swinging arms and walking with an open, relaxed pelvis.",
      "Birthing ball bouncing: gentle vertical bounces on an exercise ball relieve lumbar spine compression."
    ],
    checkups: ["Check fetal position: is baby head-down (vertex/cephalic)? Discuss birth plan preferences with doctor."],
    thingsToAvoid: ["Lifting heavy grocery bags, prolonged sitting at desks without standing breaks, and tight underwire bras."],
    funFact: "Baby's sleep patterns now include deep NREM sleep where the brain processes memories and auditory experiences!"
  },
  {
    week: 33,
    trimester: 3,
    babySize: { name: "Romaine Lettuce", length: "46.2 cm", weight: "2.4 kg", category: "Third Trimester", emoji: "🥬", indianComparison: "Lettuce" },
    milestones: [
      "Maternal antibodies (Immunoglobulin G / IgG) are actively transferred across the placenta to build baby's immune system.",
      "Amniotic fluid volume stabilizes, meaning baby's kicks feel firmer, sharper, and more defined against your abdomen.",
      "Baby's brain temperature is maintained at about 0.5°C higher than mother's core temperature."
    ],
    motherChanges: [
      "You may experience 'pregnancy waddle' as your pelvis expands and center of gravity shifts forward.",
      "Carrying your baby bump requires conscious postural awareness to protect your lower back from straining."
    ],
    symptoms: ["Overheating / sweating easily", "Occasional clumsiness (center of gravity shift)", "Insomnia / restless sleep", "Headaches"],
    nutritionAdvice: [
      "Stay cool with hydrating coconut water, fresh watermelon, and mint-lime infusions.",
      "Omega-3 fatty acids remain vital: ensure 300mg DHA daily for infant retinal and cortical wiring."
    ],
    exerciseTips: [
      "Pelvic-Safe Lifting: always bend through knees and hips with a wide stance; never bend at the waist!",
      "Exhale on exertion: exhale gently as you stand up or lift, engaging the pelvic floor upward."
    ],
    checkups: ["Bi-weekly prenatal visit: check maternal blood pressure, urine protein (screen for preeclampsia), and fundal height."],
    thingsToAvoid: ["Hot baths over 38°C, lifting heavy items without assistance, and skipping meals."],
    funFact: "Your baby has distinct pupil reactions to light, closing eyes when sleeping and opening them wide when alert in the womb!"
  },
  {
    week: 34,
    trimester: 3,
    babySize: { name: "Swiss Chard", length: "47.4 cm", weight: "2.6 kg", category: "Third Trimester", emoji: "🥬", indianComparison: "Green Leaf" },
    milestones: [
      "Baby's lungs are nearing full maturity; surfactant production is high enough that breathing air is natural.",
      "Central nervous system is well-integrated; baby sleeps, wakes, listens, and reacts with full bodily reflexes.",
      "Fingernails have grown to the tips of baby's fingers and may occasionally scratch their own cheeks."
    ],
    motherChanges: [
      "Fatigue and heavy pelvic pressure increase as baby settles deeper into the pelvic brim.",
      "Braxton Hicks contractions become more structured and may feel like strong menstrual cramps."
    ],
    symptoms: ["Strong pelvic pressure", "Frequent trips to bathroom", "Swollen feet and fingers", "Difficulty turning in bed"],
    nutritionAdvice: [
      "Include Vitamin K foods (spinach, kale, broccoli) to support normal neonatal blood clotting at birth.",
      "Eat iron-rich meals with citrus fruits to keep maternal hemoglobin optimized for delivery."
    ],
    exerciseTips: [
      "Begin daily perineal massage (using sweet almond or coconut oil) to increase perineal tissue elasticity for birth.",
      "Deep squatting with support (holding a bedpost or partner's hands) to widen pelvic outlet by up to 28%."
    ],
    checkups: ["Weekly or bi-weekly checkup: check fetal presentation, fluid index, and maternal blood pressure."],
    thingsToAvoid: ["Lying flat on your back, crossing your legs, and rushing out of bed without log-rolling first."],
    funFact: "If born this week, babies have a greater than 99% survival rate and generally thrive with only minimal transitional NICU care!"
  },
  {
    week: 35,
    trimester: 3,
    babySize: { name: "Papaya", length: "48.6 cm", weight: "2.9 kg", category: "Third Trimester", emoji: "🍈", indianComparison: "Papita" },
    milestones: [
      "Baby is cozy in the womb with very little room to do somersaults; movements feel like strong rolling pushes and knee nudges.",
      "Kidneys are fully mature, processing fluids; the digestive tract is primed for breast milk digestion.",
      "Most babies are now locked into the cephalic (head-down, vertex) presentation."
    ],
    motherChanges: [
      "Your fundus reaches its highest point — touching the base of your ribcage and sternum.",
      "Breathing may feel slightly labored, but relief is coming as baby prepares to drop into the pelvis."
    ],
    symptoms: ["Shortness of breath", "Pelvic heaviness", "Frequent urination every 30-45 minutes", "Lightning crotch nerve twinges"],
    nutritionAdvice: [
      "Eat small, nutrient-dense meals: boiled eggs, steamed dal, vegetable soups, and fruit bowls.",
      "Stay hydrated to support steady amniotic fluid turnover and prevent premature contractions."
    ],
    exerciseTips: [
      "Tailor-sitting (Baddha Konasana) on a firm cushion for 15 minutes twice daily to open pelvic inlet.",
      "Birth ball hip circles: sit upright with hips higher than knees to encourage baby's head to descend centrally."
    ],
    checkups: ["Group B Streptococcus (GBS) vaginal-rectal swab screening (performed between Weeks 35 and 37)."],
    thingsToAvoid: ["Slouching backward into recliners or sofas (keep your belly lower than your hips to prevent posterior position)."],
    funFact: "Baby's brain is growing so fast that their head circumference is now almost equal to the circumference of their abdomen!"
  },
  {
    week: 36,
    trimester: 3,
    babySize: { name: "Winter Melon", length: "49.8 cm", weight: "3.1 kg", category: "Pre-Term / Drop", emoji: "🍈", indianComparison: "Petha" },
    milestones: [
      "Baby undergoes **'Lightening' (Engagement)**: baby's head drops down into the maternal pelvic inlet.",
      "Gaining approximately 200-250 grams of weight every single week.",
      "Digestive meconium is safely sealed inside bowels; lungs have abundant surfactant ready for the first breath."
    ],
    motherChanges: [
      "When baby drops ('lightening'), pressure on your diaphragm eases — suddenly you can breathe deeply again!",
      "However, pressure on your bladder and pelvic floor increases significantly; walking feels more like a waddle."
    ],
    symptoms: ["Easier breathing but heavier pelvic pressure", "Frequent bathroom visits", "Increased vaginal discharge", "Braxton Hicks contractions"],
    nutritionAdvice: [
      "Start eating 6 soft Medjool dates daily (scientific studies show eating dates in late pregnancy promotes smoother cervical dilation!).",
      "Stay well-hydrated with water, electrolyte tender coconut water, and raspberry leaf tea."
    ],
    exerciseTips: [
      "Curb walking: walk with one foot on the curb and one on the street to create asymmetric pelvic movement that helps baby engage.",
      "Cat-Cow and pelvic rocking to relieve lower back pressure caused by engaged fetal head."
    ],
    checkups: ["Weekly prenatal checkups begin from now until delivery! Internal pelvic exam may check cervical dilation and effacement."],
    thingsToAvoid: ["Heavy lifting, high-impact running, and traveling far away from your delivery hospital."],
    funFact: "Baby has shed most of the fine lanugo hair, and their digestive tract contains meconium from swallowed vernix and fluids!"
  },
  {
    week: 37,
    trimester: 3,
    babySize: { name: "Pumpkin", length: "50.7 cm", weight: "3.3 kg", category: "Early Full Term", emoji: "🎃", indianComparison: "Kaddu" },
    milestones: [
      "**Congratulations — Baby is officially considered Early Term!**",
      "All organ systems are fully functional; lungs produce rich surfactant ready for independent respiration.",
      "Baby has a firm grasp reflex: if you put a finger into their palm at birth, they hold on tight!"
    ],
    motherChanges: [
      "The cervix may begin softening, thinning (effacing), and opening slightly (dilating).",
      "Nesting instinct kicks in: you may feel sudden energetic bursts to organize, clean, and pack hospital bags."
    ],
    symptoms: ["Mucus plug discharge (may be tinged pink or brown — 'bloody show')", "Pelvic pressure and lightning crotch", "Mild diarrhea (body naturally clearing bowels before labor)"],
    nutritionAdvice: [
      "Eat light, easily digestible meals rich in complex carbs for sustained stamina (porridge, khichdi, idlis).",
      "Keep eating dates (4-6 daily) and drinking warm water to keep uterine tissues supple."
    ],
    exerciseTips: [
      "Gentle pelvic rocking on a birthing ball to encourage baby's head to apply even pressure on the cervix.",
      "Rest when tired! Conserve your energy reserves for the marathon of labor."
    ],
    checkups: ["Weekly checkup: check cervical effacement, blood pressure, non-stress test (NST) if indicated, and hospital bag verification."],
    thingsToAvoid: ["Over-exhausting yourself during nesting bursts, and ignoring signs of true labor (regular contractions < 5 mins apart)."],
    funFact: "Your baby has about 300 bones right now — some will fuse together after birth, leaving an adult with 206 bones!"
  },
  {
    week: 38,
    trimester: 3,
    babySize: { name: "Watermelon", length: "51.2 cm", weight: "3.5 kg", category: "Full Term", emoji: "🍉", indianComparison: "Tarbooz" },
    milestones: [
      "**Baby is Full Term!** Organs are primed for life outside the protective uterine womb.",
      "Baby's vocal cords are strong; lungs and vocal apparatus are fully prepared for that triumphant first cry.",
      "Most vernix has dissolved into the amniotic fluid, leaving just a thin protective layer for smooth passage."
    ],
    motherChanges: [
      "Cervix continues ripening; Braxton Hicks contractions may become more regular and intense.",
      "Weight gain typically plateaus or drops slightly by 0.5 kg as fluid levels stabilize."
    ],
    symptoms: ["Braxton Hicks contractions that ease when changing positions", "Pelvic pressure", "Swollen ankles", "Difficulty sleeping"],
    nutritionAdvice: [
      "Eat easily digestible, energy-boosting meals: banana smoothies, vegetable soups, and whole grains.",
      "Stay deeply hydrated to ensure smooth amniotic circulation and prevent false-labor dehydration cramps."
    ],
    exerciseTips: [
      "Gentle walking and pelvic floor release (focus on lengthening and releasing the pelvic muscles, not just tightening).",
      "Deep supported squats holding onto partner or bed to open the pelvic outlet."
    ],
    checkups: ["Weekly checkup: assess fetal head station (-3 to +3 engagement), maternal blood pressure, and cervical score."],
    thingsToAvoid: ["Lying flat on your back, heavy strain, and traveling far from your birth center."],
    funFact: "Baby's intestines are packed with sterile green-black meconium, which will be passed within the first 24-48 hours after birth!"
  },
  {
    week: 39,
    trimester: 3,
    babySize: { name: "Small Jackfruit", length: "51.8 cm", weight: "3.7 kg", category: "Full Term Ready", emoji: "🍈", indianComparison: "Chhota Kathal" },
    milestones: [
      "Baby continues building antibodies through the placenta to provide immune defense for the first 6 months of life.",
      "Skin is smooth, soft, and plumped with healthy subcutaneous fat reserves.",
      "Skull bones remain pliable with open fontanelles (soft spots) to mold safely through the birth canal."
    ],
    motherChanges: [
      "True labor could begin any day! Your body is producing prostaglandins to soften and dilate the cervix.",
      "Your water might break (amniotic sac rupture) as a sudden gush or a slow, continuous trickle."
    ],
    symptoms: ["Loss of mucus plug / bloody show", "Regular contractions that grow stronger, longer, and closer together", "Lower back ache wrapping to front"],
    nutritionAdvice: [
      "Stock up on labor snacks: honey sticks, coconut water, energy balls, and electrolyte drinks.",
      "Eat light, nourishing soups and easy-to-digest khichdi to keep energy steady."
    ],
    exerciseTips: [
      "Forward-leaning positions: lean over a birth ball or counter with soft hips to keep baby in optimal LOA position.",
      "Slow, rhythmic breathing exercises: inhale for 4, exhale for 6 to practice breathing through contractions."
    ],
    checkups: ["Weekly prenatal checkup: monitor fetal heart rate, maternal vitals, and discuss hospital admission timing (5-1-1 rule)."],
    thingsToAvoid: ["Panicking when contractions start — time them calmly using your BloomNest Contraction Timer!"],
    funFact: "Only about 5% of babies are born on their exact calculated due date — most arrive between Weeks 38 and 41!"
  },
  {
    week: 40,
    trimester: 3,
    babySize: { name: "Full-Term Newborn", length: "52.4 cm", weight: "3.9 kg", category: "Due Date Arrival", emoji: "👶", indianComparison: "Poora Tayaar Shishu" },
    milestones: [
      "**Happy Official Due Date! Your little miracle is 100% fully grown and ready to meet the world.**",
      "Lungs are primed with surfactant, ready to take that first breath of room air within seconds of birth.",
      "Baby's head is engaged in the pelvis, awaiting the hormonal signal from the brain to initiate labor."
    ],
    motherChanges: [
      "Your body is completely prepared for labor and birth; oxytocin receptors in the uterus have increased 200-fold.",
      "Contractions will begin spontaneously or your doctor may discuss natural cervical ripening methods."
    ],
    symptoms: ["True labor contractions (rhythmic, intensifying, not stopping with rest)", "Amniotic fluid rupture", "Intense pelvic pressure", "Bloody show"],
    nutritionAdvice: [
      "Keep hydration high with electrolyte water, tender coconut water, and easily digestible energy snacks.",
      "Don't worry if you go past 40 weeks — up to 41 weeks is completely normal and healthy for first-time mothers."
    ],
    exerciseTips: [
      "Curb walking and gentle figure-8 pelvic rolls on a birthing ball to encourage cervical dilation.",
      "Rest and relax: oxytocin flows best when mother feels safe, calm, loved, and unhurried."
    ],
    checkups: ["Post-date checkup: Non-Stress Test (NST), Biophysical Profile (BPP), and amniotic fluid volume assessment."],
    thingsToAvoid: ["Stress, heavy unverified herbal labor inducers, and exhaustion — trust your body and baby's timing!"],
    funFact: "Within seconds of birth, your baby will take their first breath, their fetal cardiac shunts will close, and they will recognize your voice instantly!"
  }
];
