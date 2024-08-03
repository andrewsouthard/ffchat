# Fantasy Football LLM Agent v1

1. Install ollama

```
brew install ollama
```

2. Pull the Llama3.1 model

```
ollama pull llama3.1
```

3. Install dependencies

[Install bun](https://bun.sh/docs/installation) if it isn't already installed. Then run:

```bash
bun install
```

4. Run the command line with a question:

```bash
bun run cli.ts "Who had the most passing yards in 2023?"
```

You can also run the server, which opens a web socket connection on port 3000

```bash
bun run server.ts
```
