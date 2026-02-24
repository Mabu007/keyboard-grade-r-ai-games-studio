export interface MathProblem {
  question: string;
  answer: number;
  options: number[]; // 4 options
}

export const generateProblem = (): MathProblem => {
  const ops = ['+', '-'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = Math.floor(Math.random() * 10) + 1;
  let b = Math.floor(Math.random() * 10) + 1;
  
  // Ensure non-negative result for subtraction
  if (op === '-' && a < b) {
    [a, b] = [b, a];
  }

  const answer = op === '+' ? a + b : a - b;
  
  // Generate 3 wrong answers unique from answer
  const options = new Set<number>();
  options.add(answer);
  while(options.size < 4) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const wrong = Math.max(0, answer + offset);
    if (wrong !== answer) options.add(wrong);
  }
  
  // Convert to array and shuffle
  const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);

  return {
    question: `${a} ${op} ${b} = ?`,
    answer,
    options: shuffledOptions
  };
};