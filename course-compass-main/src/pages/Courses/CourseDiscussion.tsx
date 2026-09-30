import { useState } from "react";
import { MessageCircle, Send, Search, Trash2, CheckCircle2 } from "lucide-react";

type Reply = {
  id: number;
  name: string;
  role: string;
  text: string;
  date: string;
  accepted?: boolean;
};

type Question = {
  id: number;
  title: string;
  description: string;
  name: string;
  date: string;
  replies: Reply[];
};

const CourseDiscussion = () => {
  const [search, setSearch] = useState("");
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionDescription, setQuestionDescription] = useState("");
  const [replyText, setReplyText] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      title: "How can I understand this course better?",
      description:
        "I am having difficulty understanding some of the topics. Can someone explain them?",
      name: "Student",
      date: new Date().toLocaleDateString(),
      replies: [
        {
          id: 1,
          name: "Instructor",
          role: "Instructor",
          text: "Try going through the lessons one by one and practice the examples.",
          date: new Date().toLocaleDateString(),
          accepted: true,
        },
      ],
    },
  ]);

  const addQuestion = () => {
    if (!questionTitle.trim() || !questionDescription.trim()) return;

    const newQuestion: Question = {
      id: Date.now(),
      title: questionTitle,
      description: questionDescription,
      name: "Student",
      date: new Date().toLocaleDateString(),
      replies: [],
    };

    setQuestions((prev) => [newQuestion, ...prev]);
    setQuestionTitle("");
    setQuestionDescription("");
  };

  const addReply = () => {
    if (!replyText.trim() || selectedQuestion === null) return;

    setQuestions((prev) =>
      prev.map((question) =>
        question.id === selectedQuestion
          ? {
              ...question,
              replies: [
                ...question.replies,
                {
                  id: Date.now(),
                  name: "Student",
                  role: "Student",
                  text: replyText,
                  date: new Date().toLocaleDateString(),
                },
              ],
            }
          : question
      )
    );

    setReplyText("");
  };

  const deleteQuestion = (id: number) => {
    setQuestions((prev) => prev.filter((question) => question.id !== id));

    if (selectedQuestion === id) {
      setSelectedQuestion(null);
    }
  };

  const acceptAnswer = (questionId: number, replyId: number) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? {
              ...question,
              replies: question.replies.map((reply) => ({
                ...reply,
                accepted: reply.id === replyId,
              })),
            }
          : question
      )
    );
  };

  const filteredQuestions = questions.filter(
    (question) =>
      question.title.toLowerCase().includes(search.toLowerCase()) ||
      question.description.toLowerCase().includes(search.toLowerCase())
  );

  const selected = questions.find(
    (question) => question.id === selectedQuestion
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="w-7 h-7 text-primary" />
          <h2 className="text-2xl font-display font-bold">
            Course Discussion
          </h2>
        </div>

        <p className="text-muted-foreground">
          Ask questions, share ideas and discuss this course with other
          learners and instructors.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Total Questions</p>
          <p className="text-2xl font-bold mt-1">{questions.length}</p>
        </div>

        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Total Replies</p>
          <p className="text-2xl font-bold mt-1">
            {questions.reduce(
              (total, question) => total + question.replies.length,
              0
            )}
          </p>
        </div>

        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Unanswered</p>
          <p className="text-2xl font-bold mt-1">
            {questions.filter((question) => question.replies.length === 0)
              .length}
          </p>
        </div>
      </div>

      {/* Ask Question */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold text-lg mb-4">
          Ask a Question
        </h3>

        <div className="space-y-4">
          <input
            value={questionTitle}
            onChange={(e) => setQuestionTitle(e.target.value)}
            placeholder="Question title"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary"
          />

          <textarea
            value={questionDescription}
            onChange={(e) => setQuestionDescription(e.target.value)}
            placeholder="Describe your question..."
            rows={4}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary"
          />

          <button
            onClick={addQuestion}
            className="btn-primary flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Post Question
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions..."
          className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-3 outline-none focus:border-primary"
        />
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No questions found.
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="glass-card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => setSelectedQuestion(question.id)}
                >
                  <h3 className="font-semibold text-lg">
                    {question.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mt-2">
                    {question.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-4">
                    <span>Asked by {question.name}</span>
                    <span>{question.date}</span>
                    <span>
                      {question.replies.length}{" "}
                      {question.replies.length === 1 ? "reply" : "replies"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteQuestion(question.id)}
                  className="text-destructive hover:bg-destructive/10 p-2 rounded-lg"
                  title="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Replies */}
              {selectedQuestion === question.id && (
                <div className="mt-6 border-t border-border pt-5">
                  <h4 className="font-semibold mb-4">
                    Discussion
                  </h4>

                  <div className="space-y-3">
                    {question.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="rounded-lg border border-border p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <span className="font-medium">
                              {reply.name}
                            </span>

                            <span className="text-xs text-muted-foreground ml-2">
                              {reply.role}
                            </span>
                          </div>

                          {reply.accepted && (
                            <span className="flex items-center gap-1 text-xs text-green-500">
                              <CheckCircle2 className="w-4 h-4" />
                              Accepted Answer
                            </span>
                          )}
                        </div>

                        <p className="text-sm mt-2">
                          {reply.text}
                        </p>

                        <p className="text-xs text-muted-foreground mt-2">
                          {reply.date}
                        </p>

                        {!reply.accepted && (
                          <button
                            onClick={() =>
                              acceptAnswer(question.id, reply.id)
                            }
                            className="text-xs text-primary mt-3 hover:underline"
                          >
                            Mark as Accepted Answer
                          </button>
                        )}
                      </div>
                    ))}

                    {question.replies.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No replies yet.
                      </p>
                    )}
                  </div>

                  {/* Reply box */}
                  <div className="flex gap-2 mt-5">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary"
                    />

                    <button
                      onClick={addReply}
                      className="btn-primary px-4 flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseDiscussion;
