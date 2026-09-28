import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import handler from '../api/generate.js';
const root=resolve(import.meta.dirname,'..');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp'};
http.createServer(async(req,res)=>{
 res.status=code=>{res.statusCode=code;return res;};
 res.json=data=>res.end(JSON.stringify(data));
 const path=new URL(req.url,'http://localhost').pathname;
 if(path==='/api/generate'){
  let body='';
  for await(const chunk of req){body+=chunk;if(body.length>8000){res.status(413).json({error:'Form too large.'});return;}}
  req.body=body;await handler(req,res);return;
 }
 const allowed=['/','/index.html','/style.css','/app.js','/favicon.svg','/assets/moon-garden.webp','/assets/outfit.webp'];
 if(!allowed.includes(path)){res.status(404).end('Not found');return;}
 try{const file=path==='/'?'/index.html':path;res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(await readFile(resolve(root,'.'+file)));}
 catch{res.status(404).end('Not found');}
}).listen(4173,'127.0.0.1',()=>console.log('Moon Outfit preview: http://127.0.0.1:4173'));
