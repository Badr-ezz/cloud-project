import { access, readFile } from 'node:fs/promises';
import { extname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { transform } from 'esbuild';

const assetExtensions = new Set(['.png', '.jpg', '.jpeg', '.svg', '.webp']);

export async function load(url, context, defaultLoad) {
  const extension = extname(url).toLowerCase();

  if (assetExtensions.has(extension)) {
    const filename = basename(url);
    return {
      format: 'module',
      source: `export default ${JSON.stringify(filename)};`,
      shortCircuit: true,
    };
  }

  if (extension === '.jsx') {
    const source = await readFile(fileURLToPath(url), 'utf8');
    const needsReactImport = !/import\s+React\s+from\s+['"]react['"]/i.test(source);
    const { code } = await transform(source, {
      loader: 'jsx',
      format: 'esm',
      jsx: 'transform',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      banner: needsReactImport ? 'import React from "react";' : undefined,
      sourcemap: 'inline',
      sourcefile: fileURLToPath(url),
      target: 'esnext',
    });

    return {
      format: 'module',
      source: code,
      shortCircuit: true,
    };
  }

  return defaultLoad(url, context, defaultLoad);
}

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    const parentURL = context.parentURL ?? pathToFileURL(process.cwd()).href;
    const resolvedURL = new URL(specifier, parentURL);
    const pathname = fileURLToPath(resolvedURL);

    if (!extname(pathname)) {
      const candidates = [
        `${pathname}.js`,
        `${pathname}.jsx`,
        `${pathname}/index.js`,
        `${pathname}/index.jsx`,
      ];

      for (const candidate of candidates) {
        try {
          await access(candidate);
          return { url: pathToFileURL(candidate).href, shortCircuit: true };
        } catch {
          // Continue trying other candidates
        }
      }
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}