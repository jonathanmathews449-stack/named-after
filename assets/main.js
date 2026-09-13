/* ==========================================================================
   Named After — behaviour
   --------------------------------------------------------------------------
   Three independent blocks: nav toggle, theme toggle, random fact. Each is
   self-contained and fails quiet, so a change to one cannot break the others.

   The page works fully without this file: the cards are <details> elements,
   and the theme follows prefers-color-scheme on its own.
   ========================================================================== */

/* --- Mobile nav ----------------------------------------------------- */

(function initNavToggle() {
  "use strict";

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  function setOpen(open) {
    // aria-expanded is the source of truth for assistive tech; the class is
    // only how CSS reacts. Keep them in lockstep.
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  // Close after an in-page jump, or the open panel covers the target.
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") setOpen(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (toggle.getAttribute("aria-expanded") !== "true") return;
    setOpen(false);
    toggle.focus();
  });

  // Leaving mobile width with the panel open would stick .is-open on and leave
  // aria-expanded describing a menu that is now permanently visible.
  window.matchMedia("(min-width: 769px)").addEventListener("change", function (e) {
    if (e.matches) setOpen(false);
  });
})();

/* --- Theme toggle --------------------------------------------------- */

(function initThemeToggle() {
  "use strict";

  var KEY = "named-after-theme";
  var root = document.documentElement;
  var btn = document.getElementById("theme-toggle");
  if (!btn) return;

  // localStorage throws outright in some privacy modes, so every access is
  // guarded. A failure here must not take the rest of the page down.
  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* not fatal */ }
  }

  function systemPrefersDark() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function isDark() {
    var explicit = root.getAttribute("data-theme");
    if (explicit) return explicit === "dark";
    return systemPrefersDark();
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    btn.setAttribute("aria-pressed", String(theme === "dark"));
  }

  // Restore a previous explicit choice. Without a stored value we set nothing,
  // so the CSS media query keeps following the OS.
  var stored = read();
  if (stored === "dark" || stored === "light") {
    apply(stored);
  } else {
    btn.setAttribute("aria-pressed", String(systemPrefersDark()));
  }

  btn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    apply(next);
    write(next);
  });

  // While the visitor has made no explicit choice, keep tracking the OS.
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    if (read()) return;
    btn.setAttribute("aria-pressed", String(e.matches));
  });
})();

/* --- Random fact ---------------------------------------------------- */

(function initFactShuffle() {
  "use strict";

  var out = document.getElementById("fact-text");
  var btn = document.getElementById("fact-btn");
  if (!out || !btn) return;

  var FACTS = [
    "Nvidia is named after <em>invidia</em> — Latin for <em>envy</em>. The founders wanted the industry to covet their graphics chips.",
    "Claude is named after Claude Shannon, who in 1948 proved information could be measured in bits. He grew up in a Michigan town of about 4,000 people.",
    "Hugging Face is named after the 🤗 emoji. It started life as a chatbot for bored teenagers.",
    "Nvidia was founded in a booth at a Denny's in San Jose. Jensen Huang had worked at Denny's as a dishwasher and busboy.",
    "&ldquo;Grok&rdquo; was invented by Robert Heinlein for a 1961 novel. It is now in the Oxford English Dictionary.",
    "The Transformer paper is called <em>Attention Is All You Need</em> — a play on the Beatles. Its author says the title took him five seconds.",
    "Mistral AI is named after a cold north-westerly wind that blows down the Rhône valley for days at a time.",
    "ELIZA, the first chatbot, is named after Eliza Doolittle in <em>Pygmalion</em> — a character taught to speak above her station.",
    "&ldquo;Artificial intelligence&rdquo; was coined by John McCarthy in 1955, in a proposal for a summer workshop at Dartmouth.",
    "Anthropic comes from the Greek <em>ánthrōpos</em>, meaning human being.",
    "Demis Hassabis was a chess master at 13 and a lead designer on the game <em>Theme Park</em> as a teenager, before founding DeepMind.",
    "Perplexity is named after the metric for how surprised a language model is by text. Lower is better — an odd thing to name yourself after.",
    "Cohere was co-founded by Aidan Gomez, who was an intern when he co-authored the paper that introduced the Transformer.",
    "In September 2026 Nvidia — the envy company from the diner — agreed to buy Hugging Face, the emoji company, for about $13 billion.",
    "Gemini is the constellation of the twins. The model was built by two research teams, Google Brain and DeepMind, merged after a decade as rivals."
  ];

  // Shuffle through a queue rather than picking at random each press, so the
  // same fact cannot appear twice in a row and every fact is seen once per pass.
  var queue = [];

  function refill() {
    queue = FACTS.slice();
    for (var i = queue.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = queue[i]; queue[i] = queue[j]; queue[j] = tmp;
    }
    // Avoid repeating the fact currently on screen across a refill boundary.
    if (queue.length > 1 && queue[queue.length - 1] === out.innerHTML.trim()) {
      queue.unshift(queue.pop());
    }
  }

  btn.addEventListener("click", function () {
    if (!queue.length) refill();
    out.innerHTML = queue.pop();
  });
})();

/* --- Print: open every card --------------------------------------- */

(function initPrintExpand() {
  "use strict";

  // The stylesheet handles this on its own with ::details-content, which is
  // the correct and JS-free route. This exists only for engines that predate
  // that pseudo-element (before Chrome 131 / Safari 18.4 / Firefox 139),
  // where a closed <details> cannot be opened from CSS at all and eleven of
  // the twelve stories would print as a one-line summary.
  if (CSS && CSS.supports && CSS.supports("selector(details::details-content)")) return;

  var reopened = [];

  window.addEventListener("beforeprint", function () {
    reopened = [];
    Array.prototype.forEach.call(document.querySelectorAll("details.card"), function (d) {
      if (!d.open) { d.open = true; reopened.push(d); }
    });
  });

  // Put the page back exactly as the reader left it — anything we opened, and
  // only what we opened.
  window.addEventListener("afterprint", function () {
    reopened.forEach(function (d) { d.open = false; });
    reopened = [];
  });
})();
