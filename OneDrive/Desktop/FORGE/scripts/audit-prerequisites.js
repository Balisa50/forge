// Curriculum prerequisite audit.
//
// COMPLEMENTS the existing scripts/audit-week-alignment.ts (which checks that
// each week's CONTEXT mentions its TOPIC keywords). This audit answers a
// different question: does every tool/library USED in lesson code have a
// prerequisite teach-it-from-zero lesson EARLIER in the same track?
//
// The DS W2 NumPy gap was the original motivator: dot products were taught
// with `np.array(...)` and `np.dot(...)` in code, but NumPy itself had no
// introductory lesson anywhere. That class of bug is what this script catches
// across every track.
//
// Run: node scripts/audit-prerequisites.js
//      node scripts/audit-prerequisites.js --track data-science
//      node scripts/audit-prerequisites.js --json > audit.json
const fs = require('fs');
const path = require('path');

const ROOT = path.join('C:', 'Users', 'Abdoulie Balisa', 'OneDrive', 'Desktop', 'FORGE', 'data', 'roadmaps');

const TRACKS = [
  'data-science', 'data-analysis', 'ai-engineering', 'ml-engineering',
  'full-stack-web', 'mobile-engineering', 'devops-cloud', 'cybersecurity',
  'bi-analytics', 'ai-automation',
];

/** Tools we expect a "teach this from zero" day for before they appear in
 *  any code block. Each entry has:
 *    name        : display name
 *    usagePatterns: regexes that mean "this code uses the tool"
 *    teachPatterns: regexes that mean "this lesson teaches the tool from zero"
 *  We deliberately keep both sides strict — false positives waste signal. */
const TOOLS = [
  {
    name: 'NumPy',
    usagePatterns: [/\bimport\s+numpy\b/, /\bfrom\s+numpy\b/, /\bnp\.(array|dot|zeros|ones|arange|linalg|mean|sum|reshape|matmul)\b/, /@\s*np\./],
    teachPatterns: [/\bnumpy\b/i],
  },
  {
    name: 'pandas',
    usagePatterns: [/\bimport\s+pandas\b/, /\bfrom\s+pandas\b/, /\bpd\.(read_|DataFrame|Series|concat|merge)\b/, /\bdf\.(groupby|merge|read_|to_)\b/, /\bdf\[/],
    teachPatterns: [/\bpandas\b/i],
  },
  {
    name: 'scikit-learn',
    usagePatterns: [/\bfrom\s+sklearn\b/, /\bimport\s+sklearn\b/, /\.fit\(.*\)/, /\.predict\(/, /train_test_split\(/],
    teachPatterns: [/\bscikit[\s-]?learn\b/i, /\bsklearn\b/i],
  },
  {
    name: 'matplotlib',
    usagePatterns: [/\bimport\s+matplotlib\b/, /\bfrom\s+matplotlib\b/, /\bplt\.(plot|scatter|hist|bar|show|figure|subplots)\b/],
    teachPatterns: [/\bmatplotlib\b/i, /\bplt\b/i],
  },
  {
    name: 'PyTorch',
    usagePatterns: [/\bimport\s+torch\b/, /\bfrom\s+torch\b/, /\btorch\.(tensor|nn|optim|cuda)\b/],
    teachPatterns: [/\bpytorch\b/i, /\btorch\b/i],
  },
  {
    name: 'TensorFlow / Keras',
    usagePatterns: [/\bimport\s+tensorflow\b/, /\bimport\s+keras\b/, /\btf\.keras\b/],
    teachPatterns: [/\btensorflow\b/i, /\bkeras\b/i],
  },
  {
    name: 'Docker',
    usagePatterns: [/^\s*docker\s+(build|run|ps|pull|push|exec|compose)/m, /\bFROM\s+\w+:\w+/m, /\bdocker-compose\.yml\b/],
    teachPatterns: [/\bdocker\b/i, /\bcontainer/i],
  },
  {
    name: 'Terraform',
    usagePatterns: [/\bterraform\s+(init|plan|apply|destroy)\b/, /\bresource\s+"aws_/],
    teachPatterns: [/\bterraform\b/i, /\binfrastructure[\s-]?as[\s-]?code\b/i, /\biac\b/i],
  },
  {
    name: 'Git',
    usagePatterns: [/\bgit\s+(clone|push|pull|commit|branch|merge|rebase|tag|checkout)\b/],
    teachPatterns: [/\bgit\b/i, /\bversion[\s-]?control\b/i],
  },
  {
    name: 'SQL',
    usagePatterns: [/\bSELECT\s+.+\s+FROM\s+\w/i, /\bJOIN\s+\w+\s+ON\b/i, /\bGROUP\s+BY\b/i, /\bCREATE\s+TABLE\b/i],
    teachPatterns: [/\bsql\b/i, /\bquery\s+language\b/i],
  },
  {
    name: 'OpenAI SDK',
    usagePatterns: [/\bfrom\s+openai\b/, /\bclient\.chat\.completions\b/, /\bOpenAI\(\)/],
    teachPatterns: [/\bopenai\b/i, /\bllm\b/i, /\bchat\s+completion/i],
  },
  {
    name: 'Anthropic SDK',
    usagePatterns: [/\bfrom\s+anthropic\b/, /\b_?anth\.messages\.create\b/, /\bAnthropic\(\)/],
    teachPatterns: [/\banthropic\b/i, /\bclaude\b/i],
  },
  {
    name: 'Streamlit',
    usagePatterns: [/\bimport\s+streamlit\b/, /\bst\.(text_input|button|selectbox|columns|sidebar|metric|session_state)\b/],
    teachPatterns: [/\bstreamlit\b/i],
  },
  {
    name: 'React',
    usagePatterns: [/\bimport\s+React\b/, /\buseState\(/, /\buseEffect\(/, /\bReactDOM\b/],
    teachPatterns: [/\breact\b/i, /\bjsx\b/i, /\bcomponent\b/i],
  },
  {
    name: 'Next.js',
    usagePatterns: [/\bfrom\s+['"]next\//, /\bapp\/.*\/page\.tsx\b/, /\bnext\.config\b/],
    teachPatterns: [/\bnext\.?js\b/i],
  },
];

function loadTrack(slug) {
  const file = path.join(ROOT, slug + '.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** All text content of a week joined — used for usage detection. */
function weekBodyText(week) {
  const parts = [];
  parts.push(week.title || '', week.context || '');
  for (const d of (week.days || [])) {
    parts.push(d.title || '', d.summary || '');
    for (const it of (d.items || [])) {
      parts.push(it.title || '', it.body || '', it.why || '', it.url || '');
      if (it.cards) for (const c of it.cards) parts.push(c.prompt || '', c.whenRight || '', c.whenWrong || '');
    }
  }
  return parts.join('\n');
}

/** Does this week TEACH the tool? Heuristic: any lesson/reading TITLE
 *  references the tool — that's a from-zero introduction, not just usage. */
function weekTeachesTool(week, tool) {
  for (const d of (week.days || [])) {
    for (const it of (d.items || [])) {
      if (it.kind !== 'lesson' && it.kind !== 'reading' && it.kind !== 'video') continue;
      const title = it.title || '';
      if (tool.teachPatterns.some((re) => re.test(title))) return true;
    }
  }
  return false;
}

/** Does this week USE the tool in any lesson body or code sample? */
function weekUsesTool(week, tool) {
  const text = weekBodyText(week);
  return tool.usagePatterns.some((re) => re.test(text));
}

function auditTrack(slug) {
  const track = loadTrack(slug);
  const findings = [];

  for (const tool of TOOLS) {
    let firstTeach = null;
    let firstUse = null;
    for (const w of track.weeks) {
      if (firstTeach === null && weekTeachesTool(w, tool)) firstTeach = w.number;
      if (firstUse  === null && weekUsesTool(w, tool))    firstUse  = w.number;
      if (firstTeach !== null && firstUse !== null) break;
    }

    if (firstUse === null) continue; // tool not used in this track — fine.
    if (firstTeach === null) {
      findings.push({
        tool: tool.name,
        severity: 'critical',
        firstUseWeek: firstUse,
        firstTeachWeek: null,
        message: `Used in W${firstUse} but never explicitly taught anywhere in the track.`,
      });
      continue;
    }
    if (firstTeach > firstUse) {
      findings.push({
        tool: tool.name,
        severity: 'high',
        firstUseWeek: firstUse,
        firstTeachWeek: firstTeach,
        message: `Used in W${firstUse} BEFORE its teach week (W${firstTeach}). Student meets the tool with no prior lesson.`,
      });
    }
  }

  return { slug, findings };
}

function main() {
  const args = process.argv.slice(2);
  const trackArg = args.find((a) => a.startsWith('--track='))?.slice('--track='.length)
                   || (args.includes('--track') ? args[args.indexOf('--track') + 1] : null);
  const wantJson = args.includes('--json');

  const tracks = trackArg ? [trackArg] : TRACKS;
  const reports = tracks.map(auditTrack);

  if (wantJson) {
    process.stdout.write(JSON.stringify(reports, null, 2));
    return;
  }

  let totalCritical = 0, totalHigh = 0;
  for (const r of reports) {
    console.log(`\n=== ${r.slug} ===`);
    if (r.findings.length === 0) {
      console.log('  OK — every used tool has a prerequisite teach week.');
      continue;
    }
    for (const f of r.findings) {
      const tag = f.severity === 'critical' ? 'CRITICAL' : 'HIGH';
      console.log(`  [${tag}] ${f.tool.padEnd(20)} ${f.message}`);
      if (f.severity === 'critical') totalCritical++;
      else if (f.severity === 'high') totalHigh++;
    }
  }
  console.log('\n========================================');
  console.log(`Totals: ${totalCritical} CRITICAL · ${totalHigh} HIGH`);
  console.log('========================================');
  console.log('CRITICAL = tool used with NO teach lesson anywhere.');
  console.log('HIGH     = tool taught LATER than first usage (out-of-order).');
}

main();
