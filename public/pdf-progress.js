window.PdfProgress={
    open(name,total){
        if(!this.dialog){
            const d=document.createElement('dialog');d.className='v3-pdf-dialog';d.setAttribute('aria-labelledby','pdfProgressTitle');
            d.innerHTML='<h2 id="pdfProgressTitle">Preparando relatório PDF</h2><p id="pdfProgressName"></p><progress id="pdfProgressBar" role="progressbar" aria-label="Geração do PDF" aria-valuemin="0" aria-valuemax="100" max="100"></progress><span id="pdfProgressPercent"></span><div role="status" aria-live="polite"><p id="pdfProgressStage"></p><p id="pdfProgressCount"></p></div><button id="pdfProgressClose" class="v3-button" hidden>Fechar</button>';
            d.querySelector('button').onclick=()=>{d.close();this.focus?.focus();};d.addEventListener('cancel',e=>{if(this.running)e.preventDefault();});document.body.append(d);this.dialog=d;
        }
        this.running=true;this.value=0;this.focus=document.activeElement;this.history=[];
        this.dialog.querySelector('#pdfProgressName').textContent=name;
        this.dialog.querySelector('button').hidden=true;this.dialog.showModal();this.update('Validando sessão, snapshot e prévia',0,0,total);
    },
    update(stage,percent,processed=0,total=0){
        const bar=this.dialog.querySelector('progress');
        this.dialog.querySelector('#pdfProgressPercent').textContent=percent===null?'Em processamento':`${Math.round(Math.max(this.value,Math.min(100,percent)))}%`;
        if(percent===null){bar.removeAttribute('value');bar.removeAttribute('aria-valuenow');}
        else{this.value=Math.max(this.value,Math.min(100,percent));bar.value=this.value;bar.setAttribute('aria-valuenow',String(Math.round(this.value)));}
        this.dialog.querySelector('#pdfProgressStage').textContent=stage;
        const unit=stage.startsWith('Finalizando')?'páginas':stage.startsWith('Preparando gráficos')?'gráficos':'indicadores';
        this.dialog.querySelector('#pdfProgressCount').textContent=total?`${processed} de ${total} ${unit} processados`:percent===null?'Esta etapa não tem percentual mensurável.':'';
        const event={stage,percent:percent===null?null:this.value,processed,total};this.history.push(event);window.dispatchEvent(new CustomEvent('pdf-progress',{detail:event}));
    },
    finish(name){this.update(`Download iniciado: ${name}`,100);this.running=false;this.dialog.querySelector('button').hidden=false;this.dialog.querySelector('button').focus();},
    error(message){this.update(`Não foi possível gerar o PDF: ${message}`,null);this.running=false;this.dialog.querySelector('button').hidden=false;this.dialog.querySelector('button').focus();}
};
