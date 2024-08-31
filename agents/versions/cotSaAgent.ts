import { Database } from "bun:sqlite";
import { callLLM, extractQueryFromMarkdown, getTableDefinitions, queryDB, limitQuery } from "../helpers";

export default async function askAgent(question: string, db: Database, onMessageCallback: Function) {
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
    const answers = [];
    for (let i = 0; i < 1; i++) {
        try {
            const llmResult = await callLLM([systemMessage, userMessage], onMessageCallback)
            const query = extractQueryFromMarkdown(llmResult);
            const result = queryDB(db, limitQuery(query))
            answers.push(JSON.stringify(result));
        } catch (e) {
            onMessageCallback("Error: " + e)
        }
    }
    try {
        const scQuery = getSCMessage(question, answers);
        onMessageCallback(`Answers: ${JSON.stringify(answers)}`)
        const llmJudgeResult = await callLLM(scQuery, onMessageCallback)
        onMessageCallback(`Query: ${scQuery}`)
        onMessageCallback(`Result:`)
        onMessageCallback(JSON.stringify(llmJudgeResult))
    } catch (e) {
        onMessageCallback("Error: " + e)

    }
}

function getSCMessage(question: string, queries: string[]) {
    const queryText = queries.join("\nPossible Answer: ")
    return [{
        role: 'user',
        // content: `Given the following possible answers to the question "${question}", pick the answer(s) given the majority of the time or in the case where no majority answer exists, chose the best answer. Give the number of the answer following the order they are entered. Possible Answer: ${queryText}`
        content: `You are a fantasy football question answering agent. Answer the question: "${question}", by using this information: ${queries[0]}`
    },
    ]
}


const examples = [
    {
        question: "How many total yards did Josh Allen pass for in 2023?",
        answer: "To answer the question 'How many yards did Josh Allen pass for in 2023?', we can follow a step-by-step process. First, let's identify the columns needed from the schema: 1. `season`: We need this to select the 2023 season. 2. `player_id`: We need this to filter by Josh Allen. 3. `passing_yards`: This column gives us the total yards passed for each game. 4. `name`: This will help us verify that we're filtering by the correct player. Given these requirements, our query should be: ```sql SELECT p.name as player_name, sum(s.passing_yards) as total_passing_yards FROM stats_by_game s JOIN players p on p.id = s.player_id WHERE season_type='REG' and season=2023 and p.name='Josh Allen'; ``` This query will return the total yards Josh Allen passed for in 2023. The `season_type` filter is included to ensure we're only considering regular-season games."
    },
    {
        question: "Which wide receivers had the highest average fantasy points for the past two seasons?",
        //     answer: "select p.name as player_name, avg(s.fantasy_points) as avg_points from stats_by_game s JOIN players p on p.id = s.player_id where season_type='REG' and season in (2023, 2022) and p.position='WR' group by player_name order by avg_points desc limit 10;"
        answer: "To answer the question 'Which wide receivers had the highest average fantasy points for the past two seasons?', we can follow a similar step-by-step process. **Step 1: Identify the columns needed** * `season`: We need this to select the last two seasons (2022 and 2023). * `player_id` and `position`: We need these to filter by wide receivers. * `fantasy_points`: This column gives us the average fantasy points for each game. **Step 2: Determine the criteria for the position** Since we're looking for wide receivers, we can use `position` and `player_id` from the players table to identify them. **Step 3: Write the SQL query** ```sql SELECT p.name as player_name, avg(s.fantasy_points) as average_fantasy_points FROM stats_by_game s JOIN players p on p.id = s.player_id WHERE s.season IN (2022, 2023) AND s.position = 'WR' GROUP BY s.player_id ORDER BY average_fantasy_points DESC LIMIT 20; ``` This query joins the `stats_by_game` and `players` tables to get the player names. It filters for wide receivers by selecting players with positions of 'WR'. The `season` filter is used to select games from 2023 onwards. Finally, it groups the results by player ID, orders them in descending order by average fantasy points and limits results to the top 20. **Verification** * We're using the correct columns (`season`, `player_id`, `position`, and `fantasy_points`) from the schema. * The filter criteria for wide receivers are specified correctly. * The query joins the required tables to retrieve the player names. * The results are grouped and ordered and limited as desired."
    },
    {
        question: "Who was the highest average scoring tight end in 2023 who played in at least 10 games",
        answer: "To answer the question 'Who was the highest average scoring tight end in 2023 who played in at least 10 games?', we can follow a similar step-by-step process. **Step 1: Identify the columns needed** * `season`: We need this to select the 2023 season. * `player_id` and `position`: We need these to filter by tight ends (specifically, those who played in at least 10 games). * `fantasy_points`: This column gives us the average fantasy points for each game. **Step 2: Determine the criteria for the position** Since we're looking for tight ends, we can use `position` and `player_id` from the players table to identify them. Additionally, we need to filter by games played in order to find those who played in at least 10 games. **Step 3: Write the SQL query** ```sql SELECT p.name as player_name, avg(s.fantasy_points) as average_fantasy_points, count(*) as total_games_played FROM stats_by_game s JOIN players p on p.id = s.player_id WHERE season_type='REG' and season=2023 AND p.position = 'TE' GROUP BY s.player_id, p.name HAVING total_games_played >= 10 ORDER BY average_fantasy_points DESC LIMIT 1; ``` This query joins the `stats_by_game` and `players` tables to get the player names. It filters for tight ends by selecting players with positions of 'TE' and regular season games from the 2023 season. The results are grouped by player ID and name, ordered in descending order by average fantasy points, and limited as desired. **Verification** * We're using the correct columns (`season`, `player_id`, `position`, and `fantasy_points`) from the schema. * The filter criteria for tight ends are specified correctly. * The query joins the required tables to retrieve the player names. * The results are grouped, ordered, and limited as desired."
    },
    // {
    //     question: "Who are the highest scoring players who played the fewest number of games in 2023?",
    //     answer: "SELECT p.name,SUM(s.fantasy_points)AS total_points,COUNT(s.week)AS num_games FROM stats_by_game s JOIN players p ON s.player_id=p.id WHERE s.season=2023 AND s.season_type='REG' GROUP BY p.name ORDER BY num_games ASC, total_points DESC LIMIT 10;"
    // },
    // {
    //     question: "Who did Kyren Williams play for in 2023",
    //     answer: "SELECT DISTINCT team_name FROM teams t JOIN stats_by_game sg ON sg.recent_team=t.team_abbr JOIN players p ON p.id=sg.player_id WHERE p.name='Kyren Williams' AND sg.season=2023;"
    // }
];