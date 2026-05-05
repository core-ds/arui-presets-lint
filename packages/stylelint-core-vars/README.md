# stylelint-core-vars

[![NPM Version](https://img.shields.io/npm/v/@alfalab/stylelint-core-vars.svg)](https://www.npmjs.com/package/@alfalab/stylelint-core-vars)

[Stylelint](http://stylelint.io) плагин, проверяющий использование [дизайн-токенов](https://github.com/alfa-laboratory/core-components/tree/master/packages/vars/src)

## Установка

```
yarn add --dev stylelint @alfalab/stylelint-core-vars
```

или

```
npm install --save-dev stylelint @alfalab/stylelint-core-vars
```

## Использование

Добавьте в свой stylelint конфиг:

```
{
  "plugins": [
    "@alfalab/stylelint-core-vars"
  ],
  "rules": {
      "stylelint-core-vars/use-vars": [
        true,
        {
            "allowNumericValues": true
        }
    ],
      "stylelint-core-vars/use-mixins": true,
      "stylelint-core-vars/use-one-of-vars": [
          true,
          {
              "severity": "warning"
          }
      ],
      "stylelint-core-vars/use-one-of-mixins": [
          true,
          {
              "severity": "warning"
          }
      ],
      "stylelint-core-vars/do-not-use-dark-colors": [
          true,
          {
              "severity": "warning"
          }
      ],
      "stylelint-core-vars/do-not-use-old-vars": [
          true,
          {
              "severity": "warning"
          }
      ],
  },
}
```
