/* Daxsara — events data.
   Edit this file to add, change, or remove events. Dates use YYYY-MM-DD.
   `endDate` is optional — omit it for single-day events.
   After editing, run `node generate-events.js` to rebuild the /events/ pages. */

var DAXSARA_EVENTS = [
  {
    slug: "chamber-of-imaginary-jobs",
    name: "Chamber of Imaginary Jobs",
    date: "2026-10-09",
    location: "Tehran — Hedish",
    category: "Installation",
    short: "A bazaar of professions that don't exist yet.",
    full:
      "A walk-through installation staged like a bazaar, where each stall belongs to a profession that does not yet exist — the Attention Cartographer, the Silence Broker, the Memory Restorer. Visitors apply, interview, and leave with a title for a job the future may or may not need. Built to ask a simple question inside a shopping mall: if work is changing shape, what shape is it taking?",
    image: "https://images.unsplash.com/photo-1555529771-122e5d9f2341?q=80&w=1600&auto=format&fit=crop",
    participants: ["Daxsara Studio", "Hedish Cultural Programming"],
    action: { label: "Reserve a place", href: "mailto:hello@daxsara.com?subject=Chamber%20of%20Imaginary%20Jobs" }
  },
  {
    slug: "spain-x-iran",
    name: "Spain × Iran",
    date: "2026-10-24",
    location: "Isfahan",
    category: "Cross-cultural",
    short: "Two geometries of tile, light, and courtyard held side by side.",
    full:
      "An evening exchange between Andalusian and Persian craft traditions — tilework, courtyard architecture, and the mathematics both cultures used to make the infinite feel local. Artisans from Granada and Isfahan work in the same room for one night, and the public is invited to watch two geometric languages recognize each other.",
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1600&auto=format&fit=crop",
    participants: ["Taller de Cerámica Granada", "Isfahan Tile Guild"],
    action: { label: "Join the evening", href: "mailto:hello@daxsara.com?subject=Spain%20x%20Iran" }
  },
  {
    slug: "the-attention-economy-a-wake",
    name: "The Attention Economy: A Wake",
    date: "2026-11-14",
    location: "Tehran",
    category: "Conversation",
    short: "A funeral, held in earnest, for the way we used to pay attention.",
    full:
      "Part eulogy, part working session. We gather to mourn a form of attention that platforms have made structurally impossible, then spend the second half of the evening asking what replaces it — not with panels, but with an open floor and a designer, a monk, and a machine-learning researcher seated at its center.",
    image: "https://images.unsplash.com/photo-1478147427282-58a87a120781?q=80&w=1600&auto=format&fit=crop",
    participants: ["Daxsara Studio"],
    action: { label: "Reserve a seat", href: "mailto:hello@daxsara.com?subject=Attention%20Economy%20Wake" }
  },
  {
    slug: "labs-cohort-two-opening",
    name: "Labs — Cohort Two, Opening Night",
    date: "2026-12-02",
    location: "Tehran — Hedish",
    category: "Academy",
    short: "The second cohort of the Daxsara Academy begins.",
    full:
      "Twenty-four teenagers begin a three-month studio inside Hedish, working toward a public manifestation of their own devising. Opening night is public: come meet the cohort, see the space they'll be working in, and hear what the first cohort actually built.",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1600&auto=format&fit=crop",
    participants: ["Daxsara Academy", "Cohort Two"],
    action: { label: "Attend opening night", href: "mailto:hello@daxsara.com?subject=Labs%20Cohort%20Two" }
  },
  {
    slug: "on-planetary-time",
    name: "On Planetary Time",
    date: "2027-01-18",
    location: "Shiraz",
    category: "Gathering",
    short: "A night walk through orchards, timed to the winter sky.",
    full:
      "A slow, guided night walk through the orchards outside Shiraz, structured around the movement of visible planets rather than a schedule. Astronomers and poets alternate speaking. No stage — the group simply keeps walking.",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600&auto=format&fit=crop",
    participants: ["Daxsara Studio", "Shiraz Astronomy Circle"],
    action: { label: "Request an invitation", href: "mailto:hello@daxsara.com?subject=On%20Planetary%20Time" }
  },
  {
    slug: "the-founders-table",
    name: "The Founder's Table",
    date: "2026-06-11",
    location: "Tehran",
    category: "Conversation",
    short: "A closed dinner for twelve people rebuilding something from nothing.",
    full:
      "Twelve founders, operators, and builders sat down for a single unrecorded dinner to talk about the parts of starting something that don't make it into interviews. The first in what is becoming a recurring, deliberately small format.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1600&auto=format&fit=crop",
    participants: ["Daxsara Studio"],
    action: { label: "Read the notes", href: "thoughts.html" }
  },
  {
    slug: "labs-cohort-one-manifestation",
    name: "Labs — Cohort One, Manifestation Day",
    date: "2026-04-22",
    location: "Tehran — Hedish",
    category: "Academy",
    short: "The first cohort presented what three months had built in them.",
    full:
      "After three months inside Hedish, the first cohort of the Daxsara Academy opened its doors to the public for a single day — eighteen teenagers presenting work that had nothing to do with grades and everything to do with a question they'd chosen themselves in week one.",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1600&auto=format&fit=crop",
    participants: ["Daxsara Academy", "Cohort One"],
    action: { label: "See what they built", href: "academy.html" }
  }
];

if (typeof module !== "undefined" && module.exports) { module.exports = DAXSARA_EVENTS; }
if (typeof window !== "undefined") { window.DAXSARA_EVENTS = DAXSARA_EVENTS; }
