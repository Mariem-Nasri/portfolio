# Case study demos

The case study media is configured centrally in [`projects/project-data.js`](../../projects/project-data.js). Each project can have one or more entries in its `videos` array. Each entry sets a page-relative `src`, display `label`, and optional `caption`.

Current demos are linked directly from their existing folders:

- DocAI: `videos/docai_.mp4`
- Candidate screening homepage card preview: `resume_vid/a_Animate_this_exact_s.mp4`
- Candidate screening case study demo: `videos/resume.mp4`
- FarmWise: `videos/Farmwise.mp4`
- Drone inspection: `drone_vid/dist/index.html` is embedded as an interactive illustrative scene, not a recorded video.
- Product management: no matching video file was present, so its page keeps the designed placeholder.

The native player uses controls and falls back to its placeholder if a configured file is missing. Add new media under the repository root or a subfolder and update the corresponding `videos` entry. Avoid copying large files when a relative path to an existing project asset will work.
