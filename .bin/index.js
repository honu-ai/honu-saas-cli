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
const COMPONENT_TYPES = ['hero-section', ];

program
  .command('add <theme-name>')
  .description('Add a new theme by copying its components into your project')
  .action(async (themeName) => {
    const spinner = ora(chalk.blue(`Fetching theme '${themeName}'...`)).start();
    const destPath = path.join(process.cwd(), 'components');

    try {
      let totalFiles = 0;

      // 1. Process each component type
      for (const componentType of COMPONENT_TYPES) {
        spinner.text = `Fetching ${componentType} components...`;
        
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
      }

      if (totalFiles > 0) {
        spinner.succeed(chalk.green(`Theme '${themeName}' installed successfully!`));
        console.log(chalk.yellow(`  ${totalFiles} components copied to: ${destPath}`));
        console.log(chalk.cyan(`  Component types installed: ${COMPONENT_TYPES.join(', ')}`));
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