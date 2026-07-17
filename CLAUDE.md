# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js dashboard application that demonstrates the complete text embedding pipeline:
1. Text chunking (semantic splitting)
2. Vector generation using VoyageAI API
3. L2 normalization
4. Dimensionality reduction via PCA
5. Semantic search with cosine similarity visualization

The application processes text input, generates embeddings using the VoyageAI API, performs mathematical transformations on the vectors, and visualizes the results in a 2D scatter plot with interactive semantic search capabilities.

## Development Commands

### Basic Development
```bash
# Install dependencies
npm install

# Run development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

### Environment Setup
1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```
2. Edit `.env.local` and add your VoyageAI API key:
   ```
   VOYAGE_API_KEY=your_actual_key_here
   ```

## Architecture Overview

### Core Components

**Dashboard Component** (`components/Dashboard.tsx`):
- Main orchestrator managing the complete pipeline state
- Handles text processing flow through all stages
- Manages semantic search functionality
- Contains all UI state and business logic

**Pipeline Stages**:
1. **Chunking** (`lib/chunking.ts`): Semantic text splitting by paragraphs and sentences
2. **Embedding** (`lib/voyage.ts`, `app/api/embed/route.ts`): VoyageAI API integration (server-side only)
3. **Normalization** (`lib/normalize.ts`): L2 vector normalization
4. **PCA Reduction** (`lib/pca.ts`): Gram matrix-based PCA implementation
5. **Visualization** (`components/EmbeddingChart.tsx`): Interactive 2D scatter plot

### Key Data Flow

1. **Text Input**: User provides text through `InputPanel`
2. **Chunking**: Text split into semantic chunks (`chunkText`)
3. **Embedding Generation**: Chunks sent to VoyageAI API via server route
4. **Normalization**: L2 normalization of vectors for cosine similarity
5. **PCA Reduction**: High-dimensional vectors reduced to 2D for visualization
6. **Visualization**: 2D points plotted with Recharts scatter plot
7. **Semantic Search**: Query embedding projected to same PCA space, similarity calculated via dot product

### Important Implementation Details

**API Security**: The VoyageAI API key is only accessed server-side in `lib/voyage.ts` through the `/api/embed` route, ensuring it never reaches the client bundle.

**PCA Implementation**: Uses Gram matrix approach for efficiency when document count (n) << vector dimensions (d=1024). Includes a reusable `project()` function for mapping new query vectors to the same PCA space.

**Semantic Search**: After L2 normalization, cosine similarity equals dot product, enabling efficient similarity calculations.

## File Structure

```
app/                    # Next.js App Router structure
  api/embed/route.ts    # Server-side VoyageAI API integration
  page.tsx             # Main application entry point
components/             # React UI components
lib/                    # Core business logic (chunking, normalization, PCA, Voyage client)
types/                  # TypeScript type definitions
```

## Key Technical Decisions

1. **Client-side only**: Entire application runs in browser, no database required
2. **Gram matrix PCA**: Efficient dimensionality reduction when n << d
3. **Reusable projection**: PCA model exports `project()` function for query mapping
4. **Server-side API calls**: Protects VoyageAI API key from client exposure
5. **L2 normalization**: Transforms cosine similarity to dot product for efficient search

## Common Development Tasks

### Adding New Features
- Pipeline logic modifications should be in `Dashboard.tsx`
- Mathematical operations belong in `lib/` files
- UI components in `components/` directory
- Type definitions in `types/embedding.ts`

### Modifying the Pipeline
1. Update the pipeline stages in `Dashboard.tsx` `runPipeline()` function
2. Add new processing steps in sequence
3. Update `PipelineStage` type in `types/embedding.ts` if needed
4. Add new UI components for visualization

### Extending Semantic Search
1. Modify similarity calculation in `runSearch()` function
2. Update `SearchResults` component for new display formats
3. Adjust `QueryPoint` type if needed

## Visual Enhancements

### Glassmorphism Effect Implementation
- Enhanced chart container with gradient backgrounds and animated borders
- Added radial gradients for data points with 3D appearance
- Implemented glow effects using SVG filters
- Created animated background pattern with floating dots
- Added hover effects and smooth transitions
- Updated tooltips to match glassmorphism style