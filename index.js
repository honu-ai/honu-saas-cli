#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fetch from 'node-fetch';
import fse from 'fs-extra';
import path from 'path';

const program = new Command();

const GITHUB_REPO_API = 'https://api.github.com/repos/honu-ai/honu-saas-themes/contents/components';

// Define the component types to copy
const COMPONENT_TYPES = ['hero-section', 'problem-section', 'solution-section', 'benefits-section', 'faq-section', 'cta-section', 'footer'];

// Define files to copy to the app directory
const APP_FILES = ['globals.css', 'layout.tsx'];

program
  .command('add <theme-name>')
  .description('Add a new theme by copying its components into your project')
  .action(async (themeName) => {
    const spinner = ora(chalk.blue(`Fetching theme '${themeName}'...`)).start();

    try {
      let totalFiles = 0;
      const installedComponents = [];

      // 1. Process each component type
      for (const componentType of COMPONENT_TYPES) {
        spinner.text = `Fetching ${componentType} components...`;
        
        // Create destination path for this component type
        const destPath = path.join(process.cwd(), 'components', componentType);
        
        // Get the list of files for this component type from the GitHub API
        const response = await fetch(`${GITHUB_REPO_API}/${themeName}/${componentType}`);
        if (!response.ok) {
          console.log(chalk.yellow(`  Warning: Component type '${componentType}' not found for theme '${themeName}'`));
          continue;
        }
        const files = await response.json();

        spinner.text = `Installing ${componentType} components...`;

        // 2. Ensure the destination directory exists
        await fse.ensureDir(destPath);

        // 3. Download and write each file
        for (const file of files) {
          if (file.type === 'file') {
            const fileResponse = await fetch(file.download_url);
            const fileContent = await fileResponse.text();
            await fse.writeFile(path.join(destPath, file.name), fileContent);
            totalFiles++;
          }
        }

        installedComponents.push(`${componentType} → ${destPath}`);
      }

      // Copy app files (globals.css, layout.tsx) to ./app directory
      spinner.text = `Fetching theme app files...`;
      
      // Get the list of files in the theme root directory
      const themeResponse = await fetch(`${GITHUB_REPO_API}/${themeName}`);
      if (themeResponse.ok) {
        const themeFiles = await themeResponse.json();
        const appDestPath = path.join(process.cwd(), 'app');
        
        // Ensure the app directory exists
        await fse.ensureDir(appDestPath);
        
        for (const appFile of APP_FILES) {
          const foundFile = themeFiles.find(file => file.name === appFile && file.type === 'file');
          if (foundFile) {
            spinner.text = `Installing ${appFile}...`;
            const fileResponse = await fetch(foundFile.download_url);
            const fileContent = await fileResponse.text();
            await fse.writeFile(path.join(appDestPath, appFile), fileContent);
            totalFiles++;
            installedComponents.push(`${appFile} → ${appDestPath}`);
          }
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