const CACHE_NAME = 'devtools-cache-v1';

// 需要预缓存的核心资源
const PRECACHE_ASSETS = [
    '/',
    '/manifest.json',
];

// 需要缓存的静态资源类型
const CACHEABLE_TYPES = [
    'text/html',
    'text/css',
    'application/javascript',
    'application/json',
    'image/png',
    'image/jpeg',
    'image/svg+xml',
    'image/webp',
    'font/woff2',
    'font/woff',
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Precaching core assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// 激活 Service Worker，清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// 网络请求策略：Network First, Cache Fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 只处理同源请求
    if (url.origin !== location.origin) {
        return;
    }

    // 跳过非 GET 请求
    if (request.method !== 'GET') {
        return;
    }

    // 跳过 API 请求和 Next.js 热更新
    if (url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/_next/webpack-hmr')) {
        return;
    }

    event.respondWith(
        // 尝试网络请求
        fetch(request)
            .then((response) => {
                // 检查是否是有效响应
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // 检查内容类型是否需要缓存
                const contentType = response.headers.get('content-type') || '';
                const shouldCache = CACHEABLE_TYPES.some(type => contentType.includes(type));

                if (shouldCache) {
                    // 克隆响应，因为响应只能使用一次
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(request, responseToCache);
                        });
                }

                return response;
            })
            .catch(() => {
                // 网络失败，尝试从缓存获取
                return caches.match(request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }

                        // 如果是导航请求，返回离线页面
                        if (request.mode === 'navigate') {
                            return caches.match('/');
                        }

                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// 监听消息，支持手动更新缓存
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            console.log('[SW] Cache cleared');
        });
    }
});
