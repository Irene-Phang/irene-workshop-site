const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadWorkshopFunctions() {
  const source = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");
  const context = {
    Date,
    Intl,
    console,
    document: {
      addEventListener() {}
    }
  };

  vm.createContext(context);
  vm.runInContext(source, context);
  return context;
}

function loadSiteData() {
  const source = fs.readFileSync(path.join(__dirname, "..", "data.js"), "utf8");
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${source}\nthis.__siteData = siteData;`, context);
  return context.__siteData;
}

const workshop = {
  earlyBirdPrice: 99,
  regularPrice: 119,
  earlyBirdDeadline: "2026-09-13"
};

test("13 September still uses the early-bird price and shows the regular price", () => {
  const { getWorkshopPriceState } = loadWorkshopFunctions();
  const result = getWorkshopPriceState(workshop, "2026-09-13");

  assert.equal(result.currentPrice, 99);
  assert.equal(result.isEarlyBird, true);
  assert.equal(result.mainLabel, "早鸟优惠");
  assert.equal(result.mainPrice, "RM99");
  assert.equal(result.deadlineLabel, "13/9/2026 前报名");
  assert.equal(result.regularLabel, "课程正价");
  assert.equal(result.regularPrice, "RM119");
});

test("14 September switches to RM119 and removes all early-bird display", () => {
  const { getWorkshopPriceState } = loadWorkshopFunctions();
  const result = getWorkshopPriceState(workshop, "2026-09-14");

  assert.equal(result.currentPrice, 119);
  assert.equal(result.isEarlyBird, false);
  assert.equal(result.mainLabel, "报名费");
  assert.equal(result.mainPrice, "RM119");
  assert.equal(result.deadlineLabel, "");
  assert.equal(result.regularLabel, "");
  assert.equal(result.regularPrice, "");
});

test("AI exam workshop uses the rescheduled date and changes price after 20 September", () => {
  const { getWorkshopPriceState } = loadWorkshopFunctions();
  const data = loadSiteData();
  const current = data.workshops.find((item) => item.slug === "ai-exam-language");

  assert.equal(current.date, "2026-09-26");
  assert.equal(current.dateLabel, "26 September 2026");
  assert.equal(current.time, "7:30 PM – 9:30 PM");
  assert.equal(getWorkshopPriceState(current, "2026-09-20").currentPrice, 99);
  assert.equal(getWorkshopPriceState(current, "2026-09-20").deadlineLabel, "20/9/2026 前报名");
  assert.equal(getWorkshopPriceState(current, "2026-09-21").currentPrice, 119);
});

test("Malaysia date changes at Kuala Lumpur midnight", () => {
  const { getMalaysiaDateKey } = loadWorkshopFunctions();

  assert.equal(getMalaysiaDateKey(new Date("2026-09-13T15:59:59Z")), "2026-09-13");
  assert.equal(getMalaysiaDateKey(new Date("2026-09-13T16:00:00Z")), "2026-09-14");
});

test("featured workshop is selected from the centralized workshop list", () => {
  const { getFeaturedWorkshop } = loadWorkshopFunctions();
  const data = {
    featuredWorkshopId: "ai-exam-language",
    workshops: [
      { id: "ai-writing-2" },
      { id: "ai-exam-language" }
    ]
  };

  assert.equal(getFeaturedWorkshop(data).id, "ai-exam-language");
});

test("detail page selects the workshop requested by slug", () => {
  const { getWorkshopBySlug } = loadWorkshopFunctions();
  const data = {
    featuredWorkshopId: "ai-exam-language",
    workshops: [
      { id: "ai-writing-2", slug: "ai-writing-workshop-2" },
      { id: "ai-exam-language", slug: "ai-exam-language" }
    ]
  };

  assert.equal(getWorkshopBySlug(data, "ai-writing-workshop-2").id, "ai-writing-2");
  assert.equal(getWorkshopBySlug(data, "missing").id, "ai-exam-language");
});
