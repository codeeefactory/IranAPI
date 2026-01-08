import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error("Failed to render app:", redactClientSecret(error));
  rootElement.replaceChildren();

  const shell = document.createElement("div");
  shell.style.cssText =
    "min-height:100vh;display:grid;place-items:center;padding:24px;background:#071014;color:#e7f8fb;font-family:Vazirmatn,Sora,Segoe UI,Tahoma,sans-serif;";

  const panel = document.createElement("div");
  panel.style.cssText =
    "width:min(100%,720px);border:1px solid rgba(34,211,238,.35);border-radius:8px;background:rgba(11,18,24,.94);box-shadow:0 24px 70px rgba(0,0,0,.4);padding:32px;";

  const kicker = document.createElement("p");
  kicker.textContent = "Application Error";
  kicker.style.cssText = "margin:0 0 12px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#22d3ee;";

  const title = document.createElement("h1");
  title.textContent = "خطا در بارگذاری برنامه";
  title.style.cssText = "margin:0 0 12px;font-size:32px;";

  const copy = document.createElement("p");
  copy.textContent =
    "یک خطای غیرمنتظره هنگام راه‌اندازی رابط کاربری رخ داد. صفحه را دوباره بارگذاری کنید و اگر مشکل ادامه داشت، گزارش خطا را بررسی کنید.";
  copy.style.cssText = "margin:0;color:#90a9b4;line-height:1.8;";

  const detail = document.createElement("pre");
  detail.textContent = error instanceof Error ? redactClientSecret(error) : "Unknown render failure";
  detail.style.cssText =
    "margin-top:20px;overflow:auto;border-radius:8px;background:#02070a;color:#e2e8f0;padding:16px;text-align:left;";

  panel.append(kicker, title, copy, detail);
  shell.append(panel);
  rootElement.append(shell);
}
