import sqlite3

conn = sqlite3.connect('database.db')
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    weight REAL,
    fragile INTEGER,
    transfer_time INTEGER,
    risk INTEGER
)
""")

conn.commit()
conn.close()

print("Database created!")