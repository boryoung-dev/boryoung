// 한글 → 로마자 변환 (초성+중성+종성 분해)
const INITIALS = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
const MEDIALS = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
const FINALS = ['','k','kk','ks','n','nj','nh','d','l','lk','lm','lb','ls','lt','lp','lh','m','b','bs','s','ss','ng','j','ch','k','t','p','h'];

/** 한글 텍스트를 로마자로 변환 */
export function koreanToRoman(text: string): string {
  let result = '';
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const offset = code - 0xAC00;
      const initial = Math.floor(offset / (21 * 28));
      const medial = Math.floor((offset % (21 * 28)) / 28);
      const final = offset % 28;
      result += INITIALS[initial] + MEDIALS[medial] + FINALS[final];
    } else {
      result += char;
    }
  }
  return result;
}

/** 텍스트를 URL-safe slug로 변환 (한글 자동 로마자 변환) */
export function slugify(text: string): string {
  return koreanToRoman(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

/** slug + 랜덤 suffix (블로그 등 자동 생성용) */
export function slugifyWithSuffix(text: string): string {
  const suffix = Math.random().toString(36).substring(2, 8);
  const base = slugify(text);
  return base ? `${base}-${suffix}` : suffix;
}
