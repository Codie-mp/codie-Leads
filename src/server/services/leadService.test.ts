import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rows: [] as Array<{ name: unknown; website: unknown }>,
}));

vi.mock("../../db/index.js", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve(mocks.rows)),
      })),
    })),
  },
}));

import { LeadService, normalizeDomain, normalizeName } from "./leadService";

describe("lead identifier normalization", () => {
  it("normalizes names consistently and safely handles nullish values", () => {
    expect(normalizeName("  ACME  ")).toBe("acme");
    expect(normalizeName(null)).toBe("");
    expect(normalizeName(undefined)).toBe("");
    expect(normalizeName(42)).toBe("42");
  });

  it.each([
    ["https://www.Example.com/path", "example.com"],
    ["http://example.com", "example.com"],
    ["WWW.Example.com/", "example.com"],
    ["example.com", "example.com"],
    ["", ""],
    ["not a domain", "not a domain"],
  ])("normalizes domain %s to %s", (input, expected) => {
    expect(normalizeDomain(input)).toBe(expected);
  });
});

describe("LeadService.getExistingLeadIdentifiers", () => {
  beforeEach(() => {
    mocks.rows = [
      { name: " Acme ", website: "https://www.acme.com/about" },
      { name: "ACME", website: "acme.com" },
      { name: "Beta", website: "http://www.beta.io/" },
      { name: null, website: null },
    ];
  });

  it("returns unique normalized names and domains", async () => {
    await expect(LeadService.getExistingLeadIdentifiers("company-1")).resolves.toEqual({
      names: ["acme", "beta"],
      domains: ["acme.com", "beta.io"],
    });
  });

  it("keeps identifiers isolated to the company passed to the query", async () => {
    const result = await LeadService.getExistingLeadNames("company-2");
    expect(result).toEqual(["acme", "beta"]);
  });
});
