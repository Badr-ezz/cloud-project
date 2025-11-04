import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import App from '../App.jsx';
import {
  navLinks,
  features,
  stats,
  feedback,
  clients,
  footerLinks,
} from '../constants/index.js';

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const decodeHtml = (value) =>
  value
    .replaceAll('&amp;', '&')
    .replaceAll('&#39;', "'")
    .replaceAll('&#x27;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');

const includesText = (html, snippet) =>
  html.includes(snippet) || html.includes(escapeHtml(snippet)) || decodeHtml(html).includes(snippet);

const assertIncludesText = (html, snippet, message) => {
  assert.ok(includesText(html, snippet), message);
};

test('App renders the full landing page layout in order', () => {
  const html = renderToStaticMarkup(<App />);

  const sectionIndexes = {
    navbar: html.indexOf('<nav'),
    hero: html.indexOf('id="home"'),
    stats: html.indexOf(stats[0].value),
    business: html.indexOf('You do the business'),
    billing: html.indexOf('Easily control your'),
    cardDeal: html.indexOf('Find a better card deal'),
    testimonials: html.indexOf('What People are'),
    clients: html.indexOf('client_logo'),
    cta: html.indexOf('Let’s try our service now!'),
    footer: html.indexOf('Copyright Ⓒ 2022'),
  };

  for (const [section, index] of Object.entries(sectionIndexes)) {
    assert.ok(index >= 0, `Expected ${section} section to appear in the App markup.`);
  }

  const orderedSections = [
    'navbar',
    'hero',
    'stats',
    'business',
    'billing',
    'cardDeal',
    'testimonials',
    'clients',
    'cta',
    'footer',
  ];

  for (let i = 0; i < orderedSections.length - 1; i += 1) {
    const current = orderedSections[i];
    const next = orderedSections[i + 1];

    assert.ok(
      sectionIndexes[current] <= sectionIndexes[next],
      `Expected ${current} section to render before ${next}.`
    );
  }
});

test('App wires navigation anchors and data-driven copy together', () => {
  const html = renderToStaticMarkup(<App />);

  for (const { id, title } of navLinks) {
    assertIncludesText(
      html,
      `href="#${id}"`,
      `Expected navbar to link to the "${id}" section.`
    );
    assertIncludesText(
      html,
      `id="${id}"`,
      `Expected a section with id "${id}" to be present.`
    );
    assertIncludesText(html, title, `Expected navigation label "${title}" to render.`);
  }

  for (const { title, content } of features) {
    assertIncludesText(
      html,
      title,
      `Expected Business section to include feature title "${title}".`
    );
    assertIncludesText(
      html,
      content,
      `Expected Business section to surface copy for "${title}".`
    );
  }

  for (const { value, title } of stats) {
    assertIncludesText(html, value, `Expected Stats section to show value "${value}".`);
    assertIncludesText(html, title, `Expected Stats section to describe metric "${title}".`);
  }

  for (const { content, name, title } of feedback) {
    assertIncludesText(html, content, 'Expected testimonial copy to be rendered.');
    assertIncludesText(html, name, `Expected testimonial to include name "${name}".`);
    assertIncludesText(html, title, `Expected testimonial to list role "${title}".`);
  }

  for (const group of footerLinks) {
    assertIncludesText(
      html,
      group.title,
      `Expected footer to display heading "${group.title}".`
    );

    for (const link of group.links) {
      assertIncludesText(
        html,
        link.name,
        `Expected footer to list the "${link.name}" link.`
      );
    }
  }
});

test('App renders the expected counts for repeated marketing blocks', () => {
  const html = renderToStaticMarkup(<App />);

  const desktopNavAnchors = html.match(/class="font-poppins font-normal cursor-pointer text-\[16px\]/g) ?? [];
  const mobileNavAnchors = html.match(/font-poppins font-medium cursor-pointer text-\[16px\]/g) ?? [];
  assert.equal(
    desktopNavAnchors.length,
    navLinks.length,
    'Expected one desktop navigation item per nav link.'
  );
  assert.equal(
    mobileNavAnchors.length,
    navLinks.length,
    'Expected one mobile navigation item per nav link.'
  );

  const featureCards = html.match(/feature-card/g) ?? [];
  assert.equal(
    featureCards.length,
    features.length,
    'Expected Business section to render every feature card.'
  );

  const testimonials = html.match(/feedback-card/g) ?? [];
  assert.equal(
    testimonials.length,
    feedback.length,
    'Expected Testimonials section to render every feedback card.'
  );

  const clientLogos = html.match(/alt="client_logo"/g) ?? [];
  assert.equal(
    clientLogos.length,
    clients.length,
    'Expected Clients section to render one logo per client.'
  );
});