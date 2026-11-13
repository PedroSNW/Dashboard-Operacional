(() => {
    const $=id=>document.getElementById(id),node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
    let dialog,trigger,reviewed=null,origin;
    const value=(v,path)=>v===undefined?'Não existente':v===null?'Ausente':path==='logo'?(v?'Logo personalizada':'Logo padrão'):typeof v==='object'?(Array.isArray(v)?`${v.length} itens`:Object.keys(v).map(k=>`${k}: ${typeof v[k]==='object'?'configuração':v[k]}`).join(' · ')):String(v);
    function render(state){
        if(!trigger)return;
        const ready=state.loaded&&supabaseStateLoaded&&supabaseReady;
        const count=state.changes.length;
        trigger.textContent=isSavingState?`Salvando · ${count}`:!ready?'Leitura indisponível':count?`${count} ${count===1?'alteração':'alterações'}`:'Sem alterações';
        trigger.dataset.state=isSavingState?'loading':!ready?'error':count?'warning':'success';
        trigger.title=state.changes.length?state.changes.slice(0,3).map(c=>[c.category,c.indicator||c.subject,c.competency||c.field].filter(Boolean).join(' → ')).join('\n'):'Sem alterações pendentes';
        trigger.setAttribute('aria-label',`Prévia de salvamento: ${trigger.textContent}`);
        if(!dialog?.open)return;
        const list=$('pendingChangesList');list.replaceChildren();
        $('pendingChangesSummary').textContent=!ready?'Salvamento bloqueado: valide a leitura autorizada. Diferenças conhecidas continuam listadas abaixo.':count?`${count} ${count===1?'diferença efetiva':'diferenças efetivas'} em relação ao estado confirmado.`:'Sem alterações pendentes. Nada será enviado ao Supabase.';
        const groups=Map.groupBy?Map.groupBy(state.changes,c=>c.category):state.changes.reduce((m,c)=>m.set(c.category,[...(m.get(c.category)||[]),c]),new Map());
        for(const [category,changes]of groups){const group=node('details');group.append(node('summary',`${category} · ${changes.length}`));
            let shown=0;const more=node('button');more.className='v3-button';more.type='button';group.append(more);
            const appendBatch=()=>{for(const c of changes.slice(shown,shown+100)){
                const row=node('article');row.className='pending-change';row.append(node('strong',[c.sector,c.indicator||c.subject,c.competency||c.field].filter(Boolean).join(' → ')),node('p',`${c.kind} · ${c.field}`));
                const previous=node('span',value(c.before,c.path)),next=node('span',value(c.after,c.path));const comparison=node('div');comparison.className='pending-values';comparison.append(node('span','Antes: '),previous,node('span','Novo: '),next);row.append(comparison);
                if(c.path!=='logo'&&((c.before&&typeof c.before==='object')||(c.after&&typeof c.after==='object'))){const details=node('details');details.append(node('summary','Detalhes completos'),node('pre',JSON.stringify({anterior:c.before,novo:c.after},null,2)));row.append(details);}
                group.insertBefore(row,more);
            }shown=Math.min(changes.length,shown+100);more.hidden=shown>=changes.length;more.textContent=`Mostrar mais · ${changes.length-shown} diferenças restantes`;};
            more.onclick=appendBatch;appendBatch();list.append(group);
        }
        $('pendingSaveConfirm').disabled=!state.loaded||!state.changes.length||isSavingState||!supabaseStateLoaded||!supabaseReady;
        $('pendingClose').title=isSavingState?'Fechar o painel mantém o salvamento em andamento.':'Fechar prévia';
        reviewed=state;
    }
    window.PendingChangesUI={
        update:render,
        clear(){reviewed=null;if(dialog?.open)dialog.close();if($('pendingChangesList'))$('pendingChangesList').replaceChildren();},
        open(){if(!dialog)return;origin=document.activeElement;if(!dialog.open)dialog.showModal();$('pendingSaveMessage').textContent='';render(inspectPendingState());$('pendingClose').focus();},
        result(message){if($('pendingSaveMessage'))$('pendingSaveMessage').textContent=message;render(inspectPendingState());}
    };
    document.addEventListener('DOMContentLoaded',()=>{
        trigger=node('button');trigger.id='pendingChangesButton';trigger.className='pending-changes-trigger';trigger.type='button';trigger.setAttribute('aria-haspopup','dialog');trigger.onclick=()=>PendingChangesUI.open();$('saveStateButton').before(trigger);
        dialog=node('dialog');dialog.id='pendingChangesDialog';dialog.className='pending-changes-dialog';dialog.setAttribute('aria-labelledby','pendingChangesTitle');
        const heading=node('h2','Prévia de salvamento');heading.id='pendingChangesTitle';const summary=node('p');summary.id='pendingChangesSummary';const list=node('div');list.id='pendingChangesList';
        const help=node('p','Tema, seleção de dashboard e zoom ficam apenas neste navegador.');help.className='pending-help';
        const status=node('p');status.id='pendingSaveMessage';status.setAttribute('role','status');const actions=node('footer');const close=node('button','Fechar');close.id='pendingClose';close.className='v3-button';close.onclick=()=>dialog.close();
        const confirm=node('button','Confirmar salvamento');confirm.id='pendingSaveConfirm';confirm.className='v3-button';confirm.onclick=async()=>{
            const now=inspectPendingState();if(!reviewed||reviewed.key!==now.key){render(now);status.textContent='A prévia mudou. Revise as alterações antes de confirmar.';return;}
            await saveReviewedState(PendingState.clone(reviewed.payload));
        };actions.append(close,confirm);dialog.append(heading,summary,help,list,status,actions);document.body.append(dialog);
        dialog.addEventListener('close',()=>origin?.isConnected&&origin.focus());
        render(inspectPendingState());
    });
})();
