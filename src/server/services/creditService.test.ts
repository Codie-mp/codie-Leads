import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  executeResults: [] as unknown[],
  balances: [] as Array<{ balance: number | null }>,
  execute: vi.fn(),
}));

vi.mock("../../db/index.js", () => ({
  db: {
    execute: mocks.execute,
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve(mocks.balances)),
      })),
    })),
  },
}));

import { CreditService } from "./creditService";

describe("CreditService", () => {
  beforeEach(() => {
    mocks.execute.mockReset();
    mocks.execute.mockImplementation(async () => mocks.executeResults.shift());
    mocks.executeResults = [];
    mocks.balances = [];
  });

  it("does not issue database writes for zero or negative charges and grants", async () => {
    await CreditService.chargeCredits("c1", 0);
    await CreditService.chargeCredits("c1", -5);
    await CreditService.grantCredits("c1", 0);
    await CreditService.grantCredits("c1", -5);
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it("charges credits when the guarded update affects a row and records a transaction", async () => {
    mocks.executeResults = [[{ affectedRows: 1 }, []], [{ affectedRows: 1 }, []]];

    await expect(CreditService.chargeCredits("c1", 10, "Search", "u1")).resolves.toBeUndefined();
    expect(mocks.execute).toHaveBeenCalledTimes(2);
  });

  it("rejects insufficient credits and does not write a transaction", async () => {
    mocks.executeResults = [[{ affectedRows: 0 }, []]];

    await expect(CreditService.chargeCredits("c1", 10)).rejects.toThrow("Insufficient credits");
    expect(mocks.execute).toHaveBeenCalledOnce();
  });

  it("grants credits and records the actor and reason", async () => {
    mocks.executeResults = [[{ affectedRows: 1 }, []], [{ affectedRows: 1 }, []]];

    await CreditService.grantCredits("c1", 25, "Manual adjustment", "admin-1");
    expect(mocks.execute).toHaveBeenCalledTimes(2);
  });

  it("returns a zero balance when the stored balance is nullish and rejects unknown companies", async () => {
    mocks.balances = [{ balance: null }];
    await expect(CreditService.getBalance("c1")).resolves.toBe(0);

    mocks.balances = [];
    await expect(CreditService.getBalance("missing")).rejects.toThrow("Company not found");
  });

  it("returns the database history result", async () => {
    const history = [{ amount: -10, type: "consume" }];
    mocks.executeResults = [[history, []]];
    await expect(CreditService.getHistory("c1", 25)).resolves.toEqual(history);
    expect(mocks.execute).toHaveBeenCalledOnce();
  });
});
