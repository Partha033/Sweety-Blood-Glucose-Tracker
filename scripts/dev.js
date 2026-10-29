const http = require("node:http");
const net = require("node:net");
const { spawn } = require("node:child_process");

const preferredPort = Number(process.env.PORT) || 5000;
const children = [];

function checkSweetyApi(port) {
  return new Promise((resolve) => {
    const request = http.get(
      { hostname: "127.0.0.1", port, path: "/api/health", timeout: 1200 },
      (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => { body += chunk; });
        response.on("end", () => {
          try {
            const payload = JSON.parse(body);
            resolve(response.statusCode === 200 && payload.status === "ok");
          } catch {
            resolve(false);
          }
        });
      }
    );
    request.on("error", () => resolve(false));
    request.on("timeout", () => {
      request.destroy();
      resolve(false);
    });
  });
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port, "127.0.0.1");
  });
}

function runNpm(args, env) {
  const isWindows = process.platform === "win32";
  const command = isWindows ? "cmd.exe" : "npm";
  const commandArgs = isWindows
    ? ["/d", "/s", "/c", `npm ${args.join(" ")}`]
    : args;
  const child = spawn(command, commandArgs, { env, stdio: "inherit" });
  children.push(child);
  child.on("error", (error) => {
    console.error(`Could not start ${args.join(" ")}:`, error.message);
    stop(1);
  });
  child.on("exit", (code) => {
    if (code && code !== 0) stop(code);
  });
  return child;
}

function stop(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exitCode = code;
}

async function main() {
  let apiPort = preferredPort;
  const existingApi = await checkSweetyApi(apiPort);

  if (existingApi) {
    console.log(`Sweety API is already responding on port ${apiPort}; reusing it.`);
  } else {
    if (!(await isPortAvailable(apiPort))) {
      const firstFallback = preferredPort === 5000 ? 5001 : preferredPort + 1;
      let foundPort = false;
      for (let candidate = firstFallback; candidate <= firstFallback + 20; candidate += 1) {
        if (await isPortAvailable(candidate)) {
          apiPort = candidate;
          foundPort = true;
          break;
        }
      }
      if (!foundPort) {
        throw new Error(`Port ${preferredPort} is busy and no API port was available in the next 20 ports.`);
      }
      console.log(`Port ${preferredPort} is occupied; starting the API on port ${apiPort}.`);
    }

    runNpm(["run", "dev", "--prefix", "server"], {
      ...process.env,
      PORT: String(apiPort),
    });
  }

  runNpm(["run", "dev", "--prefix", "client"], {
    ...process.env,
    VITE_API_URL: process.env.VITE_API_URL || `http://localhost:${apiPort}/api`,
  });

  process.on("SIGINT", () => stop(0));
  process.on("SIGTERM", () => stop(0));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
