const { test } = require('node:test');
const assert = require('node:assert/strict');
const admin = require('../lib/adminProxy.cjs');
const token = 'a'.repeat(40), csrf = 'b'.repeat(64);
function req(endpoint, method = 'GET', extra = {}) {
    return { method, query: { endpoint }, headers: { origin: 'https://www.printin3d.in', cookie: `__Host-printin3d_admin=${token}; __Host-printin3d_csrf=${csrf}`, 'x-csrf-token': csrf, 'content-type': 'application/json' }, body: '{}', ...extra };
}
function res() { return { statusCode: 200, headers: {}, setHeader(k,v) { this.headers[k] = v; }, end(b='') { this.body=b; } }; }
test('Cross-origin writes, missing CSRF and invalid sessions never reach the backend', async () => {
    let calls=0; const original=global.fetch;global.fetch=async()=>{calls++;throw Error('Unexpected call');};
    try {
        for (const headers of [ { origin:'https://evil.invalid' }, { origin:'https://www.printin3d.in', cookie:`__Host-printin3d_admin=${token}` }, { origin:'https://www.printin3d.in', cookie:`__Host-printin3d_admin=${token}; __Host-printin3d_csrf=${csrf}`, 'x-csrf-token':'c'.repeat(64) } ]) {
            const r=res();await admin(req('products/', 'POST',{headers}),r);assert.equal(r.statusCode,403);
        }
        const r=res();await admin(req('products/', 'GET',{headers:{}}),r);assert.equal(r.statusCode,401);assert.equal(calls,0);
    } finally {global.fetch=original;}
});
test('Only allowlisted backend paths can be proxied', async()=> {
    for (const endpoint of ['https://127.0.0.1/','../django-admin/','products/1/../../login/','topics/1/extra','products/-1/']) {
        const r=res();await admin(req(endpoint),r);assert.equal(r.statusCode,404);
    }
    const r=res();await admin(req('products/','GET',{query:{endpoint:'products/',topic:"1 OR 1=1"}}),r);assert.equal(r.statusCode,400);
});
test('Successful login keeps the token in a Secure HttpOnly cookie and rotates CSRF',async()=> {
    const original=global.fetch;let request;
    global.fetch=async(url,options)=> {request={url,options};return{ok:true,status:200,json:async()=>({success:true,token,username:'staff'})};};
    try {
        const r=res();await admin(req('login','POST',{body:{username:'security-fixture',password:'test-password'}}),r);
        assert.equal(r.statusCode,200);assert.ok(!r.body.includes(token));
        const c=r.headers['Set-Cookie'].join(';');assert.ok(c.includes('HttpOnly')&&c.includes('Secure')&&c.includes('SameSite=Strict'));
        assert.equal(request.url,'https://ayush1273.pythonanywhere.com/api/login/');assert.equal(request.options.redirect,'error');
        assert.ok(!request.options.headers.Authorization);
    } finally {global.fetch=original;}
});
test('Backend permissions and authentication failure statuses are preserved',async()=> {
    const original=global.fetch;global.fetch=async()=>({status:403,headers:new Headers({'content-type':'application/json'}),text:async()=>'{"detail":"Denied"}'});
    try {const r=res();await admin(req('products/123/','DELETE'),r);assert.equal(r.statusCode,403);assert.ok(r.headers['Set-Cookie'].includes('Max-Age=0'));} finally {global.fetch=original;}
});
test('Session cookies are not public JSON data; unknown methods are rejected',async()=> {
    const r=res();await admin(req('session'),r);assert.equal(r.statusCode,200);assert.ok(!r.body.includes(token));assert.equal(r.headers['Cache-Control'],'no-store');
    const bad=res();await admin(req('session','TRACE'),bad);assert.equal(bad.statusCode,405);
});
test('Uploads reject SVG, HTML, mismatched MIME and oversized payloads',async()=> {
    for (const [bytes,type,name] of [[Buffer.from('<svg onload="alert(1)"></svg>'),'image/svg+xml','bad.svg'],[Buffer.from('<script>alert(1)</script>'),'image/png','bad.png'],[Buffer.from([255,216,255,0]),'image/png','bad.png'],[Buffer.alloc(4*1024*1024),'image/jpeg','big.jpg']]) {
        const f=new FormData();f.append('image',new Blob([bytes],{type}),name);const request=new Request('https://upload.invalid',{method:'POST',body:f});
        const raw=Buffer.from(await request.arrayBuffer());await assert.rejects(()=>admin._test.imageBody(raw,request.headers.get('content-type')));
    }
});
test('Login throttling returns 429 after the configured per-instance budget',()=> {
    const key='rate-fixture-'+Date.now();for(let i=0;i<5;i++)assert.equal(admin._test.limited(key),false);assert.equal(admin._test.limited(key),true);
});
test('Browser security policy blocks inline scripts, framing and published source maps',()=> {
    const c=require('../vercel.json'),headers=c.routes.find(r=>r.continue&&r.headers['Content-Security-Policy']).headers;
    const scripts=headers['Content-Security-Policy'].split(';').find(x=>x.includes('script-src'));
    assert.ok(!scripts.includes('unsafe-inline')&&!scripts.includes('unsafe-eval'));
    assert.equal(headers['X-Frame-Options'],'DENY');
    const map=c.routes.find(r=>r.src&&new RegExp(r.src).test('/assets/index.js.map')&&r.status===404);assert.ok(map);
});
