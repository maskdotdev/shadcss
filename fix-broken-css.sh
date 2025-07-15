#!/bin/bash

# Script to fix broken CSS caused by the previous hsl(var()) replacement

echo "Fixing broken CSS with extra closing parentheses..."

# Remove extra closing parentheses after var(...) patterns
find src/components/shadcss-ui -name "*.css" -type f -exec sed -i '' 's/var(\([^)]*\)))/var(\1)/g' {} \;

# Also fix cases where opacity was handled incorrectly like "var(...) / 0.5))"
find src/components/shadcss-ui -name "*.css" -type f -exec sed -i '' 's/var(\([^)]*\)) \/ \([0-9.]*\))/var(\1)/g' {} \;

echo "Completed fixing broken CSS!"
echo "Running verification..."

# Check for remaining broken patterns
broken=$(grep -r "var([^)]*)))" src/components/shadcss-ui --include="*.css" | wc -l)
echo "Remaining broken patterns: $broken"

if [ $broken -eq 0 ]; then
    echo "✅ All broken CSS patterns have been fixed!"
else
    echo "⚠️  Some broken patterns still remain. Manual review needed."
    grep -r "var([^)]*)))" src/components/shadcss-ui --include="*.css"
fi

# Check if any hsl(var() instances remain
remaining=$(grep -r "hsl(var(" src/components/shadcss-ui --include="*.css" | wc -l)
echo "Remaining hsl(var() instances: $remaining"