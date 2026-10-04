import { applySetup, previewSetup } from './setup/files.js';
import { planSetup } from './setup/plan.js';
import { isRecord, type Manifest } from './setup/types.js';

export { applySetup, planSetup, previewSetup };
export type SetupPlan = Awaited<ReturnType<typeof planSetup>>;

function summarizeSetup(plan: SetupPlan): string {
    if (plan.edits.length === 0) {
        return 'Изменения не требуются.';
    }

    const lines = ['Настройка линтеров завершена.'];

    for (const { file, before, after } of plan.edits) {
        lines.push(`${before === null ? 'Создан' : 'Обновлен'} ${file}.`);

        if (file !== 'package.json' || before === null) {
            continue;
        }

        const original = JSON.parse(before) as Manifest;
        const updated = JSON.parse(after) as Manifest;
        const originalScripts = isRecord(original.scripts) ? original.scripts : {};
        const updatedScripts = isRecord(updated.scripts) ? updated.scripts : {};
        const commands = Object.keys(updatedScripts).filter(
            (name) => originalScripts[name] === undefined,
        );
        const settings = Object.keys(updated).filter(
            (key) => key !== 'scripts' && original[key] === undefined,
        );

        if (settings.length > 0) {
            lines.push(`Добавлены настройки: ${settings.join(', ')}.`);
        }
        if (commands.length > 0) {
            lines.push(`Добавлены команды: ${commands.join(', ')}.`);
        }
    }

    return lines.join('\n');
}

export async function setupProject(cwd: string, args: string[]) {
    if (args.some((arg) => !['--dry-run', '--json'].includes(arg))) {
        throw new Error('init принимает только --dry-run и --json.');
    }

    const plan: SetupPlan = await planSetup(cwd);
    const dryRun = args.includes('--dry-run');

    if (!dryRun) {
        await applySetup(cwd, plan);
    }

    if (args.includes('--json')) {
        console.log(JSON.stringify({ dryRun, ...plan }, null, 2));
    } else {
        console.log(
            dryRun ? previewSetup(plan) || 'Изменения не требуются.' : summarizeSetup(plan),
        );

        if (!dryRun && plan.warnings.length > 0) {
            console.log('\nОбратите внимание:');
        }
        for (const warning of plan.warnings) {
            console.log(dryRun ? `Вручную: ${warning}` : `- ${warning}`);
        }

        console.log(
            dryRun ? 'Предпросмотр: файлы не изменены.' : '\nПроверить проект: yarn lint:check',
        );
    }
}
