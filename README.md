# Honu SaaS CLI

A command-line tool to easily add beautiful, pre-built SaaS components to your projects from the [honu-saas-themes](https://github.com/honu-ai/honu-saas-themes) repository.

## Features

- 🎨 **Multiple Component Types**: Hero sections, footers, CTAs, FAQs, and more
- 📁 **Smart File Organization**: Components organized by type in dedicated folders
- 🔄 **App File Management**: Automatically copies theme globals and layouts
- ✨ **Beautiful CLI**: Interactive progress indicators and colorful output
- 🛡️ **Error Handling**: Graceful handling of missing components or network issues
- 📦 **Zero Config**: Works out of the box with sensible defaults
- 🚀 **No Rate Limits**: Uses GitHub raw URLs for unlimited downloads

## Installation

### Global Installation
```bash
npm install -g honu-saas-cli
```

### Local Installation
```bash
npm install honu-saas-cli
```

### Using npx (Recommended)
```bash
npx honu-saas-cli add <theme-name>
```

## Usage

### List Available Themes
```bash
honu-saas-cli list
```

### Basic Usage
```bash
honu-saas-cli add <theme-name>
```

### Examples
```bash
# Install the 'modern' theme
honu-saas-cli add modern

# Install the 'classic' theme
honu-saas-cli add classic

# Using npx (no installation required)
npx honu-saas-cli add modern
```

## What Gets Installed

When you run the CLI, it will copy components and files from the specified theme:

### Component Types
The following component types are automatically installed:
- `hero-section` → `./components/hero-section/`
- `problem-section` → `./components/problem-section/`
- `solution-section` → `./components/solution-section/`
- `benefits-section` → `./components/benefits-section/`
- `faq-section` → `./components/faq-section/`
- `cta-section` → `./components/cta-section/`
- `footer` → `./components/footer/`

### App Files
Theme-specific app files are copied to your app directory:
- `globals.css` → `./app/globals.css`
- `layout.tsx` → `./app/layout.tsx`

## File Structure

After running the CLI, your project structure will look like:

```
your-project/
├── app/
│   ├── globals.css      # Theme styles
│   └── layout.tsx       # Theme layout
└── components/
    ├── hero-section/
    │   ├── HeroSection.tsx
    │   └── hero-section.module.css
    ├── footer/
    │   ├── Footer.tsx
    │   └── footer.module.css
    ├── cta-section/
    │   └── ...
    └── ...
```

## Example Output

```bash
$ honu-saas-cli add modern

⠋ Fetching theme 'modern'...
⠙ Fetching hero-section components...
⠹ Installing hero-section components...
⠸ Fetching footer components...
⠼ Installing footer components...
⠴ Fetching theme app files...
⠦ Installing globals.css...
⠧ Installing layout.tsx...

✅ Theme 'modern' installed successfully!
  15 components copied:
    hero-section → /path/to/project/components/hero-section
    problem-section → /path/to/project/components/problem-section
    solution-section → /path/to/project/components/solution-section
    benefits-section → /path/to/project/components/benefits-section
    faq-section → /path/to/project/components/faq-section
    cta-section → /path/to/project/components/cta-section
    footer → /path/to/project/components/footer
    globals.css → /path/to/project/app
    layout.tsx → /path/to/project/app
```

## Available Themes

Visit the [honu-saas-themes repository](https://github.com/honu-ai/honu-saas-themes) to see all available themes and preview components.

## Requirements

- Node.js 14 or higher
- A project with `components/` and `app/` directories (typical Next.js structure)

## How It Works

1. **Fetches components** from `honu-ai/honu-saas-themes/components/{theme-name}/{component-type}/`
2. **Downloads files** using GitHub's raw file URLs (no rate limits)
3. **Organizes components** by type in your local `components/` directory
4. **Copies app files** to your `app/` directory
5. **Overwrites existing files** to ensure you get the latest version

## Error Handling

- **Missing theme**: Clear error message if the theme doesn't exist  
- **Missing components**: Warnings for individual missing component types
- **Network issues**: Graceful handling of download failures
- **File system errors**: Proper error reporting for write failures
- **No rate limits**: Uses GitHub raw URLs for unlimited downloads

### Troubleshooting

**Problem**: "Theme not found" error  
**Solution**: Run `honu-saas-cli list` to see available themes

**Problem**: No files downloaded  
**Solution**: Check your internet connection and verify the theme exists

## Contributing

Found a bug or want to contribute? Check out the [source code](https://github.com/honu-ai/honu-saas-cli) and feel free to open issues or pull requests.

## License

ISC

## Related Projects

- [honu-saas-themes](https://github.com/honu-ai/honu-saas-themes) - The theme repository containing all the components
