"use client";

import { useCoAgent, useRenderToolCall } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";

// ============================================================================
// TYPES - Define your agent state shape
// ============================================================================

interface AgentState {
  history: string[];
  // Add more state fields as needed
}

// ============================================================================
// TOOL RENDER COMPONENTS - Custom UI for tool results
// ============================================================================

function TimeCard({ data }: { data: any }) {
  if (!data || data.status === "error") {
    return (
      <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
        {data?.message || "Failed to get time"}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
      <p className="text-xs opacity-80">{data.timezone}</p>
      <p className="text-3xl font-bold">{data.time}</p>
      <p className="text-sm opacity-90">{data.date}</p>
    </div>
  );
}

function LoadingCard({ message }: { message: string }) {
  return (
    <div className="p-3 rounded-lg bg-gray-100 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-600">{message}</span>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function Home() {
  // Bidirectional state sync with ADK agent
  const { state, setState } = useCoAgent<AgentState>({
    name: "assistant_agent", // Must match agent name in backend
    initialState: {
      history: [],
    },
  });

  // Register tool renderers for generative UI
  useRenderToolCall({
    name: "get_current_time",
    render: ({ args, result, status }) => {
      if (status === "executing") {
        return <LoadingCard message={`Getting time for ${args.timezone || "UTC"}...`} />;
      }
      return <TimeCard data={result} />;
    },
  });

  useRenderToolCall({
    name: "example_tool",
    render: ({ args, result, status }) => {
      if (status === "executing") {
        return <LoadingCard message="Processing..." />;
      }
      return (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
          <p className="text-sm text-green-700">
            ✓ Processed: "{args.query}"
          </p>
          <p className="text-xs text-green-600 mt-1">
            History count: {result?.history_count}
          </p>
        </div>
      );
    },
  });

  // Theme customization
  const theme: React.CSSProperties = {
    "--copilot-kit-primary-color": "#4285f4",
    "--copilot-kit-contrast-color": "#ffffff",
    "--copilot-kit-background-color": "#f8f9fa",
    "--copilot-kit-secondary-color": "#e8eaed",
    "--copilot-kit-separator-color": "#dadce0",
  } as React.CSSProperties;

  return (
    <div style={theme}>
      <CopilotSidebar
        clickOutsideToClose={false}
        defaultOpen={true}
        labels={{
          title: "AI Assistant",
          initial: [
            "👋 Hi! I'm your AI assistant.",
            "I can help you with various tasks. Try asking me:",
            "• What time is it in Tokyo?",
            "• Process this query: hello world",
          ],
          placeholder: "Ask me anything...",
        }}
      >
        <main className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ADK + CopilotKit Demo
            </h1>
            <p className="text-gray-600 mb-8">
              Full-stack AI agent with Google ADK backend and CopilotKit frontend.
            </p>

            {/* State display */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Agent State</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">History:</span>
                  <div className="mt-1">
                    {state.history.length === 0 ? (
                      <p className="text-gray-400 text-sm italic">No history yet</p>
                    ) : (
                      <ul className="space-y-1">
                        {state.history.map((item, i) => (
                          <li key={i} className="text-sm bg-gray-50 px-3 py-1 rounded">
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive controls */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setState({ history: [] })}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  Clear History
                </button>
                <button
                  onClick={() =>
                    setState({
                      history: [...state.history, `Manual entry ${Date.now()}`],
                    })
                  }
                  className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Add Manual Entry
                </button>
              </div>
            </div>
          </div>
        </main>
      </CopilotSidebar>
    </div>
  );
}
