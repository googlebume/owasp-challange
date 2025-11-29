import OpenAI from "openai";
import { levels, type Difficulty } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
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
  };

  return defaultHints[level.id]?.[hintNumber] || "Подумайте про основи вразливості та спробуйте ще раз.";
}
