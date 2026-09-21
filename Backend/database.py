import psycopg2
try:
    conn = psycopg2.connect(
        dbname='hospital_db',
        user='postgres',
        password='laiba',
        host='127.0.0.1'
    )
    print("Connected successfully")

except psycopg2.Error as e:
    print("Connection failed:", e)