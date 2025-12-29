---
name: google-adk-copilotkit
description: >
  Build full-stack AI agents using Google ADK (Agent Development Kit) with CopilotKit frontend via AG-UI protocol. 
  Use when building production-ready AI agents with Gemini models, multi-tool agents, human-in-the-loop workflows, and rich React frontends. 
  Covers ADK agent setup (Python/TypeScript), AG-UI integration, CopilotKit UI components, shared state, generative UI, and tool-based rendering. 
  Uses Bun for frontend by default. 
  Triggers on: ADK, Agent Development Kit, Google ADK, AG-UI, agentic UI, Gemini agent, multi-agent, full-stack agent.
---

# Google ADK + CopilotKit Skill

Build production-ready AI agents with Google ADK backend and CopilotKit frontend.

## Quick Start

```bash
# One-command setup (recommended)
npx copilotkit@latest create -f adk

# Or clone starter
git clone https://github.com/CopilotKit/with-adk
cd with-adk && bun install
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js + Bun)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ CopilotKit   │  │ useCoAgent   │  │ CopilotSidebar/Popup   │ │
│  │ Provider     │  │ Shared State │  │ Chat UI Components     │ │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬───────────┘ │
└─────────┼─────────────────┼──────────────────────┼──────────────┘
          │                 │                      │
          └─────────────────┼──────────────────────┘
                            │ AG-UI Protocol (WebSocket)
          ┌─────────────────┴──────────────────────┐
┌─────────┴─────────────────────────────────────────┴─────────────┐
│                      BACKEND (Python + FastAPI)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ ADKAgent     │  │ LlmAgent     │  │ FunctionTool           │ │
│  │ (AG-UI wrap) │  │ (Gemini)     │  │ MCP, APIs, etc.        │ │
│  └──────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
my-adk-app/
├── frontend/                    # Next.js + CopilotKit
│   ├── src/app/
│   │   ├── layout.tsx          # CopilotKit provider
│   │   └── page.tsx            # Main UI + CopilotChat
│   ├── package.json
│   └── .env.local              # NEXT_PUBLIC_AGENT_URL
├── backend/                     # Python ADK Agent
│   ├── agent.py                # ADK agent + AG-UI wrapper
│   ├── tools.py                # Custom tools
│   ├── requirements.txt
│   └── .env                    # GOOGLE_API_KEY
└── package.json                # Root scripts (dev, dev:agent, dev:ui)
```

## Backend Setup (Python ADK)

### Install Dependencies

```bash
pip install google-adk ag-ui-adk fastapi uvicorn python-dotenv
```

### Basic Agent (agent.py)

```python
import os
from dotenv import load_dotenv
from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool
from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint
from fastapi import FastAPI

load_dotenv()

# Define tools
def get_weather(city: str) -> dict:
    """Get current weather for a city.
    
    Args:
        city: Name of the city to get weather for.
    
    Returns:
        Weather information dict with temperature and conditions.
    """
    # Replace with actual API call
    return {
        "status": "success",
        "city": city,
        "temperature": "22°C",
        "conditions": "Partly cloudy"
    }

def search_products(query: str, category: str = None) -> dict:
    """Search product catalog.
    
    Args:
        query: Search term.
        category: Optional category filter.
    
    Returns:
        List of matching products.
    """
    return {
        "status": "success",
        "results": [
            {"name": f"Product matching '{query}'", "price": 29.99}
        ]
    }

# Create ADK Agent
root_agent = LlmAgent(
    name="assistant_agent",
    model="gemini-2.5-flash",
    description="A helpful assistant that can check weather and search products.",
    instruction="""You are a helpful AI assistant. 
    Use the available tools to help users with their requests.
    Be concise and friendly in your responses.""",
    tools=[get_weather, search_products]
)

# Wrap with AG-UI middleware
adk_agent = ADKAgent(
    agent=root_agent,
    name="assistant_agent"
)

# Create FastAPI app
app = FastAPI(title="ADK Agent")
add_adk_fastapi_endpoint(app, adk_agent, path="/")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

### Run Backend

```bash
export GOOGLE_API_KEY="your-api-key"
python agent.py
# Agent available at http://localhost:8000
```

## Frontend Setup (Next.js + CopilotKit)

### Install Dependencies

```bash
bunx create-next-app@latest frontend --ts --tailwind --app --src-dir
cd frontend
bun add @copilotkit/react-core @copilotkit/react-ui
```

### Layout with CopilotKit Provider

```tsx
// src/app/layout.tsx
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CopilotKit url={process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:8000"}>
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
```

### Basic Page with Chat

```tsx
// src/app/page.tsx
"use client";

import { CopilotSidebar } from "@copilotkit/react-ui";

export default function Home() {
  return (
    <CopilotSidebar
      clickOutsideToClose={false}
      defaultOpen={true}
      labels={{
        title: "AI Assistant",
        initial: "👋 Hi! I can help you check weather and search products.",
      }}
    >
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">My ADK App</h1>
        <p>Chat with the AI assistant in the sidebar.</p>
      </main>
    </CopilotSidebar>
  );
}
```

### Environment Variables

```bash
# frontend/.env.local
NEXT_PUBLIC_AGENT_URL=http://localhost:8000
```

## Shared State (Agent ↔ Frontend)

### Frontend: useCoAgent Hook

```tsx
"use client";

import { useCoAgent } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";

interface AgentState {
  searchResults: Product[];
  selectedProduct: Product | null;
  cartItems: CartItem[];
}

export default function ShopPage() {
  const { state, setState } = useCoAgent<AgentState>({
    name: "shop_agent",
    initialState: {
      searchResults: [],
      selectedProduct: null,
      cartItems: [],
    },
  });

  return (
    <div className="flex h-screen">
      {/* Main content reacts to agent state */}
      <main className="flex-1 p-6">
        <h2>Search Results ({state.searchResults.length})</h2>
        <ProductGrid 
          products={state.searchResults}
          onSelect={(p) => setState({ selectedProduct: p })}
        />
        
        {state.selectedProduct && (
          <ProductDetail product={state.selectedProduct} />
        )}
      </main>

      {/* Chat sidebar */}
      <aside className="w-96 border-l">
        <CopilotChat labels={{ title: "Shopping Assistant" }} />
      </aside>
    </div>
  );
}
```

### Backend: Emit State Updates

```python
from google.adk.tools.tool_context import ToolContext

def search_products(query: str, tool_context: ToolContext) -> dict:
    """Search products and update frontend state."""
    results = product_db.search(query)
    
    # Emit state to frontend via AG-UI
    tool_context.state["searchResults"] = results
    
    return {"status": "success", "count": len(results)}
```

## Generative UI (Tool-Based Rendering)

### Frontend: useRenderToolCall

```tsx
"use client";

import { useRenderToolCall } from "@copilotkit/react-core";

// Render custom UI when agent calls specific tools
useRenderToolCall({
  name: "get_weather",
  render: ({ args, result, status }) => {
    if (status === "executing") {
      return <WeatherSkeleton city={args.city} />;
    }
    return (
      <WeatherCard
        city={args.city}
        temperature={result?.temperature}
        conditions={result?.conditions}
      />
    );
  },
});

useRenderToolCall({
  name: "search_products",
  render: ({ args, result, status }) => {
    if (status === "executing") {
      return <SearchingSkeleton query={args.query} />;
    }
    return (
      <ProductGrid
        products={result?.results || []}
        query={args.query}
      />
    );
  },
});
```

### Custom UI Components

```tsx
// components/WeatherCard.tsx
export function WeatherCard({ city, temperature, conditions }: WeatherProps) {
  return (
    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-white">
      <h3 className="font-semibold">{city}</h3>
      <p className="text-3xl font-bold">{temperature}</p>
      <p className="text-sm opacity-90">{conditions}</p>
    </div>
  );
}

// components/ProductGrid.tsx
export function ProductGrid({ products, query }: ProductGridProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500">Results for "{query}"</p>
      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <div key={p.id} className="p-3 border rounded-lg">
            <p className="font-medium">{p.name}</p>
            <p className="text-green-600">${p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## ADK Tool Patterns

### Simple Function Tool

```python
def calculate_total(items: list[dict]) -> dict:
    """Calculate total price for cart items.
    
    Args:
        items: List of items with 'price' and 'quantity' fields.
    
    Returns:
        Total price and item count.
    """
    total = sum(item["price"] * item["quantity"] for item in items)
    return {"total": total, "item_count": len(items)}
```

### Tool with Context Access

```python
from google.adk.tools.tool_context import ToolContext

def add_to_cart(product_id: str, quantity: int, tool_context: ToolContext) -> dict:
    """Add product to user's cart.
    
    Args:
        product_id: ID of the product to add.
        quantity: Number of items to add.
        tool_context: Automatically injected by ADK.
    """
    # Access/modify session state
    cart = tool_context.state.get("cart", [])
    cart.append({"product_id": product_id, "quantity": quantity})
    tool_context.state["cart"] = cart
    
    return {"status": "success", "cart_size": len(cart)}
```

### MCP Tool Integration

```python
from google.adk.agents import LlmAgent
from google.adk.tools.mcp_tool import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams

agent = LlmAgent(
    name="github_agent",
    model="gemini-2.5-flash",
    instruction="Help users with GitHub tasks.",
    tools=[
        McpToolset(
            connection_params=StdioConnectionParams(
                command="npx",
                args=["-y", "@modelcontextprotocol/server-github"]
            ),
            tool_filter=["list_issues", "get_issue", "search_repositories"]
        )
    ]
)
```

## UI Component Selection

| Component | Use Case | Code |
|-----------|----------|------|
| `CopilotSidebar` | Persistent assistant | `<CopilotSidebar>{children}</CopilotSidebar>` |
| `CopilotPopup` | Floating chat bubble | `<CopilotPopup />` |
| `CopilotChat` | Embedded inline chat | `<CopilotChat />` |
| Headless | Full custom UI | `useCopilotChat()` |

## Theming

```tsx
const theme: React.CSSProperties = {
  "--copilot-kit-primary-color": "#4285f4",      // Google Blue
  "--copilot-kit-contrast-color": "#ffffff",
  "--copilot-kit-background-color": "#f8f9fa",
  "--copilot-kit-secondary-color": "#e8eaed",
};

<div style={theme}>
  <CopilotSidebar
    labels={{
      title: "ADK Assistant",
      initial: "How can I help?",
      placeholder: "Ask me anything...",
    }}
  >
    {children}
  </CopilotSidebar>
</div>
```

## Multi-Agent Setup

```python
from google.adk.agents import LlmAgent

# Specialized agents
weather_agent = LlmAgent(
    name="weather_agent",
    model="gemini-2.5-flash",
    description="Handles weather-related queries",
    instruction="You are a weather specialist.",
    tools=[get_weather, get_forecast]
)

shopping_agent = LlmAgent(
    name="shopping_agent",
    model="gemini-2.5-flash",
    description="Handles product search and shopping",
    instruction="You are a shopping assistant.",
    tools=[search_products, add_to_cart]
)

# Router agent that delegates
root_agent = LlmAgent(
    name="router_agent",
    model="gemini-2.5-flash",
    instruction="""Route user requests to the appropriate specialist:
    - Weather questions → weather_agent
    - Shopping/products → shopping_agent
    - General questions → answer directly""",
    tools=[weather_agent, shopping_agent]  # Agents as tools
)
```

## Development Scripts

```json
// package.json (root)
{
  "scripts": {
    "dev": "concurrently \"bun run dev:agent\" \"bun run dev:ui\"",
    "dev:agent": "cd backend && python agent.py",
    "dev:ui": "cd frontend && bun dev",
    "dev:debug": "DEBUG=true bun run dev"
  }
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Add CORS middleware to FastAPI |
| Agent not responding | Check `GOOGLE_API_KEY` is set |
| State not syncing | Verify agent name matches in `useCoAgent` |
| Tools not rendering | Ensure tool name in `useRenderToolCall` matches exactly |

### CORS Fix

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
