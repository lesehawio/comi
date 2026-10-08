/* ============================================================
   menu.js  —  منطق مشترک همه‌ی منوها

   هر فایل منو (m-1 تا m-8) فقط این دو خط را دارد:

        window.MENU_CURRENT = 3;      ← شماره‌ی درس
        window.MENU_FINAL   = false;  ← امتحان آخر نشان داده شود؟

   بقیه‌اش همین فایل است.
   ============================================================ */

(function(){

/* ============================================================
   ۱) فهرست درس‌ها
   ============================================================ */

var LESSONS = [
    { n:1, file:'1-1.html', title:'اجزای کامپیوتر',           sub:'کیس • مانیتور • ماوس • کیبورد • پاور • USB • هدفون' },
    { n:2, file:'1-2.html', title:'ماوس',                    sub:'دکمه‌ی چپ • دکمه‌ی راست • چرخ • سنسور' },
    { n:3, file:'1-3.html', title:'مانیتور',                 sub:'صفحه • پایه • دکمه‌ی پاور • چراغ • کابل‌ها' },
    { n:4, file:'1-4.html', title:'کیس',                     sub:'پاور • ریستارت • USB • فن • پورت‌های پشت' },
    { n:5, file:'1-5.html', title:'کلیدهای مهم کیبورد',       sub:'فاصله • اینتر • شیفت • کپس‌لاک • کنترل • اسکیپ' },
    { n:6, file:'1-6.html', title:'پنج میانبر اصلی',          sub:'Ctrl + C / V / X / Z / S' },
    { n:7, file:'1-7.html', title:'میانبرهای متن و فایل',     sub:'Ctrl + A / F / P / N و کلید F2' },
    { n:8, file:'1-8.html', title:'میانبرهای پنجره و ویندوز', sub:'Alt+Tab • Win • Win+D • Win+E • F5' }
];

/* ============================================================
   ۲) درس جاری
   ============================================================ */

var CUR = parseInt(window.MENU_CURRENT, 10);
if(!CUR || CUR < 1){ CUR = 1; }

var SHOW_FINAL = !!window.MENU_FINAL;

var CUR_LESSON = null;
for(var z=0;z<LESSONS.length;z++){
    if(LESSONS[z].n === CUR){ CUR_LESSON = LESSONS[z]; }
}
if(!CUR_LESSON){ CUR_LESSON = LESSONS[0]; CUR = 1; }

/* ============================================================
   ۳) وضعیت — روی همین مرورگر ذخیره می‌شود
   ============================================================ */

var KEY = 'kami_level1_v1';

var SHEET_DEFAULT = 'https://script.google.com/macros/s/AKfycbwd2ChqHgFegDsXwSna1NWVTVWWbS0QPrnDX_YKwkbcmz6SnywstZBP1Vq07HOtiPZR/exec';

var OLD_SHEET_URLS = [
    'https://script.google.com/macros/s/AKfycbwbQJj5T-ORFGGMiELpGoM97dsZrBtX3xST9Y9W8U0nZjCjneBsehAV4Mleok2ql5Xz/exec'
];

var ST = { name:'', done:{}, scores:[], sheet:SHEET_DEFAULT };

function loadState(){
    try{
        var raw = localStorage.getItem(KEY);
        if(raw){
            var o = JSON.parse(raw);
            if(o && typeof o === 'object'){
                ST.name   = o.name   || '';
                ST.done   = o.done   || {};
                ST.scores = o.scores || [];
                if(!o.sheet || OLD_SHEET_URLS.indexOf(o.sheet) >= 0){
                    ST.sheet = SHEET_DEFAULT;
                } else {
                    ST.sheet = o.sheet;
                }
            }
        }
    }catch(e){}
}

function saveState(){
    try{ localStorage.setItem(KEY, JSON.stringify(ST)); }catch(e){}
}

/* ============================================================
   ۴) ساخت اسکلت صفحه
   ============================================================ */

var ICON_BACK = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
var ICON_GEAR = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.6 1.6 0 0 0 .32 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-1 1.46V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1.05-1.46 1.6 1.6 0 0 0-1.77.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.46-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.32-1.77l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.6 1.6 0 0 0 9 4.6 1.6 1.6 0 0 0 10 3.14V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.46 1.6 1.6 0 0 0 1.77-.32l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.6 1.6 0 0 0 19.4 9v.1a1.6 1.6 0 0 0 1.46 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.46 1z"/></svg>';
var ICON_TICK = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 9.5 18 20 6.5"/></svg>';
var ICON_STAR = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5L12 17.5l-5.8 3.05 1.1-6.5-4.7-4.6 6.5-.95z" fill="#4ade80"/></svg>';

var HTML = ''
+ '<div id="scLogin" class="screen show">'
+   '<div class="center">'
+     '<h1>کامپیوتر رو بشناس</h1>'
+     '<p class="sub">سطح ۱ &nbsp;•&nbsp; درس ' + fa(CUR) + '</p>'
+     '<div class="lbl">اسمت رو بنویس</div>'
+     '<input id="nameInput" type="text" placeholder="مثلاً: مها" autocomplete="off" spellcheck="false">'
+     '<button id="loginBtn" class="btn main wide">بریم</button>'
+     '<p class="hint">اسمت فقط روی همین گوشی ذخیره می‌شه.<br>هیچ‌جا فرستاده نمی‌شه مگر خودت بزنی.</p>'
+   '</div>'
+ '</div>'
+ '<div id="scMenu" class="screen">'
+   '<div class="bar">'
+     '<div id="whoName">سلام <b>—</b></div>'
+     '<button id="gearBtn" class="ic" title="تنظیمات">' + ICON_GEAR + '</button>'
+   '</div>'
+   '<div id="menuBody"></div>'
+ '</div>'
+ '<div id="scLesson" class="screen">'
+   '<div class="bar">'
+     '<button id="backBtn" class="ic" title="برگشت">' + ICON_BACK + '</button>'
+     '<div class="t" id="lessonTitle"></div>'
+     '<button id="doneBtn" class="ic" title="تمام شد">' + ICON_TICK + '</button>'
+   '</div>'
+   '<iframe id="frame" title="درس"></iframe>'
+ '</div>'
+ '<div id="scReport" class="screen">'
+   '<div class="bar">'
+     '<button id="repBack" class="ic" title="برگشت">' + ICON_BACK + '</button>'
+     '<div class="t">کارنامه</div>'
+   '</div>'
+   '<div id="repBody"></div>'
+ '</div>'
+ '<div id="scSet" class="screen">'
+   '<div class="bar">'
+     '<button id="setBack" class="ic" title="برگشت">' + ICON_BACK + '</button>'
+     '<div class="t">تنظیمات</div>'
+   '</div>'
+   '<div id="setBody">'
+     '<p>آدرس وب‌اپ گوگل برای ثبت نمره‌ها:</p>'
+     '<input id="sheetInput" type="text" placeholder="https://script.google.com/macros/s/..../exec" spellcheck="false" autocomplete="off">'
+     '<button id="sheetSave" class="btn main" style="width:100%;margin-top:20px">ذخیره</button>'
+     '<div id="setMsg" class="hint" style="margin-top:14px"></div>'
+     '<div class="mini">'
+       '<b>تست:</b> آدرس را در مرورگر باز کن — باید بنویسد <b>ok</b>.'
+     '</div>'
+   '</div>'
+ '</div>';

document.getElementById('app').innerHTML = HTML;

/* ============================================================
   ۵) ابزار
   ============================================================ */

var FA = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];

function fa(n){ return String(n).replace(/[0-9]/g, function(d){ return FA[+d]; }); }

function el(id){ return document.getElementById(id); }

function vibrate(p){
    if(navigator.vibrate){ try{ navigator.vibrate(p); }catch(e){} }
}

function escapeHtml(s){
    return String(s == null ? '' : s)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;');
}

function show(which){
    var all = document.querySelectorAll('.screen');
    for(var k=0;k<all.length;k++){ all[k].classList.remove('show'); }
    el(which).classList.add('show');
}

function dateFa(){
    try{
        var d = new Date();
        return d.toLocaleDateString('fa-IR') + ' — ' +
               d.toLocaleTimeString('fa-IR', { hour:'2-digit', minute:'2-digit' });
    }catch(e){
        return new Date().toLocaleString();
    }
}

/* ============================================================
   ۶) ورود
   ============================================================ */

function doLogin(){
    var v = el('nameInput').value.trim();
    if(!v){
        el('nameInput').focus();
        el('nameInput').style.borderColor = '#e0825f';
        setTimeout(function(){ el('nameInput').style.borderColor = ''; }, 900);
        return;
    }
    ST.name = v;
    saveState();
    vibrate(25);
    openMenu();
}

el('loginBtn').onclick = doLogin;

el('nameInput').addEventListener('keydown', function(e){
    if(e.key === 'Enter'){ doLogin(); }
});

/* ============================================================
   ۷) منو  —  فقط درس جاری
   ============================================================ */

function openMenu(){
    show('scMenu');
    el('whoName').innerHTML = 'سلام <b>' + escapeHtml(ST.name) + '</b>';

    var key = 'l' + CUR_LESSON.n;
    var isDone = !!ST.done[key];

    var h = '';

    h += '<div class="nowBox">درس جاری: <b>' + escapeHtml(CUR_LESSON.title) + '</b></div>';

    h += '<div class="row' + (isDone ? ' done' : '') + '">';
    h +=   '<button class="rowMain" id="openLesson">';
    h +=     '<span class="num">' + fa(CUR_LESSON.n) + '</span>';
    h +=     '<span class="txt"><span class="tt">' + escapeHtml(CUR_LESSON.title) + '</span>';
    h +=     '<span class="st">' + escapeHtml(CUR_LESSON.sub) + '</span></span>';
    h +=     '<span class="mark">' + (isDone ? '&#10003;' : '') + '</span>';
    h +=   '</button>';
    h +=   '<button class="rowExam" id="openExam">امتحان</button>';
    h += '</div>';

    if(SHOW_FINAL){
        h += '<div class="row">';
        h +=   '<button class="rowMain" id="openFinal">';
        h +=     '<span class="num">' + fa(9) + '</span>';
        h +=     '<span class="txt"><span class="tt">امتحان آخر</span>';
        h +=     '<span class="st">' + fa(20) + ' سؤال از همه‌ی هشت درس</span></span>';
        h +=     '<span class="mark">&#8250;</span>';
        h +=   '</button>';
        h += '</div>';
    }

    h += '<div class="sep"></div>';

    h += '<div class="row">';
    h +=   '<button class="rowMain" id="openReport">';
    h +=     '<span class="num">' + ICON_STAR + '</span>';
    h +=     '<span class="txt"><span class="tt">کارنامه</span>';
    h +=     '<span class="st">' + fa(ST.scores.length) + ' نمره ثبت شده</span></span>';
    h +=     '<span class="mark">&#8250;</span>';
    h +=   '</button>';
    h += '</div>';

    el('menuBody').innerHTML = h;
    el('menuBody').scrollTop = 0;

    el('openLesson').onclick = function(){ openLesson(); };
    el('openExam').onclick   = function(){ go('e-' + CUR_LESSON.n + '.html?m=' + CUR); };
    el('openReport').onclick = openReport;

    if(SHOW_FINAL){
        el('openFinal').onclick = function(){ go('e-9.html?m=' + CUR); };
    }
}

function go(url){
    vibrate(20);
    window.location.href = url;
}

el('gearBtn').onclick = function(){
    el('sheetInput').value = ST.sheet || '';
    el('setMsg').textContent = '';
    show('scSet');
};

/* ============================================================
   ۸) درس
   ============================================================ */

function openLesson(){
    var key = 'l' + CUR_LESSON.n;
    el('lessonTitle').textContent = CUR_LESSON.title;
    el('doneBtn').classList.toggle('on', !!ST.done[key]);
    el('frame').src = CUR_LESSON.file;
    show('scLesson');
    vibrate(20);
}

el('backBtn').onclick = function(){
    el('frame').src = 'about:blank';
    openMenu();
};

el('doneBtn').onclick = function(){
    var key = 'l' + CUR_LESSON.n;
    ST.done[key] = !ST.done[key];
    saveState();
    el('doneBtn').classList.toggle('on', !!ST.done[key]);
    vibrate(ST.done[key] ? [30,40,30] : 20);
};

/* ============================================================
   ۹) کارنامه
   ============================================================ */

function openReport(){
    show('scReport');

    if(!ST.scores.length){
        el('repBody').innerHTML = '<div class="empty">هنوز امتحانی نداده‌ای.<br>از منو، دکمه‌ی «امتحان» را بزن.</div>';
        return;
    }

    var h = '';
    var best = 0;

    for(var k=0;k<ST.scores.length;k++){
        if(ST.scores[k].pct > best){ best = ST.scores[k].pct; }
    }

    h += '<div class="card" style="background:rgba(74,222,128,.08);border-color:rgba(74,222,128,.28)">';
    h +=   '<div class="top"><span class="sc">' + fa(best) + '٪</span><span class="dt">بهترین نمره</span></div>';
    h +=   '<div class="wr">اسم: <b>' + escapeHtml(ST.name) + '</b> &nbsp;•&nbsp; ' +
           fa(ST.scores.length) + ' نمره</div>';
    h += '</div>';

    for(var j=ST.scores.length-1;j>=0;j--){
        var r = ST.scores[j];
        h += '<div class="card">';
        h +=   '<div class="top"><span class="sc">' + fa(r.score) + ' / ' + fa(r.total) +
               ' &nbsp;(' + fa(r.pct) + '٪)</span><span class="dt">' + escapeHtml(r.date) + '</span></div>';
        h +=   '<div class="wr" style="color:#c6d0de;margin-bottom:4px">' +
               escapeHtml(r.exam || 'امتحان') + '</div>';
        if(r.wrong && r.wrong.length){
            h += '<div class="wr">اشتباه‌ها:<br>';
            for(var w=0;w<r.wrong.length;w++){
                h += '• ' + escapeHtml(r.wrong[w]) + '<br>';
            }
            h += '</div>';
        } else {
            h += '<div class="wr">همه درست</div>';
        }
        h += '</div>';
    }

    h += '<button class="btn main" style="width:100%;margin-top:8px" id="repSend">فرستادن همه‌ی نمره‌ها به گوگل‌شیت</button>';
    h += '<div id="sendMsg"></div>';
    h += '<button class="btn" style="width:100%;margin-top:11px" id="repClear">پاک کردن کارنامه</button>';

    el('repBody').innerHTML = h;

    el('repSend').onclick = sendAll;

    el('repClear').onclick = function(){
        if(confirm('همه‌ی نمره‌های ذخیره‌شده پاک شوند؟')){
            ST.scores = [];
            saveState();
            openReport();
        }
    };
}

el('repBack').onclick = openMenu;

/* ============================================================
   ۱۰) ارسال به گوگل‌شیت
   ============================================================ */

function setMsg(text, color){
    var m = el('sendMsg');
    if(m){ m.textContent = text; m.style.color = color || '#8b97a8'; }
}

function postToSheet(payload){
    return fetch(ST.sheet, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    }).then(function(){ return 'sent'; });
}

function payloadOf(rec){
    return {
        name:  rec.name || ST.name || '(بی‌نام)',
        date:  rec.date,
        exam:  rec.exam || '-',
        score: rec.score,
        total: rec.total,
        pct:   rec.pct,
        wrong: (rec.wrong || []).join(' | ')
    };
}

function sendAll(){
    if(!ST.sheet){
        setMsg('اول آدرس گوگل‌شیت را در تنظیمات بگذار.', '#e0b96a');
        return;
    }
    setMsg('دارم می‌فرستم...', '#8b97a8');

    var jobs = [];
    for(var k=0;k<ST.scores.length;k++){
        jobs.push(postToSheet(payloadOf(ST.scores[k])));
    }

    Promise.all(jobs).then(function(){
        setMsg(fa(jobs.length) + ' نمره فرستاده شد', '#4ade80');
    }).catch(function(){
        setMsg('بعضی‌ها نرسیدند. اینترنت را چک کن.', '#e0825f');
    });
}

el('sheetSave').onclick = function(){
    var v = el('sheetInput').value.trim();
    ST.sheet = v;
    saveState();
    el('setMsg').textContent = v ? 'ذخیره شد' : 'خالی شد';
    el('setMsg').style.color = v ? '#4ade80' : '#8b97a8';
    vibrate(20);
};

el('setBack').onclick = openMenu;

/* ============================================================
   ۱۱) شروع
   ============================================================ */

document.addEventListener('gesturestart', function(e){ e.preventDefault(); });
document.addEventListener('dblclick', function(e){ e.preventDefault(); }, { passive:false });

if('serviceWorker' in navigator){
    window.addEventListener('load', function(){
        navigator.serviceWorker.register('sw.js').catch(function(){});
    });
}

loadState();
if(ST.name){ el('nameInput').value = ST.name; }

show('scLogin');

})();
