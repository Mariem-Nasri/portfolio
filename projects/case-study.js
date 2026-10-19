import { projects } from "./project-data.js";

const key = document.body.dataset.project;
const project = projects[key];
if (!project) throw new Error(`Unknown project case study: ${key}`);

const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const prior = Object.keys(projects);
const index = prior.indexOf(key);
const previous = projects[prior[(index - 1 + prior.length) % prior.length]];
const next = projects[prior[(index + 1) % prior.length]];
const hasResults = project.metrics.length > 0 || Boolean(project.results);

function architectureMarkup(kind) {
  const node = (title, note = "") => `<div class="arch-node"><strong>${esc(title)}</strong>${note ? `<small>${esc(note)}</small>` : ""}</div>`;
  if (kind === "docai") return `<div class="architecture-canvas docai-architecture" role="img" aria-label="DocAI flow from scanned agreement through OCR, five extraction agents, validation, and structured results">
    <div class="arch-input">${node("Scanned financial agreement", "Document input")}</div><span class="arch-arrow">→</span>
    <div class="arch-ocr">${node("GLM-OCR", "OCR benchmark winner")}<span>Recognized text</span></div><span class="arch-arrow">→</span>
    <div class="arch-agents"><b>Five agents extract fields</b><div class="agent-orbit">${[1,2,3,4,5].map(n=>`<span>Agent 0${n}</span>`).join("")}</div><small>Dynamic field extraction</small></div><span class="arch-arrow">→</span>
    <div class="arch-output">${node("Validate fields", "Review and check extracted values")}${node("Structured result", "Reliable JSON output")}</div>
  </div>`;
  if (kind === "candidate") return `<div class="architecture-canvas candidate-architecture" role="img" aria-label="Candidate screening flow compares resume and job description, ranks semantic matches, generates grounded feedback, and hands results to a recruiter">
    <div class="candidate-inputs"><b>Documents</b>${node("Resume", "Experience and skills")}${node("Job description", "Role requirements")}</div><span class="arch-arrow">→</span>
    <div class="candidate-engine">${node("Content processing", "Extract role and candidate context")}${node("Semantic matching", "Compare relevant meaning")}</div><span class="arch-arrow">→</span>
    <div class="candidate-results">${node("Candidate ranking", "Contextual match order")}${node("RAG feedback", "Section-level, role-grounded notes")}${node("Recruiter review", "Human-in-the-loop decision")}</div>
  </div>`;
  if (kind === "farm") return `<div class="architecture-canvas farm-architecture" role="img" aria-label="FarmWise processes soil properties, weather, and previous crops; GCN and LSTM representations combine to inform a crop prediction">
    <div class="farm-inputs"><b>Real collected &amp; cleaned data</b><div>${node("Soil properties")}${node("Weather")}${node("Previous crops")}</div></div><div class="farm-prep">${node("Prepared field and season data")}</div>
    <div class="farm-models"><div>${node("GCN", "Soil and field relationships")}${node("LSTM", "Weather and crop sequence")}</div><span class="arch-arrow">→</span>${node("Combined model", "Spatial + seasonal signals")}</div>
    <div class="farm-result">${node("Next crop prediction", "Rotation recommendation")}</div>
  </div>`;
  if (kind === "drone") return `<div class="architecture-canvas drone-architecture" role="img" aria-label="Drone inspection video is sampled into frames, YOLOv12 detects pipeline anomalies, SORT tracks identities, and trajectory estimates inform future path prediction">
    ${node("Drone inspection video", "Live footage")}<span class="arch-arrow">→</span>${node("Frame extraction", "Video stream · ~30 FPS")}<span class="arch-arrow">→</span>${node("YOLOv12", "Cracks · leaks · puddles")}<span class="arch-arrow">→</span>${node("SORT tracking", "Identity continuity · smooth paths")}<span class="arch-arrow">→</span>${node("Trajectory estimate", "Future pipeline path")}
  </div>`;
  throw new Error(`Unknown project architecture: ${kind}`);
}

function projectVideo(item, i) {
  const heading = item?.label || "Project walkthrough";
  if (item?.frame) return `<article class="media-item"><h3>${esc(heading)}</h3><div class="video-frame demo-frame"><iframe src="${esc(item.frame)}" title="${esc(item.title)}" loading="lazy" allow="fullscreen"></iframe></div><p class="video-caption">${esc(item.caption)}</p></article>`;
  if (!item?.src) return `<article class="media-item"><h3>${esc(heading)}</h3><div class="video-frame" data-video-frame><video controls playsinline preload="none" aria-label="${esc(project.shortTitle)} project walkthrough" hidden></video><div class="video-placeholder is-visible"><span class="play-mark" aria-hidden="true">▶</span><p>Project walkthrough</p><small>Video will appear here when added</small></div></div><p class="video-caption">Add a project video by updating this project’s videos entry in project-data.js.</p></article>`;
  return `<article class="media-item"><h3>${esc(heading)}</h3><div class="video-frame" data-video-frame><video controls playsinline preload="metadata" aria-label="${esc(project.shortTitle)} ${esc(heading)}" hidden></video><div class="video-placeholder is-visible"><span class="play-mark" aria-hidden="true">▶</span><p>${esc(heading)}</p><small>Loading video preview</small></div></div><p class="video-caption">${esc(item.caption || "")}</p></article>`;
}

document.title = `${project.title} — Mariem Nasri`;
document.querySelector('meta[name="description"]').content = project.description;
document.querySelector("#case-study").innerHTML = `
  <header class="case-nav"><a href="../index.html#work" class="case-back">← <span>Selected work</span></a><a class="case-monogram" href="../index.html">MN<span>.</span></a><span class="case-count">CASE STUDY&nbsp; / &nbsp;${String(index + 1).padStart(2,"0")}</span></header>
  <main>
    <section class="case-hero">
      <div class="case-intro"><p class="eyebrow">${esc(project.category)}</p><p class="case-role">${esc(project.role)}</p><h1>${esc(project.title)}</h1><p class="case-description">${esc(project.description)}</p><div class="case-tags">${project.tags.map((tag) => `<span>${esc(tag)}</span>`).join("")}</div><div class="case-actions">${project.links.map((link) => `<a class="case-action" href="${esc(link.href)}" target="_blank" rel="noopener noreferrer">${esc(link.label)} ↗</a>`).join("")}<a class="case-action quiet" href="../index.html#work">All projects</a></div></div>
      <div class="case-art case-art-${esc(project.visual)}" aria-label="${esc(project.shortTitle)} project visual"><div class="art-index">MN&nbsp; / &nbsp;${String(index + 1).padStart(2,"0")}</div><div class="art-label">${esc(project.shortTitle)}</div><div class="art-flow">${project.workflow.map((step, i) => `<span>${esc(step)}</span>${i < project.workflow.length - 1 ? '<i aria-hidden="true">↓</i>' : ''}`).join("")}</div></div>
    </section>
    <section class="case-video" aria-labelledby="video-title"><div class="section-label"><span>01</span><h2 id="video-title">See it in action</h2></div><div class="media-grid">${(project.videos?.length ? project.videos.map(projectVideo) : project.demoFrame ? [projectVideo({ frame: project.demoFrame, label: "Interactive inspection scene", title: "Illustrative drone inspection scene", caption: "Illustrative visualization built in this portfolio; it is not recorded inspection footage." }, 0)] : [projectVideo(null, 0)]).join("")}</div></section>
    <section class="case-section case-overview"><div class="section-label"><span>02</span><h2>Overview</h2></div><div><p class="case-lead">${esc(project.overview)}</p><p class="case-note">Designed to make a complex workflow easier to inspect, understand, and use.</p></div></section>
    <section class="case-section architecture-section"><div class="section-label"><span>03</span><h2>System architecture</h2></div><div>${architectureMarkup(project.architecture)}<p class="diagram-caption">Data flow based on documented components and implementation notes.</p></div></section>
    <section class="case-section"><div class="section-label"><span>04</span><h2>Technical notes</h2></div><div class="deep-dive">${project.deepDive.map(([heading, body], i) => `<article><span>0${i + 1}</span><div><h3>${esc(heading)}</h3><p>${esc(body)}</p></div></article>`).join("")}</div></section>
    ${hasResults ? `<section class="case-section results-section"><div class="section-label"><span>05</span><h2>Results &amp; evaluation</h2></div><div>${project.metrics.length ? `<div class="metric-cards">${project.metrics.map(({value,label}) => `<div><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`).join("")}</div>${project.resultsNote ? `<p class="case-note">${esc(project.resultsNote)}</p>` : ""}` : `<p class="case-lead">${esc(project.results)}</p>`}</div></section>` : ""}
    <section class="case-section challenges-section"><div class="section-label"><span>${hasResults ? "06" : "05"}</span><h2>Challenges &amp; perspectives</h2></div><div class="challenge-columns"><section><h3>Challenges</h3><ul>${(project.challenges || []).map(item=>`<li>${esc(item)}</li>`).join("")}</ul></section><section><h3>Perspectives</h3><ul>${(project.perspectives || []).map(item=>`<li>${esc(item)}</li>`).join("")}</ul></section></div></section>
    <section class="case-section explore-section"><div class="section-label"><span>${hasResults ? "07" : "06"}</span><h2>Explore further</h2></div><div><p class="case-lead">Interested in the details? Get in touch or explore the available project resources.</p><div class="case-actions">${project.links.map((link) => `<a class="case-action" href="${esc(link.href)}" target="_blank" rel="noopener noreferrer">${esc(link.label)} ↗</a>`).join("")}<a class="case-action" href="mailto:mariem.nasri773@gmail.com">Contact Mariem ↗</a></div></div></section>
  </main>
  <nav class="case-pagination" aria-label="Project navigation"><a href="${prior[(index - 1 + prior.length) % prior.length]}.html"><small>PREVIOUS PROJECT</small><strong>${esc(previous.shortTitle)} ←</strong></a><a href="../index.html#work" class="pagination-home">Back to all work</a><a href="${prior[(index + 1) % prior.length]}.html"><small>NEXT PROJECT</small><strong>→ ${esc(next.shortTitle)}</strong></a></nav>
  <footer class="case-footer"><a href="../index.html">MN<span>.</span></a><span>AI &amp; Data Science Engineer</span><span>© ${new Date().getFullYear()} Mariem Nasri</span></footer>`;

document.querySelectorAll("[data-video-frame]").forEach((frame, i) => {
  const video = frame.querySelector("video");
  const placeholder = frame.querySelector(".video-placeholder");
  const source = project.videos?.[i]?.src;
  if (!source) return;
  video.src = source;
  video.hidden = false;
  video.addEventListener("error", () => { video.hidden = true; placeholder.classList.add("is-visible"); });
  video.addEventListener("loadedmetadata", () => { placeholder.classList.remove("is-visible"); });
});
