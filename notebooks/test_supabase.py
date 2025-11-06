from supabase import create_client
import os

# Replace with your actual credentials
url = "https://your-project.supabase.co"
key = "your_service_role_key_here"

try:
    client = create_client(url, key)
    print('✅ Supabase connection successful')
except Exception as e:
    print(f'❌ Supabase connection failed: {e}')
