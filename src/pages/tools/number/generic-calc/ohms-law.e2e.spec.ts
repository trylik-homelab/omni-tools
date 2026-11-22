import { expect, test } from '@playwright/test';

// planik scenario cmwsbgv6z00cg3hmsesqc8bqc (OMNI-11): the formula calculators
// still solve after nerdamer-prime 1.2.5 -> 1.5.0 (dependency maintenance).
// Ohm's law renders three numeric fields in order: Voltage, Current, Resistance.
test.describe(
  "Ohm's law calculator: nerdamer-prime upgrade",
  { tag: '@scenario:cmwsbgv6z00cg3hmsesqc8bqc' },
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/number/generic-calc/ohms-law');
    });

    test('resistance is solved from voltage and current', async ({ page }) => {
      const fields = page.getByRole('spinbutton');
      const voltage = fields.nth(0);
      const resistance = fields.nth(2);

      await expect(resistance).toHaveValue('5.0');

      await voltage.fill('12');
      await expect(resistance).toHaveValue('12.0');
    });

    test('solving for a different variable', async ({ page }) => {
      const fields = page.getByRole('spinbutton');
      const voltage = fields.nth(0);
      const current = fields.nth(1);
      const resistance = fields.nth(2);

      // "Solve For" radio column: Voltage, Current, Resistance.
      await page.getByRole('radio').nth(1).check();
      await expect(current).toBeDisabled();

      await resistance.fill('4');
      await voltage.fill('12');
      await expect(current).toHaveValue('3.0');
    });
  }
);
