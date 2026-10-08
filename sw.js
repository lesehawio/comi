/* ============================================================
   sw.js  —  Service Worker  (آفلاین کردن اپ)

   این فایل باید کنار index.html روی هاست باشد.
   فقط روی https کار می‌کند (گیت‌هاب پیجز https است ✓)

   هر وقت محتوای درس‌ها را عوض کردی، فقط عدد VERSION را یکی زیاد کن
   تا مرورگر نسخه‌ی تازه را بگیرد.
   ============================================================ */

var VERSION = 'kami-v2';

var FILES = [
    './',
    './menu.css',
    './menu.js',
    './exam.css',
    './exam.js',
    './manifest.json',

    /* منوها */
    './m-1.html', './m-2.html', './m-3.html', './m-4.html',
    './m-5.html', './m-6.html', './m-7.html', './m-8.html',

    /* امتحان‌ها */
    './e-1.html', './e-2.html', './e-3.html', './e-4.html', './e-5.html',
    './e-6.html', './e-7.html', './e-8.html', './e-9.html',

    /* درس‌ها */
    './1-1.html', './1-2.html', './1-3.html', './1-4.html',
    './1-5.html', './1-6.html', './1-7.html', './1-8.html',

    './icon-192.png',
    './icon-512.png',
    './win10.jpg'
];

/* ---- نصب: فایل‌ها را ذخیره کن ---- */
self.addEventListener('install', function(e){

    e.waitUntil(
        caches.open(VERSION).then(function(cache){
            /* هر فایل جداگانه — اگر یکی نبود، نصب خراب نمی‌شود */
            return Promise.all(FILES.map(function(f){
                return cache.add(f).catch(function(){ /* بی‌خیال */ });
            }));
        }).then(function(){
            return self.skipWaiting();
        })
    );

});

/* ---- فعال‌سازی: کش‌های قدیمی را پاک کن ---- */
self.addEventListener('activate', function(e){

    e.waitUntil(
        caches.keys().then(function(keys){
            return Promise.all(keys.map(function(k){
                if(k !== VERSION){ return caches.delete(k); }
            }));
        }).then(function(){
            return self.clients.claim();
        })
    );

});

/* ---- درخواست‌ها: اول کش، بعد اینترنت ---- */
self.addEventListener('fetch', function(e){

    var req = e.request;

    /* فقط GET و فقط از خود سایت */
    if(req.method !== 'GET'){ return; }

    var url;
    try{ url = new URL(req.url); }catch(err){ return; }

    /* درخواست به گوگل‌شیت را دست نزن */
    if(url.origin !== self.location.origin){ return; }

    e.respondWith(
        caches.match(req).then(function(hit){

            if(hit){ return hit; }

            return fetch(req).then(function(res){

                /* جواب سالم را برای دفعه‌ی بعد ذخیره کن */
                if(res && res.status === 200 && res.type === 'basic'){
                    var copy = res.clone();
                    caches.open(VERSION).then(function(cache){
                        cache.put(req, copy).catch(function(){});
                    });
                }
                return res;

            }).catch(function(){
                /* آفلاین و در کش نبود → صفحه‌ی خانه */
                return caches.match('./index.html');
            });

        })
    );

});
