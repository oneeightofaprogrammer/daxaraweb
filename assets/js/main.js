/* Daxsara — shared front-end behaviour. No build step, no dependencies. */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Nav ---------------- */
  function initNav() {
    var nav = document.querySelector(".nav");
    if (!nav) return;
    var onDark = nav.hasAttribute("data-on-dark");
    if (onDark) nav.classList.add("on-dark");

    function setCompact() {
      var compact = window.scrollY > 40;
      nav.classList.toggle("is-compact", compact);
    }
    setCompact();
    window.addEventListener("scroll", setCompact, { passive: true });

    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        menu.classList.toggle("is-open", !open);
        document.body.style.overflow = !open ? "hidden" : "";
      });
      menu.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          toggle.setAttribute("aria-expanded", "false");
          menu.classList.remove("is-open");
          document.body.style.overflow = "";
        });
      });
    }
  }

  /* ---------------- Reveal on scroll (used for section-level groups only) ---------------- */
  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- Daxsara star ---------------- */
  // Two overlapping squares rotated 45deg = eight-pointed star outline.
  function starPath(cx, cy, r) {
    var pts = [];
    for (var i = 0; i < 4; i++) {
      var a = (Math.PI / 2) * i;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    var pts2 = [];
    for (var j = 0; j < 4; j++) {
      var a2 = (Math.PI / 2) * j + Math.PI / 4;
      pts2.push([cx + r * Math.cos(a2), cy + r * Math.sin(a2)]);
    }
    function toPath(p) {
      return "M" + p.map(function (pt) { return pt[0].toFixed(2) + "," + pt[1].toFixed(2); }).join(" L") + " Z";
    }
    return toPath(pts) + " " + toPath(pts2);
  }

  function buildStarSVG(size, strokeOnly) {
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.classList.add(strokeOnly ? "star-mark" : "star-solid");
    var path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", starPath(50, 50, 42));
    path.setAttribute("fill-rule", "evenodd");
    svg.appendChild(path);
    return svg;
  }

  function initStars() {
    document.querySelectorAll("[data-star]").forEach(function (host) {
      var size = host.getAttribute("data-star-size") || "22";
      var solid = host.getAttribute("data-star") === "solid";
      host.appendChild(buildStarSVG(size, !solid));
    });
  }

  /* ---------------- Hero scroll sequence ---------------- */
  function initHero() {
    var hero = document.querySelector(".hero");
    if (!hero) return;
    var stage = hero.querySelector(".hero-stage");
    var img = hero.querySelector(".hero-image");
    var geo = hero.querySelector(".hero-geo");
    var lines = hero.querySelectorAll(".hero-line");
    var cue = hero.querySelector(".hero-scroll-cue");

    var geoShapes = geo ? Array.prototype.slice.call(geo.querySelectorAll("[data-geo]")) : [];

    function progress() {
      var rect = hero.getBoundingClientRect();
      var total = hero.offsetHeight - window.innerHeight;
      var scrolled = -rect.top;
      var p = total > 0 ? scrolled / total : 0;
      return Math.min(1, Math.max(0, p));
    }

    function apply() {
      var p = progress();

      if (cue) cue.style.opacity = p > 0.03 ? "0" : "0.8";

      // Image: fades and settles in across the first quarter.
      var imgP = clamp01(remap(p, 0, 0.22, 0, 1));
      if (img) {
        img.style.opacity = String(imgP);
        img.style.transform = "scale(" + (1.06 - 0.06 * imgP) + ")";
      }

      // Geometric forms: emerge, drift, and clear out across the remainder.
      geoShapes.forEach(function (shape, i) {
        var start = 0.16 + i * 0.09;
        var peak = start + 0.22;
        var end = start + 0.5;
        var rise = clamp01(remap(p, start, peak, 0, 1));
        var fall = clamp01(remap(p, peak, end, 0, 1));
        var opacity = rise * (1 - fall);
        var scale = 0.82 + rise * 0.3 - fall * 0.05;
        var rotate = (p - start) * 26;
        shape.style.opacity = String(opacity);
        shape.style.transform = "rotate(" + rotate + "deg) scale(" + scale + ")";
      });

      // Text lines: sequential entrance/exit within their own window.
      var n = lines.length;
      lines.forEach(function (line, i) {
        var start = 0.08 + (i / n) * 0.85;
        var end = start + 0.85 / n;
        var midStart = start + (end - start) * 0.18;
        var midEnd = end - (end - start) * 0.32;
        var inP = clamp01(remap(p, start, midStart, 0, 1));
        var outP = clamp01(remap(p, midEnd, end, 0, 1));
        var op = inP * (1 - outP);
        line.style.opacity = String(op);
        line.style.transform = "translateY(" + (24 * (1 - inP) - 24 * outP) + "px)";
      });
    }

    function clamp01(v) { return Math.min(1, Math.max(0, v)); }
    function remap(v, a, b, c, d) {
      if (a === b) return v < a ? c : d;
      var t = (v - a) / (b - a);
      return c + (d - c) * Math.min(1, Math.max(0, t));
    }

    if (reduceMotion) {
      if (img) { img.style.opacity = "1"; img.style.transform = "none"; }
      lines.forEach(function (l) { l.style.opacity = "0"; });
      if (lines[0]) { lines[0].style.opacity = "1"; lines[0].style.position = "static"; }
      return;
    }

    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(function () { apply(); ticking = false; });
          ticking = true;
        }
      },
      { passive: true }
    );
    apply();
  }

  /* ---------------- Timeline (upcoming events) ---------------- */
  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00");
    var dd = String(d.getDate()).padStart(2, "0");
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var yy = String(d.getFullYear()).slice(2);
    return dd + "." + mm + "." + yy;
  }

  function eventStatus(ev) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var start = new Date(ev.date + "T00:00:00");
    var end = new Date((ev.endDate || ev.date) + "T00:00:00");
    if (end < today) return "past";
    if (start <= today && today <= end) return "ongoing";
    return "upcoming";
  }

  function timelineRow(ev) {
    var a = document.createElement("a");
    a.className = "timeline-row";
    a.href = "events/" + ev.slug + ".html";
    a.innerHTML =
      '<div class="timeline-date">' + fmtDate(ev.date) + "</div>" +
      '<div class="timeline-node" data-star data-star-size="16"></div>' +
      '<div class="timeline-body">' +
        '<div class="timeline-name">' + ev.name + "</div>" +
        '<div class="timeline-loc">' + ev.location + "</div>" +
        '<div class="timeline-desc">' + ev.short + "</div>" +
        '<div class="timeline-cat">' + ev.category + "</div>" +
      "</div>";
    return a;
  }

  function initHomeTimeline() {
    var mount = document.querySelector("[data-timeline='upcoming']");
    if (!mount || typeof window.DAXSARA_EVENTS === "undefined") return;
    var upcoming = window.DAXSARA_EVENTS
      .filter(function (ev) { return eventStatus(ev) !== "past"; })
      .sort(function (a, b) { return a.date.localeCompare(b.date); })
      .slice(0, 4);
    upcoming.forEach(function (ev) { mount.appendChild(timelineRow(ev)); });
    initStars();
  }

  /* ---------------- Events archive (with filters) ---------------- */
  function initEventsArchive() {
    var mount = document.querySelector("[data-timeline='archive']");
    if (!mount || typeof window.DAXSARA_EVENTS === "undefined") return;
    var tabs = document.querySelectorAll("[data-filter]");
    var all = window.DAXSARA_EVENTS.slice().sort(function (a, b) { return a.date.localeCompare(b.date); });

    function render(filter) {
      mount.innerHTML = "";
      var list = all.filter(function (ev) { return filter === "all" || eventStatus(ev) === filter; });
      if (filter === "past") list.reverse();
      if (!list.length) {
        var empty = document.createElement("p");
        empty.className = "body";
        empty.style.padding = "34px 0";
        empty.textContent = "Nothing here yet.";
        mount.appendChild(empty);
        return;
      }
      list.forEach(function (ev) { mount.appendChild(timelineRow(ev)); });
      initStars();
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.setAttribute("aria-selected", "false"); });
        tab.setAttribute("aria-selected", "true");
        render(tab.getAttribute("data-filter"));
      });
    });

    var initial = document.querySelector("[data-filter][aria-selected='true']");
    render(initial ? initial.getAttribute("data-filter") : "upcoming");
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initStars();
    initReveal();
    initHero();
    initHomeTimeline();
    initEventsArchive();
  });
})();
