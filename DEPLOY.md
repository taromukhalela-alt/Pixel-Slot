# Free Deployment Guide: Render + Supabase

This guide explains how to deploy your slot machine app with a PostgreSQL database for **free**.

## Step 1: Create a Supabase Database

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Create a new project
3. In your project dashboard, go to **Settings** → **Database**
4. Copy the **Connection string** (URI format):
   ```
   
   ```

## Step 2: Push Code to GitHub

1. Create a new GitHub repository
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

## Step 3: Deploy on Render

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **New** → **PostgreSQL**
3. Fill in:
   - **Name**: `slots-db` (or any name)
   - **Database**: `slots_db`
   - **User**: `slots_user`
4. Click **Create Database**
5. Once created, copy the **Internal Connection String**

## Step 4: Deploy Web Service

1. In Render dashboard, click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `slots-app`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main:app --bind 0.0.0.0:$PORT`
4. **Add Environment Variables**:
   - Key: `DATABASE_URL`
     Value: Paste the Supabase connection string from Step 1
   
   - Key: `SESSION_SECRET`
     Value: Generate with this command:
     ```bash
     python -c "import secrets; print(secrets.token_hex(32))"
     ```
     Then paste the result. This secures user sessions.

5. Click **Create Web Service**

## Step 5: Configure Your App

Your `DATABASE_URL` environment variable tells your app where the database is.

For Supabase, the format is:
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

For Render PostgreSQL:
```
postgres://slots_user:[PASSWORD]@dpg-xxx-xxx-xxx-a.[REGION].aws.neon.tech:5432/slots_db
```

## Optional: Run Locally with PostgreSQL

1. Install PostgreSQL locally
2. Create a database: `createdb slots_db`
3. Set environment variable:
   ```bash
   export DATABASE_URL="postgresql://localhost:5432/slots_db"
   ```
4. Run: `pip install -r requirements.txt` then `python main.py`

## Migrating Existing SQLite Data

To move data from your existing `slots.db`:

1. Export your SQLite data (you'll need to write a script)
2. Use Supabase's SQL Editor or `psql` to import

Example migration script concept:
```python
import sqlite3
import psycopg2

# Read from SQLite
sqlite_conn = sqlite3.connect('slots.db')
cursor = sqlite_conn.execute('SELECT * FROM users')
columns = [desc[0] for desc in cursor.description]
rows = cursor.fetchall()

# Insert into PostgreSQL
pg_conn = psycopg2.connect(os.environ['DATABASE_URL'])
for row in rows:
    # Convert row tuple to dict and insert
    pass
```

## Files Updated for PostgreSQL

- `database.py` - PostgreSQL connection wrapper
- `requirements.txt` - Dependencies (flask, psycopg2-binary, gunicorn)
- `main.py` - Updated imports and SQL syntax

## Troubleshooting

### "relation does not exist"
- The tables will be created automatically on first run
- Make sure `DATABASE_URL` is set correctly

### "connection refused"
- Check your DATABASE_URL format
- Make sure there are no spaces or extra characters

### Performance issues
- Add indexes on frequently queried columns
- Consider connection pooling settings
