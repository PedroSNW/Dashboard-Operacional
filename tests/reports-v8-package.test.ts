// Resolves and bundles a staging directory containing only the V8 deploy files.
const workspace = new URL('../', import.meta.url);
const source = new URL('supabase/functions/seguranca-viaria-groq-v2/', workspace);
const legacy = new URL('supabase/functions/seguranca-viaria-ia/', workspace);
const files = [
    'index.ts', 'engine.ts', 'report-v8-core.js',
    'deterministic/reports.js', 'deterministic/analytics.js', 'deterministic/report-management.js',
    'deterministic/report-intelligence.js', 'deterministic/report-semantics.js', 'deterministic/groq-context.js',
];
const assert = (condition: unknown, message: string) => { if (!condition) throw Error(message); };
const compare = async (a: URL, b: URL) => {
    const [left, right] = await Promise.all([Deno.readFile(a), Deno.readFile(b)]);
    assert(left.length === right.length && left.every((byte, index) => byte === right[index]), 'Cópia de referência divergente: ' + a.pathname);
};
for (const name of files.filter(name => name.startsWith('deterministic/'))) {
    await compare(new URL(name, source), new URL(name.slice('deterministic/'.length), legacy));
}
await compare(new URL('report-v8-core.js', source), new URL('public/report-v8-core.js', workspace));

const artifacts = new URL('.validation-tools/', workspace);
await Deno.mkdir(artifacts, {recursive: true});
const stage = await Deno.realPath(await Deno.makeTempDir({dir: await Deno.realPath(artifacts), prefix: 'v8-deploy-'}));
await Deno.mkdir(stage + '/deterministic');
for (const name of files) await Deno.copyFile(new URL(name, source), stage + '/' + name);

const run = async (...args: string[]) => {
    const result = await new Deno.Command(Deno.execPath(), {cwd: stage, args, stdout: 'piped', stderr: 'piped'}).output();
    if (!result.success) throw Error(new TextDecoder().decode(result.stderr));
    return new TextDecoder().decode(result.stdout);
};
type Dependency = {specifier: string; isDynamic?: boolean; code?: {specifier: string; error?: string}; type?: {specifier: string; error?: string}};
type Module = {filename?: string; specifier: string; error?: string; dependencies?: Dependency[]};
const graph: {modules: Module[]} = JSON.parse(await run('info', '--no-config', '--json', './index.ts'));
const entry = graph.modules.find(module => module.specifier.startsWith('file:') && module.specifier.endsWith('/index.ts'));
if (!entry) throw Error('Entrada do pacote não resolvida.');
const root = new URL('.', entry.specifier).href;
const local = graph.modules.filter(module => module.specifier.startsWith('file:'));
assert(local.every(module => module.specifier.startsWith(root)), 'Dependência local fora do pacote isolado.');
assert(JSON.stringify(local.map(module => module.specifier.slice(root.length)).sort()) === JSON.stringify([...files].sort()), 'Inventário diverge do grafo.');
assert(graph.modules.every(module => !module.error && module.dependencies?.every(dep => !dep.code?.error && !dep.type?.error) !== false), 'Grafo contém uma dependência não resolvida.');
assert(local.every(module => module.dependencies?.every(dep => !dep.isDynamic) !== false), 'Import dinâmico local precisa de verificação explícita.');

await run('check', '--no-config', '--cached-only', './index.ts');
await run('bundle', '--no-config', '--output', './bundle.js', './index.ts');
const bundle = new URL('bundle.js', root);
assert((await Deno.stat(bundle)).size > 0, 'Bundle vazio.');
let handler: ((req: Request) => Promise<Response>) | undefined;
const deno = Deno as any;
const originalServe = deno.serve;
try {
    deno.serve = (fn: typeof handler) => { handler = fn; };
    await import(bundle.href);
} finally {
    deno.serve = originalServe;
}
if (!handler) throw Error('O bundle não registrou o handler.');
const response = await handler(new Request('http://localhost/', {method: 'POST'}));
assert(response.status === 401 && (await response.json()).code === 'authentication_required', 'Smoke do bundle sem JWT.');
await Deno.writeTextFile(new URL('graph.json', root), JSON.stringify(graph, null, 2));
console.log('PASS V8: paridade, grafo isolado, type check, bundle Deno e resposta HTTP 401 sem JWT.');
for (const module of local) {
    const deps = [...new Set(module.dependencies?.map(dep => dep.specifier) ?? [])];
    console.log(module.specifier.slice(root.length), deps);
}
console.log('Artefatos de verificação em', stage);
