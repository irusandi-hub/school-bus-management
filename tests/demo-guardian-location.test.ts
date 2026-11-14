import assert from "node:assert/strict";
import {it} from "node:test";
import {createSimulationClient,resetSimulationData} from "../lib/dev-simulation/client.ts";
import {DEV_GUARDIAN_VIEWERS} from "../lib/dev-open-access.ts";
it("location simulation respects the selected guardian, active placement and known identity",async()=>{
 resetSimulationData();const client=createSimulationClient();
 const {data:trips}=await client.from('trips').select('id');
 const tripId=(trips as {id:string}[])[0].id;
 for(const guardian of Object.values(DEV_GUARDIAN_VIEWERS)){
  const result=await client.rpc('guardian_trip_location',{p_trip_id:tripId,p_guardian_id:guardian.guardianId});
  assert.equal(result.error,null,guardian.fullName);
 }
 const denied=await client.rpc('guardian_trip_location',{p_trip_id:tripId,p_guardian_id:'unknown'});
 assert.equal(denied.error?.code,'42501');
 await client.from('students').update({service_status:'paused'}).eq('guardian_id',DEV_GUARDIAN_VIEWERS.three.guardianId);
 const inactive=await client.rpc('guardian_trip_location',{p_trip_id:tripId,p_guardian_id:DEV_GUARDIAN_VIEWERS.three.guardianId});
 assert.equal(inactive.error?.code,'42501');
});
