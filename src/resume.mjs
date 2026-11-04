// Builds a one-page resume PDF from src/data.json (same content as the website's resume page).
// Usage: node src/resume.mjs <output.pdf>
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import os from "node:os";

const ROOT = path.resolve(import.meta.dirname, "..");
const d = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data.json"), "utf8"));
const out = path.resolve(process.argv[2] || "resume.pdf");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const S = d.site;
const projectSlugs = ["manns-and-associates", "abitare-life", "realtors-one-voice-one-vote", "deel-engage"];
const EXTRA = {
  "E-Learning Tools & Standards": ["Animaker", "Vyond", "Canva"],
  "LMS Platforms & Administration": ["LMS Administration", "Course Publishing & Deployment", "LMS User Support & Troubleshooting"],
  "Web & Software": ["WordPress", "Wix"],
};
const ICON = {
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  phone: '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>',
  mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
};
const ic = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="#c9264a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${ICON[n]}</svg>`;
const iconLink = (n, label, href) => `<span class="ico"><a href="${href}" aria-label="${esc(label)}" title="${esc(label)}">${ic(n)}</a></span>`;
const item = (n, text, href) => `<span>${ic(n)}${href ? `<a href="${href}">${esc(text)}</a>` : esc(text)}</span>`;
const projects = projectSlugs.map((s) => d.caseStudies.find((c) => c.slug === s));

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Manisha Gupta - Resume</title>
<style>
@page{size:A4;margin:0}html{background:#fff}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,Helvetica,sans-serif;color:#0f0f12;font-size:9.2pt;line-height:1.42;width:210mm;height:297mm;padding:13mm 15mm 11mm;position:relative}
body:before{content:"";position:absolute;left:0;top:0;right:0;height:5mm;background:#0f0f12}
body:after{content:"";position:absolute;left:0;top:5mm;width:34mm;height:1.1mm;background:#ff4b72}
h1{font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:25pt;letter-spacing:0;line-height:1.05;margin-top:3mm}
.role{font-family:Arial,Helvetica,sans-serif;font-weight:600;font-size:12pt;color:#c9264a;margin-top:1mm}
.contact{margin-top:2.2mm;color:#3a3a40;font-size:8.8pt}
.c2{margin-top:.6mm}.contact span{white-space:nowrap;display:inline-flex;align-items:center;gap:1.4mm}.contact svg{width:3.3mm;height:3.3mm}.contact .ico svg{width:4.4mm;height:4.4mm}.contact a{color:inherit;text-decoration:none}.contact span+span:before{content:"|";margin:0 2.2mm;color:#c9b0b8}
h2{font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:9.5pt;letter-spacing:.09em;text-transform:uppercase;margin:4.4mm 0 1.8mm;padding-bottom:1mm;border-bottom:.3mm solid #f3d7de;color:#0f0f12}
.job{margin-bottom:2.8mm}
.row{display:flex;justify-content:space-between;align-items:baseline;gap:6mm}
.title{font-weight:700;font-size:9.8pt}
.company{color:#c9264a;font-weight:600}
.date{font-size:8.6pt;color:#4a4a52;white-space:nowrap;font-weight:600}
ul{margin:1mm 0 0 4mm}li{margin-bottom:.7mm}
.proj{margin-bottom:1.6mm}.proj b{font-weight:700}
.skill{margin-bottom:1.1mm}.skill b{font-weight:700}
</style></head><body>
<h1>${esc(S.name.replace("G.", "Gupta").replace("Manisha ", "MANISHA ").toUpperCase())}</h1>
<p class="role">${esc(S.title)}</p>
<p class="contact">${item("pin", "Bengaluru, India")}${item("phone", "+91 8120768008", "tel:+918120768008")}${item("mail", S.email, "mailto:" + S.email)}${iconLink("linkedin", "Manisha on LinkedIn", S.linkedin)}${item("globe", "manishag.tech", S.url)}</p>

<h2>Summary</h2><p>${esc(S.summary)}</p>

<h2>Work Experience</h2>
${d.experience.map((e) => `<div class="job"><div class="row"><div><span class="title">${esc(e.role)}</span> <span class="company">| ${esc(e.company)}</span></div><div class="date">${esc(e.period)}</div></div><ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul></div>`).join("")}

<h2>Selected Projects</h2>
${projects.map((p) => `<p class="proj"><b>${esc(p.title)}</b> (${esc(p.category)}, ${esc(p.period)}): ${esc(p.summary)} <i>${esc(p.impact)}.</i></p>`).join("")}

<h2>Skills</h2>
${[...d.skills.map((g) => ({ group: g.group, items: [...g.items.map((i) => (i === "Docebo" ? "Docebo (familiar)" : i)), ...(EXTRA[g.group] || [])] })), { group: "Tools & Platforms", items: ["Trello", "Asana", "MS Office", "SharePoint", "Adobe Premiere"] }].map((g) => `<p class="skill"><b>${esc(g.group)}:</b> ${esc(g.items.join(", "))}</p>`).join("")}

</body></html>`;

const tmp = path.join(os.tmpdir(), "resume-build.html");
fs.writeFileSync(tmp, html);
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=8000", `--print-to-pdf=${out}`, `file://${tmp}`], { stdio: "ignore" });
console.log("wrote", out);
