import { rewriteWeek } from "../rewrite-week";

// full-stack-web W1-W5

rewriteWeek("full-stack-web", 1, {
  context: `A website is a set of files. When you type a URL in a browser, the browser makes an HTTP request to a server, the server sends back files, and the browser interprets those files and renders them on screen. Understanding this at the file level — without build tools, frameworks, or abstractions — is where every web developer's understanding should start. You can only choose the right tools when you understand what problem they solve.

HTML describes the structure and content of a page: what the heading says, where the paragraphs are, which text is a link, what the images are. CSS describes how it looks: colours, spacing, fonts, layout. This separation of concerns is not just convention — it is what allows a graphic designer to change the visual style of a page without touching the content, and a content editor to add new text without touching the layout code.

Bean Forge v0.1 is a one-page website for a fictional coffee shop. It has a header, a menu section, an about section, and a footer. It looks good on mobile and on desktop. And it is built with nothing but HTML, CSS, and a text editor. No npm, no React, no webpack. The point is not that this is how professionals work — it is that by the end of this week, you understand exactly what happens when a browser loads a page, because you wrote every byte of it.

CSS layout has two modern systems worth understanding: flexbox and grid. Flexbox distributes items along one axis (a row or column of navigation links, a row of feature cards). Grid distributes items on two axes simultaneously (a page layout with header, sidebar, main content, and footer). They are complementary, not competing — most pages use both. Mobile-first design means writing CSS for small screens first, then adding media queries for larger screens. This is the correct direction: most web traffic is now mobile, and it is easier to scale up a simple layout than to scale down a complex one.

Deploying to Netlify takes 5 minutes for a static HTML site. Create a repo, push the files, connect to Netlify, and you have a live public URL with HTTPS. This week ends with a URL you can share.`,

  pre_flight: `Install VS Code and the Live Server extension (for local development). Create a GitHub account if you do not have one. Create a Netlify account. Know the basic HTML tags: html, head, body, header, nav, main, section, article, footer, h1-h6, p, a, img, ul, li, div, span. Understand what a CSS rule is: selector {property: value;}. Know what display: flex means: elements inside a flex container can be laid out along a row or column.`,

  mastery_questions: [
    `You add a link to your navigation: <a href="/menu">Menu</a>. When the user clicks it, the browser navigates to a new page and the whole page refreshes. What is happening at the HTTP level? The browser sends a new GET request to the server for /menu. The server responds with the HTML for that page. The browser discards the current page, parses the new HTML, fetches the associated CSS and image files referenced in it, and renders the new page. Every link click is a complete HTTP round trip. This is fundamental web behaviour — understanding it is what lets you later understand why React Router and single-page applications exist (to avoid full page reloads by handling navigation in JavaScript).`,

    `Your CSS rule .menu-item { color: red; } is supposed to make menu item text red. It does not work. Walk through how you debug this. Open browser DevTools (F12). Inspect the element. In the Styles panel, check whether the rule appears. If the rule appears but is struck through, it is being overridden by a more specific rule. If the rule does not appear, the selector is not matching the element — check the class name for typos. If the rule appears and is not struck through but the element is not red, check whether color is a valid property for this element type (some elements like replaced elements behave differently). DevTools shows you exactly which rules apply and which are overridden.`,

    `You want your navigation links to be on one line horizontally. You set display: flex on the nav element. The links are now horizontal but they are crammed together. How do you add space between them? Several options: (1) Add gap: 1rem to the nav's CSS — gap adds space between flex items. (2) Add margin-right: 1rem to each li element except the last. (3) Use justify-content: space-between on the flex container to push items to the edges. The cleanest approach for navigation is usually gap on the container. margin is still useful for asymmetric spacing (more space on one side than the other).`,

    `Your page looks fine on your desktop but the text and menu items are tiny on mobile — they do not fill the screen. What is happening? You have not set the viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">. Without this tag, mobile browsers render the page at a simulated desktop width (typically 980px) and then scale it down to fit the screen. The viewport meta tag tells the browser to render at the actual device width. After adding this, confirm your layout does not break: text should be readable without zooming, buttons should be tappable without needing to zoom in.`,

    `You deploy your site to Netlify. The images do not load — you see broken image icons. The images load perfectly on local. What is the likely cause? The image file paths in your HTML are different from the actual file paths on the server. Common causes: (1) Case sensitivity — local macOS/Windows filesystems are often case-insensitive, but Netlify's Linux servers are case-sensitive. hero.jpg and Hero.jpg are different files on Linux. (2) Relative paths that work from your local folder structure do not work the same way after deployment if the folder structure changes. Fix: check the network tab in DevTools on the live site to see the actual failed request URL and compare it to where the file actually is.`,
  ],

  common_mistakes: [
    `Using pixels for font sizes and layout dimensions instead of relative units. px is an absolute unit. If a user increases their browser font size for accessibility, pixel-based fonts do not scale. Use rem (relative to root font size) for text and em or rem for spacing. px is acceptable for borders, shadows, and specific design elements that should not scale.`,

    `Not giving images an alt attribute. The alt attribute provides a text description for screen readers and is displayed when the image fails to load. Every meaningful image needs an alt attribute. Decorative images (spacers, backgrounds) should have alt="" (empty alt) to signal to screen readers that they can be ignored.`,

    `Putting style attributes on HTML elements instead of CSS classes. <p style="color: red; font-size: 18px;"> is hard to maintain — if you want to change all red paragraphs, you need to find every element with that style. Using a class .warning { color: red; font-size: 18px; } lets you change all warning paragraphs in one place.`,

    `Nesting div elements infinitely without semantic HTML. Every structural section of a page has a semantic HTML element: header, main, nav, article, section, footer, aside. Use them. They communicate structure to search engines and screen readers, and make your code more readable.`,

    `Committing large image files to git. Git is a version control system for code. High-resolution photos are binary files that should not go in git — they bloat the repository. Compress and resize images before adding to the project. A hero image should be under 200KB after compression.`,
  ],

  debug_help: `The most confusing CSS problem for beginners is margin collapse: two vertically adjacent elements both have a top/bottom margin, but instead of adding together, only the larger one applies. If your h2 has margin-bottom: 20px and the paragraph below has margin-top: 15px, the resulting gap is 20px, not 35px. This only happens for block-level vertical margins, not horizontal margins, and not inside flex or grid containers. When unexpected gaps appear, check for margin collapse by adding a border or background to the parent element to see the actual boundary.`,

  ai_assist: `Use Claude to help you write the CSS for one specific layout challenge — for example, centering the logo in the header while keeping navigation links on the right. Describe what you want in plain English and ask it to explain the CSS approach. Read the explanation before copying the code. The goal is to understand why the solution works, not just to have code that works. Run the code, then try to reproduce the same approach for a different element without looking at Claude's solution.`,

  stretch: [
    `Add a smooth-scroll behavior to the page: clicking a navigation link scrolls to the corresponding section instead of jumping. Use CSS: html { scroll-behavior: smooth; } and anchor links that target section IDs. Test that it works on mobile.`,
    `Run your page through Google Lighthouse (available in Chrome DevTools). Fix every accessibility issue it identifies: missing alt text, insufficient color contrast, missing form labels. Document what you fixed and why each fix matters.`,
    `Build a second page (/menu) with a full menu layout using CSS Grid. The grid should have 3 columns on desktop and 1 column on mobile. Each item shows the name, description, and price. Link to it from the navigation.`,
  ],
});

rewriteWeek("full-stack-web", 2, {
  context: `HTML and CSS give you structure and style. JavaScript gives the page behavior — it responds to what the user does. When a user clicks a button, types in a search box, or toggles dark mode, JavaScript is what makes something happen without a full page reload. This week you add interactivity to Bean Forge: a daily special that changes based on the day, menu filters that show/hide items, and dark mode that remembers the user's preference across visits.

The Document Object Model (DOM) is JavaScript's interface to the page. Every HTML element — every div, paragraph, button, and image — is a node in the DOM tree. JavaScript can find any element (document.querySelector('.menu-item')), change its content (element.textContent = 'New text'), change its style (element.classList.add('hidden')), and listen for user actions (element.addEventListener('click', handler)). This is how dynamic behavior is created without sending new requests to a server.

Events are signals that user actions or browser state changes generate. A click event fires when the user clicks an element. An input event fires when the user types. A DOMContentLoaded event fires when the HTML has been parsed and the DOM is ready. Event listeners attach functions to these signals. The function receives an event object with details about what happened — which element was clicked, what key was pressed, the current value of an input field.

localStorage is a browser-provided key-value store that persists data between page visits. Unlike cookies, localStorage is never sent to the server and has no expiration date (until the user clears browser storage or you delete it explicitly). For user preferences that should persist — dark mode, language selection, form draft content — localStorage is the right tool. The API is simple: localStorage.setItem('theme', 'dark'); and localStorage.getItem('theme').

The dark mode implementation teaches a complete pattern: check localStorage on page load and apply the saved theme, toggle the theme when the user clicks the button, and save the new preference to localStorage. Every user preference you implement in the future follows this same structure.`,

  pre_flight: `Know how to open the browser console and execute JavaScript in it. Understand what console.log() does and why it is your primary debugging tool. Know the difference between let, const, and var — use let for variables that will be reassigned, const for variables that will not. Understand what a function is: a named, reusable block of code. Know that == does type coercion (1 == '1' is true) and === does not (1 === '1' is false). Always use ===.`,

  mastery_questions: [
    `You add an event listener to a button: button.addEventListener('click', handleClick). Inside handleClick, you need to know which button was clicked (you have 5 filter buttons). How do you get that information? The event handler receives an event object as its first argument. event.target is the element that was clicked. Use event.target.dataset.category (if you have data-category="espresso" on the button) or event.target.textContent to identify which button was clicked. Alternatively, use event.currentTarget if you have attached the listener to a parent and want the element the listener is attached to, rather than the specific clicked child.`,

    `You use document.querySelectorAll('.menu-item') to get all menu items and then iterate with forEach to add a click listener to each. Three seconds later, you add a new menu item to the DOM via JavaScript. Does the new item have the click listener? No. querySelectorAll captures the matching elements at the moment it is called. Elements added after that call are not included. The fix: event delegation. Add the listener to the parent container (document.querySelector('.menu')) instead of each item. When any menu item is clicked, the click event bubbles up to the container, which checks whether event.target matches the selector you care about: if (event.target.matches('.menu-item')) { ... }. This works for dynamically added elements too.`,

    `You save the user's selected filter to localStorage: localStorage.setItem('filter', currentFilter). On page load, you read it back: const savedFilter = localStorage.getItem('filter'). What do you need to check before using savedFilter? Whether it is null. localStorage.getItem returns null when the key does not exist (first visit, or after clearing storage). Always write a guard: const savedFilter = localStorage.getItem('filter') || 'all'. Without this, your code tries to use null as a filter value and breaks on first visit.`,

    `Your dark mode toggle adds a .dark class to the <body> element. The CSS for dark mode is .dark body { background-color: #1a1a1a; }. Dark mode does not work. What is wrong? The selector is wrong. .dark body selects a body element that is inside an element with class dark. But you added .dark to body itself. The correct selector is body.dark { background-color: #1a1a1a; } — a body element that also has the dark class. This is a common selector confusion: .dark .menu-item selects .menu-item inside .dark (descendant), while .dark.menu-item selects an element that has both classes.`,

    `You want to show a different daily special based on the current day of the week. How do you get the current day in JavaScript and use it to index into a specials array? const day = new Date().getDay() returns 0 (Sunday) through 6 (Saturday). Create an array with 7 elements: const specials = ['Sunday Special', 'Monday Special', ...]. Access: const todaySpecial = specials[day]. This works but note that getDay() returns a number based on the local time of the user's device, not the server's timezone. If your specials change at midnight Central Time, users in different timezones will see the new special at different local times.`,
  ],

  common_mistakes: [
    `Placing <script src="app.js"> in the <head> instead of at the end of <body>. When the browser encounters a script tag in the head, it stops parsing HTML, downloads and executes the script, then continues. If the script runs before the DOM is built, document.querySelector() finds nothing. Place scripts at the end of <body>, or use the defer attribute: <script src="app.js" defer>. defer tells the browser to download the script in parallel but execute it after HTML parsing is complete.`,

    `Using innerHTML to insert user-provided or external data. innerHTML parses the string as HTML, which means if the data contains malicious scripts, they execute. Use textContent when inserting plain text — it treats the string as literal characters, not markup. Only use innerHTML when you control the content completely.`,

    `Forgetting to call event.preventDefault() on form submissions and link clicks that should be handled by JavaScript. Without it, a form submits and causes a page reload, or a link navigates away. Add event.preventDefault() at the start of any event handler where you are replacing the default browser behaviour.`,

    `Not considering what happens when JavaScript fails or is disabled. Screen readers, some corporate firewalls, and users with certain extensions disable JavaScript. Build the page so the core content is accessible without JavaScript, then enhance with JavaScript. This is called progressive enhancement.`,

    `Writing all JavaScript in one large script.js file without organisation. Even for small projects, organise code into functions with clear names. A function filterMenuByCategory() is readable; a 100-line block of unnamed code is not. Good organisation habits established on small projects pay off on large ones.`,
  ],

  debug_help: `The most common JavaScript error for beginners is "Cannot read properties of null (reading 'addEventListener')" — you are calling addEventListener on an element that does not exist. The querySelector returned null because the selector did not match anything, usually due to a typo in the class name or because the script ran before the DOM was ready. Debug: add console.log(document.querySelector('.your-selector')) immediately before the addEventListener call. If it logs null, the selector is wrong or the script is running too early.`,

  ai_assist: `Use Claude to help you understand a JavaScript concept that is confusing you — closures, the event loop, or how async/await works — not to write your menu filter code. Describe what you think you understand and what confuses you. JavaScript fundamentals explained through conversation are easier to retain than documentation alone. Then write the filter code yourself without assistance.`,

  stretch: [
    `Add a search filter to the menu: an <input type="text"> that filters menu items in real time as the user types, showing only items whose name or description contains the search term. Use the input event and case-insensitive string matching.`,
    `Add a cart feature to the menu: each menu item has an "Add to Cart" button. A counter in the header shows how many items are in the cart. Clicking removes items. Cart persists to localStorage across page reloads.`,
    `Add a keyboard shortcut for dark mode: pressing 'd' toggles dark mode. Use document.addEventListener('keydown', ...) and check event.key === 'd'. Make sure the shortcut does not fire when the user is typing in an input field.`,
  ],
});

rewriteWeek("full-stack-web", 3, {
  context: `A contact form that does not send email is a decoration. This week you wire Bean Forge's contact form to actually deliver messages to an inbox using Netlify Forms. When a stranger finds the coffee shop site and fills out the form, the owner gets an email. That is the feature. Building it requires understanding how forms work at the HTTP level — and understanding why the native form submission model, which predates JavaScript, still underlies most forms built today.

When a form's submit button is clicked, the browser packages up all the form field values and sends them to the URL specified in the form's action attribute using the method specified (GET or POST). For GET forms, the data is encoded in the URL query string. For POST forms, the data goes in the request body. The server receives the data and responds — typically with a redirect to a success page or with the same page plus an error message.

Netlify Forms hooks into this native browser behaviour. You add a netlify attribute to your form element and Netlify's CDN layer intercepts the POST request, stores the form submission in their dashboard, and sends you an email notification. No backend code required. No database. For a static site contact form, this is the correct solution — it is free, reliable, and requires zero infrastructure.

Form validation has two layers: client-side (JavaScript that runs in the browser before the form submits) and server-side (validation that happens after the data reaches the server). Client-side validation improves user experience — you can show "Please enter a valid email address" before the user submits, without a page reload. But client-side validation alone is insecure — a malicious user can bypass JavaScript entirely and submit arbitrary data. Always validate on the server too. For Netlify Forms, Netlify provides basic server-side validation (required fields) that you configure via the form's attributes.

Accessibility in forms is not optional. Every input must have an associated label (for screen readers). Error messages must be announced to screen readers (using aria-live). Keyboard navigation must work (users should be able to tab through the form and submit with Enter). These requirements are not edge cases — they affect millions of users who rely on assistive technology.`,

  pre_flight: `Know what HTTP methods are: GET (read data, safe, idempotent) and POST (create/change data, not idempotent). Know what an HTML form's action attribute does: specifies the URL to send the data to. Know what the name attribute on an input does: specifies the key in the form data (name="email" means the server receives the email value). Have your Netlify account ready and your Bean Forge site already deployed there.`,

  mastery_questions: [
    `Your form has action="#" and you are handling the submission with JavaScript. You call event.preventDefault() to stop the page from reloading. What happens to the form data if you do not handle the submission with JavaScript but forget to prevent the default? The browser sends a GET request to the current URL with the form data appended as query parameters: https://yoursite.com/contact#?name=Alice&email=alice@example.com&message=Hello. The page reloads with those parameters in the URL. The data is not saved anywhere. If you want the data sent to a server without JavaScript handling, use action="/some-endpoint" and method="post" — but then you need a server to receive the POST request.`,

    `Netlify Forms works by detecting the netlify attribute on your form element. You have added it and deployed, but submissions still do not appear in the Netlify dashboard. What do you check? (1) Did you push the updated form HTML and redeploy? Netlify detects the netlify attribute at deploy time by parsing your HTML — it will not work if you added the attribute after the last deploy. (2) Does the form have a name attribute? Netlify Forms requires <form name="contact">. Without it, Netlify cannot identify which form a submission belongs to. (3) Is there a honeypot field? Add a hidden field that bots will fill but humans will not: <input type="hidden" name="bot-field">. This reduces spam.`,

    `You write client-side email validation: if (!input.value.includes('@')) { showError('Invalid email') }. This validation fails to catch alice@example (a valid-looking email without a TLD). What is the more reliable approach? Use the HTML input type: <input type="email">. The browser has built-in email format validation for this input type. It handles more cases correctly than simple JavaScript string checks. For additional server-side validation, use a regex (though regex-based email validation is notoriously imperfect) or an email validation library. The most reliable approach for forms that matter: send a confirmation email and consider the address valid only if the user clicks the confirmation link.`,

    `You add a loading spinner that appears when the form is submitting and disappears when the response arrives. You submit the form with fetch() and async/await. Where exactly do you show the spinner and where do you hide it? Show the spinner immediately when the submit button is clicked, before the fetch call: spinner.classList.remove('hidden'). Hide it after the fetch call completes, in the finally block (not in the then block) so it always hides whether the request succeeds or fails: try { ... } finally { spinner.classList.add('hidden') }. The finally block runs regardless of success or error, ensuring the spinner never gets stuck in a loading state.`,

    `After a successful form submission, you want to show a success message and reset the form. How do you reset the form values? form.reset() clears all form fields to their default values. Call this after a successful submission. For the success message: have a hidden div with the message already in the HTML, toggle its visibility with classList on success. Do not redirect to a new page for a simple contact form — a smooth inline confirmation is better UX than a page reload.`,
  ],

  common_mistakes: [
    `Not associating labels with inputs. A label element must have a for attribute matching the input's id: <label for="email">Email</label><input type="email" id="email" name="email">. Without this association, screen readers do not announce which field the label describes. Clicking the label should focus the input.`,

    `Showing an error message but not moving focus to it. If a screen reader user submits a form with errors and the error message appears above the form, they may not hear it without scrolling or tabbing back. Use aria-live="polite" on the error container so screen readers automatically announce changes to its content.`,

    `Disabling the submit button after one click without re-enabling it on error. If the network request fails, the user cannot try again. Disable on submit, re-enable on completion (success or error).`,

    `Not handling network errors in your fetch call. If the user's internet drops mid-submission, fetch rejects the promise with a TypeError. Without a catch block, the error is swallowed and the user sees nothing. Always add a catch block that shows a "Something went wrong, please try again" message.`,

    `Putting the form's required validation entirely in JavaScript. HTML5 provides required, minlength, maxlength, and pattern attributes that the browser validates natively. Use these for basic validation. Add JavaScript only for complex validation logic (cross-field validation, async validation) that HTML attributes cannot express.`,
  ],

  debug_help: `The most common Netlify Forms problem is "submissions not appearing." Walk through the checklist: (1) Open Netlify dashboard > your site > Forms. If the form appears here but has 0 submissions, submissions are not reaching Netlify — check the form's action attribute and verify your site is deployed with the netlify attribute. (2) If the form does not appear at all, Netlify did not detect it at deploy time — redeploy and check again. (3) Submit the form yourself from the live URL (not localhost) and wait 30 seconds. Netlify Forms processes submissions asynchronously. (4) Check your spam folder for notification emails.`,

  ai_assist: `Use Claude to help you write the accessibility audit for your form. Describe each form field (type, label, validation) and ask it to identify any accessibility issues: missing label associations, missing error announcement patterns, keyboard navigation issues, color contrast on error states. Use the audit as a checklist to fix your form.`,

  stretch: [
    `Add a file upload field to the contact form using Netlify's large media addon. Users can attach a photo to their inquiry. Handle the case where the attachment is too large (show a friendly error before submission).`,
    `Implement honeypot spam protection and Netlify's reCAPTCHA integration. Test that regular form submissions still work. Document what honeypot fields are and why they reduce spam.`,
    `Build a multi-step form: step 1 collects name and email, step 2 collects the message and subject, step 3 shows a confirmation before final submit. Preserve the data across steps in memory and allow the user to go back and edit.`,
  ],
});

rewriteWeek("full-stack-web", 4, {
  context: `Plain HTML files work. They are fast, simple, and require no tooling. They also do not scale when you have 20 pages with the same navigation header that needs updating. Copy-pasting the same navigation code into 20 HTML files means 20 files to update when the navigation changes. This is the problem that components, templates, and build tools solve. Astro is the framework that lets you have the best of both worlds: the simplicity of static HTML at runtime, with the component model during development.

Astro components compile to HTML. A Menu.astro component that accepts props (item data) renders to plain HTML when built — no JavaScript framework in the browser, no React runtime, no Vue runtime. Just the HTML the browser needs. This makes Astro sites fast by default: there is nothing extra to download or execute. JavaScript is added only when you explicitly need interactivity, using Astro's "islands" architecture.

The refactor from plain HTML to Astro teaches you what a framework actually does. You are not abandoning the fundamentals — you are adding a build step that lets you write more maintainable code that compiles to the same thing you were writing manually. Understanding what compiles to what is how you debug build tools rather than just hoping they work.

Adding a /blog to Bean Forge introduces markdown. Markdown is plain text with simple formatting conventions: # for headings, ** for bold, * for italics, [text](url) for links. Astro processes .md files and converts them to HTML automatically. This is the architecture behind most modern content sites: developers write in markdown, the build tool converts to HTML, the result is fast and accessible.

The build step introduces a new failure mode: your site works locally but breaks after building. Local development runs a dev server that serves files directly. The build process transforms and optimises files in ways that can expose issues — wrong import paths, missing dependencies, environment variables that exist locally but not in the build environment. Testing the built output (npm run build && npm run preview) before deploying is a habit worth developing.`,

  pre_flight: `Install Node.js (v18+) and npm. Understand what node_modules is: a directory where npm stores the packages your project depends on. It is listed in .gitignore — it is never committed to git. npm install recreates it from package.json. Know what a build step is: transforming source files (Astro components, TypeScript, CSS modules) into output files (HTML, CSS, JavaScript) that browsers can use. Install Astro: npm create astro@latest.`,

  mastery_questions: [
    `You create a MenuItem.astro component that accepts a name and price prop. In the component, you write {name} to render the name. You pass name="Oat Milk Latte" and price={4.50}. The component renders correctly. Then you change name to include an HTML tag: "Oat Milk <em>Latte</em>". The tag renders as literal text, not HTML. Why? Astro's {expression} syntax escapes HTML by default, which prevents XSS attacks — if you rendered user-provided content as HTML without escaping, an attacker could inject malicious scripts. To render raw HTML intentionally, use Astro's <Fragment set:html={markup} />. For component props, either use plain text and handle formatting in the component template, or accept a separate prop for the formatted version.`,

    `Your Astro site has src/pages/menu.astro and you want to link to it from the homepage. What href do you use? /menu (without the file extension). Astro uses file-based routing: src/pages/menu.astro serves at /menu. src/pages/blog/index.astro serves at /blog. src/pages/blog/[slug].astro serves at /blog/any-slug. When linking between pages, use the URL path, not the file path. The .astro extension is an implementation detail that the browser never sees.`,

    `You want to create a blog post at /blog/our-coffee-story. How do you structure this in Astro? Two approaches: (1) Create src/pages/blog/our-coffee-story.md — Astro converts markdown files to HTML pages automatically, with the route matching the file path. (2) Create src/pages/blog/[slug].astro — a dynamic route that reads from a collection of markdown files. For a small number of posts where you want full control of the layout, option 1 is simpler. For many posts with a consistent layout, option 2 scales better. Start with option 1 this week.`,

    `Your Navigation.astro component renders correctly in Astro's dev server but after you run npm run build, the navigation is missing from some pages. What do you investigate? Check the build output in the dist/ directory. Open the built HTML files and verify the navigation HTML is present. If it is missing, the component is not being imported or used in those pages. Also check: are the affected pages using a different layout file that does not include the navigation? Are there any build errors in the terminal output that might indicate a partial build failure?`,

    `You want to display the current date on each blog post page (formatted as "January 15, 2026"). How do you do this in Astro? In the frontmatter (the --- block at the top of the .astro file): const date = new Date('2026-01-15'); const formatted = date.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'}). Then in the template: <time datetime="2026-01-15">{formatted}</time>. Using the <time> element with a machine-readable datetime attribute is the accessible and SEO-friendly approach.`,
  ],

  common_mistakes: [
    `Importing npm packages in the browser-side script tag of an Astro component. Astro's component scripts (in the frontmatter) run at build time on the server. JavaScript inside <script> tags in the template runs in the browser. You cannot import npm packages in browser-side scripts the same way — use Astro's client directives or a bundler-aware import.`,

    `Not defining the Astro component's Props interface for TypeScript projects. Without the Props interface, your component silently accepts any props and TypeScript cannot warn you about missing or misspelled props. Always define: interface Props { name: string; price: number; }`,

    `Forgetting that Astro static pages are built at build time, not request time. If you fetch data from an API in the frontmatter, that data is fetched once when you build the site and baked into the HTML. If the data changes after deployment, the site does not update until you rebuild. For frequently-changing data, use Astro's server-side rendering mode or fetch on the client side.`,

    `Using relative imports from the wrong base. In Astro, use the @ alias for src imports: import Layout from '@/layouts/BaseLayout.astro'. Relative imports like ../../../layouts/BaseLayout.astro work but are fragile — moving the file breaks all relative imports. Configure the @ alias in your tsconfig.json and use it consistently.`,

    `Not running npm run build before deploying and assuming the dev server matches the production build. The dev server is permissive — it can serve files that the production build rejects due to type errors or missing dependencies. Always build locally and check the output before pushing to trigger a Netlify deploy.`,
  ],

  debug_help: `The most common Astro build error is "Failed to parse frontmatter" or a YAML syntax error in the --- block. Astro frontmatter uses YAML for markdown files and JavaScript for .astro files. In markdown files, frontmatter must be valid YAML — strings with colons need quoting: title: "My: Title" not title: My: Title. In .astro files, frontmatter is JavaScript — variable declarations, imports, and function calls, not YAML. Check which type of file the error appears in and apply the appropriate syntax rules.`,

  ai_assist: `Use Claude to help you plan the component structure for your Bean Forge refactor. Describe the current HTML pages and ask it to suggest which parts should become reusable components: what should be a Layout, what should be a Card component, what should be a Navigation component. Component design is an architectural decision — get the structure right before writing code. Then implement each component yourself.`,

  stretch: [
    `Add an RSS feed to your blog using Astro's built-in RSS support. Generate a valid RSS XML file at /rss.xml. Verify it with an RSS reader. This is a standard expectation for blog content that most frameworks make easy but many developers forget to add.`,
    `Add a Table of Contents component to blog posts: it reads the headings in the markdown content and renders a list of links that scroll to each heading. This requires understanding how Astro handles markdown content at build time.`,
    `Configure Astro's built-in image optimisation: wrap all images with Astro's <Image> component. Measure the difference in image file sizes between the original and the optimised output. Document the performance improvement.`,
  ],
});

rewriteWeek("full-stack-web", 5, {
  context: `React is the component mental model. Every UI you will build in your career will be decomposed into components — self-contained units that manage their own state and render a piece of the interface. React invented this mental model (or popularised it — it is a contested history) and most modern UI frameworks use a variation of it. Learning React means learning how to think about interfaces as trees of components, which is a transferable skill regardless of which framework you use next.

A component is a function that takes data (props) as input and returns a description of what to display (JSX). React calls your function, takes the JSX you returned, and updates the DOM to match. When the props or state change, React calls your function again and updates only the parts of the DOM that changed. This is fundamentally different from the imperative DOM manipulation you learned in weeks 1-2 (document.querySelector().textContent = ...) — you describe what the UI should look like given the current data, and React handles the how.

useState is the hook that gives function components the ability to remember values between renders. When you call useState(initialValue), you get back the current value and a setter function. Calling the setter function triggers a re-render with the new value. This is the fundamental React loop: user action triggers a state change, state change triggers a re-render, re-render produces updated UI.

The rules of hooks are not arbitrary. Hooks must be called at the top level of the component function, not inside conditions or loops. This constraint exists because React relies on the order of hook calls to associate state with the right component instance across renders. Violating the rules produces subtle bugs where state gets mixed up between renders.

The todo app beyond todos is more than an exercise — it is a template for state-driven UI. The same pattern applies to a shopping cart, a form builder, a kanban board, or a dashboard. Data flows down (through props), events bubble up (through callback props). Once you internalise this one-directional data flow, every React application you build makes sense.`,

  pre_flight: `Create a new React project with Vite: npm create vite@latest my-todos -- --template react-ts. Know the difference between props (data passed from parent to child component) and state (data managed within a component). Understand what JSX is: a syntax extension for JavaScript that looks like HTML and compiles to React.createElement() calls. Know what re-rendering means: React calling your component function again to compute the new UI.`,

  mastery_questions: [
    `Your todo list has a deleteTodo function that removes a todo by id. You pass this function as a prop to each TodoItem component: <TodoItem onDelete={deleteTodo}>. In the TodoItem component, you call props.onDelete(todo.id) when the delete button is clicked. Why pass the function as a prop rather than just defining it inside the TodoItem component? TodoItem does not own the todos array — the parent component does. Only the owner of the state should modify it. TodoItem is a presentational component: it displays data and signals intent (the user wants to delete this item), but the actual deletion happens in the parent, which has access to the todos array and its setter function. This is the one-directional data flow principle: data flows down (todos passed to TodoItem as props), events bubble up (onDelete callback called by TodoItem, handled by parent).`,

    `You have a text input and you want to track what the user types. You set up: <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />. If you omit the onChange handler, the input becomes read-only. Why? In React, an input with a value prop is a "controlled component" — React controls its value. If you set value without onChange, React renders the input with that value and immediately corrects any user changes back to the controlled value. This makes the input appear read-only. For an uncontrolled input (one the browser manages), omit the value prop or use defaultValue.`,

    `You have 100 todo items in your list. Each item has a delete button. Every time any delete button is clicked, all 100 items re-render. How do you prevent unnecessary re-renders? Wrap TodoItem in React.memo: const TodoItem = React.memo(function TodoItem(props) {...}). React.memo skips re-rendering if the props have not changed. But there is a subtlety: if you pass onDelete directly as an arrow function prop, it is a new function on every render, and React.memo treats it as a changed prop. Fix: wrap onDelete with useCallback so it maintains the same function reference between renders: const handleDelete = useCallback((id) => setTodos(t => t.filter(todo => todo.id !== id)), []). Then pass handleDelete to each TodoItem.`,

    `You add drag-to-reorder using the HTML5 Drag and Drop API. When a todo is dragged, you track the dragged item's index. When it is dropped onto another item, you reorder the array. Your reorder function takes the current todos array, creates a new array in the new order, and calls setTodos. Why must you create a new array rather than mutating the existing array? React determines whether to re-render based on reference equality. If you mutate the todos array directly (todos.splice(from, 1).splice(to, 0, dragged)), React sees the same array reference and may not re-render. Creating a new array (const newTodos = [...todos]; newTodos.splice(...)) gives React a different reference and triggers the re-render. Never mutate state directly in React — always create new values.`,

    `You want the filter tabs (All, Active, Completed) to update the URL query parameter (?filter=active) so users can share filtered views. What does this require beyond React state? URL manipulation — updating the browser's address bar without a full page reload. Use the Web History API: window.history.pushState({filter: 'active'}, '', '?filter=active'). On component mount, read the initial filter from the URL: new URLSearchParams(window.location.search).get('filter'). In a real React application, you would use React Router for this rather than the raw History API, but understanding the underlying mechanism is important.`,
  ],

  common_mistakes: [
    `Setting state directly instead of using the setter: todos.push(newTodo) instead of setTodos([...todos, newTodo]). Direct mutation does not trigger re-renders and creates subtle synchronisation bugs. Always use the state setter.`,

    `Using array index as the key prop for a list: key={index}. When items are reordered, added at the start, or deleted from the middle, the index-based keys become incorrect — React may reuse the wrong DOM elements. Use a stable unique identifier as the key: key={todo.id}.`,

    `Putting too much logic in the component function body instead of in custom hooks or utility functions. If your TodoList component is 200 lines and handles filtering, sorting, persistence, and rendering, it is doing too much. Extract the filtering logic into a useFilteredTodos hook, the persistence into a usePersistTodos hook. Component functions should be readable — mostly JSX with light logic.`,

    `Not handling loading and error states. Your components will fetch data from APIs. Any fetch can fail. Any fetch can be slow. Build loading and error states from the start: if (loading) return <Spinner />; if (error) return <ErrorMessage />; return <TodoList />.`,

    `Calling useState and useEffect inside conditions or after early returns. This violates the rules of hooks. React requires hooks to be called in the same order on every render. If an early return happens before a hook call, React sees different numbers of hooks on different renders and throws an error.`,
  ],

  debug_help: `The most confusing React bug is "stale closure" — a function that captures an outdated value from a previous render. Example: you set up a setInterval inside useEffect with an empty dependency array. The interval's callback reads the count state. But count is always 0 in the callback, even though count has incremented. This is because the callback closed over the initial value of count. Fix: use the functional update form of the setter: setCount(c => c + 1) instead of setCount(count + 1). The functional form receives the current state as an argument rather than closing over a potentially stale value.`,

  ai_assist: `Use Claude to help you design the data structure for your todo app's state. Describe the features you want to implement (categories, due dates, priorities, completed status, drag order) and ask it to suggest a state shape — what the todos array should look like, what additional state is needed for the UI. State design determines how easy or hard every feature is to implement — get it right before writing code.`,

  stretch: [
    `Add local persistence using a custom hook usePersistentState that wraps useState and automatically syncs state to localStorage. The hook should handle JSON serialisation/deserialisation and have the same API as useState so it can replace useState with no other code changes.`,
    `Implement optimistic updates: when the user marks a todo as complete, immediately update the UI, then save to localStorage. If the save fails (simulate this with a random failure), revert the UI change and show an error. Optimistic updates are a key pattern for responsive UIs.`,
    `Add keyboard navigation: pressing Arrow Up/Down moves the selection between todos, pressing Delete removes the selected todo, pressing Enter marks it complete. Implement using React's onKeyDown handlers and managing a selectedIndex state. Test with a keyboard-only workflow.`,
  ],
});
