import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import Navbar from '../components/Navbar.jsx';
import { navLinks } from '../constants/index.js';

test('Navbar renders all navigation links', () => {
  const html = renderToStaticMarkup(<Navbar />);

  for (const { title } of navLinks) {
    assert.ok(
      html.includes(`>${title}<`),
      `Expected navigation link title "${title}" to be present.`
    );
  }
});

test('Navbar mobile menu is hidden by default', () => {
  const html = renderToStaticMarkup(<Navbar />);
  const match = html.match(/class="([^"]*sidebar[^"]*)"/);

  assert.ok(match, 'Expected to locate the mobile sidebar menu element.');
  assert.ok(
    match[1].split(/\s+/).includes('hidden'),
    'Expected the sidebar menu to include the "hidden" class by default.'
  );
});