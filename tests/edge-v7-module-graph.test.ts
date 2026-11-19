const root=new URL('../supabase/functions/seguranca-viaria-ia/',import.meta.url),pending=[new URL('index.ts',root)],visited=new Set<string>();
while(pending.length){const file=pending.pop()!;if(visited.has(file.href))continue;if(!file.href.startsWith(root.href))throw Error('Import local fora da pasta de publicação');const text=await Deno.readTextFile(file);visited.add(file.href);for(const match of text.matchAll(/(?:from\s+|import\s*)['"](\.\/[^'"]+)['"]/g))pending.push(new URL(match[1],file));}
const files=[...visited].map(url=>url.slice(root.href.length)).sort();
if(files.length!==12)throw Error('Atualize o inventário dos módulos: '+files.join(','));
if(await Deno.readTextFile(new URL('report-authored-core.js',root))!==await Deno.readTextFile(new URL('../public/report-authored-core.js',import.meta.url)))throw Error('Espelho frontend/Edge divergente');
console.log('PASS grafo de12 módulos locais e espelho compartilhado',files);
await Deno.writeTextFile('.validation-tools/edge-v7-module-graph.json',JSON.stringify(files,null,2));
