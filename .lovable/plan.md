## Plan: Add Steward Knowledge Article

### Goal
Add the provided "Steward" article to the Knowledge Base (`knowledge_topics` table) so the RAG system can retrieve it when users ask about stewardship, FUN Kingdom stewardship, or related concepts.

### Content Summary
The article covers:
- Steward definition: not owner, but trusted guardian
- Mindset difference: ownership vs. service
- Lessons from wealthy dynasties (Rockefeller, Rothschild, Walton)
- Stewardship meaning within FUN Kingdom context
- Responsibilities of a Steward
- The spirit of stewardship as a FUN Kingdom citizen

### Implementation
1. **Insert into `knowledge_topics`** with:
   - **Title**: "Steward — Người Gìn Giữ, Phát Triển và Lan Tỏa Thịnh Vượng"
   - **Category**: "FUN Ecosystem"
   - **Icon**: 🌟 (or 👑)
   - **Description**: Brief summary of stewardship in FUN Kingdom
   - **Content**: Full article text as provided

2. **Verify insertion** by querying the row back.

### Technical Details
- Table: `public.knowledge_topics`
- Uses existing RLS policy for authenticated admin insert
- No schema changes required
