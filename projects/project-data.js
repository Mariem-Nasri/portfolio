// Case study content, custom architecture types, and media sources live here.
// Add or change entries in `videos` to point at local files relative to each page.
export const projects = {
  docai: {
    title: "AI for Document Intelligence", shortTitle: "DocAI", category: "Document AI · Internship project", role: "Data Science Intern · VERMEG · 2026",
    description: "A document intelligence pipeline that turns scanned financial agreements into structured, reviewable information.",
    tags: ["GLM-OCR", "LLM agents", "FastAPI", "React", "Keycloak", "Docker", "Ollama", "Prometheus", "Grafana"],
    videos: [{ src: "../videos/docai_.mp4", label: "Project walkthrough", caption: "DocAI results and workflow demonstration." }], architecture: "docai",
    overview: "Financial agreements arrive as scanned pages, where important terms are difficult to reuse as data. DocAI combines OCR with five LLM agents to turn document content into structured fields. The application was built with data residency in mind, using local Ollama inference.",
    workflow: ["Scanned agreement", "GLM-OCR text", "Five agents extract fields", "Structured fields"],
    deepDive: [["OCR benchmarking", "Five OCR approaches were benchmarked, with GLM-OCR selected for the reported evaluation."], ["Agent workflow", "Five LLM agents handle dynamic field extraction and validation, returning structured results."], ["Application", "FastAPI and React connect the workflow to an application with Keycloak authentication. Docker supports containerized deployment; Prometheus and Grafana provide monitoring."], ["Inference runtime", "vLLM and SGLang were considered first. Local resource limitations led to using Ollama for local inference."]],
    metrics: [{ value: "~93%", label: "Documents read correctly" }, { value: "~98.4%", label: "Tables rebuilt correctly" }, { value: "2", label: "Banking & insurance domains" }, { value: "24/7", label: "Performance, cost & log dashboards" }, { value: "7.32%", label: "OCR character error rate" }, { value: "0.754", label: "TEDS benchmark" }],
    resultsNote: "The supplied project results slide describes a running, tested system, with performance, cost, and log dashboards. OCR benchmarking also reports 7.32% character error rate and 0.754 TEDS.",
    challenges: ["A 4 GB GPU limit prevented local OCR and required cloud OCR.", "Producing reliable JSON with a quantized 7B model.", "Extensive prompt engineering to reduce hallucinations."],
    perspectives: ["Run local OCR on a system with more GPU memory.", "Adapt a VLM to VERMEG’s document collection.", "Explore adaptive agent routing that learns over time."],
    links: [{ label: "Mariem’s GitHub profile", href: "https://github.com/Mariem-Nasri" }],
    visual: "document"
  },
  "candidate-screening": {
    title: "Candidate Screening Agent", shortTitle: "Candidate screening", category: "Recruitment AI · Personal project", role: "Project role not specified in the portfolio materials",
    description: "A recruitment workflow for comparing resumes with job descriptions and giving recruiters contextual feedback on resume sections.",
    tags: ["LLMs", "RAG", "Semantic matching"], previewVideo: "resume_vid/a_Animate_this_exact_s.mp4", videos: [{ src: "../videos/resume.mp4", label: "Candidate screening demo", caption: "Demo video supplied in the videos folder." }], architecture: "candidate",
    overview: "Recruiters need to compare candidate experience with role requirements without reducing a resume to a keyword count. This project processes resumes and job descriptions, uses semantic matching to support ranking, and generates feedback grounded in role context. The workflow supports recruiter review rather than making a hiring decision automatically.",
    workflow: ["Resume + job description", "Content processing", "Semantic matching", "Ranked candidates", "Grounded feedback + review"],
    deepDive: [["Document inputs", "The workflow takes resumes and job descriptions as its matching inputs."], ["Matching", "Semantic matching is used to compare candidate information with the role context and support candidate ranking."], ["Feedback agent", "An LLM agent uses retrieval augmented generation (RAG) to give feedback tied to resume sections."], ["Human review", "Recruiters review the context and decide what to do with the ranking and feedback."]],
    metrics: [], challenges: ["Evaluation dataset, ranking metrics, and feedback quality measurements are not documented in the current project notes."], perspectives: ["Future directions are not documented in the current project notes."],
    links: [{ label: "Mariem’s GitHub profile", href: "https://github.com/Mariem-Nasri" }], visual: "candidate"
  },
  farmwise: {
    title: "FarmWise — Intelligent Crop Rotation", shortTitle: "FarmWise", category: "Agricultural decision support · Personal project", role: "Project role not specified in the portfolio materials",
    description: "A crop planning platform for Tunisia that uses a hybrid GCN–LSTM approach to recommend crop rotations.",
    tags: ["GCN–LSTM", "Django", "Recommendation systems"], videos: [{ src: "../videos/Farmwise.mp4", label: "FarmWise demo", caption: "Project demo supplied in the videos folder." }],
    overview: "Crop choices are linked across seasons: the crops already grown and the relationships between fields matter when planning what comes next. FarmWise is an agricultural decision support platform for crop planning in Tunisia. The project uses real agricultural data that was collected and cleaned, and combines soil relationships with previous crop sequences to recommend rotations through a Django application.",
    workflow: ["Soil + crop history", "Prepared agricultural data", "GCN: soil relationships", "LSTM: crop sequence", "Next crop recommendation"], architecture: "farm",
    deepDive: [["Data context", "The project worked with real agricultural data that was collected and cleaned, including soil properties, weather, and previous crops."], ["Hybrid model", "The GCN–LSTM approach combines relationships in soil data with temporal information from crop sequences."], ["Prediction", "Crop rotation predictions are based on soil properties, weather, and previous crops."], ["Application", "A Django application presents the crop planning system."]],
    metrics: [], challenges: ["Unpredictable weather.", "Radical changes in field conditions.", "Natural catastrophes."], perspectives: ["Future directions are not documented in the current project notes."],
    results: "Predictions were validated by agricultural professionals and against reference databases.",
    links: [{ label: "Mariem’s GitHub profile", href: "https://github.com/Mariem-Nasri" }], visual: "farm"
  },
  "drone-inspection": {
    title: "Drone Inspection: Object Detection & Tracking", shortTitle: "Drone inspection", category: "Computer vision · Internship project", role: "AI Intern · FARNESS UAV SOFTWARE · 2025",
    description: "A video pipeline for detecting and tracking pipeline cracks, leaks, and puddles in drone inspections.",
    tags: ["YOLOv12", "SORT", "Computer vision", "Video pipeline"], videos: [], demoFrame: "../drone_vid/dist/index.html",
    overview: "Industrial pipeline inspection requires finding localized anomalies across moving aerial footage. The project uses YOLOv12 to detect cracks, leaks, and puddles, then uses SORT to maintain object identities and estimate trajectories in drone footage.",
    workflow: ["Drone video", "Video frames", "YOLOv12 detection", "SORT tracking", "Predicted pipeline path"], architecture: "drone",
    deepDive: [["Detection", "YOLOv12 detects pipeline cracks, leaks, and puddles in drone video."], ["Tracking", "SORT maintains object identities through the video, smooths trajectories, and supports estimating future pipeline paths."], ["Integration", "Object detection and SORT tracking run in an approximately 30 FPS inspection pipeline."], ["Visual evidence", "The embedded drone scene is an illustrative project visualization, not recorded inspection footage."]],
    metrics: [{ value: "~91%", label: "Precision" }, { value: "~86%", label: "Recall" }, { value: "~89%", label: "mAP@50" }, { value: "~30", label: "Frames per second" }],
    challenges: ["Dataset harmonization and class balancing.", "Visually similar anomalies.", "Tracking discontinuities caused by occlusions and overlapping structures."],
    perspectives: ["Explore tracking methods that use visual appearance.", "Improve reliability in complex inspection environments.", "Advance trajectory prediction for autonomous UAV navigation."],
    links: [{ label: "Mariem’s GitHub profile", href: "https://github.com/Mariem-Nasri" }], visual: "drone"
  }
};
