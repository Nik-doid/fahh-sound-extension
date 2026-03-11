import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

let lastErrorTime = 0;

export function activate(context: vscode.ExtensionContext) {

    // ─── Helpers ────────────────────────────────────────────────────────────

    function getConfig() {
        return vscode.workspace.getConfiguration('fahh');
    }

    function isEnabled(): boolean {
        return getConfig().get<boolean>('enabled') ?? true;
    }

    function getCooldown(): number {
        return getConfig().get<number>('cooldownMs') ?? 2000;
    }

    function getPatterns(): string[] {
        return getConfig().get<string[]>('errorPatterns') ?? [];
    }

    function getSoundPath(): string {
        const custom = getConfig().get<string>('soundFile') ?? '';
        if (custom && fs.existsSync(custom)) return custom;
        return path.join(context.extensionPath, 'assets', 'error-sound.mp3');
    }

    // ─── Sound playback ──────────────────────────────────────────────────────

    function playErrorSound() {
        const soundPath = getSoundPath();

        if (!fs.existsSync(soundPath)) {
            vscode.window.showErrorMessage(`Fahh: Sound file not found at ${soundPath}`);
            return;
        }

        let command: string;

        switch (process.platform) {
            case 'win32':
                // SoundPlayer only supports .wav — use MediaPlayer for .mp3
                command = `powershell -c "Add-Type -AssemblyName presentationCore; $mp = New-Object System.Windows.Media.MediaPlayer; $mp.Open('${soundPath}'); $mp.Play(); Start-Sleep -s 3"`;
                break;
            case 'darwin':
                command = `afplay "${soundPath}"`;
                break;
            default:
                command = `mpg123 "${soundPath}" >/dev/null 2>&1 || ffplay -nodisp -autoexit "${soundPath}" >/dev/null 2>&1`;
                break;
        }

        exec(command, (err) => {
            if (err) console.error('Fahh: Sound playback error:', err.message);
        });
    }

    function playErrorSoundSafe() {
        if (!isEnabled()) return;

        const now = Date.now();
        if (now - lastErrorTime < getCooldown()) return;

        lastErrorTime = now;
        playErrorSound();
    }

    // ─── Status bar ──────────────────────────────────────────────────────────

    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right, 100
    );

    function updateStatusBar() {
        statusBarItem.text = isEnabled() ? '$(bell) Fahh' : '$(bell-slash) Fahh';
        statusBarItem.tooltip = isEnabled()
            ? 'Fahh: Error sound ON — click to toggle'
            : 'Fahh: Error sound OFF — click to toggle';
        statusBarItem.command = 'fahh.toggle';
        statusBarItem.show();
    }

    updateStatusBar();
    context.subscriptions.push(statusBarItem);

    // ─── Terminal listener ───────────────────────────────────────────────────

    const terminalListener = vscode.window.onDidStartTerminalShellExecution((event) => {
        (async () => {
            try {
                for await (const chunk of event.execution.read()) {
                    const text = chunk.toLowerCase();
                    for (const pattern of getPatterns()) {
                        if (text.includes(pattern.toLowerCase())) {
                            console.log('Fahh: Terminal error detected:', text);
                            playErrorSoundSafe();
                            if (getConfig().get<boolean>('showStatusBarMessage')) {
                                vscode.window.setStatusBarMessage('$(warning) Fahh: Terminal error detected', 2000);
                            }
                            return;
                        }
                    }
                }
            } catch (err) {
                console.error('Fahh: Terminal read error:', err);
            }
        })();
    });

    context.subscriptions.push(terminalListener);

    // ─── Commands ────────────────────────────────────────────────────────────

    context.subscriptions.push(
        vscode.commands.registerCommand('fahh.showStatus', () => {
            const patterns = getPatterns();
            vscode.window.showInformationMessage(
                `Fahh: ${isEnabled() ? 'ON' : 'OFF'} | Cooldown: ${getCooldown()}ms | Patterns: ${patterns.length}`
            );
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('fahh.testSound', () => {
            playErrorSound();
            vscode.window.showInformationMessage('Fahh: Playing test sound...');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('fahh.toggle', async () => {
            const current = isEnabled();
            await getConfig().update('enabled', !current, vscode.ConfigurationTarget.Global);
            updateStatusBar();
            vscode.window.showInformationMessage(`Fahh: Sounds ${!current ? 'enabled' : 'disabled'}`);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('fahh.setCooldown', async () => {
            const input = await vscode.window.showInputBox({
                prompt: 'Enter cooldown duration in milliseconds (min 500)',
                value: String(getCooldown()),
                validateInput: (v) => isNaN(Number(v)) || Number(v) < 500
                    ? 'Must be a number >= 500'
                    : null
            });
            if (input) {
                await getConfig().update('cooldownMs', Number(input), vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage(`Fahh: Cooldown set to ${input}ms`);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('fahh.addPattern', async () => {
            const input = await vscode.window.showInputBox({
                prompt: 'Enter a new error pattern to watch for',
                placeHolder: 'e.g. syntax error'
            });
            if (input?.trim()) {
                const patterns = getPatterns();
                if (patterns.includes(input.trim())) {
                    vscode.window.showWarningMessage(`Fahh: Pattern "${input.trim()}" already exists`);
                    return;
                }
                await getConfig().update('errorPatterns', [...patterns, input.trim()], vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage(`Fahh: Added pattern "${input.trim()}"`);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('fahh.removePattern', async () => {
            const patterns = getPatterns();
            const selected = await vscode.window.showQuickPick(patterns, {
                placeHolder: 'Select a pattern to remove'
            });
            if (selected) {
                await getConfig().update(
                    'errorPatterns',
                    patterns.filter(p => p !== selected),
                    vscode.ConfigurationTarget.Global
                );
                vscode.window.showInformationMessage(`Fahh: Removed pattern "${selected}"`);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('fahh.listPatterns', () => {
            const patterns = getPatterns();
            vscode.window.showQuickPick(patterns, {
                placeHolder: `${patterns.length} active pattern(s) — read only view`,
                canPickMany: false
            });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('fahh.resetPatterns', async () => {
            const confirm = await vscode.window.showWarningMessage(
                'Reset all patterns to default?',
                { modal: true },
                'Yes'
            );
            if (confirm === 'Yes') {
                await getConfig().update('errorPatterns', undefined, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage('Fahh: Patterns reset to default');
            }
        })
    );

    // Config change listener — keep status bar in sync
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('fahh')) updateStatusBar();
        })
    );

    console.log('Fahh Terminal Error Sound Extension Active');
}

export function deactivate() {}