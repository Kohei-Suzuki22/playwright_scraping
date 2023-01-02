const playwright = require('playwright')
const random_useragent = require('random-useragent')
const fs = require('fs')

const BASE_URL = 'https://github.com/topics/playwright'

;(async () => {
  /**
   * ーザーエージェント（User Agent：UA）は、「ネット利用者が使用しているOS・ブラウザ」のことを指す。
   * 一般的なインターネットブラウザを使い、HTTPに基づきサイトなどにアクセスした際には、
   * ユーザーエージェントに関する各種情報が、相手側に通知される仕組みとなっている。
   *
   * https://webtan.impress.co.jp/g/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%82%A8%E3%83%BC%E3%82%B8%E3%82%A7%E3%83%B3%E3%83%88
   * */
  const agent = random_useragent.getRandom()

  // ブラウザのセットアップ

  const browser = await playwright.chromium.launch({ headless: true })

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

  const context = await browser.newContext({
    bypassCSP: true,
    userAgent: agent,
  })
  const page = await context.newPage()
  await page.setDefaultTimeout(30000)
  await page.setViewportSize({ width: 800, height: 600 })
  await page.goto(BASE_URL)

  // ページ上の情報を取得
  const repositories = await page.$$eval('article.border', (repoCards) => {
    return repoCards.map((card) => {
      const [user, repo] = card.querySelectorAll('h3 a')
      const formatText = (element) => element && element.innerText.trim()

      return {
        user: formatText(user),
        repo: formatText(repo),
        url: repo.href,
      }
    })
  })
  const logger = fs.createWriteStream('scrapedData.json', { flag: 'w' })
  logger.write(JSON.stringify(repositories, null, 2))

  // ブラウザを閉じる。
  await browser.close()
})().catch((error) => {
  console.log(error)
  process.exit(1)
})
