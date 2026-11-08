import { contrastRatio, relativeLuminance } from "./contrast";

describe("contrast", () => {
  it("matches the WCAG reference extremes", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5);
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
  });

  it("is 1:1 for identical colors and accepts upper case", () => {
    expect(contrastRatio("#B4532A", "#b4532a")).toBeCloseTo(1, 5);
  });

  it("matches a known mid-grey value", () => {
    // #767676 on white is the commonly cited lightest grey that passes AA (about 4.54:1).
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
  });

  it("rejects colors that are not #rrggbb", () => {
    expect(() => relativeLuminance("#fff")).toThrow("Expected a #rrggbb color");
    expect(() => relativeLuminance("red")).toThrow();
  });
});
