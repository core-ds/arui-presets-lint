'нормальный case';

// eslint-disable-next-line no-restricted-syntax
'mixed сase';

import React from 'react';

definedAfterUsage();

function definedAfterUsage() {
    // eslint-disable-next-line no-console
    console.log('Because it is normal!');
}

export const element = <div style={{ color: 'black' }} />;
