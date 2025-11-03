#!/usr/bin/env python3
<<<<<<< HEAD
# notebooks/ml_dashboard.py

from __future__ import annotations

import os
from datetime import datetime
from typing import Optional

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from streamlit.delta_generator import DeltaGenerator
from supabase import Client, create_client

st: DeltaGenerator  # type: ignore

# ---------- Page ----------
st.set_page_config(page_title="ABACO ML Dashboard", layout="wide", initial_sidebar_state="expanded")

# ---------- ABACO theme ----------
ABACO = {
    "bg": "#030E19",
    "fg": "#CED4D9",
    "white": "#FFFFFF",
    "primary": "#C1A6FF",
    "primary_dark": "#5F4896",
    "success": "#10B981",
    "warning": "#FB923C",
    "error": "#DC2626",
    "info": "#3B82F6",
}
st.markdown(
    f"""
    <style>
      .stApp {{ background:{ABACO["bg"]}; color:{ABACO["fg"]}; }}
      .block-container {{ padding-top: 1.2rem; }}
      h1,h2,h3,h4 {{ color:{ABACO["white"]}; }}
      .metric > div:not(:first-child) span {{ color:{ABACO["white"]} !important; }}
    </style>
    """,
    unsafe_allow_html=True,
)

# ---------- Config ----------
def _get_cfg() -> dict:
    url = os.environ.get("SUPABASE_URL") or st.secrets.get("SUPABASE_URL", None)
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or st.secrets.get("SUPABASE_SERVICE_ROLE_KEY", None)
    api = os.environ.get("NEXT_API_URL") or st.secrets.get("NEXT_API_URL", "http://localhost:3000")
    return {"SUPABASE_URL": url, "SUPABASE_KEY": key, "NEXT_API_URL": api}

cfg = _get_cfg()
if not cfg["SUPABASE_URL"] or not cfg["SUPABASE_KEY"]:
    st.error("Supabase no configurado. Define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en env o .streamlit/secrets.toml")
    st.stop()

# ---------- Clients ----------
@st.cache_resource(show_spinner=False)
def get_supabase(url: str, key: str) -> Client:
    return create_client(url, key)

sb: Client = get_supabase(cfg["SUPABASE_URL"], cfg["SUPABASE_KEY"])

# ---------- Sidebar ----------
with st.sidebar:
    st.header("Configuration")
    window_days: int = st.slider("Metrics window (days)", 7, 120, 30)
    refresh_seconds: int = st.slider("Refresh interval (seconds)", 5, 120, 30)
    if st.button("Refresh"):
        st.rerun()

# ---------- Data ----------
@st.cache_data(ttl=60, show_spinner=False)
def read_table(schema: str, table: str) -> pd.DataFrame:
    # Prefer schema-qualified access; fallback to fully-qualified name if needed
    try:
        res = sb.postgrest.schema(schema).from_(table).select("*").execute()
    except Exception:
        res = sb.from_(f"{schema}.{table}").select("*").execute()
    data = res.data or []
    df = pd.DataFrame(data)
    if df.empty:
        return df

    # Parse timestamps
    for c in [c for c in df.columns if "time" in c or "date" in c or c == "created_at"]:
        try:
            df[c] = pd.to_datetime(df[c], errors="coerce", utc=True)
        except Exception:
            pass

    # Parse numerics
    for c in ["score", "prediction_score", "probability", "amount", "brier"]:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce")
    return df

pred_df = read_table("ml", "predictions")          # id, loan_id, score|prediction_score, label, model_version, created_at
fb_df   = read_table("ml", "feedback")             # id, prediction_id, loan_id, outcome_label, correct, created_at
mx_df   = read_table("ml", "learning_metrics")     # id, metrics (json), created_at

# Harmonize score column name
if "score" not in pred_df.columns and "prediction_score" in pred_df.columns:
    pred_df = pred_df.rename(columns={"prediction_score": "score"})

# ---------- KPIs ----------
st.title("ABACO • ML Continue Learning Dashboard")

c1, c2, c3, c4 = st.columns(4)
with c1:
    st.metric("Total predictions", f"{len(pred_df):,}")
with c2:
    st.metric("Feedback received", f"{len(fb_df):,}")
with c3:
    acc: Optional[float] = None
    if not fb_df.empty and "correct" in fb_df.columns:
        acc = float(pd.to_numeric(fb_df["correct"], errors="coerce").fillna(0).mean())
    st.metric("Overall accuracy", f"{acc:.1%}" if acc is not None else "N/A")
with c4:
    # Brier score via join on prediction_id -> predictions.id
    avg_brier: Optional[float] = None
    if not fb_df.empty and not pred_df.empty and {"id", "score"}.issubset(pred_df.columns) and "prediction_id" in fb_df.columns:
        j = fb_df.merge(pred_df[["id", "score"]], left_on="prediction_id", right_on="id", how="left")
        if not j.empty and "score" in j.columns and "correct" in j.columns:
            p = pd.to_numeric(j["score"], errors="coerce")
            y = pd.to_numeric(j["correct"], errors="coerce").fillna(0.0)  # 1=correct, 0=incorrect
            brier = (p - y) ** 2
            if brier.notna().any():
                avg_brier = float(brier.mean())
    st.metric("Avg Brier score", f"{avg_brier:.3f}" if avg_brier is not None else "N/A")

st.divider()

# ---------- Charts ----------
# Score distribution
if not pred_df.empty and "score" in pred_df.columns:
    fig = go.Figure(go.Histogram(x=pred_df["score"], nbinsx=30))
    fig.update_layout(
        title="Prediction score distribution",
        height=360,
        margin=dict(l=10, r=10, t=40, b=10),
        paper_bgcolor=ABACO["bg"],
        plot_bgcolor=ABACO["bg"],
        font=dict(color=ABACO["fg"]),
    )
    st.plotly_chart(fig, use_container_width=True)

# Label distribution
if not pred_df.empty and "label" in pred_df.columns:
    counts = pred_df["label"].value_counts().reset_index(names=["label", "count"])
    fig = px.bar(counts, x="label", y="count", title="Prediction label distribution", height=360)
    fig.update_layout(
        paper_bgcolor=ABACO["bg"],
        plot_bgcolor=ABACO["bg"],
        font=dict(color=ABACO["fg"]),
        margin=dict(l=10, r=10, t=40, b=10),
    )
    st.plotly_chart(fig, use_container_width=True)

# Rolling accuracy by day
if not fb_df.empty and "created_at" in fb_df.columns and "correct" in fb_df.columns:
    ts = (
        fb_df.assign(created_at=pd.to_datetime(fb_df["created_at"], errors="coerce", utc=True))
            .dropna(subset=["created_at"])
            .assign(correct=lambda x: pd.to_numeric(x["correct"], errors="coerce").fillna(0).astype(int))
            .set_index("created_at")
            .resample("1D")["correct"].mean()
            .to_frame("acc")
            .rolling(window=max(1, min(window_days, 120)), min_periods=1)
            .mean()
            .reset_index()
    )
    if not ts.empty:
        fig = go.Figure(go.Scatter(x=ts["created_at"], y=ts["acc"], mode="lines"))
        fig.update_layout(
            title=f"Accuracy trend (rolling {window_days}d)",
            yaxis_tickformat=".0%",
            height=360,
            margin=dict(l=10, r=10, t=40, b=10),
            paper_bgcolor=ABACO["bg"],
            plot_bgcolor=ABACO["bg"],
            font=dict(color=ABACO["fg"]),
        )
        st.plotly_chart(fig, use_container_width=True)

st.divider()

# ---------- Tables ----------
if not pred_df.empty:
    st.subheader("Recent predictions")
    cols = [c for c in ["id", "loan_id", "score", "label", "model_version", "created_at"] if c in pred_df.columns]
    view = pred_df.sort_values("created_at", ascending=False)[cols].head(200).copy() if cols else pred_df.head(200)
    if "score" in view.columns:
        view["score"] = pd.to_numeric(view["score"], errors="coerce").map(lambda v: f"{v:.3f}" if pd.notna(v) else "")
    st.dataframe(view, use_container_width=True)
else:
    st.info("No predictions")

if not fb_df.empty:
    st.subheader("Recent feedback")
    cols = [c for c in ["prediction_id", "loan_id", "outcome_label", "correct", "comments", "created_at"] if c in fb_df.columns]
    view = fb_df.sort_values("created_at", ascending=False)[cols].head(200).copy() if cols else fb_df.head(200)
    if "correct" in view.columns:
        view["correct"] = view["correct"].map(lambda v: "✅" if bool(v) else "❌")
    st.dataframe(view, use_container_width=True)
else:
    st.info("No feedback")

# ---------- Metrics history ----------
if not mx_df.empty and "metrics" in mx_df.columns and "created_at" in mx_df.columns:
    st.subheader("Model performance metrics history")
    m = mx_df.copy()
    m["created_at"] = pd.to_datetime(m["created_at"], errors="coerce", utc=True)
    m["metrics_parsed"] = m["metrics"].apply(lambda x: x if isinstance(x, dict) else {})
    m["accuracy"] = pd.to_numeric(m["metrics_parsed"].apply(lambda d: d.get("acc")), errors="coerce")
    m["brier"] = pd.to_numeric(m["metrics_parsed"].apply(lambda d: d.get("brier")), errors="coerce")

    c1, c2 = st.columns(2)
    if m["accuracy"].notna().any():
        fig = go.Figure(go.Scatter(x=m["created_at"], y=m["accuracy"], mode="lines+markers"))
        fig.update_layout(
            title="Accuracy over time",
            yaxis_tickformat=".0%",
            height=320,
            paper_bgcolor=ABACO["bg"],
            plot_bgcolor=ABACO["bg"],
            font=dict(color=ABACO["fg"]),
        )
        c1.plotly_chart(fig, use_container_width=True)
    if m["brier"].notna().any():
        fig = go.Figure(go.Scatter(x=m["created_at"], y=m["brier"], mode="lines+markers"))
        fig.update_layout(
            title="Brier score over time (lower is better)",
            height=320,
            paper_bgcolor=ABACO["bg"],
            plot_bgcolor=ABACO["bg"],
            font=dict(color=ABACO["fg"]),
        )
        c2.plotly_chart(fig, use_container_width=True)
=======
"""
ABACO ML Continue Learning Dashboard
Real-time monitoring of prediction accuracy and model performance

Requirements:
    pip install streamlit pandas supabase requests plotly
"""

import os
import sys
from datetime import datetime, timedelta
from typing import Optional

import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
import requests
import streamlit as st
from supabase import create_client

# Configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL") or st.secrets.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or st.secrets.get("SUPABASE_SERVICE_ROLE_KEY")
NEXT_API_URL = os.environ.get("NEXT_API_URL", "http://localhost:3000")

# Initialize Supabase client
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    supabase = None

st.set_page_config(page_title="ABACO ML Dashboard", layout="wide", initial_sidebar_state="expanded")

# CSS styling
st.markdown("""
<style>
    .metric-card {
        background-color: #f0f2f6;
        padding: 20px;
        border-radius: 8px;
        margin: 10px 0;
    }
    .status-high { color: #d62728; font-weight: bold; }
    .status-medium { color: #ff7f0e; font-weight: bold; }
    .status-low { color: #2ca02c; font-weight: bold; }
</style>
""", unsafe_allow_html=True)

# Header
st.title("🤖 ABACO ML Continue Learning Dashboard")
st.markdown("Real-time monitoring of prediction accuracy and model performance")

# Sidebar
with st.sidebar:
    st.header("Configuration")
    window_days = st.slider("Metrics Window (days)", 1, 90, 30)
    refresh_interval = st.slider("Refresh Interval (seconds)", 5, 60, 10)
    
    if st.button("🔄 Refresh Data"):
        st.rerun()

# Main dashboard
if not supabase:
    st.error("❌ Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    st.stop()

try:
    # Fetch predictions
    response = supabase.from_("ml.predictions").select("*").order("created_at", desc=True).limit(1000).execute()
    predictions_data = response.data
    
    # Fetch feedback
    response = supabase.from_("ml.feedback").select("*").order("created_at", desc=True).execute()
    feedback_data = response.data
    
    # Fetch metrics
    response = supabase.from_("ml.learning_metrics").select("*").order("created_at", desc=True).limit(100).execute()
    metrics_data = response.data
    
    # Convert to DataFrames
    predictions_df = pd.DataFrame(predictions_data) if predictions_data else pd.DataFrame()
    feedback_df = pd.DataFrame(feedback_data) if feedback_data else pd.DataFrame()
    metrics_df = pd.DataFrame(metrics_data) if metrics_data else pd.DataFrame()
    
except Exception as e:
    st.error(f"Error fetching data: {str(e)}")
    st.stop()

# Top metrics
col1, col2, col3, col4 = st.columns(4)

with col1:
    total_predictions = len(predictions_df)
    st.metric("Total Predictions", total_predictions, delta=None)

with col2:
    total_feedback = len(feedback_df)
    st.metric("Feedback Received", total_feedback, delta=None)

with col3:
    if len(feedback_df) > 0:
        accuracy = (feedback_df["correct"].sum() / len(feedback_df)) * 100
        st.metric("Overall Accuracy", f"{accuracy:.1f}%", delta=None)
    else:
        st.metric("Overall Accuracy", "—", delta=None)

with col4:
    if len(feedback_df) > 0:
        brier_scores = []
        for _, row in feedback_df.iterrows():
            pred_id = row.get("prediction_id")
            if pred_id and not predictions_df.empty:
                pred = predictions_df[predictions_df["id"] == pred_id]
                if not pred.empty:
                    score = float(pred.iloc[0]["score"])
                    actual = 1.0 if row.get("correct") else 0.0
                    brier_scores.append((score - actual) ** 2)
        
        if brier_scores:
            avg_brier = sum(brier_scores) / len(brier_scores)
            st.metric("Avg Brier Score", f"{avg_brier:.3f}", delta=None)
        else:
            st.metric("Avg Brier Score", "—", delta=None)
    else:
        st.metric("Avg Brier Score", "—", delta=None)

st.divider()

# Prediction score distribution
col1, col2 = st.columns(2)

with col1:
    if not predictions_df.empty:
        st.subheader("Prediction Score Distribution")
        
        # Create histogram
        fig = go.Figure()
        fig.add_trace(go.Histogram(
            x=predictions_df["score"],
            nbinsx=20,
            marker=dict(color="rgba(0, 100, 200, 0.7)"),
            name="Score"
        ))
        fig.update_layout(
            xaxis_title="Risk Score (0.0 - 1.0)",
            yaxis_title="Frequency",
            height=400,
            template="plotly_white"
        )
        st.plotly_chart(fig, use_container_width=True)

with col2:
    if not predictions_df.empty:
        st.subheader("Prediction Label Distribution")
        
        label_counts = predictions_df["label"].value_counts()
        colors = {"HIGH": "#d62728", "MEDIUM": "#ff7f0e", "LOW": "#2ca02c"}
        
        fig = go.Figure(data=[
            go.Pie(
                labels=label_counts.index,
                values=label_counts.values,
                marker=dict(colors=[colors.get(label, "#999") for label in label_counts.index])
            )
        ])
        fig.update_layout(height=400, template="plotly_white")
        st.plotly_chart(fig, use_container_width=True)

st.divider()

# Accuracy over time
if not feedback_df.empty and not predictions_df.empty:
    st.subheader("Accuracy Trend (7-day rolling window)")
    
    # Create time series
    feedback_df_copy = feedback_df.copy()
    feedback_df_copy["created_at"] = pd.to_datetime(feedback_df_copy["created_at"])
    feedback_df_copy = feedback_df_copy.sort_values("created_at")
    
    # Calculate rolling accuracy
    feedback_df_copy["correct_int"] = feedback_df_copy["correct"].astype(int)
    feedback_df_copy["rolling_acc"] = feedback_df_copy["correct_int"].rolling(window=7, min_periods=1).mean() * 100
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=feedback_df_copy["created_at"],
        y=feedback_df_copy["rolling_acc"],
        mode="lines+markers",
        name="Accuracy",
        line=dict(color="rgb(31, 119, 180)", width=2),
        marker=dict(size=4)
    ))
    fig.update_layout(
        xaxis_title="Date",
        yaxis_title="Accuracy (%)",
        height=400,
        template="plotly_white",
        hovermode="x unified"
    )
    st.plotly_chart(fig, use_container_width=True)

st.divider()

# Recent predictions table
st.subheader("Recent Predictions")

if not predictions_df.empty:
    display_cols = ["id", "loan_id", "score", "label", "model_version", "created_at"]
    available_cols = [col for col in display_cols if col in predictions_df.columns]
    
    df_display = predictions_df[available_cols].head(20).copy()
    
    # Format score column
    if "score" in df_display.columns:
        df_display["score"] = df_display["score"].apply(lambda x: f"{float(x):.3f}")
    
    st.dataframe(df_display, use_container_width=True)
else:
    st.info("No predictions yet")

st.divider()

# Recent feedback table
st.subheader("Recent Feedback")

if not feedback_df.empty:
    display_cols = ["prediction_id", "loan_id", "outcome_label", "correct", "comments", "created_at"]
    available_cols = [col for col in display_cols if col in feedback_df.columns]
    
    df_display = feedback_df[available_cols].head(20).copy()
    
    # Format correct column
    if "correct" in df_display.columns:
        df_display["correct"] = df_display["correct"].apply(lambda x: "✅" if x else "❌")
    
    st.dataframe(df_display, use_container_width=True)
else:
    st.info("No feedback yet")

st.divider()

# Model metrics history
st.subheader("Model Performance Metrics History")

if not metrics_df.empty:
    # Parse metrics JSON
    metrics_df["metrics_parsed"] = metrics_df["metrics"].apply(
        lambda x: x if isinstance(x, dict) else {}
    )
    
    # Extract values
    metrics_df["accuracy"] = metrics_df["metrics_parsed"].apply(lambda x: x.get("acc", None))
    metrics_df["brier"] = metrics_df["metrics_parsed"].apply(lambda x: x.get("brier", None))
    
    # Convert timestamp
    metrics_df["created_at"] = pd.to_datetime(metrics_df["created_at"])
    
    # Filter by window
    metrics_df = metrics_df.sort_values("created_at", ascending=False)
    
    col1, col2 = st.columns(2)
    
    with col1:
        # Accuracy trend
        if metrics_df["accuracy"].notna().any():
            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=metrics_df["created_at"],
                y=metrics_df["accuracy"] * 100,
                mode="lines+markers",
                name="Accuracy",
                line=dict(color="rgb(31, 119, 180)", width=2)
            ))
            fig.update_layout(
                title="Accuracy Over Time",
                xaxis_title="Date",
                yaxis_title="Accuracy (%)",
                height=350,
                template="plotly_white"
            )
            st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        # Brier score trend
        if metrics_df["brier"].notna().any():
            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=metrics_df["created_at"],
                y=metrics_df["brier"],
                mode="lines+markers",
                name="Brier Score",
                line=dict(color="rgb(214, 39, 40)", width=2)
            ))
            fig.update_layout(
                title="Brier Score Over Time (lower is better)",
                xaxis_title="Date",
                yaxis_title="Brier Score",
                height=350,
                template="plotly_white"
            )
            st.plotly_chart(fig, use_container_width=True)

# Footer
st.divider()
st.markdown("""
---
**ABACO ML Continue Learning Dashboard**  
Last updated: {}  
Refresh interval: {} seconds

**Metrics Explanation:**
- **Accuracy**: % of predictions marked correct
- **Brier Score**: Mean squared error between predicted probability and actual outcome (lower is better)
- **Risk Score**: 0.0 (low risk) to 1.0 (high risk)
- **Label**: HIGH (score ≥ 0.5), MEDIUM (0.25-0.5), LOW (< 0.25)
""".format(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), refresh_interval), unsafe_allow_html=True)

st.info("""
📌 **Next Steps:**
1. Create predictions via `/api/ml/predictions`
2. Record feedback via `/api/ml/feedback` after 30-90 days
3. Monitor metrics in this dashboard
4. Retrain model when accuracy drops below threshold
""")
>>>>>>> 420d661fb588b567d48bc8c8f6ee52b18239beb5
