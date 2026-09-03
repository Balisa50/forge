/**
 * v2 rewrite: data-science Week 1 — "What data science actually is"
 * Voice: mentor over coffee. No AI-tell cadence. Specific, slightly suspicious,
 * occasionally dry.
 *
 * Run: npx tsx scripts/v2/ds-w01.ts
 */

import { rewriteWeek } from "../rewrite-week";

rewriteWeek("data-science", 1, {
  context: `Somewhere in New York right now, a yellow cab is making a turn. The meter is logging the moment — exact fare, exact distance, pickup minute, drop-off minute — and a few months from now that single record will sit on a public NYC government server alongside three and a half million other trips from the same month.

Those trips are October 2023. They are sitting there. This week you load all of them into Python and figure out three things about how the city actually moves.

You are building TaxiPulse. By Sunday it lives on your GitHub as your first real piece of public work.

I want to flag something before you write a line of code. The thing that makes someone good at this job is not pandas. It is a kind of suspicion. The instinct to see a 30-cent taxi fare and immediately ask whether the meter was broken. The habit of noticing that the average trip distance shifted by 4% between two months and wanting to know if the city changed a regulation or if someone forgot to clean the data. A quiet distrust of round numbers. That instinct is what we are actually training here. The syntax is incidental — you will absorb pandas just by needing it.

A second thing: this is going to feel slow at first. Installing Anaconda, opening Jupyter for the first time, fighting with a Python kernel that will not start, downloading a 50MB file from a city website that buries the link. None of that is the interesting part. All of it is unavoidable. Push through the boring half of the week so you get to the interesting half with the data already loaded.

You will hit errors. Red text in your terminal, scary-looking tracebacks. Most of them are boring once you read them — usually a column name you typed slightly wrong, or a quote mark you forgot to close. When the first one happens, do not refresh the page. Read the last line of the error first. That line is where Python tells you what actually broke. We will practise this together.

By Sunday: 3.5 million trips loaded, the obvious junk filtered out, three real patterns about NYC movement, and one Jupyter notebook live at a public URL with your name on it. That is the week.`,

  pre_flight: `Before you run a single line of code, get a pen. Write down your guesses for two things and do NOT look them up: (1) which hour of the day do you think has the most yellow taxi pickups in NYC, and (2) what tip percentage do you think New Yorkers actually leave on average. Fold the paper, set it next to your laptop, and we will check on Sunday. This habit — predict, then check — is the single highest-ROI move in the whole field. Every analyst who is any good does this on every new dataset. You start now.`,

  mastery_questions: [
    `Run df.shape after loading the parquet file. Paste it. Three and a half million rows — if you scrolled through them one per second without sleeping, it would take you 40 days. Now pick one column you do not recognise (RatecodeID, store_and_fwd_flag, congestion_surcharge — there are several) and find what it means in the NYC TLC data dictionary. Paste the column name and what it actually means in your own words. The five-minute habit of asking "what is this column actually" is what separates someone who works with data from someone who pretends to.`,
    `Run df['fare_amount'].describe(). Look at the min and the max. The min is probably zero or negative. The max is probably absurd — try $400,000 for a single ride. Before you delete anything, pause and write down two reasons those weird rows might exist (broken meters? test transactions? software bugs? returned fares?). Then write the filter that drops the impossible ones, and explain why your cutoff is fair rather than arbitrary. Paste the filter. The cleaning IS the analysis — every decision here is a small story about what you count as real.`,
    `Group by hour: df.groupby(df['tpep_pickup_datetime'].dt.hour).size().sort_values(ascending=False). Now — before you read the result — what was your prediction on the paper? Paste both numbers: yours, and the data's. If you were wrong, write one honest sentence about what assumption was off. Maybe tourists wake up later than you thought. Maybe people take cabs home from bars more than to work. Whatever the explanation is, name it. The moments your prediction is wrong are gold — they are literally how you build intuition for a city you may not live in.`,
    `Pick one of the three week-questions and answer it in code. Then write a two-sentence interpretation of what you found. The bad interpretation is "average tip is 18%". The good one is "average tip is 18%, which is suspicious because that's exactly the middle option on the card reader — most people probably tap the default rather than thinking about it." The number is the easy part. The reading of the number is the actual skill, and it is what hiring managers test for in every data interview you will ever sit.`,
    `Push the notebook to GitHub and paste the URL. Now open it in an incognito tab and read it as a stranger would — someone who has never seen this dataset and does not know you. Is the question stated clearly at the top? Are the charts labelled? Could a non-technical friend follow the logic without you explaining it out loud? If the answer is no, fix it before you call the week done. This is the first piece of public evidence that you do this kind of work — read it once like the reader, not the writer.`,
  ],

  common_mistakes: [
    `Forgetting .dt.hour and grouping by the raw datetime column instead. You end up with 3.5 million groups (one per second) and a chart that looks like static. If your group count is in the millions, you grouped by the wrong thing.`,
    `Running .mean() on a column that has NaN values and getting a confusingly tiny or huge number. Pandas is mostly graceful about nulls but not always — when in doubt, run df['col'].isna().sum() first and decide whether to drop them or fill them.`,
    `Pushing the notebook to GitHub with the output cells still full of raw print(df) dumps from when you were debugging. Run "Restart Kernel & Run All" once before committing, then delete the noisy cells.`,
    `Treating the filter step as a chore. Every row you drop is a judgement call — be able to defend it. "I dropped fares above $500 because the 99.9th percentile is $250" is a defensible sentence. "I dropped them because they looked weird" is not.`,
    `Spending three days on installation problems because of conda vs pip vs system Python. If you are stuck on environments past day two, ask for help on the channel. Do not let plumbing eat the week.`,
  ],

  debug_help: `When you see a red traceback, read it from the BOTTOM up. The last line is what Python actually thinks the problem is. Everything above it is the trail of calls that led there — usually irrelevant. Most pandas errors this week will be one of three things: (1) KeyError: 'column_name' means that column literally does not exist by that exact name (run df.columns and look — often a capital letter or a space is the problem); (2) ValueError: cannot convert string to float means a column you thought was numeric has text in it somewhere; (3) AttributeError: 'DataFrame' object has no attribute 'X' means you typed a method name slightly wrong or forgot the parentheses. If you cannot solve it in 15 minutes, paste the full error AND the line of code that produced it into Claude. Ask Claude to explain what is happening before you copy any fix. The point this week is to learn the shape of pandas errors so future weeks feel easier.`,

  stretch: [
    `Compare October 2023 to October 2022 (same parquet pattern, swap the year). What changed? Is total trip volume up or down? Tip percentages? Average distance? This is your first taste of comparative analysis — the question every real business asks is "compared to what?".`,
    `Plot pickup density on a map using folium. Hint: each row has pickup_longitude and pickup_latitude — well, in older datasets it does; the 2023 data uses location ID, which you can join to the TLC zone lookup table. Worth the detour if you want a real "wow" deliverable for the portfolio.`,
    `Find the median trip rather than the mean, and explain in two sentences why the difference matters for fare data. (Hint: a $400 airport ride pulls the mean up but barely moves the median. Most real reporting uses median for exactly this reason.)`,
  ],
});
