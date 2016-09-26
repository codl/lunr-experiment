import psycopg2
import os
import json
from random import random

db = psycopg2.connect(os.getenv("EQBEATS_POSTGRES", ""))
db.set_client_encoding("utf-8")

cur = db.cursor()

cur.execute("""
    SELECT tracks.id, tracks.title, tracks.date, tracks.notes,
           users.name, users.id
           FROM users, tracks
           WHERE users.id = tracks.user_id AND tracks.visible = 't';
    """)
songs = []
for row in cur:
    song = {
        "id": row[0],
        "title": row[1],
        "date": row[2].isoformat(),
        "description": row[3],
        "artist": row[4],
        "artist_id": row[5]
    }
    songs.append(song)

with open("all.json", 'w') as f:
    json.dump(songs, f, indent=4)

with open("some.json", 'w') as f:
    json.dump(list(filter(lambda _: random() > 0.9, songs)), f, indent=4)

with open("few.json", 'w') as f:
    json.dump(songs[:10], f, indent=4)
