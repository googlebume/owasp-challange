import { z } from "zod";

export type Difficulty = "easy" | "medium" | "hard";

export const difficultyConfig = {
  easy: { hintDelay: 30, timeLimit: null, multiplier: 1 },
  medium: { hintDelay: 60, timeLimit: null, multiplier: 2 },
  hard: { hintDelay: 120, timeLimit: 300, multiplier: 3 },
} as const;

export interface Level {
  id: number;
  name: string;
  nameUa: string;
  description: string;
  descriptionUa: string;
  vulnerability: string;
  category: string;
  basePoints: number;
  simulationType: string;
  objective: string;
  objectiveUa: string;
  solution: string;
  explanation: {
    what: string;
    whatUa: string;
    how: string;
    howUa: string;
    defense: string;
    defenseUa: string;
  };
}

export interface PlayerProgress {
  odexId: string
  odevelId: number;
  difficulty: Difficulty;
  completed: boolean;
  score: number;
  timeSpent: number;
  hintsUsed: number;
  completedAt?: string;
}

export interface Player {
  id: string;
  nickname: string;
  totalScore: number;
  levelsCompleted: number;
  achievements: string[];
  progress: Record<string, PlayerProgress>;
}

export interface GameState {
  currentLevel: number | null;
  difficulty: Difficulty;
  timeRemaining: number | null;
  hintTimeRemaining: number;
  hintsRevealed: number;
  isPlaying: boolean;
  isPaused: boolean;
  playerInput: string;
  exploitAttempted: boolean;
  exploitSuccess: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  nameUa: string;
  description: string;
  descriptionUa: string;
  icon: string;
  condition: string;
}

export const insertPlayerSchema = z.object({
  nickname: z.string().min(2).max(20),
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export const submitExploitSchema = z.object({
  levelId: z.number(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  input: z.string(),
  timeSpent: z.number(),
  hintsUsed: z.number(),
});

export type SubmitExploit = z.infer<typeof submitExploitSchema>;

export const hintRequestSchema = z.object({
  levelId: z.number(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  hintNumber: z.number().min(1).max(3),
  playerAttempts: z.array(z.string()).optional(),
});

export type HintRequest = z.infer<typeof hintRequestSchema>;

export const levels: Level[] = [
  {
    id: 1,
    name: "Broken Access Control",
    nameUa: "Порушений контроль доступу",
    description: "Access admin panel by exploiting insufficient access controls",
    descriptionUa: "Отримайте доступ до адмін-панелі, експлуатуючи недостатній контроль доступу",
    vulnerability: "BAC",
    category: "Authorization",
    basePoints: 100,
    simulationType: "url-manipulation",
    objective: "Access the admin dashboard by manipulating the URL parameters",
    objectiveUa: "Отримайте доступ до адмін-панелі, маніпулюючи параметрами URL",
    solution: "admin=true",
    explanation: {
      what: "Broken Access Control occurs when users can access resources or perform actions beyond their intended permissions. This is the #1 vulnerability in OWASP Top 10 2025.",
      whatUa: "Порушений контроль доступу виникає, коли користувачі можуть отримати доступ до ресурсів або виконувати дії поза їхніми дозволеними правами. Це вразливість №1 у OWASP Top 10 2025.",
      how: "By adding ?admin=true to the URL, you bypassed the access control check. The server trusted client-side parameters without proper validation.",
      howUa: "Додавши ?admin=true до URL, ви обійшли перевірку контролю доступу. Сервер довіряв клієнтським параметрам без належної валідації.",
      defense: "Implement server-side access control checks, use role-based access control (RBAC), deny access by default, and never trust client-side parameters.",
      defenseUa: "Реалізуйте серверну перевірку контролю доступу, використовуйте рольовий контроль доступу (RBAC), забороняйте доступ за замовчуванням і ніколи не довіряйте клієнтським параметрам."
    }
  },
  {
    id: 2,
    name: "Cryptographic Failures",
    nameUa: "Криптографічні помилки",
    description: "Decrypt sensitive data using weak encryption",
    descriptionUa: "Розшифруйте чутливі дані, використовуючи слабке шифрування",
    vulnerability: "Crypto",
    category: "Cryptography",
    basePoints: 120,
    simulationType: "crypto-attack",
    objective: "Decode the Base64 encoded password to access the secret vault",
    objectiveUa: "Декодуйте пароль у Base64, щоб отримати доступ до секретного сховища",
    solution: "supersecret123",
    explanation: {
      what: "Cryptographic Failures involve using weak, outdated, or improperly implemented cryptography. Base64 is encoding, NOT encryption!",
      whatUa: "Криптографічні помилки включають використання слабкої, застарілої або неправильно реалізованої криптографії. Base64 - це кодування, НЕ шифрування!",
      how: "The password was 'encrypted' using Base64 encoding, which is easily reversible. You decoded c3VwZXJzZWNyZXQxMjM= to get the plaintext password.",
      howUa: "Пароль був 'зашифрований' за допомогою кодування Base64, яке легко обернути. Ви декодували c3VwZXJzZWNyZXQxMjM=, щоб отримати відкритий пароль.",
      defense: "Use strong encryption algorithms (AES-256, RSA-2048+), never use encoding as encryption, implement proper key management, and use TLS for data in transit.",
      defenseUa: "Використовуйте сильні алгоритми шифрування (AES-256, RSA-2048+), ніколи не використовуйте кодування як шифрування, реалізуйте належне управління ключами та використовуйте TLS для даних у передачі."
    }
  },
  {
    id: 3,
    name: "Software Supply Chain Failures",
    nameUa: "Проблеми з ланцюгом постачання ПЗ",
    description: "Identify malicious code in a third-party dependency",
    descriptionUa: "Знайдіть шкідливий код у сторонній залежності",
    vulnerability: "Supply Chain",
    category: "Dependencies",
    basePoints: 140,
    simulationType: "code-review",
    objective: "Find the malicious function name hidden in the npm package code",
    objectiveUa: "Знайдіть назву шкідливої функції, прихованої в коді npm-пакета",
    solution: "stealCredentials",
    explanation: {
      what: "Supply Chain attacks occur when malicious code is injected into trusted software components, libraries, or packages. This is a new category in OWASP 2025.",
      whatUa: "Атаки на ланцюг постачання відбуваються, коли шкідливий код впроваджується в довірені програмні компоненти, бібліотеки або пакети. Це нова категорія в OWASP 2025.",
      how: "You identified the hidden stealCredentials() function that was disguised to look like legitimate analytics code, but actually exfiltrated user data.",
      howUa: "Ви ідентифікували приховану функцію stealCredentials(), яка була замаскована під легітимний аналітичний код, але насправді викрадала дані користувачів.",
      defense: "Verify package integrity with checksums, use lockfiles, audit dependencies regularly, implement SBOM (Software Bill of Materials), and use trusted package registries.",
      defenseUa: "Перевіряйте цілісність пакетів за допомогою контрольних сум, використовуйте lockfiles, регулярно аудитуйте залежності, впроваджуйте SBOM і використовуйте довірені реєстри пакетів."
    }
  },
  {
    id: 4,
    name: "Injection",
    nameUa: "Ін'єкція",
    description: "Execute SQL Injection to bypass login",
    descriptionUa: "Виконайте SQL-ін'єкцію для обходу авторизації",
    vulnerability: "SQL Injection",
    category: "Injection",
    basePoints: 150,
    simulationType: "sql-injection",
    objective: "Login as admin without knowing the password using SQL injection",
    objectiveUa: "Увійдіть як адмін без знання пароля, використовуючи SQL-ін'єкцію",
    solution: "' OR '1'='1",
    explanation: {
      what: "Injection flaws occur when untrusted data is sent to an interpreter as part of a command or query. SQL injection allows attackers to manipulate database queries.",
      whatUa: "Помилки ін'єкції виникають, коли ненадійні дані надсилаються інтерпретатору як частина команди або запиту. SQL-ін'єкція дозволяє зловмисникам маніпулювати запитами до бази даних.",
      how: "By entering ' OR '1'='1 in the password field, you modified the SQL query to always return true, bypassing authentication entirely.",
      howUa: "Вводячи ' OR '1'='1 у поле пароля, ви змінили SQL-запит так, щоб він завжди повертав true, повністю обходячи автентифікацію.",
      defense: "Use parameterized queries (prepared statements), implement input validation, apply least privilege principle, and use ORM frameworks with proper escaping.",
      defenseUa: "Використовуйте параметризовані запити (prepared statements), реалізуйте валідацію введення, застосовуйте принцип найменших привілеїв і використовуйте ORM-фреймворки з належним екрануванням."
    }
  },
  {
    id: 5,
    name: "Security Misconfiguration",
    nameUa: "Неправильна конфігурація безпеки",
    description: "Exploit misconfigured server settings",
    descriptionUa: "Експлуатуйте неправильно налаштовані параметри сервера",
    vulnerability: "Misconfiguration",
    category: "Configuration",
    basePoints: 110,
    simulationType: "config-exploit",
    objective: "Access the .env file through directory traversal",
    objectiveUa: "Отримайте доступ до файлу .env через обхід директорій",
    solution: "../.env",
    explanation: {
      what: "Security Misconfiguration is the most common vulnerability. It includes default credentials, unnecessary features enabled, missing security headers, and exposed sensitive files.",
      whatUa: "Неправильна конфігурація безпеки - найпоширеніша вразливість. Вона включає облікові дані за замовчуванням, увімкнені непотрібні функції, відсутні заголовки безпеки та відкриті чутливі файли.",
      how: "Using ../.env you accessed the environment file containing sensitive configuration including API keys and database credentials.",
      howUa: "Використовуючи ../.env, ви отримали доступ до файлу середовища, що містить чутливу конфігурацію, включаючи API-ключі та облікові дані бази даних.",
      defense: "Implement hardening procedures, remove default credentials, disable directory listing, configure proper permissions, and conduct regular security audits.",
      defenseUa: "Впроваджуйте процедури зміцнення, видаляйте облікові дані за замовчуванням, вимикайте лістинг директорій, налаштовуйте належні дозволи та проводьте регулярний аудит безпеки."
    }
  },
  {
    id: 6,
    name: "Vulnerable & Outdated Components",
    nameUa: "Вразливі та застарілі компоненти",
    description: "Exploit a known vulnerability in an outdated library",
    descriptionUa: "Експлуатуйте відому вразливість у застарілій бібліотеці",
    vulnerability: "Outdated",
    category: "Dependencies",
    basePoints: 130,
    simulationType: "version-exploit",
    objective: "Find the CVE number for the vulnerable jQuery version 1.6.1",
    objectiveUa: "Знайдіть номер CVE для вразливої версії jQuery 1.6.1",
    solution: "CVE-2011-4969",
    explanation: {
      what: "Using components with known vulnerabilities can compromise your entire application. This includes operating systems, web servers, databases, libraries, and frameworks.",
      whatUa: "Використання компонентів з відомими вразливостями може скомпрометувати весь застосунок. Це включає операційні системи, веб-сервери, бази даних, бібліотеки та фреймворки.",
      how: "jQuery 1.6.1 has a known XSS vulnerability (CVE-2011-4969). Attackers can use public exploit databases to find and exploit such vulnerabilities.",
      howUa: "jQuery 1.6.1 має відому XSS-вразливість (CVE-2011-4969). Зловмисники можуть використовувати публічні бази експлоїтів для пошуку та експлуатації таких вразливостей.",
      defense: "Keep all components updated, monitor CVE databases, use dependency scanning tools (Snyk, npm audit), and implement a patch management process.",
      defenseUa: "Підтримуйте всі компоненти оновленими, моніторте бази CVE, використовуйте інструменти сканування залежностей (Snyk, npm audit) та впроваджуйте процес управління патчами."
    }
  },
  {
    id: 7,
    name: "Identification & Authentication Failures",
    nameUa: "Помилки ідентифікації та автентифікації",
    description: "Bypass weak authentication mechanism",
    descriptionUa: "Обійдіть слабкий механізм автентифікації",
    vulnerability: "Auth Bypass",
    category: "Authentication",
    basePoints: 140,
    simulationType: "auth-bypass",
    objective: "Login using the default admin credentials that were never changed",
    objectiveUa: "Увійдіть, використовуючи облікові дані адміністратора за замовчуванням, які не були змінені",
    solution: "admin:admin",
    explanation: {
      what: "Authentication failures include weak passwords, credential stuffing, missing MFA, session fixation, and poor session management.",
      whatUa: "Помилки автентифікації включають слабкі паролі, credential stuffing, відсутність MFA, фіксацію сесії та погане управління сесіями.",
      how: "Many systems ship with default credentials like admin:admin. If these aren't changed, anyone can easily access the system.",
      howUa: "Багато систем поставляються з обліковими даними за замовчуванням, як-от admin:admin. Якщо їх не змінити, будь-хто може легко отримати доступ до системи.",
      defense: "Force password changes on first login, implement MFA, use secure password policies, protect against brute force, and implement proper session management.",
      defenseUa: "Примусово змінюйте паролі при першому вході, впроваджуйте MFA, використовуйте політики безпечних паролів, захищайте від brute force та реалізуйте належне управління сесіями."
    }
  },
  {
    id: 8,
    name: "Data Integrity & Secrets Management",
    nameUa: "Цілісність даних та управління секретами",
    description: "Extract exposed API keys from client-side code",
    descriptionUa: "Витягніть відкриті API-ключі з клієнтського коду",
    vulnerability: "Secrets Exposure",
    category: "Secrets",
    basePoints: 135,
    simulationType: "secrets-hunt",
    objective: "Find the exposed AWS access key in the JavaScript code",
    objectiveUa: "Знайдіть відкритий AWS access key у JavaScript-коді",
    solution: "AKIAIOSFODNN7EXAMPLE",
    explanation: {
      what: "Data Integrity failures occur when code or data can be modified unexpectedly. Secrets management failures expose sensitive credentials in code, logs, or repositories.",
      whatUa: "Порушення цілісності даних виникають, коли код або дані можуть бути несподівано змінені. Помилки управління секретами розкривають чутливі облікові дані в коді, логах або репозиторіях.",
      how: "The AWS access key was hardcoded in the client-side JavaScript, making it accessible to anyone viewing the source code.",
      howUa: "AWS access key був жорстко закодований у клієнтському JavaScript, роблячи його доступним для будь-кого, хто переглядає вихідний код.",
      defense: "Never hardcode secrets, use environment variables, implement secrets management solutions (HashiCorp Vault, AWS Secrets Manager), and scan code for exposed credentials.",
      defenseUa: "Ніколи не хардкодьте секрети, використовуйте змінні середовища, впроваджуйте рішення для управління секретами (HashiCorp Vault, AWS Secrets Manager) та скануйте код на наявність відкритих облікових даних."
    }
  },
  {
    id: 9,
    name: "Logging & Monitoring Failures",
    nameUa: "Помилки логування та моніторингу",
    description: "Identify the attack hidden in server logs",
    descriptionUa: "Ідентифікуйте атаку, приховану в логах сервера",
    vulnerability: "Log Analysis",
    category: "Monitoring",
    basePoints: 115,
    simulationType: "log-analysis",
    objective: "Find the IP address performing the brute force attack in the logs",
    objectiveUa: "Знайдіть IP-адресу, яка виконує brute force атаку в логах",
    solution: "192.168.1.100",
    explanation: {
      what: "Without proper logging and monitoring, breaches go undetected. This includes insufficient logging, log injection, lack of alerting, and poor incident response.",
      whatUa: "Без належного логування та моніторингу порушення залишаються непоміченими. Це включає недостатнє логування, log injection, відсутність оповіщень та погане реагування на інциденти.",
      how: "By analyzing the server logs, you identified IP 192.168.1.100 making thousands of failed login attempts - a clear brute force pattern that should trigger alerts.",
      howUa: "Аналізуючи логи сервера, ви ідентифікували IP 192.168.1.100, який здійснював тисячі невдалих спроб входу - явний патерн brute force, який повинен викликати оповіщення.",
      defense: "Implement comprehensive logging, use SIEM solutions, set up alerting for suspicious patterns, conduct regular log reviews, and have an incident response plan.",
      defenseUa: "Впроваджуйте комплексне логування, використовуйте SIEM-рішення, налаштовуйте оповіщення для підозрілих патернів, регулярно переглядайте логи та майте план реагування на інциденти."
    }
  },
  {
    id: 10,
    name: "Mishandling of Exceptional Conditions",
    nameUa: "Неправильна обробка виняткових ситуацій",
    description: "Trigger an unhandled exception to reveal sensitive info",
    descriptionUa: "Викличте необроблений виняток для розкриття чутливої інформації",
    vulnerability: "Error Handling",
    category: "Exception",
    basePoints: 125,
    simulationType: "error-exploit",
    objective: "Enter a value that triggers a stack trace revealing the database name",
    objectiveUa: "Введіть значення, яке викличе stack trace з назвою бази даних",
    solution: "undefined",
    explanation: {
      what: "Improper exception handling can leak sensitive information through error messages, stack traces, or cause denial of service. This is a new OWASP 2025 category.",
      whatUa: "Неправильна обробка винятків може витікати чутливу інформацію через повідомлення про помилки, stack traces або викликати відмову в обслуговуванні. Це нова категорія OWASP 2025.",
      how: "By passing 'undefined' as input, you triggered an unhandled exception that exposed the full stack trace including the database name 'secret_production_db'.",
      howUa: "Передаючи 'undefined' як вхідні дані, ви викликали необроблений виняток, який відкрив повний stack trace, включаючи назву бази даних 'secret_production_db'.",
      defense: "Implement proper error handling, use generic error messages in production, log detailed errors server-side only, and validate all inputs before processing.",
      defenseUa: "Реалізуйте належну обробку помилок, використовуйте загальні повідомлення про помилки в продакшені, логуйте детальні помилки лише на сервері та валідуйте всі вхідні дані перед обробкою."
    }
  }
];

export const achievements: Achievement[] = [
  { id: "first-blood", name: "First Blood", nameUa: "Перша кров", description: "Complete your first level", descriptionUa: "Завершіть свій перший рівень", icon: "Sword", condition: "complete_1" },
  { id: "hacker-rookie", name: "Hacker Rookie", nameUa: "Хакер-новачок", description: "Complete 5 levels", descriptionUa: "Завершіть 5 рівнів", icon: "Terminal", condition: "complete_5" },
  { id: "cyber-warrior", name: "Cyber Warrior", nameUa: "Кібер-воїн", description: "Complete all 10 levels", descriptionUa: "Завершіть усі 10 рівнів", icon: "Shield", condition: "complete_10" },
  { id: "speed-demon", name: "Speed Demon", nameUa: "Демон швидкості", description: "Complete a level in under 30 seconds", descriptionUa: "Завершіть рівень менш ніж за 30 секунд", icon: "Zap", condition: "speed_30" },
  { id: "no-hints", name: "Self-Taught", nameUa: "Самоук", description: "Complete a level without hints", descriptionUa: "Завершіть рівень без підказок", icon: "Brain", condition: "no_hints" },
  { id: "perfectionist", name: "Perfectionist", nameUa: "Перфекціоніст", description: "Complete all levels on Hard difficulty", descriptionUa: "Завершіть усі рівні на складності 'Важкий'", icon: "Trophy", condition: "all_hard" },
  { id: "injection-master", name: "Injection Master", nameUa: "Майстер ін'єкцій", description: "Complete the Injection level on Hard", descriptionUa: "Завершіть рівень Ін'єкція на складності 'Важкий'", icon: "Database", condition: "injection_hard" },
  { id: "crypto-breaker", name: "Crypto Breaker", nameUa: "Зломщик криптографії", description: "Complete Cryptographic Failures on Hard", descriptionUa: "Завершіть Криптографічні помилки на 'Важкий'", icon: "Key", condition: "crypto_hard" },
];

export interface User {
  id: string;
  username: string;
  password: string;
}

export const insertUserSchema = z.object({
  username: z.string().min(2),
  password: z.string().min(4),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
