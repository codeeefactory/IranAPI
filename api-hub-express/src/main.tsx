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
  console.error("Failed to render app:", error);
  rootElement.innerHTML = `
    <div style="padding: 2rem; text-align: center; color: white; background: #000;">
      <h1>خطا در بارگذاری برنامه</h1>
      <p>لطفاً صفحه را رفرش کنید</p>
      <pre style="text-align: left; margin-top: 1rem; color: #ff6b6b;">${error}</pre>
    </div>
  `;
}
