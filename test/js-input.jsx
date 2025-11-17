'нормальный case';

// eslint-disable-next-line no-restricted-syntax
'mixed сase';

import React from 'react';

definedAfterUsage();

let dig = 3;

function definedAfterUsage() {
    // eslint-disable-next-line no-constant-condition
    if (false) {
        dig = 4;

        return dig;
    }

    return dig;
}

export const element = <div style={{ color: 'black' }} />;

export const Component = () => {
    // eslint-disable-next-line no-console -- временное решение для дебага
    console.log('test'); // true

    /* eslint-disable --
     * Исключение для эффекта, который должен срабатывать только при монтировании
     * Добавление deps нарушит ожидаемое поведение
     */
    console.log('test'); // true

    // eslint-disable-next-line no-console
    console.log('test'); // false

    return <div>Test</div>;
};
