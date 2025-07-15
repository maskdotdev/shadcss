#!/bin/bash

# Script to properly replace all hsl(var(...)) with var(...) in CSS modules

echo "Fixing hsl(var()) instances in CSS modules..."

# Find all CSS files in the shadcss-ui directory and replace hsl(var(...)) with var(...)
# This regex handles the complete pattern including the closing parenthesis
find src/components/shadcss-ui -name "*.css" -type f -exec sed -i '' 's/hsl(var(\([^)]*\)))/var(\1)/g' {} \;

# Also handle cases with opacity like hsl(var(...) / 0.5)
find src/components/shadcss-ui -name "*.css" -type f -exec sed -i '' 's/hsl(var(\([^)]*\)) \/ \([0-9.]*\))/var(\1)/g' {} \;

echo "Completed fixing hsl(var()) instances!"
echo "Running verification..."

# Check if any hsl(var() instances remain
remaining=$(grep -r "hsl(var(" src/components/shadcss-ui --include="*.css" | wc -l)
echo "Remaining hsl(var() instances: $remaining"

if [ $remaining -eq 0 ]; then
    echo "✅ All hsl(var()) instances have been successfully replaced with var()!"
else
    echo "⚠️  Some hsl(var()) instances still remain. Manual review needed."
    grep -r "hsl(var(" src/components/shadcss-ui --include="*.css"
fi