import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import {
    CORE_COMPONENTS_PACKAGE,
    PLATFORM_DIRS,
    PLATFORM_FILE_EXTENSIONS,
    STANDALONE_PREFIX,
} from '../constants/index.js';
import { type PlatformName } from '../types/index.js';

/**
 * Директория scope (@alfalab), внутри которой лежат отдельные подпакеты.
 */
const SCOPE_DIR_NAME = path.dirname(STANDALONE_PREFIX);

/**
 * Префикс имени подпакета внутри scope-директории (core-components-).
 */
const STANDALONE_NAME_PREFIX = path.basename(STANDALONE_PREFIX);

type SplitCandidate = { component: string; dir: string };

/**
 * Мемоизирует функцию по ключу, чтобы обход node_modules и проверки платформ
 * не повторялись на каждый проверяемый файл.
 */
const memoize = <K, V>(compute: (key: K) => V): ((key: K) => V) => {
    const cache = new Map<K, V>();

    return (key) => {
        if (cache.has(key)) {
            return cache.get(key) as V;
        }

        const value = compute(key);
        cache.set(key, value);

        return value;
    };
};

/**
 * Читает содержимое директории, возвращая пустой список при ошибке доступа
 * (EACCES/EPERM, read-only CI), чтобы не обрушить весь прогон ESLint.
 */
const readDirSafe = (dir: string): fs.Dirent[] => {
    try {
        return fs.readdirSync(dir, { withFileTypes: true });
    } catch {
        return [];
    }
};

/**
 * Стартовая директория для поиска node_modules. Результат всегда абсолютный.
 */
const resolveBaseDir = (from: string): string => {
    try {
        return path.resolve(fs.statSync(from).isDirectory() ? from : path.dirname(from));
    } catch {
        return process.cwd();
    }
};

/**
 * Резолвит директорию установленного пакета @alfalab/core-components
 * относительно base; null, если пакет не установлен.
 */
const resolveCoreComponentsDir = (base: string): string | null => {
    try {
        const require = createRequire(path.join(base, 'noop.mjs'));

        return path.dirname(require.resolve(`${CORE_COMPONENTS_PACKAGE}/package.json`));
    } catch {
        return null;
    }
};

/**
 * stat-информация записи с переходом по симлинку, либо null.
 */
const statEntry = (parentDir: string, name: string): fs.Stats | null => {
    try {
        return fs.statSync(path.join(parentDir, name));
    } catch {
        return null;
    }
};

/**
 * Директории scope `@alfalab` во всех node_modules вверх по дереву (ближайшая первой).
 * Нужны, когда агрегатор не установлен.
 */
const resolveScopeDirs = memoize((base: string): string[] => {
    const scopeDirs: string[] = [];
    let dir = base;

    for (;;) {
        const scopeDir = path.join(dir, 'node_modules', SCOPE_DIR_NAME);

        if (fs.existsSync(scopeDir)) scopeDirs.push(scopeDir);

        const parent = path.dirname(dir);

        if (parent === dir) break;

        dir = parent;
    }

    return scopeDirs;
});

/**
 * Строит регэксп, находящий платформу как отдельный сегмент имени
 * (в начале/конце или отделённый точкой, дефисом, подчёркиванием),
 * чтобы не ловить подстроки в helper-файлах вроде useIsDesktop.js.
 */
const platformNamePattern = (platform: string): RegExp =>
    new RegExp(`(^|[._-])${platform}([._-]|$)`, 'i');

/**
 * Является ли имя файла декларацией типов (.d.ts, .d.mts, .d.cts).
 * Типы исключены из маркеров разделения: правило работает только с рантайм-импортами.
 */
const isDeclarationFile = (fileName: string): boolean => /\.d\.(ts|mts|cts)$/.test(fileName);

/**
 * Есть ли для платформы подкаталог (desktop/, mobile/) или рантайм-файл
 * с платформой в имени (Component.desktop.js). Типы (.d.ts) не считаются.
 */
const hasPlatformEntry = (componentDir: string, platform: PlatformName): boolean => {
    if (fs.existsSync(path.join(componentDir, platform))) return true;

    const pattern = platformNamePattern(platform);

    return readDirSafe(componentDir).some(
        (entry) =>
            statEntry(componentDir, entry.name)?.isFile() === true &&
            !isDeclarationFile(entry.name) &&
            pattern.test(entry.name) &&
            PLATFORM_FILE_EXTENSIONS.some((extension) => entry.name.endsWith(extension)),
    );
};

/**
 * Определяет, разделен ли компонент на платформы (desktop, mobile):
 * проверяется наличие записи для каждой из платформ.
 */
const isPlatformSplit = memoize((componentDir: string): boolean =>
    PLATFORM_DIRS.every((platform) => hasPlatformEntry(componentDir, platform)),
);

/**
 * Имена кандидатов, разделенных на платформы, по возрастанию.
 */
const collectSplitComponents = (candidates: Iterable<SplitCandidate>): string[] => {
    const splitComponents: string[] = [];

    for (const { component, dir } of candidates) {
        if (isPlatformSplit(dir)) splitComponents.push(component);
    }

    return splitComponents.toSorted((a, b) => a.localeCompare(b));
};

/**
 * Кандидаты агрегатора: каждый его подкаталог, кроме node_modules
 * и платформенных папок.
 */
const aggregatorCandidates = (coreComponentsDir: string): SplitCandidate[] => {
    const candidates: SplitCandidate[] = [];

    for (const entry of readDirSafe(coreComponentsDir)) {
        if (statEntry(coreComponentsDir, entry.name)?.isDirectory() !== true) continue;
        if (entry.name === 'node_modules') continue;
        if ((PLATFORM_DIRS as readonly string[]).includes(entry.name)) continue;

        candidates.push({
            component: entry.name,
            dir: path.join(coreComponentsDir, entry.name),
        });
    }

    return candidates;
};

/**
 * Кандидаты из отдельных подпакетов @alfalab/core-components-<pkg> в scope.
 * Включают и пакеты, не разделенные на платформы: ближняя установка должна перекрывать дальнюю.
 */
const standaloneCandidates = (scopeDir: string): SplitCandidate[] => {
    const candidates: SplitCandidate[] = [];

    for (const entry of readDirSafe(scopeDir)) {
        if (!entry.name.startsWith(STANDALONE_NAME_PREFIX)) continue;
        if (statEntry(scopeDir, entry.name)?.isDirectory() !== true) continue;

        const component = entry.name.slice(STANDALONE_NAME_PREFIX.length);

        if (component.length === 0) continue;

        candidates.push({ component, dir: path.join(scopeDir, entry.name) });
    }

    return candidates;
};

/**
 * Мемоизированные сканеры: у каждого источника собственный кэш.
 */
const getAggregatorCandidates = memoize(aggregatorCandidates);

const getStandaloneCandidates = memoize(standaloneCandidates);

/**
 * Список компонентов, разделенных на платформы, для пакета, установленного относительно `from`.
 * Источник истины — агрегатор `@alfalab/core-components`, если он установлен;
 * иначе — отдельные подпакеты `@alfalab/core-components-<pkg>`. Если не найдено
 * ни того, ни другого, возвращается пустой список (правило не срабатывает).
 */
export const getSplitComponents = (from: string): string[] => {
    const base = resolveBaseDir(from);
    const coreComponentsDir = resolveCoreComponentsDir(base);

    // Агрегатор установлен - источник истины только он, отдельные подпакеты не сканируем
    if (coreComponentsDir !== null) {
        return collectSplitComponents(getAggregatorCandidates(coreComponentsDir));
    }

    // Агрегатора нет - собираем из отдельных подпакетов
    const candidates = new Map<string, SplitCandidate>();

    for (const scopeDir of resolveScopeDirs(base)) {
        for (const candidate of getStandaloneCandidates(scopeDir)) {
            if (!candidates.has(candidate.component)) {
                candidates.set(candidate.component, candidate);
            }
        }
    }

    return collectSplitComponents(candidates.values());
};
