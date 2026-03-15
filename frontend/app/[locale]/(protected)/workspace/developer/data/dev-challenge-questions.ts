export interface DevChallengeQuestion {
  id: string;
  question: string;
  code?: string;
  options: [string, string, string];
  correctIndex: number;
}

export const DEV_CHALLENGE_QUESTIONS: DevChallengeQuestion[] = [
  {
    id: "q1",
    question: "What does this code return?",
    code: "const arr = [1, 2, 3]; arr.map(x => x * 2)",
    options: ["[2, 4, 6]", "[1, 2, 3]", "undefined"],
    correctIndex: 0,
  },
  {
    id: "q2",
    question: "What is the value of x?",
    code: "const x = typeof null;",
    options: ["'object'", "'null'", "'undefined'"],
    correctIndex: 0,
  },
  {
    id: "q3",
    question: "What does this expression evaluate to?",
    code: "[] + []",
    options: ["''", "[]", "'[]'"],
    correctIndex: 0,
  },
  {
    id: "q4",
    question: "What does Array.from('hello') return?",
    options: ["['h','e','l','l','o']", "'hello'", "[]"],
    correctIndex: 0,
  },
  {
    id: "q5",
    question: "What is the result of 0.1 + 0.2 === 0.3 in JavaScript?",
    options: ["false", "true", "undefined"],
    correctIndex: 0,
  },
];
