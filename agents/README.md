# Fantasy Football LLM Agents

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

You can also run the server, which opens a web socket connection that can be used with the Agent Face Off web tool.

```bash
bun run server.ts
```

## Agent Evals

There is a test suite for each agent under the `tests` directory. It can be run by substituting the agent name in the command below. The `--rerun-each` option allows us to test the responses across multiple runs. This is used to mitigate the impact of one-off errors.

```bash
bun test cot --rerun-each 3
```
