/**
 * Профиль для результата, полученного при сбое backend внутри "use cache".
 *
 * Ошибка, брошенная из кешируемой функции, валит prerender страницы (и всю сборку),
 * даже если её поймали снаружи. Поэтому при сбое функция возвращает пустой результат
 * и сокращает срок жизни кеша этим профилем: страница собирается, а данные
 * перезапрашиваются через 30 секунд. cacheLife берёт минимум из всех вызовов, а
 * stale ≥ 5 мин и expire > 5 мин держат запись в prerender (иначе — «Blocking Route»).
 */
export const RETRY_SOON = { stale: 300, revalidate: 30, expire: 600 } as const;

export const errorText = (error: unknown): string => (error instanceof Error ? error.message : String(error));
