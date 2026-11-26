import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { webcrypto } from 'node:crypto'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { contactAttempt, clearContactAttempt } from '../src/lib/contact-attempt.js'

// Synthetic state only. No HTTP calls, external accounts, real tokens or business data.
const form={name:'QA דנה לוי',email:'qa-dana@example.test',phone:'+972500000000',message:'פניית בדיקה סינתטית'}
const values=new Map(), storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)}
let first=await contactAttempt(form,null,storage,webcrypto)
assert.match(first.id,/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/)
assert.equal((await contactAttempt(form,first,storage,webcrypto)).id,first.id,'same mounted form retry must retain identity')
assert.equal((await contactAttempt(form,null,storage,webcrypto)).id,first.id,'remount must read the same identity')
assert.equal((await contactAttempt({...form,name:' '+form.name+' ',email:form.email.toUpperCase()},null,storage,webcrypto)).id,first.id,'normalization must not create another enquiry')
const persisted=[...values.values()].join('')
for(const value of Object.values(form))assert(!persisted.includes(value),'session storage must not contain plaintext form fields')
const saved=JSON.parse(persisted)
assert.deepEqual(Object.keys(saved).sort(),['fingerprint','id'])
assert.match(saved.fingerprint,/^[a-f0-9]{64}$/)
const changed=await contactAttempt({...form,message:form.message+' חדש'},first,storage,webcrypto)
assert.notEqual(changed.id,first.id,'changed enquiry requires a new identity')
clearContactAttempt(first,storage)
assert.equal((await contactAttempt({...form,message:form.message+' חדש'},null,storage,webcrypto)).id,changed.id,'late clear of another enquiry must not erase current identity')
clearContactAttempt(changed,storage);assert.equal(values.size,0,'successful acknowledged enquiry clears persisted identity')
assert.notEqual((await contactAttempt(form,null,storage,webcrypto)).id,first.id,'new enquiry after success receives a new identity')
const unavailable={getItem(){throw Error('disabled')},setItem(){throw Error('disabled')},removeItem(){throw Error('disabled')}}
assert.equal((await contactAttempt(form,first,unavailable,webcrypto)).id,first.id,'in-memory attempt survives unavailable storage')

const require=createRequire(import.meta.url)
const receiver=require(process.env.CRM_WEBSITE_LEADS_MODULE || fileURLToPath(new URL('../../altro-operations/website-leads.cjs',import.meta.url)))
const crm={contacts:[]}
let localContactSeq=0, sends=0, mode='lose-first-ack'
const captured=[]
const env={NODE_ENV:'development',CRM_LEADS_URL:'https://crm.example.test/api/integrations/website-leads',CRM_LEADS_TOKEN:'synthetic-local-token-1234567890123456'}
const context=vm.createContext({process:{env},Map,Date,URL,AbortSignal,crypto:webcrypto,console:{error(){}},fetch:async(url,options)=>{
 sends++;assert.equal(url,env.CRM_LEADS_URL)
 const body=JSON.parse(options.body);captured.push(body)
 const intake=receiver.intake(crm,body,{nowISO:()=>new Date().toISOString(),uid:()=>String(++localContactSeq),normalizeIncomingContact:b=>({id:'qa-contact-'+(++localContactSeq),...b})})
 if(mode==='lose-first-ack'){mode='ok';throw Error('synthetic acknowledgement lost after CRM accepted')}
 return {ok:intake.status<300,json:async()=>intake.body}
}})
const delivery=new vm.SourceTextModule(readFileSync(new URL('../src/lib/sales/crm-delivery.js',import.meta.url),'utf8'),{context})
await delivery.link(()=>{throw Error('Unexpected delivery dependency')})
const source=readFileSync(new URL('../api/submit.js',import.meta.url),'utf8')
const submit=new vm.SourceTextModule(source,{context})
await submit.link(spec=>{
 if(spec.includes('crm-delivery'))return delivery
 if(spec==='@supabase/supabase-js')return new vm.SyntheticModule(['createClient'],function(){this.setExport('createClient',()=>{throw Error('Unexpected DB access')})},{context})
 throw Error('Unexpected module: '+spec)
})
await submit.evaluate()
let seq=0
async function invoke(mod,body){let result;const res={status(code){this.code=code;return this},json(body){result={code:this.code,body};return result}};await mod.namespace.default({method:'POST',headers:{'x-forwarded-for':String(++seq)},body},res);return result}
const id=webcrypto.randomUUID()
const body={...form,external_id:id.toUpperCase(),attribution:{landing_path:'/he',utm_source:'qa'}}
assert.equal((await invoke(submit,body)).code,500,'lost acknowledgement is an uncertain failure')
assert.equal(crm.contacts.length,1,'receiver accepted the first attempt')
const retry=await invoke(submit,body)
assert.equal(retry.code,200);assert.equal(retry.body.external_id,id)
assert.equal(crm.contacts.length,1,'same identity after lost acknowledgement must not create a duplicate contact')
assert.equal(sends,2);assert(captured.every(b=>b.external_id===id),'uppercase UUID is canonicalized before forwarding')
assert.equal(crm.contacts[0].phone,form.phone)
assert(crm.contacts[0].note.startsWith(form.message))
const before=sends
for(const invalid of ['invalid','11111111-1111-1111-8111-111111111111',{},42])assert.equal((await invoke(submit,{...body,external_id:invalid})).code,400)
assert.equal(sends,before,'invalid IDs must not reach the receiver')

// A unique-key conflict can be a retry of a saved row; only matching content may succeed.
const existing={id,name:form.name,email:form.email,message:form.message,phone:form.phone,company:null,attribution:{},created_at:new Date().toISOString(),crm_status:'delivered',crm_attempts:1,crm_next_attempt_at:new Date(0).toISOString()}
let inserts=0,claims=0,dbSends=0
const db={from(table){assert.equal(table,'submissions','duplicate enquiry must not run sales/analytics inserts');let inserting=false,updating=false;const q={insert(data){inserting=true;inserts++;assert.equal(data.id,id);return q},select(){return q},update(){updating=true;claims++;return q},eq(){return q},lte(){return q},maybeSingle:async()=>{assert(updating);return {data:null,error:null}},single:async()=>inserting?{data:null,error:{code:'23505'}}:{data:existing,error:null}};return q}}
const dbEnv={...env,SUPABASE_URL:'https://db.example.test',SUPABASE_SERVICE_ROLE_KEY:'synthetic-only'}
const dbContext=vm.createContext({process:{env:dbEnv},Map,Date,URL,AbortSignal,crypto:webcrypto,console:{error(){}},fetch:async()=>{dbSends++;throw Error('Duplicate delivered enquiry must not send')}})
const dbDelivery=new vm.SourceTextModule(readFileSync(new URL('../src/lib/sales/crm-delivery.js',import.meta.url),'utf8'),{context:dbContext})
await dbDelivery.link(()=>{throw Error('Unexpected dependency')})
const dbSubmit=new vm.SourceTextModule(source,{context:dbContext})
await dbSubmit.link(spec=>{
 if(spec.includes('crm-delivery'))return dbDelivery
 if(spec==='@supabase/supabase-js')return new vm.SyntheticModule(['createClient'],function(){this.setExport('createClient',()=>db)},{context:dbContext})
 throw Error('Unexpected dependency: '+spec)
})
await dbSubmit.evaluate()
const duplicate=await invoke(dbSubmit,body)
assert.equal(duplicate.code,200);assert.equal(duplicate.body.duplicate,true);assert.equal(duplicate.body.external_id,id);assert.equal(dbSends,0)
assert.equal((await invoke(dbSubmit,{...body,message:'Different enquiry'})).code,409)
assert.equal(dbSends,0);assert.equal(inserts,2);assert.equal(claims,1,'conflicting body must not enter delivery')
console.log('PASS: same-form retry/remount identity; changed/success-cleared new identities; hash-only storage; actual submit + actual synthetic CRM intake dedup after lost ACK; canonical UUID; invalid IDs; Supabase 23505 matched duplicate without external sends and conflicting body409. No network.')
