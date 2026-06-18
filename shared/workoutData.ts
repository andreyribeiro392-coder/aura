export type Exercise = {
  name: string;
  reps: string;
  rest: string;
  tip: string;
};

export type HomeWorkout = {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  muscleGroup: string;
  duration: string;
  difficulty: 1 | 2 | 3;
  emoji: string;
  description: string;
  benefits: string[];
  exercises: Exercise[];
  calories: number;
};

export type GymExercise = {
  id: string;
  name: string;
  category: string;
  emoji: string;
  sets: number;
  reps: string;
  rest: string;
  description: string;
  tips: string[];
  musclesWorked: string[];
};

export const HOME_WORKOUTS: HomeWorkout[] = [
  {
    id: "hw-1",
    name: "Morning Activation",
    level: "Beginner",
    muscleGroup: "Full Body",
    duration: "10 min",
    difficulty: 1,
    emoji: "🌅",
    calories: 80,
    description: "A gentle full-body warm-up to energize your morning and prepare your muscles for the day ahead.",
    benefits: ["Reduces stiffness", "Boosts energy", "Improves circulation"],
    exercises: [
      { name: "Jogging in Place", reps: "2 min", rest: "30s", tip: "Keep knees at hip height. Breathe rhythmically through your nose." },
      { name: "Dynamic Stretching", reps: "2 min", rest: "30s", tip: "Controlled movements. Never force beyond comfortable range." },
      { name: "Joint Mobility Circles", reps: "2 min", rest: "30s", tip: "Rotate shoulders, hips and ankles in wide, smooth circles." },
      { name: "Light Jumping Jacks", reps: "1 min", rest: "30s", tip: "Moderate pace, focus on arm and leg coordination." },
    ],
  },
  {
    id: "hw-2",
    name: "Push-Up Foundations",
    level: "Beginner",
    muscleGroup: "Chest",
    duration: "15 min",
    difficulty: 1,
    emoji: "💪",
    calories: 120,
    description: "Build chest, shoulder and tricep strength with accessible push-up variations. Perfect for beginners training at home.",
    benefits: ["Strengthens chest & triceps", "Improves posture", "No equipment needed"],
    exercises: [
      { name: "Wall Push-Up", reps: "3×10", rest: "60s", tip: "Hands at shoulder width. Keep your body straight as a plank." },
      { name: "Knee Push-Up", reps: "3×8", rest: "60s", tip: "Knees on floor. Lower chest until it nearly touches the ground." },
      { name: "Standard Push-Up", reps: "2×5", rest: "60s", tip: "Attempt the full version. Return to knees if needed." },
      { name: "Chest Stretch", reps: "2×30s", rest: "30s", tip: "Open arms wide in a T-shape and feel the stretch across your chest." },
    ],
  },
  {
    id: "hw-3",
    name: "Squat Fundamentals",
    level: "Beginner",
    muscleGroup: "Legs",
    duration: "12 min",
    difficulty: 1,
    emoji: "🦵",
    calories: 110,
    description: "Strengthen quads, glutes and hamstrings with the most fundamental lower-body movement. Technique is everything.",
    benefits: ["Strengthens legs & glutes", "Improves balance", "Burns significant calories"],
    exercises: [
      { name: "Assisted Squat", reps: "3×12", rest: "60s", tip: "Hold a chair for balance. Knees aligned with feet." },
      { name: "Bodyweight Squat", reps: "3×10", rest: "60s", tip: "Feet shoulder-width apart. Thighs parallel to floor at bottom." },
      { name: "Alternating Lunge", reps: "3×10", rest: "60s", tip: "Wide step forward. Rear knee nearly touches the floor." },
      { name: "Leg Stretch", reps: "2×30s", rest: "30s", tip: "Hold each position for 30 seconds without bouncing." },
    ],
  },
  {
    id: "hw-4",
    name: "Core Ignition",
    level: "Beginner",
    muscleGroup: "Core",
    duration: "10 min",
    difficulty: 1,
    emoji: "⚡",
    calories: 90,
    description: "Build a strong core with progressive abdominal exercises. A strong core improves posture and prevents back pain.",
    benefits: ["Strengthens core", "Improves posture", "Reduces back pain"],
    exercises: [
      { name: "Crunch", reps: "3×15", rest: "45s", tip: "Hands behind head, elbows open. Lift only shoulders off the floor." },
      { name: "Static Plank", reps: "3×20s", rest: "45s", tip: "Body straight as a board. Don't let hips rise or sag." },
      { name: "Leg Raise", reps: "3×10", rest: "45s", tip: "Lying flat, raise straight legs to 90°. Control the descent." },
      { name: "Abdominal Breathing", reps: "2×30s", rest: "30s", tip: "Inhale through nose inflating belly, exhale through mouth contracting abs." },
    ],
  },
  {
    id: "hw-5",
    name: "HIIT Blast",
    level: "Intermediate",
    muscleGroup: "Full Body",
    duration: "20 min",
    difficulty: 2,
    emoji: "🔥",
    calories: 280,
    description: "High-intensity interval training that maximizes fat burning and improves cardiovascular fitness in less time.",
    benefits: ["Accelerated fat burn", "Afterburn effect", "Improves VO2 max"],
    exercises: [
      { name: "Warm-Up", reps: "2 min", rest: "30s", tip: "Prepare the body. Moderate heart rate." },
      { name: "Burpee", reps: "8× (30s ON / 30s OFF)", rest: "2 min", tip: "Maximum intensity in the 30s active. Full recovery in the 30s rest." },
      { name: "Mountain Climber", reps: "4×30s", rest: "30s", tip: "Alternate knees toward chest. Keep hips stable." },
      { name: "Jump Squat", reps: "4×10", rest: "60s", tip: "Squat deep, jump explosively, land softly with semi-bent knees." },
      { name: "Cool Down", reps: "2 min", rest: "30s", tip: "Slow walk. Breathe deeply." },
    ],
  },
  {
    id: "hw-6",
    name: "Power Push",
    level: "Intermediate",
    muscleGroup: "Chest",
    duration: "18 min",
    difficulty: 2,
    emoji: "💥",
    calories: 200,
    description: "Elevate your chest training with challenging push-up variations. Develop strength, mass and definition.",
    benefits: ["Increases muscle mass", "Develops upper body strength", "Improves definition"],
    exercises: [
      { name: "Standard Push-Up", reps: "4×12", rest: "60s", tip: "Lower in 3 seconds, explosive push up. Chest nearly touches floor." },
      { name: "Diamond Push-Up", reps: "3×10", rest: "60s", tip: "Hands form a diamond shape. Full focus on triceps and inner chest." },
      { name: "Pause Push-Up", reps: "3×8", rest: "60s", tip: "Pause 2 seconds at the bottom. Maximum muscle tension." },
      { name: "Elevated Push-Up", reps: "3×10", rest: "60s", tip: "Feet on a chair. Works upper chest." },
      { name: "Stretch", reps: "2×30s", rest: "30s", tip: "Open arms wide and feel the deep chest stretch." },
    ],
  },
  {
    id: "hw-7",
    name: "Pistol Squat Challenge",
    level: "Advanced",
    muscleGroup: "Legs",
    duration: "22 min",
    difficulty: 3,
    emoji: "🎯",
    calories: 260,
    description: "The most demanding unilateral squat. Develops extreme strength, balance and mobility in each leg independently.",
    benefits: ["Maximum unilateral strength", "Advanced balance", "Hip mobility"],
    exercises: [
      { name: "Assisted Pistol Squat", reps: "4×6 each", rest: "90s", tip: "Hold a surface for balance. Lower controlled on one leg." },
      { name: "Free Pistol Squat", reps: "3×4 each", rest: "120s", tip: "Arms forward for balance. Descend as far as possible." },
      { name: "Deep Squat with Pause", reps: "4×12", rest: "90s", tip: "Pause 3 seconds at the bottom. Maximum activation." },
      { name: "Jump Squat", reps: "3×12", rest: "90s", tip: "Maximum explosion on jump. Soft and controlled landing." },
      { name: "Stretch", reps: "2×30s", rest: "30s", tip: "Focus on quads and hamstrings after intense effort." },
    ],
  },
  {
    id: "hw-8",
    name: "Elite Full Body",
    level: "Advanced",
    muscleGroup: "Full Body",
    duration: "30 min",
    difficulty: 3,
    emoji: "🏆",
    calories: 380,
    description: "High-intensity full-body training for advanced athletes. Combines strength, power and endurance in one devastating session.",
    benefits: ["Maximum strength", "Explosive power", "Muscular endurance"],
    exercises: [
      { name: "Warm-Up", reps: "3 min", rest: "30s", tip: "Full mobility. Activate each muscle group." },
      { name: "One-Arm Push-Up", reps: "3×6 each", rest: "90s", tip: "Wide feet for balance. Slow descent, explosive push." },
      { name: "Pistol Squat", reps: "3×6 each", rest: "90s", tip: "Full control. No momentum." },
      { name: "Leg Raise Crunch", reps: "3×20", rest: "90s", tip: "Straight legs. Raise to 90° and lower controlled." },
      { name: "Explosive Burpee", reps: "3×12", rest: "90s", tip: "Maximum jump. Palms above head at the top." },
      { name: "Cool Down", reps: "2 min", rest: "30s", tip: "Full recovery. Each muscle for 30s." },
    ],
  },
];

export const GYM_EXERCISES: GymExercise[] = [
  {
    id: "gym-1",
    name: "Barbell Bench Press",
    category: "Chest",
    emoji: "🏋️",
    sets: 4,
    reps: "8–10",
    rest: "90s",
    description: "The fundamental chest builder. Lie on bench, lower bar to chest with control, press explosively. Keep feet flat, slight arch in lower back.",
    tips: ["Keep elbows at 45–75° from torso", "Full range of motion", "Control the descent — 2–3 seconds down"],
    musclesWorked: ["Pectoralis Major", "Anterior Deltoid", "Triceps"],
  },
  {
    id: "gym-2",
    name: "Incline Dumbbell Press",
    category: "Chest",
    emoji: "💪",
    sets: 3,
    reps: "10–12",
    rest: "90s",
    description: "Targets the upper and clavicular chest. Bench at 30–45°. Dumbbells descend to upper chest level.",
    tips: ["Neutral grip at top", "Don't flare elbows excessively", "Squeeze chest at the top"],
    musclesWorked: ["Upper Pectoralis", "Anterior Deltoid", "Triceps"],
  },
  {
    id: "gym-3",
    name: "Cable Fly",
    category: "Chest",
    emoji: "🔄",
    sets: 3,
    reps: "12–15",
    rest: "60s",
    description: "Chest isolation with cables. Arms slightly bent, open in a wide arc until you feel the stretch, close while squeezing the chest.",
    tips: ["Slight bend in elbows throughout", "Think of hugging a barrel", "Constant cable tension"],
    musclesWorked: ["Pectoralis Major", "Anterior Deltoid"],
  },
  {
    id: "gym-4",
    name: "Barbell Back Squat",
    category: "Legs",
    emoji: "🦵",
    sets: 4,
    reps: "6–8",
    rest: "120s",
    description: "King of all exercises. Bar on upper traps, squat until thighs are parallel or below. Knees track over toes.",
    tips: ["Brace core before descent", "Drive knees out", "Keep chest up throughout"],
    musclesWorked: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
  },
  {
    id: "gym-5",
    name: "Romanian Deadlift",
    category: "Legs",
    emoji: "🏋️",
    sets: 3,
    reps: "10–12",
    rest: "90s",
    description: "Excellent hamstring and glute developer. Hinge at hips, bar close to legs, feel the hamstring stretch at the bottom.",
    tips: ["Soft bend in knees", "Bar stays close to body", "Feel the stretch, not the pain"],
    musclesWorked: ["Hamstrings", "Glutes", "Erector Spinae"],
  },
  {
    id: "gym-6",
    name: "Leg Press",
    category: "Legs",
    emoji: "⬆️",
    sets: 4,
    reps: "12–15",
    rest: "90s",
    description: "Machine-based quad and glute builder. Feet shoulder-width on platform. Lower until knees reach 90°.",
    tips: ["Don't lock knees at top", "Foot position changes muscle emphasis", "Control the negative"],
    musclesWorked: ["Quadriceps", "Glutes", "Hamstrings"],
  },
  {
    id: "gym-7",
    name: "Pull-Up",
    category: "Back",
    emoji: "🔝",
    sets: 4,
    reps: "6–10",
    rest: "90s",
    description: "Ultimate back width builder. Overhand grip, pull chest to bar, lower with full control.",
    tips: ["Depress and retract scapula before pulling", "Avoid kipping", "Full hang at the bottom"],
    musclesWorked: ["Latissimus Dorsi", "Biceps", "Rear Deltoid"],
  },
  {
    id: "gym-8",
    name: "Barbell Row",
    category: "Back",
    emoji: "🔙",
    sets: 4,
    reps: "8–10",
    rest: "90s",
    description: "Builds back thickness. Hinge forward 45°, pull bar to lower chest, squeeze shoulder blades together.",
    tips: ["Keep back flat", "Pull elbows back, not up", "Controlled descent"],
    musclesWorked: ["Rhomboids", "Latissimus Dorsi", "Biceps", "Rear Deltoid"],
  },
  {
    id: "gym-9",
    name: "Overhead Press",
    category: "Shoulders",
    emoji: "🙌",
    sets: 4,
    reps: "8–10",
    rest: "90s",
    description: "The primary shoulder mass builder. Press bar from clavicle level overhead. Lock out at top.",
    tips: ["Brace core tightly", "Bar path slightly back at top", "Don't hyperextend lower back"],
    musclesWorked: ["Anterior Deltoid", "Medial Deltoid", "Triceps"],
  },
  {
    id: "gym-10",
    name: "Lateral Raise",
    category: "Shoulders",
    emoji: "↔️",
    sets: 3,
    reps: "12–15",
    rest: "60s",
    description: "Isolates the medial deltoid for shoulder width. Raise dumbbells to shoulder height, slight forward lean.",
    tips: ["Lead with elbows, not wrists", "Slight internal rotation at top", "Control the descent"],
    musclesWorked: ["Medial Deltoid", "Supraspinatus"],
  },
  {
    id: "gym-11",
    name: "Barbell Curl",
    category: "Arms",
    emoji: "💪",
    sets: 3,
    reps: "10–12",
    rest: "60s",
    description: "Classic bicep builder. Elbows fixed at sides, curl bar to shoulder height, squeeze at top.",
    tips: ["No swinging", "Full range of motion", "Supinate wrist at top"],
    musclesWorked: ["Biceps Brachii", "Brachialis"],
  },
  {
    id: "gym-12",
    name: "Tricep Pushdown",
    category: "Arms",
    emoji: "⬇️",
    sets: 3,
    reps: "12–15",
    rest: "60s",
    description: "Cable tricep isolation. Elbows at sides, push rope or bar down until arms fully extended.",
    tips: ["Keep elbows pinned to sides", "Full extension at bottom", "Control the return"],
    musclesWorked: ["Triceps Brachii"],
  },
  {
    id: "gym-13",
    name: "Plank",
    category: "Core",
    emoji: "📐",
    sets: 3,
    reps: "45–60s",
    rest: "60s",
    description: "The gold standard core stability exercise. Forearms on floor, body straight as a board from head to heels.",
    tips: ["Squeeze glutes and abs simultaneously", "Don't hold breath", "Neutral spine throughout"],
    musclesWorked: ["Transverse Abdominis", "Rectus Abdominis", "Obliques"],
  },
  {
    id: "gym-14",
    name: "Cable Crunch",
    category: "Core",
    emoji: "🔄",
    sets: 3,
    reps: "15–20",
    rest: "60s",
    description: "Weighted ab exercise with constant cable tension. Kneel, pull rope to floor while crunching abs.",
    tips: ["Round the spine — don't just hip flex", "Keep hips stationary", "Exhale forcefully at contraction"],
    musclesWorked: ["Rectus Abdominis", "Obliques"],
  },
];

export const MUSCLE_GROUPS = [
  "All",
  "Full Body",
  "Chest",
  "Legs",
  "Core",
  "Back",
  "Shoulders",
  "Arms",
  "Cardio",
];

export const FITNESS_LEVELS = ["All", "Beginner", "Intermediate", "Advanced"] as const;

export const GYM_CATEGORIES = [
  "All",
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
];
