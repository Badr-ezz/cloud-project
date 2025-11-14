import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import Billing from '../components/Billing.jsx';
import Business from '../components/Business.jsx';
import Button from '../components/Button.jsx';
import CardDeal from '../components/CardDeal.jsx';
import Clients from '../components/Clients.jsx';
import CTA from '../components/CTA.jsx';
import FeedbackCard from '../components/FeedbackCard.jsx';
import Footer from '../components/Footer.jsx';
import GetStarted from '../components/GetStarted.jsx';
import Hero from '../components/Hero.jsx';
import Stats from '../components/Stats.jsx';
import Testimonials from '../components/Testimonials.jsx';
import { features, stats, feedback, footerLinks, clients } from '../constants/index.js';

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
  html.includes(snippet) ||
  html.includes(escapeHtml(snippet)) ||
  decodeHtml(html).includes(snippet);

const assertIncludesText = (html, snippet, message) => {
  assert.ok(includesText(html, snippet), message);
};

test('Billing component includes control copy', () => {
  const html = renderToStaticMarkup(<Billing />);

  assertIncludesText(
    html,
    'Easily control your',
    'Expected Billing to mention controlling billing.'
  );
  assertIncludesText(
    html,
    'billing & invoicing',
    'Expected Billing to reference billing & invoicing copy.'
  );
});

test('Business component lists every feature and CTA', () => {
  const html = renderToStaticMarkup(<Business />);

  assertIncludesText(
    html,
    'You do the business',
    'Expected Business heading to be present.'
  );

  for (const { title } of features) {
    assertIncludesText(
      html,
      `>${title}<`,
      `Expected Business to render feature title "${title}".`
    );
  }

  assertIncludesText(
    html,
    'Get Started',
    'Expected Business to include the shared Get Started button.'
  );
});

test('Button component forwards styles and label', () => {
  const html = renderToStaticMarkup(<Button styles="mt-10" />);

  assertIncludesText(html, 'Get Started', 'Expected Button to render its label.');
  assertIncludesText(
    html,
    'mt-10',
    'Expected custom styles prop to appear in the class list.'
  );
});

test('CardDeal component surfaces card marketing copy', () => {
  const html = renderToStaticMarkup(<CardDeal />);

  assertIncludesText(
    html,
    'Find a better card deal',
    'Expected CardDeal heading to describe the card offer.'
  );
  assertIncludesText(
    html,
    'Get Started',
    'Expected CardDeal to include a call-to-action button.'
  );
});

test('Clients component renders a logo entry for every client', () => {
  const html = renderToStaticMarkup(<Clients />);
  const logos = html.match(/alt="client_logo"/g) ?? [];

  assert.equal(
    logos.length,
    clients.length,
    'Expected one rendered logo per client entry.'
  );
});

test('CTA component invites visitors to try the service', () => {
  const html = renderToStaticMarkup(<CTA />);

  assertIncludesText(
    html,
    'Let’s try our service now!',
    'Expected CTA heading to be present.'
  );
  assertIncludesText(
    html,
    'Get Started',
    'Expected CTA to reuse the shared button.'
  );
});

test('FeedbackCard component displays provided testimonial data', () => {
  const props = {
    content: 'A fantastic experience from start to finish.',
    name: 'Jane Doe',
    title: 'Founder',
    img: 'person.png',
  };
  const html = renderToStaticMarkup(<FeedbackCard {...props} />);

  for (const snippet of [props.content, props.name, props.title]) {
    assertIncludesText(
      html,
      snippet,
      `Expected FeedbackCard to include "${snippet}".`
    );
  }
  assertIncludesText(
    html,
    'alt="Jane Doe"',
    'Expected testimonial avatar alt text to use the provided name.'
  );
});

test('Footer component lists link group titles and copyright notice', () => {
  const html = renderToStaticMarkup(<Footer />);

  for (const { title } of footerLinks) {
    assertIncludesText(
      html,
      title,
      `Expected Footer to list the link group "${title}".`
    );
  }

  assertIncludesText(
    html,
    'Copyright Ⓒ 2022 HooBank. All Rights Reserved.',
    'Expected Footer to include the copyright string.'
  );
});

test('GetStarted component renders the circular call-to-action', () => {
  const html = renderToStaticMarkup(<GetStarted />);

  assert.ok(html.includes('>Get<'), 'Expected GetStarted to render the word "Get".');
  assert.ok(html.includes('>Started<'), 'Expected GetStarted to render the word "Started".');
});

test('Hero component highlights the discount and hero copy', () => {
  const html = renderToStaticMarkup(<Hero />);

  for (const snippet of ['20%', 'Payment Method.', 'The Next']) {
    assertIncludesText(
      html,
      snippet,
      `Expected Hero to include the snippet "${snippet}".`
    );
  }
});

test('Stats component renders each stat value and label', () => {
  const html = renderToStaticMarkup(<Stats />);

  for (const { value, title } of stats) {
    assertIncludesText(
      html,
      value,
      `Expected Stats to render the value "${value}".`
    );
    assertIncludesText(
      html,
      title,
      `Expected Stats to render the title "${title}".`
    );
  }
});

test('Testimonials component includes the heading and all feedback quotes', () => {
  const html = renderToStaticMarkup(<Testimonials />);

  assertIncludesText(
    html,
    'What People are',
    'Expected Testimonials heading to be present.'
  );

  for (const { content } of feedback) {
    assertIncludesText(
      html,
      content,
      'Expected Testimonials to render each feedback quote.'
    );
  }
});