export async function getSmartGrocerySuggestions({ pastPurchases }) {
  const suggestions = [];
  const purchases = new Set(pastPurchases.map((item) => item.toLowerCase()));
  if (purchases.has("rice") || purchases.has("flour")) suggestions.push("Cooking oil");
  if (purchases.has("milk")) suggestions.push("Breakfast cereal");
  if (purchases.has("vegetables")) suggestions.push("Fresh fruit");
  if (!suggestions.length) suggestions.push("Milk", "Rice", "Vegetables");
  return { suggestions };
}
