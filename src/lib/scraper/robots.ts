// Section 5: "Respect robots.txt, rate-limit requests." Requires Node's
// fetch to actually reach the network — run scraper scripts with
// NODE_USE_ENV_PROXY=1 in this sandboxed dev environment (see package.json's
// "scrape" script); a normal deployment's outbound network won't need that.

type RobotsRules = { disallow: string[] };

const robotsCache = new Map<string, { rules: RobotsRules; fetchedAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

function parseDisallowForAllAgents(robotsTxt: string): string[] {
  const lines = robotsTxt.split("\n").map((l) => l.trim());
  const disallow: string[] = [];
  let inWildcardBlock = false;

  for (const line of lines) {
    if (/^user-agent:\s*\*/i.test(line)) {
      inWildcardBlock = true;
      continue;
    }
    if (/^user-agent:/i.test(line)) {
      inWildcardBlock = false;
      continue;
    }
    if (inWildcardBlock) {
      const match = line.match(/^disallow:\s*(.*)$/i);
      if (match) {
        const path = match[1].trim();
        if (path) disallow.push(path);
      }
    }
  }
  return disallow;
}

async function getRules(origin: string): Promise<RobotsRules> {
  const cached = robotsCache.get(origin);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.rules;
  }

  let rules: RobotsRules = { disallow: [] };
  try {
    const res = await fetch(`${origin}/robots.txt`);
    if (res.ok) {
      rules = { disallow: parseDisallowForAllAgents(await res.text()) };
    }
  } catch {
    // Unreachable robots.txt: fail closed on nothing extra — we simply have
    // no disallow rules to enforce, callers should still rate-limit.
  }

  robotsCache.set(origin, { rules, fetchedAt: Date.now() });
  return rules;
}

export async function isAllowedByRobots(url: string): Promise<boolean> {
  const parsed = new URL(url);
  const { disallow } = await getRules(parsed.origin);
  return !disallow.some((rule) => parsed.pathname.startsWith(rule));
}
