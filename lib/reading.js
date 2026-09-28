export const textFields = ['moonMessage','powerColor','avoidColor','bestOutfit','bestScent','bestCrystal','bestTime','affirmation'];
export const schema = {
 type:'object', additionalProperties:false,
 properties: Object.fromEntries([
  ...textFields.map(key => [key,{type:'string'}]),
  ['dailyEnergy',{type:'integer',minimum:0,maximum:100}],
  ['do',{type:'array',items:{type:'string'},minItems:3,maxItems:3}],
  ['avoid',{type:'array',items:{type:'string'},minItems:3,maxItems:3}]
 ]),
 required:[...textFields,'dailyEnergy','do','avoid']
};
export function moonPhase(date) {
 const cycle=29.530588853;
 const age=(((date.getTime()-Date.UTC(2000,0,6,18,14))/86400000)%cycle+cycle)%cycle;
 return ['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous','Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'][Math.floor(age/cycle*8+.5)%8];
}
export function validateInput(body) {
 if (!body || typeof body!=='object' || Array.isArray(body)) throw new Error('Please complete all personal energy fields.');
 const input={};
 for(const [key,max] of Object.entries({name:60,birthDate:10,birthTime:5,city:120,style:120,timeZone:80})) {
  if(typeof body[key]!=='string' || !body[key].trim() || body[key].length>max) throw new Error(`Please enter a valid ${key}.`);
  input[key]=body[key].trim();
 }
 if(!/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)) throw new Error('Please enter a valid birth date.');
 const date=new Date(input.birthDate+'T00:00:00Z');
 if(!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10)!==input.birthDate || input.birthDate<'1900-01-01' || date.getTime()>Date.now()+86400000) throw new Error('Please enter a valid birth date.');
 if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.birthTime)) throw new Error('Please enter a valid birth time.');
 try { new Intl.DateTimeFormat('en',{timeZone:input.timeZone}); } catch { throw new Error('Please enter a valid time zone.'); }
 return input;
}
export function validateReading(value) {
 if(!value || typeof value!=='object' || Array.isArray(value)) throw new Error('Invalid reading');
 const result={};
 for(const key of textFields){
  if(typeof value[key]!=='string' || !value[key].trim() || value[key].length>700) throw new Error('Invalid reading');
  result[key]=value[key].trim();
 }
 if(!Number.isInteger(value.dailyEnergy)||value.dailyEnergy<0||value.dailyEnergy>100) throw new Error('Invalid energy');
 result.dailyEnergy=value.dailyEnergy;
 for(const key of ['do','avoid']){
  if(!Array.isArray(value[key])||value[key].length!==3||value[key].some(x=>typeof x!=='string'||!x.trim()||x.length>180)) throw new Error('Invalid suggestions');
  result[key]=value[key].map(x=>x.trim());
 }
 return result;
}
