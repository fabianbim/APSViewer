const TABLA_CONFIG = {
    requiredProps: ['name','Category','Area','Volume','Level'],
    responsiveLayout:true,

    columns:[
        {title:'ID', field:'Elementid',responsive:3},
        {title: 'Category',field:'CATEGORIA',responsive:1},
        {title: 'Nombre', field:'name', with:150,responsive:0},
        {title: 'Area', field:'AreaM2',responsive:0,topCalc:"sum",topCalcParams:{precison:1,}},
        {title: 'Volume', field: 'VolumenM3',responsive:0,topCalc:"sum",topCalcParams:{precison:1,}},
        {title:'Level',field:'Nivel',responsive:0},

    ],
groupBy:['CATEGORIA','Nivel'],
groupStartOpen: [ true,false,false],
    createRow:(Elementid,name,props) =>{
        const CATEGORIA = props.find(p => p.displayName === 'Category')?.displayValue;
        const AreaM2 = props.find(p => p.displayName ==='Area')?.displayValue;
        const VolumenM3 = props.find(p => p.displayName ==='Volume')?.displayValue;
        const Nivel = props.find(p => p.displayName ==='Level' && p.displayCategory ==='Constraints')?.displayValue;
        return {Elementid,CATEGORIA,name,VolumenM3,Nivel,AreaM2};
    },
    onRowClick: (row,viewer) =>{
        viewer.isolate([row.dbid]);
        viewer.fitToView([row.dbid]);
        //viewer.toggleSelect([row.dbid],Autodesk.Viewing.SelectionType.OVERLAYED);
        //viewer.toggleVisibility([row.dbid]);
    }
};

export class TablaPanel extends Autodesk.Viewing.UI.DockingPanel{
    constructor(extension,id,title,options){
        super(extension.viewer.container,id,title,options);
        this.extension = extension;
        this.container.style.left = (options.x || 0) + 'px';
        this.container.style.top = (options.y || 0) + 'px';
        this.container.style.width = (options.width || 500) + 'px';
        this.container.style.height = (options.height || 400) + 'px';
        this.container.style.resize = 'both';
        this.container.style.ovwrflow = 'overlay';
    }

    initialize() {
        this.title = this.createTitleBar(this.titleLabel || this.container.id);
        this.initializeMoveHandlers(this.title);
        this.container.appendChild(this.title);
        this.content = document.createElement('div');
        this.content.style.height = '550px';
        this.content.style.backgroundColor = 'white';
        this.content.innerHTML = `<div class="tabla-container" style="position: relative; height: 450px;"></div>`;
        this.container.appendChild(this.content);
        // See http://tabulator.info
        this.table = new Tabulator('.tabla-container', {
            height: '100%',
            layout: 'fitColumns',
            columns: TABLA_CONFIG.columns,
            groupBy: TABLA_CONFIG.groupBy,
            selectable:true,
            rowClick: (e, row) => TABLA_CONFIG.onRowClick(row.getData(), this.extension.viewer)
        });
        this.exportbutton = document.createElement('button');
        this.exportbutton.innerHTML = 'EXPORTAR XLSX';
        this.exportbutton.style.width = (this.options.buttonWidth || 100) + 'px';
        this.exportbutton.style.height = (this.options.buttonHeight || 30) + 'px';
        this.exportbutton.style.margin = (this.options.margin || 5) + 'px';
        this.exportbutton.style.verticalAlign = (this.options.verticalAlign || 'middle');
        this.exportbutton.style.backgroundColor = (this.options.backgroundColor || 'white');
        this.exportbutton.style.borderRadius = (this.options.borderRadius || 8) + 'px';
        this.exportbutton.style.borderStyle = (this.options.borderStyle || 'groove');
        this.exportbutton.style.color = "black";

        this.exportbutton.onclick = this.exportExcel.bind(this);
        this.container.appendChild(this.exportbutton);
    }

    exportExcel(){
        let data = this.table.download("xlsx","CANTDIDADES.xlsx",{sheetName:"CONCRETOS"});
        console.log("LA TABLA A SIDO EXPORTADA!",data);
    }

    update(model,dbids){
        model.getBulkProperties(dbids,{propFilter:TABLA_CONFIG.requiredProps},(results) =>{
            this.table.replaceData(results.map((result) => TABLA_CONFIG.createRow(result.dbid,result.name,result.properties)));
        },(err)=>{
            console.error(err);
        });
    }

}