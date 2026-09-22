// Clinically authentic yet 100% accessible, simple & mom-friendly week-by-week Maternal Posture & Ergonomics for all 40 weeks

export interface SlouchPoint {
  title: string;
  desc: string;
}

export interface PlumbLinePoint {
  title: string;
  desc: string;
}

export interface DailyErgonomicTabContent {
  title: string;
  description: string;
  checklist: { text: string; type: "success" | "warning" }[];
  clinicalTipTitle: string;
  clinicalTipText: string;
}

export interface PostureChecklistItem {
  id: "chin" | "shoulders" | "pelvis" | "knees";
  label: string;
  desc: string;
}

export interface MaternalPostureWeekData {
  week: number;
  trimester: number;
  trimesterTitle: string;
  trimesterSubtitle: string;
  centerOfGravityCm: number;
  fundalHeight: string;
  relaxinStatus: string;
  fetalTargetPosition: string;
  slouchCard: {
    badge: string;
    title: string;
    shearForce: string;
    shearBadgeColor: string;
    points: SlouchPoint[];
  };
  plumbLineCard: {
    badge: string;
    title: string;
    shearReduction: string;
    points: PlumbLinePoint[];
  };
  ergonomics: {
    standing: DailyErgonomicTabContent;
    sitting: DailyErgonomicTabContent;
    sleeping: DailyErgonomicTabContent;
    lifting: DailyErgonomicTabContent;
  };
  checklistItems: PostureChecklistItem[];
}

// 40-Week Mom-Friendly Knowledge Map
interface WeekBiomechanicsMeta {
  stageName: string;
  fundus: string;
  relaxin: string;
  fetalStation: string;
  primaryRisk: string;
  primaryRelief: string;
  standingTip: string;
  sittingTip: string;
  sleepingTip: string;
  liftingTip: string;
}

const WEEKLY_BIOMECHANICS_META: Record<number, WeekBiomechanicsMeta> = {
  1: {
    stageName: "Fresh Cycle Reset & Gentle Pelvic Care",
    fundus: "Snug low in your pelvic bowl",
    relaxin: "Normal resting levels",
    fetalStation: "Preparing for a new cycle",
    primaryRisk: "Cramping can make you hunch forward and round your upper back.",
    primaryRelief: "Take deep, slow belly breaths to relax your tummy and lower back.",
    standingTip: "Balance your weight equally on both feet to ease lower back tension.",
    sittingTip: "Sit upright on your sitting bones so your belly can breathe easily.",
    sleepingTip: "Curl gently on your side with a warm blanket supporting your lower back.",
    liftingTip: "Breathe out smoothly when lifting light items; avoid straining your tummy.",
  },
  2: {
    stageName: "Natural Balance & Gentle Standing",
    fundus: "Snug deep in your pelvic bowl",
    relaxin: "Gentle natural hormone flow",
    fetalStation: "Egg cell preparing for journey",
    primaryRisk: "Mild ovulation twinges can make you lean more onto one hip.",
    primaryRelief: "Stand tall with hips level so your body stays balanced and relaxed.",
    standingTip: "Avoid leaning into one hip when standing in queues or at the kitchen sink.",
    sittingTip: "Keep both feet flat on the floor to prevent your hips from twisting.",
    sleepingTip: "Sleep in whatever position feels deepest and most restful for you.",
    liftingTip: "Bend gently from your hips and knees to keep your spine straight.",
  },
  3: {
    stageName: "Tiny Spark & Early Rest",
    fundus: "Snug deep in your pelvic bowl",
    relaxin: "Body naturally begins relaxing joints",
    fetalStation: "Tiny cell cluster nestling into place",
    primaryRisk: "Sudden afternoon fatigue can tempt you to slump in your chair.",
    primaryRelief: "Roll your shoulders back and keep your chest gently open.",
    standingTip: "Check that your ears are resting directly above your shoulders.",
    sittingTip: "Avoid sinking into deep, soft couches that make your lower back round.",
    sleepingTip: "Rest with a soft, small pillow tucked under your tummy or knees.",
    liftingTip: "Breathe naturally and keep items close to your body when carrying.",
  },
  4: {
    stageName: "Baby Settling In & Gentle Spine Care",
    fundus: "Safe & cozy in your pelvis",
    relaxin: "Gentle joint softening starts",
    fetalStation: "Safely tucked inside your uterine wall",
    primaryRisk: "Tired muscles can make you tuck your tailbone too far underneath you.",
    primaryRelief: "Keep a relaxed, natural curve in your lower back.",
    standingTip: "Keep a tiny spring in your knees rather than locking them stiff.",
    sittingTip: "Place a small folded towel behind your lower back for gentle support.",
    sleepingTip: "Try tucking a pillow between your knees when lying on your side.",
    liftingTip: "Bend your knees to pick things up; never bend straight from the waist.",
  },
  5: {
    stageName: "Early Weeks & Chest-Opening Breaths",
    fundus: "Safe & cozy in your pelvis",
    relaxin: "Joints and ligaments softening",
    fetalStation: "Tiny baby developing a cozy home",
    primaryRisk: "Morning nausea can make you curl your chest inward.",
    primaryRelief: "Lift your collarbones gently to give your lungs plenty of breathing room.",
    standingTip: "Gently roll your shoulders back and down every hour to shake off fatigue.",
    sittingTip: "Keep your computer screen at eye level so your neck doesn't poke forward.",
    sleepingTip: "Prop your head slightly higher with an extra pillow if you feel mild reflux.",
    liftingTip: "Avoid sudden twisting motions when picking up grocery bags.",
  },
  6: {
    stageName: "Beating Heart & Deep Belly Breathing",
    fundus: "Safe & cozy in your pelvis",
    relaxin: "Gentle body softening continues",
    fetalStation: "Tiny heart beating like a little drum",
    primaryRisk: "Feeling sick or tired can make you hunch forward over your tummy.",
    primaryRelief: "Stand tall and take slow, deep breaths to bring fresh oxygen to your body.",
    standingTip: "Spread your toes comfortably in your shoes to feel grounded and steady.",
    sittingTip: "Take a short 2-minute walking break every 30 minutes to get blood flowing.",
    sleepingTip: "If sore breasts make tummy sleeping uncomfortable, gently switch to your side.",
    liftingTip: "Breathe out as you stand up from a low seat or squat.",
  },
  7: {
    stageName: "Tiny Limbs Growing & Balanced Stance",
    fundus: "Safe & cozy in your pelvis",
    relaxin: "Hip ligaments relaxing slightly",
    fetalStation: "Tiny arms and leg buds stretching",
    primaryRisk: "Tiredness can make you dump all your body weight into your heels.",
    primaryRelief: "Share your weight evenly between your toes and heels.",
    standingTip: "Imagine a gentle line running straight from your ears down to your ankles.",
    sittingTip: "Keep your ankles uncrossed so blood flows easily through your legs.",
    sleepingTip: "Hug a body pillow to support your arms and keep your chest open.",
    liftingTip: "Hold packages with both hands rather than balancing them on one hip.",
  },
  8: {
    stageName: "Lengthening Spine & Sitting Tall",
    fundus: "Safe & cozy in your pelvis",
    relaxin: "Pelvic ligaments naturally easing",
    fetalStation: "Little fingers and toes taking shape",
    primaryRisk: "Slumping backward onto your tailbone in soft desk chairs.",
    primaryRelief: "Sit right on your sitting bones so your spine stays naturally tall.",
    standingTip: "Try the wall check: stand with your back to a wall — only a flat palm should slide behind your lower back.",
    sittingTip: "Sit on a small cushion that keeps your hips slightly higher than your knees.",
    sleepingTip: "Place a soft pillow between your knees to keep your hips relaxed.",
    liftingTip: "Keep whatever you are lifting within 6 inches of your body.",
  },
  9: {
    stageName: "Relaxing Neck & Shoulders",
    fundus: "Safe & cozy in your pelvis",
    relaxin: "Softer muscles & ligaments",
    fetalStation: "Baby moving and wiggling gently",
    primaryRisk: "Looking down at phones and screens can make your neck feel tight and sore.",
    primaryRelief: "Tuck your chin gently and imagine the crown of your head floating tall.",
    standingTip: "Lengthen the back of your neck toward the sky without tilting your head down.",
    sittingTip: "Rest your forearms comfortably on your desk to relax your shoulder muscles.",
    sleepingTip: "Use a pillow that keeps your neck level with your mattress, not tilted.",
    liftingTip: "Keep your elbows close to your sides when carrying small bags or boxes.",
  },
  10: {
    stageName: "Gentle Lower Belly Support",
    fundus: "Just peeking above your pelvis",
    relaxin: "Natural joint flexibility begins",
    fetalStation: "Baby's tiny organs fully formed",
    primaryRisk: "Your tummy starts pushing forward, arching your lower back.",
    primaryRelief: "Gently hug your baby with your lower tummy muscles — don't suck your stomach in.",
    standingTip: "Point your tailbone gently toward the floor instead of sticking it out behind you.",
    sittingTip: "Make sure your chair fully supports your thighs so your legs don't get tired.",
    sleepingTip: "Start making a cozy habit of sleeping on your side with a supportive pillow.",
    liftingTip: "Step your feet wide apart before picking up laundry baskets from the floor.",
  },
  11: {
    stageName: "Active Kicks & Steady Foot Balance",
    fundus: "Just behind your pubic bone",
    relaxin: "Ligaments loosening comfortably",
    fetalStation: "Baby somersaulting in warm fluid",
    primaryRisk: "Wearing flat shoes with no support can tire your feet and ankles.",
    primaryRelief: "Wear comfortable, supportive shoes that cushion your feet all day.",
    standingTip: "Never lock your knees backward stiffly when standing in queues.",
    sittingTip: "Keep your hips slightly higher than your knees to keep circulation active.",
    sleepingTip: "Place a pillow behind your back so you don't roll flat on your back during sleep.",
    liftingTip: "Gently tighten your pelvic muscles before picking up toddlers or bags.",
  },
  12: {
    stageName: "End of First Trimester & Tummy Rising",
    fundus: "Just above your pubic bone",
    relaxin: "Healthy joint softening active",
    fetalStation: "Baby is fully formed & growing fast",
    primaryRisk: "Your growing uterus starts shifting your balance forward, tempting you to lean back.",
    primaryRelief: "Keep your ears over your shoulders and breathe deeply into your belly.",
    standingTip: "Stand tall and think of gently 'hugging baby' every time you breathe out.",
    sittingTip: "Avoid deep couches that let your hips sink down lower than your knees.",
    sleepingTip: "Practice sleeping on your left side to give baby the sweetest blood flow.",
    liftingTip: "Squat down with chest proud; push through your heels to stand up.",
  },
  13: {
    stageName: "Energy Rebound & Walking Tall",
    fundus: "Clearly above your pubic bone",
    relaxin: "Placenta producing steady relaxin",
    fetalStation: "Baby has unique tiny fingerprints!",
    primaryRisk: "As energy returns, you may walk fast and over-arch your lower back.",
    primaryRelief: "Keep a balanced posture with ears over shoulders and hips over heels.",
    standingTip: "Take smooth, comfortable steps without swinging your hips side-to-side.",
    sittingTip: "Sit on a big exercise ball for 15 minutes to gently move your hips.",
    sleepingTip: "Use a slim pillow under your side to keep your body tilted comfortably.",
    liftingTip: "Keep loads light (under 10 kg); ask family to help with heavy lifting.",
  },
  14: {
    stageName: "Second Trimester Bloom & Hip Balance",
    fundus: "2 fingerbreadths above pubic bone",
    relaxin: "Hips feel noticeably more flexible",
    fetalStation: "Baby drinks warm fluid & stretches",
    primaryRisk: "Popping one hip to the side can pull on the stretchy bands around your belly.",
    primaryRelief: "Keep your weight equal on both feet so the sides of your tummy feel relaxed.",
    standingTip: "Keep both feet pointing straight ahead like train tracks, not pointing out like a duck.",
    sittingTip: "Never cross your legs at the knees — keep feet resting flat on the floor.",
    sleepingTip: "Sleep on your left side with a soft pillow between your knees and ankles.",
    liftingTip: "Step your feet wide into a comfortable sumo squat when picking items up.",
  },
  15: {
    stageName: "Growing Strong & Relaxed Knees",
    fundus: "A few inches above pubic bone",
    relaxin: "Joints expanding comfortably",
    fetalStation: "Baby's tiny bones growing stronger",
    primaryRisk: "Locking your knees and putting all your body weight straight onto your heels.",
    primaryRelief: "Keep a soft, springy bend in your knees so your leg muscles absorb the weight.",
    standingTip: "Make sure you feel your toes and heels equally resting on the floor.",
    sittingTip: "Put a small cushion behind your lower back to maintain your natural spine curve.",
    sleepingTip: "Tuck a soft pillow under your belly to stop it from pulling down on your side.",
    liftingTip: "Keep any shopping bag or item tucked close to your chest when carrying.",
  },
  16: {
    stageName: "Glowing Mama & Lower Back Care",
    fundus: "Midway between pubic bone & navel",
    relaxin: "Hip joints naturally softening",
    fetalStation: "Baby's eyes can sense gentle light",
    primaryRisk: "Arching your lower back too much as your cute baby bump blossoms.",
    primaryRelief: "Gently lengthen your tailbone downward to keep your back happy and pain-free.",
    standingTip: "Every 20 minutes, gently sway your hips in soft circles to release lower back tightness.",
    sittingTip: "Use a small footstool under your feet if your chair feels too high.",
    sleepingTip: "Hug a full-length pregnancy pillow to keep your whole body gently supported.",
    liftingTip: "Always bend your knees and breathe out as you lift up any grocery bag.",
  },
  17: {
    stageName: "Baby Moves & Keeping Hips Level",
    fundus: "Growing steadily toward your navel",
    relaxin: "Pelvic ligaments opening up",
    fetalStation: "Baby starts storing gentle fat tissue",
    primaryRisk: "Leaning back while walking to balance your bump, creating a 'waddle'.",
    primaryRelief: "Take gentle, normal strides and keep your shoulders relaxed away from your ears.",
    standingTip: "Keep your feet under your hips rather than taking overly wide steps.",
    sittingTip: "Avoid twisting your upper body while reaching for things at your desk.",
    sleepingTip: "Sleep mostly on your left side; pop a pillow behind your back so you don't roll over.",
    liftingTip: "Never lift anything heavy over 8 kg — let your partner or family take care of it!",
  },
  18: {
    stageName: "Sweet Flutter Kicks & Comfy Sitting",
    fundus: "Just below your belly button",
    relaxin: "Gentle hip and back flexibility",
    fetalStation: "Baby can hear your voice and songs!",
    primaryRisk: "Slumping on soft couches which squashes your tummy and tires your lower back.",
    primaryRelief: "Sit with your hips a little higher than your knees so your baby has plenty of room.",
    standingTip: "Imagine a gentle balloon lifting the top of your head toward the sky.",
    sittingTip: "Sit backwards on an armless chair, resting your arms on the backrest for great back relief.",
    sleepingTip: "Place a flat pillow under your hip to keep your pelvis level throughout the night.",
    liftingTip: "Keep packages right in front of your chest, never out at arm's length.",
  },
  19: {
    stageName: "Belly Blooming & Good Posture",
    fundus: "One finger below your belly button",
    relaxin: "Strong joint flexibility active",
    fetalStation: "Baby covered in velvety vernix cream",
    primaryRisk: "Shoulders rolling forward as your breasts and bump both grow.",
    primaryRelief: "Roll your shoulders back and open your chest to breathe deeply.",
    standingTip: "Press your heels into the floor and stretch your spine tall every time you stand.",
    sittingTip: "Sit upright with your back supported; avoid slouching your belly into your lap.",
    sleepingTip: "A U-shaped pregnancy pillow offers wonderful support for your back and bump.",
    liftingTip: "Ask for help with suitcases, heavy grocery packs, or moving furniture.",
  },
  20: {
    stageName: "Halfway Milestone & Belly Button Level",
    fundus: "Right at your belly button!",
    relaxin: "High joint flexibility for comfort",
    fetalStation: "Baby is 10 inches long and kicking!",
    primaryRisk: "Your belly now pulls your center of gravity forward by 7 cm, causing lower back strain.",
    primaryRelief: "Gently hug your baby inward with your lower tummy muscles to support your spine.",
    standingTip: "Stand with your weight spread evenly across both feet; avoid leaning on one leg.",
    sittingTip: "Use an exercise ball for sitting at home — gently rock your hips front to back.",
    sleepingTip: "Strictly avoid sleeping flat on your back now; sleep on your side with knee pillows.",
    liftingTip: "Always squat low, keep your chest high, and breathe out as you stand.",
  },
  21: {
    stageName: "Active Gymnast & Supporting Your Spine",
    fundus: "1 cm above your belly button",
    relaxin: "Pelvic bones gently relaxing",
    fetalStation: "Baby somersaults and tests tiny muscles",
    primaryRisk: "Sticking your tummy out and leaning your upper body far back.",
    primaryRelief: "Think 'tall and proud' — keep your shoulders over your hips without leaning back.",
    standingTip: "Check your reflection: your ear, shoulder, hip, and ankle should form a straight line.",
    sittingTip: "Take walking breaks every 30 minutes to stop your legs and hips from feeling stiff.",
    sleepingTip: "Tuck a firm pillow under your knees and ankles to take pressure off your hips.",
    liftingTip: "Never lift and twist at the same time; turn your whole body with your feet.",
  },
  22: {
    stageName: "Steady Steps & Happy Feet",
    fundus: "2 cm above your belly button",
    relaxin: "Joints expanding smoothly",
    fetalStation: "Baby has tiny eyebrows and eyelashes",
    primaryRisk: "Your feet may feel tired or roll inward as your body weight increases.",
    primaryRelief: "Wear cushioned, supportive footwear with gentle arch support.",
    standingTip: "Gently unlock your knees so your legs act like natural shock absorbers.",
    sittingTip: "Make sure your lower back is snug against a cushion whenever you sit.",
    sleepingTip: "Place a small folded blanket under your lower back for extra side-sleeping support.",
    liftingTip: "Lift only light items; keep them pinned close against your ribcage.",
  },
  23: {
    stageName: "Baby Hiccups & Chest-Open Breaths",
    fundus: "3 cm above your belly button",
    relaxin: "High flexibility in all joints",
    fetalStation: "Baby practices gentle breathing motions",
    primaryRisk: "Your ribs begin expanding, which can feel tight if you slouch forward.",
    primaryRelief: "Lift your ribcage tall to give your lungs and baby maximum room.",
    standingTip: "Take three slow, deep breaths every hour with your hands resting gently on your ribs.",
    sittingTip: "Sit tall at your dining table and avoid hunching over your meals.",
    sleepingTip: "If you feel short of breath when resting, prop your upper body slightly with 2 pillows.",
    liftingTip: "Always breathe out through your mouth when lifting anything from a counter.",
  },
  24: {
    stageName: "Viability Milestone & Gentle Belly Hug",
    fundus: "4 cm above your belly button",
    relaxin: "Peak natural joint softening",
    fetalStation: "Baby's lungs developing air sacs",
    primaryRisk: "Deep lumbar swayback arch causing aching in your lower spine.",
    primaryRelief: "Practice the 10-second 'gentle baby hug' to bring your bump back into balance.",
    standingTip: "Stand with your feet hip-width apart and imagine roots grounding your feet into the earth.",
    sittingTip: "Sit on a chair with good armrests so you can push up easily with your arms.",
    sleepingTip: "Sleeping on your left side optimizes oxygen and nutrient delivery to your baby.",
    liftingTip: "Maximum lifting limit: 6 kg. Always let family carry grocery sacks.",
  },
  25: {
    stageName: "Growing Fast & Softening Pelvis",
    fundus: "5 cm above your belly button",
    relaxin: "Hips expanding to prepare for birth",
    fetalStation: "Baby responds to familiar voices",
    primaryRisk: "Hip joints feel very loose, so sudden movements can cause groin twinges.",
    primaryRelief: "Keep your movements smooth, steady, and keep both knees together when getting up.",
    standingTip: "Avoid standing still in one spot for too long; shift your weight gently or walk.",
    sittingTip: "When getting out of a car or chair, swing both legs together like a mermaid.",
    sleepingTip: "Use a wedge pillow tucked under your tummy to support its growing weight.",
    liftingTip: "Do not bend over low baby cribs or deep bins without supporting one hand on a rail.",
  },
  26: {
    stageName: "Curious Kicks & Sitting Comfort",
    fundus: "6 cm above your belly button",
    relaxin: "Joints soft and stretchy",
    fetalStation: "Baby opens little eyes for the first time",
    primaryRisk: "Sinking your lower back into soft sofa cushions while watching TV.",
    primaryRelief: "Place a firm pillow behind your spine to keep your back comfortably straight.",
    standingTip: "Keep your chin level and look forward rather than looking down at your bump all the time.",
    sittingTip: "Sit tall with your feet flat on the floor; avoid curling your legs up under you.",
    sleepingTip: "Keep a pillow between your ankles as well as your knees so your lower legs stay level.",
    liftingTip: "Never pick up heavy objects from the floor — ask someone to hand them to you.",
  },
  27: {
    stageName: "Second Trimester Finish & Restful Sleep",
    fundus: "7 cm above your belly button",
    relaxin: "Steady pelvic softening",
    fetalStation: "Baby hiccups, stretches, and naps",
    primaryRisk: "Lower back fatigue after long days of working or standing.",
    primaryRelief: "Lie down on your side with a warm (not hot) pack behind your lower back for 15 minutes.",
    standingTip: "Take short, gentle walking breaks rather than one long, exhausting walk.",
    sittingTip: "Swap your desk chair for an exercise ball for 20 minutes to keep your hips relaxed.",
    sleepingTip: "Make your bed super cozy with pillows supporting your back, tummy, and knees.",
    liftingTip: "Ask for assistance with laundry baskets, vacuum cleaners, and bulky packages.",
  },
  28: {
    stageName: "Third Trimester Welcome & Ribcage Room",
    fundus: "8 cm above navel (near your ribs)",
    relaxin: "Maximum joint laxity begins",
    fetalStation: "Baby turning into a head-down cradle",
    primaryRisk: "Slumping forward pinches your ribs and gives baby less room to turn.",
    primaryRelief: "Stand tall and open your chest to create generous room in your tummy.",
    standingTip: "Keep your weight centered over the middle of your feet, not shoved back into heels.",
    sittingTip: "Sit slightly forward on your chair so your belly hangs freely between your thighs.",
    sleepingTip: "Left-side sleeping is your best friend now; use pillows to stop accidental back-sleeping.",
    liftingTip: "Avoid lifting anything over 5 kg — protect your pelvic floor and lower back!",
  },
  29: {
    stageName: "Baby Senses Active & Easy Walking",
    fundus: "Approaching lower ribs",
    relaxin: "Pelvis naturally expanding",
    fetalStation: "Baby's brain can regulate temperature",
    primaryRisk: "Developing a pronounced waddle that strains your hip joints.",
    primaryRelief: "Walk with smooth, steady steps and let your arms swing gently by your sides.",
    standingTip: "Keep your steps light and bouncy by keeping your knees soft and unlocked.",
    sittingTip: "Ensure your knees are slightly lower than your hips to keep your pelvis open.",
    sleepingTip: "Place a flat pillow under your waist if you feel a gap between your side and the mattress.",
    liftingTip: "Never hold your breath when lifting; gently exhale with every motion.",
  },
  30: {
    stageName: "Full Tummy & Gentle Back Relievers",
    fundus: "Just below your ribcage",
    relaxin: "Pelvic ligaments very soft",
    fetalStation: "Baby practices breathing warm fluid",
    primaryRisk: "Your belly pulls your center of gravity 10+ cm forward, causing deep swayback.",
    primaryRelief: "Gently tuck your tailbone down and think of 'hugging baby up and in'.",
    standingTip: "Rest your hands on a kitchen counter, lean forward slightly, and sway your hips gently.",
    sittingTip: "Sit on an exercise ball and make slow, wide circles with your hips to relieve pressure.",
    sleepingTip: "When getting out of bed, roll onto your side first and push up with your hands.",
    liftingTip: "Delegate all heavy lifting to your partner, family, or friends.",
  },
  31: {
    stageName: "Rapid Brain Growth & Sitting Proud",
    fundus: "11 cm above belly button",
    relaxin: "High pelvic flexibility",
    fetalStation: "Baby turns head from side to side",
    primaryRisk: "Slouching back onto your tailbone while sitting on deep couches.",
    primaryRelief: "Sit forward on your sitting bones so your pelvis stays open and comfortable.",
    standingTip: "Keep your chest open so your lungs have plenty of room to expand.",
    sittingTip: "Use a firm cushion behind your lower back to keep your spine straight.",
    sleepingTip: "A pillow between your knees keeps your hips aligned and prevents sciatic twinges.",
    liftingTip: "Do not bend over to pick up toys or shoes — use a grabber tool or ask for help.",
  },
  32: {
    stageName: "Dreaming Baby & Breathing Space",
    fundus: "Right against your lower ribs",
    relaxin: "Very soft pelvic ligaments",
    fetalStation: "Baby experiencing REM dream sleep!",
    primaryRisk: "Ribcage tightness and feeling out of breath when sitting slumped.",
    primaryRelief: "Sit tall with shoulders relaxed to give your lungs maximum breathing space.",
    standingTip: "Take gentle walking breaks in fresh air to oxygenate your body.",
    sittingTip: "Sit with legs gently open so your tummy rests comfortably between your thighs.",
    sleepingTip: "Elevate your upper body with two pillows if your bump presses on your chest.",
    liftingTip: "Keep loads under 4 kg; carry only your personal essentials in your handbag.",
  },
  33: {
    stageName: "Strong Bones & Balanced Hip Stance",
    fundus: "Very high near lower ribs",
    relaxin: "Joints very flexible for birth",
    fetalStation: "Baby has a firm grip with tiny hands",
    primaryRisk: "Leaning back heavily into your heels while standing in queues.",
    primaryRelief: "Keep a soft bend in your knees and share your weight across your whole foot.",
    standingTip: "Gently shift your weight from left foot to right foot if you have to stand.",
    sittingTip: "Sit backwards on a dining chair with a pillow on the backrest for heavenly relief.",
    sleepingTip: "Sleep on your left side with pillows supporting your tummy, back, and knees.",
    liftingTip: "Never lift heavy boxes or wet laundry; ask your support team for assistance.",
  },
  34: {
    stageName: "Head-Down Turning & Pelvic Comfort",
    fundus: "Just below your sternum",
    relaxin: "Pelvic bones preparing for delivery",
    fetalStation: "Baby settling snugly head-down",
    primaryRisk: "Slouching into soft chairs can tempt baby to turn face-up (back labor position).",
    primaryRelief: "Lean gently forward when resting so baby's heavy back settles against your tummy.",
    standingTip: "Stand tall and think of welcoming your baby down into your pelvis.",
    sittingTip: "Keep your knees lower than your hips on chairs to encourage baby head-down.",
    sleepingTip: "Hug your body pillow and keep your top leg resting on a comfy cushion.",
    liftingTip: "Zero heavy lifting; focus your energy on rest, breathing, and nesting comfortably.",
  },
  35: {
    stageName: "Cozy Tummy & Gentle Hip Circles",
    fundus: "Reaching highest point in abdomen",
    relaxin: "High flexibility in pelvic joints",
    fetalStation: "Baby's brain and fat tissue fully formed",
    primaryRisk: "Groin and pubic bone aches from fast or uneven walking steps.",
    primaryRelief: "Take shorter, gentler steps and keep your knees together when turning.",
    standingTip: "Avoid wide, fast strides; walk at a relaxed, peaceful pace.",
    sittingTip: "Sit on your birthing ball and gently sway in figure-8 shapes to relax your pelvis.",
    sleepingTip: "Use the 'log-roll' technique: roll onto your side, drop legs off the bed, and push up.",
    liftingTip: "Delegate carrying groceries, car seats, or bags completely to others.",
  },
  36: {
    stageName: "Highest Belly Peak & Deep Relaxing",
    fundus: "Highest point near your lower chest",
    relaxin: "Maximum ligament softening",
    fetalStation: "Baby filling the entire womb cozy & snug",
    primaryRisk: "Breathing feels shallow and lower back feels heavy from maximum belly height.",
    primaryRelief: "Sit tall with an open chest; your baby will drop lower very soon!",
    standingTip: "Rest your hands on a table or counter and let your belly hang gently forward.",
    sittingTip: "Sit on a firm chair with plenty of lower back support; avoid soft bean bags or couches.",
    sleepingTip: "Keep 2-3 pillows propping your head and back comfortably on your side.",
    liftingTip: "Rest your body; do not carry anything heavier than a cup of water or tea.",
  },
  37: {
    stageName: "Full-Term Ready & Lightening Begins",
    fundus: "Starts to settle slightly lower",
    relaxin: "Pelvic joints very loose and ready",
    fetalStation: "Baby is officially full-term!",
    primaryRisk: "Baby dropping into your pelvis creates more pelvic pressure and walking fatigue.",
    primaryRelief: "Take slow, peaceful walks and rest your hips frequently on a birth ball.",
    standingTip: "Wear supportive flat shoes; avoid walking barefoot on hard tile floors.",
    sittingTip: "Rock gently on your birthing ball to help baby's head settle evenly into your pelvis.",
    sleepingTip: "Keep a fluffy pillow between your knees to relieve pelvic bone pressure.",
    liftingTip: "Zero lifting: let your partner and family handle all home preparations.",
  },
  38: {
    stageName: "Baby Drops Down & Preparing for Delivery",
    fundus: "Noticeably lower ('Lightening')",
    relaxin: "Pelvis wide and ready for birth",
    fetalStation: "Baby's head nestled deep in pelvis",
    primaryRisk: "Pelvic heaviness can tempt you to shuffle your feet or waddle sharply.",
    primaryRelief: "Keep your chest open and let your hips stay soft, welcoming baby down.",
    standingTip: "Sway your hips gently side-to-side like dancing to help baby settle comfortably.",
    sittingTip: "Sit on the edge of a sturdy chair with knees wide and feet flat on the floor.",
    sleepingTip: "Rest as much as possible; naps on your left side give you strength for labor.",
    liftingTip: "Let your support team carry all hospital bags and nursery gear.",
  },
  39: {
    stageName: "Nesting Days & Gentle Labor Stances",
    fundus: "Low in pelvis; ribs feel free!",
    relaxin: "Birth canal ligaments fully softened",
    fetalStation: "Head deep in pelvis ready for birth",
    primaryRisk: "Over-exerting yourself with frantic cleaning or nesting chores.",
    primaryRelief: "Conserve your energy; gentle forward-leaning stances encourage smooth contractions.",
    standingTip: "Lean over your kitchen counter or your partner's shoulders to relax your lower back.",
    sittingTip: "Kneel on a soft rug and lean forward over an exercise ball or couch cushion.",
    sleepingTip: "Rest on your side with lots of pillows whenever you feel tired; sleep is fuel.",
    liftingTip: "Strictly no lifting; focus on deep breathing, hydration, and relaxation.",
  },
  40: {
    stageName: "Due Date & Welcoming Your Baby",
    fundus: "Deep in pelvic birth canal",
    relaxin: "Maximum flexibility for gentle delivery",
    fetalStation: "Ready to meet you any moment!",
    primaryRisk: "Tension and waiting anxiety can make you clench your jaw, neck, and pelvis.",
    primaryRelief: "Drop your shoulders, soften your jaw, and breathe out with long, relaxing sighs.",
    standingTip: "Walk gently during early labor, swaying your hips freely with each step.",
    sittingTip: "Sit forward on your birth ball or sit backwards on a chair to keep your pelvis wide.",
    sleepingTip: "Rest on your left side between gentle early contractions with loving support.",
    liftingTip: "Zero lifting: let your partner and medical team take care of everything!",
  },
};

export function getMaternalPostureData(week: number): MaternalPostureWeekData {
  const safeWeek = Math.max(1, Math.min(40, Math.round(week || 1)));
  const meta = WEEKLY_BIOMECHANICS_META[safeWeek] || WEEKLY_BIOMECHANICS_META[24];
  const trimester = safeWeek <= 13 ? 1 : safeWeek <= 27 ? 2 : 3;

  // Center of gravity shifts forward incrementally with each gestational week
  const centerOfGravityCm = Number(Math.min(safeWeek * 0.35, 14).toFixed(1));
  const shearForcePercent = Math.min(10 + Math.round(safeWeek * 1.5), 72);
  const shearReductionPercent = Math.min(16 + Math.round(safeWeek * 0.75), 45);

  const shearColor =
    shearForcePercent <= 25
      ? "text-amber-700 dark:text-amber-300"
      : shearForcePercent <= 50
      ? "text-orange-700 dark:text-orange-300"
      : "text-red-700 dark:text-red-300";

  return {
    week: safeWeek,
    trimester,
    trimesterTitle: `Week ${safeWeek} · ${meta.stageName}`,
    trimesterSubtitle: `At Week ${safeWeek}, your baby and belly are ${meta.fundus.toLowerCase()}. Your center of balance has gently shifted +${centerOfGravityCm} cm forward. Standing tall and keeping a balanced posture relieves lower back strain by ${shearReductionPercent}% and gives your baby the best room to settle comfortably.`,
    centerOfGravityCm,
    fundalHeight: meta.fundus,
    relaxinStatus: meta.relaxin,
    fetalTargetPosition: meta.fetalStation,
    slouchCard: {
      badge: `Week ${safeWeek} Posture Watch-out`,
      title: `⚠️ Week ${safeWeek}: Common Slouch & Back Strain`,
      shearForce: `Extra Back Strain: +${shearForcePercent}%`,
      shearBadgeColor: shearColor,
      points: [
        {
          title: `1. Body Balance Shift (+${centerOfGravityCm} cm forward):`,
          desc: `As your belly grows forward, your body naturally tries to lean backward, putting extra strain on your lower back muscles.`,
        },
        {
          title: `2. Common Habit to Avoid:`,
          desc: meta.primaryRisk,
        },
        {
          title: `3. Joint & Hip Strain:`,
          desc: `Your joints are naturally softer right now (${meta.relaxin.toLowerCase()}). Leaning heavily on one hip or locking your knees can cause hip or groin aches.`,
        },
        {
          title: `4. Room for Your Baby:`,
          desc:
            safeWeek >= 28
              ? "Slumping back into soft couches makes your tummy cave in, giving baby less room to turn into the easiest head-down position."
              : "Slumping forward squashes your tummy, making it harder to take full, deep breaths.",
        },
      ],
    },
    plumbLineCard: {
      badge: `Week ${safeWeek} Healthy Posture`,
      title: `✅ Week ${safeWeek}: Stand Tall & Feel Light`,
      shearReduction: `Back Strain Relief: -${shearReductionPercent}%`,
      points: [
        {
          title: `1. Ears Over Shoulders:`,
          desc: "Hold your head tall like an invisible string is gently lifting the crown of your head, keeping your chin level and neck relaxed.",
        },
        {
          title: `2. Gentle Baby Balance:`,
          desc: meta.primaryRelief,
        },
        {
          title: `3. Soft Knees & Steady Feet:`,
          desc: `Keep a soft, springy bend in your knees and share your weight equally across both feet so your legs stay light and energized.`,
        },
        {
          title: `4. Room for Baby (${meta.fetalStation}):`,
          desc:
            safeWeek >= 28
              ? "Leaning gently forward opens your pelvis, helping your baby's heavy back swing forward into the easiest position for birth."
              : "Standing tall gives your growing baby plenty of space and keeps your back feeling completely relaxed.",
        },
      ],
    },
    ergonomics: {
      standing: {
        title: `Week ${safeWeek} Standing: Balanced & Light on Your Feet`,
        description: `At Week ${safeWeek}, your baby and belly have shifted your balance +${centerOfGravityCm} cm forward. Standing balanced prevents backaches.`,
        checklist: [
          { text: meta.standingTip, type: "success" },
          { text: "Keep both feet flat on the ground, shoulder-width apart, with toes relaxed.", type: "success" },
          { text: "Avoid locking your knees stiff or leaning all your body weight into just one hip.", type: "warning" },
        ],
        clinicalTipTitle: `WEEK ${safeWeek} STANDING COMFORT TIP`,
        clinicalTipText:
          safeWeek <= 13
            ? "Try the 10-second wall check: stand with your back against a wall. Only a flat palm should slide comfortably behind your lower back — not a whole fist!"
            : safeWeek <= 27
            ? "Practice the 10-second 'gentle baby hug': breathe in into your side ribs, and as you breathe out, gently hug your baby in toward your spine with your tummy muscles."
            : "Whenever you stand at the kitchen counter or bathroom sink, lean forward gently with your hands on the counter and sway your hips softly side to side to give your back a lovely stretch!",
      },
      sitting: {
        title: `Week ${safeWeek} Sitting: Comfortable Back & Hip Support`,
        description: `Sitting comfortably at Week ${safeWeek} takes all the pressure off your tailbone and keeps blood flowing freely to your baby.`,
        checklist: [
          { text: meta.sittingTip, type: "success" },
          { text: "Sit evenly on your sitting bones, keeping your hips a little higher than your knees.", type: "success" },
          { text: "Avoid crossing your legs at the knees or ankles — it twists your hips and slows blood circulation.", type: "warning" },
        ],
        clinicalTipTitle: `WEEK ${safeWeek} SITTING COMFORT TIP`,
        clinicalTipText:
          safeWeek <= 13
            ? "Keep your elbows, hips, and knees at comfortable right angles. Take a short 2-minute stroll every 30 minutes to stay fresh."
            : safeWeek <= 27
            ? "Try sitting on a big exercise ball for 20 minutes twice a day. Gently rolling your hips in slow circles keeps your pelvic joints relaxed and happy."
            : "Turn an armless dining chair backwards and sit straddling it, resting your arms on the backrest with a cushion. This opens your pelvis and feels amazing for your lower back!",
      },
      sleeping: {
        title: `Week ${safeWeek} Sleep: Cozy Nights & Hip Relief`,
        description: `Deep, peaceful sleep gives you and your baby energy at Week ${safeWeek}. Simple pillow support keeps you waking up fresh without aches.`,
        checklist: [
          { text: meta.sleepingTip, type: "success" },
          { text: "Place a soft, supportive pillow between your knees and ankles to keep your hips level and relaxed.", type: "success" },
          {
            text:
              safeWeek >= 20
                ? "Avoid sleeping flat on your back so your heavy belly doesn't press on major blood vessels that carry oxygen to baby."
                : "Rest in whatever position gives you deep sleep; start building the comfy side-sleeping habit early.",
            type: "warning",
          },
        ],
        clinicalTipTitle: `WEEK ${safeWeek} SLEEP COMFORT TIP`,
        clinicalTipText:
          safeWeek <= 13
            ? "If tender breasts make sleeping on your stomach uncomfortable, tuck a soft, flat pillow under your chest or side for instant relief."
            : safeWeek <= 27
            ? "Sleeping on your left side gives your baby the sweetest flow of blood and oxygen. Pop a small pillow behind your back so you don't accidentally roll flat."
            : "When getting out of bed, always roll onto your side first, slide both legs over the edge, and push up with your hands. This protects your tummy muscles from stretching!",
      },
      lifting: {
        title: `Week ${safeWeek} Lifting: Safe for Your Back & Tummy`,
        description: `Your joints are naturally softer right now (${meta.relaxin.toLowerCase()}), so let your strong legs do the work instead of your back.`,
        checklist: [
          { text: meta.liftingTip, type: "success" },
          { text: "Always breathe out smoothly as you lift anything; never hold your breath.", type: "success" },
          { text: "Never bend straight from your waist with stiff legs, or twist your body while carrying loads.", type: "warning" },
        ],
        clinicalTipTitle: `WEEK ${safeWeek} LIFTING SAFETY TIP`,
        clinicalTipText:
          safeWeek <= 13
            ? "Breathe in to get ready, then breathe out gently as you push through your heels to stand up, keeping your tummy safe."
            : safeWeek <= 27
            ? "Step your feet wide into a sumo squat to lower yourself. Hug the item close against your chest rather than carrying it out at arm's length."
            : "Your pelvic joints are very loose getting ready for birth. Do not lift anything heavy (over 5 kg) — let your partner and family handle all the heavy lifting!",
      },
    },
    checklistItems: [
      {
        id: "chin",
        label: `Chin Level & Crown Tall (Week ${safeWeek})`,
        desc: `Keep your chin level and look straight ahead — avoid poking your neck forward at screens.`,
      },
      {
        id: "shoulders",
        label: `Shoulders Dropped & Open (Week ${safeWeek})`,
        desc: `Roll your shoulders back and let them melt down away from your ears to open your chest for easy breathing.`,
      },
      {
        id: "pelvis",
        label: `Gentle Baby Hug (Week ${safeWeek})`,
        desc: `Point your tailbone gently toward the floor and hug baby with your lower tummy muscles — avoid deep back arching.`,
      },
      {
        id: "knees",
        label: `Soft Knees & Steady Feet (Week ${safeWeek})`,
        desc: `Keep a tiny, springy micro-bend in your knees with your weight shared equally on both feet.`,
      },
    ],
  };
}
