import React from 'react';

definedAfterUsage();

function definedAfterUsage() {
    // eslint-disable-next-line no-console
    console.log('Because it is normal!');
}

export const element = <div style={{ color: 'black' }} />;
