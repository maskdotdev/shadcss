# Tailwind CSS to CSS Modules CLI Tool

This CLI tool extracts Tailwind CSS classes from React components and converts them to CSS modules.

## Installation

The tool is already set up in this project. The required dependencies are:
- `@babel/parser` - For parsing JSX/TSX files
- `@babel/traverse` - For traversing AST
- `commander` - For CLI interface
- `postcss-cli` - For processing CSS with Tailwind

## Usage

### Process a Single Component File

```bash
npm run tw-to-css -- --file src/components/ui/card.tsx --name card
```

Options:
- `--file` or `-f`: Path to the component file to process
- `--name` or `-n`: Component name to use as CSS class prefix (optional, defaults to filename)
- `--output` or `-o`: Output file path (optional, defaults to `styles/components.module.css`)

### Process an Entire Directory

```bash
npm run tw-to-css -- --dir src/components --output styles/all-components.module.css
```

Options:
- `--dir` or `-d`: Directory to process (processes all .tsx/.jsx files recursively)
- `--output` or `-o`: Output file path

## Example Output

Given a component with Tailwind classes:

```jsx
function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  );
}
```

The tool will:

1. **Extract classes**: Find all Tailwind classes in the component
2. **Generate CSS**: Use PostCSS and Tailwind to generate actual CSS rules
3. **Format as CSS modules**: Create CSS modules with the component name as prefix

Output example:
```css
.card {
    background-color: var(--color-card);
    color: var(--color-card-foreground);
    display: flex;
    flex-direction: column;
    gap: calc(var(--spacing) * 6);
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border);
    padding-block: calc(var(--spacing) * 6);
    --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color);
    box-shadow: var(--tw-shadow);
}
```

## Features

- **AST-based parsing**: Accurately extracts classes from JSX/TSX files
- **Tailwind v4 support**: Works with modern Tailwind CSS setup
- **CSS Variables**: Preserves Tailwind's CSS variable system
- **Responsive variants**: Includes breakpoint-based styles
- **Hover states**: Captures hover and other pseudo-states
- **Dark mode**: Includes dark mode variants
- **Container queries**: Supports @container queries
- **Conditional styles**: Handles has-* and other conditional variants

## Tool Architecture

1. **Class Extraction**: Uses Babel to parse JSX/TSX and extract `className` attributes
2. **CSS Generation**: Uses PostCSS with `@tailwindcss/postcss` to generate actual CSS
3. **CSS Module Formatting**: Converts class names to use component name as prefix
4. **Output**: Writes formatted CSS modules to specified file

## Supported Features

- ✅ Static className strings
- ✅ Template literals in className
- ✅ Complex expressions (cn(), clsx(), etc.)
- ✅ All Tailwind utility classes
- ✅ Responsive variants (sm:, md:, lg:, etc.)
- ✅ Hover and focus states
- ✅ Dark mode variants
- ✅ Container queries
- ✅ Arbitrary values ([123px], etc.)
- ✅ CSS variable preservation

## Example Commands

Process the Card component:
```bash
npm run tw-to-css -- --file src/components/ui/card.tsx --name card
```

Process all components in a directory:
```bash
npm run tw-to-css -- --dir src/components/ui --output styles/ui-components.module.css
```

Process with custom output location:
```bash
npm run tw-to-css -- --file src/components/ui/button.tsx --name button --output styles/button.module.css
```

## Notes

- The tool creates temporary files during processing (temp-input.css, temp-output.css)
- It automatically cleans up temporary files after processing
- The output is formatted with the component name as the CSS class prefix
- Complex expressions are parsed using string matching as a fallback
- The tool preserves all Tailwind features including CSS variables and modern features 