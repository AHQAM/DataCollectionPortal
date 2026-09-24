import { describe, it, expect } from "vitest";
import i18n from "../i18n";

describe("i18n Internationalization Subsystem", () => {
  it("initializes with Arabic as the default language", () => {
    expect(i18n.language).toBe("ar");
  });

  it("resolves Arabic translation keys correctly", async () => {
    await i18n.changeLanguage("ar");
    expect(i18n.t("common.appTitle")).toBe("بوابة جمع البيانات الميدانية");
    expect(i18n.t("nav.dashboard")).toBe("لوحة القيادة");
    expect(i18n.t("auth.login")).toBe("تسجيل الدخول");
    expect(i18n.t("status.completed")).toBe("مكتمل");
    expect(i18n.t("roles.admin")).toBe("مدير النظام");
  });

  it("switches to English and resolves English translation keys correctly", async () => {
    await i18n.changeLanguage("en");
    expect(i18n.language).toBe("en");
    expect(i18n.t("common.appTitle")).toBe("Field Data Collection Portal");
    expect(i18n.t("nav.dashboard")).toBe("Dashboard");
    expect(i18n.t("auth.login")).toBe("Sign In");
    expect(i18n.t("status.completed")).toBe("Completed");
    expect(i18n.t("roles.admin")).toBe("System Administrator");

    // Reset back to Arabic
    await i18n.changeLanguage("ar");
  });

  it("contains symmetrical key definitions between Arabic and English dictionaries", () => {
    const arBundle = i18n.getResourceBundle("ar", "translation");
    const enBundle = i18n.getResourceBundle("en", "translation");

    expect(Object.keys(arBundle)).toEqual(Object.keys(enBundle));
    for (const section of Object.keys(arBundle)) {
      expect(Object.keys(arBundle[section])).toEqual(
        Object.keys(enBundle[section]),
      );
    }
  });
});
