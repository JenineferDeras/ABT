import io
import json
import re
from datetime import datetime
import warnings

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from supabase import create_client
import streamlit as st

warnings.filterwarnings("ignore")

# ============================================================================
# Theme & Configuration
# ============================================================================

ABACO_THEME = {
    "colors": {
        "primary": "#C1A6FF",
        "primary_dark": "#5F4896",
        "dark": "#030E19",
        "muted": "#6D7D8E",
        "success": "#10B981",
        "warning": "#FB923C",
        "error": "#DC2626",
    }
}

st.set_page_config(
    page_title="ABACO Financial Intelligence Platform",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown(
    f"""
    <style>
        body {{ background: {ABACO_THEME['colors']['dark']}; color: white; }}
        .stButton>button {{ background: {ABACO_THEME['colors']['primary']}; color: white; border: none; }}
        .metric-number {{ font-size: 2rem; font-weight: 700; }}
        .stMetric {{ background: rgba({int('C1', 16)}, {int('A6', 16)}, {int('FF', 16)}, 0.1); padding: 1rem; border-radius: 0.5rem; }}
    </style>
    """,
    unsafe_allow_html=True,
)

# ============================================================================
# Client Initialization
# ============================================================================

@st.cache_resource
def get_configs():
    """Load configuration from Streamlit secrets."""
    return {
        "SUPABASE_URL": st.secrets["SUPABASE_URL"],
        "SUPABASE_KEY": st.secrets["SUPABASE_SERVICE_KEY"],
        "GDRIVE_SERVICE_ACCOUNT": json.loads(st.secrets["GDRIVE_SERVICE_ACCOUNT"]),
        "GDRIVE_FOLDER_ID": st.secrets["GDRIVE_FOLDER_ID"],
    }

configs = get_configs()

@st.cache_resource
def init_clients():
    """Initialize Supabase and Google Drive clients."""
    supabase_client = create_client(
        configs["SUPABASE_URL"], configs["SUPABASE_KEY"]
    )
    credentials = service_account.Credentials.from_service_account_info(
        configs["GDRIVE_SERVICE_ACCOUNT"],
        scopes=["https://www.googleapis.com/auth/drive.readonly"],
    )
    drive_client = build("drive", "v3", credentials=credentials)
    return supabase_client, drive_client

supabase, drive = init_clients()

# ============================================================================
# Data Processing Functions
# ============================================================================

def normalize_df(df: pd.DataFrame, source: str) -> pd.DataFrame:
    """Normalize DataFrame column names and data types."""
    df.columns = [
        re.sub(r"[^a-z0-9_]", "_", col.strip().lower().replace(" ", "_"))
        for col in df.columns
    ]
    for col in df.columns:
        if df[col].dtype == "object":
            df[col] = (
                df[col]
                .astype(str)
                .str.replace(r"[\$,₡,€,%]", "", regex=True)
                .str.replace(",", "", regex=True)
                .str.strip()
            )
            df[col] = pd.to_numeric(df[col], errors="coerce")
        if "date" in col:
            df[col] = pd.to_datetime(df[col], errors="coerce")
    df["workbook_name"] = source
    df["refresh_date"] = datetime.utcnow()
    return df.drop_duplicates()

# Table mapping for different file types
TABLE_MAP = {
    "portfolio": "raw_portfolios",
    "facility": "raw_facilities",
    "customer": "raw_customers",
    "payment": "raw_payments",
    "risk": "raw_risk_events",
}

def ingest_from_drive():
    """Ingest files from Google Drive and upsert to Supabase."""
    try:
        query = (
            f"'{configs['GDRIVE_FOLDER_ID']}' in parents "
            "and mimeType != 'application/vnd.google-apps.folder' "
            "and trashed = false"
        )
        results = drive.files().list(q=query, fields="files(id, name, mimeType)").execute()
        files = results.get("files", [])

        if not files:
            st.warning("No files found in shared folder.")
            return

        progress_bar = st.progress(0)
        status_text = st.empty()

        for idx, file in enumerate(files):
            file_id, file_name, mime_type = file["id"], file["name"], file["mimeType"]
            status_text.text(f"Processing: {file_name}")

            # Download file from Google Drive
            request = drive.files().get_media(fileId=file_id)
            fh = io.BytesIO()
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while not done:
                _, done = downloader.next_chunk()
            fh.seek(0)

            # Read file based on type
            if mime_type.endswith("sheet") or file_name.endswith(".xlsx"):
                df = pd.read_excel(fh)
            elif mime_type == "text/csv" or file_name.endswith(".csv"):
                df = pd.read_csv(fh)
            else:
                st.warning(f"Skipping unsupported file: {file_name}")
                continue

            # Normalize and determine destination table
            df = normalize_df(df, file_name)
            table = next(
                (dest for key, dest in TABLE_MAP.items() if key in file_name.lower()),
                None,
            )
            if not table:
                st.warning(f"No staging table mapping for file: {file_name}")
                continue

            # Upsert to Supabase with conflict resolution
            primary_cols = {
                "raw_portfolios": ["workbook_name", "portfolio_name"],
                "raw_facilities": ["facility_code"],
                "raw_customers": ["customer_code"],
                "raw_payments": ["payment_code"],
                "raw_risk_events": ["customer_code", "event_date", "event_type"],
            }
            key_cols = primary_cols.get(table, ["id"])
            data = df.to_dict(orient="records")
            supabase.table(table).upsert(
                data, returning="minimal", on_conflict=",".join(key_cols)
            ).execute()
            st.success(f"✓ {file_name}: upserted {len(data)} rows into {table}")

            progress_bar.progress((idx + 1) / len(files))

        # Refresh ML features after all ingestion
        supabase.rpc("refresh_ml_features").execute()
        st.success("✓ ML features refreshed successfully.")

    except Exception as exc:
        st.error(f"Ingestion failed: {exc}")

# ============================================================================
# Sidebar: Ingestion Control
# ============================================================================

st.sidebar.header("🔄 Data Management")
if st.sidebar.button("▶ Run Google Drive Ingestion", use_container_width=True):
    with st.spinner("Ingesting from Google Drive..."):
        ingest_from_drive()

st.sidebar.markdown("---")
st.sidebar.info(
    "**Cron Scheduler**: Configure in Supabase SQL editor:\n"
    "`SELECT cron.schedule('daily-ingest', '0 6 * * *', 'SELECT refresh_ml_features();');`"
)

# ============================================================================
# Main Dashboard: Risk Assessment
# ============================================================================

st.title("🏦 ABACO Financial Intelligence Platform")
st.markdown("Real-time risk assessment and portfolio analytics")

st.subheader("📊 Risk Assessment Dashboard")

try:
    result = supabase.table("ml_feature_snapshots").select("*").execute()
    records = result.data or []

    if not records:
        st.warning("No feature snapshots available. Run the ingestion worker first.")
    else:
        df = pd.DataFrame(records)
        
        # Define high-risk criteria
        df["high_risk"] = (
            (df["avg_dpd"] > 90)
            | (df["ltv"] > 80)
            | (df["avg_dpd"] > 60)
            | (df["collection_rate"] < 0.70)
            | (df["avg_risk_severity"] > 0.7)
        )

        # KPI Metrics
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric(
                "High-Risk Clients",
                int(df["high_risk"].sum()),
                delta=None,
            )
        
        with col2:
            st.metric(
                "Average DPD (days)",
                f"{df['avg_dpd'].mean():.1f}",
                delta=None,
            )
        
        with col3:
            st.metric(
                "Average LTV (%)",
                f"{df['ltv'].mean():.1f}",
                delta=None,
            )
        
        with col4:
            st.metric(
                "Collection Rate (%)",
                f"{df['collection_rate'].mean() * 100:.1f}",
                delta=None,
            )

        # High-Risk Portfolio Table
        st.markdown("#### ⚠️ High-Risk Portfolio")
        high_risk_df = df.loc[
            df["high_risk"],
            ["customer_code", "name", "avg_dpd", "ltv", "collection_rate", "avg_risk_severity"]
        ].sort_values("avg_risk_severity", ascending=False)
        
        if len(high_risk_df) > 0:
            st.dataframe(
                high_risk_df,
                use_container_width=True,
                hide_index=True,
            )
        else:
            st.info("No high-risk clients detected.")

        # Visualizations
        st.markdown("#### 📈 Distributions")
        col1, col2 = st.columns(2)

        with col1:
            fig_dpd = px.histogram(
                df,
                x="avg_dpd",
                nbins=25,
                title="Days Past Due Distribution",
                color_discrete_sequence=[ABACO_THEME["colors"]["primary"]],
                labels={"avg_dpd": "Days Past Due", "count": "Count"},
            )
            fig_dpd.update_layout(
                hovermode="x unified",
                plot_bgcolor="rgba(0,0,0,0)",
                paper_bgcolor="rgba(0,0,0,0)",
                font={"color": "white"},
            )
            st.plotly_chart(fig_dpd, use_container_width=True)

        with col2:
            fig_ltv = px.histogram(
                df,
                x="ltv",
                nbins=25,
                title="Loan-to-Value Distribution",
                color_discrete_sequence=[ABACO_THEME["colors"]["warning"]],
                labels={"ltv": "LTV (%)", "count": "Count"},
            )
            fig_ltv.update_layout(
                hovermode="x unified",
                plot_bgcolor="rgba(0,0,0,0)",
                paper_bgcolor="rgba(0,0,0,0)",
                font={"color": "white"},
            )
            st.plotly_chart(fig_ltv, use_container_width=True)

        # Risk Scatter Plot
        fig_scatter = px.scatter(
            df,
            x="avg_dpd",
            y="ltv",
            size="collection_rate",
            color="avg_risk_severity",
            hover_data=["customer_code", "name"],
            title="Risk Matrix (DPD vs LTV)",
            color_continuous_scale="RdYlGn_r",
            labels={
                "avg_dpd": "Average DPD (days)",
                "ltv": "LTV (%)",
                "avg_risk_severity": "Risk Severity",
            },
        )
        fig_scatter.update_layout(
            hovermode="closest",
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            font={"color": "white"},
        )
        st.plotly_chart(fig_scatter, use_container_width=True)

except Exception as e:
    st.error(f"Dashboard error: {e}")

# Footer
st.markdown("---")
st.markdown(
    """
    <div style="text-align: center; color: #6D7D8E; font-size: 0.85rem;">
    ABACO Financial Intelligence Platform | Powered by Next.js, Supabase & Streamlit
    </div>
    """,
    unsafe_allow_html=True,
)
