# NFL Stats

1. Setup

```
brew install datasette
brew install snappy
CPPFLAGS="-I/opt/homebrew/include -L/opt/homebrew/lib" pipenv install python-snappy
pipenv install
```

1. Get data for the latest year by updating `get_data.py` which will dump the relevant data into `data.db`.

```
pipenv shell
python3 get_data.py
```

2. Use datasette to explore the database.

```
datasette serve data.db
```

Some helpful notes:

- In the `stats_by_game` table, the `player_id` is the `gsis_id` in the `players` table.

## Queries

Display the highest scoring games ever

```
select player_display_name, position, season, fantasy_points_ppr from stats_by_game where season_type = "REG" order by fantasy_points_ppr desc limit 30;
```

Get highest points over a whole season

```
select player_display_name, position, season, fantasy_points_ppr, sum(fantasy_points_ppr) as total_points from stats_by_game where season_type = "REG" group by player_display_name, season order by total_points desc limit 30;
```

Highest Points per position for a season

```
select player_display_name, position, season, sum(fantasy_points_ppr) as total_points from stats_by_game where position="WR" and season=2020 and season_type = "REG" group by player_display_name order by total_points desc limit 15;
```
