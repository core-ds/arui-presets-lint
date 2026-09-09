import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import {
    CORE_COMPONENTS_PACKAGE,
    PLATFORM_DIRS,
    PLATFORM_FILE_EXTENSIONS,
} from '../constants/index.js';

const platformDirs: string[] = [...PLATFORM_DIRS];

const platformFileExtensions: string[] = [...PLATFORM_FILE_EXTENSIONS];

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
 * Строит регэксп, находящий платформу строго как отдельный сегмент имени
 * (в начале, в конце или отделённый точкой/дефисом/подчёркиванием),
 * чтобы не ловить подстроки в helper-файлах вроде useIsDesktop.js.
 */
const platformNamePattern = (platform: string): RegExp =>
    new RegExp(`(^|[._-])${platform}([._-]|$)`);

/**
 * Является ли имя файла декларацией типов (.d.ts, .d.mts, .d.cts).
 * Печатные типы намеренно исключаются из маркеров сплита: правило работает
 * только с рантайм-импортами и пропускает type imports/exports.
 */
const isDeclarationFile = (fileName: string): boolean => /\.d\.(ts|mts|cts)$/.test(fileName);

/**
 * Проверяет, что для конкретной платформы в корне компонента есть подкаталог
 * (desktop/, mobile/) либо рантайм-файл с платформой-сегментом имени
 * (desktop.js, Component.desktop.js, Alert.desktop.js). Типы (.d.ts) не считаются:
 * правило требует платформенный импорт только для рантайм-импортов.
 * @param {string} componentDir - Абсолютный путь к подкаталогу компонента
 * @param {string} platform - Платформа (desktop или mobile)
 * @returns {boolean} true, если для платформы есть папка или файл
 */
const hasPlatformEntry = (componentDir: string, platform: string): boolean => {
    if (fs.existsSync(path.join(componentDir, platform))) return true;

    const pattern = platformNamePattern(platform);

    return fs
        .readdirSync(componentDir, { withFileTypes: true })
        .some(
            (entry) =>
                entry.isFile() &&
                !isDeclarationFile(entry.name) &&
                pattern.test(entry.name) &&
                platformFileExtensions.some((extension) => entry.name.endsWith(extension)),
        );
};

/**
 * Определяет, сплитнут ли компонент на платформы: потребуется наличие записи
 * (папки или файла) для каждой из платформ desktop и mobile.
 * @param {string} componentDir - Абсолютный путь к подкаталогу компонента
 * @returns {boolean} true, если есть записи для desktop и mobile
 */
const isPlatformSplit = (componentDir: string): boolean =>
    platformDirs.every((platform) => hasPlatformEntry(componentDir, platform));

/**
 * Сканирует установленный пакет @alfalab/core-components и возвращает
 * имена компонентов, сплитнутых на платформы.
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
    const cached = splitComponentsCache.get(coreComponentsDir);

    if (cached !== undefined) return cached;

    const splitComponents = findSplitComponents(coreComponentsDir);
    splitComponentsCache.set(coreComponentsDir, splitComponents);

    return splitComponents;
};
