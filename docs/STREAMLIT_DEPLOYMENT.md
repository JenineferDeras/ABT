# Streamlit Dashboard Deployment Guide

## Local Development

### Prerequisites

- Python 3.11+
- Google Cloud service account with Drive API access
- Supabase project with configured secrets

### Setup

1. **Install dependencies**

   ```bash
   pip install -r streamlit_requirements.txt
   ```

2. **Create `.streamlit/secrets.toml`**

   ```toml
   SUPABASE_URL = "your-supabase-url"
   SUPABASE_SERVICE_KEY = "your-service-key"
   GDRIVE_FOLDER_ID = "your-google-drive-folder-id"
   GDRIVE_SERVICE_ACCOUNT = '{"type":"service_account",...}'
   ```

3. **Run locally**
   ```bash
   streamlit run streamlit_app.py
   ```

## Production Deployment

### Option 1: Streamlit Cloud (Recommended)

1. **Push to GitHub**

   ```bash
   git add streamlit_app.py streamlit_requirements.txt .streamlit/config.toml
   git commit -m "feat: add Streamlit dashboard"
   git push origin main
   ```

2. **Deploy on Streamlit Cloud**

   - Go to https://share.streamlit.io
   - Connect your GitHub repo
   - Select `streamlit_app.py` as main file
   - Add secrets in Streamlit Cloud settings

3. **Configure secrets in Streamlit Cloud**
   - Go to App settings → Secrets
   - Paste contents of `.streamlit/secrets.toml`

### Option 2: Railway Deployment

1. **Add Dockerfile for Streamlit**

   ```dockerfile
   # filepath: Dockerfile.streamlit
   FROM python:3.11-slim

   WORKDIR /app

   COPY streamlit_requirements.txt .
   RUN pip install -r streamlit_requirements.txt

   COPY streamlit_app.py .
   COPY .streamlit .streamlit

   EXPOSE 8501

   CMD ["streamlit", "run", "streamlit_app.py", "--server.port=8501", "--server.address=0.0.0.0"]
   ```

2. **Deploy to Railway**
   ```bash
   railway up --dockerfile Dockerfile.streamlit
   ```

### Option 3: Docker Compose (Local/Self-hosted)

```yaml
# filepath: docker-compose.streamlit.yml
version: "3.8"

services:
  streamlit:
    build:
      context: .
      dockerfile: Dockerfile.streamlit
    ports:
      - "8501:8501"
    environment:
      STREAMLIT_SERVER_PORT: 8501
      STREAMLIT_SERVER_ADDRESS: 0.0.0.0
    volumes:
      - ./.streamlit/secrets.toml:/app/.streamlit/secrets.toml:ro
    restart: unless-stopped
```

## Features

### Google Drive Ingestion

- **Real-time file processing** from configured folder
- **Format support**: Excel (.xlsx), Google Sheets, CSV
- **Automatic normalization** of column names and data types
- **Conflict resolution** using deterministic keys

### Risk Assessment Dashboard

- **KPI metrics**: High-risk clients, DPD, LTV, collection rate
- **High-risk portfolio** table with severity sorting
- **Visualizations**:
  - DPD distribution histogram
  - LTV distribution histogram
  - Risk matrix scatter plot (DPD vs LTV vs Risk Severity)

### Scheduled Refresh

- **Daily ML feature refresh** at 6 AM UTC via Supabase cron
- **Refresh logging** to track job execution

## Monitoring

### Check cron job status

```sql
SELECT * FROM cron.job;
```

### View refresh logs

```sql
SELECT * FROM ml_refresh_log ORDER BY refresh_date DESC LIMIT 10;
```

### Monitor Streamlit app

- Local: Open browser to `http://localhost:8501`
- Streamlit Cloud: View logs in deployment dashboard
- Railway: `railway logs`

## Troubleshooting

### "No files found in shared folder"

- Verify GDRIVE_FOLDER_ID is correct
- Check service account has folder access
- Ensure files are not in a subfolder

### "ml_feature_snapshots not found"

- Run ingestion first via Streamlit UI
- Verify `refresh_ml_features()` procedure exists in Supabase
- Check database migrations applied

### "Supabase connection failed"

- Verify SUPABASE_URL and SUPABASE_SERVICE_KEY in secrets
- Check network connectivity
- Verify Supabase project is active

## Security

- ✅ Service account credentials stored in Streamlit secrets
- ✅ Google Drive access restricted to read-only
- ✅ Supabase service role used for ingestion
- ✅ No hardcoded credentials in source code
- ✅ CORS configured for API endpoints

## Cost Estimation

| Service          | Free Tier | Notes                            |
| ---------------- | --------- | -------------------------------- |
| Streamlit Cloud  | 1 app     | Requires verified email          |
| Google Drive API | Free      | Included with workspace          |
| Supabase         | 500MB DB  | Upgrade as needed                |
| Railway          | $5/month  | Or use Streamlit Cloud free tier |
