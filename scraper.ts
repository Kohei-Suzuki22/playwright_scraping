const playwright = require('playwright')

const BASE_URL = 'https://github.com/topics/playwright'

;(async () => {
  
  // ブラウザのセットアップ

  const browser = await playwright.chromium.launch({ headless: false })

  /**
   * { bypassCSP: true } : CSPを無効にする。
   * 
   * CSPとは、ブラウザーが実行可能なスクリプトの有効なソースとみなすドメインを指定することにより、 XSS の発生する箇所を削減・根絶することができる。 
   * CSP に対応したブラウザーは、サーバーから指定された許可リストに載っているドメインのスクリプトのみ実行し、他のスクリプトはすべて無視します。
   * 
   * つまり、ブラウザ側で指定したスクリプトのみ実行できるような制限がCSP。
   * 
   * https://developer.mozilla.org/ja/docs/Web/HTTP/CSP
   */

  const context = await browser.newContext({ bypassCSP: true })
  const page = await context.newPage()
  await page.setDefaultTimeout(30000)
  await page.setViewportSize({ width: 800, height: 600 })
  await page.goto(BASE_URL)

  // ブラウザを閉じる。
  await browser.close()
})().catch((error) => {
  console.log(error)
  process.exit(1)
})
