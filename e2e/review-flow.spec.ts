import { expect, test, type Page } from '@playwright/test';

/**
 * End-to-end walkthrough of the manual review workflow (§21). Runs against MSW
 * with the isolated dev principal. Asserts the product invariants: estimate
 * does not start a review, a review starts only after explicit confirmation,
 * completion publishes nothing, only selected findings publish, and no
 * approve/reject/vote/merge/complete control exists anywhere.
 */
async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: /sign in \(development\)/i }).click();
  await expect(page.getByRole('heading', { name: 'Connections', level: 1 })).toBeVisible();
}

async function assertNoDevOpsActions(page: Page) {
  for (const label of [/approve/i, /reject/i, /\bmerge\b/i, /\bvote\b/i, /complete/i]) {
    await expect(page.getByRole('button', { name: label })).toHaveCount(0);
  }
}

test('full manual review and selective publish flow', async ({ page }) => {
  await signIn(page);

  // Browse: connection -> project -> repository -> pull request.
  await page.getByRole('button', { name: 'Open', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Projects', level: 1 })).toBeVisible();
  await page.getByText('Checkout', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Repositories', level: 1 })).toBeVisible();
  await page.getByText('checkout-api').click();
  await expect(page.getByRole('heading', { name: 'Pull requests', level: 1 })).toBeVisible();
  await page.getByText('Add idempotency keys to payment capture').click();

  // Estimate must NOT start a review.
  await expect(page.getByRole('button', { name: 'Start AI review', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Estimate review' }).click();
  await expect(page.getByText(/est\. cost/i)).toBeVisible();
  await expect(page).toHaveURL(/pull-requests\/42$/);

  // Start requires explicit confirmation.
  await page.getByRole('button', { name: 'Start AI review', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText(/no comments are published to azure devops automatically/i);
  await dialog.getByRole('button', { name: 'Start AI review' }).click();

  // Progress -> completion (mock advances across polls).
  await expect(page).toHaveURL(/\/app\/reviews\//);
  await expect(page.getByText('Request changes')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/a human reviewer makes the final decision/i)).toBeVisible();

  // Completion published nothing.
  await expect(page.getByText('Published', { exact: true })).toHaveCount(0);

  // Select one finding, preview, publish.
  await page.getByLabel(/select finding: idempotency key is not validated/i).check();
  await page.getByRole('button', { name: /preview and publish/i }).click();
  const publishDialog = page.getByRole('dialog');
  await expect(publishDialog).toContainText(/posts comments to azure devops/i);
  await publishDialog.getByRole('button', { name: /publish selected comments/i }).click();

  await expect(page.getByText(/comments published/i)).toBeVisible();
  // Exactly the selected finding is now published; the others remain unpublished.
  await expect(page.getByText('Published', { exact: true })).toHaveCount(1);

  await assertNoDevOpsActions(page);
});
