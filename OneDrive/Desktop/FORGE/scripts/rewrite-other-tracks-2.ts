/**
 * Rewrites context + mastery_questions for:
 *   - full-stack-web.json     (24 weeks)
 *   - mobile-engineering.json (24 weeks)
 *
 * Run: npx tsx scripts/rewrite-other-tracks-2.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

interface WeekUpdate {
  context: string;
  mastery_questions: string[];
}

function applyUpdates(filename: string, updates: Record<number, WeekUpdate>) {
  const file = resolve(process.cwd(), `data/roadmaps/${filename}`);
  const roadmap = JSON.parse(readFileSync(file, "utf-8"));
  let updated = 0;
  for (const week of roadmap.weeks) {
    const u = updates[week.number];
    if (u) {
      week.context = u.context;
      week.mastery_questions = u.mastery_questions;
      updated++;
    }
  }
  writeFileSync(file, JSON.stringify(roadmap, null, 2), "utf-8");
  console.log(`✓ ${filename} updated: ${updated} weeks rewritten`);
}

// ─── FULL-STACK WEB ────────────────────────────────────────────────────────────

const FSW: Record<number, WeekUpdate> = {
  1: {
    context: `Every website you have ever visited — Netflix, Instagram, Google Maps — is just text. HTML, CSS, and JavaScript flying over a wire into a browser that turns them into pixels. That's it. That's the whole magic trick. This week you pull back the curtain. You write your first lines of HTML and watch a browser render them into a real webpage. You write your first CSS rule and watch text change colour. You understand what a DOM is, why URLs work the way they do, and how a browser parses a document from top to bottom. The best full-stack engineers never stop thinking at this level. When something breaks in production, it's almost always something fundamental — a missing closing tag, a CORS header, a misrouted request. Build your foundation obsessively. Bean Forge v0.1 is your first deliverable: a static HTML/CSS landing page for a fictional coffee company. It sounds small. It isn't. Every engineering career starts exactly here.`,
    mastery_questions: [
      `Open your Bean Forge page in the browser, right-click the heading, choose Inspect, and paste the HTML you see in DevTools here. What do you notice about how the browser modified your raw HTML?`,
      `Add a second CSS rule that changes the background colour of the page. Paste it here. Now explain in one sentence how the browser decided which rule 'won' when two rules targeted the same element.`,
      `Type your Bean Forge URL into a browser with DevTools open on the Network tab. Hit enter and watch the waterfall. Paste the name and size of the first file that loaded. Why did it load first?`,
      `Pause and think: what does it mean for HTML to be 'semantic'? Name two HTML elements whose tag name describes its purpose, and explain why search engines care about this.`,
      `Push Bean Forge v0.1 to GitHub Pages or Netlify. Paste the live URL. You just shipped your first public website — that URL exists on the internet right now.`,
    ],
  },
  2: {
    context: `Static HTML is a brochure. JavaScript turns it into a machine. The moment you add JavaScript to a page, you unlock interactivity — the thing that separates modern web apps from 1999 websites. This week you learn how JavaScript manipulates the DOM, responds to user events, and makes pages feel alive. You are also meeting the language that powers every major frontend framework, every Node.js server, and every build tool in existence. That one language — JavaScript — runs in browsers, on servers, in desktop apps, in IoT devices. It is the most deployed programming language on the planet. Understanding it at a deep level, not just copying patterns, is what separates engineers from script kiddies. Bean Forge v0.2 gets a mobile menu, a live search filter over the coffee menu, and a subtle scroll animation. Real features, real code. Pause after each feature and read every line you wrote aloud. If you cannot explain a line, you do not understand it yet.`,
    mastery_questions: [
      `Paste the JavaScript function you wrote for your mobile menu toggle. Walk through it line by line: what does each line do, and what would break if you removed it?`,
      `Open the Console in DevTools and type: document.querySelectorAll('p').length — paste the result. Now explain what querySelectorAll returns and why it's different from getElementById.`,
      `Your live search filter reads from the DOM on every keystroke. Is that expensive? Paste your search handler and identify one optimisation you could make (hint: look up 'debounce').`,
      `Write a 3-line explanation of the event loop. Why does JavaScript do only one thing at a time but still feel fast in browsers?`,
      `Add a feature that wasn't in the brief — anything that makes Bean Forge feel more alive. Describe what you built and paste the JS. You just wrote un-prompted code. That's how real engineers think.`,
    ],
  },
  3: {
    context: `A website with no way to receive input is a dead end. Every real product needs some mechanism for users to reach you — a booking form, a contact page, a newsletter signup. This week you wire up a real contact form that actually sends emails, using Netlify Forms to handle the backend so you can stay focused on the user experience. But the real lesson this week is about product thinking. Forms fail in more ways than they succeed: required fields not validated, submissions lost, no confirmation email, success states that say nothing helpful. You will learn what a 'happy path' is, map the 'sad paths', and build a form that handles both. This is the first week you write code that a real user touches and where a bug means a real person's message disappears into the void. Take that seriously.`,
    mastery_questions: [
      `Fill out your Bean Forge contact form and submit it. Go to your Netlify dashboard and paste a screenshot of the submission in your Netlify Forms inbox. It arrived. Real data from a real form.`,
      `Trigger a validation error on your form deliberately — leave a required field blank and submit. Paste the browser's native validation message vs the custom message you wrote. Which is more helpful to a user and why?`,
      `What happens if a user submits your form with JavaScript disabled? Test it. Paste what you see. Does Netlify Forms still work? Why or why not?`,
      `Add a success state — after submission, show a message that doesn't just say 'Submitted'. Make it warm, specific, human. Paste your HTML/CSS for the success state.`,
      `Pause and think: what are three things that could go wrong between a user clicking Submit and you receiving the email? List them and explain how a production app would defend against each.`,
    ],
  },
  4: {
    context: `You have been writing raw HTML and CSS by hand. That scales to about three pages before it becomes a maintenance nightmare. Astro is what happens when engineers get tired of copy-pasting nav bars into 20 HTML files. It's a static-site generator and component framework used in production by companies like Porsche, Nordstrom, and The Guardian. This week you refactor Bean Forge into Astro — you break it into components, add a proper /blog route with markdown posts, and understand the difference between a static page and a server-rendered page. You are also meeting the concept that will define the rest of your frontend career: components are just functions that return UI. That mental model works in Astro, React, Vue, Svelte, and every other framework you will ever touch. Nail the concept here and every framework you learn later will feel like re-reading a book you already know.`,
    mastery_questions: [
      `Run npm run build on your Astro project and paste the output. Find the line that says how many pages were generated. Open the dist/ folder and paste the structure you see. You just compiled a website.`,
      `Create a Layout.astro component and use it on three pages. Paste the component. Explain why this is better than copy-pasting the same <head> and <nav> HTML into every .html file.`,
      `Write a markdown blog post for Bean Forge about the origin of Ethiopian coffee. Add frontmatter with a title and date. Paste the rendered /blog URL and explain how Astro turned your .md file into HTML.`,
      `Find the Astro docs for Content Collections. In two sentences, explain what problem they solve and when you would use them over plain markdown files.`,
      `Pause and think: Astro has an 'islands' architecture. Read the Astro Islands docs for 5 minutes. Paste a one-paragraph explanation of what problem it solves and give one example of when you'd use a React island inside an Astro page.`,
    ],
  },
  5: {
    context: `In 2013, a Facebook engineer named Jordan Walke released React and broke the web in half — before React, and after. The insight was deceptively simple: UI is a function of state. Give me data, I give you pixels. Change the data, the pixels update automatically. No more jQuery spaghetti. No more manually hunting DOM nodes. React is now used by Facebook, Instagram, Airbnb, Netflix, Dropbox, and essentially every large product company on the planet. More importantly, understanding React's component model will make you understand every other framework — Vue components, Svelte components, Angular components are all the same idea wearing different clothes. This week you build your first React app from scratch. You meet JSX, props, state, and the concept of re-rendering. Expect your brain to hurt by Thursday. That feeling is learning.`,
    mastery_questions: [
      `Create a <CoffeeCard> component that accepts name, price, and description as props. Render three cards with different data. Paste your component and explain: what is a 'prop' conceptually — what problem does it solve?`,
      `Add useState to track how many cups a user has added to a cart. Increment it when they click Add to Cart. Paste your state logic. Now explain: why can't you just use a regular variable instead of useState?`,
      `Open React DevTools in your browser. Find your CoffeeCard component in the tree, inspect its props. Paste what you see. This is how engineers debug React in production.`,
      `What is the 'key' prop and why does React require it when rendering lists? Write a bad example (no key) and a good example (correct key). Explain what goes wrong without it.`,
      `Pause and think: React re-renders a component every time its state changes. Can you think of a scenario where that would cause a performance problem? Write it out, then look up React.memo and explain how it helps.`,
    ],
  },
  6: {
    context: `React is a library. Next.js is what happens when you take React and add everything a real production app needs — routing, server-side rendering, API routes, image optimisation, middleware, and a deploy button. As of 2024, Next.js is the dominant React framework for full-stack development. It's what Vercel, OpenAI, TikTok, Twitch, and thousands of startups use to ship products. The App Router (introduced in Next.js 13) changed everything again: React Server Components mean you can now run server-side code inside your UI components. The boundary between frontend and backend, once crisp, is now blurry in the most productive possible way. This week you migrate your React app to Next.js, understand how the App Router works, learn the difference between Server and Client Components, and ship your first full-stack Next.js page with a real data fetch. If you land a frontend or full-stack job in the next two years, there is a very high chance Next.js is already in the stack.`,
    mastery_questions: [
      `Create a /menu page that fetches coffee data from a public API (or a local JSON file) using a Server Component — no useEffect, no useState. Paste your page component. Why is it simpler than the React way?`,
      `Add 'use client' to one component and explain in one paragraph why you made that component a Client Component. What feature required it?`,
      `Run next build and paste the route analysis output. Find one page marked as 'static' and one marked as 'dynamic'. Explain what determines which one Next.js chose.`,
      `Add a loading.tsx file to your /menu route. Explain what it does and how Next.js knows to render it — there is no code that says 'while loading, show this'. How does it know?`,
      `Paste your folder structure inside /app. Draw a mental map: which folders become URL segments, which files are special (page, layout, loading, error). You just learned the routing convention that powers most Next.js production apps.`,
    ],
  },
  7: {
    context: `Before Tailwind, styling was a negotiation. You wrote CSS in one file, HTML in another, and spent half your time inventing class names that meant nothing. Tailwind CSS flips the model: every style is a utility class that lives directly on the element. It sounds chaotic until you realise you never name things, never jump between files, and never end up with dead CSS that nobody dares delete. Stripe uses Tailwind. GitHub's new designs use Tailwind. Every serious design system built in the last three years uses utility-first CSS. But Tailwind is also a design system lesson: spacing scales, colour palettes, type scales, responsive breakpoints — all of it is baked in. This week you restyle Bean Forge with Tailwind from scratch, build a reusable Button component with variants, and understand how design systems make teams ship faster by constraining choice.`,
    mastery_questions: [
      `Rebuild your Bean Forge hero section using only Tailwind classes — no custom CSS. Paste the HTML. Count how many classes you used. Now look at the generated CSS: how many lines did Tailwind write on your behalf?`,
      `Build a <Button> component with three variants: primary, secondary, ghost. Use cva (class-variance-authority) or a simple conditional. Paste the component. Explain: why is a design system's Button component better than styling each button individually?`,
      `Make your page fully responsive: it should look perfect on mobile (375px), tablet (768px), and desktop (1440px). Paste your most complex responsive section. Explain each breakpoint prefix you used.`,
      `Open your Tailwind config and extend the theme: add your own brand colour and a custom font size. Use them in your page. Paste the config change and where you used the new values.`,
      `Pause and think: what is the criticism of Tailwind (look it up — there are real arguments). Write two sentences defending Tailwind and two sentences against it. Good engineers understand both sides.`,
    ],
  },
  8: {
    context: `useState is a torch. Redux is a power station. When your app has one component and three pieces of data, useState is perfect. When it has 50 components sharing user session data, cart state, notification badges, and theme preferences — useState becomes a nightmare of prop drilling. This week you learn the spectrum of state management: local state (useState), shared local state (lifting), context (React Context API), and global state (Zustand — the library most senior engineers actually reach for now, not Redux). You will also learn the most important state management insight: most UI bugs are state bugs. A component shows stale data, two components disagree about who is logged in, a form resets when you didn't want it to. Understanding state deeply makes you dangerous at debugging.`,
    mastery_questions: [
      `Implement a shopping cart using Zustand. It should support: add item, remove item, clear cart, total price. Paste your store definition. Explain why you can call useStore() in any component and always get the same data.`,
      `Convert a prop-drilling chain (passing a prop through 3 component layers) to use React Context instead. Paste before and after. Explain the trade-off: why is Context not always the right answer?`,
      `Find a bug by breaking your cart deliberately: add an item, navigate to another page, come back. Does your cart persist? If not, add localStorage persistence to your Zustand store. Paste the fix.`,
      `Look up 'derived state' in React. In one paragraph explain what it is and give an example of a mistake you might make by storing derived state in useState.`,
      `Pause and think: you are managing three kinds of state — UI state (is this modal open?), server state (what did the API return?), and URL state (what is in the query string?). For a job listing page with filters, which kind of state should the filters live in and why?`,
    ],
  },
  9: {
    context: `Every time you use an app that saves your data, there is a server running somewhere — a computer that never sleeps, listening for requests over the network. This week you build your first server. Node.js lets you write that server in JavaScript — the same language you use in the browser. Express is the framework that makes it simple: define a route, write a handler, return a response. It sounds trivial. It is. The sophistication comes from what you do inside the handler: validate input, query a database, call external APIs, authenticate users, send emails. By Friday you will have a running Express API with CRUD routes for coffee products. By next week you'll give it a real database. This is the moment the 'full' in full-stack becomes real. You are no longer borrowing a back-end. You are building one.`,
    mastery_questions: [
      `Start your Express server and make a GET /products request with curl or Insomnia. Paste the raw HTTP response including headers. Identify the Content-Type header and explain why it matters.`,
      `Add a POST /products route that accepts JSON, validates that name and price are present, and returns a 400 error with a helpful message if they're missing. Paste your validation logic. What status code did you use for a missing field and why?`,
      `Add an error-handling middleware to your Express app — the four-argument function signature (err, req, res, next). Deliberately trigger an error and verify your handler catches it. Paste the middleware.`,
      `What is middleware? Draw a diagram in ASCII showing a request flowing through three middleware functions before hitting a route handler. Explain why order matters.`,
      `Pause and think: your Express server currently stores data in memory — if you restart it, all data is gone. List three problems this causes in production and explain what you will add next week to fix them.`,
    ],
  },
  10: {
    context: `Data is the business. Every product you build will live or die on the quality of its data model. Design it well and adding features is a joy. Design it badly and every new feature is a migration nightmare. PostgreSQL is the database most serious startups and companies use — it is reliable, relational, fast, free, and has 30 years of battle testing behind it. Prisma is the ORM that makes Postgres feel modern: type-safe queries, schema-as-code, automatic migrations. This week you design your first real database schema — users, products, orders — write your first migrations, and connect your Express server to Postgres. You will also make your first mistake: an assumption about your data model that only reveals itself when you try to add a feature. That mistake is intentional. Database design is learned through regret.`,
    mastery_questions: [
      `Open Prisma Studio (npx prisma studio) and paste a screenshot of your database tables. Create one record in each table through the UI. Now write the equivalent Prisma Client query that creates the same record in code.`,
      `Write a Prisma query that finds all orders for a specific user, including the product names and prices. Paste the query and explain what 'include' does vs 'select'.`,
      `Run npx prisma migrate dev and paste the generated SQL migration. Explain each ALTER TABLE or CREATE TABLE statement in plain English.`,
      `Intentionally create a 'N+1 query problem' by fetching 10 orders and then querying each order's product separately in a loop. Paste the query. Then rewrite it to use a single query. Explain why N+1 kills production performance.`,
      `Pause and think: your schema has a users table and an orders table. A user gets deleted. What happens to their orders? Look up 'cascade delete' in Prisma. Set it up and explain what business logic decision you just encoded into your database.`,
    ],
  },
  11: {
    context: `Every API you have ever used — Stripe, GitHub, Twilio, Spotify — was designed by a human being making decisions. What should this endpoint be called? What does it return? What happens when something goes wrong? Good API design is invisible — developers just use it and things work. Bad API design creates a Slack channel full of confused engineers and a 40-page FAQ. This week you design RESTful API endpoints for your Bean Forge platform following real industry conventions: proper HTTP verbs, meaningful status codes, consistent response shapes, pagination for lists, and error objects that tell you exactly what went wrong. You will also write your first API documentation using the OpenAPI spec. Future-you writing a frontend that consumes this API will thank present-you for every 20 minutes you spend on design now.`,
    mastery_questions: [
      `Design the API for a coffee order resource: create, read, update, cancel. For each operation, write: the HTTP method, the URL, the request body (if any), and the success response status code. Justify every choice.`,
      `Write a consistent error response format for your API — one shape that works for validation errors, not-found errors, and server errors. Paste the format. Explain why consistency matters when a frontend team consumes your API.`,
      `Add pagination to GET /products — it should support ?page=2&limit=20. Paste the route and explain how you return the total count so the frontend can render page numbers.`,
      `Import your API into Insomnia or Postman and run every endpoint. Paste a screenshot of your collection. This is how every professional API is tested during development.`,
      `Pause and think: your API has no versioning. A breaking change to GET /products would break every client immediately. Research API versioning strategies (/v1/, header-based, query param). Write a one-paragraph recommendation for which approach you would use and why.`,
    ],
  },
  12: {
    context: `Authentication is the hardest part of web development to get right and the most catastrophic to get wrong. In 2012, LinkedIn leaked 6.5 million password hashes. In 2019, Facebook stored hundreds of millions of passwords in plaintext. Both are avoidable mistakes. This week you implement authentication properly: passwords hashed with bcrypt, JWTs for sessions, refresh token rotation, and middleware that gates protected routes. You will also implement authorization — not just 'are you logged in?' but 'are you allowed to do this specific thing?' A logged-in user should not be able to delete someone else's order. The moment your app has multiple users, it has an authorization problem. This week you solve it.`,
    mastery_questions: [
      `Register a user through your API and inspect the hashed password in your database. Paste the hash. Now explain why a bcrypt hash of the same password is different every time, and why that's a feature.`,
      `Decode your JWT at jwt.io and paste the payload. What fields are in it? Why should you never store a password or credit card number in a JWT payload?`,
      `Write the middleware that validates a JWT on protected routes. Paste it. Now test it: call a protected route without a token, with a tampered token, and with an expired token. Paste the error responses for each.`,
      `Implement role-based access control: add a 'role' field to your User model with values 'customer' and 'admin'. Write middleware that checks the role. Test that an admin can DELETE /products but a customer gets a 403. Paste the implementation.`,
      `Pause and think: what is an OAuth2 flow? Why would you want to use Google login instead of building your own auth? Draw the 3-step OAuth dance in plain English (no jargon). When would you NOT use OAuth?`,
    ],
  },
  13: {
    context: `Stripe processes over $1 trillion a year. It handles payments for Amazon, Shopify, Lyft, DoorDash, and millions of other businesses. It is also, by a wide margin, the best-documented API ever built. Learning Stripe is not just about taking money — it is a masterclass in API design, webhook architecture, and payment security. This week you add Stripe Checkout to Bean Forge. Users click 'Order', get redirected to Stripe's hosted payment page, and land back on a confirmation page. You also implement webhooks — because Stripe needs to tell your server when payment succeeds, and it does that by hitting your server's URL after the fact. Get webhooks wrong and you ship orders for free. That is exactly the kind of bug that ends a startup.`,
    mastery_questions: [
      `Complete a test payment using Stripe's test card (4242 4242 4242 4242). Go to your Stripe dashboard and paste a screenshot of the payment appearing. What does it tell you about the transaction?`,
      `Add a Stripe webhook endpoint to your server. Forward test events using the Stripe CLI: stripe listen --forward-to localhost:3000/webhooks. Paste the event payload for a checkout.session.completed event. What fields would you use to fulfil the order?`,
      `What happens if your server is down when Stripe fires a webhook? Look up Stripe's retry logic. Explain: how do you make your webhook handler idempotent so that processing the same event twice doesn't create two orders?`,
      `Stripe provides a customer ID. Explain why you should save it in your database when a user first pays, and what features it unlocks for future payments.`,
      `Pause and think: you are showing the price of a product in your frontend. A user could open DevTools and change it. Explain why the price must be validated server-side in Stripe — what would happen if you trusted the price the client sent?`,
    ],
  },
  14: {
    context: `Email is older than the web. It is also still the highest-ROI marketing channel for most businesses and the primary way apps communicate with users — password resets, receipts, shipping updates, welcome sequences. But email is also a crime scene: spam filters, rendering inconsistencies across 20 email clients, authentication protocols (SPF, DKIM, DMARC) that decide whether your emails land or vanish. This week you wire up transactional email with Resend and React Email — modern tools that make email feel like building a React component. You will send a real order confirmation email, a password reset flow, and understand why Gmail, Outlook, and Apple Mail all render the same HTML differently. After this week, you will never look at a broken email the same way.`,
    mastery_questions: [
      `Send yourself an order confirmation email using Resend. Paste the API call you wrote. Open the email on Gmail AND on Apple Mail (or a friend's phone). Take a screenshot of both. Do they look identical? Why or why not?`,
      `Implement a password reset flow: POST /auth/forgot-password sends an email with a time-limited token, and POST /auth/reset-password validates it. Paste the token generation logic. Why must the token expire?`,
      `Go to mail-tester.com, send your email there, and paste your score. What SPF/DKIM settings did you need to add? Explain what they verify.`,
      `Add an 'unsubscribe' link to your marketing email. Explain the CAN-SPAM compliance requirements and what legally happens if you email people who have unsubscribed.`,
      `Pause and think: your welcome email is sent synchronously inside the POST /register route handler. If the email provider is slow, your registration endpoint is slow. How would you decouple email sending from the HTTP response? What would the architecture look like?`,
    ],
  },
  15: {
    context: `In 2006, Amazon Web Services launched S3 — Simple Storage Service. It was an unlimited file drawer in the cloud, accessible from anywhere in the world via a URL. Today, S3 stores over 100 trillion objects. When Instagram started, they stored every photo in S3. When you upload a profile picture to Twitter, it lands in object storage. This week you add file uploads to Bean Forge: users can upload images for their profile and product managers can upload photos of new coffees. You use a presigned URL flow — your server generates a temporary upload URL, the browser uploads directly to S3 (or Cloudflare R2), and then your server only stores the final URL in the database. This is the pattern used by every major web application because it removes your server from the file transfer entirely.`,
    mastery_questions: [
      `Upload an image through your app and open it by its S3/R2 URL in a browser tab. Paste the URL. Now look at the request in DevTools — what Content-Type header did you send? What happens if you get it wrong?`,
      `Implement a file type and size limit: reject anything that isn't an image and anything over 5MB. Where does this validation happen — client, server, or both? Paste your validation code and explain why you need both.`,
      `Set up a CloudFront distribution (or Cloudflare) in front of your S3 bucket. Explain what a CDN does: why is the image faster through CloudFront than directly from S3?`,
      `What is a presigned URL? Explain the security model: why is it safer for the browser to upload directly to S3 with a presigned URL than to upload to your server first?`,
      `Pause and think: a user uploads a 12MB TIFF file, renames it to image.jpg, and submits. Your extension check passes. But your app breaks when displaying it. What checks do you need beyond the file extension?`,
    ],
  },
  16: {
    context: `HTTP is a conversation: you ask, the server answers, the connection closes. That is perfect for loading a page. It is terrible for a chat app, a live sports scoreboard, or a collaborative document editor — situations where the server needs to push data to you without you asking. WebSockets solve this by keeping the connection open: once established, both sides can send messages at any time. Slack is built on WebSockets. Figma's real-time collaboration is WebSockets. GitHub's live notifications are WebSockets. This week you build a real-time feature into Bean Forge: a live order status dashboard that updates instantly when an order status changes, without requiring a page refresh. You will use Socket.io — the library that has powered real-time features in production for over a decade.`,
    mastery_questions: [
      `Open two browser tabs side by side on your order dashboard. Update an order status in one tab and watch it update in the other without refreshing. Paste the Socket.io emit call on your server and the on() handler in your client. Explain what happened between them.`,
      `What is the difference between WebSocket and HTTP long-polling? Explain why WebSocket is more efficient for high-frequency updates.`,
      `Add 'rooms' to your implementation so that only users who ordered the same coffee batch see updates for that batch. Paste your socket.join() implementation. Why is broadcasting to a specific room better than broadcasting to everyone?`,
      `What happens to your WebSocket connections when you deploy to a platform with multiple server instances? Look up 'Socket.io Redis adapter'. Explain the problem it solves in one paragraph.`,
      `Pause and think: your real-time dashboard currently has no authentication — any WebSocket connection can receive all order updates. How would you verify a user's JWT when they connect via WebSocket, not HTTP?`,
    ],
  },
  17: {
    context: `Untested code is a liability. Every time you ship an untested feature, you are betting that you thought of every edge case, that the function behaves correctly for all inputs, and that future changes will not break it silently. That bet usually loses eventually — often at the worst moment. The best engineers do not write tests because their company requires it. They write tests because tests tell you immediately when something breaks, they document the intended behaviour, and they make refactoring fearless. This week you write unit tests for your utility functions, integration tests for your API endpoints, and an end-to-end test with Playwright that simulates a real user flow — landing on the page, adding a product, completing checkout. If you write the test first, you will also experience TDD for the first time.`,
    mastery_questions: [
      `Write a unit test for your price calculation logic using Vitest or Jest. Make it fail first, then fix the code to make it pass. Paste the test and explain what 'red-green-refactor' means.`,
      `Write an integration test for POST /orders using supertest. It should create an order and assert the response shape and status code. Paste the test. Why do integration tests use a real database (or a test database) while unit tests mock everything?`,
      `Write a Playwright end-to-end test that: opens the homepage, clicks 'Add to Cart' on a product, goes to checkout, fills in Stripe's test card, and verifies the success page appears. Paste the test.`,
      `Run your full test suite and paste the output — how many tests pass, how long did it take? Now delete a function your tests depend on. What happens? Paste the failure message.`,
      `Pause and think: what is the difference between a mock, a stub, and a spy? Give a concrete example of when you would use each in testing a function that sends an email.`,
    ],
  },
  18: {
    context: `A website that takes 5 seconds to load loses 40% of visitors. That is not a UX preference — it is a Google study, and the number is worse for mobile users on 3G connections. Web performance is the discipline of making pages load faster and feel more responsive, and it has direct impact on revenue, SEO ranking, and user retention. This week you measure Bean Forge's Core Web Vitals — Largest Contentful Paint, Cumulative Layout Shift, First Input Delay — and fix them. You run Lighthouse. You analyse your JavaScript bundle with Webpack Bundle Analyzer. You add lazy loading, image optimisation, and code splitting. After this week, your Lighthouse performance score goes from wherever it is to above 90. That delta is a feature.`,
    mastery_questions: [
      `Run Lighthouse on your Bean Forge homepage in Chrome DevTools. Paste your scores for Performance, Accessibility, Best Practices, and SEO. Find the biggest opportunity and describe what Lighthouse recommends you fix.`,
      `Add next/image (or a lazy-loaded <img> with loading="lazy") to your hero image. Measure the LCP before and after. Paste both numbers. What changed and why?`,
      `Install @next/bundle-analyzer and run it. Paste a screenshot of the treemap. Find the largest package in your bundle. Is it necessary? Could it be lazy-loaded?`,
      `What is 'layout shift' and why does it feel bad to users? Reproduce a CLS of > 0.1 deliberately (hint: load an image without dimensions) and then fix it. Paste your CLS score before and after.`,
      `Pause and think: you have a page that fetches 200 products and renders them all at once. It feels slow on mobile. List three techniques you could use to make it feel faster without changing the backend (hint: virtualization, infinite scroll, pagination).`,
    ],
  },
  19: {
    context: `Deploying manually is a ritual. You run a build, you copy files to a server, you restart a service, you pray. Modern engineering has replaced that ritual with Continuous Integration and Continuous Deployment: every push to main triggers an automated pipeline that runs your tests, builds your app, and deploys it to production — all without you touching anything. If tests fail, the deploy stops. If tests pass, code ships. GitHub Actions is the CI/CD platform used by more open source projects than any other. This week you write a GitHub Actions workflow that runs your test suite on every pull request and deploys to Vercel on every merge to main. From this week forward, you will never manually deploy Bean Forge again.`,
    mastery_questions: [
      `Push a commit that breaks one of your tests. Open GitHub Actions and paste a screenshot of the failed workflow run. Explain each step that ran and where it stopped.`,
      `Add a job to your workflow that runs your TypeScript type checker (tsc --noEmit). Make it fail by introducing a type error, then fix it. Paste the workflow YAML for this step.`,
      `Set up branch protection on your main branch: require PR reviews and require CI to pass before merge. Paste a screenshot of the settings. Explain why force-pushing to main is dangerous in a team environment.`,
      `Add a secret to your GitHub repository for your DATABASE_URL and use it in your workflow. Paste the workflow step that uses the secret. Explain why secrets are masked in CI logs.`,
      `Pause and think: your pipeline currently runs all tests on every push. As your test suite grows to 500 tests, this takes 8 minutes. What strategies exist to keep CI fast? (Look up 'test parallelisation' and 'test sharding'.)`,
    ],
  },
  20: {
    context: `Something in production is broken. A user reports that checkout is failing. You have no error messages, no logs, no way to reproduce it. You are flying blind. Observability is the discipline of making your system transparent — so when something breaks, you know exactly what happened, where, and why. Logs tell you what events occurred. Metrics tell you how your system is performing over time. Traces tell you the exact path a specific request took through your code. Together they form the 'three pillars of observability'. This week you add structured logging with Pino, error tracking with Sentry, and basic metrics with Prometheus. After this week, when something breaks in production you will have a fighting chance of finding it within minutes rather than hours.`,
    mastery_questions: [
      `Trigger a 500 error in your app and find it in Sentry. Paste a screenshot of the Sentry error detail page — include the stack trace and the 'breadcrumbs' section. What does Sentry show you that a raw log wouldn't?`,
      `Add structured logging to your POST /orders route using Pino. Log the user ID, product ID, and order total at INFO level. Log validation errors at WARN level. Paste the log output as JSON. Why is JSON logging better than string logging in production?`,
      `Set up a Prometheus counter that tracks the number of orders placed. Expose /metrics and paste the output. Explain what a 'counter' vs a 'gauge' vs a 'histogram' metric is.`,
      `Write a custom middleware that logs the HTTP method, route, status code, and response time for every request. Paste it. Now look at the logs and identify your slowest endpoint.`,
      `Pause and think: what is 'distributed tracing' and why does it matter? If a checkout request calls your auth service, then your product service, then Stripe, how would you trace the performance of the entire flow across those systems?`,
    ],
  },
  21: {
    context: `Security is not a feature you add at the end. It is a property you build in from the beginning — and when you skip it, the cost is not a bug report, it is a breach. OWASP publishes the top 10 web security vulnerabilities every year. SQL injection, cross-site scripting, broken authentication, insecure direct object references — these are not theoretical. They are the bugs that caused the Equifax breach, the LinkedIn leak, and thousands of smaller incidents every year. This week you attack your own app. You attempt to inject SQL, steal a cookie, bypass authentication, and access data that doesn't belong to you. Then you fix every vulnerability you find. The best security engineers think like attackers because they once were.`,
    mastery_questions: [
      `Attempt an SQL injection attack on your own search endpoint. What did you try? Did it work? Paste your test and explain how parameterised queries prevent it.`,
      `Find a cross-site scripting (XSS) vulnerability in your app — or create one deliberately by rendering user input without sanitisation. Paste the payload you used. Then fix it. Explain the difference between stored XSS and reflected XSS.`,
      `Check every API endpoint that returns data: can a logged-in user access another user's orders by guessing IDs? This is an IDOR (Insecure Direct Object Reference). Patch any you find and paste the authorisation check you added.`,
      `Add security headers to your app using the 'helmet' middleware (Express) or Next.js headers config. Paste your config. Explain what Content-Security-Policy does and why it is the most powerful XSS defence.`,
      `Pause and think: your app has no rate limiting on POST /auth/login. A bot can try 10,000 password combinations per second. Add rate limiting using express-rate-limit. Paste the config. What is the correct limit for a login endpoint?`,
    ],
  },
  22: {
    context: `Congratulations — a journalist tweeted about Bean Forge and you are getting 50x your normal traffic. Your single server is on fire. Response times are climbing. Requests are timing out. What do you do? Scaling is the discipline of making your system handle more load, and it comes in two flavours: vertical (bigger server) and horizontal (more servers). Horizontal scaling is harder but necessary for real applications, and it forces you to confront assumptions your code silently makes — that you only have one server, that in-memory sessions persist, that file uploads land on the same machine that serves the request. This week you audit Bean Forge for scale bottlenecks, add a caching layer with Redis, and understand database connection pooling. You will not scale to millions this week. You will understand what you would need to do.`,
    mastery_questions: [
      `Add Redis caching to your GET /products endpoint with a 5-minute TTL. Measure the response time with and without cache using curl's -w "%{time_total}". Paste both numbers. What is the speedup?`,
      `Run a load test against your API using autocannon or k6 — simulate 100 concurrent users for 30 seconds. Paste the results: requests per second, median latency, p99 latency. Where does your server start struggling?`,
      `Add connection pooling to your Prisma/PostgreSQL setup. Explain what happens without it when 100 concurrent requests each try to open a database connection.`,
      `Explain the difference between horizontal and vertical scaling. Give a scenario where horizontal scaling is impossible (what would need to change in your architecture first?).`,
      `Pause and think: your app stores JWT sessions in memory. If you add a second server, a user authenticated on server 1 gets a 401 on server 2. How do you fix this? What are the two approaches?`,
    ],
  },
  23: {
    context: `The difference between a good product and a great one is the 5% that nobody writes tickets for. The loading state that doesn't feel janky. The error message that doesn't say 'Something went wrong'. The animation that makes a deletion feel satisfying instead of abrupt. The empty state that guides rather than confuses. The favicon and page title that are correct on every tab. These details are invisible when they're right and unbearable when they're wrong. This week you do the polish pass on Bean Forge: you fix every rough edge, add skeleton loading states, write better empty states, make error messages human, and test on a real phone for the first time. You will find five bugs you didn't know existed. Fix them.`,
    mastery_questions: [
      `Test Bean Forge on a real phone by visiting your deployed URL. List three things that feel different or broken compared to the desktop experience. Fix at least one and describe what you changed.`,
      `Replace a loading spinner with a skeleton screen on your product list page. Paste the skeleton component. Explain why skeleton screens feel faster than spinners even when the actual load time is identical.`,
      `Find every error message in your app that says something generic ('An error occurred', 'Something went wrong'). Rewrite them to be specific and helpful. Paste before and after for two examples.`,
      `Add an empty state to every list in your app — the cart when it's empty, the order history when you have no orders, search results when nothing matches. Paste one empty state component. What should a good empty state communicate?`,
      `Run your app through WAVE (wave.webaim.org) for accessibility. Paste your results. Fix one accessibility error — add an aria-label, fix a contrast ratio, or label an icon button. Explain what you fixed and who it helps.`,
    ],
  },
  24: {
    context: `This is the week everything you have learned becomes real. You are shipping a complete SaaS product — a real URL, real users, real payments. Not a tutorial project. Not a demo. Something you built. Bean Forge goes from a local project to a live business: Stripe payments, email confirmations, user authentication, a database, a CDN, CI/CD that deploys on every push, Sentry watching for errors, logging in production. You are going to share it with five real people this week and get their feedback. Not friends who say it's great. Real strangers who will find every broken thing you didn't test. That feedback is the most valuable thing you will learn this week. Every startup begins exactly like this.`,
    mastery_questions: [
      `Deploy Bean Forge to production. Paste the live URL. Now complete a full end-to-end flow as a new user: sign up, browse, add to cart, checkout with a test card, receive the confirmation email. Screenshot each step.`,
      `Share your URL with three people who have never seen it. Watch them use it without helping them. Write down every moment they hesitated, got confused, or made an error. Paste your notes. What is the biggest UX problem you discovered?`,
      `Go to your Sentry dashboard after a day of real traffic. Paste any errors you see. Fix the most impactful one and deploy the fix. Paste the commit.`,
      `Calculate your Bean Forge's Lighthouse score on mobile (not desktop). If it's below 75, pick the biggest performance issue and fix it before the week ends.`,
      `Write a 300-word post-mortem: what did you build, what was the hardest technical decision, what would you do differently with the knowledge you now have? This is the document that separates engineers who ship from engineers who plan to ship.`,
    ],
  },
};

// ─── MOBILE ENGINEERING ────────────────────────────────────────────────────────

const MOBILE: Record<number, WeekUpdate> = {
  1: {
    context: `There are 6.9 billion smartphone users on the planet. More people have a smartphone than have a toothbrush. The app on those phones — the camera app, the maps app, the messaging app — lives closer to the user than any website ever will. It is on their lock screen. It is in their pocket. It buzzes them awake. Building mobile apps means building the most intimate software that exists. React Native lets you build real iOS and Android apps with JavaScript — not a web view, not a wrapper, actual native components. Hydra v0.1 is your first app: a water-tracking app that helps people drink enough water every day. It sounds simple because it is. But you will set up Expo, run it on a real device, understand the React Native component system, and ship pixels to an actual phone screen. That is the moment this becomes real.`,
    mastery_questions: [
      `Run Hydra on your physical phone using Expo Go. Open the app and paste a screenshot. Shake the device — what menu appears? This is the Expo developer menu. Explain one thing you can do from it.`,
      `Add a <Text> component, a <View> component, and a <TouchableOpacity> component to your app. Press the TouchableOpacity — log 'Pressed!' to the console. Paste your component and the console output. What is the React Native equivalent of a browser's <div>?`,
      `Open Metro bundler in your terminal. Make a change to your App.tsx and save. What happens on your phone within 2 seconds? This is Fast Refresh. Explain how it's different from a full app reload.`,
      `What is the difference between React Native StyleSheet and browser CSS? Name three CSS properties that don't exist in React Native and explain why.`,
      `Pause and think: React Native uses a JavaScript thread and a native UI thread. Messages pass between them via a bridge (or in new architecture, JSI). Why does this matter for performance? What kind of operations should you avoid on the JS thread?`,
    ],
  },
  2: {
    context: `Every great habit app has two things in common: a streak and a reminder. The streak makes you feel bad about breaking it. The reminder makes you feel good about maintaining it. Duolingo's mascot sends you guilt-laden notifications at 9pm because it works — engagement goes up, churn goes down. This week Hydra gets a daily reset (your water counter goes back to zero at midnight) and a push notification that reminds you to drink at whatever time you set. You are meeting Expo Notifications and understanding how iOS and Android differ — different permission models, different notification styling, different delivery mechanics. Mobile platform differences are permanent. Android and iOS will never be the same. Learning to navigate both is the core skill of cross-platform development.`,
    mastery_questions: [
      `Schedule a push notification for 60 seconds from now. Wait for it. Paste a screenshot of it appearing on your device. Explain what happens differently on iOS vs Android when the notification arrives while the app is open.`,
      `Implement the daily reset: at midnight, the water count goes to zero. Show the next reset time on screen. Paste the logic you used. How do you handle the case where the app is in the background when midnight happens?`,
      `What is the difference between a local notification and a push notification? Explain when you would use each in a production app.`,
      `Request notification permissions using Expo Notifications. Handle the case where the user denies permission — your app should not break. Paste your permission request code and your fallback UI.`,
      `Pause and think: your notification is scheduled at 9am every day. What happens if the user is in a different timezone — they travel from Gambia to London? How does your current implementation handle this? How should it?`,
    ],
  },
  3: {
    context: `A streak is a psychological contract with yourself. Snapchat built an empire on it. GitHub's green squares are the same mechanic. Duolingo's streak obsession has been written about in academic papers. This week Hydra gets history and streaks: a log of every day's water intake, a streak counter that breaks if you miss a day, and a visual calendar showing your completion. You are also meeting AsyncStorage — React Native's built-in local persistence layer, the equivalent of localStorage in a browser. Every piece of data Hydra tracks lives on the device. No server, no account, no privacy concerns. This is local-first mobile development, and it is the right architecture for a habit tracker.`,
    mastery_questions: [
      `Open your app, drink some water, close the app completely, and reopen it. Does your count persist? Paste the AsyncStorage.setItem and getItem calls you wrote. What data format did you store?`,
      `Show the last 7 days of history on a calendar or list view. Highlight days where you hit your goal. Paste the component. Explain how you derive 'yesterday' and 'the day before yesterday' correctly across month boundaries.`,
      `Implement the streak logic: if you hit your daily goal, the streak increments. If you miss a day, it resets to 0. Paste the function. What is the edge case that trips up most engineers here?`,
      `What is MMKV and why is it faster than AsyncStorage? When would you migrate a production app from AsyncStorage to MMKV?`,
      `Pause and think: your data is stored in AsyncStorage on the device. If the user uninstalls the app, the data is gone. If they get a new phone, the data is gone. What would a 'sync to cloud' feature look like? Draw the architecture in plain English.`,
    ],
  },
  4: {
    context: `TypeScript is not optional in professional React Native development. Every large codebase — Meta's apps, Shopify's mobile codebase, Airbnb's React Native infrastructure — uses TypeScript. Without it, a prop name typo causes a runtime crash on a user's phone. With it, the typo is caught before you even save the file. This week you migrate Hydra to TypeScript: add types to props, model your data with interfaces, type your AsyncStorage operations, and eliminate every 'any'. You will also do a cleanup pass — extract repeated logic into utility functions, standardise your component structure, and prepare the codebase for features that would otherwise require major refactoring. This is the week you go from 'it works' to 'it's built properly'.`,
    mastery_questions: [
      `Define a TypeScript interface for your HydrationLog entry — the object you store in AsyncStorage. Paste it. Then type your AsyncStorage read function so TypeScript knows what it returns. What happens when you access a field that doesn't exist on the type?`,
      `Find one component that was passing props without types. Add TypeScript types to all its props. Paste before and after. Explain: what is the difference between a 'type' and an 'interface' in TypeScript?`,
      `Run tsc --noEmit on your project. Paste the output. If there are errors, fix them all. If there are none, deliberately introduce a type error and verify TypeScript catches it.`,
      `Extract your streak calculation logic into a utility function in /utils/streak.ts. Write a TypeScript function signature with proper types. Explain why pure utility functions are easier to test than logic inside components.`,
      `Pause and think: what is 'type inference'? Give an example of TypeScript inferring a type without you explicitly annotating it. When should you let TypeScript infer, and when should you annotate explicitly?`,
    ],
  },
  5: {
    context: `Forms on mobile are where good apps go to die. The keyboard covers the input. Auto-correct changes 'password' to 'Password'. The user's thumb can't reach the submit button. The field doesn't scroll up when the keyboard appears. The validation message appears where the keyboard is covering it. Getting forms right on mobile is a craft. This week you build a settings screen for Hydra: daily goal, reminder time, name — all form fields, all validated, all persisting to AsyncStorage. You are meeting KeyboardAvoidingView, the TextInput component's full API, form validation patterns, and the difference in keyboard behaviour between iOS and Android. After this week, every form you build will feel native.`,
    mastery_questions: [
      `Add a settings form with three inputs: daily goal (number), name (text), and reminder time (time picker). Ensure the keyboard doesn't cover any field on either iOS or Android. Paste your KeyboardAvoidingView setup and explain why the behaviour prop differs between platforms.`,
      `Add validation to your daily goal field: it must be a number between 500ml and 5000ml. Show the error inline, below the field, in red. Paste your validation logic. When does validation run — on every keystroke, on blur, or on submit?`,
      `The number keyboard on iOS has no 'Done' button. How do you dismiss it? Paste the solution you used.`,
      `Save form values to AsyncStorage on submit and reload them when the settings screen opens. Paste the read/write logic. What happens if a user has an old version of your data schema and a new field doesn't exist?`,
      `Pause and think: what is the difference between 'controlled' and 'uncontrolled' inputs in React Native? Which approach are you using? What would break if you switched?`,
    ],
  },
  6: {
    context: `A mobile app that doesn't animate is a website. The bounce when you pull to refresh, the slide when you navigate between screens, the satisfying shake when you enter a wrong password — these are not decorations, they are communication. They tell the user that something happened, that their action was registered, that the interface is responsive and alive. Airbnb's mobile team once said that animation is the difference between a product that feels 'finished' and one that feels 'almost done'. This week you add animations to Hydra using the Animated API and Reanimated 3. The water fill animation when you log a drink. A spring bounce on the daily goal completion. A gesture-based swipe to delete a log entry. After this week, your app will feel like an app.`,
    mastery_questions: [
      `Add a water fill animation: when the user logs a drink, a blue fill bar smoothly grows to the new percentage. Paste your Animated.timing call. Explain the difference between useNativeDriver: true and false — and why you must use native driver for this animation.`,
      `Implement a spring animation that fires when the user hits their daily goal. Paste the Animated.spring config. Explain the tension and friction parameters and what happens when you change them.`,
      `Add a swipe-to-delete gesture on your history list items using React Native Gesture Handler. Paste your PanGestureHandler implementation. Explain what 'worklet' means in Reanimated 3.`,
      `Test your animations on a mid-range Android device (or an Android emulator). Do they feel as smooth as on iOS? What is the 'JS thread frame drop' problem and how does Reanimated solve it?`,
      `Pause and think: animations at 60fps means each frame has 16.67ms to render. List three things that would cause your animation to drop frames, and how you would diagnose each one.`,
    ],
  },
  7: {
    context: `Dark mode is not optional anymore. iOS 13 shipped it in 2019. Android 10 shipped it in 2019. Every major app supports it. Users in dark environments — night-time, cinemas, bedrooms — actively switch to it, and apps that do not support it lose users who notice. But dark mode is just the beginning: a good design system means your app can be themed without changing individual components. This week you build Hydra's design system: a theme file with colours, typography, and spacing, a custom useTheme hook, and full dark/light mode support that follows the system preference automatically. After this week, you could ship a completely different colour theme to a client by changing one file.`,
    mastery_questions: [
      `Toggle your phone between light and dark mode. Does Hydra follow it automatically? Paste your useColorScheme() implementation. Explain what happens if you hard-code a colour instead of reading it from your theme.`,
      `Build a ThemeProvider using React Context. Your theme should include: background, surface, text primary, text secondary, accent, error. Paste the theme object. Now change your entire app's accent colour by changing one line.`,
      `Extract your typography into the theme: H1, H2, body, caption — all with size, line height, and font weight. Paste the typography scale. Explain why a consistent type scale makes design faster.`,
      `What is the difference between a 'semantic' colour token (e.g., 'surface') and a raw colour value (e.g., '#1C1C1E')? Why are semantic tokens better in a theme system?`,
      `Pause and think: your app has a custom accent colour (blue). A new client wants a green version of the same app. With your current theme system, what would you need to change? How would you handle two themes that share the same components but different brand colours?`,
    ],
  },
  8: {
    context: `Every mobile app needs to remember things. Your user's session, their preferences, their offline data. React Native gives you several storage options, each with very different trade-offs. AsyncStorage is simple but synchronous at scale. MMKV (used by WhatsApp) is C++ backed and blazing fast. SQLite is a full relational database on the device. WatermelonDB is a reactive database built for React Native at scale. This week you graduate from AsyncStorage to a more structured approach: you model Hydra's data properly with WatermelonDB — a water log table, a settings table — and you write your first database-backed queries. This is the architecture that apps with 100k+ users actually use.`,
    mastery_questions: [
      `Define a WatermelonDB (or SQLite) schema for your water logs: id, date, amount, unit. Paste the schema definition. Explain why a relational schema is better for this data than a single JSON blob in AsyncStorage.`,
      `Write a query that fetches all logs for the current week, sorted by date descending. Paste the query. How long does it take compared to your old AsyncStorage approach? Measure it with console.time.`,
      `Implement a migration: you want to add a 'note' column to your log table. Write the migration file. Explain why database migrations are needed and what happens to existing records when you add a new optional column.`,
      `What is the difference between SQLite (on-device) and a remote database? In which scenarios would you use each? Give a concrete example for a social app.`,
      `Pause and think: your database is on the device. A user signs in on a new phone. How would you sync their data from the old device? Sketch the architecture for a cloud sync feature.`,
    ],
  },
  9: {
    context: `Instagram is, at its core, a camera app. TikTok is a camera app. Snapchat is a camera app. The camera is the input device that makes mobile uniquely powerful — desktop can never compete. When you give users a camera, you unlock an entirely new class of app: apps that react to the physical world. This week you add camera access to Hydra: users can take a photo of their drink and log it. You meet Expo Camera, permissions, and image manipulation. You also implement a basic image picker from the photo library. After this week, you will understand the full lifecycle of a photo in a mobile app — from shutter click to display to upload to storage.`,
    mastery_questions: [
      `Request camera permission at the right moment — not at app launch, but when the user first tries to use the camera feature. Paste your permission request code. What should you show if the user denies it?`,
      `Take a photo in your app and display it in a preview. Paste the useCameraRef and takePictureAsync code. What is the file URI that Expo gives you? Is it permanent or temporary?`,
      `Compress the photo before uploading it (hint: Expo ImageManipulator). Compare the file size before and after. Paste the compression call. Why does compressing before upload matter for a mobile app?`,
      `Add an image picker so users can choose a photo from their library instead of taking a new one. Paste the ImagePicker.launchImageLibraryAsync call. Handle the case where the user cancels.`,
      `Pause and think: you are about to upload a photo taken on a 12-megapixel iPhone. The file is 8MB. Your server is in London. The user is on 3G in rural Gambia. What is the correct compression strategy and how would you handle the upload failure gracefully?`,
    ],
  },
  10: {
    context: `Uber's business model is a map. Airbnb's discovery flow is a map. Every food delivery app, every ride-sharing app, every logistics platform runs on location data. The combination of GPS + maps is one of the most powerful features mobile has that desktop doesn't. This week you add location tracking to Hydra — not for surveillance, but because water consumption often correlates with physical activity, and you want to show users where they were active today. You meet Expo Location, MapView from react-native-maps, and geofencing — the ability to trigger events when a user enters or leaves a geographic boundary. You also wrestle with the hardest part of mobile location: battery life.`,
    mastery_questions: [
      `Request foreground location permission and get the user's current coordinates. Display them on a MapView marker. Paste your location request code and the MapView setup. Explain the difference between foreground and background location permissions.`,
      `Add a geofence: when the user enters a radius of 100m around their home location (set manually in settings), send a local notification reminding them to drink water. Paste the geofencing implementation.`,
      `What is the difference between GPS, Wi-Fi, and cell-tower location? Which is most accurate? Which uses the most battery? How does iOS/Android decide which to use?`,
      `Add a map showing the user's movement during a specific day, plotted as a polyline. Paste the coordinates array and MapView.Polyline usage.`,
      `Pause and think: background location tracking significantly reduces battery life. List three strategies to minimise battery impact while still getting useful location data.`,
    ],
  },
  11: {
    context: `Push notifications are the most powerful engagement tool a mobile app has — and the most abused. Apps that send irrelevant push notifications lose users at 2x the rate of apps that don't. Getting it right is a product decision as much as an engineering one: what to send, when, to whom, and how to personalise it. The engineering underneath is more complex than most developers expect: Apple Push Notification Service (APNs) and Firebase Cloud Messaging (FCM) are separate systems with different authentication models, delivery guarantees, and payload formats. This week you implement real push notifications using Expo Notifications — not local notifications, but server-driven remote notifications that you trigger from your backend.`,
    mastery_questions: [
      `Get the Expo push token for your device and send yourself a push notification from your backend (or using Expo's push tool). Paste the token, the API call, and a screenshot of the notification on your device.`,
      `Send a notification with a custom action button: 'Log a drink'. When tapped, it should open the app directly to the logging screen. Paste your notification response handler. Explain how deep linking connects the notification to a specific screen.`,
      `What happens to a push notification when the device is offline? Does APNs hold it? For how long? Look up APNs' priority and expiration settings and explain them.`,
      `What is the difference between an Expo push token and a raw APNs/FCM token? When would you use each? What is the advantage of Expo's push service for a small team?`,
      `Pause and think: you want to send a daily water reminder to 50,000 users at their individually set reminder times, in their correct local timezone. Describe the architecture.`,
    ],
  },
  12: {
    context: `JavaScript cannot do everything. Accessing the device's NFC chip, reading raw sensor data from the accelerometer at 200Hz, controlling Bluetooth Low Energy devices, integrating with Apple HealthKit — these require native code. React Native bridges the JavaScript world and the native world, but sometimes you need to write the bridge yourself. Native modules are Swift/Objective-C code (iOS) or Kotlin/Java code (Android) that you expose to JavaScript. This week you build a simple native module: one that reads the current battery level directly from the OS. It sounds small. The skill is large — understanding the bridge, writing in two native languages, and testing cross-platform. This is what separates React Native engineers from React developers.`,
    mastery_questions: [
      `Write a native module that exposes a getBatteryLevel() function to JavaScript. Implement it in Kotlin (Android) and Swift (iOS). Call it from your JS code and display the result. Paste both native implementations.`,
      `What is the 'New Architecture' in React Native? Explain the difference between the old Bridge and the new JSI (JavaScript Interface). Why is JSI faster?`,
      `When should you build your own native module vs using an existing Expo module vs using a community library? Write a decision framework with three criteria.`,
      `Add error handling to your native module: if the battery API fails, throw a typed error that JavaScript can catch. Paste the error handling code on both the native and JS sides.`,
      `Pause and think: your app now has custom native code. What does this mean for your Expo Go workflow? What is an 'Expo development build' and why do you need one when you add native modules?`,
    ],
  },
  13: {
    context: `A mobile app with no network is a calculator. The interesting apps are the ones that talk to the world — fetching data, syncing state, sending messages. But mobile networking has unique challenges: the connection drops when you go underground, the user switches from LTE to Wi-Fi mid-request, the background app is killed by the OS before the upload completes. Offline mode is not optional for a serious app. This week you build robust networking into Hydra: a custom API client with retry logic, offline detection, optimistic UI updates, and a background sync mechanism that queues failed requests and retries them when connectivity returns. Real users are not always online.`,
    mastery_questions: [
      `Implement a custom useFetch hook that handles loading, error, and data states, plus automatic retry on network failure (up to 3 times with exponential backoff). Paste the hook. Explain what 'exponential backoff' means and why it matters.`,
      `Add offline detection using NetInfo. When the user goes offline, show a banner. When they reconnect, retry any queued requests. Paste your NetInfo listener and your request queue implementation.`,
      `Implement optimistic updates: when the user logs a drink, update the UI immediately without waiting for the server to confirm. If the server fails, roll back. Paste the logic. Explain the UX trade-off.`,
      `What is the difference between a React Query / TanStack Query approach and a hand-rolled API client? In a production app, what would you choose and why?`,
      `Pause and think: your app needs to sync 500 water logs from the device to the server after a week of offline use. What is the correct upload strategy — send all 500 at once, in batches, one at a time? How do you handle partial failures?`,
    ],
  },
  14: {
    context: `Mobile authentication is different from web authentication in ways that trip up web developers every time. There is no cookie store. There is no localStorage. JWTs need to be stored in the Secure Enclave on iOS and the KeyStore on Android — not in AsyncStorage, which any malicious app can read. Then there is biometrics: Face ID, Touch ID, fingerprint — the user's phone knows who they are, and your app should leverage that instead of requiring a password every time. This week you implement complete mobile authentication: email/password sign-in, token storage in SecureStore, biometric re-authentication for sensitive actions, and session refresh. After this week, you'll understand why LinkedIn and your bank app work the way they do.`,
    mastery_questions: [
      `Store your JWT in Expo SecureStore instead of AsyncStorage. Paste the SecureStore.setItemAsync call. Explain why SecureStore is safer than AsyncStorage — what is it encrypted with?`,
      `Implement Face ID / Touch ID authentication using LocalAuthentication. Gate a 'view payment details' action behind biometrics. Paste the authenticateAsync call and handle the case where biometrics fail.`,
      `Implement JWT refresh: your access token expires in 15 minutes, your refresh token in 30 days. When a 401 response comes back, automatically refresh and retry the original request. Paste your Axios interceptor or equivalent.`,
      `What is the difference between OAuth2 and a custom JWT flow? When would you use Sign in with Apple vs your own authentication system?`,
      `Pause and think: your refresh token is stored in SecureStore. The user's device is stolen. The thief bypasses the screen lock. What prevents them from accessing your app's API using the stolen refresh token? What would you add?`,
    ],
  },
  15: {
    context: `Your app is not always in the foreground. Users switch apps, lock their phone, and trust that your app will still do its job in the background — syncing new messages, downloading the next podcast episode, sending the location update. Background tasks are the invisible infrastructure of every great mobile app. iOS and Android both aggressively kill background processes to save battery, so background execution is a privilege, not a given. This week you implement background fetch for Hydra (syncing the daily log periodically) and background notifications (a gentle nudge if the user hasn't logged by mid-afternoon). You will also understand what tasks iOS and Android actually allow in the background and why.`,
    mastery_questions: [
      `Register a background fetch task using Expo TaskManager and BackgroundFetch. Have it run every 15 minutes (or the minimum interval the OS allows) and log to the console. Paste your task registration. What is the minimum background fetch interval on iOS?`,
      `Schedule a conditional local notification: at 3pm, if the user hasn't hit 50% of their daily goal, send a nudge. Paste the scheduling logic. How do you check the user's progress from inside a background task?`,
      `What is the difference between 'background fetch', 'background processing', and 'background location' on iOS? Which requires explicit user permission?`,
      `What happens to your background tasks when a user force-quits the app on iOS? How is Android different in this respect?`,
      `Pause and think: your background task checks a remote API for new data. It fires every 15 minutes for 50,000 users. That is potentially 200,000 API calls per hour. How would you architect the backend to handle this load without exploding your server costs?`,
    ],
  },
  16: {
    context: `In a traditional startup, you learn your app is broken when a user tweets about it. In a data-driven startup, you learn when your error rate dashboard spikes at 3am and you are already fixing it before users notice. Analytics tells you what users actually do — not what they say they do. Crash reporting tells you what broke and exactly where. Observability on mobile is harder than on the web because you cannot open DevTools on a user's device. Everything needs to be captured and transmitted when it can be. This week you add Sentry for crash reporting, Mixpanel (or PostHog) for event analytics, and a custom performance monitoring setup that tracks screen load times. After this week, your Hydra dashboard will tell you more about user behaviour than most startup founders know.`,
    mastery_questions: [
      `Trigger a crash in your app (throw new Error('test crash')). Find it in Sentry. Paste the stack trace. What additional context does Sentry give you — device model, OS version, user ID?`,
      `Track three key events with Mixpanel or PostHog: 'drink_logged', 'goal_reached', 'settings_changed'. Include properties: amount, daily_goal, streak. Paste the track() calls. Explain what you would learn from these events over 30 days.`,
      `Add screen view tracking: log an event whenever the user navigates to a new screen. Paste the navigation listener you used. In your analytics dashboard, which screen do users visit most? Which do they leave fastest?`,
      `What is the difference between a crash and a handled error in Sentry? Give an example of each. Why should you use Sentry.captureException for handled errors instead of just console.log?`,
      `Pause and think: 40% of your users have not opened the app in 7 days. Your analytics show they dropped off after the 'history' screen. What hypothesis does this suggest about your UX? How would you test it with an A/B experiment?`,
    ],
  },
  17: {
    context: `A slow app is a deleted app. Users on mobile are ruthless — if your app stutters, they close it. If your list scrolls at 45fps instead of 60fps, they notice, even if they could not tell you why. Performance on React Native is a different problem from performance on the web. The JavaScript thread is a bottleneck. FlatList rendering, image loading, navigation transitions — all need careful optimisation. This week you profile Hydra with the React Native Performance Monitor and Flipper, identify your three biggest performance problems, and fix them. You will also implement virtualisation (FlatList instead of ScrollView for long lists) and image caching. Your app will leave this week running noticeably faster.`,
    mastery_questions: [
      `Open the React Native Performance Monitor (shake device > Performance). Scroll through your history list. Paste the JS FPS and UI FPS readings. If either drops below 55fps, identify why.`,
      `Convert any ScrollView rendering a list of more than 20 items to a FlatList with proper keyExtractor and getItemLayout. Measure FPS before and after. Paste the FlatList config.`,
      `Add image caching to your water log photos using expo-image or react-native-fast-image. Explain why the default Image component re-downloads images every time and what caching does differently.`,
      `Use the why-did-you-render library (or React DevTools Profiler) to find one component that re-renders when it shouldn't. Add React.memo or useMemo to fix it. Paste the before and after.`,
      `Pause and think: your onScroll handler calculates something on every scroll event. This fires 60 times per second. What is a 'worklet' in Reanimated and how does it keep heavy scroll calculations off the JS thread?`,
    ],
  },
  18: {
    context: `In most markets, 15-20% of users have some form of disability — visual impairment, motor difficulty, hearing loss, cognitive differences. In many emerging markets including across Africa, the proportion is higher due to lower rates of corrective lens adoption and ageing device hardware that affects interaction speed. Accessibility is not charity — it is product quality, and in many countries it is also the law. VoiceOver (iOS) and TalkBack (Android) are screen readers used daily by millions of people. An app that works with a screen reader works better for everyone. This week you make Hydra fully accessible: proper labels, focus management, colour contrast, touch target sizes, and full screen reader support.`,
    mastery_questions: [
      `Enable VoiceOver (iOS) or TalkBack (Android) on your device and navigate through Hydra without looking at the screen — only using the screen reader. What breaks? What is confusing? Paste a list of every accessibility issue you found.`,
      `Add accessibilityLabel and accessibilityHint to every interactive element that doesn't have visible text (icon buttons, images, graphs). Paste the changes you made to your most complex screen.`,
      `Audit your colour contrast using the WebAIM Contrast Checker. Paste the contrast ratio for your primary text colour on its background. If it fails AA (4.5:1 for normal text), fix it.`,
      `Ensure all touchable elements have a minimum touch target of 44x44 points. Find one that was too small and fix it. Paste the before and after styles.`,
      `Pause and think: your water progress bar uses colour (blue fill) to communicate progress. A user with colour blindness cannot distinguish blue from grey. How would you communicate progress without relying solely on colour?`,
    ],
  },
  19: {
    context: `The Gambia has two official languages. Nigeria has over 500. India has 22 official languages and hundreds more spoken daily. If your app only works in English, you have excluded most of the planet. Internationalisation (i18n) is the engineering practice of making your app work in multiple languages, and localisation (l10n) is the process of translating it for specific markets. But i18n is more than translation: dates format differently (DD/MM/YYYY vs MM/DD/YYYY), currencies have different symbols and decimal separators, text expands when translated (German text is ~30% longer than English), and some languages read right-to-left. This week you make Hydra ready for global distribution using i18next.`,
    mastery_questions: [
      `Add i18next to Hydra and translate the three main screens into two languages (English + one African language — Wolof, Mandinka, Hausa, or your choice). Paste the translation JSON for one screen. How do you handle a key that is missing in the second language?`,
      `Format the water amounts for two different locales: 500ml in English, 500ml in a locale that uses commas as decimal separators. Use Intl.NumberFormat. Paste the code and both formatted outputs.`,
      `Display dates in locale-appropriate formats: today's date as 'Monday, 25 May 2026' in English and the equivalent in your second language. Use Intl.DateTimeFormat. Paste the output.`,
      `What is RTL layout support? Does your current layout break in an Arabic or Hebrew locale? Test it by switching your device to Arabic. What needs to change?`,
      `Pause and think: your translation strings are all in English. A volunteer translator sends you a Wolof translation. How do you integrate it without breaking the app? What is a 'plural form' problem in translation?`,
    ],
  },
  20: {
    context: `Mobile testing is uniquely difficult: you have two operating systems, dozens of device sizes, dozens of OS versions, and every combination of hardware. You cannot test all of them. What you can do is build a testing strategy that catches the most bugs with the least effort. Unit tests for business logic (streak calculation, data formatting), component tests for UI behaviour, and end-to-end tests on real devices using Detox or Maestro. This week you write tests at all three levels for Hydra and experience what a confident test suite feels like: you make a change, run the suite, and know immediately if you broke something. That confidence is worth more than any individual feature.`,
    mastery_questions: [
      `Write unit tests for your streak calculation function: test cases for first day (streak = 1), second consecutive day (streak = 2), missing a day (streak = 0), hitting goal exactly on the boundary. Paste all test cases and the function they test.`,
      `Write a React Native Testing Library test for your WaterLogCard component: render it with mock props, simulate a press, verify the correct callback was called. Paste the test.`,
      `Write a Maestro or Detox end-to-end test that: launches the app, taps the 'Add Drink' button, selects 250ml, confirms the log, and verifies the daily total updated. Paste the test script.`,
      `Run your full test suite and paste the output. What percentage of your functions are tested? Use Istanbul or V8 coverage to measure. What is the most important untested path in your app?`,
      `Pause and think: you want to run your Detox tests on iOS and Android on every pull request in CI. What infrastructure do you need? Look up 'Expo EAS Build' and 'GitHub Actions with simulators'. Describe the setup.`,
    ],
  },
  21: {
    context: `Getting your app onto the App Store and Google Play is a rite of passage. It is also a gauntlet: provisioning profiles, signing certificates, App Store Connect, Google Play Console, privacy policy requirements, screenshots, App Review, rejection for vague guidelines violations. Expo EAS (Expo Application Services) is the modern way to navigate this gauntlet — it builds your app in the cloud, signs it correctly, and submits it to both stores automatically. This week you build and submit Hydra to TestFlight (iOS) and the Google Play internal testing track. You will fill out metadata, write your first App Store description, create screenshots, and understand the review process. Many engineers have never done this. After this week, you will have shipped to both stores.`,
    mastery_questions: [
      `Run eas build --platform ios and paste the build link from Expo. What does EAS do that you could not do with npx react-native run-ios?`,
      `Submit to TestFlight using eas submit --platform ios. Invite yourself as a tester. Paste a screenshot of the app appearing in your TestFlight app. What did Apple check automatically before making it available to testers?`,
      `Write your App Store listing description for Hydra. It must be compelling in 170 characters (the short description) and under 4000 characters for the full description. Paste both. Remember: this is marketing copy, not a technical README.`,
      `What is the difference between a development build, a TestFlight build, and a production App Store build? Explain the code signing difference between them.`,
      `Pause and think: Apple rejected your app because it 'does not provide enough utility'. This is App Review Guideline 4.2. Look it up. What would you add to Hydra to avoid this rejection?`,
    ],
  },
  22: {
    context: `You just shipped version 1.0. A bug slipped through — your streak logic breaks if the user's timezone is GMT+2. Traditionally, fixing this means releasing a new version, waiting for App Store approval (up to 3 days), and hoping users update. Over-the-air (OTA) updates change this: you push a JavaScript bundle update and every user gets it within minutes, no App Store review needed. Expo Updates (powered by EAS Update) is how this works. This week you set up OTA updates for Hydra, implement semantic versioning, and understand which changes can be pushed as OTA (JS changes) and which require a new binary (native module changes). You also implement an update prompt — a gentle notification to users that a new version is available.`,
    mastery_questions: [
      `Push an OTA update using eas update --branch production. Open your app without rebuilding. The update should apply on the next launch. Paste the eas update output and explain what 'channel' and 'branch' mean in EAS Update.`,
      `What types of changes can be delivered as OTA updates? What types require a new app store submission? Give two examples of each.`,
      `Implement an update prompt: when a new OTA update is available, show a banner that says 'A new version is available — tap to update'. Use the expo-updates API. Paste your implementation.`,
      `Implement semantic versioning for Hydra: what do major, minor, and patch versions mean for a mobile app? When do you increment each? Paste your app.json version and buildNumber.`,
      `Pause and think: an OTA update with a bug crashes the app on launch for 10% of your users. They can't open the app to get the fix. How does EAS Update's 'rollback' feature work? What is a 'rollout percentage' and how would you use it to safely deploy to 100,000 users?`,
    ],
  },
  23: {
    context: `You have built a great app. Nobody knows it exists. The App Store has over 2 million apps. Getting found is its own engineering and marketing discipline called App Store Optimisation (ASO). The algorithm that ranks apps in App Store search considers your title, subtitle, keyword field, download velocity, ratings, and review sentiment. A 4.8-star app with 500 reviews outranks a 5-star app with 5 reviews. This week you optimise Hydra's App Store presence: keyword research, metadata optimisation, asking for reviews at the right moment (using StoreReview API), and A/B testing your screenshots. You will also set up a referral mechanism — the single most cost-effective user acquisition channel for most apps.`,
    mastery_questions: [
      `Research five keyword phrases users might search when looking for a water tracking app. Explain your research process (hint: look at competitor apps, use tools like AppFollow or Sensor Tower). Paste your keywords and explain why you chose each.`,
      `Trigger the native StoreReview.requestReview() dialog at the right moment — after the user completes a 3-day streak for the first time. Paste the implementation. Explain why Apple limits how often this dialog can appear.`,
      `What is 'keyword stuffing' in App Store metadata and why does Apple penalise it? Write a compliant subtitle and keyword field for Hydra.`,
      `Create two different icon variants and two different screenshot sets. Describe how you would A/B test them using App Store Connect's Product Page Optimisation feature. What metric would determine the winner?`,
      `Pause and think: Hydra is free. How would you monetise it? List three monetisation strategies and explain the engineering implications of each (in-app purchases, premium subscription, one-time unlock). Which would you choose and why?`,
    ],
  },
  24: {
    context: `This is the week Hydra becomes a real app. You have built habit tracking, streaks, local storage, push notifications, camera, maps, authentication, analytics, and crash reporting. Now you ship it. Real users. Both stores. One URL to share. You are going to put it in front of ten people who have never heard of it, watch them use it, and learn more in one hour of observation than in one month of building. The apps that survive are not the ones built by the best engineers. They are the ones built by engineers who listened. This capstone is not about adding features. It is about getting real. Share it, get feedback, fix the one thing that matters most, and ship the fix. That loop — build, measure, learn — is the only loop that matters.`,
    mastery_questions: [
      `Share Hydra's TestFlight link (iOS) and Google Play internal testing link (Android) with five real users. Paste both links. Watch at least one person use the app without coaching them. Write down every confusion or hesitation you observed.`,
      `Check Sentry after 24 hours of real user traffic. Paste any crashes you find. Fix the most impactful one and push an OTA update. Paste the eas update command and confirm the fix is live.`,
      `Check your analytics dashboard: what is your Day 1 retention? (Users who open the app the day after installing it.) What is the average number of drinks logged per user per day? What do these numbers tell you?`,
      `The App Review team rejected your submission. Paste the rejection reason (make one up based on a real guideline if you haven't submitted yet) and explain exactly how you would resolve it.`,
      `Write a 400-word reflection: what was the hardest problem you solved building Hydra? What would you build differently knowing what you know now? What is the one feature, if it worked perfectly, that would make users recommend the app to a friend?`,
    ],
  },
};

applyUpdates("full-stack-web.json", FSW);
applyUpdates("mobile-engineering.json", MOBILE);
