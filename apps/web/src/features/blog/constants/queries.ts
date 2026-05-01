/**
 * 公開側ブログ一覧の useSuspenseQuery / loader で共通利用する input。
 * クエリキーを揃えるため必ずこの定数を経由すること。
 */
export const PUBLIC_BLOG_LIST_INPUT = { limit: 50, published: true } as const;

/**
 * 管理側ブログ一覧の useSuspenseQuery / loader で共通利用する input。
 * 公開状態に関わらず全件取得する。
 */
export const ADMIN_BLOG_LIST_INPUT = { limit: 100 } as const;
