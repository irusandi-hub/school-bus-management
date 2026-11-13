import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {it} from "node:test";
function sources(root:string):string[]{return fs.readdirSync(root,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?sources(path.join(root,entry.name)):/\.[jt]sx?$/.test(entry.name)?[path.join(root,entry.name)]:[]);}
it("application contains no native browser dialogs",()=>{
 for(const file of ['app','components','lib'].flatMap(sources)) {
  const source=fs.readFileSync(file,'utf8');
  assert.doesNotMatch(source,/\b(?:window|globalThis)\s*(?:\.\s*(?:confirm|alert|prompt)|\[\s*["'](?:confirm|alert|prompt)["']\s*\])\s*\(/,file);
 }
});
it("start dialog has exact approved copy",()=>{
 const source=fs.readFileSync('app/pengemudi/page.tsx','utf8');
 for(const text of ['title="Mulai Perjalanan"','message="Waktu mulai perjalanan akan dicatat."','confirmText="Mulai"','cancelText="Batal"']) assert.ok(source.includes(text));
});
