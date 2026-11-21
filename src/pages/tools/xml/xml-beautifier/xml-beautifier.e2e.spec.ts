import { expect, test } from '@playwright/test';

// planik scenario cmwr045rx000d3hpdk74ahy92 (OMNI-4): the XML tools stay
// safe against CVE-2026-25896 after the fast-xml-parser 5.3.5 upgrade.
test.describe(
  'XML Beautifier: fast-xml-parser upgrade',
  { tag: '@scenario:cmwr045rx000d3hpdk74ahy92' },
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/xml/xml-beautifier');
    });

    test('a DOCTYPE entity named "l." cannot override the built-in &lt; entity', async ({
      page
    }) => {
      await page
        .getByTestId('text-input')
        .fill(
          '<?xml version="1.0"?><!DOCTYPE r [<!ENTITY l. "PWNED">]><r>a &lt; b</r>'
        );

      const result = page.getByTestId('text-result');
      await expect(result).toHaveValue(/<r>a &lt; b<\/r>/);
      await expect(result).not.toHaveValue(/PWNED/);
    });

    test('ordinary XML is still beautified', async ({ page }) => {
      await page
        .getByTestId('text-input')
        .fill('<root><item>1</item><item>2</item></root>');

      await expect(page.getByTestId('text-result')).toHaveValue(
        '<root>\n  <item>1</item>\n  <item>2</item>\n</root>\n'
      );
    });
  }
);
