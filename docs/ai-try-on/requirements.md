# AI Wig Try-On Requirements

## Overview
The AI try-on experience allows customers to preview catalog wigs on their own portrait photographs. The feature integrates with the existing favorites workflow so shoppers can shortlist wigs while browsing, then visit the try-on page to compare blended results.

This repository now contains two tracks:

- **In-browser demo (current build):** `try-on.html` keeps everything client-side using layered SVG overlays and sample portrait assets. It is ideal for stakeholder reviews and UX iteration.
- **Production pipeline (future state):** planned backend services, queues, and AI microservices process portraits server-side once the blending model is ready.

The sections below separate the requirements for each track.

## Demo capabilities
- Upload or load a sample portrait directly in the browser.
- Display wig favorites defined in `assets/js/try-on-data.js` with thumbnails, descriptions, and default alignment metadata.
- Allow visitors to scale and offset the overlay manually for a believable fit.
- Export the composite as a PNG without leaving the page.
- Provide clear guidance, sample assets, and safeguards (size/type validation) for testing.

## Production user roles
- **Shopper:** Uploads a portrait, selects saved favorite wigs, and reviews AI-generated composites.
- **Administrator:** Monitors job processing, moderates uploaded content, and reviews analytics.

## Production user journey
1. Shopper browses catalog and marks wigs as favorites.
2. Shopper visits `/try-on` and signs in (if not already authenticated).
3. Shopper uploads a clear portrait (face and shoulders visible) or selects an existing upload.
4. The page displays a carousel/grid of saved favorite wigs.
5. Shopper selects a wig; the system queues an AI blending job and shows a placeholder preview.
6. When the job completes, the generated composite image replaces the placeholder.
7. Shopper can compare results, toggle between wigs, and download/share their favorites.
8. Shopper optionally adds wigs to cart or books a consultation.

## Production functional requirements
- Accept portrait image uploads up to 10 MB in JPEG/PNG formats.
- Allow shoppers to manage favorites from the try-on page (add/remove/reorder).
- Display job status (pending, processing, complete, failed) for each selected wig.
- Persist generated composites with signed URLs valid for 24 hours.
- Support retrying failed jobs with descriptive error messaging.
- Provide download button for completed composites.

## Production non-functional requirements
- **Latency:** Target < 20 seconds end-to-end per wig generation; hard cap 60 seconds.
- **Availability:** 99.5% uptime for API endpoints.
- **Security:** Enforce authenticated access, signed uploads, and least-privilege storage.
- **Privacy:** Delete source uploads and composites after 30 days or upon user request.
- **Compliance:** Honor GDPR/CCPA data erasure requests and capture consent for AI processing.

## Production acceptance criteria
- Upload validates file type, size, and safe content before processing.
- Favorites pulled from `/api/favorites` display consistent metadata (name, color, thumbnail).
- Selecting a wig triggers a queue job and visual loading indicator.
- Generated composites align hairline naturally with minimal artifacts in QA samples.
- Admin dashboard lists recent jobs with filters (status, wig, user) and allows moderation actions.

## Production KPIs
- Conversion uplift among shoppers who use try-on.
- Average processing time per wig generation.
- Favorites-to-try-on conversion rate.
- Job failure rate and moderation rejection rate.

## Open Questions
- Should we support multiple portrait uploads per user?
- What analytics events are required for marketing attribution?
- Are there legal requirements for AI usage disclosures on the try-on page?
- How will CRM certification resources surface within the try-on journey for stylists or admins?

## Cross-team coordination
- Partner with the CRM enablement team to ensure try-on events map to the certification tracking taxonomy.
- Document data contracts between the try-on queue and any CRM pipelines that trigger follow-up sequences.
- Provide demo assets to the CRM training microsite so stylists can practice explaining the feature to clients.
