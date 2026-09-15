#!/usr/bin/env node
/**
 * Daxsara — static site builder.
 *
 * This script is a convenience, not a requirement: it assembles the shared
 * nav/footer/head into every page and pre-renders one static HTML file per
 * event from data/events.js. The output is plain HTML/CSS/JS with no
 * server, no framework, and no runtime build step — deploy the repository
 * root as-is to GitHub Pages, Cloudflare Pages, or any static host.
 *
 * Run:  node build.js
 * Re-run any time data/events.js, data/projects.js, or data/thoughts.js changes.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const EVENTS = require("./data/events.js");
const PROJECTS = require("./data/projects.js");
const THOUGHTS = require("./data/thoughts.js");

const SITE_URL = "https://daxsara.com"; // update if the production domain differs

/* ---------------------------------------------------------------------- */
/* Helpers                                                                  */
/* ---------------------------------------------------------------------- */

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function status(ev) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(ev.date + "T00:00:00");
  const end = new Date((ev.endDate || ev.date) + "T00:00:00");
  if (end < today) return "past";
  if (start <= today && today <= end) return "ongoing";
  return "upcoming";
}

const STAR_INLINE = `<svg viewBox="0 0 100 100" class="star-mark" width="20" height="20" aria-hidden="true">
  <path fill-rule="evenodd" d="M50,8 L50,92 M8,50 L92,50" style="display:none"/>
  <path fill-rule="evenodd" d="M50 8 L92 50 L50 92 L8 50 Z M20.7 20.7 L79.3 20.7 L79.3 79.3 L20.7 79.3 Z"/>
</svg>`;

/* Primary nav: kept short on purpose. Secondary items live in the full-screen menu. */
const PRIMARY_NAV = [
  ["events.html", "Events"],
  ["academy.html", "Academy"],
  ["services.html", "Services"],
  ["daxsara-club.html", "Club"],
  ["about.html", "About"]
];

const SECONDARY_NAV = [
  ["index.html", "Home"],
  ["events.html", "Events"],
  ["academy.html", "Academy"],
  ["services.html", "Services"],
  ["yoga-of-adhd.html", "Yoga of ADHD"],
  ["merch.html", "Merch"],
  ["daxsara-club.html", "Daxsara Club"],
  ["partner-program.html", "Partner Program"],
  ["artificial-intelligence.html", "Artificial Intelligence"],
  ["thoughts.html", "Journal"],
  ["about.html", "About"],
  ["contact.html", "Contact"]
];

function nav(active, opts) {
  opts = opts || {};
  const onDark = opts.dark ? " data-on-dark" : "";
  const links = PRIMARY_NAV.map(
    ([href, label]) => `<li><a href="${href}"${active === href ? ' aria-current="page"' : ""}>${label}</a></li>`
  ).join("\n        ");
  const secondary = SECONDARY_NAV.map(
    ([href, label]) => `<li><a href="${href}">${label}</a></li>`
  ).join("\n        ");
  return `<a class="skip-link" href="#main">Skip to content</a>
  <nav class="nav"${onDark}>
    <a class="nav-mark" href="index.html">
      <span data-star data-star-size="20"></span>
      Daxsara
    </a>
    <ul class="nav-links">
      ${links}
    </ul>
    <button class="nav-toggle" aria-label="Open menu" aria-expanded="false">
      <span></span>
    </button>
  </nav>
  <div class="mobile-menu" id="mobile-menu">
    <ul>
      ${secondary}
    </ul>
  </div>`;
}

function footer() {
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
    <div class="wrap">
      <div class="footer-top">
        <div class="footer-col">
          <h3>Daxsara</h3>
          <p class="body small" style="opacity:.85;max-width:32ch;">We bring thought into the world.<br>ما اندیشه را به جهان می‌آوریم</p>
        </div>
        <div class="footer-col">
          <h3>Explore</h3>
          <ul>
            <li><a href="events.html">Events</a></li>
            <li><a href="academy.html">Academy</a></li>
            <li><a href="services.html">Services</a></li>
            <li><a href="thoughts.html">Journal</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h3>Products</h3>
          <ul>
            <li><a href="yoga-of-adhd.html">Yoga of ADHD</a></li>
            <li><a href="daxsara-club.html">Daxsara Club</a></li>
            <li><a href="partner-program.html">Partner Program</a></li>
            <li><a href="merch.html">Merch</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h3>Connect</h3>
          <ul>
            <li><a href="contact.html">Contact</a></li>
            <li><a href="mailto:hello@daxsara.com">hello@daxsara.com</a></li>
            <li><a href="https://instagram.com/daxsara" target="_blank" rel="noreferrer">Instagram</a></li>
          </ul>
        </div>
      </div>
      <div class="rule rule--dark"></div>
      <div class="footer-bottom">
        <span>© ${year} Daxsara.</span>
        <span>Tehran</span>
      </div>
    </div>
  </footer>`;
}

function layout({ title, description, active, dark, ogImage, bodyClass, body, extraHead }) {
  const canonical = `${SITE_URL}/${active === "index.html" ? "" : active}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — Daxsara</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Daxsara">
<meta property="og:title" content="${esc(title)} — Daxsara">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage || SITE_URL + "/assets/img/og-default.jpg"}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
${extraHead || ""}
</head>
<body class="${bodyClass || ""}">
${nav(active, { dark })}
<main id="main">
${body}
</main>
${footer()}
<script src="data/events.js"></script>
<script src="data/projects.js"></script>
<script src="data/thoughts.js"></script>
<script src="assets/js/main.js"></script>
</body>
</html>`;
}

/* ---------------------------------------------------------------------- */
/* Geometric shapes used in the hero (outlines only — sacred-geometry set) */
/* ---------------------------------------------------------------------- */
const HERO_GEO = `<svg class="hero-geo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <g data-geo style="transform-origin:800px 300px;">
    <circle cx="800" cy="300" r="90"/>
    <circle cx="800" cy="300" r="90" transform="rotate(60 800 300)"/>
    <circle cx="800" cy="300" r="90" transform="rotate(120 800 300)"/>
    <circle cx="710" cy="255" r="90"/>
    <circle cx="890" cy="255" r="90"/>
    <circle cx="710" cy="345" r="90"/>
    <circle cx="890" cy="345" r="90"/>
  </g>
  <g data-geo style="transform-origin:1220px 520px;">
    <path d="M1220 440 L1258 500 L1258 570 L1220 630 L1182 570 L1182 500 Z"/>
    <path d="M1220 440 L1220 630 M1182 500 L1258 570 M1258 500 L1182 570"/>
    <circle cx="1220" cy="535" r="95"/>
  </g>
  <g data-geo style="transform-origin:380px 620px;">
    <circle cx="380" cy="620" r="70"/>
    <path d="M380 550 A70 70 0 0 1 380 690 A70 70 0 0 1 380 550" transform="rotate(0 380 620)"/>
    <path d="M310 620 L450 620 M380 550 L380 690 M333 573 L427 667 M427 573 L333 667"/>
  </g>
  <g data-geo style="transform-origin:1080px 190px;">
    <path d="M1080 130 L1140 190 L1080 250 L1020 190 Z"/>
    <path d="M1080 150 L1120 190 L1080 230 L1040 190 Z" transform="rotate(45 1080 190)"/>
  </g>
</svg>`;

/* ---------------------------------------------------------------------- */
/* Pages                                                                    */
/* ---------------------------------------------------------------------- */

function homePage() {
  const body = `
<section class="hero" aria-label="Opening">
  <div class="hero-stage">
    <div class="hero-frame">
      <picture>
        <source media="(max-width: 720px)" srcset="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1400&auto=format&fit=crop">
        <img class="hero-image" src="https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2400&auto=format&fit=crop" alt="A gathering of people mid-experience at a Daxsara event, caught in a moment of collective attention.">
      </picture>
      ${HERO_GEO}
    </div>
    <div class="hero-lines">
      <p class="hero-line">The world is changing.</p>
      <p class="hero-line">So is the way we live inside it.</p>
      <p class="hero-line">New realities need new ways of seeing.</p>
      <p class="hero-line">Daxsara brings thought into the world.</p>
    </div>
    <div class="hero-scroll-cue"><span>Scroll</span><span class="stem"></span></div>
  </div>
</section>

<section class="intro" data-reveal>
  <div class="wrap intro-grid">
    <div class="intro-kicker mark">01 — Who we are</div>
    <div class="intro-body">
      <p class="display-2">Daxsara designs experiences that let people encounter change, instead of just hearing about it.</p>
      <p class="body-lg measure" style="margin-top:28px;opacity:.8;">Cultural events, a studio for teenagers, and transformation work with companies and governments — built from one way of thinking, applied wherever thought needs a body.</p>
    </div>
  </div>
</section>

<section class="section section--paper">
  <div class="wrap">
    <div class="eyebrow-num"><span class="num">02</span><span class="label">Upcoming</span><span class="line"></span></div>
    <div class="timeline" data-timeline="upcoming"></div>
    <div style="margin-top:36px;">
      <a class="link-arrow text-link" href="events.html">View all events
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow-num"><span class="num">03</span><span class="label">What else we bring</span><span class="line"></span></div>
  </div>
  <div class="card-grid" data-reveal>
    <a class="card" href="yoga-of-adhd.html" style="background:var(--navy);">
      <span class="card-bg" style="background-image:url('https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop');"></span>
      <span class="card-content">
        <span class="card-eyebrow">Practice</span>
        <span class="card-title">Yoga of ADHD</span>
        <span class="card-desc">A movement practice built around how a scattering mind actually works.</span>
      </span>
    </a>
    <a class="card" href="merch.html" style="background:var(--navy);">
      <span class="card-bg" style="background-image:url('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop');"></span>
      <span class="card-content">
        <span class="card-eyebrow">Objects</span>
        <span class="card-title">Merchandise</span>
        <span class="card-desc">Small, durable objects carrying the geometry of the studio.</span>
      </span>
    </a>
    <a class="card" href="daxsara-club.html" style="background:var(--navy);">
      <span class="card-bg" style="background-image:url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1200&auto=format&fit=crop');"></span>
      <span class="card-content">
        <span class="card-eyebrow">Space</span>
        <span class="card-title">Daxsara Club</span>
        <span class="card-desc">A physical hub in Tehran for people building things worth building.</span>
      </span>
    </a>
    <a class="card" href="partner-program.html" style="background:var(--navy);">
      <span class="card-bg" style="background-image:url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop');"></span>
      <span class="card-content">
        <span class="card-eyebrow">Collaboration</span>
        <span class="card-title">Partner Program</span>
        <span class="card-desc">For organizations building alongside Daxsara over time, not just for one event.</span>
      </span>
    </a>
  </div>
</section>

<section class="section section--dark">
  <div class="wrap two-col">
    <div data-reveal>
      <div class="mark" style="color:var(--white);opacity:.6;">04 — What we're doing now</div>
      <p class="title-1" style="margin-top:18px;">The Academy's second cohort begins inside Hedish this December — twenty-four teenagers, three months, one public manifestation.</p>
    </div>
    <div data-reveal>
      <p class="body-lg" style="opacity:.85;">Companies and governments come to us when the way they used to think stops fitting the world they're now operating in. We don't arrive with a framework built for someone else's problem.</p>
      <a class="link-arrow text-link" style="margin-top:24px;display:inline-flex;" href="services.html">See how we work with organizations
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
    </div>
  </div>
</section>
`;
  return layout({
    title: "Daxsara",
    description: "Daxsara designs experiences, programs, and services that make new ways of seeing and thinking tangible.",
    active: "index.html",
    dark: true,
    body
  });
}

function pageHead(mark, title, lede) {
  return `<section class="page-head wrap">
  <span class="mark">${mark}</span>
  <h1 class="display-2 measure">${title}</h1>
  ${lede ? `<p class="body-lg measure" style="margin-top:22px;opacity:.8;">${lede}</p>` : ""}
</section>`;
}

function aboutPage() {
  const body = `
${pageHead("About", "We start from a claim, not a service list.", "Daxsara exists because the way most institutions help people think about change has stopped working — and someone has to build the alternative, not just describe it.")}

<section class="section wrap">
  <div class="two-col">
    <div data-reveal>
      <h2 class="title-1">Why Daxsara exists</h2>
      <p class="body-lg measure" style="margin-top:20px;">Technology, work, AI, and culture are moving faster than the institutions built to help people make sense of them. Universities were built for a slower century. Consulting firms sell frameworks built for someone else's problem. Media tells you change is happening; it rarely lets you feel it.</p>
      <p class="body-lg measure" style="margin-top:20px;">Daxsara was built to close that gap directly — through experiences people walk into, not reports they read.</p>
    </div>
    <div data-reveal>
      <h2 class="title-1">What "bringing thought into the world" means</h2>
      <p class="body-lg measure" style="margin-top:20px;">A thought that stays a sentence changes nothing. We take an idea about how people are changing and give it a shape you can walk through, sit inside, or be interviewed for — a bazaar stall, a three-month studio, a dinner for twelve. The idea only counts once it has a body.</p>
    </div>
  </div>
</section>

<section class="section section--paper">
  <div class="wrap">
    <h2 class="title-1" style="margin-bottom:32px;">How we operate</h2>
    <div class="stat-row">
      <div class="stat" data-reveal>
        <div class="num mark" style="font-size:2.2rem;color:var(--black);opacity:1;">3</div>
        <div class="lbl">Fronts running in parallel — cultural events, the Academy, and organizational transformation — by design, not by drift.</div>
      </div>
      <div class="stat" data-reveal>
        <div class="num mark" style="font-size:2.2rem;color:var(--black);opacity:1;">1</div>
        <div class="lbl">Underlying framework behind all of it: Perception, Expression, Manifestation, built on a substrate of Capability.</div>
      </div>
      <div class="stat" data-reveal>
        <div class="num mark" style="font-size:2.2rem;color:var(--black);opacity:1;">0</div>
        <div class="lbl">Borrowed playbooks. Every program is built from how Daxsara itself understands the problem, not a template.</div>
      </div>
    </div>
  </div>
</section>

<section class="section wrap" data-reveal>
  <h2 class="title-1 measure">Our worldview</h2>
  <p class="body-lg measure" style="margin-top:20px;opacity:.85;">People don't resist change itself — they resist change they were never given a way to perceive, express, or act on. Most institutions try to manage that gap with information. We think it closes through experience instead: put someone inside a changed reality before you ask them to believe in it.</p>
</section>
`;
  return layout({
    title: "About",
    description: "Why Daxsara exists, what it means to bring thought into the world, and how the company operates.",
    active: "about.html",
    body
  });
}

function eventsPage() {
  const body = `
${pageHead("Events", "A record of what Daxsara has staged, and what's coming.")}
<section class="section wrap">
  <ul class="filter-tabs" role="tablist" aria-label="Filter events">
    <li role="presentation"><button data-filter="upcoming" aria-selected="true">Upcoming</button></li>
    <li role="presentation"><button data-filter="ongoing" aria-selected="false">Ongoing</button></li>
    <li role="presentation"><button data-filter="past" aria-selected="false">Past</button></li>
    <li role="presentation"><button data-filter="all" aria-selected="false">All</button></li>
  </ul>
  <div class="timeline" data-timeline="archive" style="margin-top:8px;"></div>
</section>
`;
  return layout({
    title: "Events",
    description: "The complete Daxsara event archive — upcoming, ongoing, and past.",
    active: "events.html",
    body
  });
}

function academyPage() {
  const body = `
${pageHead("Academy", "A three-month studio for teenagers, built around capability rather than curriculum.", "Not an after-school program. Not a bootcamp. A structured space for a teenager to build the ability to perceive, express, and manifest — and then actually do it, in public, once.")}

<section class="section wrap">
  <div class="two-col">
    <div data-reveal>
      <h2 class="title-1">The shape of a cohort</h2>
      <p class="body-lg measure" style="margin-top:18px;">Each cohort runs three months, inside Hedish, in Tehran. It begins with perception — learning to actually see the systems a participant is already living inside. It moves into expression — finding the language and form to describe what they've seen. It ends in manifestation: a public presentation of something real, built by the participant, that did not exist before the cohort began.</p>
    </div>
    <div data-reveal>
      <h2 class="title-1">Why not a school</h2>
      <p class="body-lg measure" style="margin-top:18px;">Grades install an identity that's expensive to remove later. A classroom inherits the authority of the building it sits in. The Academy is built to avoid both — no grades, no fixed identity assigned on day one, and a venue, Hedish, with no prior claim on who a teenager is supposed to be.</p>
    </div>
  </div>
</section>

<section class="section section--dark">
  <div class="wrap">
    <div class="eyebrow-num"><span class="num">—</span><span class="label">Where it happens</span><span class="line"></span></div>
    <p class="title-1 measure" data-reveal>Inside Hedish, a shopping mall in Tehran that agreed to become the Academy's public home — a working case for what a mall can be when it stops being only a place to buy things.</p>
    <a class="link-arrow text-link" style="margin-top:28px;display:inline-flex;" href="services.html">Read about the Hedish collaboration
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>
  </div>
</section>

<section class="section wrap" data-reveal>
  <h2 class="title-1">Cohorts</h2>
  <ul class="simple-list" style="margin-top:24px;">
    <li><span>Cohort One</span><span class="mark">Completed — Manifestation Day, April 2026</span></li>
    <li><span>Cohort Two</span><span class="mark">Opens December 2026</span></li>
  </ul>
  <a class="link-arrow text-link" style="margin-top:28px;display:inline-flex;" href="events.html">See Academy dates on the events calendar
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
  </a>
</section>
`;
  return layout({
    title: "Academy",
    description: "The Daxsara Academy — a three-month studio for teenagers inside Hedish, built around capability rather than curriculum.",
    active: "academy.html",
    body
  });
}

function servicesPage() {
  const projectRows = PROJECTS.map(
    (p) => `<div class="project-row" data-reveal>
      <img src="${p.image}" alt="" loading="lazy">
      <div>
        <span class="mark">${esc(p.client)}</span>
        <h3 class="title-1" style="margin-top:14px;">${esc(p.title)}</h3>
        <p class="body" style="margin-top:14px;opacity:.8;max-width:44ch;">${esc(p.summary)}</p>
        <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
          ${p.tags.map((t) => `<span class="mark" style="border:1px solid var(--line);padding:5px 12px;">${esc(t)}</span>`).join("")}
        </div>
      </div>
    </div>`
  ).join("\n");

  const body = `
${pageHead("Services", "Organizations don't come to us for a workshop. They come because the way they think stopped matching the world.", "We work with companies and governments to build the perception, language, and public expression a transformation actually needs — using Daxsara's own way of understanding, not a licensed framework.")}

<section class="section wrap">
  <div class="two-col">
    <div data-reveal>
      <h2 class="title-1">With companies</h2>
      <p class="body-lg measure" style="margin-top:18px;">AI, new markets, and new expectations of work are changing what a company's people need to perceive and be able to do. We build the internal experiences — workshops, immersive sessions, public artifacts — that make that shift legible inside an organization, instead of leaving it as a slide in a strategy deck.</p>
    </div>
    <div data-reveal>
      <h2 class="title-1">With governments</h2>
      <p class="body-lg measure" style="margin-top:18px;">Public institutions face the same gap at a larger scale: the distance between how a ministry understands the people it serves and how those people actually live. We work on the point of contact itself — procedures, spaces, and public communication — rather than the org chart above it.</p>
    </div>
  </div>
</section>

<section class="section section--paper">
  <div class="wrap">
    <div class="eyebrow-num"><span class="num">—</span><span class="label">Selected projects</span><span class="line"></span></div>
    ${projectRows}
  </div>
</section>
`;
  return layout({
    title: "Services",
    description: "Daxsara's experience-design and transformation work with companies and governments. Selected projects and case studies.",
    active: "services.html",
    body
  });
}

function thoughtsPage() {
  const items = THOUGHTS.slice().sort((a, b) => b.date.localeCompare(a.date)).map(
    (t) => `<a class="essay-card" href="#${t.slug}" data-reveal>
      <span class="mark">${fmtDate(t.date)}</span>
      <span>
        <span class="title-2" style="display:block;">${esc(t.title)}</span>
        <span class="body" style="display:block;margin-top:10px;opacity:.75;">${esc(t.excerpt)}</span>
      </span>
    </a>`
  ).join("\n");

  const fullEssays = THOUGHTS.slice().sort((a, b) => b.date.localeCompare(a.date)).map(
    (t) => `<article id="${t.slug}" class="section wrap" style="max-width:820px;margin:0 auto;padding-top:64px;padding-bottom:64px;border-top:1px solid var(--line);">
      <span class="mark">${fmtDate(t.date)}</span>
      <h2 class="title-1" style="margin-top:14px;">${esc(t.title)}</h2>
      ${t.body.split("\n\n").map((p) => `<p class="body-lg measure" style="margin-top:20px;opacity:.85;">${esc(p)}</p>`).join("\n")}
    </article>`
  ).join("\n");

  const body = `
${pageHead("Journal", "Daxsara thinks in public.", "An evolving record of essays, observations, and propositions — the ideas underneath the events, not press about them.")}
<section class="section wrap" style="padding-top:0;">
  ${items}
</section>
${fullEssays}
`;
  return layout({
    title: "Journal",
    description: "Essays, observations, and propositions from Daxsara — the ideas underneath the events.",
    active: "thoughts.html",
    body
  });
}

function contactPage() {
  const body = `
<section class="section wrap" style="padding-top:clamp(140px,20vw,220px);">
  <span class="mark">Contact</span>
  <p class="contact-strike" style="margin-top:24px;">Have something worth bringing into the world?</p>
  <ul class="field-list measure">
    <li><span class="mark">Email</span><a class="text-link" href="mailto:hello@daxsara.com">hello@daxsara.com</a></li>
    <li><span class="mark">Instagram</span><a class="text-link" href="https://instagram.com/daxsara" target="_blank" rel="noreferrer">@daxsara</a></li>
    <li><span class="mark">Studio</span><span>Tehran, Iran</span></li>
    <li><span class="mark">Partnerships</span><a class="text-link" href="partner-program.html">Partner Program →</a></li>
  </ul>
</section>
`;
  return layout({
    title: "Contact",
    description: "Get in touch with Daxsara.",
    active: "contact.html",
    body
  });
}

function minimalProductPage({ mark, title, lede, image, active, description }) {
  const body = `
${pageHead(mark, title, lede)}
<section class="section wrap">
  <img src="${image}" alt="" style="width:100%;aspect-ratio:16/9;object-fit:cover;" loading="lazy" data-reveal>
  <p class="body-lg measure" style="margin-top:36px;opacity:.8;" data-reveal>More detail on this is coming as the program develops. In the meantime, reach out directly — early conversations shape what this becomes.</p>
  <a class="btn btn--solid" style="margin-top:28px;" href="contact.html">Get in touch</a>
</section>
`;
  return layout({ title, description, active, body });
}

function merchPage() {
  return minimalProductPage({
    mark: "Products — Merchandise",
    title: "Small, durable objects carrying the studio's geometry.",
    lede: "A limited catalog is in development. First pieces will draw directly from the Daxsara star and the materials used across our events.",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1600&auto=format&fit=crop",
    active: "merch.html",
    description: "Daxsara merchandise — durable objects carrying the studio's geometry."
  });
}

function yogaPage() {
  return minimalProductPage({
    mark: "Products — Yoga of ADHD",
    title: "A movement practice built around how a scattering mind actually works.",
    lede: "Not a wellness trend borrowed from elsewhere. A practice designed from the ground up for attention that moves differently — built with, not just for, people who live with ADHD.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1600&auto=format&fit=crop",
    active: "yoga-of-adhd.html",
    description: "Yoga of ADHD — a movement practice built around how a scattering mind actually works."
  });
}

function aiPage() {
  return minimalProductPage({
    mark: "Products — Artificial Intelligence",
    title: "A physical showroom for what AI can actually do, not what it's rumored to.",
    lede: "Interactive AI agent experiences installed in high-footfall venues and institutional settings — a way for organizations and the public to encounter working AI before deciding what to think about it.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop",
    active: "artificial-intelligence.html",
    description: "Daxsara's AI showroom — physical, interactive AI experiences for organizations and the public."
  });
}

function clubPage() {
  return minimalProductPage({
    mark: "Products — Daxsara Club",
    title: "A physical hub in Tehran for people building things worth building.",
    lede: "A standing space — not a one-off event — for the community that keeps forming around Daxsara's work: Academy graduates, collaborators, and people who want to be near what's next.",
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1600&auto=format&fit=crop",
    active: "daxsara-club.html",
    description: "Daxsara Club — a physical hub space in Tehran."
  });
}

function partnerPage() {
  return minimalProductPage({
    mark: "Products — Partner Program",
    title: "For organizations building alongside Daxsara over time.",
    lede: "A structured way for companies, venues, and institutions to work with Daxsara continuously — beyond a single event or engagement.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600&auto=format&fit=crop",
    active: "partner-program.html",
    description: "The Daxsara Partner Program — for organizations building alongside Daxsara over time."
  });
}

function eventPage(ev, related) {
  const relatedList = related.map(
    (r) => `<a class="essay-card" href="${r.slug}.html">
      <span class="mark">${fmtDate(r.date)}</span>
      <span>
        <span class="title-2" style="display:block;">${esc(r.name)}</span>
        <span class="body" style="display:block;margin-top:8px;opacity:.75;">${esc(r.location)}</span>
      </span>
    </a>`
  ).join("\n");

  const body = `
<section class="page-head wrap">
  <span class="mark">${esc(ev.category)} — ${fmtDate(ev.date)}${ev.endDate ? " – " + fmtDate(ev.endDate) : ""}</span>
  <h1 class="display-2 measure" style="margin-top:14px;">${esc(ev.name)}</h1>
  <p class="body-lg" style="margin-top:14px;opacity:.7;">${esc(ev.location)}</p>
</section>
<section class="wrap">
  <img class="event-hero-img" src="${ev.image}" alt="" loading="lazy">
  <div class="two-col">
    <div>
      <h2 class="title-2" style="opacity:.6;">About this event</h2>
      <p class="body-lg measure" style="margin-top:18px;">${esc(ev.full)}</p>
      ${ev.participants && ev.participants.length ? `<h2 class="title-2" style="opacity:.6;margin-top:40px;">Participants</h2><p class="body" style="margin-top:14px;">${ev.participants.map(esc).join(" · ")}</p>` : ""}
    </div>
    <div>
      <a class="btn btn--solid" href="${ev.action.href}">${esc(ev.action.label)}</a>
      <a class="link-arrow text-link" style="margin-top:28px;display:inline-flex;" href="../events.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" style="transform:rotate(180deg);"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        Back to all events
      </a>
    </div>
  </div>
</section>
${related.length ? `<section class="section wrap">
  <div class="eyebrow-num"><span class="num">—</span><span class="label">Related</span><span class="line"></span></div>
  ${relatedList}
</section>` : ""}
`;
  // Event pages live one directory deep — rewrite asset/nav paths accordingly.
  const html = layout({
    title: ev.name,
    description: ev.short,
    active: "events.html",
    ogImage: ev.image,
    body
  })
    .replace(/href="(?!http|mailto|#)/g, 'href="../')
    .replace(/src="(?!http)/g, 'src="../')
    .replace('href="../../', 'href="../') // guard against double-prefixing on relative anchors already correct
    .replace(/href="\.\.\/events\.html"/g, 'href="../events.html"');
  return html;
}

/* ---------------------------------------------------------------------- */
/* Write files                                                              */
/* ---------------------------------------------------------------------- */

function write(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  console.log("wrote", rel);
}

write("index.html", homePage());
write("about.html", aboutPage());
write("events.html", eventsPage());
write("academy.html", academyPage());
write("services.html", servicesPage());
write("thoughts.html", thoughtsPage());
write("contact.html", contactPage());
write("merch.html", merchPage());
write("yoga-of-adhd.html", yogaPage());
write("artificial-intelligence.html", aiPage());
write("daxsara-club.html", clubPage());
write("partner-program.html", partnerPage());

EVENTS.forEach((ev) => {
  const related = EVENTS.filter((e) => e.slug !== ev.slug && e.category === ev.category).slice(0, 2);
  write(path.join("events", ev.slug + ".html"), eventPage(ev, related));
});

/* Sitemap */
const staticPaths = [
  "", "about.html", "events.html", "academy.html", "services.html", "thoughts.html",
  "contact.html", "merch.html", "yoga-of-adhd.html", "artificial-intelligence.html",
  "daxsara-club.html", "partner-program.html"
];
const eventPaths = EVENTS.map((e) => `events/${e.slug}.html`);
const urls = staticPaths.concat(eventPaths).map(
  (p) => `  <url><loc>${SITE_URL}/${p}</loc></url>`
).join("\n");
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

console.log(`\nBuilt ${staticPaths.length} pages and ${eventPaths.length} event pages.`);
