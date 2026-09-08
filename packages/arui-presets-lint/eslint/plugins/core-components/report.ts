import fs from 'node:fs';
import path from 'node:path';

import { type CoreComponentsImportFinding } from './types.js';

const DEFAULT_REPORT_FILENAME = 'core-components-imports-errors.json';

const findingsByReport = new Map<string, Map<string, CoreComponentsImportFinding>>();

/**
 * Нормализует путь до единого вида с разделителем "/", чтобы отчёт
 * выглядел одинаково на Windows и macOS/Linux (слэш как универсальный разделитель).
 * @param {string} filePath - Оригинальный путь
 * @returns {string} Нормализованный путь с "/" в качестве разделителя
 */
const normalizePath = (filePath: string): string => filePath.replaceAll('\\', '/');

const findingKey = (finding: CoreComponentsImportFinding) =>
    `${normalizePath(finding.file)}:${finding.line}:${finding.importPath}`;

const resolveReportPath = (reportFile?: string | false) => {
    if (reportFile === false) return null;
    if (typeof reportFile === 'string') return path.resolve(process.cwd(), reportFile);

    return path.resolve(process.cwd(), DEFAULT_REPORT_FILENAME);
};

const writeReport = (reportPath: string, findings: CoreComponentsImportFinding[]) => {
    const sorted = [...findings]
        .map((finding) => ({
            ...finding,
            file: normalizePath(finding.file),
        }))
        .toSorted((a, b) => {
            if (a.file !== b.file) return a.file.localeCompare(b.file);
            if (a.line !== b.line) return a.line - b.line;
            return a.importPath.localeCompare(b.importPath);
        });

    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, `${JSON.stringify(sorted, null, 4)}\n`, 'utf8');
};

/**
 * Добавляет найденное нарушение в накопитель. Записывает обновлённый отчёт в файл
 * только если для данного пути отчёт не отключён. Внутри одного прогона линтера
 * отчёт перезаписывается на каждый файл, поэтому после обработки последнего файла
 * в файле остаётся полный набор нарушений текущего сеанса линтинга.
 * @param {CoreComponentsImportFinding} finding - Нарушение для добавления
 * @param {string | false | undefined} reportFile - Путь к отчёту / false = отключить
 */
export const recordFinding = (
    finding: CoreComponentsImportFinding,
    reportFile?: string | false,
) => {
    const reportPath = resolveReportPath(reportFile);

    if (reportPath === null) return;

    let findingsForPath = findingsByReport.get(reportPath);

    if (findingsForPath === undefined) {
        findingsForPath = new Map();
        findingsByReport.set(reportPath, findingsForPath);
    }

    findingsForPath.set(findingKey(finding), finding);

    writeReport(reportPath, Array.from(findingsForPath.values()));
};
