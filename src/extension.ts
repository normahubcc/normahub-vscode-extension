import * as vscode from 'vscode';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

const SECRET_KEY_NAME = 'normahub.apiKey';
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    // 1. Status Bar Item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'normahub.switchModel';
    statusBarItem.tooltip = 'NormaHub: кликните для выбора модели или настройки';
    updateStatusBar();
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // 2. Webview Sidebar Provider
    const sidebarProvider = new NormaHubSidebarProvider(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('normahub.controlView', sidebarProvider)
    );

    // 3. Commands
    context.subscriptions.push(
        vscode.commands.registerCommand('normahub.configureProject', () => configureProjectFiles(context)),
        vscode.commands.registerCommand('normahub.switchModel', () => switchModelPrompt()),
        vscode.commands.registerCommand('normahub.testPing', () => testGatewayPing()),
        vscode.commands.registerCommand('normahub.openBilling', () => {
            vscode.env.openExternal(vscode.Uri.parse('https://normahub.cc'));
        }),
        vscode.commands.registerCommand('normahub.explainSelection', () => handleCodeAction(context, 'explain')),
        vscode.commands.registerCommand('normahub.generateTests', () => handleCodeAction(context, 'test'))
    );
}

function updateStatusBar() {
    const config = vscode.workspace.getConfiguration('normahub');
    const model = config.get<string>('defaultModel', 'claude-sonnet-5-5');
    const shortName = model.replace('claude-', '').replace('-flash', '');
    statusBarItem.text = `$(hubot) NormaHub: ${shortName}`;
}

async function getApiKey(context: vscode.ExtensionContext): Promise<string> {
    const secretKey = await context.secrets.get(SECRET_KEY_NAME);
    if (secretKey && secretKey.trim()) {
        return secretKey.trim();
    }
    const envKey = process.env.NORMAHUB_API_KEY || process.env.OPENAI_API_KEY;
    return envKey ? envKey.trim() : '';
}

async function switchModelPrompt() {
    const models = [
        { label: 'claude-sonnet-5-5', description: 'Claude Sonnet 5.5', detail: 'Оптимально для написания кода, архитектуры и системного дизайна' },
        { label: 'gpt-6-astra', description: 'GPT-6 Astra', detail: 'Флагман рассуждений, сложных алгоритмов и математической логики' },
        { label: 'deepseek-v4.1-flash', description: 'DeepSeek v4.1 Flash', detail: 'Высокая скорость отклика и экономичный автокомплит' },
        { label: 'claude-opus-5', description: 'Claude Opus 5', detail: 'Глубокий сквозной аудит больших кодовых баз' }
    ];

    const pick = await vscode.window.showQuickPick(models, {
        placeHolder: 'Выберите активную модель для работы в редакторе'
    });

    if (pick) {
        const config = vscode.workspace.getConfiguration('normahub');
        await config.update('defaultModel', pick.label, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Активная модель: ${pick.label}`);
        updateStatusBar();
    }
}

async function configureProjectFiles(context: vscode.ExtensionContext): Promise<string[]> {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
        vscode.window.showWarningMessage('Для применения конфигурации откройте рабочую папку проекта.');
        return [];
    }

    const rootPath = folders[0].uri.fsPath;
    const config = vscode.workspace.getConfiguration('normahub');
    const apiKey = (await getApiKey(context)) || 'nr_hub_YOUR_API_KEY';
    const baseUrl = config.get<string>('baseUrl', 'https://api.normahub.cc/v1');
    const model = config.get<string>('defaultModel', 'claude-sonnet-5-5');
    const fastModel = config.get<string>('fastModel', 'deepseek-v4.1-flash');

    const createdFiles: string[] = [];

    // 1. .cursorrules
    const cursorRules = `# NormaHub AI Gateway Configuration\n# Direct connection in CIS/Russia without VPN\n\nOPENAI_BASE_URL="${baseUrl}"\nOPENAI_API_KEY="${apiKey}"\n\n[Preferences]\npreferred_coding_model = "${model}"\nfast_autocomplete_model = "${fastModel}"\n`;
    fs.writeFileSync(path.join(rootPath, '.cursorrules'), cursorRules, 'utf-8');
    createdFiles.push('.cursorrules');

    // 2. Cursor 0.42+ .cursor/rules/normahub.mdc
    const cursorRulesDir = path.join(rootPath, '.cursor', 'rules');
    if (!fs.existsSync(cursorRulesDir)) {
        fs.mkdirSync(cursorRulesDir, { recursive: true });
    }
    const cursorMdc = `---\ndescription: NormaHub direct gateway routing\nglobs: *\n---\n\nAlways use standard OpenAI-compatible endpoints with Base URL: ${baseUrl}\nPreferred models:\n- Primary: ${model}\n- Fast Autocomplete: ${fastModel}\n`;
    fs.writeFileSync(path.join(cursorRulesDir, 'normahub.mdc'), cursorMdc, 'utf-8');
    createdFiles.push('.cursor/rules/normahub.mdc');

    // 3. .aider.conf.yml
    const aiderRules = `openai-api-base: ${baseUrl}\nopenai-api-key: ${apiKey}\nmodel: openai/${model}\neditor-model: openai/${fastModel}\nstream: true\ncache-prompts: true\n`;
    fs.writeFileSync(path.join(rootPath, '.aider.conf.yml'), aiderRules, 'utf-8');
    createdFiles.push('.aider.conf.yml');

    // 4. .windsurfrules
    const windsurfRules = `# NormaHub AI Configuration for Windsurf Cascade\nBase URL: ${baseUrl}\nModel: ${model}\nFast Model: ${fastModel}\n`;
    fs.writeFileSync(path.join(rootPath, '.windsurfrules'), windsurfRules, 'utf-8');
    createdFiles.push('.windsurfrules');

    // 5. .clinerules & cline_custom_modes.json
    const clineRules = `# Cline Rules\nProvider: OpenAI-compatible\nBase URL: ${baseUrl}\nModel: ${model}\n`;
    fs.writeFileSync(path.join(rootPath, '.clinerules'), clineRules, 'utf-8');
    createdFiles.push('.clinerules');

    const clineModes = {
        customModes: [
            {
                slug: "normahub-architect",
                name: "NormaHub Architect",
                roleDefinition: `Senior Architect powered by ${model} via ${baseUrl}`,
                groups: ["read", "edit", "command"]
            }
        ]
    };
    fs.writeFileSync(path.join(rootPath, 'cline_custom_modes.json'), JSON.stringify(clineModes, null, 2), 'utf-8');
    createdFiles.push('cline_custom_modes.json');

    // 6. .env.normahub.example
    const envRules = `# Прямой доступ к флагманским моделям без VPN: https://normahub.cc\nOPENAI_BASE_URL="${baseUrl}"\nOPENAI_API_KEY="${apiKey}"\nDEFAULT_MODEL="${model}"\nFAST_MODEL="${fastModel}"\n`;
    fs.writeFileSync(path.join(rootPath, '.env.normahub.example'), envRules, 'utf-8');
    createdFiles.push('.env.normahub.example');

    vscode.window.showInformationMessage(`Создано ${createdFiles.length} конфигурационных файлов для Cursor, Windsurf, Aider, Cline.`);
    return createdFiles;
}

function testGatewayPing(callback?: (ms: number, err?: string) => void) {
    const start = Date.now();
    const req = https.get('https://api.normahub.cc/v1/models', (res) => {
        const latency = Date.now() - start;
        if (callback) {
            callback(latency);
        } else {
            vscode.window.showInformationMessage(`Шлюз NormaHub доступен. Пинг: ${latency} мс (Прямой канал РФ, без VPN).`);
        }
    });

    req.on('error', (err) => {
        if (callback) {
            callback(-1, err.message);
        } else {
            vscode.window.showErrorMessage(`Ошибка проверки связи со шлюзом: ${err.message}`);
        }
    });

    req.setTimeout(5000, () => {
        req.destroy();
        if (callback) {
            callback(-1, 'Таймаут соединения (5с)');
        }
    });
}

async function handleCodeAction(context: vscode.ExtensionContext, mode: 'explain' | 'test') {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('Откройте файл с кодом и выделите фрагмент.');
        return;
    }

    const selection = editor.document.getText(editor.selection);
    if (!selection.trim()) {
        vscode.window.showWarningMessage('Выделите участок кода для отправки в модель.');
        return;
    }

    const apiKey = await getApiKey(context);
    if (!apiKey) {
        vscode.window.showErrorMessage('API-ключ не задан. Укажите ключ в боковой панели NormaHub.');
        return;
    }

    const config = vscode.workspace.getConfiguration('normahub');
    const baseUrl = config.get<string>('baseUrl', 'https://api.normahub.cc/v1');
    const model = config.get<string>('defaultModel', 'claude-sonnet-5-5');

    const prompt = mode === 'explain'
        ? `Проведи инженерный разбор следующего фрагмента кода. Укажи назначение, потенциальные риски, граничные условия и способы оптимизации:\n\n\`\`\`\n${selection}\n\`\`\``
        : `Напиши исчерпывающий набор unit-тестов для следующего кода (используй pytest для Python или vitest/jest для TS/JS). Покрой граничные условия и негативные сценарии:\n\n\`\`\`\n${selection}\n\`\`\``;

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: mode === 'explain' ? `NormaHub: Анализ кода (${model})...` : `NormaHub: Генерация тестов (${model})...`,
            cancellable: false
        },
        async () => {
            try {
                const response = await callNormaHubCompletion(baseUrl, apiKey, model, prompt);
                const doc = await vscode.workspace.openTextDocument({
                    content: response,
                    language: 'markdown'
                });
                await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });
            } catch (err: any) {
                vscode.window.showErrorMessage(`Ошибка выполнения запроса: ${err.message}`);
            }
        }
    );
}

function callNormaHubCompletion(baseUrl: string, apiKey: string, model: string, prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const url = new URL(`${baseUrl}/chat/completions`);
        const body = JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2
        });

        const req = https.request(
            url,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Length': Buffer.byteLength(body)
                },
                timeout: 30000
            },
            (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const parsed = JSON.parse(data);
                            const text = parsed.choices?.[0]?.message?.content || 'Ответ пуст';
                            resolve(text);
                        } catch (e: any) {
                            reject(new Error(`Ошибка парсинга ответа: ${e.message}`));
                        }
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                });
            }
        );

        req.on('error', (err) => reject(err));
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Таймаут запроса к шлюзу (30с)'));
        });

        req.write(body);
        req.end();
    });
}

class NormaHubSidebarProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly _context: vscode.ExtensionContext) {}

    public async resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._context.extensionUri]
        };

        const updateContent = async () => {
            const apiKey = await getApiKey(this._context);
            webviewView.webview.html = this._getHtmlForWebview(apiKey);
        };

        await updateContent();

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'saveKey':
                    if (data.value) {
                        await this._context.secrets.store(SECRET_KEY_NAME, data.value.trim());
                        vscode.window.showInformationMessage('API-ключ сохранен в защищенном хранилище (SecretStorage).');
                    } else {
                        await this._context.secrets.delete(SECRET_KEY_NAME);
                        vscode.window.showInformationMessage('API-ключ удален.');
                    }
                    await updateContent();
                    break;
                case 'changeModel':
                    const config = vscode.workspace.getConfiguration('normahub');
                    await config.update('defaultModel', data.value, vscode.ConfigurationTarget.Global);
                    updateStatusBar();
                    await updateContent();
                    break;
                case 'configureProject':
                    const files = await configureProjectFiles(this._context);
                    webviewView.webview.postMessage({ type: 'configDone', files });
                    break;
                case 'testPing':
                    testGatewayPing((ms, err) => {
                        webviewView.webview.postMessage({
                            type: 'pingResult',
                            latency: ms,
                            error: err
                        });
                    });
                    break;
                case 'openBilling':
                    vscode.env.openExternal(vscode.Uri.parse('https://normahub.cc'));
                    break;
                case 'runPlayground':
                    await this._handlePlaygroundRequest(data.prompt, data.model);
                    break;
            }
        });
    }

    private async _handlePlaygroundRequest(prompt: string, model: string) {
        if (!this._view) { return; }
        const apiKey = await getApiKey(this._context);
        if (!apiKey) {
            this._view.webview.postMessage({ type: 'playgroundError', error: 'API-ключ не задан. Укажите ключ во вкладке Настройка.' });
            return;
        }

        const config = vscode.workspace.getConfiguration('normahub');
        const baseUrl = config.get<string>('baseUrl', 'https://api.normahub.cc/v1');

        const startTime = Date.now();
        let firstTokenTime = 0;

        try {
            const url = new URL(`${baseUrl}/chat/completions`);
            const body = JSON.stringify({
                model: model || 'deepseek-v4.1-flash',
                messages: [{ role: 'user', content: prompt }],
                stream: true
            });

            const req = https.request(
                url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Length': Buffer.byteLength(body)
                    },
                    timeout: 25000
                },
                (res) => {
                    if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                        let errBody = '';
                        res.on('data', d => { errBody += d; });
                        res.on('end', () => {
                            this._view?.webview.postMessage({ type: 'playgroundError', error: `HTTP ${res.statusCode}: ${errBody}` });
                        });
                        return;
                    }

                    res.on('data', (chunk: Buffer) => {
                        if (!firstTokenTime) {
                            firstTokenTime = Date.now() - startTime;
                            this._view?.webview.postMessage({ type: 'playgroundTtft', ttft: firstTokenTime });
                        }

                        const lines = chunk.toString().split('\n');
                        for (const line of lines) {
                            const trimmed = line.trim();
                            if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
                                try {
                                    const parsed = JSON.parse(trimmed.slice(6));
                                    const delta = parsed.choices?.[0]?.delta?.content;
                                    if (delta) {
                                        this._view?.webview.postMessage({ type: 'playgroundChunk', text: delta });
                                    }
                                } catch (_) {}
                            }
                        }
                    });

                    res.on('end', () => {
                        const totalTime = Date.now() - startTime;
                        this._view?.webview.postMessage({ type: 'playgroundDone', totalTime, ttft: firstTokenTime || totalTime });
                    });
                }
            );

            req.on('error', (err) => {
                this._view?.webview.postMessage({ type: 'playgroundError', error: err.message });
            });

            req.write(body);
            req.end();
        } catch (err: any) {
            this._view.webview.postMessage({ type: 'playgroundError', error: err.message });
        }
    }

    private _getHtmlForWebview(apiKey: string): string {
        const config = vscode.workspace.getConfiguration('normahub');
        const currentModel = config.get<string>('defaultModel', 'claude-sonnet-5-5');
        const maskedKey = apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}` : 'Ключ не задан';

        return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NormaHub Gateway</title>
    <style>
        :root {
            --nh-accent: #2563eb;
            --nh-success: #16a34a;
            --nh-danger: #dc2626;
            --nh-surface: var(--vscode-editor-background);
            --nh-border: var(--vscode-widget-border, #333333);
        }
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-sideBar-background);
            padding: 10px;
            margin: 0;
            line-height: 1.4;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid var(--nh-border);
            padding-bottom: 8px;
            margin-bottom: 10px;
        }
        .title {
            font-weight: 600;
            font-size: 12px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .badge {
            font-size: 10px;
            color: #4ade80;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .tabs {
            display: flex;
            border-bottom: 1px solid var(--nh-border);
            margin-bottom: 10px;
            gap: 4px;
        }
        .tab {
            font-size: 11px;
            padding: 4px 8px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            color: var(--vscode-descriptionForeground);
            user-select: none;
        }
        .tab.active {
            color: var(--vscode-foreground);
            border-bottom-color: var(--vscode-activityBar-activeBorder, #007acc);
            font-weight: 600;
        }
        .tab-panel {
            display: none;
        }
        .tab-panel.active {
            display: block;
        }
        .card {
            background-color: var(--nh-surface);
            border: 1px solid var(--nh-border);
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 10px;
        }
        .card-title {
            font-size: 11px;
            font-weight: 600;
            color: var(--vscode-descriptionForeground);
            text-transform: uppercase;
            margin-bottom: 6px;
        }
        input[type="text"], input[type="password"], select, textarea {
            width: 100%;
            box-sizing: border-box;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border, #444);
            padding: 5px 8px;
            border-radius: 2px;
            font-size: 12px;
            outline: none;
            font-family: inherit;
        }
        textarea {
            resize: vertical;
            min-height: 50px;
            font-family: var(--vscode-editor-font-family, monospace);
        }
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 6px 10px;
            border-radius: 2px;
            cursor: pointer;
            font-size: 12px;
            width: 100%;
            margin-top: 6px;
            font-weight: 500;
        }
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        button.secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        button.secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        .code-output {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--nh-border);
            border-radius: 2px;
            padding: 8px;
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 11px;
            white-space: pre-wrap;
            max-height: 180px;
            overflow-y: auto;
            margin-top: 6px;
        }
        .metric-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-top: 4px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">NormaHub AI Gateway</div>
        <div class="badge" id="netStatus">● Прямой канал RU</div>
    </div>

    <div class="tabs">
        <div class="tab active" data-tab="configTab">Проект</div>
        <div class="tab" data-tab="playgroundTab">Плейграунд</div>
        <div class="tab" data-tab="diagTab">Шлюз</div>
    </div>

    <!-- TAB 1: CONFIGURATION -->
    <div class="tab-panel active" id="configTab">
        <div class="card">
            <div class="card-title">Авторизация</div>
            <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 4px;">
                Ключ: <code>${maskedKey}</code>
            </div>
            <input type="password" id="apiKeyInput" placeholder="nr_hub_..." />
            <button id="saveKeyBtn">Сохранить в SecretStorage</button>
            <button class="secondary" id="billingBtn">Пополнить баланс (СБП)</button>
        </div>

        <div class="card">
            <div class="card-title">Активная модель</div>
            <select id="modelSelect">
                <option value="claude-sonnet-5-5" ${currentModel === 'claude-sonnet-5-5' ? 'selected' : ''}>Claude Sonnet 5.5 (Код / Архитектура)</option>
                <option value="gpt-6-astra" ${currentModel === 'gpt-6-astra' ? 'selected' : ''}>GPT-6 Astra (Сложная логика)</option>
                <option value="deepseek-v4.1-flash" ${currentModel === 'deepseek-v4.1-flash' ? 'selected' : ''}>DeepSeek v4.1 Flash (Автокомплит)</option>
                <option value="claude-opus-5" ${currentModel === 'claude-opus-5' ? 'selected' : ''}>Claude Opus 5 (Рефакторинг)</option>
            </select>
        </div>

        <div class="card">
            <div class="card-title">Конфигурация проекта в 1 клик</div>
            <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 6px;">
                Генерирует файлы для Cursor (.cursorrules, .cursor/rules), Windsurf, Aider и Cline.
            </div>
            <button id="configProjBtn">Сгенерировать конфиги</button>
            <div id="configStatus" style="font-size: 11px; color: #4ade80; margin-top: 4px;"></div>
        </div>
    </div>

    <!-- TAB 2: PLAYGROUND -->
    <div class="tab-panel" id="playgroundTab">
        <div class="card">
            <div class="card-title">Тестовый запрос к шлюзу</div>
            <textarea id="promptInput" placeholder="Введите промпт для теста (например: Напиши quicksort на Python с типами)..."></textarea>
            <select id="playgroundModel" style="margin-top: 6px;">
                <option value="deepseek-v4.1-flash">DeepSeek v4.1 Flash (Быстрый)</option>
                <option value="claude-sonnet-5-5">Claude Sonnet 5.5 (Инженерный)</option>
                <option value="gpt-6-astra">GPT-6 Astra (Логика)</option>
            </select>
            <button id="runPlaygroundBtn">Отправить запрос</button>
            <div class="metric-row">
                <span id="ttftMetric">TTFT: --</span>
                <span id="totalTimeMetric">Время: --</span>
            </div>
            <div class="code-output" id="playgroundOutput" style="display: none;"></div>
        </div>
    </div>

    <!-- TAB 3: DIAGNOSTICS -->
    <div class="tab-panel" id="diagTab">
        <div class="card">
            <div class="card-title">Сетевая диагностика</div>
            <button class="secondary" id="pingBtn">Замерить сетевой отклик</button>
            <div class="metric-row" style="margin-top: 6px;">
                <span>Эндпоинт:</span>
                <code>api.normahub.cc/v1</code>
            </div>
            <div class="metric-row">
                <span>Задержка:</span>
                <span id="pingOutput" style="font-weight: 600;">Не замерялась</span>
            </div>
        </div>

        <div class="card">
            <div class="card-title">Документация и SDK</div>
            <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 6px;">
                Официальный каталог моделей, тарифы и документация API.
            </div>
            <button class="secondary" id="docsBtn">Открыть документацию</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        // Tabs logic
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                const targetId = tab.getAttribute('data-tab');
                document.getElementById(targetId).classList.add('active');
            });
        });

        // Config actions
        document.getElementById('saveKeyBtn').addEventListener('click', () => {
            const val = document.getElementById('apiKeyInput').value;
            vscode.postMessage({ type: 'saveKey', value: val });
        });

        document.getElementById('billingBtn').addEventListener('click', () => {
            vscode.postMessage({ type: 'openBilling' });
        });

        document.getElementById('modelSelect').addEventListener('change', (e) => {
            vscode.postMessage({ type: 'changeModel', value: e.target.value });
        });

        document.getElementById('configProjBtn').addEventListener('click', () => {
            vscode.postMessage({ type: 'configureProject' });
        });

        // Diagnostics
        document.getElementById('pingBtn').addEventListener('click', () => {
            const out = document.getElementById('pingOutput');
            out.textContent = 'Замер...';
            vscode.postMessage({ type: 'testPing' });
        });

        document.getElementById('docsBtn').addEventListener('click', () => {
            vscode.postMessage({ type: 'openBilling' });
        });

        // Playground
        const runBtn = document.getElementById('runPlaygroundBtn');
        const promptInput = document.getElementById('promptInput');
        const playgroundOutput = document.getElementById('playgroundOutput');
        const ttftMetric = document.getElementById('ttftMetric');
        const totalTimeMetric = document.getElementById('totalTimeMetric');

        runBtn.addEventListener('click', () => {
            const prompt = promptInput.value.trim();
            if (!prompt) return;

            playgroundOutput.style.display = 'block';
            playgroundOutput.textContent = 'Подключение к шлюзу...\\n';
            ttftMetric.textContent = 'TTFT: замер...';
            totalTimeMetric.textContent = 'Время: замер...';
            runBtn.disabled = true;

            const selectedModel = document.getElementById('playgroundModel').value;
            vscode.postMessage({
                type: 'runPlayground',
                prompt: prompt,
                model: selectedModel
            });
        });

        window.addEventListener('message', event => {
            const msg = event.data;
            if (msg.type === 'pingResult') {
                const out = document.getElementById('pingOutput');
                if (msg.latency >= 0) {
                    out.textContent = msg.latency + ' мс (Прямой RU)';
                    out.style.color = '#4ade80';
                } else {
                    out.textContent = 'Ошибка: ' + (msg.error || 'таймаут');
                    out.style.color = '#f87171';
                }
            } else if (msg.type === 'configDone') {
                const status = document.getElementById('configStatus');
                status.textContent = 'Создано ' + (msg.files ? msg.files.length : 0) + ' файлов (.cursorrules, .windsurfrules, .aider...)';
            } else if (msg.type === 'playgroundTtft') {
                ttftMetric.textContent = 'TTFT: ' + msg.ttft + ' мс';
            } else if (msg.type === 'playgroundChunk') {
                if (playgroundOutput.textContent === 'Подключение к шлюзу...\\n') {
                    playgroundOutput.textContent = '';
                }
                playgroundOutput.textContent += msg.text;
                playgroundOutput.scrollTop = playgroundOutput.scrollHeight;
            } else if (msg.type === 'playgroundDone') {
                totalTimeMetric.textContent = 'Время: ' + msg.totalTime + ' мс';
                runBtn.disabled = false;
            } else if (msg.type === 'playgroundError') {
                playgroundOutput.textContent += '\\n[Ошибка]: ' + msg.error;
                playgroundOutput.style.color = '#f87171';
                runBtn.disabled = false;
            }
        });
    </script>
</body>
</html>`;
    }
}
