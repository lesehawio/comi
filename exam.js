/* ============================================================
   exam.js  —  موتور مشترک همه‌ی امتحان‌ها

   هر فایل امتحان (e-1 تا e-9) فقط سؤال‌های خودش را دارد:

        window.EXAM = {
            no: 1,
            title: 'امتحان ۱ — اجزای کامپیوتر',
            qs: [ ... ]
        };

   بقیه‌اش همین فایل است.
   ============================================================ */

(function(){

/* ============================================================
   ۱) امتحان جاری
   ============================================================ */

var EXAM = window.EXAM || { no: 1, title: 'امتحان', qs: [] };
var QS = EXAM.qs || [];

var EXAM_NO = parseInt(EXAM.no, 10) || 1;

/* برگشت به کدام منو؟  از آدرس می‌خوانیم:  e-3.html?m=3  */
function param(name){
    var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : '';
}

var BACK_MENU = parseInt(param('m'), 10);
if(!BACK_MENU || BACK_MENU < 1 || BACK_MENU > 8){
    BACK_MENU = (EXAM_NO >= 1 && EXAM_NO <= 8) ? EXAM_NO : 1;
}

/* ============================================================
   ۲) وضعیت — با منوها مشترک است
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
   ۳) ابزار
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
   ۴) اسکلت صفحه
   ============================================================ */

var ICON_BACK = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';

document.getElementById('app').innerHTML = ''
+ '<div class="bar">'
+   '<button id="backBtn" class="ic" title="برگشت">' + ICON_BACK + '</button>'
+   '<div class="t" id="examTitle">' + escapeHtml(EXAM.title) + '</div>'
+ '</div>'
+ '<div id="body"></div>';

document.title = EXAM.title;

/* ============================================================
   ۵) گردش امتحان
   ============================================================ */

var qIdx = 0;
var qRight = 0;
var qWrong = [];       /* شماره‌ی سؤال‌های غلط */
var qWrongText = [];   /* متن آن‌ها — برای کارنامه */
var qLock = false;

function goHome(){
    window.location.href = 'm-' + BACK_MENU + '.html';
}

el('backBtn').onclick = goHome;

function start(){
    qIdx = 0; qRight = 0; qWrong = []; qWrongText = []; qLock = false;
    renderQuestion();
}

function renderQuestion(){

    if(!QS.length){
        el('body').innerHTML =
            '<div class="big-note">' +
            'سؤال‌های این امتحان خالی است.<br><br>' +
            'در فایل امتحان، بخش <b>qs</b> را پر کن.' +
            '</div>';
        return;
    }

    if(qIdx >= QS.length){ renderResult(); return; }

    var Q = QS[qIdx];

    var h = '<div id="qProg">';
    for(var k=0;k<QS.length;k++){
        var c = '';
        if(k < qIdx){
            c = qWrong.indexOf(k) >= 0 ? 'no' : 'ok';
        } else if(k === qIdx){
            c = 'now';
        }
        h += '<i class="' + c + '"></i>';
    }
    h += '</div>';

    h += '<div id="qText">سؤال ' + fa(qIdx + 1) + ' از ' + fa(QS.length) +
         ' &nbsp;—&nbsp; ' + escapeHtml(Q.q) + '</div>';

    if(Q.cap){ h += capHtml(Q.cap); }

    for(var o=0;o<Q.opts.length;o++){
        h += '<button class="opt" data-o="' + o + '">' + escapeHtml(Q.opts[o]) + '</button>';
    }

    el('body').innerHTML = h;
    el('body').scrollTop = 0;
}

function capHtml(cap){
    var parts = String(cap).split(' + ');
    var h = '<div class="caps">';
    for(var k=0;k<parts.length;k++){
        if(k){ h += '<span class="plus">+</span>'; }
        h += '<span class="cap">' + escapeHtml(parts[k]) + '</span>';
    }
    h += '</div>';
    return h;
}

el('body').addEventListener('click', function(e){

    var b = e.target.closest('.opt');
    if(!b || qLock) return;

    qLock = true;

    var pick = parseInt(b.getAttribute('data-o'), 10);
    var Q = QS[qIdx];
    var ok = (pick === Q.a);

    var opts = el('body').querySelectorAll('.opt');
    for(var k=0;k<opts.length;k++){
        var ki = parseInt(opts[k].getAttribute('data-o'), 10);
        if(ki === Q.a){ opts[k].classList.add('good'); }
        else { opts[k].classList.add('dim'); }
    }

    if(ok){
        qRight++;
        vibrate([30, 40, 30]);
    } else {
        qWrong.push(qIdx);
        qWrongText.push(Q.q + (Q.cap ? ' (' + Q.cap + ')' : '') + ' → ' + Q.opts[Q.a]);
        b.classList.remove('dim');
        b.classList.add('bad');
        vibrate(60);
    }

    setTimeout(function(){
        qIdx++;
        qLock = false;
        renderQuestion();
    }, ok ? 700 : 1250);

});

function renderResult(){

    var total = QS.length;
    var pct = Math.round(qRight / total * 100);

    var rec = {
        date:  dateFa(),
        exam:  EXAM.title,
        score: qRight,
        total: total,
        pct:   pct,
        wrong: qWrongText.slice(),
        name:  ST.name
    };

    ST.scores.push(rec);
    saveState();

    var h = '';
    h += '<div id="scoreBig">' + fa(qRight) + ' / ' + fa(total) + '</div>';
    h += '<div id="scoreSub">' + fa(pct) + ' درصد درست' +
         (ST.name ? ' &nbsp;•&nbsp; ' + escapeHtml(ST.name) : '') + '</div>';

    if(qWrongText.length){
        h += '<div class="wrongList"><h3>این‌ها را اشتباه زدی:</h3>';
        for(var k=0;k<qWrongText.length;k++){
            h += '<div>• ' + escapeHtml(qWrongText[k]) + '</div>';
        }
        h += '</div>';
    } else {
        h += '<div class="wrongList" style="background:rgba(74,222,128,.08);border-color:rgba(74,222,128,.3)">' +
             '<h3 style="color:#4ade80">همه را درست زدی!</h3></div>';
    }

    h += '<button class="btn main" id="resSend">فرستادن نمره به گوگل‌شیت</button>';
    h += '<div id="sendMsg"></div>';
    h += '<button class="btn" id="resAgain">دوباره امتحان بده</button>';
    h += '<button class="btn" id="resBack">برگشت به منو</button>';

    el('body').innerHTML = h;
    el('body').scrollTop = 0;

    el('resAgain').onclick = start;
    el('resBack').onclick  = goHome;
    el('resSend').onclick  = function(){ sendScore(rec); };
}

/* ============================================================
   ۶) ارسال به گوگل‌شیت
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

function sendScore(rec){
    if(!ST.sheet){
        setMsg('آدرس گوگل‌شیت تنظیم نشده.', '#e0b96a');
        return;
    }

    setMsg('دارم می‌فرستم...', '#8b97a8');
    vibrate(20);

    postToSheet({
        name:  ST.name || '(بی‌نام)',
        date:  rec.date,
        exam:  rec.exam,
        score: rec.score,
        total: rec.total,
        pct:   rec.pct,
        wrong: (rec.wrong || []).join(' | ')
    }).then(function(){
        setMsg('فرستاده شد. برای اطمینان، شیت را نگاه کن.', '#4ade80');
        vibrate([30, 40, 30]);
    }).catch(function(){
        setMsg('نشد بفرستم. اینترنت را چک کن و دوباره بزن.', '#e0825f');
    });
}

/* ============================================================
   ۷) شروع
   ============================================================ */

document.addEventListener('gesturestart', function(e){ e.preventDefault(); });
document.addEventListener('dblclick', function(e){ e.preventDefault(); }, { passive:false });

loadState();
start();

})();
