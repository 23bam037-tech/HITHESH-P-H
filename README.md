
# AI Career Path Optimizer | Turbo Edition

This project is a high-performance career intelligence platform.

## Local Setup (VS Code)

1.  **Download the Code**: Create a new folder on your computer and open it in VS Code.
2.  **Create Files**: Create the following files and paste the content provided:
    *   `index.html`
    *   `index.tsx`
    *   `App.tsx`
    *   `types.ts`
    *   `services/geminiService.ts`
    *   `metadata.json`
3.  **Set API Key**: This app expects `process.env.API_KEY`. If running locally without a build system, you may need to replace `process.env.API_KEY` in `services/geminiService.ts` with your actual Gemini API key (though the browser environment usually handles this in the specific execution context where this was designed).
4.  **Run with Live Server**:
    *   Install the **"Live Server"** extension in VS Code.
    *   Right-click `index.html` and choose **"Open with Live Server"**.
    *   The app will run at `http://127.0.0.1:5500`.

## Features
*   **Turbo Engine**: Uses Gemini 3 Flash for sub-second analysis.
*   **Job Suggestions**: Pre-populated high-growth 2026 roles for quick selection.
*   **Grounding**: Real YouTube and course links found via Google Search tools.
