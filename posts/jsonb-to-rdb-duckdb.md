---
title: Recipe for converting a postgres JSONB column to a table in DuckDB
image:
date: 2024-07-21
tags: [dev, duckdb, postgres]
type: post
---

DuckDB is fast. It took me a minute to figure out how to do this, but here it is, in case it helps someone else:

```sql
SELECT
  events.*
  FROM (
    SELECT
      from_json(data, '{ "id": "INT", "goal": "TEXT" }') as events
    FROM postgres_scan(
      'host=localhost port=5432 dbname=dbname user=postgres password=something_secret', 'public', 'EventsWithJSONData'
    )
  );
```
