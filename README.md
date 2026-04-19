# 🤖 Ollama Chatbot — Angular + .NET 8 + Llama3.2

A full-stack AI chatbot that runs **100% locally** on your machine. No API keys, no cloud costs, no data leaving your system. Built with Angular 17 (frontend), .NET 8 (backend), and [Ollama](https://ollama.com) running the `llama3.2` language model.

---

## 📸 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17 |
| Backend | .NET 8 Web API |
| AI Engine | Ollama (llama3.2) |
| Communication | REST API (HttpClient) |
| API Docs | Swagger UI |

---

## 📁 Project Structure

```
ollama-chatbot/
│
├── AI.Frontend/                        # Angular 17 app
│   ├── src/
│   │   └── app/
│   │       ├── core/
│   │       │   └── services/
│   │       │       ├── api.service.ts          # Handles HTTP calls to .NET backend
│   │       │       └── api.service.spec.ts
│   │       ├── features/
│   │       │   └── chat/
│   │       │       ├── chat.component.ts        # Chat UI logic
│   │       │       ├── chat.component.html      # Chat UI template
│   │       │       ├── chat.component.css       # Chat styles
│   │       │       └── chat.component.spec.ts
│   │       ├── app.component.ts
│   │       ├── app.component.html
│   │       └── app.component.css
│   ├── angular.json
│   └── package.json
│
├── AI.Backend/                         # .NET 8 Web API
│   ├── Controllers/
│   │   └── ChatController.cs           # Chat endpoint
│   ├── Models/
│   │   ├── ChatRequest.cs
│   │   ├── ChatResponse.cs
│   │   └── OllamaResponse.cs
│   ├── Services/
│   │   └── OllamaService.cs            # Ollama HttpClient logic
│   └── Program.cs                      # App configuration
│
├── .gitignore
└── README.md
```

---

## ⚙️ Prerequisites

Make sure you have the following installed before running this project:

| Tool | Version | Download |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| Angular CLI | 17+ | `npm install -g @angular/cli` |
| .NET SDK | 8.0+ | https://dotnet.microsoft.com/download |
| Ollama | Latest | https://ollama.com/download |
| Git | Any | https://git-scm.com |

---

## 🦙 Step 1 — Set Up Ollama (AI Engine)

Ollama runs the AI model locally on your machine.

### Install Ollama

Download and install from: **https://ollama.com/download**

> On Windows, Ollama installs as a background service and starts automatically. You will see the Ollama icon in your system tray.

### Verify Ollama is Running

Open your browser and go to:
```
http://localhost:11434
```
You should see: `Ollama is running` ✅

> If you see an error when running `ollama serve`, it means Ollama is already running in the background — this is completely normal on Windows.

### Pull the AI Model

Open a terminal and run:
```bash
ollama pull llama3.2
```

This downloads the `llama3.2` model (~2 GB). Wait for the download to complete.

### Pre-warm the Model (Important!)

Pre-loading the model avoids slow first responses:
```bash
ollama run llama3.2
```
Type anything, get a response, then exit:
```
/bye
```

### Useful Ollama Commands

```bash
ollama list           # See all downloaded models
ollama ps             # See currently running models
ollama stop llama3.2  # Stop model and free RAM
ollama rm llama3.2    # Delete model from disk
```

---

## 🔧 Step 2 — Set Up the Backend (.NET 8)

### Clone the Repository

```bash
git clone https://github.com/AnilThakur007/ollama-chatbot.git
cd ollama-chatbot
```

### Navigate to Backend Folder

```bash
cd AI.Backend
```

### Restore Dependencies

```bash
dotnet restore
```

### Run the Backend

```bash
dotnet run
```

You should see:
```
Building...
info: Now listening on: http://localhost:5063
info: Application started. Press Ctrl+C to shut down.
```

### Verify Backend is Working

Open Swagger UI in your browser:
```
http://localhost:5063/swagger
```

#### Test the API via Swagger:
1. Click **POST /api/chat**
2. Click **Try it out**
3. Paste the following in the request body:
```json
{
  "message": "Hello, who are you?"
}
```
4. Click **Execute**
5. You should get a response from `llama3.2` ✅

---

## 🌐 Step 3 — Set Up the Frontend (Angular 17)

### Open a New Terminal and Navigate to Frontend

```bash
cd AI.Frontend
```

### Install Dependencies

```bash
npm install
```

### Run the Angular App

```bash
ng serve
```

Open your browser and go to:
```
http://localhost:4200
```

Your chatbot is now running! 🎉

---

## 🔄 How It Works — Data Flow

```
User types message in Angular (port 4200)
        │
        │  POST /api/chat  { "message": "Hello" }
        ▼
.NET 8 Backend (port 5063)
        │
        │  1. Health check → GET http://localhost:11434/
        │  2. POST http://localhost:11434/api/generate
        │     { model: "llama3.2", prompt: "Hello", stream: false }
        ▼
Ollama AI Engine (port 11434)
        │
        │  { "response": "Hi! I am an AI assistant...", "done": true }
        ▼
.NET Backend parses and returns
        │
        │  { "Response": "Hi! I am an AI assistant..." }
        ▼
Angular displays response to user ✅
```

---

## 🗂️ Backend Architecture

### `Program.cs`
Handles app setup only — CORS, HttpClient registration, Swagger, and controller mapping. Kept minimal and clean.

### `Controllers/ChatController.cs`
Exposes the `POST /api/chat` endpoint. Validates input, calls `OllamaService`, handles errors, and returns structured responses.

### `Services/OllamaService.cs`
All Ollama communication logic lives here:
- `IsOllamaRunningAsync()` — health check before every request
- `SendMessageAsync(message)` — sends prompt to Ollama and returns AI response

### `Models/`
- `ChatRequest.cs` — shape of incoming request from Angular `{ Message }`
- `ChatResponse.cs` — shape of outgoing response to Angular `{ Response }`
- `OllamaResponse.cs` — shape of Ollama's raw JSON response `{ response, done }`

---

## 🗂️ Frontend Architecture

### `core/services/api.service.ts`
Handles all HTTP communication with the .NET backend. Centralized service used across the app.

### `features/chat/chat.component.ts`
Main chat UI component — handles user input, calls `ApiService`, and displays AI responses.

---

## ⚡ Running All Three Services

Keep **3 separate terminal windows** open simultaneously:

| Terminal | Folder | Command | URL |
|---|---|---|---|
| Ollama | anywhere | auto-runs in background | http://localhost:11434 |
| Backend | `AI.Backend/` | `dotnet run` | http://localhost:5063/swagger |
| Frontend | `AI.Frontend/` | `ng serve` | http://localhost:4200 |

---

## 🛠️ Configuration

### Change the AI Model

In `AI.Backend/Services/OllamaService.cs`, update the model name:
```csharp
model = "llama3.2",  // Change to any model you've pulled
```

Other available models you can pull and use:
```bash
ollama pull phi3          # Smaller, faster (~2.2 GB)
ollama pull llama3.1:8b   # More capable (~4.7 GB)
ollama pull mistral       # Great for coding (~4.1 GB)
```

### Change Response Length & Creativity

In `AI.Backend/Services/OllamaService.cs`:
```csharp
options = new {
    num_predict = 500,   // Max tokens in response (increase for longer answers)
    temperature = 0.7    // 0 = focused/deterministic, 1 = more creative
}
```

### Change Frontend API URL

In `AI.Frontend/src/app/core/services/api.service.ts`:
```typescript
private backendUrl = 'http://localhost:5063'; // Update if backend port changes
```

---

## 🚨 Troubleshooting

### Ollama not responding
```bash
# Check if Ollama is running
curl http://localhost:11434

# If not running, start it
ollama serve
```

### `ollama serve` gives "port already in use" error
This is normal on Windows — Ollama is already running as a background service. Just proceed to `dotnet run`.

### Backend timeout on first request
Pre-warm the model before starting the backend:
```bash
ollama run llama3.2
# Chat with it once, then type /bye
```

### CORS error in browser console
Make sure `Program.cs` has the correct Angular origin in the CORS policy:
```csharp
policy.WithOrigins("http://localhost:4200")
```

### `dotnet run` fails — missing packages
```bash
cd AI.Backend
dotnet restore
dotnet build
dotnet run
```

### Angular not connecting to backend
- Check that `dotnet run` output shows `Now listening on: http://localhost:5063`
- Verify the URL in `api.service.ts` matches that port

### `npm install` fails
```bash
cd AI.Frontend
npm cache clean --force
npm install
```

---

## 📦 .gitignore

```gitignore
# Angular
AI.Frontend/node_modules/
AI.Frontend/dist/
AI.Frontend/.angular/

# .NET
AI.Backend/bin/
AI.Backend/obj/
AI.Backend/*.user

# General
.env
.DS_Store
Thumbs.db
```

---

## 🔮 Future Improvements

- [ ] Add streaming responses (word-by-word like ChatGPT)
- [ ] Chat history / conversation memory
- [ ] Multiple model selection from UI dropdown
- [ ] Docker Compose setup for one-command startup
- [ ] Authentication with JWT
- [ ] Dark/light theme toggle

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙌 Acknowledgements

- [Ollama](https://ollama.com) — for making local LLMs incredibly easy to run
- [Meta](https://ai.meta.com) — for the open-source Llama 3.2 model
- [Microsoft](https://dotnet.microsoft.com) — for .NET 8
- [Angular Team](https://angular.dev) — for Angular 17
