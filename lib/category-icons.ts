/**
 * Heuristische mapping van categorie-namen naar Material Symbols Outlined
 * icoon-namen. Bedoeld als "best guess" — orgs kunnen elke categorie-naam
 * kiezen dus we matchen op trefwoorden. Valt terug op `eco`.
 */
export function iconForCategory(categoryName: string | null | undefined): string {
  const n = (categoryName ?? "").toLowerCase();
  if (!n) return "eco";
  if (/(groen|natuur|biodiv|plant|boom|tuin|ecol)/.test(n)) return "eco";
  if (/(mobil|vervoer|transport|fiets|auto|reis)/.test(n)) return "directions_bike";
  if (/(voed|eten|maaltijd|food|plantaard|veggie|veget)/.test(n)) return "restaurant";
  if (/(energ|stroom|elektr|warmte|zonne|solar)/.test(n)) return "bolt";
  if (/(afval|recycl|zwerf|hergebruik)/.test(n)) return "recycling";
  if (/(sociaal|contact|community|buur|vrijwilli)/.test(n)) return "volunteer_activism";
  if (/(schoon|clean|opruim|schoonmaak)/.test(n)) return "cleaning_services";
  if (/(inkoop|winkel|shop|tweedehands)/.test(n)) return "shopping_cart";
  if (/(water|douche|kraan|regen)/.test(n)) return "water_drop";
  if (/(leer|onderwijs|workshop|kennis|les)/.test(n)) return "school";
  if (/(gezond|sport|beweging|wandel)/.test(n)) return "favorite";
  if (/(kleding|mode|textiel)/.test(n)) return "checkroom";
  if (/(huis|woning|isolat)/.test(n)) return "home";
  return "eco";
}
