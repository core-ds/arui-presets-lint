import { type KnipConfig } from 'knip';

export default {
    entry: [
        // Стандартные точки входа knip. При переопределении опции entry дефолтные значения
        // не объединяются с заданными, поэтому повторяем их явно
        // https://knip.dev/overview/configuration#defaults
        '{index,cli,main}.{js,mjs,cjs,jsx,ts,tsx,mts,cts}!',
        'src/{index,cli,main}.{js,mjs,cjs,jsx,ts,tsx,mts,cts}!',
        // Серверная точка входа приложений arui-scripts
        'src/server/index.{js,jsx,ts,tsx}!',
        // Конфигурация arui-scripts подключается сборщиком, а не через импорты
        'arui-scripts.config.{js,mjs,cjs,ts,mts,cts}',
        'arui-scripts.overrides.{js,mjs,cjs,ts,mts,cts}',
    ],
} satisfies KnipConfig;
