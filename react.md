"Act as a Senior Frontend Developer and UI/UX Expert. We are migrating our project, 'Weave,' from vanilla CSS to Tailwind CSS v4.

The Goal:

Completely remove all legacy CSS files and replace them with Tailwind utility classes.

Implement a robust Dark/Light mode system that is visually professional, stylish, and accessible.

Eliminate all !important tags and specificity conflicts.

The Rules for UI/UX & Color Palette:

Contrast & Visibility: Use Tailwind's color scale (e.g., slate, zinc, or gray) to ensure text is always readable. Never hardcode colors. Use semantic classes:

Backgrounds: bg-white dark:bg-slate-950

Text: text-slate-900 dark:text-slate-100

Secondary Text: text-slate-600 dark:text-slate-400

Professional Aesthetic: Maintain clean spacing (use p-4, gap-4), consistent border radiuses (rounded-xl), and subtle transitions (transition-colors duration-200).

No Hardcoding: All colors must rely on dark: prefixes. Do not use custom CSS variables for colors if Tailwind’s default scale can handle it.

Refactoring Strategy:

Please refactor the provided code file-by-file.

Remove all local .css import statements from the React components.

Inline the styles using Tailwind classes.

Ensure that the components are responsive and clean.

Here is the component code: [PASTE YOUR CODE HERE]"

Zohaib, kuch Tips (Jab aap ye prompt use karein):
Ek ek karke: Prompt ke end me [PASTE YOUR CODE HERE] ki jagah sirf ek component ka code dein (jaise Navbar.jsx ya ChatPage.jsx). Ek sath poora project dalne se AI context kho deta hai.

Global Theme Helper: Agar aapne abhi tak tailwind.config.js setup nahi kiya hai, to AI se pehle ye kahein: "Sabse pehle mujhe ek global theme setup code do jisme dark mode strategy 'class' par set ho, taake mera existing React Context uske sath sync ho jaye."

Consistency: Jab AI code de, to usse verify karein: "Kya ye code mere existing ThemeContext ke sath kaam karega?"