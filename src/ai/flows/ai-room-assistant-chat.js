export async function aiRoomAssistantChat({ message }) {
  const normalizedMessage = message.toLowerCase();
  if (normalizedMessage.includes("budget") || normalizedMessage.includes("expense")) {
    return { response: "Review this month's expenses, group shared bills, and agree on a split with your flatmates." };
  }
  if (normalizedMessage.includes("grocery") || normalizedMessage.includes("buy")) {
    return { response: "Add essentials to the shared grocery list and mark items purchased as you shop." };
  }
  return { response: "Try asking me about expenses, groceries, chores, or planning your next flatmate activity." };
}
