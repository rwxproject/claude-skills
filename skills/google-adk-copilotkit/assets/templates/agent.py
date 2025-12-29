"""
ADK Agent Template with AG-UI Integration

Run with: python agent.py
Requires: pip install google-adk ag-ui-adk fastapi uvicorn python-dotenv
"""

import os
from typing import Optional
from dotenv import load_dotenv

from google.adk.agents import LlmAgent
from google.adk.tools.tool_context import ToolContext
from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

# ============================================================================
# TOOLS - Define your agent's capabilities
# ============================================================================

def example_tool(query: str, tool_context: ToolContext) -> dict:
    """Example tool that demonstrates state management.
    
    Args:
        query: The user's query to process.
        tool_context: Automatically injected by ADK for state access.
    
    Returns:
        Result with status and processed data.
    """
    # Update state (syncs to frontend via AG-UI)
    history = tool_context.state.get("history", [])
    history.append(query)
    tool_context.state["history"] = history
    
    return {
        "status": "success",
        "query": query,
        "history_count": len(history)
    }


def get_current_time(timezone: str = "UTC") -> dict:
    """Get the current time in a specified timezone.
    
    Args:
        timezone: Timezone name (e.g., "UTC", "America/New_York").
    
    Returns:
        Current time information.
    """
    from datetime import datetime
    from zoneinfo import ZoneInfo
    
    try:
        tz = ZoneInfo(timezone)
        now = datetime.now(tz)
        return {
            "status": "success",
            "timezone": timezone,
            "time": now.strftime("%H:%M:%S"),
            "date": now.strftime("%Y-%m-%d"),
            "full": now.isoformat()
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============================================================================
# AGENT - Configure your LLM agent
# ============================================================================

root_agent = LlmAgent(
    name="assistant_agent",
    model="gemini-2.5-flash",
    description="A helpful AI assistant.",
    instruction="""You are a helpful AI assistant powered by Google's Agent Development Kit.

Your capabilities:
- Answer questions and have conversations
- Use available tools when helpful
- Maintain context throughout the conversation

Be concise, friendly, and helpful. When using tools, explain what you're doing.""",
    tools=[
        example_tool,
        get_current_time,
        # Add more tools here
    ]
)

# ============================================================================
# AG-UI INTEGRATION - Wrap agent for frontend communication
# ============================================================================

adk_agent = ADKAgent(
    agent=root_agent,
    name="assistant_agent"
)

# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(
    title="ADK Agent",
    description="AI Agent powered by Google ADK with AG-UI protocol"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add AG-UI endpoint
add_adk_fastapi_endpoint(app, adk_agent, path="/")


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "agent": root_agent.name}


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    if not os.getenv("GOOGLE_API_KEY"):
        print("⚠️  Warning: GOOGLE_API_KEY not set!")
        print("   Get one at: https://makersuite.google.com/app/apikey")
        print()
    
    port = int(os.getenv("PORT", 8000))
    print(f"🚀 Starting ADK Agent on http://localhost:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
