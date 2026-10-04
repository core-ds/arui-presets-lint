import { type Manifest } from './types.js';

const checkScript = ['scripts', 'styles', 'format:check', 'knip', 'secretlint']
    .map((command) => `arui-presets-lint ${command}`)
    .join(' && ');

const scripts: Record<string, string> = {
    'lint:check': checkScript,
    'lint:scripts': 'arui-presets-lint scripts',
    'lint:styles': 'arui-presets-lint styles',
    'lint:unused': 'arui-presets-lint knip',
    'lint:secrets': 'arui-presets-lint secretlint',
    format: 'arui-presets-lint format',
    'format:check': 'arui-presets-lint format:check',
};

export function planScripts(pkg: Manifest, migrate: boolean, warnings: string[]): void {
    const projectScripts = {
        ...(pkg.scripts as Manifest | undefined),
    };

    for (const [name, value] of Object.entries(scripts)) {
        if (projectScripts[name] === undefined) {
            projectScripts[name] = value;
        } else if (migrate && name === 'lint:unused' && projectScripts[name] === 'knip') {
            // Автоматически меняем только простой запуск Knip без дополнительных аргументов.
            projectScripts[name] = value;
        } else if (projectScripts[name] !== value) {
            warnings.push(`Скрипт ${name} сохранён: ${JSON.stringify(projectScripts[name])}`);
        }
    }

    pkg.scripts = projectScripts;
}
