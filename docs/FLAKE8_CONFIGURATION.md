# Flake8 Configuration Issue Resolution

This project is TypeScript-first. Python support (Streamlit utilities, notebooks) lives in a **separate, optional** workflow. VS Code previously attempted to start Flake8 inside an old virtual environment (`notebooks/abaco_venv`) and spammed errors because that environment is not part of the workspace.

## Symptoms

- VS Code "Flake8 connection error. ENOENT: no such file or directory …/notebooks/abaco_venv/bin/python"
- Terminal attempts to run `source streamlit_env/bin/activate` report `No such file or directory`
- Running `flake8`, `pylint`, or `black` prints `command not found`

## Root Cause

1. `.vscode/settings.json` used to point at a deleted virtual environment.
2. The committed `streamlit_env` directory is only a **placeholder** to document where you should create your own venv. It does not contain activation scripts or tools.
3. Python linters are not installed by default because the primary toolchain is Node.js/TypeScript.

## Fix Implemented in VS Code

The repo configuration now:

- Disables automatic Flake8/Pylint startup (`.vscode/settings.json`)
- Forces VS Code to use `/usr/bin/python3` when a Python interpreter is required
- Documents the Python workflow separately (`docs/PYTHON_SETUP.md`)

This prevents VS Code from repeatedly trying to launch a missing interpreter.

## Running Python Linters Manually

When you **do** need to lint the optional Python files, create a local virtual environment and install the linters yourself. These files are git-ignored, so you can safely customize them.

```bash
# 1. Create a fresh virtual environment (once per machine)
python3 -m venv streamlit_env

# 2. Activate it (macOS/Linux)
source streamlit_env/bin/activate
#    or Windows
# streamlit_env\Scripts\activate

# 3. Install runtime deps + linters
pip install --upgrade pip
pip install -r streamlit_requirements.txt
pip install flake8 pylint black
```

Now the commands mentioned in the troubleshooting steps will work:

```bash
flake8 streamlit_app.py --count --select=E9,F63,F7,F82
pylint streamlit_app.py
black streamlit_app.py --check
```

> Reminder: keep the virtual environment out of git (already handled via `.gitignore`).

## References

- `docs/PYTHON_SETUP.md` – optional Python environment workflow
- `docs/ENVIRONMENT_GUIDE.md` – overview of Node vs. Python responsibilities
