export async function getSelfCareAdvice({ mood, sleepHours, productivityLevel }) {
  if (sleepHours < 6) {
    return { selfCareAdvice: "Prioritize rest tonight, drink water, and keep today's workload manageable." };
  }
  if (mood.toLowerCase() === "stressed" || productivityLevel.toLowerCase() === "low") {
    return { selfCareAdvice: "Take a short screen-free break, choose one small next step, and check in with a flatmate." };
  }
  return { selfCareAdvice: "Keep your momentum with a balanced meal, a little movement, and time to unwind." };
}
