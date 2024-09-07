import { Database } from "bun:sqlite";
import { callLLM, extractQueryFromMarkdown, getTableDefinitions, queryDB } from "../helpers"

const c3TableDefinitionsQuery = `
SELECT 
   lower(m.name) || '(' || 
    group_concat(p.name, ', ') || ')' as sql
FROM 
    sqlite_master m
LEFT JOIN 
    pragma_table_info(m.name) p
WHERE 
    m.type = 'table' AND 
    m.name NOT LIKE 'sqlite_%'
GROUP BY 
    m.name
ORDER BY 
    m.name;
`

const baseC3Prompt = [
	{
		role: 'system',
		content: "You are now an excellent SQL writer, first I'll give you some tips and examples, and I need you to remember the tips, and do not make same mistakes."
	},
	{
		role: 'user',
		content: `Tips 1:
Question: Which A has most number of B?
Gold SQL: select A from B group by A order by count ( * ) desc limit 1;
Notice that the Gold SQL doesn't select COUNT(*) because the question only wants to know the A and the number should be only used in ORDER BY clause, there are many questions asks in this way, and I need you to remember this in the the following questions.`
	},
	{
		role: 'assistant',
		content:
			"Thank you for the tip! I'll keep in mind that when the question only asks for a certain field, I should not include the COUNT(*) in the SELECT statement, but instead use it in the ORDER BY clause to sort the results based on the count of that field."
	},
	{
		role: 'user',
		content: `Tips 2:
	Don't use "IN", "OR", "LEFT JOIN" as it might cause extra results, use "INTERSECT" or "EXCEPT" instead, and remember to use "DISTINCT" or "LIMIT" when necessary.
For example,
	Question: Who are the A who have been nominated for both B award and C award ?
		Gold SQL should be: select A from X where award = 'B' intersect select A from X where award = 'C';`
	},
	{
		role: 'assistant',
		content: `Thank you for the tip! I'll remember to use "INTERSECT" or "EXCEPT" instead of "IN", "NOT IN", or "LEFT JOIN" when I want to find records that match or don't match across two tables.Additionally, I'll make sure to use "DISTINCT" or "LIMIT" when necessary to avoid repetitive results or limit the number of results returned.`
	}
]

export default async function askAgent(question: string, db: Database, onMessageCallback: Function, model?: string) {
	const tables = getTableDefinitions(db, c3TableDefinitionsQuery)
	const tablesWithComments = tables.split("\n").map(t => `# ${t}`).join("\n")
	const promptWithSchema = {
		role: 'user',
		content: `
### Complete sqlite SQL query only and with no explanation, and do not select extra columns that are not explicitly requested in the query.
### Sqlite SQL tables, with their properties:
#
${tablesWithComments}
#
### ${question}
SELECT`
	}

	try {
		const sqlQuery = await callLLM(baseC3Prompt.concat(promptWithSchema), onMessageCallback, model);
		const result = queryDB(db, extractQueryFromMarkdown(sqlQuery))
		onMessageCallback(`Query: ${sqlQuery}`)
		onMessageCallback(`Result:`)
		onMessageCallback(JSON.stringify(result))
		return { query: sqlQuery, result };
	} catch (e) {
		onMessageCallback("Error: " + e)
	}
}