import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { CORE_COMPONENTS_PACKAGE, PLATFORM_DIRS } from '../constants/index.js';

const platformDirs: string[] = [...PLATFORM_DIRS];

/**
 * Резолвит директорию пакета @alfalab/core-components из node_modules,
 * поднимаясь вверх от точки входа (как правило - директории проверяемого файла).
 * Это позволяет получить установленную в потребительском проекте версию пакета.
 * @param {string} from - Абсолютный путь к файлу или директории, от которой искать пакет
 * @returns {string} Абсолютный путь к директории пакета
 * @throws {Error} Если пакет не найден
 */
const resolveCoreComponentsDir = (from: string): string => {
    // В rule-тестерах и при линте виртуальных файлов context.filename может указывать
    // на несуществующий путь - в этом случае резолвим пакет от cwd процесса.
    let base = from;

    try {
        base = fs.statSync(from).isDirectory() ? from : path.dirname(from);
    } catch {
        base = process.cwd();
    }

    const require = createRequire(path.join(base, 'noop.mjs'));

    const pkgJsonPath = require.resolve(`${CORE_COMPONENTS_PACKAGE}/package.json`);

    return path.dirname(pkgJsonPath);
};

/**
 * Определяет, является ли подкаталог пакета сплитнутым на платформы.
 * Сплит определяется по наличию подкаталогов desktop и mobile прямо под компонентом.
 * Это единственный согласованный внешний интерфейс, доступный из node_modules:
 * у всех сплитнутых компонентов в опубликованном пакете есть обе папки,
 * а файлы вида Component.{desktop,mobile}.d.ts могут встречаться и у несплитнутых
 * (например mq), поэтому критерий по файлам не используется.
 * @param {string} componentDir - Абсолютный путь к подкаталогу компонента
 * @returns {boolean} true, если есть и desktop, и mobile
 */
const isPlatformSplit = (componentDir: string): boolean =>
    platformDirs.every((platform) => fs.existsSync(path.join(componentDir, platform)));

/**
 * Сканирует установленный пакет @alfalab/core-components и возвращает
 * список подкаталогов компонентов, сплитнутых на платформы.
 * @param {string} coreComponentsDir - Абсолютный путь к директории пакета
 * @returns {string[]} Список имён сплитнутых компонентов (отсортирован)
 */
const findSplitComponents = (coreComponentsDir: string): string[] => {
    const splitComponents: string[] = [];

    for (const entry of fs.readdirSync(coreComponentsDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        if (entry.name === 'node_modules') continue;
        if (platformDirs.includes(entry.name)) continue;

        const componentDir = path.join(coreComponentsDir, entry.name);

        if (isPlatformSplit(componentDir)) {
            splitComponents.push(entry.name);
        }
    }

    return splitComponents.toSorted((a, b) => a.localeCompare(b));
};

/**
 * Кэш результатов сканирования. Ключ - путь к директории пакета,
 * чтобы при линте одного проекта не сканировать node_modules на каждый файл.
 */
const splitComponentsCache = new Map<string, string[]>();

/**
 * Возвращает список сплитнутых компонентов для пакета, установленного
 * относительно переданной точки входа. Результат кэшируется по директории пакета.
 * @param {string} from - Точка входа (файл/директория) для резолва пакета
 * @returns {string[]} Список имён сплитнутых компонентов
 */
export const getSplitComponents = (from: string): string[] => {
    const coreComponentsDir = resolveCoreComponentsDir(from);

    let splitComponents = splitComponentsCache.get(coreComponentsDir);

    if (splitComponents === undefined) {
        splitComponents = findSplitComponents(coreComponentsDir);
        splitComponentsCache.set(coreComponentsDir, splitComponents);
    }

    return splitComponents;
};
