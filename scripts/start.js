#!/usr/bin/env node
'use strict';
const readline = require('readline');
const {execSync} = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const pkg = require(path.join(ROOT, 'package.json'));
const config = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'brd_sdk.config.json'), 'utf8'));

const PLATFORM = pkg.name.includes('webos') ? 'WebOS' : 'Tizen';
const ACCENT = '\x1b[32m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';

const API_KEY_GUIDE_URL =
    'https://brightsdk.github.io/bright-sdk-downloader-rs/obtain-api-key.html';

function banner() {
    console.clear();
    console.log(`
${ACCENT}╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ${BOLD}BrightSDK ${PLATFORM} Integration Example${RESET}${ACCENT}                       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${RESET}
`);
    console.log(`${BOLD}Description${RESET}`);
    console.log(`  Demonstrates how to integrate BrightSDK into a ${PLATFORM} app`);
    console.log(`  using the bright-sdk-integration CLI tool.\n`);
    console.log(`${BOLD}Capabilities${RESET}`);
    console.log(`  • Download & extract the latest BrightSDK for ${PLATFORM}`);
    console.log(`  • Inject SDK script tags into your app's index.html`);
    console.log(`  • Configure SDK version, paths, and service directory`);
    console.log(`  • Reset to clean state (remove all SDK files)\n`);
    console.log(`${BOLD}Current config${RESET}`);
    console.log(`  SDK version : ${CYAN}${config.sdk_ver || 'latest'}${RESET}`);
    console.log(`  App dir     : ${CYAN}${config.app_dir}${RESET}`);
    console.log(`  Index       : ${CYAN}${config.index}${RESET}`);
    console.log(`  Service dir : ${CYAN}${config.sdk_service_dir || 'N/A'}${RESET}`);
    console.log('');
    if (process.env.SDK_API_KEY) {
        console.log(`${BOLD}API key${RESET}       : ${ACCENT}set ✓${RESET}`);
    } else {
        console.log(`${RED}${BOLD}⚠  SDK_API_KEY is not set${RESET}`);
        console.log(`   The SDK install/update will fail without a valid API key.\n`);
        console.log(`   ${BOLD}Quick fix:${RESET}`);
        console.log(`     ${DIM}macOS/Linux:${RESET}  export SDK_API_KEY=<your-api-key>`);
        console.log(`     ${DIM}PowerShell:${RESET}   $env:SDK_API_KEY = "<your-api-key>"`);
        console.log(`     ${DIM}CMD:${RESET}          set SDK_API_KEY=<your-api-key>\n`);
        console.log(`   ${BOLD}How to get a key:${RESET}`);
        console.log(`     1. Log in at ${CYAN}https://bright-sdk.com${RESET}`);
        console.log(`     2. Go to Settings → Company profile → API keys`);
        console.log(`     3. Copy or generate a key\n`);
        console.log(`   ${DIM}Full guide: ${API_KEY_GUIDE_URL}${RESET}`);
    }
    console.log('');
}

const MENU = [
    {key: '1', label: 'Install / Update SDK (auto)', cmd: 'npm run update', isInstall: true},
    {key: '2', label: 'Install / Update SDK (interactive)', cmd: 'npm run update:interactive', isInstall: true},
    {key: '3', label: 'Reset (remove SDK files)', cmd: 'npm run reset'},
    {key: '4', label: 'Show README', action: 'readme'},
    {key: 'q', label: 'Exit'},
];

function showMenu() {
    console.log(`${BOLD}What would you like to do?${RESET}\n`);
    for (const item of MENU) {
        console.log(`  ${ACCENT}${item.key}${RESET})  ${item.label}`);
    }
    console.log('');
}

function run(cmd) {
    const script_name = cmd.replace('npm run ', '');
    const resolved = pkg.scripts && pkg.scripts[script_name] || cmd;
    console.log(`\n${DIM}> ${cmd}${RESET}`);
    console.log(`${DIM}  executing: ${resolved}${RESET}\n`);
    try {
        execSync(cmd, {stdio: 'inherit', cwd: ROOT});
    } catch (e) {
        console.error(`\n${RESET}\x1b[31mCommand failed with exit code ${e.status}\x1b[0m`);
    }
}

function prompt() {
    const rl = readline.createInterface({input: process.stdin, output: process.stdout});
    rl.question(`${ACCENT}>${RESET} Choose an option: `, answer => {
        rl.close();
        const choice = MENU.find(m => m.key === answer.trim().toLowerCase());
        if (!choice) {
            console.log('\nInvalid option.\n');
            return prompt();
        }
        if (choice.key === 'q') {
            console.log('\nBye!\n');
            return process.exit(0);
        }
        if (choice.action === 'readme') {
            const readme = fs.readFileSync(
                path.join(ROOT, 'README.md'), 'utf8');
            console.log(`\n${readme}`);
            console.log(`\n${DIM}--- end of README ---${RESET}\n`);
            showMenu();
            return prompt();
        }
        run(choice.cmd);
        console.log(`\n${DIM}--- done ---${RESET}\n`);
        if (choice.isInstall) {
            console.log(`${BOLD}Next step:${RESET} Open the project in ${CYAN}VS Code${RESET} to inspect the integrated SDK files.\n`);
        }
        showMenu();
        prompt();
    });
}

banner();
showMenu();
prompt();
