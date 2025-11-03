# AI Try-On Experience Requirements

## 1. User Journey: Favorites to Try-On

1. **Favorites Entry Point**
   - Shopper taps the "Favorites" icon from the main navigation or the persistent heart badge on the product grid.
   - Favorites hub presents saved wig styles sorted by most recently added, with filter chips for length, texture, and colorway.
   - CTA: "Try-On Wig" button persists in the sticky footer.

2. **Wig Selection**
   - Shopper selects one or more wig styles; selection state confirmed with a checkmark badge and summary pill in the footer.
   - System displays compatibility hints (e.g., "Pairs with natural curls", "Matches warm undertones") pulled from product metadata.
   - Shopper taps "Try-On Selected" to proceed.

3. **Face Capture**
   - If a profile already exists, shopper sees a quick preview with option to reuse or update.
   - If not, shopper is prompted to upload or capture a front-facing portrait that clearly shows hairline and shoulders. Guidance cards detail pose, lighting, and background requirements.
   - Privacy notice and consent checkbox must be acknowledged before upload.

4. **Asset Upload & Verification**
   - Shopper uploads image (JPG/PNG, max 15 MB). Progress indicator with percentage and estimated time shows upload status.
   - Automatic quality checks validate face framing, resolution, and background. Errors trigger inline messaging with retry option.
   - Once validated, shopper confirms the image and continues.

5. **Try-On Processing**
   - System pairs selected wigs with the shopper's portrait and queues rendering, preserving the original outfit and facial features.
   - Real-time status updates: "Preparing", "Rendering", "Finalizing" with optional tips (e.g., "Rendering typically takes ~12 seconds").
   - Shopper may explore the favorites carousel while waiting.

6. **Preview & Interaction**
   - Rendered hairstyle appears in a full-height preview panel with zoom and rotate controls.
   - Favorites carousel persists beneath preview for quick swapping of wigs.
   - Shopper can toggle between selected wigs, apply alternate color variants, and capture snapshots to share.

7. **Decision & Follow-Up**
   - CTA buttons: "Add Wig to Bag", "Save Look", "Share".
   - Post-experience survey modal prompts for hairstyle realism feedback (1–5 scale) and comments.
   - Event logging updates engagement metrics and suggests recommended wigs based on the try-on session.

## 2. Wireframe Overview (Figma)

Create the following frames in Figma to visualize the core interactions:

1. **Favorites Hub**
   - Top nav with back button and screen title.
   - Grid of saved wig styles with heart badges and multi-select checkboxes.
   - Sticky footer with wig count and primary "Try-On Selected" CTA.

2. **Upload & Guidance**
   - Instructional panel with bullet guidance.
   - Drag-and-drop upload zone + secondary "Capture Photo" button.
   - Privacy consent toggle and progress loader component.

3. **Processing State**
   - Full-width status panel showing step indicator (Preparing → Rendering → Finalizing).
   - Inline tips and estimated time text.
   - Mini favorites carousel allowing browsing during processing.

4. **Preview & Carousel**
   - Large rendered portrait preview with zoom slider and rotate buttons highlighting the swapped wig.
   - Carousel of favorited wig styles with quick swap controls.
   - CTA cluster: "Add Wig to Bag", "Save Look", "Share" and feedback prompt link.

Include interaction notes on each frame documenting hover/tap states, error messaging, and transitions between frames. Share the Figma project with product, design, and engineering stakeholders for review.

## 3. Acceptance Criteria

- Shopper can access the try-on flow exclusively from the favorites hub and retain selection context throughout the experience.
- Upload validation enforces supported formats, file size limits, and portrait requirements (hairline visibility, neutral background) with actionable error messages.
- Rendering queue communicates progress with < 5s between status updates and allows concurrent carousel browsing.
- Preview view offers zoom, rotate, and wig swapping without requiring a full rerender when toggling color variants.
- Analytics events fire for key milestones (favorites entry, upload start/success/fail, rendering start/complete, add-wig-to-bag, save-look, share, feedback submit).
- Experience is responsive for mobile and tablet breakpoints (min width 320px) without layout breaks.

## 4. KPIs & Stakeholder Alignment

| KPI | Target | Stakeholder Notes |
| --- | --- | --- |
| Favorites-to-Try-On Conversion | ≥ 35% of favorites sessions initiate wig try-on within 30 days of launch | Product & Merchandising agree to revisit target after A/B test baseline. |
| Try-On Completion Rate | ≥ 80% of initiated wig try-on sessions render a preview | CX to monitor drop-offs related to upload friction; support scripts updated. |
| Add-to-Bag Post Try-On | ≥ 15% of completed wig try-on sessions add ≥1 wig to bag | Growth team to integrate with promotion experiments; measure by SKU. |
| Session Engagement Time | Median 3+ minutes spent in favorites/wig try-on flow | Analytics to break down by device type; Design monitors carousel interactions. |
| Processing Latency | P95 ≤ 20 seconds from upload confirmation to preview render | Engineering committed to GPU autoscaling; infra to provide weekly latency reports. |
| Feedback Response Rate | ≥ 25% of wig try-on sessions submit hairstyle realism feedback | CX to use responses for model training prioritization. |

Stakeholders: Product (PM, Merchandising Lead), Design (UX, Visual Design), Engineering (Frontend, Backend, ML), Analytics, Customer Experience. Hold bi-weekly review to reassess KPIs and acceptance criteria based on data trends and qualitative feedback.

## 5. Operational Handoff & Build Tasks

- **Version Control Workflow**
  - Requirements, user journey updates, and wireframe notes must be committed to the `ai-try-on` workspace within the primary GitHub repository so downstream pods can pull the latest context.
  - Each requirements change triggers an automated notification to connected build pipelines (e.g., ML retraining jobs, asset prep scripts) via repository webhooks.
- **Build Task Creation**
  - When requirements or assets change, create a corresponding "AI Try-On Build" task in the team backlog referencing the Git commit hash, impacted wig SKUs, and expected delivery date.
  - Tasks should include checklist items for data validation, rendering QA, CX scripting, and analytics tag verification to ensure every team understands dependencies before launch.
- **Cross-Team Visibility**
  - Weekly GitHub reports summarize merged changes and outstanding build tasks for leadership review.
  - Documentation and status boards remain the single source of truth so operations, merchandising, and engineering maintain alignment when iterating on the wig-only try-on experience.
