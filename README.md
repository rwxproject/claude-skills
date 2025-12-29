# Claude Skills Collection

A collection of skills for [Claude Code](https://claude.ai/claude-code) that extend Claude's capabilities with specialized knowledge and workflows.

## Available Skills

### Google ADK + CopilotKit

Build full-stack AI agents using Google ADK (Agent Development Kit) with CopilotKit frontend via AG-UI protocol.

**Use cases:**
- Production-ready AI agents with Gemini models
- Multi-tool and multi-agent architectures
- Human-in-the-loop workflows
- Rich React frontends with real-time state sync
- Generative UI (tool-based rendering)

**Triggers:** ADK, Agent Development Kit, Google ADK, AG-UI, agentic UI, Gemini agent, multi-agent, full-stack agent

## Installation

### Option 1: Add from GitHub URL (Recommended)

Run this command in Claude Code:

```
/install-plugin https://github.com/YOUR_USERNAME/claude-skills
```

Replace `YOUR_USERNAME` with the actual GitHub username or organization where this repository is hosted.

### Option 2: Clone and Install Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/claude-skills.git
   ```

2. Install in Claude Code:
   ```
   /install-plugin /path/to/claude-skills
   ```

### Option 3: Install Individual Skills

You can also install skills individually by copying the skill folder to your Claude Code skills directory:

```bash
# Copy skill to Claude Code skills directory
cp -r skills/google-adk-copilotkit ~/.claude/skills/
```

## Usage

Once installed, the skills will automatically activate when relevant topics are detected in your conversation. You can also explicitly invoke a skill:

```
/google-adk-copilotkit
```

### Example Prompts

After installation, try these prompts to activate the Google ADK + CopilotKit skill:

- "Help me build a full-stack AI agent with Google ADK"
- "Create an ADK agent with CopilotKit frontend"
- "Set up a Gemini-powered agent with AG-UI"
- "Build a multi-agent system with ADK"

## Repository Structure

```
claude-skills/
├── .claude-plugin/
│   └── marketplace.json       # Plugin manifest
├── skills/
│   └── google-adk-copilotkit/ # Skill directory
│       ├── SKILL.md           # Skill definition and knowledge
│       ├── references/        # Reference documentation
│       └── assets/            # Templates and examples
└── README.md
```

## Creating Your Own Skills

To add a new skill to this collection:

1. Create a new directory under `skills/`:
   ```bash
   mkdir -p skills/my-new-skill
   ```

2. Create a `SKILL.md` file with YAML frontmatter:
   ```markdown
   ---
   name: my-new-skill
   description: >
     Description of what the skill does.
     Triggers on: keyword1, keyword2, keyword3.
   ---

   # My New Skill

   Skill content goes here...
   ```

3. Update `.claude-plugin/marketplace.json` to include your skill:
   ```json
   {
     "skills": [
       "./skills/google-adk-copilotkit",
       "./skills/my-new-skill"
     ]
   }
   ```

## License

MIT License - feel free to use, modify, and distribute these skills.

## Contributing

Contributions are welcome! Please open an issue or pull request if you'd like to add new skills or improve existing ones.
