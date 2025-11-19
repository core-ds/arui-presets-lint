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

    return dig;
}

export const element = <div style={{ color: 'black' }} />;
