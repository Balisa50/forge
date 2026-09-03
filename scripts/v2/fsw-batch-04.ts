import { rewriteWeek } from "../rewrite-week";

// full-stack-web W16-W20

rewriteWeek("full-stack-web", 16, {
  context: `HTTP is a request-response protocol: the client sends a request, the server sends a response, the connection is done. This model is fine for loading pages and submitting forms. It breaks down when you need the server to push data to connected clients — a live chat message, a real-time dashboard update, a collaborative editing change. For these use cases, you need WebSockets.

A WebSocket is a persistent, bidirectional connection between client and server. It starts as an HTTP connection (the handshake happens over HTTP), then upgrades to the WebSocket protocol. Once upgraded, both sides can send messages to each other at any time without the overhead of a new HTTP connection for each message. The connection stays open until either side closes it.

Socket.IO is the standard Node.js library for WebSockets. It wraps the WebSocket protocol with useful features: automatic reconnection when the connection drops, fallback to long-polling in environments that do not support WebSockets, rooms (named channels where you can broadcast to a subset of connected clients), and namespaces. The server emits events and clients listen for them; clients emit events and the server listens. The programming model is event-driven.

Scaling WebSockets is harder than scaling HTTP. HTTP servers are stateless — any server can handle any request. WebSocket connections are stateful — a connected client is connected to a specific server instance. If you have two server instances and clients connect to both, an event emitted on server 1 is not automatically sent to clients connected to server 2. The solution is an adapter: Socket.IO has a Redis adapter that routes messages between server instances via Redis pub/sub. In development with one server, this does not matter. In production, plan for it.

Server-Sent Events (SSE) are a simpler alternative for one-way server-to-client updates. SSE is a standard HTTP connection that the server keeps open and writes event data to periodically. The client uses the EventSource API. SSE is simpler than WebSockets (no library required, works over HTTP/2), but only supports server-to-client communication. For dashboards, notifications, and activity feeds, SSE is often the better choice.

This week you add real-time order status updates to Bean Forge. When an admin updates an order status, all customers watching that order see the update instantly.`,

  pre_flight: `Install Socket.IO: npm i socket.io socket.io-client. Read the Socket.IO server documentation for Node.js. Understand the event-emitter pattern: on(event, callback) listens; emit(event, data) sends. Know the difference between socket.emit (to one client), io.to(room).emit (to all in a room), and io.emit (to all connected clients). Install the Redis adapter if you plan to scale: npm i @socket.io/redis-adapter ioredis.`,

  mastery_questions: [
    `A user is watching their order on the /orders/:id page. The admin updates the order status to "ready". How does the update reach the user's browser? The admin sends a PATCH /orders/:id request to your server. The server updates the database. Then the server calls io.to(\`order:\${orderId}\`).emit('orderUpdated', { status: 'ready' }). The user's browser, when it loaded the order page, ran socket.join(\`order:\${orderId}\`) (via a socket.emit to the server asking to join that room). The server called socket.join on their behalf. Now when the server emits to that room, the user's browser receives the event and updates the UI without a page reload.`,
    `Your WebSocket server is running and clients are connecting. After 30 seconds, connections start dropping. What are the likely causes? Network proxies and load balancers close idle connections. The fix is heartbeating: Socket.IO's ping/pong mechanism (pingInterval, pingTimeout config) keeps the connection alive. Also check for NGINX proxy_read_timeout — if the proxy timeout is shorter than the ping interval, NGINX closes the connection before the ping keeps it alive. Set proxy_read_timeout 3600 in your NGINX config for WebSocket routes.`,
    `You have a collaborative document editor. Two users edit the same word simultaneously and both save. How do you handle this? This is a conflict detection problem. The naive approach is last-write-wins: whoever saves last overwrites. For simple cases this is acceptable. For real collaboration you need Operational Transformation (OT) or Conflict-free Replicated Data Types (CRDTs). Libraries like Yjs implement CRDTs and integrate with Socket.IO — they merge concurrent edits automatically. Understanding the full complexity of distributed state is a foundational knowledge gap for most developers.`,
    `What is the difference between socket.emit and socket.broadcast.emit and io.emit? socket.emit sends to the specific socket (one client). socket.broadcast.emit sends to all connected clients except the socket that triggered it (useful for "user X is typing" — you don't send it back to the typer). io.emit sends to all connected clients including the sender. io.to(room).emit sends to all sockets in a specific room. These are the four patterns you will use most.`,
  ],

  common_mistakes: [
    `Not handling disconnections. Clients disconnect — network drops, browser closes, mobile goes to background. Your server must handle the 'disconnect' event and clean up any state associated with that socket (remove from user presence lists, cancel pending operations).`,
    `Trusting data from WebSocket messages without validation. Apply the same input validation to WebSocket messages as to HTTP requests. A malicious client can emit any event with any payload. Use zod to validate socket message payloads.`,
    `Not authenticating WebSocket connections. The HTTP handshake carries cookies, so session-based auth works — validate the session in the Socket.IO middleware before allowing the connection. For token-based auth, pass the token in the handshake auth object and validate it in middleware.`,
    `Emitting events inside a loop for each client instead of using rooms. socket.emit in a loop with 1000 connections is 1000 separate emit calls. io.to(room).emit is one operation that distributes internally. Learn the room and broadcast patterns.`,
    `Using WebSockets when SSE is sufficient. If you only need server-to-client updates (notifications, live dashboards), SSE is simpler and works over standard HTTP. WebSockets add complexity that is only justified when you need bidirectional communication.`,
  ],

  debug_help: `"WebSocket connection failed" in browser console: check CORS configuration on the Socket.IO server. The origin option must include your frontend URL. In development, you can use cors: { origin: "*" } but restrict this in production. Connection established but events are not received: verify the event name matches exactly on both sides — 'orderUpdated' on the server must match 'orderUpdated' on the client. Casing matters. Sockets disconnect immediately after connecting: check if an error is thrown in the Socket.IO middleware (e.g., authentication failure). Log errors in the connection middleware. Redis adapter not syncing between server instances: verify the Redis connection is working (connect to Redis with ioredis and run PING). Check that both server instances use the same Redis URL.`,

  ai_assist: [
    `"Write the Socket.IO server setup in Node.js/Express that: attaches to the HTTP server, validates the session in connection middleware (rejecting unauthenticated connections), and handles clients joining order rooms. On join, the client sends { orderId } and the server calls socket.join(\`order:\${orderId}\`)."`,
    `"Write the client-side Socket.IO code in React that connects to the server, joins the order room for a specific orderId, listens for orderUpdated events, and updates the component state. Include cleanup: leave the room and disconnect when the component unmounts."`,
    `"Explain how Socket.IO rooms work and write an example of a chat room implementation with join, leave, message broadcast, and a user list that updates when someone joins or leaves."`,
  ],

  stretch: [
    `Implement presence: show which users are currently viewing an order. When a user joins an order room, broadcast to all room members that user X is watching. When they leave (disconnect or leave the page), broadcast that they are gone. Maintain a presence list in memory.`,
    `Replace the Socket.IO order updates with Server-Sent Events. Implement the SSE endpoint in Express (res.setHeader('Content-Type', 'text/event-stream'), write data: ... \n\n frames). Compare the complexity and resource usage with Socket.IO.`,
    `Add the Socket.IO Redis adapter and run two Node.js server instances locally (different ports, behind a simple load balancer like nginx). Verify that a client connected to server 1 receives events emitted from server 2.`,
  ],
});

rewriteWeek("full-stack-web", 17, {
  context: `Testing is how you change code without being afraid. An untested codebase is one where every change might break something that worked before, and the only way to know is to manually click through every feature after every change. Tests make refactoring possible, make onboarding new developers faster, and make sleeping better.

Three types of tests, from fastest to slowest and from cheapest to most expensive. Unit tests verify a single function in isolation. They mock all dependencies. They run in milliseconds. Write them for pure business logic: price calculations, data transformations, validation functions. Unit tests cannot tell you that the system works end-to-end. Integration tests verify that multiple units work together — your API route calling the database, your authentication middleware rejecting unauthorised requests. They use a real (or in-memory) database. They run in seconds. Write them for your API endpoints. They give the most confidence per test written. End-to-end (E2E) tests run a real browser and simulate user interactions. They test the full stack: frontend, backend, database. They run in minutes. Write them for critical user journeys: sign up, login, place an order, subscribe.

Vitest is the test runner for modern TypeScript projects (faster than Jest, better TypeScript support, same API). Supertest is a library for testing Express HTTP endpoints without starting a real server. Playwright is the standard for E2E browser testing.

Testing culture: tests are not just for finding bugs after the fact. Writing the test first (TDD) forces you to think about the interface before the implementation — it often leads to better-designed functions. At minimum, write tests before you fix bugs (the test proves the bug exists, then the fix makes it pass, and the test ensures the bug never comes back).

This week you write unit tests for the pricing logic in Bean Forge, integration tests for the auth and orders API endpoints using a test database, and E2E tests for the signup and checkout flows using Playwright.`,

  pre_flight: `Install Vitest: npm i -D vitest @vitest/coverage-v8. Install Supertest: npm i -D supertest @types/supertest. Install Playwright: npm i -D @playwright/test && npx playwright install. Set up a test database: create a separate PostgreSQL database (or use SQLite in-memory for unit/integration tests). Add a DATABASE_URL_TEST to your .env.test. Add a vitest.config.ts that sets the test database URL. Read the Vitest getting started guide.`,

  mastery_questions: [
    `You have a function calculateOrderTotal(items, discountCode) that applies a discount if the code is valid. How do you unit test this? You do not need a database or a server — create test cases with plain JavaScript objects. Test the happy path: valid items and a valid discount code returns the correct total. Test edge cases: empty items array returns 0, invalid discount code is ignored (or throws, depending on your design), items with 0 quantity are excluded, negative prices are rejected. Each test creates the input, calls the function, and asserts the output. No mocking required — the function takes plain data in and returns plain data out.`,
    `You want to test your POST /auth/login endpoint. It reads from the database. How do you set this up without messing up your development database? Create a separate test database (a real PostgreSQL database for integration tests, or use prisma.$connect with a SQLite in-memory database). Before each test run, reset the database to a known state: run prisma migrate reset --force --skip-seed then seed specific test data. In your test, create a user with a known email and password, call POST /auth/login with those credentials, and assert the response is 200 with a session cookie. After the test, the database is reset for the next test.`,
    `A Playwright test clicks "Sign Up", fills in the form, submits, and is supposed to land on the dashboard. The test fails intermittently — sometimes it passes, sometimes it fails. What is the likely cause? Race conditions: the test is clicking/asserting before the async operation completes. Playwright's auto-wait helps but is not magic. Common causes: not waiting for the network request to complete before asserting UI changes, animation delays preventing clicks, slow CI environment making timeouts fire too early. Fix: use await page.waitForURL('/dashboard') instead of assuming navigation is instant. Use await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible() which retries until visible. Avoid arbitrary await page.waitForTimeout(1000) — it is brittle.`,
    `Your test suite takes 8 minutes to run. How do you identify and fix slow tests? Profile: run vitest --reporter=verbose and note which tests are slow. E2E tests in Playwright should run in parallel (use workers in playwright.config.ts). Integration tests should use a transaction that is rolled back after each test instead of re-seeding the entire database — this is much faster. Unit tests should be sub-second — if a unit test is slow, it is probably doing I/O (calling the real database or making HTTP requests) which means it is not a unit test. Isolate I/O behind interfaces and mock them.`,
  ],

  common_mistakes: [
    `Testing implementation details instead of behaviour. Testing that a function called a specific internal method (spying on internals) means your tests break every time you refactor, even when the behaviour is unchanged. Test inputs and outputs, not the path taken internally.`,
    `Writing tests after the fact as an afterthought. Tests written after implementation tend to test the implementation, not the requirements. If a bug slips through, write the test first: prove the bug exists with a failing test, then fix it.`,
    `Sharing state between tests. Each test must set up and tear down its own state. If test A creates a user and test B assumes that user exists, tests become order-dependent and fail randomly when run in different orders. Use beforeEach to set up fresh state.`,
    `Not running tests in CI. If tests only run locally on the developer's machine, they are not really tests — they are optional suggestions. Every PR should run the test suite. A failing test blocks the merge.`,
    `100% code coverage as the goal. Coverage measures which lines ran, not whether the tests are good. You can achieve 100% coverage with useless assertions. Aim for test coverage of critical paths and business logic, not mechanical coverage of every line.`,
  ],

  debug_help: `Vitest cannot find the module: check tsconfig paths are configured in vitest.config.ts using the vite-tsconfig-paths plugin. Supertest returns 404 for an endpoint that exists: make sure you are exporting the Express app (not calling app.listen) and importing it in the test. The listen call starts the server on a port — Supertest creates its own test server. Playwright cannot find elements: use the Playwright inspector (PWDEBUG=1 npx playwright test) to pause and inspect the page. Selectors that work in the browser may differ from what Playwright finds — prefer role-based selectors (getByRole, getByLabel) over CSS selectors. Tests pass locally but fail in CI: check whether tests depend on local environment variables not set in CI, whether the test database is accessible in CI, and whether the time zone difference affects date-based assertions.`,

  ai_assist: [
    `"Write Vitest unit tests for this function: [paste function]. Cover the happy path, edge cases (empty input, boundary values), and error cases. Use describe blocks to group related tests."`,
    `"Write Supertest integration tests for a POST /auth/login endpoint in Express. The test should: create a user in the test database before the test, send valid credentials and assert 200 with a session cookie, send wrong password and assert 401, send non-existent email and assert 401 with the same response time as the wrong password case."`,
    `"Write a Playwright E2E test for the user signup flow. The test navigates to /signup, fills in name, email, and password fields, submits the form, and asserts that the user lands on /dashboard and sees their name in the header."`,
  ],

  stretch: [
    `Set up code coverage reporting with @vitest/coverage-v8. Run vitest --coverage and look at which branches in your business logic are not tested. Add tests for the untested branches, not to hit a number, but to ensure your edge cases are covered.`,
    `Write visual regression tests with Playwright's screenshot comparison. Take a screenshot of the Bean Forge homepage and menu page. On each test run, compare against the baseline. If the layout changes unexpectedly (a CSS regression), the test fails.`,
    `Set up a GitHub Actions CI workflow that runs unit and integration tests on every PR, and E2E tests on merge to main. Cache the node_modules and Playwright browsers to speed up the runs.`,
  ],
});

rewriteWeek("full-stack-web", 18, {
  context: `Performance is user experience. A page that takes 5 seconds to load loses users before they see the product. Core Web Vitals are Google's performance metrics and a ranking signal for search. The three that matter: Largest Contentful Paint (LCP) — how fast the main content appears; Cumulative Layout Shift (CLS) — how much the page jumps around while loading; Interaction to Next Paint (INP) — how fast the page responds to user interactions.

LCP targets: under 2.5 seconds is good, 2.5-4.0 seconds needs improvement, over 4.0 seconds is poor. The LCP element is usually the hero image or the main heading. Optimise it by: preloading the LCP image (link rel="preload"), serving images in WebP or AVIF format, using a CDN so the image is served from an edge location close to the user, and using the Next.js Image component which does all of this.

Bundle size is the other major performance lever. Every kilobyte of JavaScript downloaded, parsed, and executed delays interactivity. Your users on slow connections pay for every unused import. Measure bundle size with next build (it shows route bundle sizes) and the next-bundle-analyzer package. Common problems: importing an entire utility library when you only need one function (import { format } from 'date-fns' is fine; import _ from 'lodash' pulls in 70KB), not code-splitting large components (dynamic imports load them lazily), shipping polyfills for browsers you do not support.

Server components in Next.js App Router are a performance win: they render on the server and ship zero JavaScript to the browser. Use server components for anything that does not require interactivity (fetching data, static content). Move interactivity down to leaf components that can be marked 'use client'. This "islands architecture" minimises client-side JavaScript.

Caching is the most impactful optimisation. Next.js caches at multiple levels: build-time static generation (fastest), route-level caching with revalidate, and request memoization. Understand which cache is active for each page and when it is invalidated. Database query caching: use Redis or a query-level cache for expensive queries that do not need to be real-time. HTTP caching: set Cache-Control headers correctly so browsers and CDNs cache static assets.`,

  pre_flight: `Install next-bundle-analyzer: npm i @next/bundle-analyzer. Run Lighthouse in Chrome DevTools on your Bean Forge site to see its current Core Web Vitals score. Note which metrics are failing and what the identified opportunities are. Read the Web Vitals documentation at web.dev/vitals. Run next build and look at the output — note which routes are large and why.`,

  mastery_questions: [
    `Your LCP score is 4.2 seconds. The LCP element is the hero image on the homepage. What specific changes do you make to fix it? Convert the image to WebP (50-80% smaller than JPEG). Add a preload link in the head: <link rel="preload" as="image" href="/hero.webp">. This tells the browser to start downloading the image as soon as the HTML is parsed, instead of waiting until the CSS and render tree are processed. Use the Next.js Image component with priority={true} for the hero — it sets the preload automatically. Move the image to a CDN. The first two changes alone typically drop LCP by 1-2 seconds.`,
    `Your next build output shows that the /checkout route has a 450KB JavaScript bundle. How do you investigate and reduce it? Run next build with the bundle analyzer (ANALYZE=true next build). Look at the treemap — which package is the largest? Common culprits: moment.js (replace with date-fns), lodash (import only the functions you use), a PDF library loaded at page level (dynamic import it only when the user requests a PDF). Apply dynamic imports for heavy components: const PDFViewer = dynamic(() => import('./PDFViewer'), { loading: () => <Spinner /> }). After changes, run the analyzer again to verify the reduction.`,
    `A page fetches user data that changes at most once per hour. How do you cache this in Next.js App Router to avoid hitting the database on every request? In App Router, data fetching in server components uses the fetch API with revalidate: fetch('/api/user', { next: { revalidate: 3600 } }) — this caches the response for one hour. For Prisma queries (not fetch), use unstable_cache from next/cache: const getCachedUser = unstable_cache(async (id) => prisma.user.findUnique({ where: { id } }), ['user'], { revalidate: 3600 }). When the user changes their data, call revalidateTag or revalidatePath to bust the cache immediately.`,
    `Your page has a CLS score of 0.25 (poor). What causes CLS and how do you diagnose it? CLS occurs when content shifts after initial render — an image loads and pushes text down, a font loads and changes letter spacing, an ad injects into the layout. Diagnose in Chrome DevTools: open Performance tab, record a page load, look for layout shift events. Common fixes: always set explicit width and height on images (the browser reserves space before loading). Use font-display: optional or font-display: swap with size-adjust to minimise font-related shifts. Reserve space for dynamic content (ads, embeds) with min-height.`,
  ],

  common_mistakes: [
    `Using the <img> tag instead of Next.js Image for large images. The Image component handles format optimisation, sizing, lazy loading, and LCP preloading automatically. For the LCP image, add priority={true}.`,
    `Importing entire libraries when you need one function. import moment from 'moment' pulls in the full 67KB library. import { format } from 'date-fns' pulls in only that function. Audit your imports.`,
    `Not setting explicit dimensions on images. Without width and height, the browser does not know how much space to reserve, causing layout shift when the image loads. Always set dimensions or use the fill prop with a sized container.`,
    `Blocking the main thread with synchronous JavaScript. Long-running JavaScript (loops, complex calculations) blocks rendering and interactivity. Move heavy computation to Web Workers or break it into chunks with requestIdleCallback.`,
    `Over-fetching data in server components. Fetching the entire user object when you only need the name adds unnecessary database query time and serialisation cost. Select only the fields you need: prisma.user.findUnique({ where: { id }, select: { name: true } }).`,
  ],

  debug_help: `Lighthouse score is good locally but poor in production: you are probably testing on your fast machine with a fast connection. Lighthouse has a "Mobile" throttled mode that simulates a slower device and 4G connection — use this for realistic scores. Run Lighthouse on the production URL (after deploying), not localhost. Bundle analyzer shows a large chunk for a module you thought you removed: check for indirect imports — some package you are using may import it. Run npx depcheck to find unused dependencies. CLS is 0 in development but non-zero in production: production may use a CDN with different caching, fonts load differently, or image CDN is slower. Test with Cache-Control: no-cache to bypass CDN caching and reproduce the issue locally.`,

  ai_assist: [
    `"Analyse this next build output: [paste output]. Identify the routes with the largest bundles, explain what is likely causing the size, and suggest specific optimisations."`,
    `"I'm importing these packages in my Next.js app: [paste import list]. Which ones have cheaper alternatives or can be tree-shaken more aggressively? Show me the before/after import syntax."`,
    `"Explain Next.js App Router's caching model: what is request memoization, data cache, full route cache, and router cache? When is each invalidated? Give a concrete example of a page that uses all four."`,
  ],

  stretch: [
    `Implement streaming with Suspense in Next.js. Wrap slow data-fetching server components in <Suspense fallback={<Skeleton />}>. The page HTML streams progressively — fast content reaches the browser first, slow content follows when ready. Measure the improvement in Time to First Byte and LCP.`,
    `Add a service worker for offline support and caching using next-pwa. Cache the homepage and menu page so Bean Forge works offline. Test by opening DevTools > Network > Offline mode.`,
    `Run a performance audit on your database queries. Install the Prisma query log (log: ['query']) and look for N+1 queries (fetching related data in a loop). Fix them with include or with query batching. Measure the reduction in response time.`,
  ],
});

rewriteWeek("full-stack-web", 19, {
  context: `Continuous Integration and Continuous Deployment (CI/CD) is the practice of automatically running tests and deploying code on every change. The goal: changes go from your editor to users in production with confidence, in minutes, without manual steps. This week you set up the pipeline that will govern every future change to Bean Forge.

CI (Continuous Integration): every push to the repository triggers an automated pipeline that installs dependencies, runs linting, runs the type checker, runs the test suite, and builds the application. If any of these fail, the pipeline fails and the change is blocked from merging. The point is that you find out within 5 minutes of pushing whether your change is broken — not 2 days later when someone complains.

CD (Continuous Deployment): after CI passes on the main branch, the pipeline automatically deploys to production. For staging environments, deploy on every merge to main. For production, some teams add a manual approval step. With Vercel or Railway, deployment is a single command or a git push — these platforms handle building and serving.

GitHub Actions is the standard CI system for GitHub repositories. A workflow is a YAML file in .github/workflows/ that defines jobs (groups of steps) triggered by events (push, pull_request, schedule). Each job runs on a fresh virtual machine (runner). Steps are shell commands or pre-built actions from the Actions Marketplace.

Environments and secrets: production credentials (DATABASE_URL, STRIPE_SECRET_KEY, etc.) must not be in your code. GitHub Actions provides encrypted secrets that you set in the repository settings and reference in workflows as \${{ secrets.SECRET_NAME }}. Set up separate secrets for staging and production environments.

Preview deployments: Vercel and Railway can deploy every pull request to a unique preview URL. This means stakeholders can review changes on a live URL before they merge to main. Each preview has its own environment variables (connected to the staging database, not production).`,

  pre_flight: `Have a GitHub repository for Bean Forge with your code pushed to it. Create a Vercel account and connect it to your GitHub repository. Vercel's GitHub integration automatically creates preview deployments for pull requests and production deployments for main branch merges. Read the GitHub Actions quickstart guide. Understand YAML syntax: indentation is significant, lists use hyphens, key-value pairs use colons.`,

  mastery_questions: [
    `You push a commit with a bug. The CI pipeline catches it and fails. How should the pipeline be configured so that a broken main branch cannot happen? Enforce branch protection rules on main: require at least one CI workflow to pass before merging, require pull request reviews, do not allow direct pushes to main. Every change goes through a PR. The CI runs on the PR. Only after CI passes and a reviewer approves can the PR merge. The merge triggers the CD deploy. This means main is always deployable.`,
    `Your GitHub Actions workflow runs npm install on every job run. This takes 45 seconds. How do you speed it up? Cache node_modules between runs using the actions/cache action. The cache key is based on the hash of package-lock.json — if the lockfile does not change, the cache is restored and npm install is skipped. Using actions/setup-node with cache: 'npm' does this automatically. Also use npm ci instead of npm install — it is faster because it installs directly from package-lock.json without resolving.`,
    `You have a workflow that runs tests, then deploys. A developer pushes 3 commits in quick succession. What happens if the deploy from the first commit is still running when the second commit triggers a new deploy? Both pipelines run in parallel — the second deploy may finish first (because the first's tests were slower), meaning the older code ends up in production. Fix with concurrency groups: concurrency: { group: production-deploy, cancel-in-progress: true }. This cancels the in-flight deploy when a new one starts, ensuring only the latest commit deploys.`,
    `How do you verify that your deployment actually works after deploying, not just that the CI tests passed? Add a smoke test step after deploy: a simple curl or a Playwright test that hits the production URL and checks the response. If the smoke test fails (the app is crashing in production), trigger a rollback. Vercel supports instant rollback to a previous deployment. Railway has a similar rollback mechanism. A smoke test catches cases where something works in CI but fails in production (environment variable not set, database migration not run, etc.).`,
  ],

  common_mistakes: [
    `Committing secrets to the repository. Even if you delete them later, they are in git history. Use GitHub Secrets for CI credentials, and .env files (excluded from git via .gitignore) for local development.`,
    `Running database migrations automatically in the deploy step without a migration plan. If a migration is destructive (drops a column) and the new code deploys before the migration runs, or vice versa, you get downtime or data loss. Plan zero-downtime migrations: add new columns before deploying new code that reads them, remove old columns after the old code no longer uses them.`,
    `Not caching dependencies in CI. Running npm install from scratch on every pipeline run adds 30-90 seconds per run. Multiply by 50 PRs per week and you are wasting hours of CI minutes.`,
    `Deploying directly from the CI runner with long-lived credentials. Prefer using the deployment platform's GitHub integration (Vercel GitHub app, Railway GitHub integration) which uses short-lived tokens and integrates with branch protection. Do not store Vercel API tokens in GitHub Secrets if Vercel's native integration handles it.`,
    `Not setting up preview deployments. Without preview deployments, reviewers have to check out the branch and run it locally to see UI changes. Vercel and Railway do this for free — set it up.`,
  ],

  debug_help: `GitHub Actions workflow does not trigger: check the on: block in the YAML — the branch name must match exactly (main vs master) and the event must match the action (push vs pull_request). Validate your YAML with the GitHub Actions linter (the Actions tab shows errors). Workflow runs but fails with "Command not found": the runner does not have the tool installed. Use an action like actions/setup-node before running npm commands. Environment variables not available in the workflow: if using GitHub Environments, the environment name in the job (environment: production) must match the environment created in repo Settings > Environments. Deployment succeeds in CI but app crashes in production: add a smoke test step and check the production logs immediately after deploy. Common cause: missing environment variable in the production environment.`,

  ai_assist: [
    `"Write a GitHub Actions workflow for a Next.js app that: triggers on push to main and on pull requests, runs on ubuntu-latest, caches node_modules using actions/setup-node cache, runs npm ci then next build then vitest --run, and on push to main only deploys to Vercel using the Vercel CLI."`,
    `"Explain zero-downtime database migrations for a PostgreSQL database with Prisma. I'm adding a NOT NULL column to a table with 500k rows. What sequence of migrations and deployments do I follow?"`,
    `"Write a GitHub Actions concurrency configuration for a deployment workflow that cancels in-progress deployments when a newer commit is pushed, but does not cancel CI test runs."`,
  ],

  stretch: [
    `Add a release workflow that creates a GitHub Release on every merge to main. Use semantic versioning based on commit message conventions (conventional commits): feat: triggers minor version bump, fix: triggers patch bump, feat!: triggers major bump. The semantic-release package automates this.`,
    `Set up a staging environment separate from production. Main branch deploys to staging automatically. Production deployment requires a manual trigger (a workflow_dispatch event or a tag push). This gives you a place to test with real data before it goes to users.`,
    `Add a dependency audit step to CI: npm audit --audit-level=high fails the build if any high-severity vulnerabilities are found in dependencies. Set up Dependabot to automatically open PRs for dependency updates.`,
  ],
});

rewriteWeek("full-stack-web", 20, {
  context: `Production is different from your laptop. On your laptop, you know when something breaks because you are watching the terminal. In production, users run into bugs while you are asleep, and unless you have instrumented your application, you find out from a support email two days later. Observability is the practice of making your system's internal state visible from its external outputs.

Three pillars of observability. Logs are timestamped records of events: a user logged in, an order was placed, an error occurred. Structured logs (JSON format) are machine-readable and can be queried. Unstructured logs (plain text sentences) are human-readable but hard to search at scale. Use structured logging. Metrics are numeric measurements aggregated over time: requests per second, error rate, database query latency, memory usage. They tell you the system is unhealthy. Logs tell you why. Traces are end-to-end records of a request as it flows through multiple services. They show you which part of a distributed system is slow.

Error tracking is the highest-ROI observability investment for a single-service application. Sentry captures unhandled exceptions, attaches the stack trace, the user's session, the browser/OS, and groups duplicate errors together. Without Sentry, a bug that affects 1000 users generates 1000 separate error reports (or none, if users just leave without reporting). With Sentry, it is one issue with a count of 1000.

Uptime monitoring checks your application from the outside at regular intervals and alerts you if it is down. Services like Better Uptime, UptimeRobot, or Checkly ping your health check endpoint every minute. Your health check endpoint should verify the database connection and any critical dependencies, not just return 200.

Logging in Node.js: use Pino (fast, structured JSON logging) or Winston. In development, pretty-print with human-readable format. In production, output raw JSON so log aggregation services (Datadog, Logtail, Papertrail) can parse it.`,

  pre_flight: `Create a Sentry account at sentry.io. Create a new project for Node.js (for your Express API) and a new project for Next.js (for your frontend). Install the Sentry SDK: npm i @sentry/node (backend) and npm i @sentry/nextjs (frontend). Run the Sentry Next.js wizard: npx @sentry/wizard@latest -i nextjs. Install Pino: npm i pino pino-pretty. Set up Better Uptime (betteruptime.com) with a free account — add your production URL as a monitor.`,

  mastery_questions: [
    `Your health check endpoint at /api/health returns 200. An uptime monitor pings it and reports your site is up. But users are getting "Internal Server Error" on checkout. How does this happen and how do you fix it? The health check only checked the HTTP server, not the database connection. If the database is down or out of connections, the health check passes but data operations fail. Fix: the health check must verify all critical dependencies. For the database: await prisma.\$queryRaw\`SELECT 1\`. For Redis: await redis.ping(). If any check fails, return 503 Service Unavailable. Now your uptime monitor detects the real failure.`,
    `Sentry groups multiple occurrences of the same error into one issue. What determines if two errors are the "same" issue? Sentry uses the error fingerprint: a combination of the error message, exception type, and stack trace. Two occurrences with the same stack trace are grouped together. You can customise the fingerprint if the default grouping is too coarse (one issue per error type) or too fine (one issue per URL parameter). For example, a database connection error at the same code location should always be one issue, regardless of the specific SQL query.`,
    `You want to trace a slow API request end-to-end: how long does each phase take? The request comes in, then authentication middleware, then a database query, then a third-party API call, then the response. How do you measure each phase? Use distributed tracing. Sentry's performance monitoring or OpenTelemetry wraps each phase in a span. Each span has a name, a start time, and a duration. The trace shows them as a waterfall — you can see that the database query took 800ms and the third-party API took 2 seconds. Without tracing, you only know the total request time.`,
    `You have structured logs in production. A user reports an error that happened 3 days ago. How do you investigate it using logs? With structured JSON logs in a log aggregation service (Datadog, Logtail), you can filter by time range, userId, requestId, or error level. Query: timestamp:[3 days ago] AND userId:abc123 AND level:error. If you logged a correlationId on every request and attached it to every log line in that request's lifecycle, you can trace all log lines from one request: requestId:xyz789. This is why request correlation IDs and structured logging matter — they make post-mortem investigation possible.`,
  ],

  common_mistakes: [
    `console.log for production logging. console.log output is unstructured text, not indexed, and goes to stdout where it may be discarded. Use Pino or Winston for structured JSON logging that log aggregation services can parse and index.`,
    `Logging sensitive data. Never log passwords, tokens, credit card numbers, or PII in log messages. Review what your error tracking and logging tools capture — Sentry scrubs common patterns but you must configure it for your specific sensitive fields.`,
    `Not using a request correlation ID. Without a correlation ID attached to every log line in a request, you cannot reconstruct what happened during one request when logs from multiple concurrent requests are interleaved.`,
    `Alert fatigue from low-threshold alerts. If your uptime monitor sends an alert for any 5-second blip in response time, you train yourself to ignore alerts. Set alert thresholds that reflect real user impact. Alert on the 95th percentile latency, not the average.`,
    `Not testing your alerts. An alert that never fires might be misconfigured. Test your Sentry integration by deliberately throwing an unhandled error. Test your uptime monitor by taking the health check down temporarily.`,
  ],

  debug_help: `Sentry is not capturing errors: verify the SENTRY_DSN is set in your production environment variables. Call Sentry.captureException(new Error('test')) in a route to verify the SDK is initialised and sending. Pino logs are not appearing in your log aggregation service: check that the service is reading from stdout and that your deployment platform pipes stdout to the service. Railway and Heroku capture stdout by default. Vercel functions only log during execution — cold start logs may not appear. Health check is returning 503 in production: your database check is failing. Log the specific error from prisma.\$queryRaw to see why. Common cause: database connection limit exceeded (too many serverless functions opening connections) — add a connection pool like Prisma Accelerate or PgBouncer.`,

  ai_assist: [
    `"Write a Pino logger setup for a Node.js/Express application. In development (NODE_ENV=development), use pino-pretty for human-readable output. In production, output raw JSON. Attach a requestId to every log line using the pino-http middleware for request correlation."`,
    `"Write a health check Express route at GET /api/health that checks: PostgreSQL database (run a SELECT 1 query), Redis connection (run PING), and disk space. Return 200 with a JSON status object if all pass, 503 if any fail. Include response time for each check."`,
    `"Write a Sentry configuration for a Next.js app that: captures unhandled exceptions, scrubs passwords and tokens from breadcrumbs, tags errors with the current userId if the user is authenticated, and sets the environment tag to development vs production based on NODE_ENV."`,
  ],

  stretch: [
    `Set up OpenTelemetry tracing for your Express API. Instrument the database layer (Prisma), HTTP client calls, and custom business logic spans. Export traces to Jaeger (run it locally with Docker) and view the trace waterfall for a checkout request.`,
    `Build a simple internal status page. A cron job (or GitHub Actions schedule) hits your health check endpoint every 5 minutes and writes the result (timestamp, status, latency) to a PostgreSQL table. A public Next.js page reads the last 90 days of data and shows uptime percentage and a response time chart.`,
    `Add alerting to Sentry: configure an alert rule that sends a Slack message when a new issue is created or when an existing issue exceeds 100 occurrences per hour. Set up a separate alert for any P1 error (tagged manually or by error type).`,
  ],
});
