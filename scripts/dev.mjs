import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

const processes = [];
let shuttingDown = false;

const apps = [
  {
    name: "backend",
    command: "node server.js",
    cwd: path.join(rootDir, "backend"),
  },
  {
    name: "learner",
    command: `${npmCmd} run dev -- --host 0.0.0.0 --port 3000`,
    cwd: path.join(rootDir, "course-compass-main"),
  },
  {
    name: "admin",
    command: `${npmCmd} run dev -- --host 0.0.0.0 --port 3001`,
    cwd: path.join(rootDir, "admin"),
  },
];

function printBanner() {
  console.log("Starting LMS development servers...");
  console.log("Learner app: http://localhost:3000");
  console.log("Admin app:   http://localhost:3001");
  console.log("Backend API: http://localhost:5000");
  console.log("");
}

function pipeWithPrefix(stream, prefix, writer) {
  let buffer = "";

  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.length > 0) {
        writer(`[${prefix}] ${line}\n`);
      }
    }
  });

  stream.on("end", () => {
    if (buffer.length > 0) {
      writer(`[${prefix}] ${buffer}\n`);
    }
  });
}

function stopAll(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of processes) {
    if (!child.killed) {
      child.kill("SIGINT");
    }
  }

  setTimeout(() => process.exit(exitCode), 250);
}

function startProcess(app) {
  const child = spawn(app.command, [], {
    cwd: app.cwd,
    env: process.env,
    shell: true,
    stdio: ["inherit", "pipe", "pipe"],
  });

  processes.push(child);
  pipeWithPrefix(child.stdout, app.name, (line) => process.stdout.write(line));
  pipeWithPrefix(child.stderr, app.name, (line) => process.stderr.write(line));

  child.on("exit", (code) => {
    if (shuttingDown) return;
    if (code && code !== 0) {
      process.stderr.write(`[${app.name}] exited with code ${code}\n`);
      stopAll(code);
    }
  });

  child.on("error", (error) => {
    process.stderr.write(`[${app.name}] failed to start: ${error.message}\n`);
    stopAll(1);
  });
}

printBanner();
apps.forEach(startProcess);

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
