Для успешной миграции на v6 с более ранних версий нужно:

1. Проверить, что в проекте стоит версия nodejs не ниже 12.20.0 / 14.13.1.

2. Удалить более неиспользуемые зависимости:
```sh
    yarn remove prettier-eslint prettier-eslint-cli eslint-plugin-prettier
```

1. Добавить текущие зависимости [README.md](README.md)(##Установка)

2. Заменить вызовы prettier-eslint на prettier:
   - в lint-staged [README.md](README.md)(## Конфигурация `husky` и `lint-staged`)
   - в скриптах package.json [README.md](README.md)(## Конфигурация скриптов для запуска линтеров и форматтера в `package.json`)

3. (Опционально) Поменять подключаемый конфиг [README.md](README.md)(## Конфигурация всех линтеров через `package.json`). Что изменилось: в `eslintConfig.extends` больше не нужно писать `/index.js` в конце, а `commitlint.extends` теперь может быть строкой, а не массивом.

4. Выполнить команду `yarn format` и поправить возникающие ошибки (предупреждения в моменте править не обязательно, если не включен --max-warnings=0).

5. Сообщить остальным людям которые работают с проектом, что нужно доустановить зависимости (`yarn install`) и перенастроить IDE [README.md](README.md)(## Настройка IDE)