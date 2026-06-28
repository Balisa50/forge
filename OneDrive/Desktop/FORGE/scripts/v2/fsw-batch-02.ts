import { rewriteWeek } from "../rewrite-week";

// full-stack-web W6-W10

rewriteWeek("full-stack-web", 6, {
  context: `Next.js App Router is where the industry is going. It builds on React but adds file-based routing, server components, server actions, and built-in optimisations for production. Most new React applications — and most job postings for React roles — are App Router. Understanding why it exists requires understanding the problem it solves: React alone is a client-side library. Next.js adds the server layer that makes React applications SEO-friendly, fast on first load, and capable of accessing databases and secrets without exposing them to the browser.

Server components are the conceptual shift. In React, all components run in the browser. In Next.js App Router, components are server components by default — they run on the server at request time (or build time), have access to the filesystem and environment variables, and send HTML to the browser. The browser receives rendered HTML rather than JavaScript that must first execute before the user sees anything. Client components (marked with 'use client') run in the browser and can use useState, useEffect, and event handlers. The division is not arbitrary — it is the architecture that enables fast initial loads with interactive islands.

The blog you build this week uses MDX — a superset of Markdown that allows you to embed React components in your content. A blog post can include a live code demo, an interactive chart, or a signup form embedded in the prose. This is impossible with plain Markdown and expensive to implement without a framework like Next.js that handles the compilation.

File-based routing in App Router is folder-based: src/app/page.tsx is the homepage, src/app/blog/page.tsx is /blog, src/app/blog/[slug]/page.tsx handles /blog/any-post-slug. The folder names match the URL segments. Dynamic routes use square brackets. Route groups (folders in parentheses) affect the folder structure without affecting the URL.

Deploying to Vercel is the natural endpoint for Next.js — Vercel created Next.js. The integration is tight: push to GitHub, Vercel builds and deploys automatically. Edge functions, preview deployments for PRs, and analytics are available out of the box.`,

  pre_flight: `Create a new Next.js project: npx create-next-app@latest --typescript --tailwind --app. Understand the app/ directory: page.tsx files define routes, layout.tsx files define shared layout, loading.tsx adds streaming loading states, error.tsx adds error boundaries. Know the difference between a server component (no useState, no event handlers, can use async/await) and a client component ('use client' directive, can use React hooks and browser APIs).`,

  mastery_questions: [
    `You have a page component that fetches blog posts from an API. You write it as an async server component: async function BlogPage() { const posts = await fetchPosts(); return <PostList posts={posts} />; }. What happens if the API call takes 3 seconds? In server components, the page waits for the async operations to complete before sending HTML to the browser. The user sees nothing for 3 seconds, then gets the fully rendered page. To improve this: add a loading.tsx file in the blog folder — Next.js shows this skeleton UI while the server component is loading. Or use Suspense boundaries within the page to stream parts of the page as they become ready.`,

    `You want to add a "like" button to each blog post that updates a database record. Can this logic go in a server component? No — server components cannot handle user interactions (event handlers require client JavaScript). But with server actions, you can define the database-updating logic as an async function on the server and call it from a client component. Mark the action with 'use server'. The client component calls the server action, which runs on the server, updates the database, and returns a result. No API endpoint required. The data flow stays on the server; only the function call crosses the network.`,

    `Your App Router blog uses dynamic route src/app/blog/[slug]/page.tsx. You add generateStaticParams() that returns all post slugs. What does this do at build time? Next.js pre-renders a static HTML page for each slug returned by generateStaticParams. Instead of fetching and rendering the post at request time, it is pre-built and served from the CDN instantly. This is the static site generation (SSG) pattern. When a user visits /blog/my-first-post, they receive a pre-built HTML page with no server computation required. For blog posts that do not change after publishing, this is the correct approach.`,

    `You want to display the number of views for each blog post, updated in real time. This view count changes frequently. Can you use generateStaticParams for this page? No — generateStaticParams produces static HTML that does not update without a rebuild. For frequently-changing data, use dynamic rendering (opt out of static generation by exporting a revalidate = 0 from the page, or remove generateStaticParams). The view count can be fetched on the server at request time, or fetched on the client after the static shell loads. A common pattern: statically render the post content, dynamically fetch the view count separately with a client component that calls an API route.`,

    `Your blog's navigation links use <a href="/blog"> HTML anchors. They work but cause full page reloads. What do you use instead and why? Next.js's <Link> component from next/link. Link handles client-side navigation — when a user clicks a Link, Next.js intercepts the navigation, fetches only the changed route segment from the server, and updates the page without a full reload. This preserves the scroll position on the rest of the page, maintains client-side state, and feels instant for cached pages. The <a> tag still works but bypasses Next.js's client-side navigation optimisation.`,
  ],

  common_mistakes: [
    `Putting 'use client' at the top of every component without thinking about it. Server components are faster and can access server resources. Use client components only when you need useState, useEffect, or browser APIs. A component that only renders data needs no client directive.`,

    `Importing a large library in a server component that is then included in the client bundle. Even in server components, some imports can leak to the client. Use next/dynamic with { ssr: false } to lazy-load heavy client-only libraries.`,

    `Not adding revalidation to server-side data fetches. By default, Next.js caches fetch calls in server components. If your data changes frequently, add: fetch(url, { next: { revalidate: 60 } }) to revalidate every 60 seconds.`,

    `Using useEffect for data fetching in a component that could be a server component. Data fetching in useEffect runs after the first render on the client, producing a flash of loading state. Server components fetch before rendering, eliminating the flash.`,

    `Not configuring metadata for SEO. Next.js App Router provides an easy way to set page titles and descriptions: export const metadata = { title: 'Blog Post Title', description: 'Post description' } from any page.tsx. Without this, all pages share the same generic title.`,
  ],

  debug_help: `The most confusing Next.js App Router error is "Server Component cannot use useState." This happens when you forget to add 'use client' to a component that uses hooks. The fix is either to add 'use client' or to restructure the component so the stateful part is a separate child client component while the parent remains a server component. Often the restructuring is the better choice — it keeps more of the component tree on the server.`,

  ai_assist: `Use Claude to help you design the routing structure for your blog before creating files. Describe the pages you need (blog listing, individual posts, tag filters, author page) and ask it to suggest the App Router folder structure. Understanding the relationship between folder structure and URL structure before creating files prevents painful refactoring later.`,

  stretch: [
    `Add a search feature using Next.js route handlers: a GET /api/search?q=term endpoint that searches post content and returns matching posts as JSON. Call it from a client component search input with debounced queries.`,
    `Implement Incremental Static Regeneration (ISR): set revalidate = 3600 on your blog post pages. This means Next.js re-renders each post page at most once per hour. Test by updating a post's content and verifying the live site updates within one hour.`,
    `Add reading time estimation to each blog post: count the words in the MDX content, divide by 200 (average reading speed), and display "5 min read" on the post card. Implement this calculation in a server component at build time.`,
  ],
});

rewriteWeek("full-stack-web", 7, {
  context: `Tailwind CSS is a different philosophy from traditional CSS. Instead of writing semantic class names (.hero-section, .card-header) and adding styles in a separate CSS file, Tailwind provides hundreds of small utility classes that you compose directly in your HTML. The hero section might have: className="relative flex items-center justify-center bg-slate-900 px-6 py-24 text-center md:py-36". This looks verbose but produces faster iteration: you never leave the HTML file to style a component, you never deal with naming conventions or specificity conflicts, and you have a constrained design system built in — 8-point spacing scale, curated color palette, responsive prefixes.

The constrained design system is Tailwind's most underrated feature. When you choose between padding-top: 16px and padding-top: 18px, you are making a visual decision with no guidance. When your options are py-4 (16px) and py-5 (20px), the constraint forces consistent spacing. The 8-point grid (4, 8, 12, 16, 20, 24...) emerges naturally from Tailwind's spacing scale. The result: your components look cohesive even before you have a design system, because they are all using the same underlying scale.

Building a UI kit this week means building components that other components will use: a Button that has primary/secondary/danger variants, a Card with an optional header and footer, a Badge for status indicators, an Alert for informational messages, a Table for data display. Each component accepts props that control its variant and renders the appropriate Tailwind classes.

The class merging problem appears quickly: if your Button component has base classes and you pass a className prop with additional classes, they must be merged correctly. conflicting classes (bg-blue-500 from the component, bg-red-500 from the caller) must be resolved. The clsx and tailwind-merge libraries handle this — clsx provides conditional class joining, tailwind-merge resolves Tailwind-specific conflicts.

Dark mode in Tailwind uses the dark: prefix. Every class can be conditionally applied in dark mode: dark:bg-slate-800 dark:text-white. Tailwind's dark mode can be configured as class-based (adds dark when .dark is on the html element) or media-based (respects the OS preference). Class-based dark mode gives you user control; media-based is automatic.`,

  pre_flight: `Have Tailwind installed in your Next.js project. Know the responsive prefixes: sm: (640px+), md: (768px+), lg: (1024px+), xl: (1280px+), 2xl: (1536px+). Know that Tailwind purges unused classes at build time — only the classes actually used in your code are included in the final CSS bundle. Install clsx and tailwind-merge: npm install clsx tailwind-merge. Read the Tailwind documentation for the flex, grid, and space utilities.`,

  mastery_questions: [
    `You write a Button component that accepts a variant prop: 'primary', 'secondary', or 'danger'. How do you apply different Tailwind classes based on the variant? Use a lookup object: const variants = { primary: 'bg-blue-600 text-white hover:bg-blue-700', secondary: 'bg-white text-slate-900 border hover:bg-slate-50', danger: 'bg-red-600 text-white hover:bg-red-700' }. Then: className={clsx(baseClasses, variants[variant], className)} where className is the caller-provided additional classes. This pattern (lookup object for variants) is more maintainable than if/else chains and plays well with TypeScript: variant: 'primary' | 'secondary' | 'danger' catches invalid values at compile time.`,

    `You build a Card component with className="rounded-lg shadow-md p-4". A caller passes className="p-8" to override the padding. After merging with tailwind-merge, which padding wins? tailwind-merge resolves conflicts in favour of the last conflicting class. With cn(baseClasses, callerClasses) (where cn is clsx + tailwind-merge), the caller's p-8 wins over the component's p-4. This is the correct behaviour for composition — callers should be able to override component defaults. Without tailwind-merge, both p-4 and p-8 would be in the class list, and which one applies would depend on CSS specificity (the one that appears later in the generated stylesheet).`,

    `You want a responsive layout: 1 column on mobile, 2 columns on tablet, 3 columns on desktop. How do you write this with Tailwind CSS grid? className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6". Tailwind's responsive prefixes are mobile-first — grid-cols-1 applies at all widths, md:grid-cols-2 overrides it at 768px+, lg:grid-cols-3 overrides it at 1024px+. This is the mobile-first principle expressed in Tailwind's syntax.`,

    `You want a hover state that changes the background color: hover:bg-blue-700. You also want a focus state for keyboard accessibility: focus:ring-2 focus:ring-blue-500 focus:outline-none. And a disabled state: disabled:opacity-50 disabled:cursor-not-allowed. How do you add all three to a button? All three prefix syntaxes can coexist: className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded". Each prefix applies its class only under the specified condition. This composability is one of Tailwind's strengths — no need for nested CSS rules.`,

    `Your UI kit needs a Text component that accepts a variant prop for different text styles: 'h1', 'h2', 'body', 'caption'. The variant determines both the HTML element rendered and the Tailwind classes applied. How do you handle the dynamic HTML element? Use a variable element tag: const Tag = variantToElement[variant]. Then <Tag className={variantClasses[variant]}>{children}</Tag>. In TypeScript, Tag must be typed as a valid HTML element tag: type TagName = 'h1' | 'h2' | 'h3' | 'p' | 'span'. This pattern (sometimes called "polymorphic components") is used by most UI libraries for text and layout primitives.`,
  ],

  common_mistakes: [
    `Constructing Tailwind class names dynamically with string concatenation: className={\`bg-\${color}-600\`}. Tailwind's build-time purging analyses your source code for class names. A dynamically constructed class like bg-\${color}-600 is not detected by the purger and is excluded from the final CSS. Use a lookup object with the full class names: const colorClasses = { blue: 'bg-blue-600', red: 'bg-red-600' }.`,

    `Not including the content paths in tailwind.config.ts. If you add a new directory for components and the path is not in the content array, Tailwind will not include those files in its class scan and the classes you use there will be purged.`,

    `Using Tailwind for everything, including one-off custom values that break the design system. Tailwind supports arbitrary values: w-[73px]. Overusing these defeats the purpose of the constrained system. If you need a value not in the scale, add it to your Tailwind config as a theme extension rather than using arbitrary values everywhere.`,

    `Not installing the Tailwind CSS IntelliSense VS Code extension. The extension provides autocomplete for Tailwind classes, lint warnings for invalid classes, and preview of the CSS on hover. Without it, you spend more time looking up class names.`,

    `Building components without accessibility attributes. A Button component needs: type="button" by default (to prevent accidental form submission), aria-disabled when disabled rather than the disabled HTML attribute (which removes it from the tab order), and visible focus styles (focus:ring).`,
  ],

  debug_help: `The most common Tailwind frustration is a class that appears in your code but does not apply in the browser. Check the browser DevTools Styles panel — is the class in the panel? If not, Tailwind purged it (because it was not detected in the content scan, usually from dynamic class construction). If the class is in the panel but is struck through, a more specific rule is overriding it. If the class is there and not struck through, check for a typo — Tailwind silently ignores unknown class names.`,

  ai_assist: `Use Claude to review your UI component code for accessibility issues. Paste one component at a time and ask: "What accessibility attributes or patterns are missing from this component?" Common gaps in UI kit components: missing aria-label on icon-only buttons, missing role on custom interactive elements, missing aria-expanded on dropdowns, missing keyboard handlers on custom interactive elements.`,

  stretch: [
    `Build a theme switcher that supports three modes: light, dark, and system (follows OS preference). Implement using a combination of Tailwind's class-based dark mode and the prefers-color-scheme media query. Persist the user's preference to localStorage.`,
    `Animate your UI components using Tailwind's transition utilities. Add smooth hover transitions to buttons (transition-colors duration-150), fade-in animations to modals (animate-fadeIn), and slide-in for toast notifications. Define custom keyframe animations in tailwind.config.ts.`,
    `Document your UI kit with a Storybook-like stories page: a /components route in your Next.js app that renders every component in all its variants side by side. This becomes your living style guide and visual regression test surface.`,
  ],
});

rewriteWeek("full-stack-web", 8, {
  context: `useState works for local component state. When that state needs to be shared across components that are not in a parent-child relationship, props drilling becomes painful: passing state down through three or four layers of components that do not use it themselves, only to pass it further down. State management libraries solve this by providing a store that any component can read from and write to directly.

Zustand is the lightweight state management solution that has largely replaced Redux for new React applications. Where Redux requires actions, reducers, and middleware, Zustand gives you a store in a single function call: useStore(create((set) => ({ count: 0, increment: () => set(state => ({ count: state.count + 1 })) }))). The store is a global singleton. Any component can call useStore(state => state.count) to read the count or useStore(state => state.increment)() to update it, without any Provider wrapping or action dispatching.

The Kanban board you build this week is a complete state management exercise. Board state (columns and their cards) lives in a Zustand store. Multiple components read from and write to the store simultaneously: the column component reads its own cards, the add-card button writes a new card, the drag-and-drop handler updates card positions across columns. No props drilling. Each component takes exactly the slice of state it needs.

Drag and drop is the feature that makes this project feel real. HTML5's native drag-and-drop API handles the browser mechanics. Your job is the state management: when a card is dragged from column A and dropped on column B, you update the store to move the card between columns' card arrays. The immutability requirement means creating new arrays rather than mutating existing ones.

Persistence to localStorage is the layer that makes the data survive page refreshes. Zustand's persist middleware handles this: it subscribes to store updates and writes the state to localStorage on every change. On page load, it rehydrates the store from localStorage before the first render. This one line of middleware gives you persistent state without building any storage logic yourself.`,

  pre_flight: `Install zustand: npm install zustand. Understand the Zustand create function: it takes a callback that receives set (to update state) and get (to read current state) and returns the initial state object. Know the drag-and-drop API: draggable attribute, ondragstart event (fires when drag begins), ondragover event (fires when dragging over a drop target — must call preventDefault to allow drop), ondrop event (fires when the drag is released on the target).`,

  mastery_questions: [
    `Your Zustand store has a cards array inside each column. When a user renames a card, you update the store. How do you write the update function that changes one card's title inside a nested structure? Use immer or manual immutability: set(state => ({ columns: state.columns.map(col => col.id === columnId ? { ...col, cards: col.cards.map(card => card.id === cardId ? { ...card, title: newTitle } : card) } : col) })). Alternatively, install the immer middleware for Zustand: it lets you write set(produce(state => { state.columns.find(c => c.id === columnId).cards.find(c => c.id === cardId).title = newTitle })). Immer handles the immutability automatically.`,

    `You add drag-and-drop. The dragover event fires hundreds of times per second as the user moves the card over a column. Updating Zustand state in dragover would cause hundreds of re-renders. How do you prevent this? Track the drag target with a ref rather than state: const dragTarget = useRef(null). Update the ref in dragover (dragTarget.current = columnId). Only update the Zustand store in the ondrop event, when the drag completes. Refs do not trigger re-renders — they are mutable containers that persist across renders. Use refs for frequently-changing values that should not trigger renders.`,

    `Your Kanban board loads the initial state from localStorage via Zustand persist. A user opens the board on a new device and gets an empty board. The localStorage on this device is empty. How do you handle the first-visit experience? The Zustand persist middleware reads from localStorage; if no saved state exists, it uses the initial state defined in the create function. Define a meaningful initial state: one or two default columns (To Do, In Progress, Done) with one sample card. The user sees a useful starting point rather than an empty board, which is especially important for understanding how to use the application.`,

    `You want to undo the last action (a common Kanban requirement). How do you implement undo with Zustand? Keep a history of states: an array of previous states. Before every action that modifies the board, push the current state to the history array. The undo action pops the last state from history and sets it as the current state. Limit history length to prevent unbounded memory growth. Zustand's temporal middleware (part of the zustand ecosystem) implements this pattern for you.`,

    `Your Kanban board has a keyboard shortcut: pressing 'n' when hovering over a column opens the add-card input. You implement this by tracking hovered column ID in the store. As the user moves the mouse, you update the hovered column ID in Zustand. The entire board re-renders on every mouseover. What is the wrong pattern here and how do you fix it? Frequently changing, non-data state (hover state, cursor position, drag target) should not live in the global Zustand store — it should live in local React state (useState) or refs within the component that uses it. The hovered column ID is UI state, not domain data. Putting it in the global store causes all store subscribers to re-render on every mouse movement. Use local useState in the Column component instead.`,
  ],

  common_mistakes: [
    `Using Zustand for all state including ephemeral UI state. Zustand is for shared, persistent application state. Form input values, hover states, open/closed menu states — these belong in local useState. Over-centralising state makes components harder to reuse and understand.`,

    `Not splitting the Zustand store into slices for large applications. A single 500-line store becomes hard to maintain. Use Zustand's slice pattern: create separate files for each domain (cards, columns, UI state) and combine them.`,

    `Reading the entire state in a component subscription: useStore(state => state) causes re-renders on any state change. Always select the minimal slice: useStore(state => state.columns[columnId].cards). Only changes to that specific slice trigger re-renders of the subscribing component.`,

    `Not handling the case where the persisted state shape is incompatible with the current code. After adding new fields to your store schema, existing localStorage data from previous versions will be missing those fields. Add a version number to the persist config and a migration function that handles old state shapes.`,

    `Forgetting to call event.stopPropagation() in drop zone handlers. If your drop zones are nested (a card can be dropped on a card or on a column), the drop event can bubble up from the card to the column, triggering both handlers. Use stopPropagation to prevent this.`,
  ],

  debug_help: `The most confusing drag-and-drop bug is "the card drops to the wrong position." Debug by logging the source card ID and target column ID in the drop handler. Common causes: (1) the dragged item's ID is not being correctly passed through the drag events (use event.dataTransfer.setData and getData), (2) the drop target is a child of the intended column rather than the column itself — use event.currentTarget instead of event.target to get the element the listener is attached to, (3) the ondragover handler is not calling event.preventDefault(), which is required to allow drops.`,

  ai_assist: `Use Claude to help you design the Zustand store schema for the Kanban board. Describe all the data your board needs to store (columns, cards, their properties, any UI preferences) and ask it to suggest a TypeScript type for the store state. Discuss the tradeoffs of different schema choices — for example, whether to store columns as an array or as a map keyed by ID. Good schema design makes every feature easier to implement.`,

  stretch: [
    `Add card filtering: a search input above the board that filters cards across all columns to show only cards whose title or description matches. Implement using a Zustand selector that derives the filtered board state from the full state and the search query.`,
    `Implement board sharing via URL: encode the entire board state as a base64-encoded JSON parameter in the URL. A user can share the URL and the recipient gets the same board. Handle the case where the URL state is malformed.`,
    `Add card due dates and a "overdue" indicator: cards with a past due date show a red border. Implement automatic status updates: a card whose due date passes while the browser tab is open should update its visual state without a user action.`,
  ],
});

rewriteWeek("full-stack-web", 9, {
  context: `The browser runs JavaScript. The server is separate — a different process, often on a different machine, that receives HTTP requests and sends responses. Node.js lets you write server-side JavaScript with the same language you use in the browser, but the environment is completely different: no window object, no DOM, no localStorage. Instead, you have access to the filesystem, environment variables, databases, and the ability to listen for incoming HTTP requests.

Express is the minimal web framework for Node.js. Where Next.js is opinionated and full-featured, Express is a thin layer over Node's HTTP server that adds middleware (functions that process requests and responses), routing (mapping URLs to handler functions), and nothing else. Understanding Express means understanding how web servers work at the HTTP level, without framework magic hiding the details.

The URL shortener you build has one real engineering challenge: generating short codes. A 7-character alphanumeric code from a 62-character alphabet (a-z, A-Z, 0-9) gives 62^7 = 3.5 trillion possibilities — more than enough. But the codes must be unique. The two approaches are random generation with collision checking (generate a code, check if it exists in the database, retry if it does) and counter-based encoding (encode the auto-incrementing row ID as base62). The counter approach is simpler and has no collision risk.

TypeScript on the server is the same TypeScript you use in the browser — the same type system, the same compiler — but the types describe server-specific things: request bodies, response schemas, database row types. Defining these types explicitly catches entire categories of bugs before they reach production. A handler that expects req.body.url to be a string and receives undefined instead will throw a runtime error. A TypeScript type catching that discrepancy catches it at compile time.

The redirect endpoint is the product. When someone visits your short URL (e.g., short.ly/abc1234), your server looks up the code in the database, increments the click count, and responds with an HTTP 301 redirect to the original URL. The browser follows the redirect transparently. The entire user experience is seamless — they just end up at the destination.`,

  pre_flight: `Install express, typescript, ts-node-dev, and better-sqlite3. Create a tsconfig.json with "module": "commonjs" and "target": "ES2020". Know what middleware is in Express: a function with signature (req, res, next) that processes the request before it reaches the route handler. Know what HTTP 301 and 302 redirects do: they tell the browser to go to a different URL. 301 is permanent (browser caches it), 302 is temporary (browser does not cache it).`,

  mastery_questions: [
    `Your Express route POST /shorten receives a JSON body with a url field. You call req.body.url without any validation. What risks does this create and how do you address them? (1) req.body.url might be undefined (request body is malformed or the field is missing), causing a runtime error when you try to use it. (2) It might be a string but not a valid URL (e.g., "javascript:alert('xss')" — a protocol that can execute code when used as a redirect target). (3) It might be a very long string that overloads your database. Fix: use Zod or express-validator to parse and validate the request body before using it. Check that url is a string, parse it with new URL(url) to verify it is a valid URL, check the protocol is http or https, and enforce a maximum length.`,

    `You use the base62 encoding approach to generate short codes. The first URL gets code "0000001", the second gets "0000002". This reveals your usage volume (competitors can count your URLs by watching the codes). What is the downside of the random generation approach? Random generation requires checking for collisions — generating a code, querying the database to verify it does not already exist, and retrying if it does. At low volume, collisions are rare (birthday paradox: at 1 million URLs, the collision probability for a 7-char base62 code is still very low). At high volume, collision checking adds database reads. A middle path: start with counter-based encoding, apply a reversible integer bijection to scramble the number before encoding (this preserves uniqueness while making codes appear random).`,

    `Your redirect endpoint needs to look up a short code in SQLite and redirect. The lookup must be fast because every redirect adds latency to the user's navigation experience. What database optimisation makes lookups fast? An index on the short_code column. Without an index, SQLite scans every row to find the matching code — O(n) with n rows. With an index (CREATE INDEX idx_short_code ON urls(short_code)), lookups are O(log n) — a tree traversal through the B-tree index. The index must be created when the table is created, not after it grows to millions of rows (indexing an existing large table is expensive but necessary).`,

    `Your API returns errors as plain text strings ("Error: URL not found") from some endpoints and as JSON from others. Why is inconsistent error format a problem? Clients cannot reliably parse errors. A frontend that parses errors as JSON crashes when it receives plain text. An API gateway that inspects error messages expects a consistent format. Always return errors in the same format: { "error": "URL not found", "code": "NOT_FOUND" }. Document the error format in your API documentation and enforce it in every error handler.`,

    `You want to add rate limiting to your POST /shorten endpoint to prevent abuse. How do you implement this in Express? Use the express-rate-limit middleware: const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }); router.post('/shorten', limiter, shortenHandler). This limits each IP to 100 requests per 15-minute window. For authenticated users, use their user ID rather than IP as the identifier. Add informative response headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset — these tell clients how many requests they have left and when the limit resets.`,
  ],

  common_mistakes: [
    `Not using express.json() middleware. By default, Express does not parse request bodies. You must add app.use(express.json()) before your routes to enable JSON body parsing. Without it, req.body is undefined.`,

    `Returning sensitive database errors to clients. If a database error leaks a stack trace or SQL query to the client, it reveals implementation details and potential vulnerabilities. Catch all database errors, log them server-side, and return generic error messages to clients.`,

    `Not using async/await correctly in Express route handlers. Express does not catch async errors by default. If your async handler throws, Express does not catch the rejection and the request hangs or crashes the process. Wrap async handlers: const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next). Or use the express-async-errors package.`,

    `Storing passwords or API keys in the SQLite database as plain text. Even in this early project, establish the correct habit: hash passwords with bcrypt before storing, store API keys in environment variables, never log sensitive values.`,

    `Not closing the SQLite connection properly. better-sqlite3 uses synchronous operations and does not require connection pooling, but closing the connection on process exit prevents data corruption: process.on('exit', () => db.close()).`,
  ],

  debug_help: `The most common Express TypeScript error is "Cannot find module 'express'" or "Module not found" even though express is installed. This usually means the TypeScript compiler is not finding the type definitions. Install @types/express as a dev dependency. If the error persists, check your tsconfig.json — moduleResolution should be "node" or "bundler". Also confirm that ts-node-dev (or tsx) is being used to run the server, not plain node (which does not understand TypeScript).`,

  ai_assist: `Use Claude to help you design the database schema for the URL shortener. Describe all the data you need to store (short code, original URL, creation date, click count, user ID for future auth) and ask it to write the SQL CREATE TABLE statement with appropriate column types and constraints. Then write the TypeScript type that mirrors the database row. Schema design is the most consequential decision in this project — the schema you define now affects every feature you add in the coming weeks.`,

  stretch: [
    `Add a click analytics endpoint: GET /stats/:code returns the number of clicks, the click timestamps, and a breakdown of referring domains (parsed from the Referer header logged on each redirect). This is the start of the analytics dashboard.`,
    `Implement custom short codes: allow users to specify their own code (e.g., "my-repo" instead of "abc1234"). Validate that the custom code only contains alphanumeric characters and hyphens, does not conflict with reserved paths (/api, /health, /stats), and is not already taken.`,
    `Add a link expiry feature: optional expires_at field. Redirect requests for expired links return a 410 Gone response with an informative message rather than a 404.`,
  ],
});

rewriteWeek("full-stack-web", 10, {
  context: `SQLite was right for getting started — zero configuration, single file, no server to manage. But it has real limits: no concurrent writes (only one writer at a time), no network access (the database must be on the same machine as the application), and limited tooling for production management. PostgreSQL is the production database that most web applications use. This week you migrate your URL shortener from SQLite to PostgreSQL and add Prisma as the ORM.

Prisma is an ORM (Object-Relational Mapper) that provides three things: a type-safe query client, a schema definition language, and a migration system. The schema (schema.prisma) is the single source of truth for your database structure. Prisma generates TypeScript types from it and generates migration SQL from it. When you add a field, you add it to the schema and Prisma generates the ALTER TABLE migration. You never write migration SQL by hand.

Database design deserves more attention than most beginners give it. The decisions you make now — table names, column types, nullability, foreign key constraints, indexes — are hard to change after the application is running with real data. The URL shortener has two main entities: Url (the link record with short code and original URL) and Click (each redirect event). The relationship is one-to-many: one URL has many clicks. How you model this relationship, what indexes you create, and how you handle deletion cascades all affect query performance and data integrity.

Prisma migrations are the mechanism that applies schema changes to the database safely. In development, prisma migrate dev generates and applies a new migration. In production, prisma migrate deploy applies pending migrations without prompting. The migration history is stored in the prisma/migrations directory and committed to git — this is the database's version history, analogous to git commits for code.

Connection pooling is the production concern that SQLite never required. PostgreSQL connections are expensive — establishing a new connection takes 50-100ms. An application that creates a new connection per request cannot handle significant traffic. Prisma manages a connection pool automatically, reusing connections across requests. The pool size is configurable: too small and requests queue waiting for a connection, too large and you hit PostgreSQL's maximum connections limit.`,

  pre_flight: `Install PostgreSQL locally (or use Neon, a free serverless Postgres provider). Install prisma and @prisma/client: npm install prisma @prisma/client. Run npx prisma init to create the schema file. Know the Prisma schema syntax: model Url { id Int @id @default(autoincrement()); shortCode String @unique; ... }. Know the difference between prisma migrate dev (creates and applies a new migration) and prisma migrate deploy (applies pending migrations without creating new ones).`,

  mastery_questions: [
    `You add a userId field to your Url model but mark it as optional (userId Int?). Later you decide every URL must have a user and change it to required (userId Int). Why can you not just change the schema and run a migration without extra steps? The migration would add a NOT NULL constraint to a column that already has NULL values (existing URLs created before auth was added). PostgreSQL rejects NOT NULL constraints on columns with existing NULL values. You must first fill in the NULL values — either by adding a default value (userId Int @default(1)), writing a migration that updates existing rows with a placeholder user ID, or accepting a two-step migration: add a temporary default, apply the constraint, remove the default. Database migrations on production data require careful planning.`,

    `You want to get a URL and the count of its clicks in a single query. How do you write this in Prisma? Use include with _count: const url = await prisma.url.findUnique({ where: { shortCode }, include: { _count: { select: { clicks: true } } } }). This returns the URL record plus clicks: { _count: { clicks: 42 } }. Alternatively, use select with aggregate: prisma.url.findUnique({ where: { shortCode }, select: { shortCode: true, originalUrl: true, clicks: { select: { id: true } } } }). For high-read operations, store the click count as a denormalised field on the URL record and increment it on each click — this avoids a JOIN but requires careful consistency management.`,

    `Your Prisma query is slow: finding URLs by userId when a user has thousands of URLs. What do you add to fix this? An index on the userId field: @@index([userId]) in the Prisma schema. Prisma generates the corresponding CREATE INDEX migration. Without the index, PostgreSQL scans all URL rows to find those with the matching userId. With the index, the query uses a B-tree lookup. Index selection is critical: index columns that appear in WHERE clauses, JOIN conditions, and ORDER BY clauses. Too many indexes slow down INSERT and UPDATE operations (each index must be updated), so index selectively.`,

    `You delete a User and want all their URLs deleted automatically. How do you configure this in Prisma? Add a cascade delete: in the Url model, the user relation should have @relation(onDelete: Cascade). This tells PostgreSQL (via Prisma's migration) to automatically delete all Url rows when the referenced User row is deleted. Without this, deleting a User with existing URLs throws a foreign key constraint violation. Consider the alternative: a soft delete pattern where users are marked inactive rather than deleted, preserving historical data.`,

    `You want to run a raw SQL query in Prisma for a complex aggregation that Prisma's query builder cannot express efficiently. How? Use prisma.$queryRaw: const results = await prisma.$queryRaw\`SELECT DATE_TRUNC('day', created_at) as day, COUNT(*) as clicks FROM "Click" WHERE url_id = \${urlId} GROUP BY day ORDER BY day\`. The tagged template literal automatically parameterises values, preventing SQL injection. Use raw queries sparingly — they bypass Prisma's type safety and do not benefit from query validation. But complex analytics queries often require raw SQL.`,
  ],

  common_mistakes: [
    `Instantiating a new PrismaClient on every request. Each PrismaClient manages a connection pool. Creating a new one per request creates hundreds of database connections. Instantiate PrismaClient once and export the singleton: export const prisma = new PrismaClient().`,

    `Not handling Prisma's "Record not found" error (P2025). findUnique returns null when no record matches, but update and delete throw P2025 when the record does not exist. Wrap these calls in try/catch and check error.code === 'P2025'.`,

    `Committing the DATABASE_URL to git. The database URL contains credentials. Store it in .env and add .env to .gitignore. Provide a .env.example file with the variable name but no value.`,

    `Running prisma migrate dev in production. migrate dev is for development — it can create and delete databases, prompt interactively, and create shadow databases. Production deployments should always use prisma migrate deploy, which only applies pending migrations without any destructive operations.`,

    `Not understanding Prisma's transaction API. If two database operations must succeed or fail together (create a URL and log the creation event), wrap them in prisma.$transaction([prisma.url.create(...), prisma.event.create(...)]). Without a transaction, one operation can succeed while the other fails, leaving the database in an inconsistent state.`,
  ],

  debug_help: `The most common Prisma error is "Cannot connect to database server at localhost:5432." This usually means PostgreSQL is not running locally. Start PostgreSQL with pg_ctl start or through the PostgreSQL app. If using Neon or another cloud provider, verify the DATABASE_URL in your .env matches the connection string from the provider dashboard (including the database name, username, password, and host). Add ?connection_timeout=30 to the connection string if connections are timing out before being established.`,

  ai_assist: `Use Claude to help you write the Prisma schema for a feature beyond the basic URL shortener — for example, a team/organisation model where multiple users can share URLs. Describe the entities and relationships, ask it to draft the Prisma schema, and discuss the design decisions: why certain fields are optional, what the delete cascade strategy should be, which indexes are needed. This is the type of schema design discussion that normally happens in architecture reviews.`,

  stretch: [
    `Add full-text search to URLs: allow searching by original URL and custom alias. Use PostgreSQL's full-text search (tsvector and tsquery) via Prisma raw queries. Compare the performance against a LIKE %search% query.`,
    `Implement cursor-based pagination for the user's URL list: instead of OFFSET-based pagination (which degrades at high page counts), use the last URL's ID as the cursor for the next page. This scales linearly regardless of page depth.`,
    `Build a database backup script that dumps the PostgreSQL database to a compressed file and uploads it to an S3 bucket. Schedule it with a cron job or GitHub Actions scheduled workflow. Test the restore process.`,
  ],
});
