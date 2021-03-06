/**
 * Copyright Microsoft Corporation. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {registerWorkerFixture, registerFixture} from '@playwright/test-runner';
import {LaunchOptions, BrowserType, Browser, BrowserContext, Page, chromium, firefox, webkit, BrowserContextOptions, devices} from 'playwright';
export * from '@playwright/test-runner';

declare global {
  interface WorkerState {
    browserType: BrowserType<Browser>;
    browser: Browser;
    defaultBrowserOptions: LaunchOptions;
    defaultContextOptions: BrowserContextOptions;
    browserName: 'chromium' | 'firefox' | 'webkit';
    device: null | string | BrowserContextOptions
  }
  interface TestState {
    context: BrowserContext;
    page: Page;
  }
}

registerWorkerFixture('browserType', async ({browserName}, test) => {
  const browserType = ({chromium ,firefox, webkit})[browserName];
  await test(browserType);
});

registerWorkerFixture('browserName', async ({}, test) => {
  await test((process.env.BROWSER as any) || 'chromium');
});

registerWorkerFixture('browser', async ({browserType, defaultBrowserOptions}, test) => {
  const browser = await browserType.launch(defaultBrowserOptions);
  await test(browser);
  await browser.close();
});

registerWorkerFixture('device', async ({}, test) => {
  await test(null);
});

registerWorkerFixture('defaultContextOptions', async ({device}, test) => {
  let contextOptions: BrowserContextOptions = {};

  if (device && typeof device === 'string')
    contextOptions = devices[device];
  else if (device && typeof device === 'object')
    contextOptions = device;

  await test({
    ...contextOptions
  });
});

registerWorkerFixture('defaultBrowserOptions', async ({}, test) => {
  await test({
    handleSIGINT: false,
    ...(process.env.HEADFUL ? {headless: false} : {})
  });
});

registerFixture('context', async ({browser, defaultContextOptions}, test) => {
  const context = await browser.newContext(defaultContextOptions);
  await test(context);
  await context.close();
});

registerFixture('page', async ({context}, runTest) => {
  await runTest(await context.newPage());
});