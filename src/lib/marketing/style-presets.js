// Curated style presets for AI image gen.
// Each preset = reference brand DNA + composition + typography + palette hints.
// Brand HEX from altro_brandbook.pdf:
//   Teal #3C6E71 (accent 25%), Navy #284B63 (5%), Charcoal #353535 (40%),
//   White #FFFFFF (20%), Light Gray #D9D9D9 (10%). Typeface: Helvetica / Helvetica Neue.

export const ALTRO_BRAND = {
  name: 'AltroAI',
  palette: {
    teal:       '#3C6E71',
    navy:       '#284B63',
    charcoal:   '#353535',
    white:      '#FFFFFF',
    light_gray: '#D9D9D9',
  },
  proportions: { charcoal: 40, teal: 25, white: 20, light_gray: 10, navy: 5 },
  typeface: 'Helvetica Neue',
  voice: 'Italian-rooted "altro" — alternative, modern, trustworthy, technical-credible. Premium B2B AI agency.',
  values: ['Innovation', 'Clarity', 'Trust'],
}

export const STYLE_PRESETS = {
  stripe_minimal: {
    label: 'Stripe — minimal + sharp gradients',
    summary: 'minimal layouts, technical illustration, single sharp gradient accent, isometric or vector mockups, generous negative space',
    typography: 'thin sans-serif, large display sizes, tight tracking, mostly small captions',
    composition: 'centered hero subject, very strong negative space, single focal element',
    palette_rule: 'mostly white background with one Teal gradient accent ramp',
  },
  linear_dark: {
    label: 'Linear — dark mode + sharp grid + subtle glow',
    summary: 'dark charcoal background, sharp wireframe grid lines, subtle radial glow behind subject, vector UI mockups',
    typography: 'tight sans-serif, white text, monospace captions for metadata',
    composition: 'asymmetric grid, hero element top-left or center, supporting detail strip',
    palette_rule: 'Charcoal #353535 bg, Teal glow accent, White type, no other colors',
  },
  vercel_geometric: {
    label: 'Vercel — geometric + monospace + hard shadows',
    summary: 'flat geometric shapes (triangles, circles, squares), monospace type, hard one-direction shadow offsets, no gradients',
    typography: 'monospace headlines, all-caps, tight tracking, weighty',
    composition: 'tight grid, geometric repetition with one rule-breaking element',
    palette_rule: 'black-on-white or white-on-black with one Teal accent shape',
  },
  notion_playful: {
    label: 'Notion — playful + illustrative + friendly',
    summary: 'hand-illustrated icons, friendly cartoon-style mascots or objects, soft rounded shapes, warm tones',
    typography: 'rounded sans-serif, generous line height, medium weight',
    composition: 'scattered playful arrangement, multiple small elements telling a micro-story',
    palette_rule: 'warm cream backgrounds with Teal, dusty Navy, soft Light Gray',
  },
  mercury_editorial: {
    label: 'Mercury — editorial + photographic + restrained',
    summary: 'editorial photography of objects (paper, metal, glass, textures), restrained composition, magazine-grade lighting',
    typography: 'serif headline or wide-tracked sans, refined, slow-read pacing',
    composition: 'rule of thirds, single hero object photographed beautifully, deep shadow',
    palette_rule: 'desaturated photographic palette, Teal as subtle prop or accent only',
  },
  ramp_brutalist: {
    label: 'Ramp — brutalist bold + big numbers',
    summary: 'oversized typography filling frame, brutalist block compositions, hard rules, big numbers as hero, no decoration',
    typography: 'extreme display weight, headline IS the visual, all-caps allowed',
    composition: 'fill the frame with type, single number or word dominates',
    palette_rule: 'high-contrast Charcoal/White with one Teal block',
  },
  anthropic_warm: {
    label: 'Anthropic — warm minimal + paper texture',
    summary: 'paper-texture warm background, hand-drawn touches, restrained illustrations, generous margins',
    typography: 'humanist serif or warm sans, calm pacing, smaller sizes than usual',
    composition: 'centered, breathing room, single illustration with margins',
    palette_rule: 'warm cream paper background, Charcoal type, occasional Teal accent',
  },
  openai_gradient: {
    label: 'OpenAI — gradient meshes + soft glow',
    summary: 'large gradient mesh background (NOT typical CSS gradients — organic blended color fields), soft volumetric glow, abstract shapes',
    typography: 'clean sans-serif overlay if any, large headlines, layered atop gradient',
    composition: 'gradient consumes most of frame, subject floats with glow',
    palette_rule: 'Teal + Navy gradient mesh, occasional Charcoal accent — but allow expressive mesh',
  },
  apple_hero: {
    label: 'Apple ads — product hero + dramatic light',
    summary: 'single product/object hero shot, dramatic studio lighting, deep shadows, premium polish',
    typography: 'thin sans-serif overlay, minimal text, type often appears later or smaller',
    composition: 'rule of thirds, hero centered or right, deep negative space',
    palette_rule: 'monochrome studio (Charcoal or White seamless), Teal hint only on product',
  },
}

export function listPresets() {
  return Object.entries(STYLE_PRESETS).map(([id, p]) => ({ id, label: p.label }))
}

export function getPreset(id) {
  return STYLE_PRESETS[id] || STYLE_PRESETS.stripe_minimal
}

// Channel-default style mapping per CMO direction:
//   LinkedIn: serious editorial (Stripe/Mercury)
//   Meta:     scroll-stopping bold (Ramp/Linear)
//   Email:    clean simple (Notion)
//   X:        Linear dark
//   YouTube:  Apple hero
export function defaultPresetForChannel(channel) {
  const map = {
    linkedin: 'mercury_editorial',
    meta:     'ramp_brutalist',
    email:    'notion_playful',
    x:        'linear_dark',
    youtube:  'apple_hero',
  }
  return map[channel] || 'stripe_minimal'
}

// Subject biases per CMO answer #4.
export const SUBJECT_TYPES = [
  'conceptual_illustration',
  'pure_typography',
  'abstract_data_viz',
  'product_ui_mockup',
  'editorial_photo',
]

export const COMPOSITION_RULES = [
  'rule of thirds',
  'strong negative space',
  'single focal subject',
  'asymmetric grid',
  'hero element + supporting detail',
]

export const HARD_AVOIDS = [
  'NO human faces',
  'NO hands',
  'NO logos baked into image',
  'NO CSS-style gradients (organic mesh allowed only in openai_gradient preset)',
  'NO drop shadows',
  'NO emoji',
  'NO watermarks',
  'NO stock-photo cliches (handshakes, lightbulbs, growth charts, suits in office)',
  'NO faces, no people',
]
