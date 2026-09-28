import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/generate.js';
import {validateInput,moonPhase} from '../lib/reading.js';
const input={name:'Luna',birthDate:'1995-06-15',birthTime:'09:30',city:'Kuala Lumpur / Asia/Kuala_Lumpur',style:'Elegant',timeZone:'Asia/Kuala_Lumpur'};
const reading={moonMessage:'Let your style shine.',dailyEnergy:82,powerColor:'Silver',avoidColor:'Orange',bestOutfit:'A silver top and ivory trousers.',bestScent:'Jasmine',bestCrystal:'Moonstone',bestTime:'7 PM – 9 PM',do:['Create','Connect','Reflect'],avoid:['Rush','Compare','Overspend'],affirmation:'I shine in my own way.'};
async function call(body=input,method='POST',headers={}){
 const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(c){this.code=c;return this;},json(v){this.body=v;return this;}};
 await handler({method,headers:{'content-type':'application/json',...headers},body},res);return res;
}
test('validates real dates, times, timezone and size',()=>{
 assert.equal(validateInput(input).name,'Luna');
 for(const patch of [{birthDate:'2024-02-31'},{birthTime:'25:00'},{timeZone:'Fake/Zone'},{name:'x'.repeat(61)},{style:''}]) assert.throws(()=>validateInput({...input,...patch}));
 assert.equal(moonPhase(new Date('2000-01-06T18:14:00Z')),'New Moon');
});
test('API contracts and provider failures',async()=>{
 const originalFetch=globalThis.fetch;
 const originalKey=process.env.OPENROUTER_API_KEY;
 const originalModel=process.env.OPENROUTER_MODEL;
 try{
  delete process.env.OPENROUTER_API_KEY;delete process.env.OPENROUTER_MODEL;
  assert.equal((await call(input,'GET')).code,405);
  assert.equal((await call(input,'POST',{'sec-fetch-site':'cross-site'})).code,403);
  assert.equal((await call(input,'POST',{'content-type':'text/plain'})).code,415);
  assert.equal((await call({...input,name:''})).code,400);
  assert.equal((await call('{broken')).code,400);
  assert.equal((await call({...input,extra:'x'.repeat(9000)})).code,413);
  assert.equal((await call()).code,503);
  process.env.OPENROUTER_API_KEY='test-only-key';
  let sent;
  globalThis.fetch=async(url,options)=>{sent=JSON.parse(options.body);assert.equal(url,'https://openrouter.ai/api/v1/chat/completions');return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify(reading)}}]})};};
  const success=await call();assert.equal(success.code,200);assert.equal(success.body.reading.dailyEnergy,82);assert.ok(success.body.reading.moonPhase);assert.equal(sent.model,'openrouter/free');assert.equal(sent.response_format.type,'json_schema');assert.ok(!JSON.stringify(success.body).includes('test-only-key'));assert.equal(success.headers['Cache-Control'],'no-store');
  for(const code of [429,401,403,503]) {globalThis.fetch=async()=>({ok:false,status:code});assert.equal((await call()).code,code===429?429:503);}
  for(const content of ['not JSON',JSON.stringify({...reading,dailyEnergy:200}),JSON.stringify({...reading,do:['one']})]){globalThis.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content}}]})});assert.equal((await call()).code,502);}
  globalThis.fetch=async()=>{const e=new Error('Timeout');e.name='AbortError';throw e;};assert.equal((await call()).code,504);
  process.env.OPENROUTER_MODEL='paid/model';assert.equal((await call()).code,503);
 }finally{globalThis.fetch=originalFetch;if(originalKey===undefined)delete process.env.OPENROUTER_API_KEY;else process.env.OPENROUTER_API_KEY=originalKey;if(originalModel===undefined)delete process.env.OPENROUTER_MODEL;else process.env.OPENROUTER_MODEL=originalModel;}
});
