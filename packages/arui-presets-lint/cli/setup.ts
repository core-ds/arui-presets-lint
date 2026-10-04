import { applySetup, previewSetup } from './setup/files.js';
import { planSetup } from './setup/plan.js';

export { applySetup, planSetup, previewSetup };
export type SetupPlan = Awaited<ReturnType<typeof planSetup>>;

export async function setupProject(cwd: string, migrate: boolean, args: string[]) {
    if (args.some((arg) => !['--dry-run', '--json'].includes(arg))) {
        throw new Error('init/migrate принимают только --dry-run и --json.');
    }

    const plan: SetupPlan = await planSetup(cwd, migrate);
    const dryRun = args.includes('--dry-run');

    if (!dryRun) {
        await applySetup(cwd, plan);
    }

    if (args.includes('--json')) {
        console.log(JSON.stringify({ dryRun, ...plan }, null, 2));
    } else {
        console.log(previewSetup(plan) || 'Изменения не требуются.');

        for (const warning of plan.warnings) {
            console.log(`Вручную: ${warning}`);
        }

        console.log(dryRun ? 'Предпросмотр: файлы не изменены.' : 'Настройки записаны.');
    }
}
