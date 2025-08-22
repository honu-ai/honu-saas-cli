#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fetch from 'node-fetch';
import fse from 'fs-extra';
import path from 'path';

const program = new Command();

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/honu-ai/honu-saas-themes/main/components';

// Available themes (manually maintained list)
const AVAILABLE_THEMES = ['minimal', 'corporate', 'playful', 'friendly', 'technical'];

// Convert kebab-case to PascalCase for component names
const toPascalCase = (str) => {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
};

// Component files following strict structure
const getComponentFiles = (themeName, componentType) => {
  const componentName = toPascalCase(componentType);
  
  const componentFiles = [
    'index.tsx',
    `${componentName}.tsx`,
    `${componentName}.stories.tsx`
  ];
  
  return componentFiles.map(filename => ({
    name: filename,
    url: `${GITHUB_RAW_BASE}/${themeName}/${componentType}/${filename}`
  }));
};

// Define the component types to copy
const COMPONENT_TYPES = ['hero-section', 'problem-section', 'solution-section', 'benefits-section', 'faq-section', 'cta-section', 'footer'];

// Define files to copy to the app directory
const APP_FILES = ['globals.css', 'layout.tsx'];

const PAGE_FILES = ['page.tsx']

program
  .command('list')
  .description('List all available themes')
  .action(() => {
    console.log(chalk.green('Available themes:'));
    AVAILABLE_THEMES.forEach(theme => {
      console.log(chalk.cyan(`  • ${theme}`));
    });
    console.log(chalk.yellow(`\nUse: ${chalk.bold('honu-saas-cli add <theme-name>')} to install a theme`));
  });

program
  .command('add <theme-name>')
  .description('Add a new theme by copying its components into your project')
  .action(async (themeName) => {
    // Validate theme exists
    if (!AVAILABLE_THEMES.includes(themeName)) {
      console.log(chalk.red(`Error: Theme '${themeName}' not found.`));
      console.log(chalk.yellow('Available themes:'));
      AVAILABLE_THEMES.forEach(theme => {
        console.log(chalk.cyan(`  • ${theme}`));
      });
      process.exit(1);
    }

    const spinner = ora(chalk.blue(`Fetching theme '${themeName}'...`)).start();

    try {
      let totalFiles = 0;
      const installedComponents = [];

      // 1. Process each component type
      for (const componentType of COMPONENT_TYPES) {
        spinner.text = `Fetching ${componentType} components...`;
        
        // Create destination path for this component type
        const destPath = path.join(process.cwd(), 'components', componentType);
        
        // Get potential files for this component type
        const potentialFiles = getComponentFiles(themeName, componentType);
        
        spinner.text = `Installing ${componentType} components...`;

        // Ensure the destination directory exists
        await fse.ensureDir(destPath);

        let componentFilesFound = 0;
        
        // Try to download each potential file
        for (const file of potentialFiles) {
          try {
            const response = await fetch(file.url);
            if (response.ok) {
              const fileContent = await response.text();
              await fse.writeFile(path.join(destPath, file.name), fileContent);
              totalFiles++;
              componentFilesFound++;
            }
            // If 404, just skip silently (file doesn't exist)
          } catch (error) {
            // Network error - skip silently
            continue;
          }
        }

        if (componentFilesFound > 0) {
          installedComponents.push(`${componentType} → ${destPath}`);
        } else {
          console.log(chalk.yellow(`  Warning: No files found for component '${componentType}' in theme '${themeName}'`));
        }
      }

      // Copy app files (globals.css, layout.tsx) to ./app directory
      spinner.text = `Fetching theme app files...`;
      
      const appDestPath = path.join(process.cwd(), 'app');
      
      // Ensure the app directory exists
      await fse.ensureDir(appDestPath);
      
      for (const appFile of APP_FILES) {
        try {
          const appFileUrl = `${GITHUB_RAW_BASE}/${themeName}/${appFile}`;
          spinner.text = `Installing ${appFile}...`;
          
          const response = await fetch(appFileUrl);
          if (response.ok) {
            const fileContent = await response.text();
            await fse.writeFile(path.join(appDestPath, appFile), fileContent);
            totalFiles++;
            installedComponents.push(`${appFile} → ${appDestPath}`);
          }
        } catch (error) {
          // Skip if file doesn't exist or network error
          continue;
        }
      }

      // Copy page file to ./app/(dashboard)/page.tsx
      spinner.text = `Fetching theme page file...`;
      
      const dashboardDestPath = path.join(process.cwd(), 'app', '(dashboard)');
      
      // Ensure the app/(dashboard) directory exists
      await fse.ensureDir(dashboardDestPath);
      
      for (const pageFile of PAGE_FILES) {
        try {
          const pageFileUrl = `${GITHUB_RAW_BASE}/${themeName}/${pageFile}`;
          spinner.text = `Installing dashboard ${pageFile}...`;
          
          const response = await fetch(pageFileUrl);
          if (response.ok) {
            const fileContent = await response.text();
            await fse.writeFile(path.join(dashboardDestPath, pageFile), fileContent);
            totalFiles++;
            installedComponents.push(`${pageFile} → ${dashboardDestPath}`);
          }
        } catch (error) {
          // Skip if file doesn't exist or network error
          continue;
        }
      }

      if (totalFiles > 0) {
        spinner.succeed(chalk.green(`Theme '${themeName}' installed successfully!`));
        console.log(chalk.yellow(`  ${totalFiles} components copied:`));
        installedComponents.forEach(component => {
          console.log(chalk.cyan(`    ${component}`));
        });
      } else {
        spinner.fail(chalk.red(`No components found for theme '${themeName}'`));
        process.exit(1);
      }

    } catch (error) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program.parse(process.argv);