# NormaHub AI Gateway for Cursor & VS Code

Официальное расширение для подключения прямого AI-шлюза [NormaHub](https://normahub.cc) в кодовые редакторы **Cursor**, **Windsurf**, **VS Code** и **VSCodium** без использования VPN.

---

## Возможности

* **Прямой сетевой маршрут в РФ без VPN:** Прямое обращение к `Claude Sonnet 5.5`, `GPT-6 Astra`, `DeepSeek v4.1 Flash` и `Claude Opus 5` с сетевой задержкой 35–45 мс.
* **Безопасное хранение ключей:** API-ключ сохраняется в нативном системном хранилище (`SecretStorage` / OS Keychain), а не в открытом виде в настройках.
* **Встроенный AI Playground в Sidebar:**
  * Потоковый стриминг ответов (SSE).
  * Замер реального времени до первого токена (TTFT).
  * Подсчет затраченного времени.
* **Контекстные команды анализа кода (Context Menu):**
  * `NormaHub: Объяснить выделенный код` (глубокий технический разбор архитектуры и краевых случаев).
  * `NormaHub: Сгенерировать тесты для выделенного кода` (генерация unit-тестов pytest / vitest).
* **Генерация конфигураций проекта в 1 клик:**
  * `.cursorrules` и `.cursor/rules/normahub.mdc` (Cursor).
  * `.windsurfrules` (Windsurf Cascade).
  * `.aider.conf.yml` (Aider CLI).
  * `cline_custom_modes.json` и `.clinerules` (Cline).
  * `.env.normahub.example` (шаблон переменных окружения).
* **Сетевая диагностика:** Замер времени отклика до API-шлюза (`api.normahub.cc/v1`) прямо из боковой панели.

---

## Установка

### Установка из файла VSIX

```bash
# Установка в Cursor
cursor --install-extension normahub-ai-gateway-1.1.0.vsix

# Установка в VS Code
code --install-extension normahub-ai-gateway-1.1.0.vsix
```

Либо через графический интерфейс:
1. `Ctrl+Shift+X` (вкладка Extensions).
2. Нажмите меню `...` в правом верхнем углу.
3. Выберите **Install from VSIX...** и укажите файл `normahub-ai-gateway-1.1.0.vsix`.

---

## Настройка

1. Откройте вкладку **NormaHub** в боковой панели Activity Bar.
2. Введите API-ключ шлюза (`nr_hub_...`) и нажмите **Сохранить в SecretStorage**.
3. Выберите активную рабочую модель (`Claude Sonnet 5.5` или `DeepSeek v4.1 Flash`).
4. Нажмите **Сгенерировать конфиги** для интеграции со всеми AI-ассистентами в текущем проекте.

---

## Публикация

### 1. Open-VSX Registry (Cursor, Windsurf, VSCodium)
```bash
npx ovsx publish normahub-ai-gateway-1.1.0.vsix -p <OPEN_VSX_TOKEN>
```

### 2. Visual Studio Marketplace (VS Code)
```bash
npx @vscode/vsce publish --packagePath normahub-ai-gateway-1.1.0.vsix -p <VSCE_PAT>
```

---

## Сборка из исходников

```bash
npm install
npm run build
python3 build_vsix.py
```
