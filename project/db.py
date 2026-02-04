import sqlite3

connection = sqlite3.connect('supply_chain.db')

with open('schema.sql') as f:
    connection.executescript(f.read())

cur = connection.cursor()

print("Database initialized successfully with your schema!")
connection.commit()
connection.close()