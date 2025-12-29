# CopilotKit + ADK API Reference

## CopilotKit Provider

```tsx
interface CopilotKitProps {
  url: string;                    // ADK backend URL (e.g., "http://localhost:8000")
  children: React.ReactNode;
}

// Usage
<CopilotKit url="http://localhost:8000">
  <App />
</CopilotKit>
```

## Hooks

### useCoAgent

Bidirectional state sync between frontend and ADK agent.

```tsx
interface UseCoAgentOptions<T> {
  name: string;              // Must match agent name in backend
  initialState?: T;          // Default state before agent responds
}

interface UseCoAgentReturn<T> {
  state: T;                  // Current agent state (reactive)
  setState: (partial: Partial<T>) => void;  // Update state (syncs to agent)
  running: boolean;          // Is agent currently processing
}

// Example
const { state, setState, running } = useCoAgent<{
  results: Product[];
  query: string;
}>({
  name: "shop_agent",
  initialState: { results: [], query: "" }
});
```

### useRenderToolCall

Render custom UI when agent calls specific tools.

```tsx
interface UseRenderToolCallOptions {
  name: string;              // Tool name to intercept
  render: (props: RenderProps) => React.ReactNode;
}

interface RenderProps {
  args: Record<string, any>; // Arguments passed to tool
  result?: any;              // Tool return value (when complete)
  status: "executing" | "complete" | "error";
}

// Example
useRenderToolCall({
  name: "get_weather",
  render: ({ args, result, status }) => {
    if (status === "executing") return <Spinner />;
    return <WeatherCard city={args.city} data={result} />;
  }
});
```

### useCopilotChat (Headless)

Direct control over chat for custom UIs.

```tsx
interface UseCopilotChatReturn {
  visibleMessages: Message[];
  appendMessage: (msg: Message) => void;
  setMessages: (msgs: Message[]) => void;
  isLoading: boolean;
  stopGeneration: () => void;
  reloadMessages: () => void;
}

// Example
const { visibleMessages, appendMessage, isLoading } = useCopilotChat();
```

## UI Components

### CopilotSidebar

Full-height sidebar that wraps content.

```tsx
interface CopilotSidebarProps {
  children?: React.ReactNode;
  defaultOpen?: boolean;           // Default: true
  clickOutsideToClose?: boolean;   // Default: true
  labels?: {
    title?: string;
    initial?: string | string[];
    placeholder?: string;
  };
  icons?: {
    openIcon?: React.ReactNode;
    closeIcon?: React.ReactNode;
    sendIcon?: React.ReactNode;
  };
  className?: string;
}
```

### CopilotPopup

Floating chat bubble (bottom-right).

```tsx
interface CopilotPopupProps {
  // Same as CopilotSidebarProps (minus children)
  shortcut?: string;              // Keyboard shortcut (default: "?")
  hitEscapeToClose?: boolean;
}
```

### CopilotChat

Inline chat component.

```tsx
interface CopilotChatProps {
  labels?: CopilotLabels;
  icons?: CopilotIcons;
  className?: string;
  instructions?: string;          // System prompt override
}
```

## CSS Variables

```css
:root {
  /* Primary brand color */
  --copilot-kit-primary-color: #4285f4;
  
  /* Text on primary color */
  --copilot-kit-contrast-color: #ffffff;
  
  /* Chat background */
  --copilot-kit-background-color: #ffffff;
  
  /* Message bubbles, inputs */
  --copilot-kit-secondary-color: #f1f3f4;
  
  /* Borders, dividers */
  --copilot-kit-separator-color: #e8eaed;
  
  /* Muted text */
  --copilot-kit-muted-color: #5f6368;
}
```

## ADK Python API

### LlmAgent

```python
from google.adk.agents import LlmAgent

agent = LlmAgent(
    name: str,                    # Unique identifier
    model: str,                   # "gemini-2.5-flash", "gemini-2.0-flash-exp"
    description: str,             # What agent does (for routing)
    instruction: str,             # System prompt
    tools: list = [],             # FunctionTools, other agents, MCP toolsets
    output_schema: dict = None,   # Force structured JSON output
    output_key: str = None,       # Store output in state[key]
)
```

### FunctionTool

Tools are auto-created from functions with docstrings:

```python
def my_tool(param1: str, param2: int = 10) -> dict:
    """Tool description for the LLM.
    
    Args:
        param1: Description of param1.
        param2: Description of param2 (optional).
    
    Returns:
        Description of return value.
    """
    return {"result": "value"}

# Use directly in agent
agent = LlmAgent(tools=[my_tool])
```

### ToolContext

Access session state and control flow:

```python
from google.adk.tools.tool_context import ToolContext

def stateful_tool(query: str, tool_context: ToolContext) -> dict:
    # Read state
    history = tool_context.state.get("history", [])
    
    # Write state (syncs to frontend via AG-UI)
    history.append(query)
    tool_context.state["history"] = history
    
    # Access function call ID
    call_id = tool_context.function_call_id
    
    return {"status": "ok"}
```

### ADKAgent (AG-UI Wrapper)

```python
from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint
from fastapi import FastAPI

# Wrap LlmAgent for AG-UI protocol
adk_agent = ADKAgent(
    agent=root_agent,
    name="my_agent"
)

# Add to FastAPI
app = FastAPI()
add_adk_fastapi_endpoint(app, adk_agent, path="/")
```

### McpToolset

Connect to MCP servers:

```python
from google.adk.tools.mcp_tool import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams

github_tools = McpToolset(
    connection_params=StdioConnectionParams(
        command="npx",
        args=["-y", "@modelcontextprotocol/server-github"]
    ),
    tool_filter=["list_issues", "search_repositories"]  # Optional filter
)

agent = LlmAgent(tools=[github_tools])
```

## AG-UI Event Types

Events streamed from backend to frontend:

| Event | Description |
|-------|-------------|
| `RUN_STARTED` | Agent began processing |
| `RUN_FINISHED` | Agent completed |
| `TEXT_MESSAGE_START` | Beginning of text response |
| `TEXT_MESSAGE_CONTENT` | Streaming text chunk |
| `TEXT_MESSAGE_END` | End of text response |
| `TOOL_CALL_START` | Tool invocation began |
| `TOOL_CALL_RESULT` | Tool returned result |
| `STATE_UPDATE` | Agent state changed |
