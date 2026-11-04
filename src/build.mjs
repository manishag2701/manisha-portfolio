import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const data = JSON.parse(read("src/data.json"));
const dims = JSON.parse(read("src/img-dims.json"));
const S = data.site;
const YEAR = new Date().getFullYear();
const FULL = "Manisha Gupta";
const BUILD = Date.now().toString(36);
const hasPdf = fs.existsSync(path.join(ROOT, "Manisha-Gupta-Resume.pdf"));

const courses = data.courses.filter((c) => !c.hidden);
const cases = data.caseStudies;

/* ---------- helpers ---------- */
const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function write(rel, html) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

const iconCache = {};
function icon(name, cls = "size-5") {
  const brand = {
    linkedin:
      '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
    github:
      '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  };
  let inner;
  if (brand[name]) inner = brand[name];
  else {
    if (!iconCache[name]) {
      const svg = fs.readFileSync(path.join(ROOT, "node_modules/lucide-static/icons", `${name}.svg`), "utf8");
      iconCache[name] = svg.replace(/<!--[\s\S]*?-->/g, "").replace(/<svg[\s\S]*?>/, "").replace("</svg>", "").replace(/\s+/g, " ").trim();
    }
    inner = iconCache[name];
  }
  return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
}

function webp(p) {
  if (p === "/manisha-photo.jpg") return "/img/photo.webp";
  return "/img" + p.replace(/\.(png|jpg|jpeg)$/i, ".webp");
}

function img(src, alt, { cls = "", eager = false, sizes = "(min-width:1024px) 50vw, 100vw" } = {}) {
  const [w, h] = dims[src] || [];
  const dim = w ? ` width="${w}" height="${h}"` : "";
  return `<img src="${src}" alt="${esc(alt)}"${dim} sizes="${sizes}" class="${cls}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

const pill = (t, dark = false) => `<span class="pill${dark ? " pill-dark" : ""}">${esc(t)}</span>`;
const slugOk = (u) => u && u !== "#";
const mail = `mailto:${S.email}`;
const arrowBtn = (dark) =>
  `<span class="grid size-10 shrink-0 place-items-center rounded-full ${dark ? "bg-rose text-ink" : "bg-ink text-cream"} transition duration-300 group-hover:rotate-45 group-hover:bg-rose group-hover:text-ink">${icon("arrow-up-right", "size-5")}</span>`;

/* ---------- layout ---------- */
const NAV = [
  { label: "Case Studies", href: "/#work", on: (p) => p.startsWith("/work") },
  { label: "Courses", href: "/courses/", on: (p) => p.startsWith("/courses") },
  { label: "Services", href: "/#services", on: () => false },
  { label: "About", href: "/#about", on: () => false },
  { label: "Resume", href: "/resume/", on: (p) => p.startsWith("/resume") },
];

function header(p) {
  const links = NAV.map((n) => {
    const active = n.on(p);
    return `<li><a href="${n.href}"${active ? ' aria-current="page"' : ""} class="rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? "bg-rose text-ink" : "hover:bg-rose/15"}">${n.label}</a></li>`;
  }).join("");
  const mobile = NAV.map(
    (n) => `<a href="${n.href}" class="block rounded-2xl px-4 py-3 text-base font-semibold hover:bg-blush-deep">${n.label}</a>`
  ).join("");
  return `<header class="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
  <nav aria-label="Primary" class="mx-auto flex max-w-[1320px] items-center justify-between rounded-full border border-line bg-white/70 py-2 pl-5 pr-2 shadow-[0_10px_40px_-18px_rgba(15,15,18,0.25)] backdrop-blur-xl">
    <a href="/" class="font-display text-xl font-extrabold tracking-tight" aria-label="Manisha G., home">Manisha G<span class="text-rose">.</span></a>
    <ul class="hidden items-center gap-1 md:flex">${links}</ul>
    <div class="flex items-center gap-2">
      <a href="${mail}" class="btn btn-dark hidden !py-2.5 sm:inline-flex">Let's Talk ${icon("arrow-up-right", "size-4")}</a>
      <details data-menu class="relative md:hidden">
        <summary class="grid size-11 cursor-pointer place-items-center rounded-full bg-ink text-cream" aria-label="Menu">${icon("menu", "size-5")}</summary>
        <div class="surface absolute right-0 top-[calc(100%+0.75rem)] w-64 p-2 shadow-2xl">${mobile}
          <a href="${mail}" class="btn btn-rose mt-1 w-full">Let's Talk</a>
        </div>
      </details>
    </div>
  </nav>
</header>`;
}

function ctaBlock() {
  return `<section id="contact" class="px-3 pt-24 sm:px-6">
  <div class="slab mx-auto max-w-[1320px] px-6 py-16 text-center sm:px-12 sm:py-24">
    <div class="glow -left-20 -top-24 size-[380px] bg-rose/25"></div>
    <div class="glow -bottom-32 -right-10 size-[360px] bg-rose-soft/20"></div>
    <div class="reveal relative mx-auto max-w-3xl">
      <span class="pill pill-dark">Contact</span>
      <h2 class="mt-6 font-display text-[clamp(2.4rem,6vw,4.75rem)] font-extrabold leading-[1.02] text-cream">Let's build the future of learning.</h2>
      <p class="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-cream/70">Have a course, LMS, or instructional design project in mind? I'd love to hear about it.</p>
      <a href="${mail}" class="btn btn-rose mt-9 max-w-full !px-5 !py-4 !text-sm sm:!px-8 sm:!text-base">${icon("mail", "size-5 shrink-0")} <span class="min-w-0 truncate">${esc(S.email)}</span></a>
      <ul class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <li><a class="pill pill-dark !px-4 !py-2 text-sm transition hover:border-rose hover:text-rose" href="${S.linkedin}" target="_blank" rel="noopener noreferrer">${icon("linkedin", "size-4")} LinkedIn</a></li>
        <li><a class="pill pill-dark !px-4 !py-2 text-sm transition hover:border-rose hover:text-rose" href="${S.github}" target="_blank" rel="noopener noreferrer">${icon("github", "size-4")} GitHub</a></li>
        <li><a class="pill pill-dark !px-4 !py-2 text-sm transition hover:border-rose hover:text-rose" href="${mail}">${icon("mail", "size-4")} Email</a></li>
      </ul>
    </div>
  </div>
</section>`;
}

function footer() {
  return `<footer class="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-ink/65 sm:flex-row">
  <p>&copy; ${YEAR} ${esc(S.name)} &middot; ${esc(S.title)}</p>
  <ul class="flex gap-5 font-semibold">
    <li><a class="hover:text-rose-ink" href="/work/">Case studies</a></li>
    <li><a class="hover:text-rose-ink" href="/courses/">Courses</a></li>
    <li><a class="hover:text-rose-ink" href="/resume/">Resume</a></li>
  </ul>
</footer>`;
}

function layout({ title, desc, p, body, noindex = false, ld = "" }) {
  const url = S.url + (p === "/404" ? "/" : p);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0f0f12">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(S.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${S.url}/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${S.url}/og.png">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/assets/site.css?v=${BUILD}">
<script>document.documentElement.classList.add("js")</script>
<script defer src="/assets/site.js?v=${BUILD}"></script>
${ld}
</head>
<body>
<a href="#main" class="sr-only z-[60] rounded-full bg-ink px-5 py-3 font-semibold text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
${header(p)}
<main id="main">
${body}
</main>
${footer()}
</body>
</html>`;
}

function sectionHead({ eyebrow, title, text = "", linkHref = "", linkLabel = "", dark = false }) {
  return `<div class="reveal mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
  <div class="max-w-2xl">
    <span class="eyebrow ${dark ? "text-rose" : "text-rose-ink"}"><span class="size-1.5 rounded-full bg-rose"></span>${esc(eyebrow)}</span>
    <h2 class="mt-3 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl ${dark ? "text-cream" : ""}">${esc(title)}</h2>
    ${text ? `<p class="mt-4 text-lg leading-relaxed ${dark ? "text-cream/70" : "text-ink/70"}">${esc(text)}</p>` : ""}
  </div>
  ${linkHref ? `<a href="${linkHref}" class="btn ${dark ? "btn-ghost-dark" : "btn-outline"} shrink-0">${esc(linkLabel)} ${icon("arrow-right", "size-4")}</a>` : ""}
</div>`;
}

/* ---------- cards ---------- */
const BENTO = [
  { span: "md:col-span-2 lg:col-span-4", dark: true, wide: true },
  { span: "lg:col-span-2", dark: false, wide: false },
  { span: "lg:col-span-2", dark: false, wide: false },
  { span: "md:col-span-2 lg:col-span-4", dark: true, wide: true },
  { span: "lg:col-span-3", dark: false, wide: false },
  { span: "lg:col-span-3", dark: true, wide: false },
];

function caseCard(cs, i) {
  const { span, dark, wide } = BENTO[i % BENTO.length];
  const shot = webp(cs.screenshots[0]);
  return `<a href="/work/${cs.slug}/" class="reveal group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(255,75,114,0.45)] ${span} ${dark ? "surface-dark hover:border-rose/60" : "surface hover:border-rose"} ${wide ? "lg:flex-row" : ""}" aria-label="${esc(cs.title)}: view case study">
  ${wide
    ? `<div class="flex items-center p-3 lg:w-[52%] lg:p-4"><div class="relative aspect-[16/10] w-full overflow-hidden rounded-[18px] bg-ink ring-1 ${dark ? "ring-white/10" : "ring-line"}">${img(shot, `${cs.title} project preview`, { cls: "h-full w-full object-cover object-top transition duration-700 group-hover:scale-105", sizes: "(min-width:1024px) 40vw, 100vw" })}</div></div>`
    : `<div class="relative aspect-[16/10] overflow-hidden bg-ink">${img(shot, `${cs.title} project preview`, { cls: "h-full w-full object-cover object-top transition duration-700 group-hover:scale-105", sizes: "(min-width:1024px) 30vw, 100vw" })}</div>`}
  <div class="flex flex-1 flex-col p-6 sm:p-8 ${wide ? "lg:pl-4" : ""}">
    <div class="flex items-center justify-between gap-3">
      ${pill(cs.category, dark)}
      <span class="text-sm font-semibold ${dark ? "text-cream/60" : "text-ink/65"}">${esc(cs.period)}</span>
    </div>
    <h3 class="mt-5 font-display text-2xl font-bold leading-tight sm:text-3xl ${wide ? "lg:text-4xl" : ""}">${esc(cs.title)}</h3>
    <p class="mt-3 line-clamp-3 leading-relaxed ${wide ? "lg:text-lg" : ""} ${dark ? "text-cream/70" : "text-ink/70"}">${esc(cs.summary)}</p>
    <p class="mt-4 text-sm font-bold ${dark ? "text-rose" : "text-rose-ink"}">${esc(cs.impact)}</p>
    <div class="mt-auto flex items-end justify-between gap-4 pt-7">
      <div class="flex flex-wrap gap-1.5">${cs.tags.slice(0, 3).map((t) => pill(t, dark)).join("")}</div>
      ${arrowBtn(dark)}
    </div>
  </div>
</a>`;
}

function courseCard(c, dark) {
  const src = webp(c.images[0]);
  return `<article data-category="${esc(c.category)}"${c.preview ? " data-video" : ""} class="reveal group overflow-hidden transition duration-300 hover:-translate-y-1 ${dark ? "surface-dark hover:border-rose/60" : "surface hover:border-rose hover:shadow-[0_24px_60px_-28px_rgba(255,75,114,0.5)]"}">
  <a href="${c.demoUrl}" target="_blank" rel="noopener noreferrer" class="flex h-full flex-col" aria-label="${esc(c.title)}: view demo (opens in a new tab)">
    <div class="relative aspect-[16/10] overflow-hidden bg-ink">
      ${img(src, `${c.title} course preview`, { cls: "h-full w-full object-cover object-top transition duration-700 group-hover:scale-105", sizes: "(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw" })}
      ${c.preview ? `<video data-src="${c.preview}" class="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1"></video>` : ""}
      <span class="pill pill-rose absolute left-3 top-3">${esc(c.category)}</span>
    </div>
    <div class="flex flex-1 flex-col p-5 sm:p-6">
      <h3 class="font-display text-xl font-bold leading-snug">${esc(c.title)}</h3>
      <p class="mt-2 line-clamp-3 text-sm leading-relaxed ${dark ? "text-cream/70" : "text-ink/70"}">${esc(c.blurb)}</p>
      <div class="mt-4 flex flex-wrap gap-1.5">${c.tools.slice(0, 3).map((t) => pill(t, dark)).join("")}</div>
      <span class="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold ${dark ? "text-rose" : "text-rose-ink"}">View demo ${icon("external-link", "size-4")}</span>
    </div>
  </a>
</article>`;
}

/* ---------- pages ---------- */
function clientsStrip() {
  const logos = data.clients
    .map((c) => {
      const [w, h] = dims[c.logo];
      return `<li><img src="${c.logo}" alt="${esc(c.name)}" width="${w}" height="${h}" loading="lazy" style="height:${c.h}px;width:auto" class="opacity-80 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"></li>`;
    })
    .join("");
  return `<section aria-label="Clients and partners" class="mx-auto mt-4 max-w-[1320px] px-3 sm:px-6">
  <div class="surface flex flex-col items-center gap-6 px-6 py-8 sm:px-10 lg:flex-row lg:justify-between">
    <p class="eyebrow shrink-0 text-rose-ink">Clients &amp; Partners</p>
    <ul class="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">${logos}</ul>
  </div>
</section>`;
}

function home() {
  const SHOWCASE = ["brewing-the-perfect-cup", "cybersecurity-awareness", "effective-communication-skills", "office-ergonomics", "ai-fundamentals"];
  const slides = SHOWCASE.map((slug) => courses.find((c) => c.slug === slug));
  const slide = (c, i) => `<div data-slide class="transition-opacity duration-500 [grid-area:1/1]" ${i ? 'hidden aria-hidden="true" inert' : ""}>
            <div class="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-ink">
              <video ${i ? `data-src="${c.preview}"` : `data-autoplay autoplay src="${c.preview}"`} muted loop playsinline preload="${i ? "none" : "metadata"}" poster="${webp(c.images[0])}" class="h-full w-full object-cover" aria-label="Preview of the ${esc(c.title)} course"></video>
            </div>
            <div class="flex items-center justify-between gap-3 px-2 pb-1 pt-4">
              <div class="min-w-0">${pill(c.category)}<p class="mt-2 truncate font-display text-lg font-bold">${esc(c.title)}</p></div>
              <a href="${c.demoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-dark shrink-0 !px-4 !py-2.5">Live demo ${icon("arrow-up-right", "size-4")}</a>
            </div>
          </div>`;
  const stats = [
    [String(courses.length), "Interactive courses built"],
    [String(cases.length), "Client case studies"],
    ["2", "Authoring suites: Storyline 360 and Rise 360"],
  ];
  const hero = `<section class="px-3 pt-3 sm:px-6">
  <div class="slab mx-auto max-w-[1320px]">
    <div class="glow -right-24 -top-24 size-[440px] bg-rose/30"></div>
    <div class="glow -bottom-40 left-1/4 size-[380px] bg-rose-soft/20"></div>
    <div class="relative grid items-center gap-12 p-6 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:p-16 lg:pb-12">
      <div>
        <p class="pill pill-dark gap-2.5 !px-4 !py-1.5 text-sm">
          <span class="ping-dot relative inline-flex size-2.5"><span class="relative size-2.5 rounded-full bg-[#22c55e]"></span></span>
          Available for projects
        </p>
        <h1 class="mt-6 font-display text-[clamp(2.6rem,5.2vw,4.9rem)] font-extrabold leading-[1.02] text-cream">Building <span class="rot-word text-rose" data-rotate='${JSON.stringify(data.rotatingWords)}'>${data.rotatingWords[0]}</span> learning experiences.</h1>
        <p class="mt-6 max-w-xl text-lg leading-relaxed text-cream/75">${esc(S.summary)}</p>
        <div class="mt-9 flex flex-wrap gap-3">
          <a href="#work" class="btn btn-rose !px-7 !py-3.5">View case studies ${icon("arrow-right", "size-4")}</a>
          <a href="${mail}" class="btn btn-ghost-dark !px-7 !py-3.5">${icon("mail", "size-4")} Get in touch</a>
        </div>
      </div>
      <div class="relative mx-auto w-full max-w-md lg:max-w-none">
        <div data-carousel role="group" aria-roledescription="carousel" aria-label="Featured course previews" class="rounded-[28px] bg-white p-3 text-ink shadow-[0_40px_90px_-30px_rgba(255,75,114,0.45)] ring-1 ring-white/10">
          <div class="grid">${slides.map(slide).join("")}</div>
          <div class="flex items-center justify-center gap-0.5 pb-1 pt-2" role="group" aria-label="Choose a course preview">${slides.map((c, i) => `<button type="button" data-dot aria-label="Show ${esc(c.title)}" aria-current="${i ? "false" : "true"}" class="group grid size-6 place-items-center rounded-full"><span class="block h-2 rounded-full transition-all duration-300 group-hover:opacity-60 ${i ? "w-2 bg-ink/20" : "w-6 bg-rose"}"></span></button>`).join("")}</div>
        </div>
        <span class="pill pill-rose absolute -top-4 left-6 gap-1.5 !px-3.5 !py-2 text-sm shadow-xl">${icon("check", "size-4")} SCORM ready</span>
        <span class="pill absolute -bottom-4 right-10 gap-1.5 !bg-white !px-3.5 !py-2 text-sm shadow-xl">${icon("sparkles", "size-4 text-rose-ink")} Live demos</span>
      </div>
    </div>
    <dl class="relative grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 px-6 py-7 sm:px-10 lg:px-16 lg:py-9">
      ${stats.map(([n, l], i) => `<div class="${i ? "pl-4 sm:pl-8" : "pr-4"}"><dt class="font-display text-4xl font-extrabold text-cream sm:text-5xl">${n}</dt><dd class="mt-1 text-xs leading-snug text-cream/60 sm:text-sm">${l}</dd></div>`).join("")}
    </dl>
  </div>
</section>`;

  const work = `<section id="work" class="mx-auto max-w-[1320px] px-3 pt-24 sm:px-6">
  ${sectionHead({ eyebrow: "Case studies", title: "Selected engagements", text: "Client work across education, health, real estate and technology.", linkHref: "/work/", linkLabel: "All case studies" })}
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">${cases.map(caseCard).join("")}</div>
</section>`;

  const featured = [...courses.filter((c) => c.featured), ...courses.filter((c) => !c.featured && c.preview)].slice(0, 6);
  const coursesSec = `<section id="courses" class="px-3 pt-24 sm:px-6">
  <div class="slab mx-auto max-w-[1320px] p-6 sm:p-10 lg:p-14">
    <div class="glow -right-20 -top-20 size-[360px] bg-rose/20"></div>
    <div class="relative">
      ${sectionHead({ eyebrow: "Courses", title: "Courses I've built", text: "Interactive courses and microlearning in Storyline 360 and Rise 360, each with a live demo you can try.", linkHref: "/courses/", linkLabel: "All courses", dark: true })}
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${featured.map((c) => courseCard(c, true)).join("")}</div>
    </div>
  </div>
</section>`;

  const services = `<section id="services" class="mx-auto max-w-[1320px] px-3 pt-24 sm:px-6">
  ${sectionHead({ eyebrow: "Services", title: "What I can build for you", text: "From a single course to a full learning platform, designed and delivered end to end." })}
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    ${data.services
      .map(
        (s) => `<article class="reveal surface group p-7 transition duration-300 hover:-translate-y-1 hover:border-rose hover:shadow-[0_24px_60px_-28px_rgba(255,75,114,0.5)]">
      <span class="grid size-12 place-items-center rounded-2xl bg-blush-deep text-rose-ink transition duration-300 group-hover:bg-rose group-hover:text-ink">${icon(s.icon, "size-6")}</span>
      <h3 class="mt-6 font-display text-2xl font-bold leading-tight">${esc(s.title)}</h3>
      <p class="mt-3 leading-relaxed text-ink/70">${esc(s.text)}</p>
      <div class="mt-5 flex flex-wrap gap-1.5">${s.tags.map((t) => pill(t)).join("")}</div>
    </article>`
      )
      .join("")}
  </div>
</section>`;

  const coreSkills = ["Articulate Storyline 360", "Articulate Rise 360", "SCORM 1.2 / 2004", "xAPI", "LMS Integration", "Storyboarding", "Synthesia", "WCAG 2.1 / AODA"];
  const about = `<section id="about" class="mx-auto max-w-[1320px] px-3 pt-24 sm:px-6">
  <div class="grid gap-4 lg:grid-cols-[0.6fr_1.4fr]">
    <div class="reveal surface flex overflow-hidden p-3">
      ${img("/img/photo.webp", "Portrait of Manisha Gupta", { cls: "aspect-[4/5] w-full rounded-[18px] object-cover object-top lg:aspect-auto lg:h-full", sizes: "(min-width:1024px) 30vw, 100vw" })}
    </div>
    <div class="reveal surface flex flex-col justify-center p-7 sm:p-12">
      <span class="eyebrow text-rose-ink"><span class="size-1.5 rounded-full bg-rose"></span>About</span>
      <h2 class="mt-3 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl">Hi, I'm Manisha.</h2>
      <p class="mt-5 max-w-2xl text-lg leading-relaxed text-ink/75">${esc(S.summary)}</p>
      <ul class="mt-7 flex flex-wrap gap-1.5" aria-label="Core skills">${coreSkills.map((t) => `<li>${pill(t)}</li>`).join("")}</ul>
      <div class="mt-8 flex flex-wrap gap-3">
        <a href="/resume/" class="btn btn-dark">View resume ${icon("arrow-right", "size-4")}</a>
        <a href="${S.linkedin}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">${icon("linkedin", "size-4")} LinkedIn</a>
      </div>
    </div>
  </div>
</section>`;

  const ld = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Manisha Gupta",
    jobTitle: S.title,
    url: S.url,
    email: S.email,
    image: `${S.url}/img/photo.webp`,
    sameAs: [S.linkedin, S.github],
  })}</script>`;

  return layout({
    title: `${FULL} | ${S.title}`,
    desc: S.description,
    p: "/",
    ld,
    body: hero + clientsStrip() + work + coursesSec + services + about + ctaBlock(),
  });
}

function workIndex() {
  const body = `<section class="px-3 pt-3 sm:px-6">
  <div class="slab mx-auto max-w-[1320px] p-6 sm:p-10 lg:p-16">
    <div class="glow -right-20 -top-24 size-[400px] bg-rose/25"></div>
    <div class="relative max-w-3xl">
      <span class="pill pill-dark">Case studies</span>
      <h1 class="mt-6 font-display text-[clamp(2.6rem,6vw,5rem)] font-extrabold leading-[1.02] text-cream">Selected <span class="text-rose">engagements</span></h1>
      <p class="mt-6 max-w-xl text-lg leading-relaxed text-cream/70">Client work across education, health, real estate and technology. Open any project for the full story.</p>
    </div>
  </div>
</section>
<section class="mx-auto max-w-[1320px] px-3 pt-8 sm:px-6"><div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">${cases.map(caseCard).join("")}</div></section>
${ctaBlock()}`;
  return layout({ title: `Case studies | ${FULL}`, desc: "Selected client engagements in e-learning development, LMS implementation and curriculum design.", p: "/work/", body });
}

function caseDetail(cs, i) {
  const next = cases[(i + 1) % cases.length];
  const live = slugOk(cs.demoUrl);
  const shots = cs.screenshots.map(webp);
  const body = `<section class="px-3 pt-3 sm:px-6">
  <div class="slab mx-auto max-w-[1320px] p-6 sm:p-10 lg:p-16">
    <div class="glow -right-24 -top-24 size-[420px] bg-rose/25"></div>
    <div class="relative max-w-4xl">
      <a href="/work/" class="inline-flex items-center gap-2 text-sm font-bold text-cream/70 transition hover:text-rose"><span class="rotate-180">${icon("arrow-right", "size-4")}</span> All case studies</a>
      <p class="mt-8"><span class="pill pill-rose">${esc(cs.category)}</span></p>
      <h1 class="mt-5 font-display text-[clamp(2.6rem,6vw,5rem)] font-extrabold leading-[1.02] text-cream">${esc(cs.title)}</h1>
      <p class="mt-6 max-w-2xl text-lg leading-relaxed text-cream/75">${esc(cs.summary)}</p>
      <ul class="mt-8 flex flex-wrap gap-2">
        <li>${pill("Client: " + cs.client, true)}</li><li>${pill(cs.period, true)}</li><li>${pill(cs.role, true)}</li>
      </ul>
      ${live ? `<a href="${cs.demoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-rose mt-9">View live ${icon("arrow-up-right", "size-4")}</a>` : ""}
    </div>
  </div>
</section>
<section class="mx-auto max-w-[1320px] px-3 pt-4 sm:px-6">
  <div class="surface overflow-hidden p-3">${img(shots[0], `${cs.title} screenshot 1`, { eager: true, cls: "w-full rounded-[18px]", sizes: "(min-width:1320px) 1260px, 100vw" })}</div>
</section>
<section class="mx-auto max-w-[1320px] px-3 pt-4 sm:px-6">
  <div class="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
    <div class="surface p-7 sm:p-12">
      <h2 class="font-display text-3xl font-extrabold">Overview</h2>
      <p class="mt-4 text-lg leading-relaxed text-ink/75">${esc(cs.description)}</p>
      <h3 class="mt-10 font-display text-2xl font-bold">What I did</h3>
      <ul class="mt-5 space-y-3">${cs.highlights.map((h) => `<li class="flex gap-3 leading-relaxed text-ink/80"><span class="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-rose text-ink">${icon("check", "size-3.5")}</span>${esc(h)}</li>`).join("")}</ul>
    </div>
    <div class="flex flex-col gap-4">
      <div class="surface-dark p-7">
        <p class="eyebrow text-rose">Impact</p>
        <p class="mt-3 font-display text-2xl font-bold leading-snug">${esc(cs.impact)}</p>
      </div>
      <div class="surface p-7">
        <p class="eyebrow text-rose-ink">Tools &amp; tech</p>
        <div class="mt-4 flex flex-wrap gap-1.5">${cs.tools.map((t) => pill(t)).join("")}</div>
      </div>
      <div class="surface p-7">
        <p class="eyebrow text-rose-ink">Project details</p>
        <dl class="mt-4 space-y-3 text-sm">
          <div><dt class="text-ink/65">Client</dt><dd class="font-semibold">${esc(cs.client)}</dd></div>
          <div><dt class="text-ink/65">Role</dt><dd class="font-semibold">${esc(cs.role)}</dd></div>
          <div><dt class="text-ink/65">Year</dt><dd class="font-semibold">${esc(cs.period)}</dd></div>
        </dl>
      </div>
    </div>
  </div>
</section>
${shots.length > 1 ? `<section class="mx-auto max-w-[1320px] px-3 pt-4 sm:px-6"><div class="grid gap-4 md:grid-cols-2">${shots.slice(1).map((s, k) => `<div class="surface overflow-hidden p-3">${img(s, `${cs.title} screenshot ${k + 2}`, { cls: "w-full rounded-[18px]", sizes: "(min-width:768px) 50vw, 100vw" })}</div>`).join("")}</div></section>` : ""}
<section class="mx-auto max-w-[1320px] px-3 pt-4 sm:px-6">
  <a href="/work/${next.slug}/" class="group surface-dark flex items-center justify-between gap-6 p-7 transition duration-300 hover:border-rose/60 sm:p-10">
    <div><p class="eyebrow text-rose">Next case study</p><p class="mt-3 font-display text-3xl font-extrabold sm:text-4xl">${esc(next.title)}</p></div>
    ${arrowBtn(true)}
  </a>
</section>
${ctaBlock()}`;
  return layout({ title: `${cs.title} | Case study | Manisha Gupta`, desc: cs.summary, p: `/work/${cs.slug}/`, body });
}

function coursesPage() {
  const cats = ["Storyline 360", "Rise 360", "Storyboard", "Other Tools"].filter((c) => courses.some((x) => x.category === c));
  const btn = (label, v, on) =>
    `<button type="button" data-filter="${esc(v)}" aria-pressed="${on}" class="rounded-full border px-5 py-2.5 text-sm font-bold transition hover:border-rose hover:text-rose-ink ${on ? "border-transparent bg-rose text-ink" : "border-line bg-white"}">${esc(label)}</button>`;
  const body = `<section class="px-3 pt-3 sm:px-6">
  <div class="slab mx-auto max-w-[1320px] p-6 sm:p-10 lg:p-16">
    <div class="glow -right-20 -top-24 size-[400px] bg-rose/25"></div>
    <div class="relative max-w-3xl">
      <span class="pill pill-dark">Course library</span>
      <h1 class="mt-6 font-display text-[clamp(2.6rem,6vw,5rem)] font-extrabold leading-[1.02] text-cream">Courses I've <span class="text-rose">built</span></h1>
      <p class="mt-6 max-w-2xl text-lg leading-relaxed text-cream/70">Interactive courses, microlearning and design blueprints built across Articulate Storyline 360, Rise 360, Canva and Synthesia. Open any card to try the demo.</p>
    </div>
  </div>
</section>
<section class="mx-auto max-w-[1320px] px-3 pt-8 sm:px-6">
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex flex-wrap gap-2" role="group" aria-label="Filter courses">${btn("All", "all", true)}${cats.map((c) => btn(c, c, false)).join("")}</div>
    <p class="text-sm font-semibold text-ink/60" data-count aria-live="polite">${courses.length} courses</p>
  </div>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${courses.map((c) => courseCard(c, false)).join("")}</div>
</section>
${ctaBlock()}`;
  return layout({ title: "Courses | Manisha Gupta", desc: "Interactive e-learning courses built in Storyline 360 and Rise 360, with live demos.", p: "/courses/", body });
}

function resumePage() {
  const body = `<section class="px-3 pt-3 sm:px-6">
  <div class="slab mx-auto max-w-[1320px] p-6 sm:p-10 lg:p-16">
    <div class="glow -right-20 -top-24 size-[400px] bg-rose/25"></div>
    <div class="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-3xl">
        <span class="pill pill-dark">Resume</span>
        <h1 class="mt-6 font-display text-[clamp(2.6rem,6vw,5rem)] font-extrabold leading-[1.02] text-cream">${esc(S.name)}</h1>
        <p class="mt-3 text-xl font-semibold text-rose">${esc(S.title)}</p>
        <ul class="mt-6 flex flex-wrap gap-3">
          <li><a class="pill pill-dark !px-4 !py-2 text-sm transition hover:border-rose hover:text-rose" href="${mail}">${icon("mail", "size-4")} ${esc(S.email)}</a></li>
          <li><a class="pill pill-dark !px-4 !py-2 text-sm transition hover:border-rose hover:text-rose" href="${S.linkedin}" target="_blank" rel="noopener noreferrer">${icon("linkedin", "size-4")} LinkedIn</a></li>
          <li><a class="pill pill-dark !px-4 !py-2 text-sm transition hover:border-rose hover:text-rose" href="${S.github}" target="_blank" rel="noopener noreferrer">${icon("github", "size-4")} GitHub</a></li>
        </ul>
      </div>
      ${hasPdf ? `<a href="/Manisha-Gupta-Resume.pdf" class="btn btn-rose shrink-0" download>${icon("download", "size-4")} Download PDF</a>` : ""}
    </div>
  </div>
</section>
<section class="mx-auto max-w-[1320px] px-3 pt-4 sm:px-6">
  <div class="surface p-7 sm:p-12">
    <h2 class="font-display text-3xl font-extrabold">Summary</h2>
    <p class="mt-4 max-w-3xl text-lg leading-relaxed text-ink/75">${esc(S.summary)}</p>
  </div>
</section>
<section class="mx-auto max-w-[1320px] px-3 pt-4 sm:px-6" aria-labelledby="exp">
  <h2 id="exp" class="px-2 pb-4 pt-8 font-display text-3xl font-extrabold">Experience</h2>
  <div class="grid gap-4">
    ${data.experience
      .map(
        (e) => `<article class="reveal surface p-7 sm:p-10">
      <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div><h3 class="font-display text-2xl font-bold">${esc(e.role)}</h3><p class="mt-1 font-semibold text-rose-ink">${esc(e.company)}</p></div>
        ${pill(e.period)}
      </div>
      <ul class="mt-5 space-y-2.5">${e.bullets.map((b) => `<li class="flex gap-3 leading-relaxed text-ink/80"><span class="mt-2.5 size-1.5 shrink-0 rounded-full bg-rose"></span>${esc(b)}</li>`).join("")}</ul>
    </article>`
      )
      .join("")}
  </div>
</section>
<section class="mx-auto max-w-[1320px] px-3 pt-4 sm:px-6" aria-labelledby="skills">
  <h2 id="skills" class="px-2 pb-4 pt-8 font-display text-3xl font-extrabold">Skills</h2>
  <div class="grid gap-4 md:grid-cols-2">
    ${data.skills.map((g) => `<div class="reveal surface p-7"><h3 class="text-xs font-bold uppercase tracking-[0.14em] text-ink/65">${esc(g.group)}</h3><div class="mt-4 flex flex-wrap gap-1.5">${g.items.map((t) => pill(t)).join("")}</div></div>`).join("")}
  </div>
</section>
${ctaBlock()}`;
  return layout({ title: "Resume | Manisha Gupta", desc: `Resume of ${S.name}, ${S.title}.`, p: "/resume/", body });
}

function notFound() {
  const body = `<section class="px-3 pt-3 sm:px-6">
  <div class="slab mx-auto max-w-[1320px] px-6 py-24 text-center sm:py-32">
    <div class="glow left-1/2 -top-24 size-[420px] -translate-x-1/2 bg-rose/25"></div>
    <div class="relative">
      <p class="font-display text-[clamp(5rem,16vw,11rem)] font-extrabold leading-none text-rose">404</p>
      <h1 class="mt-4 font-display text-3xl font-extrabold text-cream sm:text-4xl">This page doesn't exist.</h1>
      <p class="mx-auto mt-4 max-w-md text-cream/70">The link may be old or mistyped. Let's get you back on track.</p>
      <div class="mt-8 flex flex-wrap justify-center gap-3"><a href="/" class="btn btn-rose">Back to home</a><a href="/courses/" class="btn btn-ghost-dark">Browse courses</a></div>
    </div>
  </div>
</section>`;
  return layout({ title: "Page not found | Manisha Gupta", desc: "Page not found.", p: "/404", body, noindex: true });
}

/* ---------- write everything ---------- */
write("index.html", home());
write("work/index.html", workIndex());
cases.forEach((cs, i) => write(`work/${cs.slug}/index.html`, caseDetail(cs, i)));
write("courses/index.html", coursesPage());
write("resume/index.html", resumePage());
write("404.html", notFound());

fs.mkdirSync(path.join(ROOT, "assets"), { recursive: true });
fs.copyFileSync(path.join(ROOT, "src/site.js"), path.join(ROOT, "assets/site.js"));

const urls = ["/", "/work/", ...cases.map((c) => `/work/${c.slug}/`), "/courses/", "/resume/"];
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${S.url}${u}</loc></url>`).join("\n")}\n</urlset>\n`
);
write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${S.url}/sitemap.xml\n`);
write(
  "favicon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#0f0f12"/><text x="32" y="45" text-anchor="middle" font-family="Outfit,Arial,sans-serif" font-weight="800" font-size="38" fill="#fff3f5">M<tspan fill="#ff4b72">.</tspan></text></svg>\n`
);
console.log(`Built ${urls.length + 1} pages (${hasPdf ? "with" : "without"} resume PDF).`);
