import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { deliverLead, payload } from '../src/lib/sales/crm-delivery.js'
const row={id:'11111111-1111-4111-8111-111111111111',created_at:new Date().toISOString(),name:'Synthetic',email:'test@example.test',message:'Text only',phone:'+972500000000',attribution:{landing_path:'/he',utm_source:'test'},crm_status:'pending',crm_attempts:0,crm_next_attempt_at:new Date(0).toISOString()}
const env={CRM_LEADS_URL:'https://crm.example.test/api/integrations/website-leads',CRM_LEADS_TOKEN:'x'.repeat(32)}
function database(){let value=structuredClone(row);let fail=false;return {get value(){return value},set fail(v){fail=v},from(){let patch,filters=[];const q={update(p){patch=p;return q},eq(k,v){filters.push(r=>r[k]===v);return q},lte(k,v){filters.push(r=>r[k]<=v);return q},select(){return q},maybeSingle(){return q},then(resolve,reject){if(fail)return Promise.resolve({error:Error('synthetic save failure')}).then(resolve,reject);const matches=filters.every(f=>f(value));if(matches)Object.assign(value,patch);return Promise.resolve({data:matches?{id:value.id}:null,error:null}).then(resolve,reject)}};return q}}}
const ack=async()=>({ok:true,json:async()=>({accepted:true,external_id:row.id})})
assert.equal(payload(row).page_path,'/he');assert.equal(payload(row).phone,row.phone)
let db=database();assert((await deliverLead(db,row,{})).skipped);assert.equal(db.value.crm_attempts,0)
await assert.rejects(()=>deliverLead(db,row,{...env,CRM_LEADS_URL:'http://example.test'},ack))
let calls=0;db=database();await Promise.all([deliverLead(db,row,env,async()=>{calls++;return ack()}),deliverLead(db,row,env,ack)]);assert.equal(calls,1);assert.equal(db.value.crm_status,'delivered');assert.equal(db.value.crm_attempts,1)
for(const code of [400,401,403,422,408,409,429,500,503]){db=database();await deliverLead(db,row,env,async()=>({ok:false,status:code}));assert.equal(db.value.crm_status,[400,401,403,422].includes(code)?'failed':'pending',String(code));assert.equal(db.value.crm_last_error,'http_'+code)}
db=database();await deliverLead(db,row,env,async()=>{throw Error('timeout')});assert.equal(db.value.crm_status,'pending');assert.equal(db.value.crm_attempts,1)
db=database();await deliverLead(db,row,env,async()=>({ok:true,json:async()=>({accepted:true,external_id:'wrong'})}));assert.equal(db.value.crm_status,'pending')
db=database();Object.assign(db.value,{crm_attempts:7});await deliverLead(db,{...row,crm_attempts:7},env,async()=>({ok:false,status:503}));assert.equal(db.value.crm_status,'failed');assert.equal(db.value.crm_attempts,8)
db=database();db.fail=true;await assert.rejects(()=>deliverLead(db,row,env,ack))
// Load the actual submit handler with stubbed service modules: failed persistence must prevent all downstream sends.
let downstream=0,dbError=true;const inserted=[]
const client={from(table){return {insert(input){inserted.push({table,input});return {select(){return this},async single(){return dbError?{error:{code:'test'}}:{data:{...row,...input},error:null}}}}}}}
const context=vm.createContext({console:{error(){}},process:{env:{SUPABASE_URL:'https://test.example',SUPABASE_SERVICE_ROLE_KEY:'fake'}},Date,Map})
const source=fs.readFileSync(new URL('../api/submit.js',import.meta.url),'utf8')
const mod=new vm.SourceTextModule(source,{context})
await mod.link(async spec=>{const exports=spec.includes('supabase')?{createClient:()=>client}:spec==='resend'?{Resend:class{}}:spec.includes('crm-delivery')?{deliverLead:async()=>{downstream++;throw Error('temporary')},payload:()=>({})}:Object.fromEntries([spec.includes('hubspot-token')?'getHubspotAccessToken':spec.includes('hubspot.js')?'createHubspot':spec.includes('activity')?'logActivity':spec.includes('scoring')?'scoreLead':spec.includes('notify')?'notifyNewLead':'fireLeadRoutine'].map(k=>[k,async()=>{downstream++;return {}}]));return new vm.SyntheticModule(Object.keys(exports),function(){for(const[k,v]of Object.entries(exports))this.setExport(k,v)},{context})})
await mod.evaluate()
async function submit(body,ip){let result;const res={status(s){this.code=s;return this},json(b){result={status:this.code,body:b};return result}};await mod.namespace.default({method:'POST',headers:{'x-forwarded-for':ip},body},res);return result}
assert.equal((await submit({...row,name:{}},'a')).status,400);assert.equal((await submit({...row,attribution:{utm_source:[]}},'b')).status,400)
assert.equal((await submit({...row},'c')).status,500);assert.equal(downstream,0)
dbError=false;assert.equal((await submit({...row},'d')).status,200);assert(downstream>0);assert.equal(inserted[1].input.phone,row.phone);assert.equal(inserted[1].input.message,row.message)
console.log('PASS website delivery: mapping, CAS claim, acknowledgement, retry classification, timeout, attempt cap, DB errors; actual submit validation, save-before-send, CRM failure preserves success')
// Exercise the actual cron handler without a database or external network.
let retryCalls=0
const cronContext=vm.createContext({Buffer,process:{env:{CRON_SECRET:'synthetic-secret',CRM_LEADS_URL:env.CRM_LEADS_URL,CRM_LEADS_TOKEN:env.CRM_LEADS_TOKEN}}})
const retryDb={from(){const q={select(){return q},eq(){return q},lte(){return q},order(){return q},limit:async()=>({data:[row],error:null})};return q}}
const cron=new vm.SourceTextModule(fs.readFileSync(new URL('../api/crm-retry.js',import.meta.url),'utf8'),{context:cronContext})
await cron.link(async spec=>{let values;if(spec==='node:crypto')values={timingSafeEqual:(a,b)=>a.equals(b)};else if(spec.includes('supabase'))values={createClient:()=>retryDb};else values={deliverLead:async()=>{retryCalls++}};return new vm.SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v)},{context:cronContext})})
await cron.evaluate()
async function retry(method,authorization){let result;const res={status(s){this.code=s;return this},json(b){result={status:this.code,body:b}}};await cron.namespace.default({method,headers:{authorization}},res);return result}
assert.equal((await retry('POST','Bearer synthetic-secret')).status,405)
assert.equal((await retry('GET','wrong')).status,401);assert.equal(retryCalls,0)
assert.equal((await retry('GET','Bearer synthetic-secret')).status,200);assert.equal(retryCalls,1)
console.log('PASS actual cron: method and secret protection; pending batch delegation')
