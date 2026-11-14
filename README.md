# Nodebase ⚡

**Nodebase** is an open-source, visual AI workflow automation platform. Build, orchestrate, and monitor complex multi-step AI pipelines, webhook handlers, and API integrations using a modern drag-and-drop canvas powered by Next.js, React Flow, Inngest, Prisma, and the Vercel AI SDK.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Supported Nodes](#-supported-nodes)
  - [Triggers](#1-triggers)
  - [AI & LLM Nodes](#2-ai--llm-nodes)
  - [Actions & Integrations](#3-actions--integrations)
- [Workflow Execution Architecture](#-workflow-execution-architecture)
- [Context & Templating Engine](#-context--templating-engine)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Running the App](#running-the-app)
  - [Testing Webhooks Locally](#testing-webhooks-locally)
- [Database Schema](#-database-schema)
- [Scripts Reference](#-scripts-reference)
- [License](#-license)

---

## 🌟 Overview

Nodebase bridges the gap between no-code visual workflow builders and high-performance developer workflows. Connect triggers (such as manual buttons, Google Forms, or Stripe webhooks) to leading LLM models (Google Gemini, OpenAI GPT, Anthropic Claude) and downstream actions (custom HTTP requests, Discord notifications).

Every workflow is represented as a **Directed Acyclic Graph (DAG)** executed reliably in the background through **Inngest**, complete with step-by-step checkpointing, retries, and **real-time execution streaming** directly onto the canvas.

---

## ✨ Key Features

- **Interactive Visual Editor**: Built on `@xyflow/react` (React Flow 12) featuring custom nodes, smooth connection bezier edges, minimap, controls, grid snapping, and slide-over node selector drawers.
- **Durable Background Execution**: Powered by [Inngest](https://www.inngest.com). Workflows run asynchronously with durable step execution, error recovery, automatic retries, and failure handlers.
- **Topological DAG Ordering**: Nodebase automatically sorts and executes nodes in topological dependency order using `toposort`, preventing race conditions and detecting circular dependencies.
- **Live Real-Time Status Streaming**: Utilizes `@inngest/realtime` subscriptions to stream node status updates (`loading` ➜ `success` / `error`) in real time with animated status borders and spinners directly on the canvas.
- **Multi-Model LLM Orchestration**: Native integration with the Vercel AI SDK (`ai`), supporting Google Gemini, OpenAI, and Anthropic Claude models.
- **Dynamic Context Interpolation**: Pass data effortlessly between nodes using **Handlebars** syntax (`{{variableName.aiResponse}}`, `{{json payload}}`).
- **Encrypted Credentials Vault**: Sensitive API keys and tokens are securely encrypted at rest in PostgreSQL using AES encryption (`cryptr`) via a dedicated credentials manager.
- **Execution History & Output Viewer**: Detailed execution logs tracking execution duration, status, error stack traces, formatted markdown response viewers, and raw JSON outputs.
- **Authentication & Subscription Gating**: Built with **Better Auth** supporting credentials, Google, and GitHub OAuth, alongside **Polar.sh** subscription management for premium tiers.
- **Full-Stack Type Safety**: End-to-end type safety across the database (Prisma 7), API layer (tRPC 11 & React Query 5), and schema validation (Zod 4).

---

## 🧩 Supported Nodes

### 1. Triggers

Triggers initiate the workflow and supply initial data to the workflow execution context:

| Trigger Node | Description | Provided Context Variables |
| :--- | :--- | :--- |
| **Manual Trigger** | Execute on-demand directly from the editor canvas via the "Execute Workflow" button. | Custom manual inputs or empty initial payload. |
| **Google Form Trigger** | Webhook endpoint (`/api/webhooks/google-form?workflowId=<id>`) that triggers when a Google Form is submitted. Includes an auto-generated Google Apps Script snippet. | `{{googleForm.responses.<QuestionTitle>}}`, `{{googleForm.respondentEmail}}`, `{{googleForm.formTitle}}`, `{{googleForm.timestamp}}` |
| **Stripe Trigger** | Webhook endpoint (`/api/webhooks/stripe?workflowId=<id>`) receiving live Stripe events (e.g. checkout sessions, charges, subscriptions). | `{{stripe.eventType}}`, `{{stripe.eventId}}`, `{{stripe.raw.<field>}}` |

### 2. AI & LLM Nodes

AI nodes execute LLM prompts via the Vercel AI SDK and store generated responses under a specified variable name (`[variableName].aiResponse`):

| Node | Supported Models | Description |
| :--- | :--- | :--- |
| **Google Gemini** | `gemini-3.8-flash`, `gemini-3.5-flash-lite`, `gemini-3.5-flash`, `gemini-1.5-flash`, `gemini-1.5-pro` | Run prompts using your encrypted Google Gemini API key with system prompts and dynamic Handlebars context. |
| **OpenAI** | `gpt-4o`, `gpt-4o-mini`, `o3-mini`, `gpt-4-turbo` | Execute OpenAI completions with customized system and user instructions. |
| **Anthropic** | `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022`, `claude-3-opus-20240229` | Generate responses with Anthropic's Claude models. |

### 3. Actions & Integrations

| Node | Description | Configuration Options |
| :--- | :--- | :--- |
| **HTTP Request** | Performs outbound HTTP calls to third-party APIs or webhooks. | Method (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`), endpoint URL, JSON payload, and custom variable assignment. Stores `{ httpResponse: { status, statusText, data } }`. |
| **Discord** | Posts formatted messages into Discord channels via incoming webhooks. | Webhook URL, bot username, and templated message content (up to 2,000 characters). |

---

## 🔄 Workflow Execution Architecture

```
┌────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│ Webhook Event  │ ───► │ Inngest Event Pipeline  │ ───► │   Topological Sorting   │
│ (Stripe/Forms) │      │ (execute-workflow func) │      │  (DAG Dependency Order) │
└────────────────┘      └─────────────────────────┘      └────────────┬────────────┘
        ▲                                                             │
        │                                                             ▼
┌────────────────┐                                       ┌─────────────────────────┐
│ Manual Trigger │                                       │     Step Execution      │
│  (UI Button)   │                                       │ (Inngest durable steps) │
└────────────────┘                                       └────────────┬────────────┘
                                                                      │
                         ┌────────────────────────────────────────────┴────────────────────────────────────────────┐
                         ▼                                                                                         ▼
             ┌───────────────────────┐                                                                 ┌───────────────────────┐
             │   AI / Action Node    │                                                                 │   Inngest Realtime    │
             │ (Gemini/OpenAI/Ky/..) │                                                                 │ (Channel Status Sync) │
             └───────────┬───────────┘                                                                 └───────────┬───────────┘
                         │                                                                                         │
                         ▼                                                                                         ▼
             ┌───────────────────────┐                                                                 ┌───────────────────────┐
             │ Context Accumulator   │                                                                 │ Visual Canvas Nodes   │
             │  (Shared JSON State)  │                                                                 │ (Live Spinner/Status) │
             └───────────┬───────────┘                                                                 └───────────────────────┘
                         │
                         ▼
             ┌───────────────────────┐
             │  PostgreSQL Database  │
             │ (Execution History)   │
             └───────────────────────┘
```

1. **Trigger Phase**: A webhook (`/api/webhooks/*`) or manual UI click dispatches a `workflows/execute.workflow` event to Inngest with initial data.
2. **Graph Compilation**: The workflow's nodes and connections are fetched from PostgreSQL and topologically sorted using `toposort` to guarantee that parents execute before children.
3. **Step Execution**: Inngest processes each node in sequence. Each node:
   - Emits a `"loading"` event through `@inngest/realtime`.
   - Resolves templates via Handlebars using the cumulative execution context.
   - Executes external API calls or AI model generations.
   - Updates the cumulative context with output under `data.variableName`.
   - Emits a `"success"` (or `"error"`) event via Inngest Realtime.
4. **Persistence & UI Reflection**: Canvas nodes highlight in real time without refreshing. The final execution output, duration, and error logs (if any) are committed to the `Execution` model in PostgreSQL.

---

## 🪄 Context & Templating Engine

Nodebase uses **Handlebars** for expression interpolation. Whenever a node executes, its result is merged into the execution context using the **Variable Name** defined in that node's settings.

### Examples

#### 1. Referencing Google Form Responses in an AI Node
```handlebars
A new customer submitted feedback for {{googleForm.formTitle}}:
Respondent Email: {{googleForm.respondentEmail}}
Feedback: {{googleForm.responses.[Your Feedback]}}

Please draft a personalized, empathetic response email.
```

#### 2. Sending AI Output to Discord
```handlebars
**New AI Summary Generated:**

{{summaryAi.aiResponse}}
```

#### 3. Stringifying Full Context in an HTTP Request Body
```handlebars
{
  "event": "workflow_completed",
  "data": {{{json summaryAi}}}
}
```

> **Tip:** Use `{{{json variableName}}}` or `{{json variableName}}` to safely stringify objects into JSON format for HTTP requests or prompts.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19) |
| **Workflow Canvas** | [@xyflow/react](https://reactflow.dev/) (React Flow v12), [Jotai](https://jotai.org/) |
| **Orchestration & Queue** | [Inngest](https://www.inngest.com/) (`inngest`, `@inngest/realtime`, Inngest CLI) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/), [Prisma ORM 7](https://www.prisma.io/) (`@prisma/adapter-pg`) |
| **API & Data Fetching** | [tRPC v11](https://trpc.io/), [TanStack React Query v5](https://tanstack.com/query) |
| **AI SDK** | [Vercel AI SDK](https://sdk.vercel.ai/) (`@ai-sdk/google`, `@ai-sdk/openai`, `@ai-sdk/anthropic`) |
| **Authentication** | [Better Auth](https://www.better-auth.com/) (Email/Password, Google & GitHub OAuth) |
| **Subscriptions & Payments** | [Polar.sh](https://polar.sh/) (`@polar-sh/better-auth`, `@polar-sh/sdk`) |
| **Styling & Components** | [Tailwind CSS v4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/) |
| **Security** | [Cryptr](https://www.npmjs.com/package/cryptr) (AES encryption for credentials) |
| **Observability** | [Sentry](https://sentry.io/) (`@sentry/nextjs`) |
| **Tooling & Code Quality** | [Biome](https://biomejs.dev/), TypeScript 5, [mprocs](https://github.com/pvolok/mprocs) |

---

## 📁 Project Structure

```
nodebase/
├── prisma/
│   └── schema.prisma             # Database schema (User, Workflow, Node, Connection, Credential, Execution)
├── public/                       # Static brand logos, favicons, and assets
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Login & signup pages
│   │   ├── (dashboard)/
│   │   │   ├── (editor)/         # Interactive React Flow editor (/workflows/[workflowId])
│   │   │   └── (rest)/           # Workflows, Credentials, and Executions dashboard views
│   │   └── api/                  # API routes (Inngest, tRPC, Webhooks, Auth)
│   ├── components/               # Common UI components, headers, sidebars, and base nodes
│   │   ├── react-flow/           # React Flow handles, base nodes, and live status spinners
│   │   └── ui/                   # Radix UI design system primitives
│   ├── config/                   # Constants and node registry mappings
│   ├── features/                 # Domain-driven features
│   │   ├── auth/                 # Authentication components & forms
│   │   ├── credentials/          # Encrypted API key storage, forms & tRPC routers
│   │   ├── editor/               # Canvas state (Jotai), headers, save & execute controls
│   │   ├── executions/           # Execution history viewers, markdown renderers & node executors
│   │   ├── subscriptions/        # Polar.sh subscription status hooks & upgrade modals
│   │   ├── triggers/             # Trigger nodes (Manual, Google Form, Stripe) & dialogs
│   │   └── workflows/            # Workflow management, hooks, and tRPC endpoints
│   ├── inngest/                  # Inngest client, channels, functions, and DAG topological sorter
│   ├── lib/                      # Auth configuration, DB client, encryption utilities, and Polar SDK
│   └── trpc/                     # tRPC initialization, routers, server/client hydrate wrappers
├── .env.example                  # Environment variable template
├── mprocs.yaml                   # Concurrent local process runner configuration
├── package.json
└── tsconfig.json
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory modeled after `.env.example`:

```bash
# PostgreSQL Database URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nodebase?schema=public"

# App & Better-Auth Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="change-this-to-a-secure-random-32-char-secret"

# Credential Encryption Key (Must be 32 characters, used to encrypt API keys in DB)
ENCRYPTION_KEY="your-32-character-encryption-key-here"

# (Optional) Social Logins - Better-Auth
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# (Optional) Polar.sh Subscriptions
POLAR_ACCESS_TOKEN=""
POLAR_SUCCESS_URL="http://localhost:3000"

# (Optional) Inngest Production Configuration
# In local development, the Inngest Dev Server works without these keys.
# INNGEST_EVENT_KEY=""
# INNGEST_SIGNING_KEY=""
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 20.x or later
- **Package Manager**: `npm`, `pnpm`, or `bun`
- **PostgreSQL**: A local PostgreSQL instance or hosted database (e.g. Supabase, Neon)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/nodebase.git
   cd nodebase
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Update DATABASE_URL, BETTER_AUTH_SECRET, and ENCRYPTION_KEY in .env
   ```

4. **Initialize database & generate Prisma client:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

### Running the App

To run the entire development environment (Next.js dev server + Inngest Dev Server) concurrently:

```bash
npm run dev:all
```

Alternatively, run each service in separate terminal tabs:

```bash
# Terminal 1: Inngest Dev Server (Orchestration & Event Inspector)
npm run inngest:dev

# Terminal 2: Next.js Development Server (Turbopack)
npm run dev
```

- Open **[http://localhost:3000](http://localhost:3000)** to access Nodebase.
- Open **[http://localhost:8288](http://localhost:8288)** to inspect Inngest events, runs, and step functions.

### Testing Webhooks Locally

To receive webhooks locally from external services like Stripe or Google Forms:

```bash
npm run ngrok:dev
# or use your own tunnel: npx ngrok http 3000
```

Update `NEXT_PUBLIC_APP_URL` in your `.env` with your tunnel URL so generated webhook links reflect the public domain.

---

## 🗄️ Database Schema

The database schema is defined in [`prisma/schema.prisma`](./prisma/schema.prisma):

- **`User`**: Account owner, auth profiles, and relations to workflows and credentials.
- **`Credential`**: Encrypted API keys (OpenAI, Gemini, Anthropic, Discord) tied to specific users.
- **`Workflow`**: Workflow definitions, containing visual nodes and connection edges.
- **`Node`**: Visual graph nodes (stores position, type, credentials, and custom JSON configuration).
- **`Connection`**: Directional links between nodes (`fromNodeId` ➜ `toNodeId`).
- **`Execution`**: Historical execution runs containing status (`RUNNING`, `SUCCESS`, `FAILED`), outputs, and error stacks linked to Inngest event IDs.

---

## 📜 Scripts Reference

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with Turbopack. |
| `npm run inngest:dev` | Launches the local Inngest background dev server & UI dashboard. |
| `npm run dev:all` | Runs both Next.js and Inngest concurrently using `mprocs`. |
| `npm run build` | Generates the Prisma client, synchronizes database schemas, and builds the production bundle. |
| `npm run start` | Starts the compiled production application. |
| `npm run lint` | Checks code formatting and quality using Biome. |
| `npm run format` | Automatically formats codebase files using Biome. |
| `npm run ngrok:dev` | Spawns an ngrok tunnel on port 3000 for webhook testing. |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
