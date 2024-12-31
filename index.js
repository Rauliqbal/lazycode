#!/usr/bin/env node
import { promisify } from 'util';
import { exec as _exec } from 'child_process';
import { join } from 'path';
import inquirer from 'inquirer';
import { rm as _rm, existsSync, mkdirSync, rmSync } from 'fs';
import ora from 'ora';
import chalk from 'chalk';
const exec = promisify(_exec);
const rm = promisify(_rm);
const date = new Date()

// ASCII ART
const asciiArt = `
██╗      █████╗ ███████╗██╗   ██╗ ██████╗ ██████╗ ██████╗ ███████╗
██║     ██╔══██╗╚══███╔╝╚██╗ ██╔╝██╔════╝██╔═══██╗██╔══██╗██╔════╝
██║     ███████║  ███╔╝  ╚████╔╝ ██║     ██║   ██║██║  ██║█████╗  
██║     ██╔══██║ ███╔╝    ╚██╔╝  ██║     ██║   ██║██║  ██║██╔══╝  
███████╗██║  ██║███████╗   ██║   ╚██████╗╚██████╔╝██████╔╝███████╗
╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝
`

const greet = `
                                                                   
                 Halo, Selamat datang di Lazy Code                
                    karya dari Rauliqbal ©${date.getFullYear()}    
`

// Question
const question = [
  {
    type: 'input',
    name: 'project-name',
    message: 'Lagi mau buat project apa bang ?',
    default: 'my-project'
  },
  {
    type: 'list',
    name: 'project-template',
    message: 'Mau buat project make stack apa nih?',
    choices: ["NextJS", "NuxtJS", "ReactJS", "VueJS", "MERN", "MEVN"]
  }, {
    type: 'list',
    name: 'package-manager',
    message: 'apa package manager andalanmu ?',
    choices: ['npm', 'pnpm', 'bun']
  }
]

console.log(chalk.blue(asciiArt))
console.log(chalk.greenBright.bold(greet))

inquirer.prompt(question).then(async (answers) => {
  const projectName = answers["project-name"];
  const projectTemplate = answers["project-template"];
  const projectPackageManager = answers['package-manager']
  const currentPath = process.cwd();
  const projectPath = join(currentPath, projectName);


  if (existsSync(projectPath)) {
    console.log(`Yah ada nama projeck yg sama nih., tolong beri nama project lain yaa🙏🏻`)
    process.exit(1)
  } else {
    mkdirSync(projectPath)
  }

  try {
    // Clone Project
    const gitLoading = ora('Mengunduh Projek🚀...').start()
    await exec(`git clone --depth 1 https://github.com/Rauliqbal/${projectTemplate}-boilerplate.git ${projectPath} --quiet`)
    gitLoading.succeed()

    // Setup Directory
    const setupLoading = ora('Mohon Bersabar lagi dibuatkan projek nya📦...')
    const rmGit = rm(join(projectPath, ".git"), {
      recursive: true,
      force: true,
    });
    const rmLicense = rm(join(projectPath, "LICENSE"), {
      recursive: true,
      force: true,
    });
    const rmLock = rm(join(projectPath, "package-lock.json"), {
      recursive: true,
      force: true,
    });

    await Promise.all([rmGit, rmLicense, rmLock]);
    process.chdir(projectPath)
    setupLoading.succeed()

    // Install Depedencies
    const installLoading = ora('Installing Depedencies♻️...').start()
    await exec(`${projectPackageManager} install`)
    installLoading.succeed()

    console.log("🎉Yeay, projekmu sudah siap🥳");
    console.log(chalk.gray("Get started with:"));
    console.log(chalk.green.bold(`    cd ${projectName}`));
    console.log(chalk.green.bold(`    ${projectPackageManager} run dev`));
    console.log("   ");
    console.log(chalk.blue.bold(" Happy Coding cuy!👾 "));


  } catch (error) {
    rmSync(projectPath, { recursive: true, force: true });
    console.log(error);
  }
})
