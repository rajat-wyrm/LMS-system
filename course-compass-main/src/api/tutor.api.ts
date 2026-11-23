export const tutorApi = {
  async askQuestion(question: string) {
    return Promise.resolve({
      answer: `Mock response for: ${question}`,
      citations: ["Lesson Content"],
    });
  },
};
