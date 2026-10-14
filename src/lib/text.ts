// 估算文字寬度（以 em 計）：中日韓全形字約 1em，英數約 0.6em
export function textEm(label: string) {
  let em = 0;
  for (const ch of label) em += /[⺀-￯]/.test(ch) ? 1 : 0.6;
  return em;
}

// 依可用寬度挑字級；最小字級仍放不下時截斷並加上「…」
export function fitText(label: string, maxWidth: number, maxSize: number, minSize: number) {
  const em = Math.max(textEm(label), 1);
  const fontSize = Math.max(minSize, Math.min(maxSize, maxWidth / em));
  if (em * fontSize <= maxWidth) return { text: label, fontSize };
  let out = label;
  while (out.length > 1 && (textEm(out) + 1) * fontSize > maxWidth) out = out.slice(0, -1);
  return { text: `${out}…`, fontSize };
}
