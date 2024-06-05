import sqlite3
import nfl_data_py as nfl

con = sqlite3.connect("data.db")

def to_sql(data, table_name):
    data.to_sql(name=table_name, con=con, if_exists="replace")

years = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016]

weekly_data = nfl.import_weekly_data(years)
to_sql(weekly_data, "stats_by_game")

# Team information
teams = nfl.import_team_desc()
to_sql(teams, "teams")

# Get player information
players = nfl.import_ids()
to_sql(players, "players")

# Get depth charts
depth_chart = nfl.import_depth_charts(years)
to_sql(depth_chart,"depth_chart")

# Get snap counts
snap_counts = nfl.import_snap_counts(years)
to_sql(snap_counts, "snap_counts") 

# Set each player ID to the gsis_id.
con.execute("ALTER TABLE players RENAME COLUMN gsis_id TO id")
