import AITutorDock from "./AITutorDock";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { tutorApi } from "@/api/tutor.api";

vi.mock("@/api/tutor.api", () => ({
  tutorApi: {
    askQuestion: vi.fn().mockResolvedValue({
      answer: "This is a mock tutor response.",
      citations: ["Lesson Content"],
    }),
  },
}));

describe("AITutorDock", () => {
  it("opens and displays the welcome message", () => {
    render(<AITutorDock />);

    fireEvent.click(screen.getByRole("button", { name: "Open AI Tutor" }));

    expect(
      screen.getByText(/Hi! I am your AI Tutor/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Your learning assistant")).toBeInTheDocument();
  });

  it("sends a question and displays the tutor response", async () => {
    render(<AITutorDock />);

    fireEvent.click(screen.getByRole("button", { name: "Open AI Tutor" }));

    fireEvent.change(screen.getByRole("textbox", { name: "Ask your tutor" }), {
      target: { value: "What is this lesson about?" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByText("This is a mock tutor response."))
      .toBeInTheDocument();
      expect(screen.getAllByText("Sources")).toHaveLength(2);

expect(screen.getAllByText(/Lesson Content/)).toHaveLength(2);

    expect(tutorApi.askQuestion).toHaveBeenCalledWith(
      "What is this lesson about?"
    );
  });
});
