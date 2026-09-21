import { describe, it, expect } from "vitest";
import { getXLSX } from "../utils/excel";

describe("excel utility (getXLSX)", () => {
  it("lazily imports and returns the XLSX module", async () => {
    const XLSX = await getXLSX();
    expect(XLSX).toBeDefined();
    expect(typeof XLSX.read).toBe("function");
    expect(typeof XLSX.utils.json_to_sheet).toBe("function");
    expect(typeof XLSX.utils.book_new).toBe("function");
    expect(typeof XLSX.utils.sheet_to_json).toBe("function");
  });

  it("can create a worksheet from json and read it back", async () => {
    const XLSX = await getXLSX();
    const sampleData = [
      { id: 1, name: "Customer A", city: "Riyadh" },
      { id: 2, name: "Customer B", city: "Jeddah" },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    expect(ws).toBeDefined();

    const parsed = XLSX.utils.sheet_to_json(ws);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toMatchObject({
      id: 1,
      name: "Customer A",
      city: "Riyadh",
    });
  });
});
