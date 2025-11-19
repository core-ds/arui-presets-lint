// Плохо - много директив без описаний
/* eslint-disable no-console */
console.log('init');
/* eslint-disable no-console */
console.log('render');
/* eslint-disable no-console */
console.log('update');

// Хорошо - одна директива с описанием в начале
/* eslint-disable no-console -- временно для отладки рендеринга */
console.log('init');
console.log('render');
console.log('update');

// Или лучше - включать/выключать когда нужно
/* eslint-disable no-console -- дебаг инициализации */
console.log('init');
/* eslint-enable no-console */

// другой код...

/* eslint-disable no-console -- дебаг рендеринга */
console.log('render');
/* eslint-enable no-console */
