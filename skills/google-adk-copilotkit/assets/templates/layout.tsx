import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ADK + CopilotKit App",
  description: "Full-stack AI agent powered by Google ADK and CopilotKit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ADK backend URL - defaults to localhost:8000
  const agentUrl = process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:8000";

  return (
    <html lang="en">
      <body className={inter.className}>
        <CopilotKit url={agentUrl}>
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
