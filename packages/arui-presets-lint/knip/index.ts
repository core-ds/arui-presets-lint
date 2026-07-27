import { type KnipConfig } from 'knip';

export default {
    // не репортить экспорты, которые используются только внутри своего же файла
    ignoreExportsUsedInFile: true,
    // jest, vitest, storybook, playwright и cypress в проектах экосистемы обычно
    // запускаются через arui-scripts и другие обёртки / shared-пресеты и не являются
    // прямыми зависимостями - по зависимостям knip эти плагины не включит, поэтому
    // включаем явно; плагины подхватят конфиги (jest.config.*, ключ jest в package.json,
    // vitest.config.*, .storybook/*, playwright.config.* и т.д.) и разрешат пути из них
    // (setupFiles, transform, stories, testDir и т.д.)
    jest: true,
    storybook: true,
    playwright: true,
    cypress: true,
    vitest: true,
    // плагин ломается на extends с относительным путём в ключе commitlint
    // package.json (резолвит путь как имя shareable-конфига); сам commitlint
    // приходит через arui-presets-lint, поэтому отключение ничего не теряет
    commitlint: false,
    entry: [
        // Стандартные точки входа knip. При переопределении опции entry дефолтные значения
        // не объединяются с заданными, поэтому повторяем их явно
        // https://knip.dev/overview/configuration#defaults
        '{index,cli,main}.{js,mjs,cjs,jsx,ts,tsx,mts,cts}!',
        'src/{index,cli,main}.{js,mjs,cjs,jsx,ts,tsx,mts,cts}!',
        // Серверная точка входа приложений arui-scripts и совместимых сборщиков
        // ({,app/} - поддержка обеих структур проекта: базовой и feature-sliced)
        'src/{,app/}server/index.{js,jsx,ts,tsx}!',
        // Серверные моки dev-сервера arui-scripts
        'src/server/{mock,mocks}/**/*.{js,ts}',
        // Модули, экспонируемые через module federation по карте exposes из
        // arui-scripts.config.ts; помимо index в модуле есть конвенционные файлы,
        // подключаемые по пути (например viewer-config.ts), поэтому весь каталог
        'src/modules/**/*.{js,jsx,ts,tsx}!',
        // Конфигурация arui-scripts подключается сборщиком, а не через импорты
        'arui-scripts.config.{js,mjs,cjs,ts,mts,cts}',
        'arui-scripts.overrides.{js,mjs,cjs,ts,mts,cts}',
        // Платформенные входные точки многоплатформенных приложений: index - webpack
        // entry, remote - модуль, экспонируемый через module federation
        'src/{,app/}{desktop,mobile,webview}/{index,remote}.{js,jsx,ts,tsx}!',
        // Модули, экспонируемые через module federation по карте exposes из remotes.ts,
        // и dev-точка входа remotes (src/remotes/dev/index)
        'src/remotes/**/index.{js,jsx,ts,tsx}!',
        // Карта module-federation remotes - подключается сборщиком, а не через импорты
        'remotes.{js,ts}',
        // Рантайм-конфигурации пакета node-config, загружаются по имени окружения
        'config/**/*.{js,mjs,cjs,ts}',
        // Конфиг eslint: сам eslint приходит через arui-presets-lint и не является
        // прямой зависимостью, поэтому плагин knip для него неактивен
        'eslint.config.{js,mjs,cjs,ts,mts,cts}',
        // nyc запускается через сборщик и не является прямой зависимостью,
        // поэтому плагин knip для него неактивен
        'nyc.config.js',
        // Тесты jest: в проектах, где jest запускается через arui-scripts или
        // платформенный сборщик и не является прямой зависимостью, плагин knip
        // для него неактивен
        '**/__tests__/**/*.{js,jsx,ts,tsx}',
        '**/*.{test,spec}.{js,jsx,ts,tsx}',
        // Публичные входные точки библиотек, собираемых per-component: папки src/* -
        // отдельные subpath опубликованного пакета, плоские src/{desktop,mobile}.tsx -
        // платформенные входные точки; package.json с exports генерируется при сборке,
        // поэтому knip не может взять entry из него
        'src/*/index.{js,jsx,ts,tsx}!',
        'src/{desktop,mobile,webview}.{js,jsx,ts,tsx}!',
        // Конфиг postcss подключается сборкой arui-scripts, сам postcss
        // не является прямой зависимостью - плагин knip неактивен
        'postcss.config.{js,cjs,mjs,ts}',
        // Вариантные имена jest-конфигов вне стандартных (jest.config.base.js и т.п.)
        'jest.config*.{js,cjs,mjs,ts}',
        // Setup-файлы и транформы тестов: плагин jest не всегда может достать их из
        // конфига (например, парсинг обрывается на preset: 'ts-jest/...'), а имена
        // в экосистеме исторически разные
        '{,src/}setup{Tests,-tests}.{js,ts}',
        'setup-{jest,globals-vitest}.{js,ts}',
        'jest/**/*.{js,ts}',
    ],
    // Генераторы plop: каталог содержит hbs-шаблоны компонентов, которые не являются
    // валидными модулями и не должны анализироваться
    ignore: ['plop/**'],
    // Ambient-типы, которые работают самим фактом установки (globals вебпака,
    // типизация css-импортов) - у них нет импортов, по которым knip мог бы
    // засчитать использование
    ignoreDependencies: ['@types/webpack-env', '@types/css-modules'],
} satisfies KnipConfig;
