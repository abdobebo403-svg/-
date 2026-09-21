/**
 * Tajweed Rules, Colors & AST Parser
 * Compliant with standard Dar Al-Ma'rifah (مصحف التجويد الملون) color conventions
 */

export interface TajweedRuleMeta {
  code: string;
  name: string;
  category: 'madd' | 'ghunnah' | 'qalqalah' | 'silent';
  categoryName: string;
  harakat?: string;
  colorClass: string;
  darkColorClass: string;
  hex: string;
  description: string;
  example: string;
}

export const TAJWEED_RULES: Record<string, TajweedRuleMeta> = {
  // --- أحكام المدود (Red spectrum) ---
  m: {
    code: 'm',
    name: 'مد لازم',
    category: 'madd',
    categoryName: 'أحكام المدود',
    harakat: '٦ حركات',
    colorClass: 'text-red-700',
    darkColorClass: 'dark:text-red-400',
    hex: '#b91c1c',
    description: 'يمد ست حركات وجوباً للاتصال بالسكون الأصلي أو الشدة',
    example: 'الۤمۤ • الحَاقَّةُ',
  },
  o: {
    code: 'o',
    name: 'مد واجب متصل / منفصل',
    category: 'madd',
    categoryName: 'أحكام المدود',
    harakat: '٤ - ٥ حركات',
    colorClass: 'text-orange-600',
    darkColorClass: 'dark:text-orange-400',
    hex: '#ea580c',
    description: 'يمد أربع أو خمس حركات إذا جاءت بعد حرف المد همزة',
    example: 'السَّمَاءِ • بِمَا أُنزِلَ',
  },
  p: {
    code: 'p',
    name: 'مد جائز عارض للسكون',
    category: 'madd',
    categoryName: 'أحكام المدود',
    harakat: '٢ أو ٤ أو ٦ حركات',
    colorClass: 'text-amber-600',
    darkColorClass: 'dark:text-amber-400',
    hex: '#d97706',
    description: 'يمد حركتين أو أربعاً أو ستاً عند الوقف على الحرف الأخير',
    example: 'الرَّحِيمِ • تَعْلَمُونَ',
  },
  n: {
    code: 'n',
    name: 'مد طبيعي',
    category: 'madd',
    categoryName: 'أحكام المدود',
    harakat: 'حركتان',
    colorClass: 'text-amber-800',
    darkColorClass: 'dark:text-amber-300',
    hex: '#92400e',
    description: 'المد الطبيعي وحروف الألف الخنجرية والصلة، مقداره حركتان',
    example: 'قَالَ • مَـٰلِكِ',
  },

  // --- أحكام الغنن والإخفاء والإدغام (Green spectrum) ---
  g: {
    code: 'g',
    name: 'غنة مشددة',
    category: 'ghunnah',
    categoryName: 'الغنن والإخفاء والإدغام',
    harakat: 'حركتان',
    colorClass: 'text-emerald-700 font-medium',
    darkColorClass: 'dark:text-emerald-400 font-medium',
    hex: '#047857',
    description: 'غنة ظاهرة في النون والميم المشددتين مقدارها حركتان',
    example: 'إِنَّ • عَمَّ',
  },
  f: {
    code: 'f',
    name: 'إخفاء حقيقي',
    category: 'ghunnah',
    categoryName: 'الغنن والإخفاء والإدغام',
    harakat: 'حركتان',
    colorClass: 'text-green-600',
    darkColorClass: 'dark:text-green-400',
    hex: '#16a34a',
    description: 'إخفاء النون الساكنة أو التنوين عند حروف الإخفاء الـ ١٥ بغنة حركتين',
    example: 'مِن قَبْلُ • أَنفُسَهُمْ',
  },
  c: {
    code: 'c',
    name: 'إخفاء شفوي',
    category: 'ghunnah',
    categoryName: 'الغنن والإخفاء والإدغام',
    harakat: 'حركتان',
    colorClass: 'text-emerald-600',
    darkColorClass: 'dark:text-emerald-300',
    hex: '#059669',
    description: 'إخفاء الميم الساكنة إذا جاء بعدها حرف الباء مع غنة',
    example: 'تَرْمِيهِم بِحِجَارَةٍ',
  },
  i: {
    code: 'i',
    name: 'إقلاب',
    category: 'ghunnah',
    categoryName: 'الغنن والإخفاء والإدغام',
    harakat: 'حركتان',
    colorClass: 'text-teal-600',
    darkColorClass: 'dark:text-teal-400',
    hex: '#0d9488',
    description: 'قلب النون الساكنة أو التنوين ميماً مخفاة بغنة عند ملاقاة الباء',
    example: 'مِنۢ بَعْدِ • عَلِيمٌۢ بِذَاتِ',
  },
  w: {
    code: 'w',
    name: 'إدغام بغنة',
    category: 'ghunnah',
    categoryName: 'الغنن والإخفاء والإدغام',
    harakat: 'حركتان',
    colorClass: 'text-emerald-700',
    darkColorClass: 'dark:text-emerald-400',
    hex: '#047857',
    description: 'إدغام النون الساكنة أو التنوين في أحرف (ي، ن، م، و) مع الغنة',
    example: 'مَن يَقُولُ • رَحِيمٌ وَدُودٌ',
  },
  a: {
    code: 'a',
    name: 'إدغام بغير غنة',
    category: 'ghunnah',
    categoryName: 'الغنن والإخفاء والإدغام',
    harakat: 'إدغام كامل',
    colorClass: 'text-slate-500',
    darkColorClass: 'dark:text-slate-400',
    hex: '#64748b',
    description: 'إدغام كامل للنون الساكنة والتنوين في اللام والراء دون غنة',
    example: 'مِن رَّبِّهِمْ • هُدًى لِّلْمُتَّقِينَ',
  },
  d: {
    code: 'd',
    name: 'إدغام متجانسين / متقاربين',
    category: 'ghunnah',
    categoryName: 'الغنن والإخفاء والإدغام',
    harakat: 'إدغام كامل',
    colorClass: 'text-slate-500',
    darkColorClass: 'dark:text-slate-400',
    hex: '#64748b',
    description: 'إدغام الحرف في مقاربه أو مجانسه اتحاداً في المخرج أو الصفة',
    example: 'قَد تَّبَيَّنَ • يَلهَث ذَّٰلِكَ',
  },
  u: {
    code: 'u',
    name: 'تنوين مدغم',
    category: 'ghunnah',
    categoryName: 'الغنن والإخفاء والإدغام',
    harakat: 'غير منطوق',
    colorClass: 'text-slate-400',
    darkColorClass: 'dark:text-slate-500',
    hex: '#94a3b8',
    description: 'حركة التنوين المدغم في الحرف التالي له',
    example: 'هُدًى لِّلْمُتَّقِينَ',
  },

  // --- أحكام القلقلة (Blue spectrum) ---
  q: {
    code: 'q',
    name: 'قلقلة',
    category: 'qalqalah',
    categoryName: 'أحكام القلقلة',
    harakat: 'اضطراب ونبرة',
    colorClass: 'text-sky-600 font-semibold',
    darkColorClass: 'dark:text-sky-400 font-semibold',
    hex: '#0284c7',
    description: 'اضطراب الصوت عند النطق بأحد حروف (ق، ط، ب، ج، د) عند سكونها',
    example: 'الفَلَقِ • أَحَدٌ • يَطْمَعُ',
  },

  // --- الحروف التي لا تلفظ (Gray / Slate spectrum) ---
  h: {
    code: 'h',
    name: 'همزة وصل',
    category: 'silent',
    categoryName: 'الحروف التي لا تلفظ',
    harakat: 'تسقط وصلاً',
    colorClass: 'text-stone-400 dark:text-stone-500',
    darkColorClass: 'dark:text-stone-500',
    hex: '#94a3b8',
    description: 'همزة وصل تثبت ابتداءً وتسقط عند وصل الكلام',
    example: 'ٱهْدِنَا • وَٱسْتَغْفِرْهُ',
  },
  l: {
    code: 'l',
    name: 'لام شمسية',
    category: 'silent',
    categoryName: 'الحروف التي لا تلفظ',
    harakat: 'مدغمة لا تلفظ',
    colorClass: 'text-stone-400 dark:text-stone-500',
    darkColorClass: 'dark:text-stone-500',
    hex: '#94a3b8',
    description: 'اللام الشمسية تدغم في الحرف الشمسي الذي يليها ولا ينطق بها',
    example: 'ٱلرَّحْمَٰنِ • ٱلشَّمْسِ',
  },
  s: {
    code: 's',
    name: 'حرف صامت / زائد',
    category: 'silent',
    categoryName: 'الحروف التي لا تلفظ',
    harakat: 'لا يلفظ',
    colorClass: 'text-stone-400 dark:text-stone-500',
    darkColorClass: 'dark:text-stone-500',
    hex: '#94a3b8',
    description: 'حرف رسم في المصحف ولا ينطق في التلاوة كألف التفريق والواو الزائدة',
    example: 'قَالُوٓاْ • أُوْلَـٰٓئِكَ',
  },
};

export type TajweedSegment =
  | string
  | {
      rule: string;
      meta?: TajweedRuleMeta;
      children: TajweedSegment[];
    };

/**
 * Parses the raw Quran Tajweed markup string into a nested AST of segments
 * Example: "بِسْمِ [h:1[ٱ]للَّهِ [h:2[ٱ][l[ل]رَّحْمَ[n[ـٰ]نِ"
 */
export function parseTajweed(raw: string): TajweedSegment[] {
  if (!raw) return [];
  if (!raw.includes('[')) return [raw];

  const root: { children: TajweedSegment[] } = { children: [] };
  const stack: { children: TajweedSegment[]; rule?: string }[] = [root];
  let i = 0;

  while (i < raw.length) {
    // Check for tag opening [tag:id[ or [tag[
    if (raw[i] === '[' && i + 1 < raw.length && raw[i + 1] !== '[') {
      const secondBracket = raw.indexOf('[', i + 1);
      // Ensure the tag opening is within reasonable distance (tag names are 1-5 chars + optional :id)
      if (secondBracket !== -1 && secondBracket - i <= 15) {
        const tagInfo = raw.slice(i + 1, secondBracket);
        const ruleKey = tagInfo.split(':')[0].toLowerCase();
        const node: { rule: string; meta?: TajweedRuleMeta; children: TajweedSegment[] } = {
          rule: ruleKey,
          meta: TAJWEED_RULES[ruleKey],
          children: [],
        };
        stack[stack.length - 1].children.push(node);
        stack.push(node);
        i = secondBracket + 1;
        continue;
      }
    }

    // Check for tag closing ]
    if (raw[i] === ']' && stack.length > 1) {
      stack.pop();
      i++;
      continue;
    }

    // Regular character accumulation
    const current = stack[stack.length - 1];
    const lastChild = current.children[current.children.length - 1];
    if (typeof lastChild === 'string') {
      current.children[current.children.length - 1] = lastChild + raw[i];
    } else {
      current.children.push(raw[i]);
    }
    i++;
  }

  return root.children;
}

/**
 * Strips all Tajweed markup tags to restore clean Quran text
 */
export function stripTajweedMarkup(raw: string): string {
  if (!raw) return '';
  if (!raw.includes('[')) return raw;

  // Replace [tag:id[content] with content iteratively to handle nesting
  let text = raw;
  let previous;
  do {
    previous = text;
    text = text.replace(/\[[a-zA-Z0-9:]+\[([^\[\]]*)\]/g, '$1');
  } while (text !== previous && text.includes('['));

  return text;
}
