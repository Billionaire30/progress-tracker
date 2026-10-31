const weeklyRoutine = [
  { day: 0, focus: "Engineering theory (1–2 hrs)" },
  { day: 1, focus: "Software — AutoCAD / Civil 3D / structural (1–2 hrs)" },
  { day: 2, focus: "Engineering calculations and design (1–2 hrs)" },
  { day: 3, focus: "Construction methods and site knowledge (1–2 hrs)" },
  { day: 4, focus: "Excel / project management / BOQ / technical writing (1 hr)" },
  { day: 5, focus: "Main practical project (3–5 hrs)" },
  { day: 6, focus: "Review, reflection, planning (1 hr)" },
];

export function getTodayFocus(): string {
  const today = new Date().getDay();
  const routine = weeklyRoutine.find((r) => r.day === today);
  return routine?.focus || "Review your weekly plan";
}
