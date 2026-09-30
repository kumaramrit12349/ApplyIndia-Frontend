/** Groups a question list into contiguous same-section runs, in first-appearance order — drives a "jump to section" bar and a section-grouped question palette. */
export function groupBySection<T extends { section: string }>(items: T[]): { section: string; start: number; end: number }[] {
  const groups: { section: string; start: number; end: number }[] = [];
  items.forEach((item, i) => {
    const last = groups[groups.length - 1];
    if (last && last.section === item.section) last.end = i;
    else groups.push({ section: item.section, start: i, end: i });
  });
  return groups;
}
