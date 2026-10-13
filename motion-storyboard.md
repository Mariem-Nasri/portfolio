# Portfolio micro-motion storyboard

Motion should make Mariem's identity and AI workflows easier to read. The frames below describe short web interactions, not a separate video.

| # | Time / trigger | Shot size | Camera / reason | Composition | Key motion | Transition | Review frame |
|---|---|---|---|---|---|---|---|
| 01 | 0.0–1.1s after first paint | Wide hero | Locked frame; let the large name and portrait carry the first impression | Left 53%: name and credential; right 42%: portrait. Background holds warm paper; olive second name anchors the eye; the small gold ring stays in the foreground. | Name rises in two beats; portrait reveals upward with a restrained 1.04× settle. | Natural scroll carries the gold portrait frame into the olive expertise strip. | 0.0s, 0.7s |
| 02 | When expertise strip enters view | Medium-wide | Locked frame; keep the four expertise labels legible as a set | Four equal columns span the olive band; pale dividers recede behind each label. | Each number and label lifts in with a 70ms stagger. | The final divider points down into the first project question. | Entry, settled |
| 03 | When a project diagram enters view | Detail | Locked frame; the process diagram is the subject, so no artificial camera move | Diagram occupies 100% of its card; flow moves left to right from source material to an evaluated or recommended outcome. | One soft scan sweeps across the document workflow; the drone target breathes once; model nodes draw a short connecting line. | The sweep resolves at the result label, then the next card remains still until it enters view. | Entry, result |

All motion is CSS driven, pauses outside the viewport where it loops, and is removed for `prefers-reduced-motion`. The page content remains complete without animation.
