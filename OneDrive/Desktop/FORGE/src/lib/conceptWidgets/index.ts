import type { ConceptWidgetDef, WidgetParams } from "./scaffold";
import { dataWidgets } from "./data";
import { mlWidgets } from "./ml";
import { aiWidgets } from "./ai";
import { webWidgets } from "./web";
import { mobileWidgets } from "./mobile";
import { devopsWidgets } from "./devops";
import { securityWidgets } from "./security";
import { biWidgets } from "./bi";
import { automationWidgets } from "./automation";
import { actuaryWidgets } from "./actuary";

/**
 * The concept-widget registry. Roadmap JSON references a widget by `id`
 * (see ConceptWidgetRef in src/lib/roadmaps.ts); this maps that id to the
 * widget definition whose html() builds the sandboxed document.
 *
 * One widget can be referenced from many weeks across many paths. Adding a
 * widget = add a def to one of the per-path files and it registers here
 * automatically.
 */
const ALL: ConceptWidgetDef[] = [
  ...dataWidgets,
  ...mlWidgets,
  ...aiWidgets,
  ...webWidgets,
  ...mobileWidgets,
  ...devopsWidgets,
  ...securityWidgets,
  ...biWidgets,
  ...automationWidgets,
  ...actuaryWidgets,
];

const REGISTRY: Record<string, ConceptWidgetDef> = {};
for (const w of ALL) {
  if (REGISTRY[w.id]) throw new Error(`Duplicate concept widget id: ${w.id}`);
  REGISTRY[w.id] = w;
}

export function getWidget(id: string): ConceptWidgetDef | undefined {
  return REGISTRY[id];
}

/** Build the full sandboxed HTML document for a widget ref. Returns null for
 *  an unknown id so the renderer can gracefully render nothing. */
export function renderWidgetHtml(id: string, params?: WidgetParams): string | null {
  const w = REGISTRY[id];
  return w ? w.html(params) : null;
}

export function widgetMeta(id: string): { title: string; blurb: string; bridge?: string } | null {
  const w = REGISTRY[id];
  return w ? { title: w.title, blurb: w.blurb, bridge: w.bridge } : null;
}

/** Every registered widget id — handy for seeding scripts and audits. */
export const WIDGET_IDS: string[] = ALL.map((w) => w.id);

export type { ConceptWidgetDef, WidgetParams };
