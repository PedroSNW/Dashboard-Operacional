import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { buildReport } from "./reports.js";
import { buildRequest, createEngine, readJson, ReportError, REVISION, verify } from "./engine.ts";

const generate = createEngine();
let activeRequests=0;
const operations={
    preview:['action','selection','managementContext'],
    generate:['action','selection','managementContext','expectedUpdatedAt','expectedReportBasis'],
    review:['action','selection','managementContext','expectedUpdatedAt','expectedReportBasis','document','reviewAcknowledged'],
    probe:['action']
};

export async function handle(req:Request) {
    const diagnosticId=crypto.randomUUID();
    const origin=req.headers.get('origin');
    const origins=(Deno.env.get('DASHBOARD_ALLOWED_ORIGINS')??'').split(',').map(value=>value.trim()).filter(Boolean);
    const originAllowed=!origin||!origins.length||origins.includes(origin);
    const headers={
        'Cache-Control':'no-store','Vary':'Origin',
        'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info',
        'Access-Control-Allow-Methods':'POST, OPTIONS',
        'Access-Control-Expose-Headers':'Retry-After, X-DGranel-Diagnostic-Id',
        'X-DGranel-Diagnostic-Id':diagnosticId,
        ...(originAllowed&&origin?{'Access-Control-Allow-Origin':origins.length?origin:'*'}:{})
    };
    const json=(data:object,status=200,retryAfter?:number)=>Response.json({...data,revision:REVISION,diagnosticId},{
        status,headers:{...headers,...(retryAfter?{'Retry-After':String(retryAfter)}:{})}
    });
    if(!originAllowed)return json({success:false,code:'origin_denied',error:'Origem não autorizada.'},403);
    if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
    if(req.method!=='POST')return json({success:false,code:'method_not_allowed',error:'Use POST.'},405);
    if(activeRequests>=4)return json({success:false,code:'busy',error:'Função ocupada. Tente novamente.'},429,1);
    activeRequests++;
    try{
        const token=req.headers.get('Authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
        if(!token)throw new ReportError(401,'authentication_required','Sessão corporativa necessária.');
        const url=Deno.env.get('SUPABASE_URL');
        let key=Deno.env.get('SUPABASE_ANON_KEY')?.trim();
        if(!key)try{key=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')??'{}').default;}catch{/* Fail closed below. */}
        if(!url||typeof key!=='string'||!key)throw new ReportError(503,'supabase_configuration','Configuração Supabase indisponível.');
        const client=createClient(url,key,{global:{headers:{Authorization:'Bearer '+token}},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
        const {data:{user},error:authError}=await client.auth.getUser(token);
        if(authError||!user?.id)throw new ReportError(401,'invalid_session','Sessão inválida ou expirada.');
        if(!user.email_confirmed_at||user.email?.toLowerCase().split('@').at(-1)!=='dgranel.com.br')
            throw new ReportError(403,'corporate_access_required','Acesso restrito a contas corporativas confirmadas.');
        const body=await readJson(req,64*1024,400,'invalid_context');
        const action=body?.action;
        if(!body||Array.isArray(body)||typeof action!=='string'||!Object.hasOwn(operations,action)||Object.keys(body).some(key=>!operations[action as keyof typeof operations].includes(key)))
            throw new ReportError(400,'invalid_context','Operação ou campos de contexto inválidos.');
        const {data:remote,error:readError}=await client.from('dashboard_state').select('data,updated_at').eq('id',1).single();
        if(readError||!remote?.data||typeof remote.updated_at!=='string')
            throw new ReportError(403,'snapshot_denied','Leitura autorizada da base indisponível.');
        if(action==='probe'){
            if(Deno.env.get('REPORT_V8_ENABLE_SYNTHETIC_PROBE')!=='true')throw new ReportError(404,'probe_disabled','Sonda sintética desativada.');
            return json({success:true,...await generate(null,diagnosticId,true)});
        }
        if(body.expectedUpdatedAt!==undefined&&body.expectedUpdatedAt!==remote.updated_at)
            throw new ReportError(409,'stale_snapshot','O snapshot mudou. Gere uma nova prévia.');
        let report;
        try{report=buildReport(remote.data,body.selection,remote.updated_at,body.managementContext??null);}
        catch{throw new ReportError(422,'invalid_context','O recorte ou o contexto da gestão é inválido para o snapshot autorizado.');}
        const responseMode=Deno.env.get('REPORT_V8_RESPONSE_MODE')??'strict';
        const identity=JSON.stringify([REVISION,responseMode,report.type,report.sector,report.competencias,report.indicators,report.managementContext,
            report.intelligence.policyVersion,report.intelligence.measurementPolicyVersion]);
        const basis=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(identity))),byte=>byte.toString(16).padStart(2,'0')).join('');
        if(action==='preview'){
            const {context:_context,...preview}=report;
            return json({success:true,report:{...preview,basis}});
        }
        if(body.expectedUpdatedAt!==remote.updated_at||body.expectedReportBasis!==basis)
            throw new ReportError(409,'stale_snapshot','A elaboração ou revisão exige uma prévia atual do recorte.');
        const identityResponse={success:true,authoredReportVersion:8,reportBasis:basis,snapshotUpdatedAt:remote.updated_at};
        if(action==='generate')return json({...identityResponse,...await generate(report,diagnosticId)});
        if(body.reviewAcknowledged!==true)throw new ReportError(422,'review_required','Confirme a conferência das interpretações antes de salvar.');
        const request=buildRequest(report,responseMode==='json_object');
        const review=verify(body.document,request.pack);
        return json({...identityResponse,document:review.document,validation:{issues:review.issues},evidenceKeys:request.selected});
    }catch(error){
        const failure=error instanceof ReportError?error:new ReportError(500,'internal_failure','Não foi possível concluir a operação do relatório.');
        return json({success:false,code:failure.code,error:failure.message,retryAfter:failure.retryAfter},failure.status,failure.retryAfter);
    }finally{activeRequests--;}
}

Deno.serve(handle);
