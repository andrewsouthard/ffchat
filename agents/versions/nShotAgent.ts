import { Database } from "bun:sqlite";
import { callLLM, extractQueryFromMarkdown, getTableDefinitions, queryDB } from "../helpers";

export default async function askAgent(question: string, db: Database, onMessageCallback: Function, model?: string) {
    const tables = getTableDefinitions(db)
    const systemMessage = {
        role: 'system',
        content: `You are a fantasy football expert. I have an sqlite database containing stats for NFL players you should use to answer the following questions, concerned with fantasy football and understanding how stats and points are connected. Below are the tables in the database. Use them when generating queries. Do not use any other tables. ${tables}.`
    }

    const examplesToUse: string = examples.map(e => `Question: ${e.question}\nAnswer: ${e.answer}`).join("\n")

    const userMessage = {
        role: 'user', content: `Write an sqlite query to answer the following question: 
    ${question}
    Think step by step. Verify each column that is used exists in the schema. Some example queries for reference are:
   ${examplesToUse}
    ` }
    try {
        const llmResult = await callLLM([userMessage], onMessageCallback, model)
        const query = extractQueryFromMarkdown(llmResult);
        const result = queryDB(db, query)
        onMessageCallback(`Query: ${query}`)
        onMessageCallback(`Result:`)
        onMessageCallback(JSON.stringify(result))
        return { query, result };
    } catch (e) {
        onMessageCallback("Error: " + e)
    }
}


const examples = [
    {
        question: "How many total yards did Josh Allen pass for in 2023?",
        answer: `select p.name as player_name, sum(passing_yards) as total_yards from stats_by_game s JOIN players p on p.id = s.player_id where season_type="REG" and season=2023 and p.name="Josh Allen";`
    },
    {
        question: "Which wide receivers had the highest average fantasy points for the past two seasons?",
        answer: "select p.name as player_name, avg(s.fantasy_points) as avg_points from stats_by_game s JOIN players p on p.id = s.player_id where season_type='REG' and season in (2023, 2022) and p.position='WR' group by player_name order by avg_points desc limit 10;"
    },
    {
        question: "Who was the highest average scoring tight end in 2023 who played in at least 10 games?",
        answer: "SELECT p.name, AVG(s.fantasy_points) AS total_points FROM stats_by_game s JOIN players p ON s.player_id = p.id WHERE s.season = 2023 and s.season_type='REG' AND s.position = 'TE' AND s.carries + s.receptions > 0 GROUP BY p.name HAVING COUNT(s.week) >= 10 ORDER BY total_points DESC  LIMIT 1;"
    },
    {
        question: "Who are the highest scoring players who played the fewest number of games in 2023?",
        answer: "SELECT p.name,SUM(s.fantasy_points)AS total_points,COUNT(s.week)AS num_games FROM stats_by_game s JOIN players p ON s.player_id=p.id WHERE s.season=2023 AND s.season_type='REG' GROUP BY p.name ORDER BY num_games ASC, total_points DESC LIMIT 10;"
    },
    {
        question: "Who did Kyren Williams play for in 2023",
        answer: "SELECT DISTINCT team_name FROM teams t JOIN stats_by_game sg ON sg.recent_team=t.team_abbr JOIN players p ON p.id=sg.player_id WHERE p.name='Kyren Williams' AND sg.season=2023;"
    }
];