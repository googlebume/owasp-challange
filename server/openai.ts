import OpenAI from "openai";
import { levels, type Difficulty } from "@shared/schema";

import dotenv from 'dotenv'
dotenv.config()

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface HintGenerationParams {
  levelId: number;
  difficulty: Difficulty;
  hintNumber: number;
  playerAttempts?: string[];
}

export async function generateHint(params: HintGenerationParams): Promise<string> {
  const { levelId, difficulty, hintNumber, playerAttempts = [] } = params;
  
  const level = levels.find(l => l.id === levelId);
  if (!level) {
    throw new Error(`Level ${levelId} not found`);
  }

  const difficultyContext = {
    easy: "Provide a clear, helpful hint that guides the player towards the solution without giving it away directly.",
    medium: "Provide a moderate hint that points in the right direction but requires some thinking.",
    hard: "Provide a subtle hint that requires significant deduction to understand.",
  };

  const hintProgression = {
    1: "First hint: Give a general direction or concept to explore.",
    2: "Second hint: Be more specific about the attack vector or technique.",
    3: "Third hint: Provide a strong clue that is close to the solution format.",
  };

  const attemptsContext = playerAttempts.length > 0 
    ? `\n\nThe player has already tried these inputs: ${playerAttempts.slice(-5).map(a => `"${a}"`).join(", ")}`
    : "";

  const prompt = `You are a cybersecurity training assistant for an educational game about OWASP vulnerabilities.

Current Level: ${level.name} (${level.nameUa})
Vulnerability Type: ${level.vulnerability}
Level Objective: ${level.objective}
Difficulty: ${difficulty}
Hint Number: ${hintNumber} of 3

The correct solution is: "${level.solution}"
DO NOT reveal the exact solution!

${difficultyContext[difficulty]}
${hintProgression[hintNumber as 1 | 2 | 3]}
${attemptsContext}

Generate a helpful hint in Ukrainian language that:
1. Does NOT reveal the exact answer
2. Helps the player understand the vulnerability concept
3. Guides them towards finding the solution themselves
4. Is encouraging and educational

Keep the hint concise (1-3 sentences). Response in Ukrainian only.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a cybersecurity education assistant. Always respond in Ukrainian. Be helpful but don't give away answers directly."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_completion_tokens: 200,
    });

    return response.choices[0].message.content || getDefaultHint(level, hintNumber);
  } catch (error) {
    console.error("OpenAI API error:", error);
    return getDefaultHint(level, hintNumber);
  }
}

function getDefaultHint(level: typeof levels[0], hintNumber: number): string {
  const defaultHints: Record<number, Record<number, string>> = {
    1: {
      1: "Зверніть увагу на параметри URL. Які з них можна змінити?",
      2: "Спробуйте додати параметр, який надасть вам адміністраторські права.",
      3: "Формат: параметр=значення. Яке значення означає 'true' для адміна?",
    },
    2: {
      1: "Base64 - це кодування, а не шифрування. Його легко декодувати.",
      2: "Використайте онлайн-декодер Base64 або команду 'atob' в браузері.",
      3: "Декодуйте 'c3VwZXJzZWNyZXQxMjM=' - це ваш пароль.",
    },
    3: {
      1: "Уважно перегляньте код. Чи всі функції роблять те, що очікується?",
      2: "Одна функція має назву, яка вказує на злочинні наміри...",
      3: "Шукайте функцію, пов'язану з 'credentials' або 'steal'.",
    },
    4: {
      1: "SQL-ін'єкція змінює логіку запиту. Що станеться, якщо умова завжди true?",
      2: "Використайте одинарні лапки та логічний оператор OR.",
      3: "Спробуйте: ' OR '1'='1 - це зробить умову завжди істинною.",
    },
    5: {
      1: "Обхід директорій (../) дозволяє вийти за межі поточної папки.",
      2: "Файл .env часто містить секрети. Де він зазвичай знаходиться?",
      3: "Спробуйте вказати шлях ../.env щоб піднятися на рівень вище.",
    },
    6: {
      1: "Шукайте відомі вразливості (CVE) для старих версій бібліотек.",
      2: "jQuery 1.6.1 має відому XSS вразливість. Знайдіть її CVE номер.",
      3: "Формат CVE: CVE-рік-номер. Ця вразливість з 2011 року.",
    },
    7: {
      1: "Багато систем постачаються з обліковими даними за замовчуванням.",
      2: "Типові дефолтні логіни: admin, root, user з простими паролями.",
      3: "Спробуйте admin:admin - найпоширеніша комбінація.",
    },
    8: {
      1: "Розробники часто залишають секрети прямо в коді.",
      2: "AWS ключі мають характерний формат: AKIA...",
      3: "Знайдіть рядок, що починається з 'AKIA' - це AWS access key.",
    },
    9: {
      1: "Brute force атака - це багато невдалих спроб з однієї IP.",
      2: "Знайдіть IP-адресу з найбільшою кількістю FAILED спроб.",
      3: "Перегляньте логи - одна IP робить тисячі спроб.",
    },
    10: {
      1: "Неправильна обробка винятків може розкрити інформацію.",
      2: "Що станеться, якщо передати неочікуване значення?",
      3: "Спробуйте передати 'undefined' - це може викликати помилку.",
    },
    11: {
      1: "Уважно прочитайте згенерований ШІ сценарій.",
      2: "Визначте тип вразливості на основі наданого коду або опису.",
      3: "Введіть команду або значення, яке експлуатує виявлену вразливість.",
    },
    12: {
      1: "Цей рівень потребує двох кроків. Почніть з першого.",
      2: "Після першого успішного кроку, вас чекає наступний виклик.",
      3: "Комбінуйте ваші знання з різних типів вразливостей.",
    },
  };

  return defaultHints[level.id]?.[hintNumber] || "Подумайте про основи вразливості та спробуйте ще раз.";
}

export interface AIChallenge {
  scenario: string;
  expectedAnswer: string;
  stepNumber?: number;
  totalSteps?: number;
}

export async function generateAIChallenge(difficulty: Difficulty, stepNumber: number = 1, totalSteps: number = 1): Promise<AIChallenge> {
  const difficultyContext = {
    easy: "Generate a simple, educational security challenge suitable for beginners.",
    medium: "Generate a moderate security challenge that requires some knowledge.",
    hard: "Generate a complex security challenge that requires advanced knowledge.",
  };

  const vulnerabilityTypes = [
    "SQL Injection",
    "Cross-Site Scripting (XSS)",
    "Command Injection",
    "Path Traversal",
    "IDOR (Insecure Direct Object Reference)",
    "Authentication Bypass",
    "Sensitive Data Exposure",
    "Broken Access Control"
  ];

  const randomVuln = vulnerabilityTypes[Math.floor(Math.random() * vulnerabilityTypes.length)];

  const prompt = `You are a cybersecurity training assistant creating an educational security challenge.

Difficulty: ${difficulty}
Challenge Type: ${randomVuln}
Step: ${stepNumber} of ${totalSteps}

${difficultyContext[difficulty]}

Create a security challenge scenario in Ukrainian language that:
1. Shows a realistic code snippet or system description with a vulnerability
2. Has a clear, specific answer (a command, payload, or value)
3. Is educational and teaches about ${randomVuln}
4. The answer should be concise (1-50 characters)

Respond in JSON format:
{
  "scenario": "The full scenario description with code in Ukrainian",
  "expectedAnswer": "The exact answer the player needs to enter"
}

IMPORTANT: 
- The scenario should be detailed (100-300 words)
- Include actual code snippets where appropriate
- The expectedAnswer must be a specific, verifiable string
- Make sure the challenge is solvable based on the information provided`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a cybersecurity education assistant. Create challenges in Ukrainian. Respond only with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_completion_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return getDefaultAIChallenge(difficulty, stepNumber);
    }

    const parsed = JSON.parse(content);
    return {
      scenario: parsed.scenario,
      expectedAnswer: parsed.expectedAnswer,
      stepNumber,
      totalSteps
    };
  } catch (error) {
    console.error("OpenAI AI Challenge generation error:", error);
    return getDefaultAIChallenge(difficulty, stepNumber);
  }
}

function getDefaultAIChallenge(difficulty: Difficulty, stepNumber: number): AIChallenge {
  const challenges: AIChallenge[] = [
    {
      scenario: `╔══════════════════════════════════════╗
║      СИСТЕМА АУТЕНТИФІКАЦІЇ          ║
╚══════════════════════════════════════╝

Ви знайшли форму входу на сайті. Проаналізуйте наступний код:

\`\`\`php
$query = "SELECT * FROM users WHERE 
  username = '" . $_POST['user'] . "' 
  AND password = '" . $_POST['pass'] . "'";
\`\`\`

Введіть payload для обходу аутентифікації:`,
      expectedAnswer: "' OR '1'='1",
      stepNumber
    },
    {
      scenario: `╔══════════════════════════════════════╗
║      ФАЙЛОВИЙ МЕНЕДЖЕР               ║
╚══════════════════════════════════════╝

Веб-додаток дозволяє завантажувати файли за шляхом:
/api/files?path=/uploads/documents/

Код обробника:
\`\`\`javascript
app.get('/api/files', (req, res) => {
  const filePath = '/var/www/uploads/' + req.query.path;
  res.sendFile(filePath);
});
\`\`\`

Отримайте доступ до /etc/passwd:`,
      expectedAnswer: "../../../etc/passwd",
      stepNumber
    },
    {
      scenario: `╔══════════════════════════════════════╗
║      ПАНЕЛЬ АДМІНІСТРАТОРА           ║
╚══════════════════════════════════════╝

API endpoint повертає дані користувача:
GET /api/users/profile?id=123

Ви авторизовані як користувач з id=123.
Адміністратор має id=1.

Отримайте дані адміністратора, змінивши запит:`,
      expectedAnswer: "id=1",
      stepNumber
    }
  ];

  return challenges[Math.floor(Math.random() * challenges.length)];
}

export async function verifyAIAnswer(challenge: AIChallenge, playerAnswer: string): Promise<{isCorrect: boolean; feedback: string}> {
  const prompt = `You are a cybersecurity training assistant verifying a player's answer.

Challenge scenario:
${challenge.scenario}

Expected answer: "${challenge.expectedAnswer}"
Player's answer: "${playerAnswer}"

Determine if the player's answer is correct or equivalent to the expected answer.
Consider variations that achieve the same goal (e.g., different SQL injection payloads that work).

Respond in JSON format:
{
  "isCorrect": true/false,
  "feedback": "Brief feedback in Ukrainian (1-2 sentences)"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a cybersecurity education assistant. Verify answers and provide feedback in Ukrainian. Respond only with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_completion_tokens: 200,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return simpleVerify(challenge.expectedAnswer, playerAnswer);
    }

    const parsed = JSON.parse(content);
    return {
      isCorrect: parsed.isCorrect,
      feedback: parsed.feedback
    };
  } catch (error) {
    console.error("OpenAI verification error:", error);
    return simpleVerify(challenge.expectedAnswer, playerAnswer);
  }
}

function simpleVerify(expected: string, answer: string): {isCorrect: boolean; feedback: string} {
  const isCorrect = answer.toLowerCase().trim() === expected.toLowerCase().trim() ||
                    answer.toLowerCase().includes(expected.toLowerCase());
  return {
    isCorrect,
    feedback: isCorrect 
      ? "Правильно! Ви успішно ідентифікували вразливість." 
      : "Неправильно. Спробуйте ще раз, уважно проаналізуйте сценарій."
  };
}
