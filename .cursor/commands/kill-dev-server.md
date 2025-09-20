kill -9 $(lsof -ti:3000) 2>/dev/null || echo "No dev server running on port 3000"
