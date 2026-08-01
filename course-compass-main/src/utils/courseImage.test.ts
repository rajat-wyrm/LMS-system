import { describe, expect, it } from "vitest";
import { COURSE_PLACEHOLDER, getCourseImageUrl } from "./courseImage";

describe("getCourseImageUrl", () => {
  it("returns the shared placeholder when no thumbnail is provided", () => {
    expect(getCourseImageUrl(undefined)).toBe(COURSE_PLACEHOLDER);
    expect(getCourseImageUrl("   ")).toBe(COURSE_PLACEHOLDER);
  });

  it("returns the provided thumbnail when it is a non-empty string", () => {
    expect(getCourseImageUrl("https://example.com/course.jpg")).toBe("https://example.com/course.jpg");
  });
});
