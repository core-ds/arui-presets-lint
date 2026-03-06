'нормальный case';

// eslint-disable-next-line no-restricted-syntax -- Отключено для тестирования правила
'mixed сase';

import React from 'react';

definedAfterUsage();

let dig = 3;

function definedAfterUsage() {
    // eslint-disable-next-line no-constant-condition -- Отключено для тестирования правила
    if (false) {
        dig = 4;

        return dig;
    }

    const someArray = [1, 2, 3, 4];

    for (const i of someArray) {
        console.log(i);

        if (i > 2) {
            continue;
        }
    }

    return dig;
}

export const element = <div style={{ color: 'black' }} />;
