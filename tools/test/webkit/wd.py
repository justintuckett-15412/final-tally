# tiny W3C WebDriver client for WebKitWebDriver (no selenium needed)
import json,urllib.request,subprocess,time,base64,os
class WK:
    def __init__(s,port=None,w=390,h=844):
        port=port or (4500+os.getpid()%400)
        s.p=subprocess.Popen(['WebKitWebDriver',f'--port={port}'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);s.u=f'http://127.0.0.1:{port}';time.sleep(1.5)
        r=s.req('POST','/session',{'capabilities':{'alwaysMatch':{'webkitgtk:browserOptions':{'binary':'/usr/lib/x86_64-linux-gnu/webkit2gtk-4.1/MiniBrowser','args':['--automation']}}}})
        s.sid=r['sessionId'];s.req('POST',f'/session/{s.sid}/window/rect',{'width':w,'height':h})
    def req(s,m,path,body=None):
        rq=urllib.request.Request(s.u+path,method=m,data=json.dumps(body).encode() if body is not None else None,headers={'Content-Type':'application/json'})
        op=urllib.request.build_opener(urllib.request.ProxyHandler({}))
        try:return json.loads(op.open(rq,timeout=600).read())['value'] if m!='POST' or True else None
        except urllib.error.HTTPError as e:raise RuntimeError(e.read().decode()[:600])
    def go(s,url):s.req('POST',f'/session/{s.sid}/url',{'url':url})
    def js(s,code,*a):return s.req('POST',f'/session/{s.sid}/execute/sync',{'script':code,'args':list(a)})
    def ajs(s,code,*a):return s.req('POST',f'/session/{s.sid}/execute/async',{'script':code,'args':list(a)})
    def shot(s,f):open(f,'wb').write(base64.b64decode(s.req('GET',f'/session/{s.sid}/screenshot')))
    def quit(s):
        try:s.req('DELETE',f'/session/{s.sid}')
        except Exception:pass
        s.p.kill()
