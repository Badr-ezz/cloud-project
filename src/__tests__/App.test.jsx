import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import App from '../App.jsx';
import { navLinks } from '../constants/index.js';

const expectedSections = [
  'Payment Method.',
  'Our team of experts uses a methodology',
];

test('App renders hero content and navigation links', () => {
  const html = renderToStaticMarkup(<App />);

  for (const { title } of navLinks) {
    assert.ok(
      html.includes(`>${title}<`),
      `Expected App markup to include navigation link title "${title}".`
    );
  }

  for (const snippet of expectedSections) {
    assert.ok(
      html.includes(snippet),
      `Expected App markup to include text snippet: "${snippet}".`
    );
  }
});