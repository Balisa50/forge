/**
 * Pre-built roadmap templates for roadmap.sh curated paths.
 *
 * These templates replace AI generation for known paths, giving users
 * consistent, high-quality, opinionated content instantly.
 *
 * Every task is a BUILD mission — a specific project with real deliverables.
 * Phase names are concrete (not generic "Foundation / Build & Apply / Prove Mastery").
 */

import type { CachedRoadmap } from "./roadmap-cache";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function task(
  title: string,
  detail: string,
  why: string,
  milestone: string,
  estimatedHours: number,
  resources: string[],
) {
  return { title, detail, why, milestone, estimatedHours, resources };
}

function phase(title: string, tasks: ReturnType<typeof task>[]) {
  return { title, tasks };
}

function track(title: string, color: string, phases: ReturnType<typeof phase>[]) {
  return { title, color, phases };
}

// ─────────────────────────────────────────────────────────────────────────────
// Templates
// ─────────────────────────────────────────────────────────────────────────────

const TEMPLATES: Record<string, CachedRoadmap> = {

  // ── Frontend Developer ────────────────────────────────────────────────────
  "frontend": {
    tracks: [track("Frontend Developer", "#00c8ff", [
      phase("Web Foundations", [
        task(
          "Build a responsive portfolio site with pure HTML & CSS",
          "Create a personal portfolio using semantic HTML5, CSS custom properties, Flexbox, and CSS Grid. It must look great on mobile and desktop. No frameworks — raw CSS only. Practice the box model, media queries, and CSS transitions. Host it on GitHub Pages.",
          "HTML and CSS are the bedrock. If you can't build layouts without a framework, you'll always be guessing at why things break.",
          "Live portfolio on GitHub Pages scoring Lighthouse accessibility 90+.",
          14,
          ["https://developer.mozilla.org/en-US/docs/Web/HTML", "https://developer.mozilla.org/en-US/docs/Web/CSS", "https://web.dev/learn/css", "YouTube: Kevin Powell — CSS for Beginners"],
        ),
        task(
          "Build a DOM-based task manager with localStorage",
          "Build a todo app using vanilla JavaScript — no libraries. Implement CRUD operations, drag-to-reorder, filter by status, and persist everything to localStorage. Learn event delegation, the DOM API, and how JavaScript interacts with HTML in real time.",
          "You'll write React for the rest of your career — but if you don't understand the DOM it wraps, you'll never truly debug it.",
          "Working todo app with add/edit/delete/filter/reorder and localStorage persistence.",
          16,
          ["https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model", "https://javascript.info/dom-nodes", "YouTube: Traversy Media — Vanilla JS Projects"],
        ),
        task(
          "Build an animated landing page with CSS animations & Intersection Observer",
          "Design and build a product landing page with scroll-triggered animations using the Intersection Observer API, CSS @keyframes, and CSS transitions. Include a sticky header, animated hero section, and a CSS-only modal. Performance matters — no jank.",
          "Animation and scroll effects are how you make products feel alive. Mastering native CSS animations is faster and smoother than JS-based animation libraries for most cases.",
          "Deployed landing page with ≥3 scroll-triggered animations, passing Core Web Vitals.",
          12,
          ["https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API", "https://web.dev/articles/animations-guide", "YouTube: Kevin Powell — CSS Animation"],
        ),
      ]),
      phase("React & Modern Tooling", [
        task(
          "Build a GitHub user explorer app with React hooks",
          "Use Vite + React + TypeScript to build a GitHub user search app. Call the GitHub REST API, show repos sorted by stars, handle loading/error/empty states, and implement debounced search with a custom useDebounce hook. Deploy to Vercel.",
          "This single project teaches you 90% of React's practical surface area: state, effects, async data, custom hooks, and TypeScript integration.",
          "Deployed app that searches GitHub users, displays 10 top repos with live debounce search.",
          18,
          ["https://react.dev/learn", "https://vitejs.dev/guide/", "https://typescriptlang.org/docs/handbook/2/generics.html", "YouTube: Fireship — React in 100 Seconds"],
        ),
        task(
          "Build a shopping cart with useReducer, Context, and React Router",
          "Build an e-commerce product listing with cart functionality. Use useReducer for cart state, React Context for global access, and React Router v6 for /products, /cart, and /checkout routes. Add unit tests with Vitest + Testing Library. No Redux — learn to manage state without it first.",
          "useReducer + Context is the pattern that 80% of real apps use before they reach Redux scale. React Router is in almost every production app.",
          "App with product listing, filterable categories, cart with item count badge, tested checkout flow.",
          20,
          ["https://react.dev/reference/react/useReducer", "https://reactrouter.com/en/main", "YouTube: Web Dev Simplified — React Context API"],
        ),
        task(
          "Build a component library with Storybook and compound components",
          "Design and document 8 reusable components (Button, Input, Modal, Card, Tabs, Select, Badge, Tooltip) using compound component and render prop patterns. Document each in Storybook. Write accessibility tests. This is how you level up from writing components to designing component APIs.",
          "Senior frontend engineers don't just use components — they design them. Understanding API design for components is what makes you promotable.",
          "Published Storybook with 8 components, accessibility annotations, and visual regression snapshots.",
          18,
          ["https://storybook.js.org/docs/get-started/install", "https://react.dev/reference/react/cloneElement", "YouTube: Jack Herrington — Advanced Component Patterns"],
        ),
      ]),
      phase("Production Frontend", [
        task(
          "Build a full-stack Next.js app with Server Components and Suspense",
          "Build a blog or dashboard with Next.js 15 App Router. Use React Server Components for data fetching, Suspense for streaming, Server Actions for mutations, and next/image for optimized images. Add TypeScript strict mode and deploy to Vercel with ISR.",
          "Next.js App Router is the dominant production pattern in 2025. RSC changes how you think about data fetching fundamentally.",
          "Deployed Next.js app with RSC data fetching, streaming UI, at least one Server Action mutation.",
          22,
          ["https://nextjs.org/docs/app", "https://react.dev/reference/react/Suspense", "YouTube: Theo — Next.js 15 Full Course"],
        ),
        task(
          "Optimize a React app: memoization, virtualization, and code splitting",
          "Take a slow React app (or build one with 10 000 list items) and fix it. Apply React.memo, useMemo, useCallback, useTransition, React.lazy with Suspense, and virtualize the list with TanStack Virtual. Profile before and after with React DevTools Profiler. Document your findings.",
          "Performance optimization is a senior engineer skill. Learning to find and fix bottlenecks is what separates you from developers who just add loading spinners.",
          "Before/after profiling screenshots showing ≥60% reduction in render time, virtualized list.",
          16,
          ["https://react.dev/reference/react/memo", "https://tanstack.com/virtual/latest", "YouTube: Jack Herrington — React Performance"],
        ),
        task(
          "Build a CI/CD pipeline with GitHub Actions, Playwright E2E tests, and Lighthouse CI",
          "Set up a GitHub Actions workflow for your frontend project that runs TypeScript checks, Vitest unit tests, Playwright end-to-end tests, and Lighthouse CI on every PR. Fail the build if Lighthouse performance score drops below 85.",
          "Shipping fast and safely requires automation. This is how real teams work — you'll have this skill from day one at any job.",
          "GitHub Actions CI badge on README, Playwright E2E tests passing, Lighthouse CI gating PRs.",
          14,
          ["https://docs.github.com/en/actions", "https://playwright.dev/docs/intro", "https://github.com/GoogleChrome/lighthouse-ci"],
        ),
      ]),
    ])],
  },

  // ── React ─────────────────────────────────────────────────────────────────
  "react": {
    tracks: [track("React", "#61dafb", [
      phase("React Fundamentals", [
        task(
          "Build a Markdown note editor with useState and controlled inputs",
          "Create a Markdown note editor: left pane is a textarea (controlled input), right pane is a live-preview div using a Markdown parser. Implement multiple notes, delete, rename, and autosave to localStorage. This covers state lifting, controlled vs uncontrolled components, and useEffect.",
          "Building a real editor forces you to handle the messy parts of state: debouncing saves, syncing two views, and avoiding stale closures.",
          "Working split-pane Markdown editor with multiple notes and localStorage persistence.",
          14,
          ["https://react.dev/learn/state-a-components-memory", "https://react.dev/learn/responding-to-events", "YouTube: Scrimba — React Crash Course"],
        ),
        task(
          "Build a custom hooks library: useFetch, useLocalStorage, useDebounce, useMediaQuery",
          "Extract logic from components into four reusable custom hooks. useFetch handles loading/error/data states with abort cleanup. useLocalStorage syncs with localStorage. useDebounce delays a value. useMediaQuery tracks a CSS breakpoint. Write tests for all four with Vitest.",
          "Custom hooks are the unit of code reuse in React. If you can't extract logic into a hook, you'll repeat yourself across every component.",
          "NPM-publishable hooks package with TypeScript types, Vitest tests, and Storybook usage examples.",
          16,
          ["https://react.dev/learn/reusing-logic-with-custom-hooks", "https://vitest.dev/guide/", "YouTube: Web Dev Simplified — Custom Hooks"],
        ),
        task(
          "Build a multi-step onboarding wizard with form validation",
          "Build a 4-step onboarding form: personal info → preferences → review → confirm. Validate each step before advancing. Use React Hook Form for validation, useReducer for wizard state, and Zod for schema validation. The form must be keyboard accessible.",
          "Forms are 40% of every business app. React Hook Form + Zod is the industry standard — you'll use this pattern for years.",
          "4-step wizard with Zod validation, error messages per field, ARIA live regions for errors.",
          14,
          ["https://react-hook-form.com/get-started", "https://zod.dev/", "YouTube: Jack Herrington — React Hook Form + Zod"],
        ),
      ]),
      phase("State Management & Data Fetching", [
        task(
          "Build a real-time dashboard with TanStack Query",
          "Build an analytics dashboard that fetches from a public API (weather, finance, or sports). Use TanStack Query for data fetching with polling every 30s, optimistic updates on mutations, and background refetch on window focus. Handle all query states: loading, error, stale, fresh.",
          "TanStack Query has replaced Redux in most apps for server state. It's in 60% of production React apps — you need to know it cold.",
          "Dashboard with 4+ data cards, auto-refresh, loading skeletons, and optimistic mutations.",
          18,
          ["https://tanstack.com/query/latest/docs/framework/react/overview", "https://tanstack.com/query/latest/docs/framework/react/guides/mutations", "YouTube: TkDodo — Practical React Query"],
        ),
        task(
          "Build a Zustand-powered kanban board with drag-and-drop",
          "Build a Kanban board (like Trello) using Zustand for global state and dnd-kit for drag-and-drop between columns. Support creating/deleting cards, moving between columns, and persisting state. Compare Zustand vs useState+Context — document the tradeoffs.",
          "Understanding when to reach for global state vs local state is a senior skill. Zustand is the lightweight winner in most 2025 projects.",
          "Kanban board with 3 columns, drag-and-drop reorder, create/delete cards, Zustand store.",
          18,
          ["https://docs.pmnd.rs/zustand/getting-started/introduction", "https://dndkit.com/docs/overview", "YouTube: Cosden Solutions — Zustand Tutorial"],
        ),
        task(
          "Build a React app with server state synced to a Supabase database",
          "Build a real-time chat or todo app with Supabase as the backend. Use Supabase Realtime for live updates, Supabase Auth for authentication, and TanStack Query to layer local optimistic updates over the Supabase client. Deploy to Vercel.",
          "Most React apps talk to a backend. Building this end-to-end with auth and real-time teaches the full production picture.",
          "Deployed real-time app with auth, persistent data, and live updates without page refresh.",
          20,
          ["https://supabase.com/docs/guides/getting-started", "https://supabase.com/docs/guides/realtime", "YouTube: Fireship — Supabase Crash Course"],
        ),
      ]),
      phase("Advanced Patterns & Testing", [
        task(
          "Build a virtualized infinite-scroll data table with sorting and filtering",
          "Build a table displaying 100 000 rows using TanStack Table + TanStack Virtual. Implement column sorting, multi-column filtering, row selection, and column resizing. The table must render at 60 fps with full keyboard navigation. Profile it with React DevTools.",
          "Tables are the hardest UI component to get right. Mastering TanStack Table will make you the go-to person for data-heavy UIs.",
          "Table with 100k rows, virtual scrolling, sort/filter/select, ≥55fps in React DevTools profiler.",
          20,
          ["https://tanstack.com/table/latest/docs/introduction", "https://tanstack.com/virtual/latest/docs/introduction", "YouTube: Jack Herrington — TanStack Table"],
        ),
        task(
          "Write comprehensive tests: Vitest unit tests + React Testing Library + Playwright",
          "Take a mid-size React app and achieve 80% test coverage. Write unit tests for custom hooks, integration tests for user flows with Testing Library, and E2E tests for critical paths with Playwright. Set up GitHub Actions to run all tests on PR.",
          "Untested React apps accumulate bugs that no one dares refactor. Testing gives you the confidence to ship fast and refactor ruthlessly.",
          "80%+ coverage report, Playwright E2E for 3 critical user flows, CI running on every PR.",
          16,
          ["https://vitest.dev/guide/", "https://testing-library.com/docs/react-testing-library/intro/", "https://playwright.dev/docs/intro"],
        ),
        task(
          "Build a Next.js full-stack app showcasing all advanced React patterns",
          "Build a portfolio project using Next.js App Router that demonstrates: Server Components, Suspense boundaries, error.tsx boundaries, Server Actions, parallel routes, intercepting routes, and optimistic UI updates. This is your capstone — make it portfolio-worthy.",
          "Next.js App Router is the standard production deployment for React in 2025. Demonstrating RSC patterns in a portfolio project is a strong hiring signal.",
          "Deployed Next.js app with RSC, Suspense, Server Actions, auth via NextAuth v5, ≥3 advanced routing patterns.",
          24,
          ["https://nextjs.org/docs/app/building-your-application", "https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023", "YouTube: Theo — T3 Stack Tutorial"],
        ),
      ]),
    ])],
  },

  // ── JavaScript ────────────────────────────────────────────────────────────
  "javascript": {
    tracks: [track("JavaScript", "#f7df1e", [
      phase("Core Language", [
        task(
          "Build a JavaScript quiz engine with closures and scope",
          "Build a timed quiz app from scratch using vanilla JS. The quiz engine must use closures to maintain question state without global variables, implement function factories for scoring, and use IIFE to namespace the module. No classes yet — pure function-based code.",
          "If you don't understand closures, you don't understand JavaScript. Every async callback, every event listener, every React hook is a closure.",
          "Quiz app with timer, scoring system, question shuffling — all built with closures and function factories.",
          12,
          ["https://javascript.info/closures", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures", "YouTube: Fun Fun Function — Closures"],
        ),
        task(
          "Build a promise-based HTTP client from scratch",
          "Implement a mini fetch wrapper that handles timeouts, retries with exponential backoff, request deduplication, and response caching. Then use it to build a weather app. You'll deeply understand Promise chaining, async/await, error handling, and the event loop.",
          "JavaScript is single-threaded but async by nature. Understanding async/await and Promises deeply is what separates JavaScript juniors from seniors.",
          "HTTP client with timeout/retry/cache, weather app consuming 2+ API endpoints, no third-party HTTP libraries.",
          16,
          ["https://javascript.info/async-await", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise", "YouTube: Fireship — JavaScript Promises in 10 Minutes"],
        ),
        task(
          "Build a functional utility library (lodash-lite) with map, filter, reduce, pipe, compose",
          "Implement 15 functional programming utilities from scratch: map, filter, reduce, flatMap, groupBy, debounce, throttle, memoize, curry, pipe, compose, pick, omit, deepClone, and deepEqual. Write unit tests for each. Publish to npm.",
          "Knowing how map/reduce/filter work under the hood — and being able to compose them — is the difference between JavaScript and really knowing JavaScript.",
          "Published npm package with 15 utilities, 100% test coverage with Jest/Vitest.",
          18,
          ["https://javascript.info/array-methods", "https://eloquentjavascript.net/05_higher_order.html", "YouTube: Fireship — Functional Programming in 40 Minutes"],
        ),
      ]),
      phase("DOM, Events & Browser APIs", [
        task(
          "Build a drag-and-drop interface using the Pointer Events API",
          "Build a reorderable list component using the native Pointer Events API (pointerdown, pointermove, pointerup) — no libraries. Handle touch and mouse uniformly, implement snap-to-position, and animate reordering. Understand event delegation and the event loop.",
          "Browser APIs are free performance. Using the Pointer Events API instead of a library means zero JS overhead for one of the most complex UI interactions.",
          "Reorderable list working on desktop and mobile with smooth CSS animations, no external drag libraries.",
          14,
          ["https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events", "https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API", "YouTube: Kevin Powell — CSS Animation API"],
        ),
        task(
          "Build a rich text editor using ContentEditable and Selection API",
          "Build a minimal rich text editor with bold/italic/underline formatting, bullet lists, undo/redo, and clipboard paste that strips formatting. Use the Selection API and ContentEditable. This will expose you to the messiest, most real-world JS challenge.",
          "ContentEditable is used in Notion, Google Docs, Linear, and every editor worth using. Understanding Selection API is a senior-tier skill.",
          "Editor with formatting toolbar, keyboard shortcuts (Cmd+B/I/U), undo stack of 50 steps, plain-text paste.",
          18,
          ["https://developer.mozilla.org/en-US/docs/Web/API/Selection", "https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Editable_content", "YouTube: Web Dev Simplified — Build a Text Editor"],
        ),
        task(
          "Build a canvas-based game: Snake or Breakout",
          "Build Snake or Breakout using the HTML Canvas 2D API. Implement the game loop with requestAnimationFrame, collision detection, score tracking, and increasing difficulty. No game frameworks — raw canvas and JS.",
          "Canvas programming teaches you how game loops work, which is directly applicable to animation libraries, chart libraries, and any high-performance rendering.",
          "Playable game running at 60fps with score, difficulty scaling, and high score stored in localStorage.",
          16,
          ["https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial", "https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript", "YouTube: Traversy Media — HTML Canvas Crash Course"],
        ),
      ]),
      phase("Modern JavaScript & Tooling", [
        task(
          "Build a module bundler from scratch (mini Webpack)",
          "Build a minimal JavaScript module bundler that reads an entry file, follows import/require statements to build a dependency graph, transforms ES modules to CommonJS, and outputs a single bundle file. You'll understand exactly how Webpack and Vite work internally.",
          "Knowing how bundlers work lets you configure them confidently, debug build issues, and make smart choices between Webpack, Vite, and esbuild.",
          "CLI bundler that handles relative imports, outputs working bundle.js, tested with a 5-file project.",
          20,
          ["https://javascript.info/modules-intro", "https://lihautan.com/the-svelte-compiler-handbook/", "YouTube: Ronen Amiel — Build Your Own Webpack"],
        ),
        task(
          "Build a testing framework from scratch (mini Vitest)",
          "Implement a minimal test runner: describe/it/expect, before/afterEach hooks, async test support, and a colored terminal reporter. Then use it to test your own utility library. Understanding test runners makes you a better tester and debugger.",
          "When you know how a test runner works, you stop fearing test configurations and start writing tests naturally.",
          "Test runner with describe/it/expect/hooks, async support, colored terminal output, used to test 5+ functions.",
          16,
          ["https://vitest.dev/guide/", "https://jestjs.io/docs/getting-started", "YouTube: Fireship — Testing JavaScript"],
        ),
        task(
          "Ship a JavaScript package to npm: a date formatting library",
          "Build and publish a lightweight date formatting library to npm. Include TypeScript types, dual CommonJS/ESM output via tsup, a CHANGELOG, semantic versioning, and a GitHub Actions release workflow. Documentation at README level — clear API, examples, badges.",
          "Shipping to npm is a rite of passage. Understanding package publishing, versioning, and module formats is what lets you contribute to open source.",
          "Published npm package with 500+ weekly downloads (post to dev.to/Reddit), TypeScript types, CI on GitHub.",
          14,
          ["https://docs.npmjs.com/creating-and-publishing-scoped-public-packages", "https://tsup.egoist.dev/", "YouTube: Matt Pocock — TypeScript NPM Package"],
        ),
      ]),
    ])],
  },

  // ── TypeScript ───────────────────────────────────────────────────────────
  "typescript": {
    tracks: [track("TypeScript", "#3178c6", [
      phase("Type System Fundamentals", [
        task(
          "Rebuild a JS utility library in TypeScript with strict types",
          "Take your (or anyone's) JavaScript utility library and rewrite it in TypeScript with strict mode enabled. Add generic types to map, filter, reduce. Use union types, intersection types, and discriminated unions for complex data shapes. Zero any types allowed.",
          "TypeScript's value is only visible when you write it strictly. Migrating a real JS project forces you to confront every type decision.",
          "Fully typed library in strict mode — no 'any', all generics correctly constrained, published with .d.ts.",
          14,
          ["https://typescriptlang.org/docs/handbook/2/types-from-types.html", "https://typescriptlang.org/docs/handbook/2/generics.html", "YouTube: Matt Pocock — TypeScript Beginners Tutorial"],
        ),
        task(
          "Build a typed API client with discriminated union responses",
          "Build a typed HTTP client wrapper that models API responses as discriminated unions: { success: true; data: T } | { success: false; error: ApiError }. Handle all HTTP error codes with type-safe error handling. No runtime type assertions — use type guards.",
          "Discriminated unions are the TypeScript pattern that eliminates an entire class of runtime errors. They're in every well-typed codebase.",
          "HTTP client where every response type is narrowed by the success/error discriminant — compile errors if you forget to check.",
          12,
          ["https://typescriptlang.org/docs/handbook/2/narrowing.html", "https://typescriptlang.org/docs/handbook/2/types-from-types.html", "YouTube: Matt Pocock — Discriminated Unions"],
        ),
        task(
          "Build a form validation library using Zod and TypeScript utility types",
          "Build a form schema validator inspired by Zod: a chainable builder API for string/number/object/array validators with custom error messages. Use mapped types, conditional types, and infer to make the schema automatically generate a TypeScript type.",
          "Utility types (Mapped, Conditional, infer) are what TypeScript is actually for — they let libraries be fully type-safe while remaining flexible.",
          "Validator library where schema.parse() returns a TypeScript-inferred type with zero type assertions.",
          16,
          ["https://typescriptlang.org/docs/handbook/2/conditional-types.html", "https://typescriptlang.org/docs/handbook/utility-types.html", "https://zod.dev/"],
        ),
      ]),
      phase("Advanced Types & Patterns", [
        task(
          "Build a type-safe event emitter with generic constraints",
          "Implement a type-safe EventEmitter class where event names and their payload types are defined by a generic interface. The emitter should refuse to emit/listen with wrong payload types at compile time. Implement on, off, once, emit with full generics.",
          "Generic constraints and mapped types are how TypeScript libraries guarantee correctness. Understanding them lets you read library source code and write your own.",
          "EventEmitter<Events> where Events = { login: User; error: string } — compile error if you emit wrong payload.",
          14,
          ["https://typescriptlang.org/docs/handbook/2/generics.html#generic-constraints", "https://typescriptlang.org/docs/handbook/2/mapped-types.html", "YouTube: Jack Herrington — Advanced TypeScript"],
        ),
        task(
          "Build a state machine library with TypeScript template literal types",
          "Implement a finite state machine (like XState lite) using TypeScript template literal types to constrain valid transitions. The machine should refuse to transition to an invalid state at compile time. Build a traffic light and door-lock machine as demos.",
          "Template literal types unlock a new tier of TypeScript power — string-level type safety that catches entire classes of logic bugs at compile time.",
          "State machine with template literal type constraints — compile error on invalid transitions, 2 demo machines.",
          16,
          ["https://typescriptlang.org/docs/handbook/2/template-literal-types.html", "https://stately.ai/docs/xstate", "YouTube: Matt Pocock — Template Literal Types"],
        ),
        task(
          "Migrate a medium Next.js app to strict TypeScript with zero 'any'",
          "Take a Next.js app (your own or an open-source starter) and enable TypeScript strict mode. Fix every error. Replace every any with a proper type. Add Zod validation to all API routes. Enable the strictNullChecks, noUncheckedIndexedAccess, and exactOptionalPropertyTypes compiler options.",
          "Strict TypeScript is a different skill than lenient TypeScript. This is what senior TypeScript developers do — and it's the only kind that's worth doing.",
          "Next.js app with strict tsconfig, zero 'any' in src/, Zod validated API routes, CI failing on type errors.",
          18,
          ["https://typescriptlang.org/tsconfig#strict", "https://www.totaltypescript.com/books/total-typescript-essentials", "YouTube: Matt Pocock — Strict TypeScript"],
        ),
      ]),
      phase("TypeScript in Production", [
        task(
          "Build a tRPC API with TypeScript end-to-end type safety",
          "Build a full-stack app using tRPC for type-safe APIs between a Next.js frontend and a Node.js backend. Implement procedures with Zod input validation, middleware for auth, and server-side rendering with type-safe data. No REST, no GraphQL — pure tRPC.",
          "tRPC eliminates the API contract problem — your frontend and backend share types with zero code generation. This is the future of full-stack TypeScript.",
          "Full-stack app with 5+ tRPC procedures, Zod input validation, auth middleware, deployed to Vercel.",
          20,
          ["https://trpc.io/docs/quickstart", "https://create.t3.gg/", "YouTube: Theo — Why tRPC is Better Than REST"],
        ),
        task(
          "Build and publish a TypeScript library with type tests",
          "Create a TypeScript utility library (string manipulation, array utils, or type helpers). Set up proper dual ESM/CJS output with tsup, write type tests with expect-type or vitest-expect-type, configure declaration maps, and publish to npm with correct peerDependencies.",
          "Publishing a typed library correctly is hard — most libraries have terrible types. Mastering this makes you the person who fixes broken @types packages.",
          "Published npm package with correct types, type tests passing, source maps, used in a demo project.",
          16,
          ["https://tsup.egoist.dev/", "https://github.com/mmkal/expect-type", "YouTube: Matt Pocock — How to Create a TypeScript Library"],
        ),
        task(
          "Contribute a type definition to DefinitelyTyped",
          "Find a popular JavaScript library missing TypeScript types on DefinitelyTyped, or improve an existing @types package. Write the type definitions, add tests to the dt-test suite, open a PR, and get it merged. Real open-source contribution.",
          "The DefinitelyTyped repository is one of the largest collaborative TypeScript projects. Contributing to it is on every senior TypeScript engineer's resume.",
          "Merged PR to DefinitelyTyped with complete type definitions and passing dt-test suite.",
          20,
          ["https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/README.md", "https://typescriptlang.org/docs/handbook/declaration-files/introduction.html", "YouTube: Matt Pocock — Declaration Files"],
        ),
      ]),
    ])],
  },

  // ── Node.js ───────────────────────────────────────────────────────────────
  "nodejs": {
    tracks: [track("Node.js", "#68a063", [
      phase("Node.js Core & APIs", [
        task(
          "Build a CLI tool that reads, transforms, and writes files using Node.js streams",
          "Build a command-line CSV-to-JSON converter using Node.js streams and Transform streams — not readFileSync. Handle large files (100MB+) without buffering the whole file in memory. Implement progress reporting with a PassThrough stream. Publish as an npm binary.",
          "Node.js streams are what make it non-blocking. Understanding them deeply is what lets you build high-throughput data pipelines that don't run out of memory.",
          "CLI that converts a 100MB CSV to JSON in under 5s, npm publishable with #!/usr/bin/env node.",
          14,
          ["https://nodejs.org/en/docs/guides/backpressuring-in-streams", "https://nodejs.org/api/stream.html", "YouTube: Traversy Media — Node.js Streams"],
        ),
        task(
          "Build an HTTP server from scratch using Node.js http module",
          "Build a minimal web framework (like Express-lite) using only the http module: routing, middleware pipeline, JSON body parsing, query string parsing, static file serving, and error handling. Then benchmark it against Express using autocannon.",
          "Building Express from scratch shows you exactly what Express does — and what it costs. You'll never blindly add middleware again.",
          "HTTP framework with routing/middleware/JSON/static files, benchmarked at ≥10k req/s on localhost.",
          16,
          ["https://nodejs.org/api/http.html", "https://github.com/mcollina/autocannon", "YouTube: Fireship — HTTP Server from Scratch"],
        ),
        task(
          "Build a worker thread pool for CPU-intensive image processing",
          "Build a Node.js image processing service (resize, watermark, format conversion) using worker_threads to parallelize work across CPU cores. Implement a thread pool that queues jobs and routes them to available workers. Compare throughput vs single-threaded.",
          "Node.js is single-threaded but worker_threads let you use all CPU cores. This pattern is essential for any CPU-bound workload in Node.",
          "Image service processing 100 images 3× faster with 4 worker threads vs single-threaded baseline.",
          14,
          ["https://nodejs.org/api/worker_threads.html", "https://sharp.pixelplumbing.com/", "YouTube: Fireship — Node.js Worker Threads"],
        ),
      ]),
      phase("Express, Fastify & APIs", [
        task(
          "Build a REST API with Fastify, Zod validation, and JWT authentication",
          "Build a complete user authentication API with Fastify: register, login, refresh token, protected routes. Use Zod schemas for request validation (integrated with Fastify's type provider), bcrypt for password hashing, and JWT with refresh token rotation. Add rate limiting.",
          "Fastify is 2× faster than Express and has first-class TypeScript and schema validation support. Knowing Fastify makes you a stronger Node.js developer.",
          "Auth API with register/login/refresh/protected endpoints, 100% typed via Zod, rate limited, integration tested.",
          18,
          ["https://fastify.dev/docs/latest/Guides/Getting-Started/", "https://github.com/turkerdev/fastify-type-provider-zod", "YouTube: ThePrimeagen — Fastify vs Express"],
        ),
        task(
          "Build a real-time chat app with Socket.io and Redis pub/sub",
          "Build a multi-room chat app with Socket.io. Scale it to multiple Node.js instances using Redis pub/sub as the message broker (Socket.io Redis Adapter). Add typing indicators, read receipts, user presence, and message history from PostgreSQL.",
          "Most Node.js apps need to scale beyond one process. Redis pub/sub is the standard pattern for scaling WebSockets and real-time features.",
          "Chat app working across 2 Node.js instances behind a load balancer — messages delivered cross-instance.",
          20,
          ["https://socket.io/docs/v4/", "https://redis.io/docs/latest/develop/interact/pubsub/", "YouTube: Traversy Media — Socket.io Chat App"],
        ),
        task(
          "Build a job queue system with BullMQ and Redis",
          "Implement a background job system: users submit jobs (resize image, send email, generate PDF), workers process them from a BullMQ queue, and a dashboard shows job status. Implement retry with exponential backoff, dead letter queues, and job priorities.",
          "Background job queues are in every production Node.js app. Understanding BullMQ lets you move expensive operations off the request cycle — the key to fast APIs.",
          "Job queue with 3 job types, retry/backoff, Bull Board dashboard, 100% of jobs processed in under 2s.",
          16,
          ["https://docs.bullmq.io/", "https://github.com/felixmosh/bull-board", "YouTube: Fireship — BullMQ Job Queue"],
        ),
      ]),
      phase("Production Node.js", [
        task(
          "Build a Node.js microservice with gRPC",
          "Convert a REST API service to gRPC: define a .proto schema, implement server and client in TypeScript with @grpc/grpc-js, add server-side streaming for real-time updates, and benchmark the performance difference. Deploy both services behind a gRPC gateway.",
          "gRPC is the standard for internal microservice communication at companies like Google, Netflix, and Airbnb. It's 7× faster than REST for service-to-service calls.",
          "gRPC service with unary and streaming RPCs, TypeScript types from proto, benchmarked vs REST equivalent.",
          18,
          ["https://grpc.io/docs/languages/node/basics/", "https://developers.google.com/protocol-buffers/docs/proto3", "YouTube: Traversy Media — gRPC Node.js"],
        ),
        task(
          "Optimize a Node.js app: profiling, memory leaks, and clustering",
          "Take a Node.js app that's slow or leaking memory. Use clinic.js and node --inspect to profile it. Find and fix memory leaks using heap snapshots. Add Node.js cluster mode to use all CPU cores. Document findings and performance improvements.",
          "Node.js performance problems are expensive and hard to debug. Knowing how to profile and fix them is what makes you the senior engineer on call.",
          "Profiling report with before/after metrics, memory leak fixed, cluster mode running on all CPUs.",
          16,
          ["https://nodejs.org/en/docs/guides/diagnostics", "https://clinicjs.org/", "YouTube: Node.js Performance — Profiling & Optimization"],
        ),
        task(
          "Deploy a Node.js app to production with Docker, health checks, and structured logging",
          "Containerize a Node.js API with a multi-stage Dockerfile (dev/prod). Add health check endpoints, graceful shutdown handling (SIGTERM), structured JSON logging with Pino, and a docker-compose.yml for local development with PostgreSQL and Redis. Deploy to a VPS with Docker Compose.",
          "Production Node.js has requirements that development never reveals. Health checks, graceful shutdowns, and structured logging are table stakes at any serious company.",
          "Deployed Node.js app with sub-100ms health check, graceful shutdown in ≤5s, structured JSON logs in production.",
          16,
          ["https://docs.docker.com/language/nodejs/", "https://getpino.io/#/", "YouTube: NetworkChuck — Docker for Developers"],
        ),
      ]),
    ])],
  },

  // ── Python ────────────────────────────────────────────────────────────────
  "python": {
    tracks: [track("Python", "#3572a5", [
      phase("Python Core", [
        task(
          "Build a web scraper with Beautiful Soup and async HTTP requests",
          "Build a concurrent web scraper using asyncio + aiohttp + BeautifulSoup4 that crawls a news site, extracts articles, saves to SQLite using aiosqlite, and respects robots.txt and rate limits. Handle pagination, redirects, and encoding. Output a JSON report.",
          "Web scraping is the fastest way to understand Python's async model, data extraction, and database persistence all at once.",
          "Scraper that crawls 100+ pages concurrently, stores structured data in SQLite, respects rate limits.",
          14,
          ["https://docs.python.org/3/library/asyncio.html", "https://www.crummy.com/software/BeautifulSoup/bs4/doc/", "YouTube: Corey Schafer — Python Web Scraping"],
        ),
        task(
          "Build a CLI application with Click, Rich, and Typer",
          "Build a developer productivity CLI tool (git helper, file organizer, or project scaffolder) using Typer for argument parsing and Rich for beautiful terminal output — progress bars, tables, syntax highlighting. Package it as a pip-installable tool with pyproject.toml.",
          "Python excels at CLI tools. Rich + Typer is the modern stack — it's what tools like FastAPI, Pydantic, and Poetry use internally.",
          "Pip-installable CLI with Rich tables/progress bars, help text, and at least 5 subcommands.",
          14,
          ["https://typer.tiangolo.com/", "https://rich.readthedocs.io/en/stable/", "YouTube: Traversy Media — Python CLI Apps with Typer"],
        ),
        task(
          "Build a data analysis pipeline with pandas and Polars",
          "Take a real dataset (NYC taxi trips, COVID data, or stock prices — all free). Clean it with pandas, then reprocess it with Polars to compare performance. Generate visualizations with Plotly. Write a Jupyter notebook explaining each analysis decision.",
          "Data manipulation is Python's killer app. Polars is 10× faster than pandas on large datasets — knowing both puts you ahead of 90% of Python developers.",
          "Jupyter notebook with cleaned data, 5+ visualizations, pandas vs Polars benchmark showing speedup.",
          16,
          ["https://docs.python.org/3/library/csv.html", "https://pola-rs.github.io/polars/py-polars/html/reference/", "YouTube: Rob Mulla — Polars vs Pandas"],
        ),
      ]),
      phase("Web Development with FastAPI", [
        task(
          "Build a REST API with FastAPI, SQLModel, and async PostgreSQL",
          "Build a blog API with FastAPI: posts, users, comments, tags. Use SQLModel for the ORM (it's Pydantic + SQLAlchemy), asyncpg for async PostgreSQL, Alembic for migrations, and OAuth2 with JWT for auth. Full CRUD with pagination, filtering, and sorting.",
          "FastAPI is the fastest-growing Python web framework — it's in production at Microsoft, Uber, and Netflix. SQLModel is its natural companion from the same creator.",
          "Blog API with auth, 5 models, pagination, async DB queries, 80%+ test coverage with pytest-asyncio.",
          20,
          ["https://fastapi.tiangolo.com/tutorial/", "https://sqlmodel.tiangolo.com/", "YouTube: Traversy Media — FastAPI Crash Course"],
        ),
        task(
          "Build a background task system with Celery, Redis, and FastAPI",
          "Add background task processing to your FastAPI app: image resizing, email sending, and PDF generation triggered by API endpoints and processed by Celery workers. Monitor tasks in Flower dashboard. Use Redis as the broker and PostgreSQL as the result backend.",
          "Async background tasks are the pattern that separates toy APIs from production APIs. Celery is the standard Python solution.",
          "FastAPI app with 3 background task types, Celery workers, Flower monitoring, tasks completing in background.",
          18,
          ["https://docs.celeryq.dev/en/stable/getting-started/introduction.html", "https://flower.readthedocs.io/en/latest/", "YouTube: Patrick Loeber — FastAPI + Celery"],
        ),
        task(
          "Build a real-time API with FastAPI WebSockets and Server-Sent Events",
          "Add real-time features to your API: live notifications via SSE, collaborative editing via WebSockets, and a presence system showing online users. Build a minimal frontend to demonstrate. Handle connection management, reconnection, and load balancing with Redis pub/sub.",
          "Real-time Python APIs are increasingly common — knowing how to build WebSocket handlers in FastAPI makes you versatile in full-stack Python projects.",
          "FastAPI app with WebSocket room chat, SSE notification stream, presence system, tested with 50 concurrent connections.",
          16,
          ["https://fastapi.tiangolo.com/advanced/websockets/", "https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse", "YouTube: Eric Roby — FastAPI WebSockets"],
        ),
      ]),
      phase("Advanced Python", [
        task(
          "Build a Python package with modern tooling: uv, pyproject.toml, and type stubs",
          "Create a Python library, publish it to PyPI using uv as the package manager, write comprehensive type stubs (.pyi files), set up mypy in strict mode, configure Ruff as the linter, and set up GitHub Actions for CI with matrix testing across Python 3.11, 3.12, 3.13.",
          "Modern Python packaging is complex but essential. uv is 10-100× faster than pip and is becoming the standard.",
          "Published PyPI package with type stubs, strict mypy, Ruff linting, CI on 3 Python versions.",
          16,
          ["https://docs.astral.sh/uv/", "https://mypy.readthedocs.io/en/stable/", "YouTube: ArjanCodes — Modern Python Packaging"],
        ),
        task(
          "Build a metaclass-based ORM for SQLite",
          "Implement a minimal SQLite ORM using Python metaclasses (like Django Models or SQLAlchemy Declarative). Fields are class attributes that become column definitions. Metaclass intercepts class creation to register the schema. Implement SELECT, INSERT, UPDATE, DELETE via __getattr__ magic.",
          "Metaclasses are Python's deepest metaprogramming feature. Understanding them explains how Django, SQLAlchemy, Pydantic, and dataclasses actually work.",
          "ORM where Model subclasses auto-create tables, with field types, validation, and basic query chaining.",
          18,
          ["https://docs.python.org/3/reference/datamodel.html#metaclasses", "https://docs.python.org/3/library/sqlite3.html", "YouTube: James Murphy — Python Metaclasses"],
        ),
        task(
          "Build and deploy a Python service with Docker and GitHub Actions",
          "Containerize your FastAPI app with a multi-stage Dockerfile (builder stage for dependencies, slim production stage). Add health checks, Gunicorn + Uvicorn workers for production, structured logging with structlog, and a GitHub Actions pipeline that builds, tests, and pushes to Docker Hub on merge to main.",
          "Docker and CI/CD are universal skills. Every Python backend job expects you to be able to containerize and ship an application.",
          "Docker image under 200MB, CI pipeline building on every PR, deployed on a VPS or Railway.",
          14,
          ["https://docs.docker.com/language/python/", "https://www.structlog.org/en/stable/", "YouTube: ArjanCodes — FastAPI Docker Deployment"],
        ),
      ]),
    ])],
  },

  // ── Go ────────────────────────────────────────────────────────────────────
  "golang": {
    tracks: [track("Go", "#00acd7", [
      phase("Go Fundamentals", [
        task(
          "Build a concurrent file downloader using goroutines and channels",
          "Build a CLI tool that downloads a list of URLs concurrently using goroutines, limits concurrency with a semaphore channel, reports progress with a channel-driven progress bar, and handles timeouts and retries. Must download 10 files 5× faster than sequential.",
          "Goroutines and channels are Go's superpower. Building this forces you to understand concurrency patterns, race conditions, and how Go's scheduler works.",
          "CLI downloader that fetches 10 files concurrently with progress reporting, retry logic, correct error handling.",
          14,
          ["https://go.dev/tour/concurrency/1", "https://go.dev/blog/pipelines", "YouTube: Fireship — Go in 100 Seconds"],
        ),
        task(
          "Build a key-value store with persistent storage",
          "Build a simple key-value store (like Redis-lite) using Go: in-memory hash map protected by sync.RWMutex, write-ahead log for persistence, TCP server with a simple text protocol (GET/SET/DEL), and a client package. Add benchmarks with testing.B.",
          "Building a database from scratch teaches you locking, serialization, and network protocols in Go — the core of 90% of Go applications.",
          "KV store with TCP server, WAL persistence surviving restart, concurrent reads, benchmarked at ≥100k ops/s.",
          18,
          ["https://go.dev/blog/sync-mutex", "https://go.dev/doc/faq#goroutines", "YouTube: TechSchool — Build a Simple Bank"],
        ),
        task(
          "Build a CLI tool for text processing using Go's io and os packages",
          "Build a grep-like text search tool in Go that reads stdin or files, supports regex matching, outputs colorized matches with line numbers, handles binary files gracefully, and processes files in parallel using goroutines. Benchmark against ripgrep for fun.",
          "Go's standard library is exceptional for systems programming. Building CLI tools teaches file I/O, os package, regexp, and Go's error handling philosophy.",
          "CLI that searches files with regex, colored output, handles 1GB+ files without OOM, benchmarked.",
          12,
          ["https://pkg.go.dev/os", "https://pkg.go.dev/regexp", "YouTube: Jon Calhoun — Building CLI Apps in Go"],
        ),
      ]),
      phase("Web APIs & Services", [
        task(
          "Build a REST API with Gin, GORM, and PostgreSQL",
          "Build a complete task management API with Gin: CRUD endpoints for tasks/users/projects, GORM for PostgreSQL ORM, JWT authentication middleware, request validation with go-playground/validator, structured logging with zerolog, and integration tests with testify.",
          "Gin + GORM is the most common Go web stack. Learning it well means you can contribute to Go codebases at most companies on day one.",
          "REST API with auth, 3 models, pagination, 80%+ test coverage, deployed to fly.io or Railway.",
          20,
          ["https://gin-gonic.com/docs/", "https://gorm.io/docs/", "YouTube: TechSchool — Go REST API with Gin"],
        ),
        task(
          "Build a gRPC microservice with streaming and middleware",
          "Define a gRPC service for a real-time analytics pipeline using protobuf: unary RPCs for queries, server-streaming for live data, and client-streaming for bulk uploads. Add interceptors for auth, logging, and rate limiting. Generate Go client from .proto.",
          "gRPC is Go's native RPC protocol. Every major Go shop (Google, Uber, Dropbox) uses it for internal services.",
          "gRPC service with 3 RPC types, auth + logging interceptors, generated client, tested with grpcurl.",
          18,
          ["https://grpc.io/docs/languages/go/basics/", "https://buf.build/docs/", "YouTube: TechSchool — Go gRPC Course"],
        ),
        task(
          "Build a WebSocket server for real-time multiplayer game state",
          "Build the backend for a simple multiplayer game (tic-tac-toe, battleship, or connect-four) in Go. Use gorilla/websocket to manage connections, fan-out game state updates to all players in a room, and implement a lobby system. Deploy with graceful shutdown.",
          "WebSocket management in Go is elegant but requires understanding of goroutine lifecycles and channel-based fan-out patterns.",
          "Multiplayer game backend handling 50 concurrent games, clean room management, tested with wscat.",
          16,
          ["https://pkg.go.dev/github.com/gorilla/websocket", "https://go.dev/blog/context", "YouTube: Coding With Rob — Go WebSocket Server"],
        ),
      ]),
      phase("Production Go", [
        task(
          "Build a command-line tool with Cobra and publish to GitHub Releases",
          "Build a developer utility (database inspector, API tester, or log parser) using Cobra for subcommands, Viper for config, Bubble Tea for interactive TUI, and GoReleaser for cross-platform builds. Publish binaries for Linux/Mac/Windows via GitHub Actions on tag push.",
          "Go's ability to compile to a single binary for any platform is its biggest advantage for CLI tools. GoReleaser + GitHub Actions is the production pattern.",
          "Published CLI with 3+ subcommands, TUI interface, binaries for 3 platforms via GitHub Releases.",
          18,
          ["https://github.com/spf13/cobra", "https://github.com/goreleaser/goreleaser", "YouTube: Charm — Bubble Tea Tutorial"],
        ),
        task(
          "Profile and optimize a Go HTTP server: pprof, trace, and benchmarks",
          "Take a Go HTTP server, run it under pprof and go tool trace to identify bottlenecks. Optimize by: reducing allocations (sync.Pool), fixing goroutine leaks, using string interning, and reducing GC pressure. Document before/after with benchmarks.",
          "Go's pprof tooling is world-class. Being able to find and fix performance issues is a senior Go skill — and what makes Go services 10× faster than equivalent services in other languages.",
          "Before/after benchmark showing ≥50% throughput improvement, pprof flamegraph in writeup.",
          16,
          ["https://go.dev/blog/pprof", "https://go.dev/doc/diagnostics", "YouTube: Ardan Labs — Go Performance"],
        ),
        task(
          "Build a distributed task queue using Redis and Go",
          "Implement a distributed task queue with Go: producers submit tasks to Redis sorted sets, workers claim tasks atomically using Lua scripts, implement at-least-once delivery, worker heartbeats, and a REST API for task management. Handle node failures gracefully.",
          "Distributed systems fundamentals — atomicity, at-least-once delivery, failure handling — are what senior Go engineers architect. This is the project that will stand out in interviews.",
          "Task queue with reliable delivery across 3 worker processes, Lua atomics, tested with node kill scenarios.",
          20,
          ["https://redis.io/docs/latest/develop/interact/programmability/lua-api/", "https://pkg.go.dev/github.com/redis/go-redis/v9", "YouTube: Ardan Labs — Go Microservices"],
        ),
      ]),
    ])],
  },

  // ── Docker ────────────────────────────────────────────────────────────────
  "docker": {
    tracks: [track("Docker", "#0db7ed", [
      phase("Containers & Images", [
        task(
          "Containerize a full-stack app with multi-stage Dockerfiles",
          "Take a Node.js + PostgreSQL app and write production-quality Dockerfiles: multi-stage build (builder stage strips devDependencies), non-root user, .dockerignore, HEALTHCHECK instruction, pinned base image versions, and minimal final image size (under 100MB). Compare image sizes before/after optimization.",
          "Multi-stage builds are the single most impactful Docker optimization. A bad Dockerfile in production is a security and performance liability.",
          "Multi-stage Dockerfile with <100MB image, non-root user, HEALTHCHECK, passing trivy security scan.",
          12,
          ["https://docs.docker.com/build/building/multi-stage/", "https://docs.docker.com/develop/develop-images/dockerfile_best-practices/", "YouTube: NetworkChuck — Docker Tutorial for Beginners"],
        ),
        task(
          "Build a local development environment with Docker Compose",
          "Set up a Docker Compose environment for a microservices app: Node.js API + React frontend + PostgreSQL + Redis + nginx reverse proxy. Use named volumes for DB persistence, environment variable files, health check dependencies (depends_on with condition), and hot reload for development.",
          "Docker Compose is how 90% of teams run local development environments. Knowing it cold means never dealing with 'works on my machine' issues.",
          "Docker Compose stack with 5 services, hot reload for dev, nginx routing, health-checked startup.",
          14,
          ["https://docs.docker.com/compose/", "https://docs.docker.com/compose/compose-file/", "YouTube: TechWorld with Nana — Docker Compose Tutorial"],
        ),
        task(
          "Build and push custom images to Docker Hub and GitHub Container Registry",
          "Create Docker images for 3 services, set up automated builds via GitHub Actions (triggered on tag push), scan images with Trivy for vulnerabilities, and publish to both Docker Hub and GitHub Container Registry (ghcr.io). Use image labels and semantic version tags.",
          "Automated image builds are table stakes at any company using Docker. Understanding registries and tagging strategies is fundamental to container operations.",
          "GitHub Actions workflow building, scanning, and pushing versioned images to GHCR on every tag.",
          10,
          ["https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry", "https://github.com/aquasecurity/trivy", "YouTube: TechWorld with Nana — Docker in CI/CD"],
        ),
      ]),
      phase("Networking, Volumes & Security", [
        task(
          "Master Docker networking: bridge, host, overlay networks",
          "Build a multi-container application that demonstrates all three network modes. Create a custom bridge network so containers communicate by name. Add an nginx sidecar container on the same network. Simulate a 2-node Docker Swarm to test overlay networking.",
          "Container networking is the hardest part to debug in production. Understanding bridge/overlay/host modes is what lets you architect container-based systems confidently.",
          "Demo with custom bridge network, named DNS resolution, nginx reverse proxy, overlay network test.",
          12,
          ["https://docs.docker.com/network/", "https://docs.docker.com/network/drivers/bridge/", "YouTube: TechWorld with Nana — Docker Networking"],
        ),
        task(
          "Implement a secure Docker setup: secrets, read-only filesystems, and capabilities",
          "Harden a Docker deployment: use Docker secrets for sensitive data (not environment variables), mount the root filesystem as read-only with specific tmpfs mounts for writable paths, drop all Linux capabilities and add only required ones, and run containers as a non-root user with a specific UID.",
          "Docker security is an afterthought for most developers — and a CWE vulnerability for the companies they work at. Security hardening is a must-have for production containers.",
          "Container passing docker bench security check, secrets mounted via Docker secrets, capabilities dropped.",
          12,
          ["https://docs.docker.com/engine/swarm/secrets/", "https://docs.docker.com/engine/security/", "https://github.com/docker/docker-bench-security"],
        ),
        task(
          "Build a stateful app with Docker volumes and backup strategies",
          "Deploy a PostgreSQL database in Docker with proper volume management: named volumes for data, bind mounts for configuration, automated pg_dump backups via a scheduled container (cron job in Docker), and a restore procedure. Test the full backup/restore cycle.",
          "Stateful containers and backup strategies are critical for production databases. Most Docker tutorials ignore this — knowing it sets you apart.",
          "PostgreSQL in Docker with automated daily backups, tested restore, volume migration documented.",
          10,
          ["https://docs.docker.com/storage/volumes/", "https://hub.docker.com/_/postgres", "YouTube: TechWorld with Nana — Docker Volumes"],
        ),
      ]),
      phase("Production Deployment", [
        task(
          "Deploy a Docker Swarm cluster with rolling updates and health checks",
          "Set up a 3-node Docker Swarm (1 manager, 2 workers) on VPS instances. Deploy a replicated service with rolling update strategy (maxUnavailable: 1), configure health checks, implement automated rollback on health check failure, and drain a node for maintenance.",
          "Docker Swarm is lighter than Kubernetes and perfect for teams that don't need K8s complexity. Understanding it teaches you the fundamentals of orchestration: desired state, rolling updates, self-healing.",
          "3-node Swarm with 3-replica service, rolling update completing with zero downtime, failed health check triggers rollback.",
          16,
          ["https://docs.docker.com/engine/swarm/", "https://docs.docker.com/engine/swarm/services/", "YouTube: TechWorld with Nana — Docker Swarm Tutorial"],
        ),
        task(
          "Build a monitoring stack: Prometheus + Grafana + cAdvisor in Docker Compose",
          "Add observability to your Docker deployment: cAdvisor for container metrics, Prometheus for scraping and storage, Grafana for dashboards. Set up alerts for high CPU/memory, set retention policies, and create a dashboard showing request rate, error rate, and latency.",
          "You can't run containers in production without metrics. The Prometheus + Grafana stack is the industry standard for container observability.",
          "Grafana dashboard with container CPU/memory/network graphs, Prometheus alert firing on >80% CPU.",
          14,
          ["https://docs.docker.com/config/daemon/prometheus/", "https://prometheus.io/docs/introduction/overview/", "YouTube: TechWorld with Nana — Prometheus and Grafana"],
        ),
        task(
          "Optimize Docker builds with BuildKit caching and buildx for multi-arch",
          "Optimize your CI build times using BuildKit inline cache (--cache-from/--cache-to), create a multi-architecture image (linux/amd64 + linux/arm64) with docker buildx and QEMU, and publish both architectures to the same tag. Reduce CI build time by ≥50%.",
          "ARM architecture (Apple Silicon, AWS Graviton) is everywhere. Multi-arch images mean your container runs natively without emulation on any machine.",
          "Multi-arch image on Docker Hub, GitHub Actions build time under 3 minutes using cache, both arches verified.",
          12,
          ["https://docs.docker.com/build/cache/", "https://docs.docker.com/build/building/multi-platform/", "YouTube: Bret Fisher — Docker BuildKit Tutorial"],
        ),
      ]),
    ])],
  },

  // ── Linux ────────────────────────────────────────────────────────────────
  "linux": {
    tracks: [track("Linux", "#fcc624", [
      phase("Shell & File System", [
        task(
          "Write a shell scripting toolkit: backup, deployment, and system monitoring",
          "Write 5 production-quality Bash scripts: automated rsync backup with rotation, zero-downtime deployment script with rollback, disk usage alert emailer, log rotation, and system health reporter (CPU/memory/disk/processes). Use ShellCheck to lint them all.",
          "Shell scripting is a multiplier skill — it automates the tedious parts of every other technology you use. Every DevOps engineer lives in Bash.",
          "5 Bash scripts passing ShellCheck with no errors, deployed and tested on a real Linux server.",
          14,
          ["https://www.gnu.org/software/bash/manual/bash.html", "https://www.shellcheck.net/", "YouTube: NetworkChuck — Bash Scripting Tutorial"],
        ),
        task(
          "Master Linux file permissions, ACLs, and disk management",
          "Set up a multi-user Linux environment: configure ACLs for shared project directories, use setuid/setgid for shared executables, encrypt a disk partition with LUKS, mount it automatically via /etc/crypttab, set up LVM for flexible storage management, and practice disk failure recovery.",
          "Linux file permissions and disk management are the foundation of every Linux admin skill. Getting them wrong means security breaches or data loss.",
          "Multi-user setup with ACLs, LUKS encrypted partition, LVM volume expanded without downtime.",
          12,
          ["https://linux.die.net/man/1/chmod", "https://wiki.archlinux.org/title/dm-crypt", "YouTube: NetworkChuck — Linux File Permissions"],
        ),
        task(
          "Build a process manager: systemd service files for a web app",
          "Convert a Node.js or Python app from manual process management to systemd: write a .service file with proper dependencies, environment variable loading from /etc/environment, restart on failure, watchdog, resource limits (CPU/memory cgroups), and journal logging. Add logrotate config.",
          "systemd is the init system on 95% of Linux servers. Writing proper service files means your apps survive server reboots and crashes automatically.",
          "systemd service auto-starting on boot, restarting on crash, memory-limited, logging to journalctl.",
          12,
          ["https://www.freedesktop.org/software/systemd/man/systemd.service.html", "https://wiki.archlinux.org/title/systemd", "YouTube: Chris Titus Tech — systemd Tutorial"],
        ),
      ]),
      phase("Networking & Security", [
        task(
          "Configure a Linux firewall with nftables and secure SSH",
          "Set up nftables (replacing iptables) with rules for: allow only ports 80/443/22, rate-limit SSH to 5 connections/minute, log dropped packets, and implement port knocking. Harden SSH: disable root login, use key-only auth, change to non-standard port, enable fail2ban.",
          "A Linux server exposed to the internet without proper firewall and SSH hardening gets compromised within hours. This is the minimum viable security.",
          "Server with nftables rules, SSH hardened per CIS benchmark, fail2ban active, passing Lynis security audit.",
          12,
          ["https://wiki.nftables.org/wiki-nftables/index.php/Main_Page", "https://wiki.archlinux.org/title/Fail2ban", "YouTube: Wolfgang's Channel — Linux Security Hardening"],
        ),
        task(
          "Set up a VPN server with WireGuard and network namespace isolation",
          "Install and configure WireGuard VPN server on a Linux VPS, add client configurations for 3 devices, route all traffic through the VPN, use iptables/nftables for NAT, and set up a network namespace to isolate processes. Test with DNS leak detection.",
          "WireGuard is the modern, fast, and secure VPN protocol. Understanding it teaches Linux networking fundamentals: routing tables, NAT, namespaces.",
          "WireGuard VPN passing DNS leak test on 3 clients, connections visible in wg show, kill switch configured.",
          14,
          ["https://www.wireguard.com/quickstart/", "https://wiki.archlinux.org/title/WireGuard", "YouTube: Wolfgang's Channel — WireGuard Setup"],
        ),
        task(
          "Build a Linux monitoring stack: netdata, log aggregation, and alerting",
          "Set up Netdata on a Linux server for real-time metrics with custom alarms (CPU >85%, disk >80%, load average >4). Configure rsyslog to forward logs to a central log server. Set up logwatch for daily email summaries. Add OSSEC for intrusion detection.",
          "Monitoring is how you know your server is healthy before users notice. Every Linux admin needs to know their monitoring stack.",
          "Netdata dashboard with custom alarms, central log server receiving syslogs, OSSEC detecting brute force.",
          14,
          ["https://learn.netdata.cloud/", "https://www.rsyslog.com/doc/master/index.html", "YouTube: NetworkChuck — Linux Server Monitoring"],
        ),
      ]),
      phase("Advanced Linux Administration", [
        task(
          "Build and customize a Linux kernel module",
          "Write a simple Linux kernel module in C: a character device that implements a circular buffer. Compile with Makefile, load/unload with insmod/rmmod, expose via /dev, and test with a userspace program. Use dmesg for debugging. Understand the kernel/userspace boundary.",
          "Kernel programming is intimidating but demystifying it makes you fearless about Linux internals. Understanding modules explains how drivers, filesystems, and network protocols work.",
          "Kernel module loaded without panic, character device passing read/write test, cleaned up with rmmod.",
          18,
          ["https://www.kernel.org/doc/html/latest/driver-api/index.html", "https://tldp.org/LDP/lkmpg/2.6/html/", "YouTube: Johannes 4GNU_Linux — Linux Kernel Programming"],
        ),
        task(
          "Set up Ansible for idempotent server provisioning",
          "Write Ansible playbooks to provision a production Linux server from scratch: install packages, configure firewall, deploy an app, set up SSL with Certbot, configure backups, and create users with SSH keys. All tasks must be idempotent (safe to re-run). Use Ansible Vault for secrets.",
          "Configuration management with Ansible is how you manage 1 or 100 servers identically. It's the first step to infrastructure as code.",
          "Playbook that provisions a server from bare Ubuntu to production-ready in under 10 minutes, idempotent.",
          16,
          ["https://docs.ansible.com/ansible/latest/getting_started/index.html", "https://docs.ansible.com/ansible/latest/vault_guide/index.html", "YouTube: TechWorld with Nana — Ansible Tutorial"],
        ),
        task(
          "Implement eBPF programs for performance tracing and security monitoring",
          "Write eBPF programs using libbpf or bpftrace to trace system calls, monitor network connections in real time, profile CPU usage per process, and detect unauthorized file access. Run on a production-like workload. Visualize with a flamegraph.",
          "eBPF is rewriting Linux observability and security. Tools like Cilium, Falco, and Pixie are all eBPF-based — knowing it makes you future-proof.",
          "3 eBPF programs: syscall tracer, network monitor, CPU flamegraph generated with bpftrace.",
          18,
          ["https://ebpf.io/what-is-ebpf/", "https://github.com/iovisor/bpftrace", "YouTube: Brendan Gregg — eBPF Superpowers"],
        ),
      ]),
    ])],
  },

  // ── DSA ───────────────────────────────────────────────────────────────────
  "dsa": {
    tracks: [track("Data Structures & Algorithms", "#22c55e", [
      phase("Core Data Structures", [
        task(
          "Implement a dynamic array, linked list, stack, and queue from scratch",
          "Build all four in your language of choice: dynamic array with amortized O(1) push, doubly linked list with O(1) insertions, stack with getMin() in O(1), and queue using two stacks. Write unit tests with edge cases (empty, single element, overflow).",
          "Every DSA interview starts here. Knowing these cold means you spend interview time thinking, not remembering syntax.",
          "4 data structures with unit tests passing edge cases, analyzed with Big-O annotations in code comments.",
          12,
          ["https://neetcode.io/roadmap", "https://leetcode.com/explore/", "Book: Introduction to Algorithms by CLRS"],
        ),
        task(
          "Implement a hash table with separate chaining and open addressing",
          "Build two hash map implementations: one with separate chaining (linked list buckets) and one with open addressing (linear probing + quadratic probing). Implement resize/rehash at 75% load factor. Benchmark both approaches for insert/lookup/delete.",
          "Hash tables are the most-used data structure in software. Understanding how they're implemented (and why they're O(1) amortized) is what makes you credible in interviews.",
          "Two HashMap implementations, rehashing at 75% load, benchmarked — load factor vs performance chart.",
          14,
          ["https://leetcode.com/explore/learn/card/hash-table/", "https://neetcode.io/", "Book: Algorithm Design Manual by Skiena"],
        ),
        task(
          "Implement BST, AVL tree, and heap with their core operations",
          "Build a Binary Search Tree with insert/delete/search and in-order traversal. Extend to an AVL tree with rotations for self-balancing. Build a MinHeap with heapify-up/down, and use it to implement heapsort. Visualize all operations with ASCII art output.",
          "Trees power databases (B-trees), priority queues, and expression parsers. AVL rotations are a common interview deep-dive question at top companies.",
          "BST and AVL with all operations, height-balanced after 1000 random insertions, MinHeap heapsort verified.",
          16,
          ["https://visualgo.net/en/bst", "https://leetcode.com/tag/binary-search-tree/", "Book: Introduction to Algorithms by CLRS Chapter 12-13"],
        ),
      ]),
      phase("Algorithms & Problem Solving", [
        task(
          "Master sorting algorithms and binary search variants",
          "Implement mergesort, quicksort (3-way partition), heapsort, counting sort, and radix sort. Implement 5 binary search variants: exact match, first/last occurrence, leftmost insertion point, minimum in rotated array. Benchmark all sorts on 1M elements.",
          "Sorting and binary search are in every technical interview. Understanding tradeoffs (stability, in-place, worst case) makes you credible in algorithm discussions.",
          "All 5 sorts passing correctness tests, benchmarked on 1M ints, binary search on all 5 variants verified.",
          14,
          ["https://neetcode.io/roadmap", "https://leetcode.com/explore/learn/card/binary-search/", "Book: Algorithms by Sedgewick & Wayne"],
        ),
        task(
          "Solve 30 graph problems: BFS, DFS, Dijkstra, Union-Find, topological sort",
          "Implement BFS and DFS iteratively. Solve: number of islands, clone graph, course schedule, number of connected components, longest consecutive sequence, Pacific Atlantic water flow. Implement Dijkstra's for shortest path and Bellman-Ford for negative weights. Implement Union-Find with path compression.",
          "Graph problems are 30% of FAANG interviews. Solving 30 problems builds the pattern recognition that makes graph problems approachable rather than scary.",
          "30 LeetCode graph problems solved, Union-Find implementation with compression, Dijkstra on weighted graph.",
          20,
          ["https://neetcode.io/roadmap", "https://leetcode.com/tag/graph/", "YouTube: Neetcode — Graph Algorithms for Beginners"],
        ),
        task(
          "Master dynamic programming: 25 problems from memoization to tabulation",
          "Solve 25 DP problems: climbing stairs, coin change, longest common subsequence, edit distance, word break, unique paths, house robber, knapsack, burst balloons. For each problem: write the recurrence relation, implement top-down with memoization, then bottom-up tabulation.",
          "Dynamic programming is the hardest interview topic and the one that separates junior from senior candidates. Mastering it through 25 problems is the minimum viable preparation.",
          "25 DP problems solved with both approaches, recurrence relations documented, time/space complexity analyzed.",
          22,
          ["https://neetcode.io/roadmap", "https://leetcode.com/tag/dynamic-programming/", "YouTube: Neetcode — Dynamic Programming Playlist"],
        ),
      ]),
      phase("Advanced Topics & Interview Prep", [
        task(
          "Implement and benchmark advanced data structures: trie, segment tree, Bloom filter",
          "Build a Trie for autocomplete (insert/search/startsWith) and word search. Build a Segment Tree for range sum/min queries with point updates. Build a Bloom Filter with configurable false positive rate. Benchmark all against naive approaches.",
          "Tries appear in autocomplete, spell checkers, and IP routing. Segment trees are in competitive programming and range query systems. These structures in your toolkit solve problems others can't.",
          "Trie autocomplete completing words, Segment Tree range queries in O(log n), Bloom filter at target FPR.",
          18,
          ["https://leetcode.com/tag/trie/", "https://cp-algorithms.com/data_structures/segment_tree.html", "Book: Competitive Programmer's Handbook"],
        ),
        task(
          "Complete a mock interview gauntlet: 50 LeetCode mediums and hards",
          "Complete 50 LeetCode problems (40 medium, 10 hard) under timed conditions (35 min per problem). Focus on: two pointers, sliding window, backtracking, heap, monotonic stack, and interval problems. Review every failed problem thoroughly. Track your success rate.",
          "Interview success is a skill built through deliberate practice under time pressure. 50 timed problems is the minimum to develop interview fluency.",
          "50 problems solved with solutions documented, ≥60% first-attempt solve rate on mediums, 3+ hards solved.",
          30,
          ["https://neetcode.io/practice", "https://leetcode.com/problemset/", "YouTube: Neetcode — Blind 75 Solutions"],
        ),
        task(
          "Build a competitive programming toolkit and solve 5 contest problems",
          "Set up a competitive programming environment with a template (fast I/O, common algorithms pre-coded). Participate in a Codeforces or LeetCode contest. Solve 5 problems in contest conditions. Analyze editorial solutions you couldn't solve. Build your template iteratively.",
          "Competitive programming under contest pressure reveals your weak spots faster than LeetCode practice. Contest experience is increasingly valued in interviews at top companies.",
          "3+ problems solved in a Codeforces contest, template with 10 pre-coded algorithms, post-contest analysis written.",
          18,
          ["https://codeforces.com/", "https://competitive-programming-handbook.netlify.app/", "Book: Competitive Programmer's Handbook by Laaksonen"],
        ),
      ]),
    ])],
  },

  // ── System Design ─────────────────────────────────────────────────────────
  "system-design": {
    tracks: [track("System Design", "#f59e0b", [
      phase("Fundamentals", [
        task(
          "Design and implement a URL shortener with consistent hashing",
          "Build a production-ready URL shortener: base62 encoding, collision avoidance, Redis caching for hot URLs, PostgreSQL for persistence, consistent hashing for multi-node distribution, analytics (click count, geo), and rate limiting per IP. Document the architecture decision record (ADR).",
          "The URL shortener is the 'hello world' of system design interviews. Building it teaches caching, hashing, and DB design simultaneously.",
          "URL shortener handling 1000 req/s on localhost, Redis hit rate >90% on popular URLs, ADR written.",
          18,
          ["https://web.dev/articles/caching-api-requests", "https://redis.io/docs/latest/", "YouTube: Gaurav Sen — Designing a URL Shortener"],
        ),
        task(
          "Design a rate limiter with multiple algorithms",
          "Implement 4 rate limiting algorithms: token bucket, leaky bucket, fixed window counter, and sliding window log. Use Redis for distributed state (atomic Lua scripts). Benchmark each algorithm's accuracy and performance. Deploy as middleware for a Fastify/Express app.",
          "Rate limiting is in every production API. Understanding the tradeoffs between algorithms and implementing them with Redis atomics is a fundamental distributed systems skill.",
          "4 rate limiter implementations, benchmark showing accuracy/performance tradeoffs, Redis-based distributed version.",
          16,
          ["https://redis.io/docs/latest/develop/use/patterns/rate-limiting/", "https://stripe.com/blog/rate-limiters", "YouTube: Gaurav Sen — Rate Limiting Algorithms"],
        ),
        task(
          "Build a consistent hashing ring with virtual nodes",
          "Implement a consistent hashing ring: add/remove nodes, distribute keys with virtual nodes (100 vnodes per physical node), measure key redistribution on node changes. Build a demo with Redis sharding: 4 Redis instances behind a consistent hash router.",
          "Consistent hashing is the algorithm behind DynamoDB, Cassandra, and every distributed cache. Building it from scratch makes database distribution demystifying.",
          "Hash ring with virtual nodes, ≤25% keys remapped on node add/remove, 4-node Redis sharding demo.",
          14,
          ["https://www.toptal.com/big-data/consistent-hashing", "https://book.mixu.net/distsys/single-node.html", "YouTube: Gaurav Sen — Consistent Hashing"],
        ),
      ]),
      phase("Distributed Systems", [
        task(
          "Build a distributed message queue (Kafka-lite) with replication",
          "Implement a simplified distributed log: topics, partitions, consumer groups, offset management, and leader-follower replication. Use TCP sockets for broker-to-broker communication. Implement at-least-once delivery and consumer group rebalancing.",
          "Understanding Kafka internals (partitions, offsets, replication) means you can use Kafka effectively, tune it, and debug issues that other engineers can't.",
          "Message queue with 2 partitions, 2-broker replication, consumer group tested with 3 consumers.",
          22,
          ["https://kafka.apache.org/documentation/", "https://martin.kleppmann.com/2017/04/24/event-sourcing-fraud-detection.html", "Book: Designing Data-Intensive Applications by Kleppmann Chapter 11"],
        ),
        task(
          "Implement the Raft consensus algorithm",
          "Implement Raft leader election and log replication in Go or Python. Simulate network partitions and node failures. Verify that no committed entry is lost across election cycles. Use a visualizer (raft.github.io) to validate your implementation.",
          "Raft is the consensus algorithm behind etcd, CockroachDB, and TiKV. Understanding it deeply means you can reason about any distributed system's correctness guarantees.",
          "Raft implementation passing all consensus tests: election, log replication, leadership change, partition recovery.",
          24,
          ["https://raft.github.io/", "https://raft.github.io/raft.pdf", "YouTube: Martin Kleppmann — Distributed Systems Lecture"],
        ),
        task(
          "Design a distributed cache with write-through, write-back, and eviction policies",
          "Build a multi-tiered cache: L1 in-process LRU (configurable size), L2 Redis cluster with consistent hashing, write-through/write-back/write-around modes. Implement LRU, LFU, and TTL eviction. Measure cache hit rates and latency at different load levels.",
          "Caching is the most impactful performance optimization in distributed systems. Understanding eviction policies and write patterns is what makes the difference between a cache that helps and one that makes things worse.",
          "3-eviction-policy cache, write-through/write-back modes, hit rate dashboard, benchmarked at 10k req/s.",
          18,
          ["https://redis.io/docs/latest/develop/use/patterns/", "https://cachelib.org/", "Book: Designing Data-Intensive Applications by Kleppmann Chapter 5"],
        ),
      ]),
      phase("Interview-Ready Design Skills", [
        task(
          "Design and document 5 system design interview problems",
          "Create detailed design documents for: Netflix (CDN + video streaming), Twitter feed (fan-out on write/read), Uber (geolocation + dispatch), WhatsApp (message delivery guarantees), and Google Docs (CRDT-based collaborative editing). Each doc: requirements, capacity estimation, component diagram, API design, deep-dive on 1 tricky component.",
          "System design interviews are conversations, not tests. Having 5 well-thought-out designs documented forces you to engage with every dimension: scale, cost, consistency, latency.",
          "5 design docs with diagrams, capacity estimations, component breakdowns, and tradeoff discussions.",
          24,
          ["https://github.com/donnemartin/system-design-primer", "Book: Designing Data-Intensive Applications by Kleppmann", "YouTube: Gaurav Sen — System Design Playlist"],
        ),
        task(
          "Build a real-time leaderboard with sorted sets and fan-out",
          "Build a gaming leaderboard system: players earn points that update their rank in real time, top-10 is pushed live to all connected clients via WebSockets, leaderboard is sharded across Redis instances, and historical rankings are stored with time-series data in TimescaleDB.",
          "Leaderboards combine the hardest parts of real-time systems: sorted data structures, fan-out to thousands of clients, and time-series storage.",
          "Leaderboard with real-time WebSocket updates, Redis sorted sets, 100 concurrent clients tested.",
          18,
          ["https://redis.io/commands/zadd/", "https://docs.timescale.com/latest/main/", "YouTube: Redis — Building a Leaderboard with Redis"],
        ),
        task(
          "Architect a multi-region deployment with failover and data sovereignty",
          "Design and partially implement a multi-region deployment for a SaaS app: active-passive failover with Route 53 health checks, database replication from us-east-1 to eu-west-1, GDPR-compliant data residency (EU users' data stays in EU), circuit breaker pattern for inter-region calls, and RTO < 60s.",
          "Multi-region architecture is the final boss of system design. Every company with ≥100k users eventually needs it. Understanding the tradeoffs is a staff engineer skill.",
          "Architecture diagram with two regions, failover tested, data residency documented, RTO validated.",
          22,
          ["https://aws.amazon.com/blogs/architecture/disaster-recovery-dr-architecture-on-aws-part-i-strategies-for-recovery-in-the-cloud/", "https://cloud.google.com/architecture/framework/reliability", "Book: Release It! by Michael Nygard"],
        ),
      ]),
    ])],
  },

  // ── PostgreSQL ────────────────────────────────────────────────────────────
  "postgresql": {
    tracks: [track("PostgreSQL", "#336791", [
      phase("SQL & Schema Design", [
        task(
          "Design a normalized schema for an e-commerce database and seed 1M rows",
          "Design a fully normalized schema (3NF) for an e-commerce database: users, products, orders, order_items, categories, reviews, inventory, payments. Write SQL DDL with proper constraints (FK, CHECK, UNIQUE), indexes, and sequences. Seed 1M orders using generate_series and pg_crypto.",
          "Schema design is permanent — a bad schema requires painful migrations later. Designing correctly the first time with proper constraints and normalization is the most valuable SQL skill.",
          "Schema with 8 tables, foreign keys, check constraints, seeded with 1M orders in under 60 seconds.",
          14,
          ["https://www.postgresql.org/docs/current/ddl.html", "https://www.postgresql.org/docs/current/datatype.html", "Book: PostgreSQL: Up and Running by Regina Obe"],
        ),
        task(
          "Master complex queries: window functions, CTEs, and lateral joins",
          "Write 15 complex queries: running totals with SUM OVER (PARTITION BY), rank products by revenue per category with RANK(), find the top-N orders per user with LATERAL, calculate 7-day moving averages, detect gaps in sequences, and find the longest streak of daily orders.",
          "Window functions, CTEs, and lateral joins are the SQL features that separate analysts from engineers. They replace most imperative Python data processing with pure SQL.",
          "15 queries passing result verification tests, query plans analyzed with EXPLAIN ANALYZE.",
          16,
          ["https://www.postgresql.org/docs/current/tutorial-window.html", "https://www.postgresql.org/docs/current/queries-with.html", "YouTube: Hussein Nasser — Advanced SQL Window Functions"],
        ),
        task(
          "Optimize a slow query: indexes, query planning, and vacuuming",
          "Take a set of slow queries (>500ms) on the seeded 1M-row database and fix them. Use EXPLAIN ANALYZE to read query plans. Add B-tree, partial, composite, and expression indexes. Understand sequential scan vs index scan vs bitmap scan. Configure autovacuum and run ANALYZE.",
          "Query optimization is the most impactful database skill. A single index can turn a 10-second query into 10 milliseconds — and save thousands in cloud costs.",
          "5 queries all under 50ms after optimization, EXPLAIN ANALYZE showing index scans, vacuum stats documented.",
          14,
          ["https://www.postgresql.org/docs/current/performance-tips.html", "https://use-the-index-luke.com/", "YouTube: Hussein Nasser — PostgreSQL Indexing"],
        ),
      ]),
      phase("Advanced PostgreSQL Features", [
        task(
          "Build a full-text search engine using PostgreSQL tsvector and GIN indexes",
          "Add full-text search to your e-commerce database: create tsvector columns with to_tsvector(), build GIN indexes, implement ranked search with ts_rank, support multi-language (English + French), add autocomplete with pg_trgm and similarity(), and benchmark against LIKE queries.",
          "PostgreSQL's built-in full-text search beats Elasticsearch for most use cases at 1/10th the complexity. Knowing it means you don't add infrastructure for problems you already have a solution to.",
          "Full-text search returning results in <10ms on 1M products, ranked by relevance, autocomplete working.",
          14,
          ["https://www.postgresql.org/docs/current/textsearch.html", "https://www.postgresql.org/docs/current/pgtrgm.html", "YouTube: Hussein Nasser — PostgreSQL Full Text Search"],
        ),
        task(
          "Implement row-level security and multitenancy in PostgreSQL",
          "Add multitenancy to an app using PostgreSQL Row Level Security: add tenant_id to all tables, enable RLS, write POLICY rules that automatically filter by current_setting('app.tenant_id'), set the tenant context in application code, and verify tenant isolation with tests. Zero data leakage.",
          "RLS is the cleanest multitenancy pattern — the database enforces isolation, not the application. It's in production at Supabase, Hasura, and hundreds of B2B SaaS companies.",
          "RLS policies on 5 tables, tested with 3 tenants — no cross-tenant data visible regardless of query.",
          14,
          ["https://www.postgresql.org/docs/current/ddl-rowsecurity.html", "https://supabase.com/docs/guides/auth/row-level-security", "YouTube: Supabase — Row Level Security Tutorial"],
        ),
        task(
          "Design a time-series schema with TimescaleDB and materialized views",
          "Add time-series capabilities to PostgreSQL with TimescaleDB: convert an events table to a hypertable partitioned by time, create continuous aggregates for hourly/daily rollups, set data retention policies, and benchmark TimescaleDB vs vanilla PostgreSQL on range queries. Build a dashboard API.",
          "TimescaleDB turns PostgreSQL into a world-class time-series database. Knowing it means you avoid adding InfluxDB or ClickHouse for problems PostgreSQL can already solve.",
          "Hypertable with 100M rows, continuous aggregates refreshing automatically, range queries <50ms.",
          16,
          ["https://docs.timescale.com/latest/main/", "https://www.postgresql.org/docs/current/rules-materializedviews.html", "YouTube: Timescale — Getting Started with TimescaleDB"],
        ),
      ]),
      phase("Production PostgreSQL", [
        task(
          "Set up streaming replication and failover with Patroni",
          "Configure PostgreSQL streaming replication (1 primary, 2 standbys) with Patroni for automatic failover, HAProxy for connection routing, and pgBouncer for connection pooling. Test failover by killing the primary — new primary elected in <30s. Document the cluster topology.",
          "Every production PostgreSQL cluster needs HA. Patroni is the industry standard for automatic failover. Understanding it means you can build and operate production database clusters.",
          "3-node cluster with Patroni, automatic failover in <30s, connections via pgBouncer, failover tested.",
          18,
          ["https://patroni.readthedocs.io/en/latest/", "https://www.pgbouncer.org/", "YouTube: Citus Data — PostgreSQL High Availability"],
        ),
        task(
          "Implement database migrations with Flyway and zero-downtime deployment",
          "Set up Flyway for database version control: versioned migrations (V1__, V2__), repeatable migrations for views/functions, and undo scripts. Implement 5 zero-downtime migration patterns: add column with default, rename column (3-phase), add non-null constraint, split table, and add foreign key. Document each pattern.",
          "Zero-downtime migrations are the hardest part of maintaining a production database. Knowing the patterns lets you ship schema changes without maintenance windows.",
          "Flyway setup with 10 migrations, 5 zero-downtime patterns tested on a live database with active connections.",
          16,
          ["https://documentation.red-gate.com/fd", "https://postgres.ai/blog/20191029-zero-downtime-postgres-schema-migrations", "YouTube: HighScalability — Zero Downtime Database Migrations"],
        ),
        task(
          "Benchmark and tune PostgreSQL: shared_buffers, work_mem, and connection pools",
          "Profile a PostgreSQL database under load with pgbench (1000 TPS). Tune: shared_buffers (25% of RAM), work_mem (per-sort allocation), effective_cache_size, max_wal_size, and checkpoint settings. Measure the impact of each setting. Set up pg_stat_statements for query analytics.",
          "PostgreSQL's default configuration is conservative. Tuning it for your workload can double throughput. Understanding the settings makes you the engineer who fixes performance problems others declare unsolvable.",
          "pgbench baseline and tuned results documented, pg_stat_statements showing top 10 slowest queries.",
          14,
          ["https://www.postgresql.org/docs/current/runtime-config.html", "https://pgtune.leopard.in.ua/", "Book: PostgreSQL: Up and Running by Regina Obe Chapter 10"],
        ),
      ]),
    ])],
  },

  // ── AI & Data Scientist ───────────────────────────────────────────────────
  "ai-data-scientist": {
    tracks: [track("AI & Data Science", "#a855f7", [
      phase("Data Science & Classical ML", [
        task(
          "Analyze a real dataset end-to-end: EDA, feature engineering, and ML pipeline",
          "Download the Titanic or House Prices dataset (Kaggle). Do full EDA: distribution plots, correlation matrix, missing value analysis, outlier detection. Engineer 5+ features. Train gradient boosting (XGBoost or LightGBM) with cross-validation. Submit to Kaggle. Document every decision in a Jupyter notebook.",
          "Data science is 80% data cleaning and feature engineering. Doing a full EDA pipeline teaches you what separates a published model from a production one.",
          "Kaggle submission in top 30% of public leaderboard, notebook with EDA, feature importance plot.",
          18,
          ["https://www.kaggle.com/learn", "https://xgboost.readthedocs.io/en/stable/", "YouTube: Sentdex — Machine Learning with Python"],
        ),
        task(
          "Build a recommendation system using collaborative filtering and matrix factorization",
          "Build a movie recommendation system on the MovieLens 100K dataset: implement user-user and item-item collaborative filtering from scratch (cosine similarity), then implement matrix factorization with SGD. Compare RMSE. Build a Flask API endpoint for recommendations.",
          "Recommendation systems are in every consumer app. Building them from scratch exposes you to the math behind collaborative filtering — making you able to optimize real systems.",
          "Recommendation API, RMSE comparison of 3 approaches, cold-start problem documented and addressed.",
          18,
          ["https://surprise.readthedocs.io/en/stable/", "https://pytorch.org/tutorials/", "YouTube: ritvikmath — Recommendation Systems"],
        ),
        task(
          "Build a time-series forecasting model with LSTM and Prophet",
          "Forecast electricity demand or stock prices: preprocess time-series data (stationarity test, differencing, lag features), build a Facebook Prophet model as baseline, then build an LSTM with PyTorch, evaluate with RMSE/MAE/MAPE on a test split. Visualize predictions with confidence intervals.",
          "Time-series forecasting is in every domain: logistics, energy, finance, SaaS metrics. Knowing both statistical (Prophet) and neural approaches makes you versatile.",
          "Both models evaluated on test set, LSTM beating Prophet by ≥10% on RMSE, confidence interval plots.",
          20,
          ["https://facebook.github.io/prophet/docs/quick_start.html", "https://pytorch.org/tutorials/beginner/basics/buildmodel_tutorial.html", "YouTube: Andrej Karpathy — Neural Networks Zero to Hero"],
        ),
      ]),
      phase("Deep Learning & LLMs", [
        task(
          "Build and train a convolutional neural network for image classification",
          "Train a CNN on CIFAR-10 from scratch with PyTorch: build the architecture (conv→BN→ReLU→pool), implement data augmentation, use learning rate scheduling, monitor training curves with Weights & Biases, achieve ≥85% test accuracy, and deploy as a FastAPI endpoint with ≤200ms inference.",
          "CNNs are the foundation of computer vision. Training one from scratch on a real benchmark makes deep learning concrete rather than theoretical.",
          "CNN with ≥85% CIFAR-10 test accuracy, training curves in W&B, FastAPI endpoint with <200ms latency.",
          20,
          ["https://pytorch.org/tutorials/beginner/blitz/cifar10_tutorial.html", "https://docs.wandb.ai/", "YouTube: Andrej Karpathy — CNN Explained"],
        ),
        task(
          "Build a RAG (Retrieval Augmented Generation) system with LangChain and Chroma",
          "Build a document Q&A system: ingest PDFs and web pages, chunk text, embed with OpenAI or a local model (all-MiniLM), store in Chroma, implement RAG with LangChain. Add conversation memory, source citations, and a hallucination detection step. Deploy as a web app.",
          "RAG is the dominant LLM application pattern in production. Every company building with LLMs uses some form of RAG — mastering it is the most employable LLM skill in 2025.",
          "RAG app ingesting 5+ documents, answering questions with source citations, hallucination rate <15%.",
          22,
          ["https://python.langchain.com/docs/tutorials/rag/", "https://docs.trychroma.com/", "YouTube: James Briggs — LangChain RAG Tutorial"],
        ),
        task(
          "Fine-tune a language model with LoRA and deploy with ONNX or vLLM",
          "Fine-tune a 7B parameter model (Mistral or LLaMA 3) on a domain-specific dataset using QLoRA (4-bit quantization + LoRA adapters) with Hugging Face PEFT and trl. Evaluate perplexity and task-specific metrics before/after fine-tuning. Export to ONNX and serve with vLLM for throughput testing.",
          "Fine-tuning LLMs is the highest-value LLM skill in the job market. QLoRA makes it possible on consumer hardware — understanding it puts you ahead of most ML engineers.",
          "Fine-tuned model with ≥20% improvement on task metric, vLLM serving at 50+ tokens/s throughput.",
          24,
          ["https://huggingface.co/docs/peft/index", "https://docs.vllm.ai/en/latest/", "YouTube: Andrej Karpathy — finetuning LLMs"],
        ),
      ]),
      phase("MLOps & Production AI", [
        task(
          "Build an ML training pipeline with Prefect and MLflow",
          "Orchestrate a full ML pipeline with Prefect: data ingestion → feature engineering → training → evaluation → model registration. Track experiments with MLflow (parameters, metrics, artifacts). Implement model versioning with staging/production promotion and A/B test comparison.",
          "MLOps is what separates notebooks from production ML. Knowing Prefect + MLflow is the minimum viable toolchain for ML engineering roles.",
          "Prefect pipeline with 5 tasks, 10+ experiments tracked in MLflow, A/B test promoting best model.",
          20,
          ["https://docs.prefect.io/latest/", "https://mlflow.org/docs/latest/index.html", "YouTube: Patrick Loeber — MLflow Tutorial"],
        ),
        task(
          "Deploy a ML model with BentoML, auto-scaling, and monitoring",
          "Package a trained model with BentoML: define a Service with preprocessing/postprocessing, add input validation, build a Docker image with bentoml build, deploy to a Kubernetes cluster (or Railway), set up horizontal pod autoscaling, and add Prometheus metrics for inference latency and throughput.",
          "Deploying ML models to production is the skill gap that most data scientists have. Knowing BentoML + K8s autoscaling makes you a full ML engineer.",
          "Model API with <100ms p99 latency, autoscaling from 1 to 3 pods under load, Grafana dashboard.",
          20,
          ["https://docs.bentoml.com/en/latest/get-started/quickstart.html", "https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/", "YouTube: BentoML — Production ML Tutorial"],
        ),
        task(
          "Build an AI agent with tool use, memory, and guardrails",
          "Build a ReAct-style AI agent using LangGraph: define tools (web search, calculator, code execution, database query), implement short-term (in-context) and long-term (vector DB) memory, add guardrails for prompt injection and harmful output detection, and log all agent traces to LangSmith.",
          "Agentic AI systems are the dominant AI application architecture of 2025-2026. LangGraph is the production framework — knowing it positions you for the fastest-growing area in software engineering.",
          "Agent completing 5 multi-step tasks using ≥3 tools, memory persisting across sessions, guardrails tested.",
          22,
          ["https://langchain-ai.github.io/langgraph/", "https://docs.smith.langchain.com/", "YouTube: LangChain — LangGraph Tutorial"],
        ),
      ]),
    ])],
  },

  // ── React Native ─────────────────────────────────────────────────────────
  "react-native": {
    tracks: [track("React Native", "#61dafb", [
      phase("React Native Core", [
        task(
          "Build a cross-platform todo app with Expo and AsyncStorage",
          "Build a todo app with Expo: FlatList for virtual scrolling, custom components with StyleSheet.create, Animated API for swipe-to-delete, AsyncStorage for persistence, and Expo Router for navigation. Must work on iOS and Android without platform-specific code.",
          "React Native translates web React skills to mobile. Building a real app with Expo teaches the differences: styling (no CSS), layout (Flexbox always), and navigation patterns.",
          "Todo app running on iOS and Android simulators, swipe-to-delete animation, persisted data.",
          14,
          ["https://docs.expo.dev/get-started/introduction/", "https://reactnative.dev/docs/getting-started", "YouTube: Traversy Media — React Native Crash Course"],
        ),
        task(
          "Build a camera app with native modules and permissions",
          "Build a photo/video capture app using Expo Camera: request camera and gallery permissions, preview live camera feed, capture photos and videos, apply real-time filters using GL React Native, save to the device photo library with MediaLibrary, and share via the share sheet.",
          "Camera and media APIs expose you to native module integration — the hardest part of React Native. Mastering permissions, native libraries, and the expo-modules system.",
          "Camera app capturing photos/video, filters applied in real time, saved to gallery, share sheet working.",
          16,
          ["https://docs.expo.dev/versions/latest/sdk/camera/", "https://docs.expo.dev/versions/latest/sdk/media-library/", "YouTube: Simon Grimm — Expo Camera Tutorial"],
        ),
        task(
          "Build a real-time location tracking app with maps",
          "Build a delivery tracking app: foreground and background location updates using expo-location, display on MapView (React Native Maps), animate a marker following the route, calculate ETA, draw route polylines, and handle GPS accuracy changes. Test on physical device.",
          "Location and maps are in every delivery, fitness, and travel app. Expo Location + Maps is the production stack for React Native.",
          "App tracking location in background, animated marker, route polyline, ETA calculation, tested on physical device.",
          18,
          ["https://docs.expo.dev/versions/latest/sdk/location/", "https://docs.expo.dev/versions/latest/sdk/map-view/", "YouTube: Simon Grimm — React Native Maps Tutorial"],
        ),
      ]),
      phase("Navigation, State & Native APIs", [
        task(
          "Build a multi-screen app with Expo Router and bottom tab navigation",
          "Build a social media feed app with Expo Router: Stack navigator for feed → post detail → profile, Tab navigator for home/search/notifications/profile, Drawer for settings, and deep linking with expo-linking. Implement shared element transitions between screens.",
          "Navigation is 40% of a mobile app's complexity. Expo Router's file-based routing is the modern pattern — mastering it means navigating any React Native codebase.",
          "App with Stack + Tab + Drawer navigation, deep linking to post/:id working, shared element transition.",
          18,
          ["https://docs.expo.dev/router/introduction/", "https://reactnavigation.org/docs/getting-started/", "YouTube: Traversy Media — Expo Router Tutorial"],
        ),
        task(
          "Build an offline-first app with Zustand and WatermelonDB",
          "Build a notes app that works offline: use WatermelonDB (SQLite-backed) as the local database, Zustand for UI state, and implement sync with a Supabase backend. Handle conflict resolution on sync, optimistic UI updates, and show sync status to the user.",
          "Offline-first is the key differentiator of native mobile apps over web apps. WatermelonDB is one of the fastest mobile databases — capable of 10 000 queries per second.",
          "Notes app with 500+ notes in WatermelonDB, offline creation/editing, sync to Supabase on reconnect.",
          20,
          ["https://nozbe.github.io/WatermelonDB/", "https://docs.pmnd.rs/zustand/getting-started/introduction", "YouTube: Simon Grimm — Offline First React Native"],
        ),
        task(
          "Add push notifications and background tasks with Expo Notifications",
          "Implement push notifications in a React Native app: register device with Expo Push Notification service, handle foreground/background/quit notification states, implement notification categories with action buttons, set up a Node.js backend to send targeted notifications, and handle notification-based deep linking.",
          "Push notifications are the #1 retention tool for mobile apps. Implementing them correctly — including background handling and deep linking — requires understanding the iOS and Android notification lifecycle.",
          "Push notifications working on physical iOS and Android devices, action buttons, deep link from notification.",
          16,
          ["https://docs.expo.dev/push-notifications/overview/", "https://docs.expo.dev/versions/latest/sdk/notifications/", "YouTube: Expo — Push Notifications Tutorial"],
        ),
      ]),
      phase("Performance & Publishing", [
        task(
          "Optimize React Native performance: Hermes, Reanimated, and Flashlist",
          "Profile a slow React Native app with Flipper and the React DevTools Profiler. Optimize by: migrating from Animated to Reanimated 3 (runs on JS thread vs UI thread), replacing FlatList with Flashlist (4× faster), enabling Hermes JS engine, implementing useCallback/useMemo, and using InteractionManager for expensive operations.",
          "React Native performance issues are subtle and hard to debug. Knowing the profiling tools and optimization patterns is what separates React Native beginners from engineers who can maintain 60fps apps.",
          "App frame rate improved from 40 to 58fps, Reanimated animations running on UI thread, Flashlist benchmark.",
          18,
          ["https://docs.swmansion.com/react-native-reanimated/", "https://shopify.github.io/flash-list/", "YouTube: William Candillon — Reanimated 3 Tutorial"],
        ),
        task(
          "Build an Expo bare workflow app with custom native module in Swift/Kotlin",
          "Eject from Expo managed workflow to bare workflow. Write a native module in Swift (iOS) and Kotlin (Android) that exposes device-level functionality (biometrics, local authentication, or Bluetooth). Bridge it to JavaScript with the Expo Modules API. Run on physical devices for both platforms.",
          "Understanding how to write native modules is what lets you access any device capability from React Native — removing the dependency on third-party packages for everything.",
          "Native module in Swift + Kotlin, bridged via Expo Modules API, working on iOS and Android physical devices.",
          22,
          ["https://docs.expo.dev/modules/module-api/", "https://reactnative.dev/docs/native-modules-intro", "YouTube: Expo — Native Module Tutorial"],
        ),
        task(
          "Submit a React Native app to App Store and Google Play",
          "Configure app signing (iOS Distribution Certificate, Android Keystore), build release binaries with EAS Build, write App Store and Play Store listings (screenshots, description, keywords), submit for review, respond to review feedback, and set up EAS Update for over-the-air JS updates post-submission.",
          "Publishing is where 30% of React Native developers give up. Walking through the full submission process once removes all the mystery around certificates, provisioning profiles, and store review.",
          "App approved and live on both App Store and Google Play, OTA update pipeline configured with EAS.",
          16,
          ["https://docs.expo.dev/submit/introduction/", "https://docs.expo.dev/eas-update/introduction/", "YouTube: Simon Grimm — App Store Submission Guide"],
        ),
      ]),
    ])],
  },

  // ── Video Editing ─────────────────────────────────────────────────────────
  "video-editing": {
    tracks: [track("Video Editing", "#e11d48", [
      phase("Foundations of Editing", [
        task(
          "Master the DaVinci Resolve interface — cut a 3-minute vlog",
          "Download DaVinci Resolve (free). Import your own footage or download free footage from Pexels. Learn the Cut and Edit pages: importing media, creating a timeline, cutting clips with the blade tool, ripple deletes, transitions, and exporting an H.264 MP4. Your vlog must have a clear beginning, middle, and end — not just random clips stitched together. Approach: watch 'DaVinci Resolve Beginner Course' by Casey Faris on YouTube (2024), then immediately apply each technique to your own footage. Don't follow tutorials passively — pause after every concept and do it yourself.",
          "DaVinci Resolve is industry-standard and completely free. Learning the interface first means every other tool you learn builds on solid foundations.",
          "3-minute vlog exported and uploaded to YouTube or Vimeo, watchable by a stranger.",
          12,
          ["https://www.youtube.com/watch?v=63Ln33O4p4c", "https://www.pexels.com/videos/", "https://www.blackmagicdesign.com/products/davinciresolve"],
        ),
        task(
          "Study cutting theory — re-edit a famous scene to understand pacing",
          "Pick any YouTube video of a film scene breakdown or watch 'Every Frame a Painting' essays. Then take 5 minutes of your own footage and edit it three different ways: fast-paced with music-driven cuts, slow-paced documentary style, and tension-building with minimal cuts. Export all three and compare. The goal is to feel how edit pacing changes the emotion. Approach: analyse how Linus Tech Tips, Veritasium, or MrBeast structure their videos — what do the first 10 seconds do? When do they cut?",
          "Technical skill without storytelling instinct produces boring videos. Understanding WHY you cut — not just how — is what separates editors clients hire again.",
          "Three versions of the same footage exported, with written notes on what each editing style communicates.",
          10,
          ["https://www.youtube.com/c/everyframeapainting", "https://www.youtube.com/@ThomasFrank", "Book: In the Blink of an Eye by Walter Murch (read summary on YouTube)"],
        ),
        task(
          "Colour grade a short film using DaVinci Resolve's Colour page",
          "Take 5 clips with flat/LOG colour profiles (download free log footage from BlackMagic's sample library) and grade them: use primary wheels to fix exposure and white balance, apply a LUT for a starting point, then refine with curves and hue vs saturation. Create two looks: a warm cinematic grade and a cold desaturated grade. Approach: search 'DaVinci Resolve colour grading tutorial 2024' — use Darren Mostyn's channel or Waqas Qazi for practical walkthroughs. Colour grading is 90% about matching nodes consistently, not magic presets.",
          "Colour grading transforms footage from amateur to professional. Every client video you ever edit will need this.",
          "5 clips graded to a consistent, intentional look — before/after screenshots showing transformation.",
          14,
          ["https://www.youtube.com/@DarrenMostyn", "https://www.youtube.com/@waqasqazi", "https://www.blackmagicdesign.com/support/download/e5e186b7e2b24680bf35dc8bd73e9fdc/Linux"],
        ),
      ]),
      phase("Professional Techniques", [
        task(
          "Add motion graphics and lower thirds with Fusion in DaVinci Resolve",
          "Use DaVinci Resolve's built-in Fusion page to create: a lower-third name title, an animated logo reveal, and a kinetic text sequence where words animate onto screen. Approach: start with Fusion's template lower thirds (built-in), then modify them. Then watch 'Fusion Motion Graphics for Beginners' by Darren Mostyn. The key concept is the node graph — each node transforms the image. Work from the MediaIn node outward. Don't try to build everything from scratch — start with templates and deconstruct them.",
          "Editors who can create motion graphics earn 40-60% more than pure cutters. This is the difference between basic and premium work.",
          "Lower third, logo animation, and kinetic text sequence all created in Fusion — exported as usable assets.",
          16,
          ["https://www.youtube.com/@DarrenMostyn", "https://motionarray.com/learn/davinci-resolve/", "YouTube: Casey Faris — DaVinci Resolve Fusion Basics"],
        ),
        task(
          "Edit a 5-minute YouTube tutorial video with chapters, B-roll, and audio repair",
          "Record yourself explaining something you know (any topic). Edit it as a professional tutorial: cut dead air with ripple delete, add B-roll at key points (screen recordings, diagrams), add chapter markers, use Fairlight's audio repair to remove noise and level the audio, add music at 10-15dB below voice, and add an end screen graphic. Approach: use Adobe Audition's free trial or DaVinci Resolve's Fairlight for audio — the key is cutting first, then audio, then colour, then graphics. Never do all four simultaneously.",
          "Tutorial and educational content is the highest-demand type of editing work — companies, creators, and educators all need it constantly.",
          "5-minute tutorial uploaded to YouTube with chapters, clean audio, B-roll, and end screen.",
          18,
          ["https://www.youtube.com/@VidIQ", "https://www.youtube.com/@YesImaTechGuy", "https://www.youtube.com/@Fireship"],
        ),
        task(
          "Create a short film or brand video reel for your portfolio",
          "This is your portfolio piece. Shoot or source footage for a 60-90 second brand video or a 3-5 minute short film. Apply everything: colour grading, motion graphics title, sound design (add ambient sound, music, and sound effects independently), and a compelling narrative structure. Approach: write a one-paragraph treatment first — what story are you telling and how will the edit reflect it? Watch 'Film Riot' and 'Corridor Crew' on YouTube for real production thinking. Share the final video on Vimeo with a password for clients.",
          "This single video will get you more freelance clients than any CV. It demonstrates every skill simultaneously.",
          "60-90 second brand video or 3-5 minute short film, exported in 4K, published on Vimeo.",
          24,
          ["https://vimeo.com/", "https://www.youtube.com/@FilmRiot", "https://www.youtube.com/@CorridorCrew", "https://www.artlist.io/ (royalty-free music)"],
        ),
      ]),
    ])],
  },

  // ── Graphic Design ────────────────────────────────────────────────────────
  "graphic-design": {
    tracks: [track("Graphic Design", "#ec4899", [
      phase("Design Fundamentals", [
        task(
          "Study and apply the four core design principles to 10 redesigns",
          "Read or watch 'The Non-Designer's Design Book' concepts (available as YouTube summaries). The four principles are Contrast, Repetition, Alignment, and Proximity (CRAP). Take 10 real-world flyers, social posts, or posters and redesign each one in Canva, applying one principle per redesign. Write one sentence explaining what you changed and why. Approach: do NOT start in Photoshop yet. Canva removes technical friction so you can focus on design thinking. Understand the principles first — software is just a tool.",
          "Most design problems are not software problems — they are thinking problems. These four principles fix 90% of amateur design instantly.",
          "10 before/after redesigns with written explanations, shared in a PDF or Notion portfolio.",
          10,
          ["https://www.canva.com/", "https://www.youtube.com/watch?v=_Duu1KF65LQ", "Book: The Non-Designer's Design Book — Robin Williams (borrow from Library Genesis)"],
        ),
        task(
          "Master typography — design 5 typographic posters",
          "Typography is the foundation of all graphic design. Study the difference between serif, sans-serif, display, and monospace typefaces. Learn kerning, leading, tracking, hierarchy, and pairing. Design five typographic-only posters (no images — just text) using Adobe Illustrator or Figma: a motivational quote, an event poster, a minimalist book cover, a band poster, and a data/infographic piece. Use Google Fonts and Adobe Fonts. Approach: watch 'Typography Tutorial for Beginners' by Will Paterson, then design each poster from scratch without using templates.",
          "Bad typography makes good content look unprofessional. The ability to use type intentionally is what instantly elevates your work.",
          "5 typographic posters, exported as high-res PDFs, added to your portfolio.",
          12,
          ["https://fonts.google.com/", "https://www.youtube.com/@willpaterson", "https://fontpair.co/", "https://www.figma.com/"],
        ),
        task(
          "Design a complete brand identity for a fictional business",
          "Choose a fictional business (coffee shop, tech startup, clothing brand). Design the complete brand identity: logo (primary + secondary + icon versions), colour palette (5 colours with HEX codes and usage rules), typography system (heading font + body font), business card, letterhead, and social media profile and banner. Do it all in Adobe Illustrator. Approach: start with the logo concept — sketch 20 rough ideas by hand first, then pick the best 3 to develop digitally. Study real brand guidelines from companies like Airbnb, Slack, or Spotify on BrandNew or Brand Style Guide websites.",
          "Brand identity design is the highest-paid niche in graphic design. This project simulates exactly what a real client brief looks like.",
          "Complete brand identity package with logo files (SVG, PNG, PDF), brand guidelines PDF, business card, and social media assets.",
          22,
          ["https://www.underconsideration.com/brandnew/", "https://www.youtube.com/@TutsByAJ", "https://www.youtube.com/@PikPakDesign", "https://adobe.com/illustrator"],
        ),
      ]),
      phase("Production & Client Work", [
        task(
          "Design social media content for a full month (30 posts)",
          "Create 30 social media posts for a fictional brand — 10 Instagram square posts, 10 Instagram Story templates, and 10 LinkedIn posts. Maintain consistent brand identity across all. Use a 3x3 Instagram grid strategy. Approach: design 5 reusable templates first, then produce variations from them — this is how agencies stay efficient. Use Adobe Photoshop for photo-heavy work and Illustrator for graphics. Export everything at the correct dimensions: 1080x1080px Instagram, 1080x1920px Stories, 1200x627px LinkedIn.",
          "Social media design is the bread-and-butter of freelance graphic designers. Learning to work fast with templates is a professional survival skill.",
          "30 ready-to-publish posts across formats, delivered in a Google Drive folder with correct naming conventions.",
          18,
          ["https://later.com/blog/social-media-image-sizes/", "https://www.youtube.com/@TutsByAJ", "Adobe Photoshop + Illustrator CC"],
        ),
        task(
          "Design a product packaging and mockup presentation",
          "Design packaging for a product of your choice — a perfume bottle, a chocolate bar, a tech gadget box, or a food jar. Create the flat design in Illustrator with print bleed marks and CMYK colour mode. Then present it using a free 3D mockup (from Mockup World or Freepik) in Photoshop using Smart Objects. Approach: study real packaging on Behance first — notice how hierarchy guides the eye (product name > benefit > details). The mockup presentation is what impresses clients — raw artwork files are not enough.",
          "Packaging design pays extremely well and requires physical print knowledge that sets you apart from digital-only designers.",
          "Packaging flat design in Illustrator + photorealistic 3D mockup, published on Behance.",
          20,
          ["https://www.mockupworld.co/", "https://www.behance.net/", "https://www.youtube.com/@SatoroDesign", "https://www.youtube.com/@YesImaTechGuy"],
        ),
        task(
          "Build a professional Behance portfolio with 3 case studies",
          "Your portfolio is your CV. Create a Behance account and upload three full case studies — not just final images, but the process: the brief, your research, sketches/wireframes, iterations, and final output. For each project write a 200-word description explaining your design decisions. Approach: look at top-rated Behance portfolios in your niche for structure inspiration. Get feedback from the Graphic Design Reddit community or DesignCrit forums. Apply the feedback and update.",
          "Clients and agencies judge your work by your portfolio, not your resume. A strong Behance profile gets you inbound inquiries without pitching.",
          "Behance profile with 3 complete case studies, each with process documentation and minimum 500 views.",
          14,
          ["https://www.behance.net/", "https://www.reddit.com/r/graphic_design/", "https://www.youtube.com/@CharlieMarieTV"],
        ),
      ]),
    ])],
  },

  // ── Prompt Engineering ────────────────────────────────────────────────────
  "prompt-engineering": {
    tracks: [track("Prompt Engineering", "#10b981", [
      phase("Understanding LLMs", [
        task(
          "Run 50 structured experiments to understand how GPT-4o and Claude behave",
          "Create a spreadsheet with 50 prompt experiments. Test: zero-shot vs few-shot vs chain-of-thought prompting, different temperature settings (0 vs 0.7 vs 1.2), system prompt effects, persona prompts, and format constraints. Use the OpenAI Playground and Claude.ai interface. Write a clear hypothesis before each test and record what actually happened. Approach: use free API credits from OpenAI (sign up) and Claude.ai free tier. The goal is not to use the results — it is to build an intuition for how language models process instructions.",
          "You cannot engineer prompts reliably if you don't understand the model's behaviour. Experimentation before application is the difference between prompt engineering and prompt guessing.",
          "Spreadsheet of 50 documented experiments with hypotheses, results, and one-sentence conclusions.",
          12,
          ["https://platform.openai.com/playground", "https://claude.ai/", "https://learnprompting.org/", "https://www.promptingguide.ai/"],
        ),
        task(
          "Master chain-of-thought prompting — solve 20 reasoning problems",
          "Chain-of-thought (CoT) prompting dramatically improves AI reasoning on complex problems. Practice by solving 20 problems across types: maths word problems, logical puzzles, code debugging, business analysis, and essay outlining. For each, write a CoT prompt that instructs the model to think step by step, and compare it to a direct-answer prompt. Approach: use 'Let's think step by step' as a baseline, then improve to structured CoT: 'First identify the key variables. Then determine the relationships. Then calculate.' Measure whether quality improves.",
          "CoT is the single most impactful prompting technique. Understanding when and how to use it is what makes you valuable to companies building AI features.",
          "20 documented CoT prompt pairs (with and without), showing measurable quality improvement in at least 15/20 cases.",
          10,
          ["https://www.promptingguide.ai/techniques/cot", "https://arxiv.org/abs/2201.11903", "https://learnprompting.org/docs/intermediate/chain_of_thought"],
        ),
        task(
          "Build a RAG (Retrieval-Augmented Generation) Q&A system over a PDF",
          "Use LangChain or LlamaIndex with the OpenAI API to build a system that answers questions about any PDF document. The pipeline: load the PDF, chunk it into segments, generate embeddings, store in a vector database (use Chroma locally — it's free), and at query time retrieve the top-3 relevant chunks and feed them to GPT-4o with a grounding prompt. Approach: start with LangChain's cookbook example, then modify it. The most common mistake is poor chunking — experiment with chunk sizes (256 vs 512 vs 1024 tokens) and measure answer quality. Deploy a simple Gradio UI to test it.",
          "RAG is the foundational architecture behind every enterprise AI chatbot. Building one from scratch means you can work at any company doing serious AI development.",
          "Working RAG Q&A system that correctly answers 8/10 factual questions about a real PDF document.",
          18,
          ["https://python.langchain.com/docs/use_cases/question_answering/", "https://docs.llamaindex.ai/en/stable/", "https://www.trychroma.com/", "YouTube: Sam Witteveen — LangChain RAG Tutorial"],
        ),
      ]),
      phase("Advanced Systems", [
        task(
          "Design and test system prompts for three different AI assistant personas",
          "Build three production-quality system prompts: a customer support bot for a SaaS product (must handle refunds, bug reports, and escalations), a coding assistant (must explain, debug, and review code with consistent style), and a research analyst (must cite sources, acknowledge uncertainty, and present balanced views). Test each with 20 adversarial inputs designed to break them. Approach: the best system prompts are written like contracts — define what the AI IS, what it DOES, what it NEVER does, and what format it uses. Iterate based on failures.",
          "System prompt design is what companies pay premium rates for — it is engineering, not just writing.",
          "Three documented system prompts with test suites showing they hold up under adversarial inputs.",
          14,
          ["https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview", "https://platform.openai.com/docs/guides/prompt-engineering", "https://www.anthropic.com/research/claude-character"],
        ),
        task(
          "Build an AI agent with tool use that can research a topic and write a report",
          "Using the Anthropic or OpenAI API with function calling / tool use, build an agent that: searches the web (use Tavily API — free tier available), reads URLs, extracts key information, and writes a structured research report with citations. The agent should decide which tools to use and in what order based on the task. Approach: start by defining 3 tools (search, read_url, write_section) with clear JSON schemas. Test with a simple task first: 'Research the current state of electric vehicles in Africa.' The hardest part is the tool output formatting — keep it clean and consistent.",
          "AI agents are the future of automation. Building one teaches you the architecture patterns that underlie every autonomous AI system.",
          "Agent that produces a 500-word research report with 3+ sources cited on any given topic.",
          20,
          ["https://docs.anthropic.com/en/docs/build-with-claude/tool-use", "https://tavily.com/", "https://platform.openai.com/docs/guides/function-calling", "YouTube: David Ondrej — Build AI Agents"],
        ),
        task(
          "Build and launch a prompt engineering portfolio with 5 case studies",
          "Document 5 real prompting projects: the problem, your initial prompt, what failed, how you iterated, the final prompt, and measurable results. Publish on a simple Notion page or GitHub README. Share it on LinkedIn and the r/PromptEngineering subreddit. Approach: the best case studies show your thinking process, not just the final answer. Include the bad versions — they demonstrate expertise. Apply for one AI company's prompt engineer role using the portfolio.",
          "Prompt engineering is a new enough field that a documented portfolio puts you ahead of 95% of applicants who only list 'ChatGPT' on their CV.",
          "Published portfolio with 5 case studies, shared publicly, with at least one application submitted.",
          16,
          ["https://www.reddit.com/r/PromptEngineering/", "https://www.notion.so/", "https://jobs.anthropic.com/", "https://openai.com/careers/"],
        ),
      ]),
    ])],
  },

  // ── AI Automation ─────────────────────────────────────────────────────────
  "ai-automation": {
    tracks: [track("AI Automation", "#8b5cf6", [
      phase("Automation Foundations", [
        task(
          "Build 5 basic automations in n8n — lead capture, email, Slack, sheets",
          "Install n8n locally (free, open-source: npm install n8n -g) or use n8n.cloud free trial. Build these 5 workflows: (1) When a Google Form is submitted, add the data to a Google Sheet and send a welcome email. (2) When a new email arrives with 'invoice' in the subject, save the attachment to Google Drive. (3) Post a daily weather report to a Slack channel. (4) When a tweet mentions your keyword, log it to Airtable. (5) Send yourself a summary of your unread Gmail each morning. Approach: start with the trigger node, then add one node at a time. Test after each node — don't build the whole chain before testing.",
          "These 5 automations represent the 5 most common client requests. Once you can build them in under an hour each, you have a business.",
          "5 working n8n workflows with documentation screenshots, all tested end-to-end.",
          14,
          ["https://n8n.io/", "https://docs.n8n.io/", "https://www.youtube.com/@n8n-io", "YouTube: Liam Ottley — n8n for Beginners"],
        ),
        task(
          "Build an AI customer support agent using n8n + OpenAI",
          "Build a workflow in n8n that: receives a customer message (via webhook or email), classifies the intent using GPT-4o-mini (billing question vs technical issue vs feature request), routes to the right response template, personalises the response with customer data from a Google Sheet, and sends the reply. Approach: the AI classification step is just one node — an OpenAI node with a prompt like 'Classify this support message into: billing, technical, feature-request, or other. Return only the category.' Then use a Switch node to route based on that output. Test with 20 real-style messages.",
          "AI customer support automation is the #1 service businesses are actively paying for right now. Building this positions you at the intersection of AI and business value.",
          "AI support agent that correctly classifies and responds to 18/20 test messages in under 5 seconds.",
          18,
          ["https://n8n.io/", "https://platform.openai.com/docs/models/gpt-4o-mini", "YouTube: Leon van Zyl — AI Automation Business", "https://www.youtube.com/@AIJason"],
        ),
        task(
          "Build a lead generation and outreach automation",
          "Build a workflow that: scrapes leads from a source (LinkedIn via Phantombuster free tier, or a public directory), enriches each lead with company info using Clearbit or Hunter.io, generates a personalised outreach email using GPT-4o (using the person's name, company, and role), and queues the emails in a Google Sheet for manual review before sending. Approach: NEVER send mass emails automatically without manual review first — this is both ethical and practical (bad emails destroy your domain reputation). The human-in-the-loop step is a feature, not a weakness.",
          "Lead generation automation is the most financially valuable automation skill for freelancers. This workflow alone can generate £2,000-5,000/month in client value.",
          "Automation that enriches and drafts personalised outreach for 50 leads, ready for human review.",
          20,
          ["https://www.phantombuster.com/", "https://hunter.io/", "https://n8n.io/", "YouTube: Liam Ottley — AI Lead Generation"],
        ),
      ]),
      phase("Advanced AI Workflows", [
        task(
          "Build a content repurposing pipeline: one video → 10 pieces of content",
          "Build a workflow that takes a YouTube video URL, extracts the transcript using YouTube's API or Whisper, feeds it to GPT-4o to generate: a Twitter/X thread (10 tweets), a LinkedIn post, a blog post outline, 5 short quote graphics, and an email newsletter. Output everything to a Google Doc with sections. Approach: the transcript extraction is the hardest step — use a YouTube transcript fetcher library or Whisper API. The content generation is just structured prompts. The key insight is getting GPT-4o to write in YOUR voice — feed it 3 examples of your existing content as style examples in the system prompt.",
          "Content repurposing is a £500-2000/month retainer service. Automating it means you can serve 10 clients with the work of one.",
          "Pipeline that turns any YouTube video into 7+ content pieces in under 3 minutes.",
          22,
          ["https://n8n.io/", "https://openai.com/research/whisper", "YouTube: Matt Wolfe — AI Content Automation", "https://www.youtube.com/@AIJason"],
        ),
        task(
          "Sell your first automation to a real business",
          "This is the graduation task. Find one real small business owner (restaurant, consultant, estate agent, e-commerce store) and offer to automate one repetitive task for them for free. Deliver it. Then document what you built in a 500-word case study with before/after time savings. Approach: the best way to find clients is to post in local Facebook business groups, ask in LinkedIn comments on pain-point posts, or offer to a friend's business. The most common automations SMEs will pay for: appointment booking, invoice chasing, social media posting, and customer follow-up emails. Charge £300-800 for the second client.",
          "Real-world delivery experience is worth 10 tutorial projects. You learn about edge cases, client expectations, and iteration only by shipping to a real user.",
          "One real automation delivered, running in production, with a documented case study.",
          24,
          ["https://www.fiverr.com/", "https://www.upwork.com/", "https://www.linkedin.com/", "YouTube: Liam Ottley — How to Sell Automations"],
        ),
      ]),
    ])],
  },

  // ── Excel & Data Analysis ─────────────────────────────────────────────────
  "excel-data": {
    tracks: [track("Excel & Data Analysis", "#217346", [
      phase("Excel Mastery", [
        task(
          "Master 20 essential Excel functions through a real sales dataset",
          "Download a free sales dataset from Kaggle (search 'sales data CSV'). Load it into Excel or Google Sheets. Practice: VLOOKUP and XLOOKUP (cross-referencing data), INDEX/MATCH (more flexible lookups), SUMIF/COUNTIF/AVERAGEIF (conditional aggregation), TEXT functions (LEFT, RIGHT, MID, TRIM, CONCATENATE), and date functions (DATEDIF, NETWORKDAYS, EDATE). Approach: don't memorise formulas — understand what each formula DOES and when you'd need it. For each function, find a real question in the dataset that the formula answers ('Which salesperson had the highest Q3 revenue?').",
          "These 20 functions handle 80% of real business analysis tasks. Mastering them means you can answer any business question from a spreadsheet in minutes.",
          "Analysis workbook with 20 functions applied to real data, each answering a specific business question.",
          14,
          ["https://www.kaggle.com/datasets", "https://support.microsoft.com/en-us/office/excel-functions-alphabetical-b3944572-255d-4efb-bb96-c6d90033e188", "YouTube: Leila Gharani — Excel for Beginners 2024"],
        ),
        task(
          "Build a dynamic sales dashboard with pivot tables and slicers",
          "Using the same sales dataset, build a one-page Excel dashboard: a pivot table showing revenue by product and region, a line chart of monthly revenue trend, a bar chart of top 10 salespeople, and slicers to filter everything by date range, region, and product category. Format it professionally with consistent colours and no gridlines. Approach: build the pivot tables first, then insert charts from the pivot data. Slicers connect to all pivot tables — right-click a slicer and select 'Report Connections' to link it to multiple tables. The dashboard should update automatically when new data is added.",
          "Pivot table dashboards are the #1 thing non-technical managers want from their data analysts. Being able to build one in 30 minutes makes you invaluable.",
          "Professional Excel dashboard with 3 charts, 4 slicers, and automatic updates from raw data.",
          16,
          ["https://support.microsoft.com/en-us/office/create-a-pivottable-to-analyze-worksheet-data-a9a84538-bfe9-40a9-a8e9-f99134456576", "YouTube: Leila Gharani — Excel Dashboard Tutorial"],
        ),
        task(
          "Automate a monthly report with Power Query and Excel macros",
          "Set up Power Query to automatically import, clean, and transform a CSV file that updates monthly (use any recurring dataset — weather data, currency rates, or sports scores from a free API). Then record a macro that formats and exports a PDF report. Approach: Power Query is the 'transform' step — learn to filter rows, split columns, merge tables, and change data types in the Query Editor. Macros are recorded actions — record one, then look at the VBA code it generated. Modify one line of that VBA code to understand how it works.",
          "Automation removes the repetitive part of analysis. A data analyst who can automate their own reports has time to do actual analysis instead of copying and pasting.",
          "Power Query pipeline that auto-cleans monthly data + macro that generates a formatted PDF report.",
          18,
          ["https://support.microsoft.com/en-us/office/power-query-for-excel-help-2b433a85-ddfb-420b-9cda-fe0e60b82a94", "YouTube: Leila Gharani — Power Query for Beginners", "YouTube: ExcelJet — Excel VBA Macros"],
        ),
      ]),
      phase("Power BI & Business Intelligence", [
        task(
          "Build a Power BI dashboard connected to live data",
          "Download Power BI Desktop (free). Connect it to a public dataset (World Bank API, or download financial data from FRED). Build a report with: a KPI card, a map visualisation, a trend line, and a matrix table. Use DAX to write one calculated measure (e.g. YoY growth %). Approach: Power BI has a steep learning curve on relationships — before building visuals, go to the Model view and make sure your tables are connected correctly. A wrong relationship gives you wrong numbers that look right. DAX syntax: Measure = CALCULATE(SUM(Table[Column]), FILTER condition).",
          "Power BI is Microsoft's BI tool used by 97% of Fortune 500 companies. One Power BI project on your LinkedIn immediately attracts recruiter messages.",
          "Power BI dashboard published to Power BI Service (free account), with at least one DAX measure and a live data connection.",
          20,
          ["https://powerbi.microsoft.com/en-us/downloads/", "https://learn.microsoft.com/en-us/power-bi/fundamentals/desktop-getting-started", "YouTube: Guy in a Cube — Power BI for Beginners 2024"],
        ),
        task(
          "Analyse a real business problem and present findings to a non-technical audience",
          "Find a free business dataset on Kaggle or Data.world about an industry you find interesting (e-commerce, healthcare, sports, real estate). Ask one clear business question (e.g. 'Which customer segments churn most and why?'). Clean the data in Power Query, analyse it in Excel or Power BI, and present your findings in a 10-slide PowerPoint deck aimed at a non-technical CEO. Approach: the analysis is secondary to the communication. Every chart must have a title that states the conclusion ('Q4 revenue dropped 23% in West Africa, driven by logistics costs') — not just a description ('Revenue by region'). Submit the deck to r/datascience for feedback.",
          "The gap between data analysts who get promoted and those who don't is communication. Data without a story is just numbers.",
          "10-slide presentation answering a real business question with data, shared on LinkedIn and submitted for feedback.",
          22,
          ["https://www.kaggle.com/datasets", "https://data.world/", "https://www.reddit.com/r/datascience/", "YouTube: Alex the Analyst — Data Analyst Portfolio Projects"],
        ),
      ]),
    ])],
  },

  // ── Content Creation ──────────────────────────────────────────────────────
  "content-creation": {
    tracks: [track("Content Creation", "#ff0050", [
      phase("Foundation & Strategy", [
        task(
          "Define your niche, audience, and content pillars",
          "This is the most important step — most creators fail because they never get clear on this. Write a one-page creator brief: (1) Your specific niche (not 'tech' but 'affordable tech for African students'). (2) Your ideal audience persona — one specific person, described in detail. (3) Your three content pillars — the recurring themes that make up 80% of your content. (4) Your differentiator — the one thing that makes you different from the 100 other creators in your niche. Approach: research 10 successful creators in your niche. For each, identify their content pillar structure and what they do better than everyone else. Then find the gap they leave that you can fill.",
          "Creators who skip strategy spend years making content for the wrong audience. Clarity upfront means every piece of content you make compounds towards the same goal.",
          "Written creator brief with niche, audience persona, 3 content pillars, and differentiator — reviewed by one creator community member.",
          8,
          ["https://www.reddit.com/r/NewTubers/", "https://www.youtube.com/@ThinkMediaPodcast", "Book: 100M Offers by Alex Hormozi (free summary on YouTube)"],
        ),
        task(
          "Script and film your first 5 YouTube videos",
          "Write a script for each of your 5 first videos using the hook-value-CTA structure: the first 30 seconds MUST give the viewer a reason to stay (promise a specific outcome). Then deliver real, specific value. End with one clear call to action. Film each with whatever you have — even a phone camera is fine. Approach: the #1 mistake is over-editing your first videos. Film, do minimal editing (cut dead air and mistakes), upload. The goal is feedback from the algorithm, not perfection. Study your YouTube Analytics after each video — click-through rate and average view duration are the only metrics that matter.",
          "The creator who ships 100 imperfect videos will always beat the one who never publishes while waiting for perfect.",
          "5 YouTube videos published with >100 views each, average view duration >40%.",
          20,
          ["https://www.youtube.com/@TubeBuddy", "https://vidiq.com/", "YouTube: Think Media — YouTube for Beginners 2024"],
        ),
        task(
          "Master the thumbnail and title formula — A/B test 10 variations",
          "Thumbnails and titles are the two levers that directly control your click-through rate (CTR). Study MrBeast, Veritasium, Ali Abdaal, and MKBHD thumbnails — identify the recurring patterns (big face, high contrast, 1-3 words, implied story). Design 2 thumbnail variations for each of your first 5 videos using Canva or Photoshop. If you have access to YouTube's A/B test feature (TubeBuddy), test them. Otherwise, change your thumbnails after 48 hours and track CTR change. Approach: the best titles make a specific promise with a hint of curiosity gap — 'How I made £5,000 in 30 days with no experience' beats 'How to make money online'.",
          "A 2% CTR vs a 6% CTR on the same video means 3x more views from the same algorithmic push. Thumbnails are your most leveraged skill.",
          "10 A/B thumbnail tests documented with CTR before/after data.",
          12,
          ["https://www.tubebuddy.com/", "https://vidiq.com/", "YouTube: Matt D'Avella — YouTube Strategy", "https://www.canva.com/"],
        ),
      ]),
      phase("Growth & Monetisation", [
        task(
          "Build a content distribution system — 1 video = 5 pieces of content",
          "Set up a repurposing workflow: every long-form video becomes a YouTube Short, a TikTok, an Instagram Reel, a LinkedIn post, and a Twitter/X thread. Use CapCut (free) for vertical video editing. Approach: the key is to not re-edit from scratch — identify the single most valuable 60 seconds from your existing video and build the short-form content around that. Write the Twitter thread from your video script, not from scratch. This system means you publish 5x more content for the same effort.",
          "Distribution is why some creators with smaller audiences earn more. Being on every platform means more entry points to your core audience.",
          "Distribution system set up and running for 4 consecutive weeks, producing 5 content pieces per video.",
          16,
          ["https://www.capcut.com/", "https://buffer.com/ (free social scheduler)", "YouTube: Pat Flynn — Content Creation System"],
        ),
        task(
          "Reach 1,000 subscribers and apply for monetisation",
          "The YouTube Partner Program requires 1,000 subscribers and 4,000 watch hours. Work towards this by: posting consistently on a schedule (minimum weekly), engaging with every comment in the first 24 hours, collaborating with one similarly-sized creator, and optimising your 10 most-viewed videos (better thumbnails, updated descriptions with keywords). Approach: study your top 3 performing videos — what did they have in common? Make 5 more videos in exactly that format. Ask your email list or social media followers to subscribe. Milestone content ('I'm almost at 1000 subs') performs well for channel growth.",
          "Reaching 1,000 subscribers is the first real signal from the algorithm that your content works. It also unlocks monetisation and Community posts.",
          "1,000 YouTube subscribers and 4,000 watch hours achieved, YouTube Partner Program application submitted.",
          30,
          ["https://www.youtube.com/yt/creators/", "https://vidiq.com/", "YouTube: MKBHD on Growing a YouTube Channel"],
        ),
      ]),
    ])],
  },

  // ── Digital Marketing ─────────────────────────────────────────────────────
  "digital-marketing": {
    tracks: [track("Digital Marketing", "#10b981", [
      phase("Core Marketing Foundations", [
        task(
          "Build a complete customer persona and marketing funnel for a real business",
          "Choose a real local business or your own side project. Build: (1) Three detailed customer personas with demographics, psychographics, pain points, and buying triggers. (2) A funnel diagram showing awareness → interest → decision → action stages with specific content for each. (3) A competitive analysis of 3 competitors (what channels they use, what content works, where they are weak). Approach: use Facebook Audience Insights, Google Trends, Reddit, and Instagram comments to find real language your customers use. The best copy and ads use the customer's exact words — you find them by listening.",
          "Marketing strategy without audience research is just guessing. This foundational work means every campaign you run is targeted, not random.",
          "Written marketing strategy document with 3 personas, funnel map, and competitor analysis — reviewed and critiqued by one marketing community member.",
          10,
          ["https://trends.google.com/", "https://www.facebook.com/business/insights/tools/audience-insights", "YouTube: GaryVee — Digital Marketing Strategy", "https://sparktoro.com/ (free tier)"],
        ),
        task(
          "Run a real SEO campaign — rank a page in 90 days",
          "Build a simple website (WordPress or Webflow free tier) targeting a low-competition keyword. Find keywords with search volume 100-1000/month and KD under 20 using Ubersuggest free or Google Search Console. Write a 1,500-word article optimised for that keyword, build 5 backlinks from relevant sites or directories, and track your ranking weekly. Approach: the best beginner SEO strategy is targeting long-tail question keywords ('best laptops under £500 for students in Ghana') — lower competition, clearer intent, easier to rank. Use Google Search Console to verify search impressions.",
          "SEO is the only marketing channel where your past work keeps paying you. A ranked article earns traffic for years with zero ongoing cost.",
          "At least one page ranking in the top 30 results for a target keyword, with documented weekly rank tracking.",
          20,
          ["https://search.google.com/search-console/about", "https://neilpatel.com/ubersuggest/", "https://ahrefs.com/blog/seo-basics/", "YouTube: Ahrefs — SEO for Beginners 2024"],
        ),
        task(
          "Launch and optimise a Meta (Facebook/Instagram) ad campaign",
          "Create a Facebook Business account and run a £20 test campaign. Build 3 different ad creatives for the same product/offer (one image, one video, one carousel). Set up proper Facebook Pixel tracking on a website. Run the campaign for 7 days, analyse the results (CPM, CTR, CPC, ROAS), kill the underperforming creative, and scale the winner with an additional £20. Approach: the #1 mistake is targeting too broadly. Start with a specific audience (interests + demographics + geography), then expand what works. The goal is NOT to profit on £20 — it is to learn which creative and audience combination shows promise.",
          "Paid advertising is a skill worth £40,000-100,000/year to companies. Understanding Meta ads is the fastest way to become financially valuable in marketing.",
          "Completed ad campaign with documented A/B test results and a written analysis of what worked and why.",
          16,
          ["https://www.facebook.com/business/ads", "YouTube: Ben Heath — Facebook Ads 2024", "https://business.facebook.com/", "YouTube: Chase Chappell — Meta Ads for Beginners"],
        ),
      ]),
      phase("Advanced & Specialisation", [
        task(
          "Build an email marketing funnel with 7-email welcome sequence",
          "Set up Mailchimp or MailerLite (both free for under 1,000 subscribers). Create a lead magnet (a useful PDF, checklist, or tool), build a landing page to collect emails, and write a 7-email welcome sequence: Email 1 delivers the lead magnet, Email 2 tells your story, Emails 3-5 deliver high-value content, Email 6 introduces your product/service with social proof, and Email 7 makes a direct offer. Approach: the most important metric is open rate — test 3 different subject line styles (question, number, curiosity gap) over your first 100 subscribers and keep the style that wins.",
          "Email marketing has the highest ROI of any digital marketing channel — £36 return for every £1 spent on average. An email list is the only audience you truly own.",
          "Email funnel live, 100+ subscribers acquired through the lead magnet, 7 emails automated with >30% open rate.",
          18,
          ["https://mailchimp.com/", "https://www.mailerlite.com/", "YouTube: Pat Flynn — Email Marketing for Beginners", "Book: Email Marketing Rules by Chad White (summary on YouTube)"],
        ),
        task(
          "Build a marketing portfolio with 3 real case studies and get first client",
          "Document three real marketing campaigns you ran (even if for your own projects): what the objective was, what you did, what results you achieved, and what you learned. Publish them on a Notion page or simple website. Share on LinkedIn with a post about what you learned. Apply for one junior marketing role or pitch one small business owner on managing their social media for £200/month for 3 months. Approach: charge less than your market rate for your first client — you need the testimonial and real-world feedback more than the money at this stage.",
          "Marketing is one of the few fields where a self-built portfolio trumps a degree. Three documented results are more persuasive than any qualification.",
          "Published portfolio with 3 case studies, LinkedIn post with 50+ engagements, and first client or role application submitted.",
          20,
          ["https://www.notion.so/", "https://www.linkedin.com/", "https://www.upwork.com/", "YouTube: Alex Cattoni — Copywriting Portfolio"],
        ),
      ]),
    ])],
  },

  // ── Presentation Design ───────────────────────────────────────────────────
  "powerpoint": {
    tracks: [track("Presentation Design", "#d24726", [
      phase("Storytelling & Structure", [
        task(
          "Deconstruct 10 great presentations to extract the underlying story structure",
          "Find 10 famous presentations: Steve Jobs' iPhone 2007 launch, any TED Talk in your field, a Y Combinator pitch deck, a McKinsey slide example. For each, map: what is the one-sentence message? What structure does it use (problem-solution, before-after, journey, comparison)? Which slide is the turning point? Write a one-paragraph analysis for each. Approach: watch with the sound OFF first — if the visual story is unclear without audio, the deck is poorly designed. A great presentation tells the story through the slides alone, with the speaker's words as commentary, not narration.",
          "Most people open PowerPoint before they have a clear message. Understanding how great communicators structure ideas prevents you from making slides that nobody remembers.",
          "Analysis document with 10 presentation teardowns, identifying story structure and key turning point of each.",
          8,
          ["https://www.ted.com/talks", "https://www.ycombinator.com/library", "YouTube: Simon Sinek — Start With Why TED Talk", "YouTube: Slidebean — Famous Pitch Decks Analysed"],
        ),
        task(
          "Build a 10-slide investor pitch deck for a fictional startup",
          "Using the standard YC pitch deck structure (Problem, Solution, Market, Product, Traction, Team, Business Model, Competition, Financials, Ask), design a complete pitch deck for a fictional startup. Every slide must have: one clear headline that states the conclusion (not just the topic), maximum one chart or visual, and zero bullet points. Approach: design in PowerPoint or Keynote first, then export to PDF for portfolio. The biggest challenge is the financial slide — even fictional numbers must be logical and internally consistent. Show Total Addressable Market with a bottom-up calculation, not a top-down percentage.",
          "Investor pitch decks are the highest-stakes presentation format. Learning to build one teaches discipline in every other presentation type.",
          "10-slide pitch deck, exported as PDF, shared on Pitch.com or SlideShare for public feedback.",
          14,
          ["https://www.ycombinator.com/library/4T-how-to-design-a-better-pitch-deck", "https://pitch.com/", "YouTube: Slidebean — How to Build a Pitch Deck", "YouTube: Kevin Hale — How to Build a Compelling Deck"],
        ),
        task(
          "Design a data-heavy executive presentation that tells a clear story",
          "Take a public dataset (government statistics, company annual report, or sports statistics) and build a 15-slide executive presentation that answers one specific question: 'Should we expand into West Africa?' or 'Is our marketing working?' Every chart must use the right chart type for the data (bar for comparisons, line for trends, scatter for correlations) and have a conclusion headline. Avoid 3D charts, pie charts with more than 4 segments, and dual-axis charts. Approach: read 'Storytelling with Data' by Cole Nussbaumer Knaflic — the first 3 chapters are available free. Apply one concept per slide.",
          "Executives make decisions based on presentations, not spreadsheets. The ability to present data clearly is worth more than being able to analyse it.",
          "15-slide data presentation with conclusion-driven headlines, appropriate chart types, and a clear recommendation.",
          16,
          ["https://www.storytellingwithdata.com/", "YouTube: Cole Nussbaumer Knaflic — Storytelling with Data", "https://datawrapper.de/ (free charts)", "Book: Storytelling with Data — Cole Nussbaumer Knaflic"],
        ),
      ]),
      phase("Design & Delivery", [
        task(
          "Build a master slide template with a professional design system",
          "Design a complete PowerPoint template from scratch: title slide, section divider, content slides (text-only, text+chart, full-bleed image, comparison, and quote), and a closing slide. Define a 5-colour palette, 2 fonts (heading + body), and consistent spacing rules. The template must feel professional enough that a consulting firm would use it. Approach: look at templates from McKinsey, BCG, or KPMG (many are shared on SlideShare). Notice the restraint — minimal colour, consistent alignment, generous white space. Save as a .potx file for reuse.",
          "Building your own template is the master class in slide design. Every design decision you make forces you to understand why professional decks look the way they do.",
          "Professional PowerPoint template (.potx) with 8 slide layouts, available for reuse, shared on LinkedIn.",
          14,
          ["https://www.slidesgo.com/", "https://www.slideshare.net/", "YouTube: One Slide at a Time — PowerPoint Design Tutorial"],
        ),
      ]),
    ])],
  },

  // ── AI Agent Developer ────────────────────────────────────────────────────
  "ai-agent-dev": {
    tracks: [track("AI Agent Developer", "#6366f1", [
      phase("Agent Foundations", [
        task(
          "Build your first tool-using agent with the Anthropic API",
          "Use Python and the Anthropic Claude API (claude-3-5-haiku for cost) to build an agent that can use 3 tools: get_weather (fake it with hardcoded data first), search_web (use DuckDuckGo's free API), and read_file (reads local text files). The agent should decide which tools to call, call them, read the results, and continue reasoning. Approach: start with the official Anthropic tool use documentation. The key concept is the conversation loop: send a message → if the response contains tool_use blocks, execute those tools → append tool_result to the conversation → send again → repeat until no more tool_use. Do NOT use a framework yet — understand the raw API first.",
          "Every AI framework (LangChain, CrewAI, AutoGen) abstracts the conversation loop. If you don't understand it raw, you can't debug when the abstraction breaks — and it always breaks.",
          "Agent that correctly uses the right tool for 10 different user queries, with a printed reasoning trace.",
          16,
          ["https://docs.anthropic.com/en/docs/build-with-claude/tool-use", "https://pypi.org/project/anthropic/", "https://duckduckgo.com/duckduckgo-help-pages/settings/params/", "YouTube: David Ondrej — Claude Tool Use from Scratch"],
        ),
        task(
          "Implement agent memory: short-term, long-term, and episodic",
          "Most agents forget everything between sessions — this is what makes them feel like toys rather than tools. Implement three memory types: (1) Short-term: the conversation history in the context window (already implicit). (2) Long-term: store facts about the user in a SQLite database and inject relevant facts at the start of each conversation. (3) Episodic: summarise past conversations with an LLM and store the summaries — retrieve relevant episodes using semantic search with sentence-transformers and cosine similarity. Approach: for semantic search, use the free `sentence-transformers` library — no API call needed, runs locally. The hard part is deciding WHAT to remember — think about it like a human assistant: names, preferences, ongoing projects, past mistakes.",
          "Memory is what transforms a chatbot into an assistant. Without it, users have to re-explain context every session — they stop using it.",
          "Agent with all 3 memory types working: persists user facts, retrieves relevant past episodes, and references them naturally in conversation.",
          20,
          ["https://www.sbert.net/", "https://docs.python.org/3/library/sqlite3.html", "YouTube: Sam Witteveen — Agent Memory Systems", "https://python.langchain.com/docs/modules/memory/"],
        ),
        task(
          "Build a ReAct agent that can plan, act, and self-correct",
          "ReAct (Reasoning + Acting) is the foundational agent architecture. The agent explicitly thinks before acting: 'Thought: I need to find the current price. Action: search_web(...)'. Implement this with a system prompt that forces step-by-step reasoning. Add self-correction: if a tool returns an error or unexpected result, the agent should re-reason and try a different approach. Approach: build a research agent that answers complex factual questions requiring 3-5 tool calls. Test with: 'What is the GDP of Gambia and how does it compare to Senegal?' — it should search, read, compare, and synthesise. The hardest part is the system prompt — it must be explicit about the Thought/Action/Observation loop.",
          "ReAct is still the best-performing single-agent architecture for most tasks. Understanding it means you can implement any variation — CoT, ToT, RAG-augmented — by modifying the same pattern.",
          "ReAct agent that correctly answers 8/10 multi-step factual questions with a visible reasoning trace, self-correcting at least twice.",
          18,
          ["https://arxiv.org/abs/2210.03629", "https://python.langchain.com/docs/modules/agents/agent_types/react", "YouTube: James Briggs — ReAct Agents from Scratch"],
        ),
      ]),
      phase("Multi-Agent Systems", [
        task(
          "Build a 3-agent pipeline with CrewAI: Researcher → Writer → Editor",
          "Install CrewAI (the most production-ready multi-agent framework in 2025). Build a content creation pipeline: Agent 1 (Researcher) searches the web and collects facts on a topic. Agent 2 (Writer) receives the research and writes a 500-word article. Agent 3 (Editor) receives the draft and improves it for clarity, accuracy, and tone. Each agent has a distinct persona in its system prompt. Approach: the hardest part is agent communication — CrewAI handles this with Tasks and Crews, but you must define clear input/output contracts for each agent. Test with 5 different topics and review quality manually.",
          "Multi-agent systems let you decompose complex tasks into specialist sub-tasks — the same principle that makes human teams more productive than individuals.",
          "3-agent pipeline producing a polished 500-word article from just a topic title, in under 60 seconds.",
          20,
          ["https://docs.crewai.com/", "https://github.com/joaomdmoura/crewAI", "YouTube: Brandon Hancock — CrewAI Tutorial 2025", "https://www.youtube.com/@AIJason"],
        ),
        task(
          "Build a coding agent that writes, executes, and debugs code autonomously",
          "This is the hardest project in the path and the most impressive to show. Build an agent that: (1) Receives a coding task in plain English. (2) Writes Python code to solve it. (3) Executes the code in a sandboxed subprocess (use Python's subprocess module with a timeout). (4) If it fails, reads the error message and rewrites the code. (5) Repeats until it works or hits 5 attempts. Approach: use Docker to sandbox execution (prevents the agent from deleting your files). The retry loop is just re-appending the error to the conversation with 'The code produced this error: [error]. Fix it.' Test with 10 coding challenges from LeetCode Easy/Medium.",
          "Coding agents are the most commercially valuable class of AI agents right now. GitHub Copilot, Cursor, and Devin are all variations. Understanding how to build one means you understand how they all work.",
          "Coding agent that autonomously solves 7/10 LeetCode Easy problems in under 3 attempts each.",
          24,
          ["https://docs.anthropic.com/", "https://docs.python.org/3/library/subprocess.html", "https://www.docker.com/", "YouTube: Dave Ebbelaar — Autonomous Coding Agent"],
        ),
        task(
          "Deploy a production agent as an API with monitoring and guardrails",
          "Your agent needs to run reliably in production, not just in a Jupyter notebook. Build a FastAPI wrapper around your best agent that: exposes a POST /chat endpoint, handles concurrent requests with async, limits token usage per request (cost control), logs all conversations to a database, detects and blocks prompt injection attempts, and gracefully handles API errors and rate limits. Deploy on Railway or Render (both have free tiers). Approach: the most important production concern is cost — add a token budget per session and return a graceful 'I need to stop here' message when the budget is hit. Add Sentry for error monitoring.",
          "Any agent running in production must be observable and controllable. An agent you can't monitor is a liability, not an asset.",
          "Agent deployed as a public API on Railway/Render, handling 10 concurrent test requests without errors, with conversation logs in a database.",
          22,
          ["https://fastapi.tiangolo.com/", "https://railway.app/", "https://sentry.io/", "YouTube: Patrick Loeber — FastAPI + AI Deployment"],
        ),
      ]),
    ])],
  },

  // ── Copywriting ───────────────────────────────────────────────────────────
  "copywriting": {
    tracks: [track("Copywriting", "#f59e0b", [
      phase("Foundations of Persuasion", [
        task(
          "Handwrite 10 famous ads to feel great copy in your hands",
          "This is an old technique used by every great copywriter — Gary Halbert, Eugene Schwartz, and David Ogilvy all did it. Find 10 legendary ads or sales letters (search 'Swiped.co' or 'Gary Halbert letters') and copy them out by hand, word for word. Do not type them. Writing by hand forces you to feel the rhythm and structure. Write one paragraph of analysis after each: what hook does it use? Where does it create desire? How does it handle objections? Approach: do not rush this. One ad per day for 10 days, 20-30 minutes each. The goal is to internalise the patterns, not to finish quickly.",
          "Every professional copywriter who has done this reports the same outcome: after 10 ads, your brain starts automatically noticing copy structure in everything you read.",
          "10 handwritten ads with analysis notes, photographed and added to your copywriting journal.",
          10,
          ["https://swiped.co/", "https://www.thegaryhalbertletter.com/", "Book: The Boron Letters by Gary Halbert (free PDF)", "YouTube: Alex Cattoni — Copywriting for Beginners"],
        ),
        task(
          "Write 5 landing pages using the PAS framework (Problem-Agitate-Solve)",
          "PAS is the most reliable copywriting structure: open with a problem your reader has, agitate it (make them feel the pain more acutely), then present your solution. Write 5 landing pages for different industries: a fitness coaching programme, a software tool, an online course, a freelance service, and a physical product. Each must be 400-600 words with a headline, subhead, 3-paragraph body, and one call-to-action. Approach: write the headline last — it is the hardest part. Start with the problem paragraph. Research Reddit threads and Amazon reviews in each industry to find the exact words real customers use to describe their problems.",
          "Landing pages are the highest-converting form of copywriting and the most in-demand deliverable from clients. One strong landing page can generate thousands in conversions.",
          "5 landing pages written, reviewed by one person in each target industry, with a written critique of each.",
          16,
          ["https://www.copyhackers.com/", "https://www.reddit.com/", "YouTube: Alex Cattoni — Landing Page Copywriting", "https://unbounce.com/landing-page-examples/"],
        ),
        task(
          "Write a 7-email welcome sequence that converts leads into buyers",
          "Email sequences are the copywriting skill most agencies will pay for immediately. Structure: Email 1 delivers the promised lead magnet and establishes trust. Email 2 tells a relatable story about a problem (yours or a client's). Emails 3-4 build authority with value and case studies. Email 5 introduces the product with social proof. Email 6 handles the top 3 objections. Email 7 creates urgency with a deadline. Approach: every email must pass this test — if it disappeared, would a subscriber notice? If not, cut it. The hardest email to write is Email 6 (objections) — research the real objections by reading negative reviews of competitor products.",
          "Email sequences are where copywriters earn the most money — a good sequence pays the writer a percentage of every sale it generates, compounding over time.",
          "7-email sequence written, loaded into Mailchimp, sent to 10 beta subscribers, with open rates documented.",
          18,
          ["https://mailchimp.com/", "YouTube: Jay Acunzo — Email Storytelling", "https://www.copyhackers.com/", "Book: Email Copywriting Handbook by Ian Stanley"],
        ),
      ]),
      phase("Specialisation & Income", [
        task(
          "Win your first paid copywriting client at £200-500",
          "Post on Upwork, Fiverr, or LinkedIn that you write landing pages and email sequences. Set your rate at £200 for a landing page (below market — you need testimonials). Write one free sample for a business you admire to have something to show. When you get your first paid client: over-deliver (give them 10% more than agreed), ask for written feedback, and use the testimonial immediately in your profile. Approach: specialise immediately. 'Copywriter' is too broad. 'Email copywriter for SaaS startups' or 'Landing page writer for fitness coaches' gets you more traction than a generalist position.",
          "Getting paid for writing is the only real proof that your copy works. Testimonials from real clients unlock higher rates faster than any course.",
          "First paid copywriting project completed, testimonial received, profile updated — rate increased to £400.",
          22,
          ["https://www.upwork.com/", "https://www.fiverr.com/", "https://www.linkedin.com/", "YouTube: Alex Cattoni — How to Get Copywriting Clients"],
        ),
      ]),
    ])],
  },

};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a pre-built roadmap template for a given roadmap.sh path ID,
 * or null if no template exists (caller should fall back to AI generation).
 */
export function getTemplate(roadmapshId: string): CachedRoadmap | null {
  return TEMPLATES[roadmapshId] ?? null;
}
