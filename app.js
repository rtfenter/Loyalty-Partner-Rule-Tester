// Simple partner metadata and rule config

const regions = {
  US: { label: "United States", code: "US" },
  EU: { label: "Europe", code: "EU" },
  UK: { label: "United Kingdom", code: "UK" },
  JP: { label: "Japan", code: "JP" }
};

const partners = {
  AERO: {
    id: "AERO",
    name: "AeroAir Flights",
    description: "Airline partner, strong in US/EU. Tighter rules in JP.",
    allowedRegions: ["US", "EU", "UK"],
    blockedRegions: ["JP"],
    blockedTiers: ["Member"],
    notes:
      "Standard airline earn. No earn in JP. Requires at least Silver for partner-funded campaigns.",
    overrides: [
      {
        id: "AERO_EU_PROMO_MEMBER",
        description:
          "EU promo temporarily allows Members to earn if a promotional window is active.",
        when: (ctx) =>
          ctx.region === "EU" &&
          ctx.tier === "Member" &&
          ctx.flags.promo === true,
        effect: "allow"
      }
    ]
  },
  MART: {
    id: "MART",
    name: "MetroMart Retail",
    description: "Grocery / retail partner, US-only.",
    allowedRegions: ["US"],
    blockedRegions: [],
    blockedTiers: [],
    notes:
      "Everyday retail earn in US. No cross-border earn. Corporate accounts do not earn here.",
    overrides: [
      {
        id: "MART_CORPORATE_BLOCK",
        description: "Corporate accounts are excluded from earning at MetroMart.",
        when: (ctx) => ctx.flags.corporate === true,
        effect: "block"
      }
    ]
  },
  GSTAY: {
    id: "GSTAY",
    name: "GlobalStay Hotels",
    description: "Hotel chain with global footprint and nuanced JP handling.",
    allowedRegions: ["US", "EU", "UK", "JP"],
    blockedRegions: [],
    blockedTiers: [],
    notes:
      "JP is a stay-only market: members can book but do not normally earn, unless a Gold+ promo is active.",
    overrides: [
      {
        id: "GSTAY_JP_BLOCK_DEFAULT",
        description:
          "In JP, base rules treat GlobalStay as stay-only (no earn) unless a higher-tier promo is active.",
        when: (ctx) => ctx.region === "JP" && ctx.flags.promo !== true,
        effect: "block"
      },
      {
        id: "GSTAY_JP_GOLD_PROMO",
        description:
          "In JP, Gold and Platinum members can earn during a promotional window.",
        when: (ctx) =>
          ctx.region === "JP" &&
          ctx.flags.promo === true &&
          (ctx.tier === "Gold" || ctx.tier === "Platinum"),
        effect: "allow-conditional"
      }
    ]
  },
  STREAM: {
    id: "STREAM",
    name: "StreamFlix Media",
    description: "Subscription media partner with channel restrictions.",
    allowedRegions: ["US", "EU"],
    blockedRegions: ["JP"],
    blockedTiers: [],
    notes:
      "Earn allowed for subscription payments in US/EU via online or in-app only. No in-store earn.",
    overrides: [
      {
        id: "STREAM_CHANNEL_BLOCK",
        description: "In-store channel is never eligible for StreamFlix.",
        when: (ctx) => ctx.channel === "In-store",
        effect: "block"
      },
      {
        id: "STREAM_COBRANDED_BOOST",
        description:
          "Co-branded card usage is highlighted but does not change eligibility in this simplified model.",
        when: (ctx) => ctx.flags.cobranded === true,
        effect: "note"
      }
    ]
  }
};

// DOM references

const regionEl = document.getElementById("region");
const partnerEl = document.getElementById("partner");
const tierEl = document.getElementById("tier");
const channelEl = document.getElementById("channel");

const flagPromoEl = document.getElementById("flag-promo");
const flagCobrandedEl = document.getElementById("flag-cobranded");
const flagCorporateEl = document.getElementById("flag-corporate");

const runBtn = document.getElementById("runBtn");
const loadExampleBtn = document.getElementById("load-example");
const calcStatusEl = document.getElementById("calc-status");

const summaryBadgeEl = document.getElementById("summary-badge");
const summaryTextEl = document.getElementById("summary-text");

const baseLineEl = document.getElementById("base-line");
const partnerLineEl = document.getElementById("partner-line");
const exceptionLineEl = document.getElementById("exception-line");

const rulePathEl = document.getElementById("rule-path");
const rawOutputEl = document.getElementById("raw-output");

// Helpers

function updateSummaryBadge(status, text) {
  summaryBadgeEl.classList.remove(
    "summary-badge-idle",
    "summary-badge-ok",
    "summary-badge-warn",
    "summary-badge-fail"
  );

  if (status === "eligible") {
    summaryBadgeEl.classList.add("summary-badge-ok");
  } else if (status === "conditional") {
    summaryBadgeEl.classList.add("summary-badge-warn");
  } else if (status === "blocked") {
    summaryBadgeEl.classList.add("summary-badge-fail");
  } else {
    summaryBadgeEl.classList.add("summary-badge-idle");
  }

  summaryBadgeEl.textContent =
    status === "eligible"
      ? "Eligible"
      : status === "conditional"
      ? "Conditional"
      : status === "blocked"
      ? "Blocked"
      : "No evaluation yet";

  if (text) {
    summaryTextEl.textContent = text;
  }
}

function formatFlags(flags) {
  const active = [];
  if (flags.promo) active.push("Promo active");
  if (flags.cobranded) active.push("Co-branded card");
  if (flags.corporate) active.push("Corporate booking");
  return active.length ? active.join(", ") : "None";
}

function evaluateRules(ctx) {
  const trace = [];
  const partner = partners[ctx.partner];

  if (!partner) {
    return {
      status: "blocked",
      baseExplanation:
        "No partner configuration was found. In a real system this would fall back to a safe default.",
      partnerExplanation: "Unknown partner — treated as ineligible.",
      exceptionExplanation: "No exception could be applied to an unknown partner.",
      trace: ["[ERROR] Partner configuration missing."],
      raw: { ctx }
    };
  }

  const regionMeta = regions[ctx.region];
  const regionLabel = regionMeta ? regionMeta.label : ctx.region;

  // 1) Base program eligibility (very simple here)
  let baseEligible = true;
  let baseReason = `Program is open for ${regionLabel} for all standard tiers.`;

  // Example of a global rule: JP in-store not enabled at all
  if (ctx.region === "JP" && ctx.channel === "In-store") {
    baseEligible = false;
    baseReason =
      "Base program is not enabled for in-store transactions in JP in this simplified model.";
  }

  trace.push(
    `[BASE] Region: ${ctx.region} (${regionLabel}), Tier: ${ctx.tier}, Channel: ${ctx.channel}`,
    `[BASE] Result: ${baseEligible ? "eligible" : "blocked"} — ${baseReason}`
  );

  if (!baseEligible) {
    return {
      status: "blocked",
      baseExplanation: baseReason,
      partnerExplanation:
        "Partner rules were not evaluated because the transaction failed base program eligibility.",
      exceptionExplanation: "No exception could override a base program block in this model.",
      trace,
      raw: { ctx, partner, baseEligible }
    };
  }

  // 2) Partner-level region & tier rules
  let partnerEligible = true;
  let partnerReason = `${partner.name} is active in ${regionLabel} for this tier.`;

  if (!partner.allowedRegions.includes(ctx.region)) {
    partnerEligible = false;
    partnerReason = `${partner.name} is not configured as an earning partner in ${regionLabel}.`;
  }

  if (partner.blockedRegions.includes(ctx.region)) {
    partnerEligible = false;
    partnerReason = `${partner.name} is explicitly blocked in ${regionLabel} by partner contract.`;
  }

  if (partner.blockedTiers.includes(ctx.tier)) {
    partnerEligible = false;
    partnerReason = `${partner.name} does not fund earn for ${ctx.tier} members in this configuration.`;
  }

  trace.push(
    `[PARTNER] Allowed regions: ${partner.allowedRegions.join(", ")}`,
    partner.blockedRegions.length
      ? `[PARTNER] Blocked regions: ${partner.blockedRegions.join(", ")}`
      : "[PARTNER] Blocked regions: none",
    partner.blockedTiers.length
      ? `[PARTNER] Blocked tiers: ${partner.blockedTiers.join(", ")}`
      : "[PARTNER] Blocked tiers: none",
    `[PARTNER] Result: ${partnerEligible ? "eligible" : "blocked"} — ${partnerReason}`
  );

  // 3) Override & exception layer
  let finalStatus = partnerEligible ? "eligible" : "blocked";
  let exceptionReason =
    "No overrides or exceptions were applied in this scenario.";
  const appliedOverrides = [];

  if (Array.isArray(partner.overrides) && partner.overrides.length > 0) {
    for (const rule of partner.overrides) {
      if (typeof rule.when === "function" && rule.when(ctx)) {
        appliedOverrides.push(rule);
        trace.push(`[OVERRIDE] Applied: ${rule.id} — ${rule.description}`);

        if (rule.effect === "block") {
          finalStatus = "blocked";
          exceptionReason = rule.description;
        } else if (rule.effect === "allow") {
          finalStatus = "eligible";
          exceptionReason = rule.description;
        } else if (rule.effect === "allow-conditional") {
          finalStatus = "conditional";
          exceptionReason = rule.description;
        } else if (rule.effect === "note") {
          // note-only effect, status unchanged
          if (finalStatus === "eligible") {
            exceptionReason = rule.description;
          }
        }
      }
    }
  } else {
    trace.push("[OVERRIDE] No partner overrides configured.");
  }

  if (appliedOverrides.length === 0) {
    trace.push("[OVERRIDE] No overrides fired for this scenario.");
  }

  // Sprinkle in flags for readability
  trace.push(
    "",
    `[CONTEXT] Flags: ${formatFlags(ctx.flags)}`
  );

  const baseExplanation = baseReason;
  const partnerExplanation = partnerReason;

  if (finalStatus === "eligible" && appliedOverrides.length === 0 && partnerEligible) {
    exceptionReason =
      "No exceptions or overrides were needed. Eligibility follows the base partner configuration.";
  } else if (finalStatus === "blocked" && !appliedOverrides.length && !partnerEligible) {
    exceptionReason =
      "The partner-level configuration alone is sufficient to block this transaction.";
  }

  return {
    status: finalStatus,
    baseExplanation,
    partnerExplanation,
    exceptionExplanation: exceptionReason,
    trace,
    raw: {
      ctx,
      partner: {
        id: partner.id,
        name: partner.name,
        allowedRegions: partner.allowedRegions,
        blockedRegions: partner.blockedRegions,
        blockedTiers: partner.blockedTiers
      },
      appliedOverrides: appliedOverrides.map((r) => ({
        id: r.id,
        effect: r.effect,
        description: r.description
      }))
    }
  };
}

// UI glue

function runRuleTest() {
  const ctx = {
    region: regionEl.value,
    partner: partnerEl.value,
    tier: tierEl.value,
    channel: channelEl.value,
    flags: {
      promo: flagPromoEl.checked,
      cobranded: flagCobrandedEl.checked,
      corporate: flagCorporateEl.checked
    }
  };

  calcStatusEl.textContent = "";

  const result = evaluateRules(ctx);

  // Summary badge + text
  let summaryText = "";

  if (result.status === "eligible") {
    summaryText = `This scenario is eligible. ${ctx.partner} can earn in this configuration based on the partner rules and any applicable overrides.`;
  } else if (result.status === "conditional") {
    summaryText =
      "This scenario is conditionally eligible — an override is granting earn where the default configuration would not.";
  } else if (result.status === "blocked") {
    summaryText =
      "This scenario is blocked. Either base program, partner configuration, or a specific override prevented earn.";
  } else {
    summaryText = "No evaluation has been run yet.";
  }

  updateSummaryBadge(result.status, summaryText);

  // Cards
  baseLineEl.innerHTML = result.baseExplanation;
  partnerLineEl.innerHTML = result.partnerExplanation;
  exceptionLineEl.innerHTML = result.exceptionExplanation;

  // Rule path
  rulePathEl.textContent = result.trace.join("\n");

  // Raw output (compact)
  rawOutputEl.textContent = JSON.stringify(result.raw, null, 2);
}

function loadExampleScenario() {
  // Example: EU, AeroAir, Member, Online, promo active
  regionEl.value = "EU";
  partnerEl.value = "AERO";
  tierEl.value = "Member";
  channelEl.value = "Online";
  flagPromoEl.checked = true;
  flagCobrandedEl.checked = false;
  flagCorporateEl.checked = false;

  calcStatusEl.textContent =
    "Example scenario loaded — Member in EU with AeroAir during a promo. Click “Run Rule Test”.";
}

// Wire up events
runBtn.addEventListener("click", runRuleTest);
loadExampleBtn.addEventListener("click", loadExampleScenario);

// Optional: auto-load and run example once on first page load
loadExampleScenario();
runRuleTest();
