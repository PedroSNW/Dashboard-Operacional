(() => {
    let library;
    function load() {
        if (window.PptxGenJS) return Promise.resolve();
        if (!library) library = new Promise((resolve,reject) => {
            const script = document.createElement('script');
            script.src = 'vendor/pptxgenjs-4.0.1.bundle.js';
            script.onload = () => window.PptxGenJS ? resolve() : reject(Error('Biblioteca PowerPoint indisponível.'));
            script.onerror = () => {script.remove();reject(Error('Não foi possível carregar o exportador PowerPoint.'));};
            document.head.append(script);
        }).catch(error => {library = null;throw error;});
        return library;
    }

    function color(value) {
        if (/^#[0-9a-f]{6}$/i.test(value)) return {color:value.slice(1)};
        const parts = value?.match(/^rgba?\(([^)]+)\)$/)?.[1].split(',').map(Number);
        if (!parts || parts[3] === 0) return null;
        const hex = parts.slice(0,3).map(channel => channel.toString(16).padStart(2,'0')).join('');
        return {color:hex,...(parts.length===4?{transparency:Math.round((1-parts[3])*100)}:{})};
    }

    async function compatiblePowerPoint(file) {
        // PptxGenJS 4.0.1 emits independent table IDs and some out-of-order chart elements.
        const zip = await window.JSZip.loadAsync(file);
        const slidePath = 'ppt/slides/slide1.xml';
        const slide = await zip.file(slidePath).async('string');
        let id = 0;
        zip.file(slidePath,slide.replace(/(<p:cNvPr id=")\d+"/g,(_match,prefix)=>prefix+(++id)+'"'));
        const rootPath = 'ppt/presentation.xml';
        const presentation = await zip.file(rootPath).async('string');
        // The OnePage has no speaker notes. Drop the optional master declaration
        // because reordering it to match the schema triggers repair in desktop PowerPoint.
        zip.file(rootPath,presentation.replace(/<p:notesMasterIdLst>[\s\S]*?<\/p:notesMasterIdLst>/,''));
        const namespace = 'http://schemas.openxmlformats.org/drawingml/2006/chart';
        for (const path of Object.keys(zip.files).filter(name=>/^ppt\/charts\/chart\d+\.xml$/.test(name))) {
            const xml = new DOMParser().parseFromString(await zip.file(path).async('string'),'application/xml');
            for (const axis of xml.getElementsByTagNameNS(namespace,'catAx')) {
                const labels = axis.getElementsByTagNameNS(namespace,'noMultiLvlLbl')[0];
                for (const skip of Array.from(axis.children).filter(el=>['tickLblSkip','tickMarkSkip'].includes(el.localName))) {
                    if (labels) axis.insertBefore(skip,labels);
                }
            }
            for (const type of ['lineChart','barChart']) {
                for (const chart of xml.getElementsByTagNameNS(namespace,type)) {
                    Array.from(chart.children).filter(el=>el.localName==='axId').slice(2).forEach(el=>el.remove());
                    if (type !== 'lineChart') continue;
                    if (!chart.getElementsByTagNameNS(namespace,'grouping').length) {
                        const grouping = xml.createElementNS(namespace,'c:grouping');
                        grouping.setAttribute('val','standard');
                        chart.prepend(grouping);
                    }
                    Array.from(chart.getElementsByTagNameNS(namespace,'invertIfNegative')).forEach(el=>el.remove());
                    for (const series of chart.getElementsByTagNameNS(namespace,'ser')) {
                        const marker = Array.from(series.children).find(el=>el.localName==='marker');
                        const following = Array.from(series.children).find(el=>['dPt','dLbls','trendline','errBars','cat','val','smooth'].includes(el.localName));
                        if (marker && following) series.insertBefore(marker,following);
                    }
                }
            }
            zip.file(path,new XMLSerializer().serializeToString(xml));
        }
        return zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.presentationml.presentation'});
    }

    async function build(paper, charts) {
        await load();
        const pptx = new window.PptxGenJS();
        const horizontal = paper.dataset.orientation === 'landscape';
        const dimensions = horizontal ? {width:40/3,height:7.5} : {width:7.5,height:7.5*297/210};
        pptx.defineLayout({name:'ONEPAGE',...dimensions});
        pptx.layout = 'ONEPAGE';
        pptx.author = 'Dashboard D’Granel';
        pptx.title = paper.querySelector('h2').textContent;
        pptx.lang = 'pt-BR';
        const slide = pptx.addSlide();
        const root = paper.getBoundingClientRect();
        const height = Math.max(root.height,paper.scrollHeight);
        const scale = Math.min(dimensions.width/root.width,dimensions.height/height);
        const xOffset = (dimensions.width-root.width*scale)/2;
        const yOffset = (dimensions.height-height*scale)/2;
        const accent = color(getComputedStyle(paper).getPropertyValue('--op-paper-accent').trim())?.color ?? '174D92';
        slide.background = {color:horizontal?'0B1935':'FFFFFF'};
        const pt = pixels => pixels * scale * 72;
        function bounds(el) {
            const rect = el.getBoundingClientRect();
            return {x:xOffset+(rect.left-root.left)*scale,y:yOffset+(rect.top-root.top)*scale,w:rect.width*scale,h:rect.height*scale};
        }
        function panel(el, kind) {
            const css = getComputedStyle(el);
            const fill = color(css.backgroundColor);
            const border = color(css.borderColor);
            const thickness = parseFloat(css.borderTopWidth);
            const box = bounds(el);
            if (fill || (border && thickness)) slide.addShape(kind,{
                ...box, fill:fill??{color:'FFFFFF',transparency:100},
                line:border&&thickness?{...border,width:pt(thickness)}:{transparency:100},
            });
            if (parseFloat(css.borderLeftWidth) > thickness) {
                const stripe = color(css.borderLeftColor);
                if (stripe) slide.addShape(pptx.ShapeType.rect,{...box,w:parseFloat(css.borderLeftWidth)*scale,fill:stripe,line:{transparency:100}});
            }
        }
        function label(el, override = {}) {
            const text = el.textContent.trim();
            if (!text) return;
            const css = getComputedStyle(el);
            const box = bounds(el);
            slide.addText(text,{
                ...box, h:Math.max(box.h,parseFloat(css.fontSize)*scale*1.22),
                fontFace:'Aptos',fontSize:pt(parseFloat(css.fontSize)),bold:Number(css.fontWeight)>=600,
                color:color(css.color)?.color, align:['right','center'].includes(css.textAlign)?css.textAlign:'left',
                margin:0, valign:'top', fit:'shrink', breakLine:false, ...override,
            });
        }
        function table(el) {
            const rows = Array.from(el.rows);
            if (!rows.length) return;
            const rowH = rows.map(row => bounds(row).h);
            const body = rows.map((row,index) => Array.from(row.cells,cell => {
                const css = getComputedStyle(cell);
                return {
                    text:Array.from(cell.childNodes,child => child.nodeName==='SMALL'?'\n'+child.textContent:child.textContent).join('').trim(),
                    options:{bold:index===0||cell.tagName==='TH',color:color(css.color)?.color,
                        fill:color(css.backgroundColor)??{color:horizontal?(index===0?'142544':'253958'):(index===0?'EDF3FA':'FFFFFF')},
                        align:css.textAlign, valign:'ctr'},
                };
            }));
            slide.addTable(body,{
                ...bounds(el),colW:Array.from(rows[0].cells,cell=>bounds(cell).w),rowH,autoPage:false,
                fontFace:'Aptos',fontSize:pt(parseFloat(getComputedStyle(el).fontSize)),margin:[1,2,1,2],
                border:{type:'solid',color:horizontal?'405573':'DEE6F2',pt:0.5},
            });
        }
        function chart(el, data) {
            const box = bounds(el);
            const axis = horizontal ? 'D9E5F9' : '435572';
            if (data.type==='donut') {
                slide.addChart(pptx.ChartType.doughnut,[{name:data.name,labels:['Realizado','Restante até 100%'],values:[data.value,100-data.value]}],
                    {...box,showLegend:false,showTitle:false,showPercent:false,showLabel:false,holeSize:76,
                        chartColors:[accent,horizontal?'405573':'DEE6F2']});
                // Texto legível no centro e dados editáveis na planilha do gráfico.
                label(el.querySelector('strong'),{...box,align:'center',valign:'mid'});
                return;
            }
            const series = {name:data.name,labels:data.labels,values:data.values};
            const type = data.type==='bar' ? pptx.ChartType.bar : pptx.ChartType.line;
            const common = {
                ...box,barDir:'col',showLegend:false,showTitle:false,showValue:data.showValues,
                displayBlanksAs:'gap', catAxisLabelColor:axis,valAxisLabelColor:axis,dataLabelColor:axis,
                catAxisLabelFontSize:Math.max(5.5,pt(10)),valAxisLabelFontSize:Math.max(5.5,pt(10)),
                catAxisLabelFrequency:String(Math.max(1,Math.ceil(data.labels.length/8))),
                valGridLine:{color:horizontal?'405573':'DEE6F2',size:0.6},lineSize:1.6,
                ...(type===pptx.ChartType.bar?{valAxisMinVal:Math.min(0,...data.values.filter(value=>value!==null),data.target??0)}:{}),
            };
            if (data.target!==null) {
                slide.addChart([
                    {type,data:[series],options:{chartColors:[accent]}},
                    {type:pptx.ChartType.line,data:[{name:'Meta',labels:data.labels,values:data.labels.map(()=>data.target)}],
                        options:{chartColors:[horizontal?'B1D5FF':'825008'],lineDash:'dash',showValue:false,lineDataSymbol:'none'}},
                ],common);
            } else slide.addChart(type,[series],{...common,chartColors:[accent]});
        }
        function visit(el) {
            if (!el.getClientRects().length) return;
            const data = charts.get(el);
            if (data) {chart(el,data);return;}
            if (el.tagName==='TABLE') {table(el);return;}
            if (el.matches('.op-paper-header,.op-card,.op-paper-timeline,.op-callout,.op-target-track,.op-target-track > span')) {
                panel(el,pptx.ShapeType.rect);
            }
            if (el.matches('.op-timeline-list')) {
                const dots = Array.from(el.querySelectorAll('.op-timeline-dot'),bounds);
                dots.forEach((dot,index) => {
                    const next = dots[index+1];
                    if (next && Math.abs(dot.y-next.y)<0.01) slide.addShape(pptx.ShapeType.line,{
                        x:dot.x+dot.w/2,y:dot.y+dot.h/2,w:next.x-dot.x,h:0,line:{color:'8499BF',width:0.7},
                    });
                });
            }
            if (el.matches('.op-timeline-dot')) {panel(el,pptx.ShapeType.ellipse);return;}
            if (el.matches('h2,h3,p,strong,footer,.op-paper-brand,.op-timeline-detail,.op-callout,.op-target-row > span:first-child')) {
                const css=getComputedStyle(el);
                const centered=el.closest('.op-timeline-list');
                // Balões têm padding físico, calculado no mesmo sistema de coordenadas do slide.
                const pad=parseFloat(css.paddingLeft)*scale;
                label(el,el.matches('.op-callout')?{
                    x:bounds(el).x+pad,y:bounds(el).y+parseFloat(css.paddingTop)*scale,w:bounds(el).w-2*pad,
                }:centered?{align:'center'}:{});
                return;
            }
            Array.from(el.children).forEach(visit);
        }
        Array.from(paper.children).forEach(visit);
        return compatiblePowerPoint(await pptx.write({outputType:'arraybuffer'}));
    }
    window.OnePagePptx = {build};
})();
