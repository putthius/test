import SelectParticipants from "./components/Select";
// import SelectParticipants from "../";
import { readFileSync } from "fs";
import Papa from "papaparse";
import { competition, icys, isf, SelectParticipant } from "./type";
import path from "path";
export const dynamic = 'force-dynamic'
export default function SelectionList() {
  const icysRaw = readFileSync(path.join(process.cwd(), 'src/icys.csv'),{encoding:'utf-8'})
  const icysDat : icys[]= Papa.parse(icysRaw,{header:true}).data as icys[];
  const isfRaw = readFileSync(path.join(process.cwd(), 'src/isf.csv'),{encoding:'utf-8'})
  const isfDat : isf[]= Papa.parse(isfRaw,{header:true}).data as isf[]
  const subList : {[T in competition]:string[]}= JSON.parse(readFileSync(path.join(process.cwd(), 'src/school.json'),{encoding:'utf-8'})) 
  const participants : {[key in competition]:{[key:string]:SelectParticipant[]}}= {
    "ICYS" : {},
    "KVIS-ISF" : {},
    "":{}     
  }
  subList.ICYS.forEach((val)=>{
    participants.ICYS[val] = []
  })
  icysDat.forEach((val)=>{
    participants.ICYS[val.Country].push({familyName:val["Family name"],name:val["Given name"]})
  })
  subList['KVIS-ISF'].forEach((val)=>{
    participants['KVIS-ISF'][val] = []
  })
  isfDat.forEach((val)=>{
    if(val["School"] && participants['KVIS-ISF'][val["School"]]){
      participants['KVIS-ISF'][val["School"]].push({familyName:val["Family name"],name:val["Given name"]})
    }
  })
  Object.keys(participants.ICYS).forEach((key)=>{
    participants.ICYS[key].sort((a,b)=>a.name.localeCompare(b.name));
  })
  Object.keys(participants["KVIS-ISF"]).forEach((key)=>{
    participants["KVIS-ISF"][key].sort((a,b)=>a.name.localeCompare(b.name));
  })
  // console.log(icys)
  // const f = 
  return (
      <SelectParticipants {...{participants,subList}}/>
  );
}
