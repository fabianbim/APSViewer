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
    groupBy:'CATEGORIA',
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
        this.container.style.resize = 'none';
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
            rowClick: (e, row) => TABLA_CONFIG.onRowClick(row.getData(), this.extension.viewer)
        });
    }

    update(model,dbids){
        model.getBulkProperties(dbids,{propFilter:TABLA_CONFIG.requiredProps},(results) =>{
            this.table.replaceData(results.map((result) => TABLA_CONFIG.createRow(result.dbid,result.name,result.properties)));
        },(err)=>{
            console.error(err);
        });
    }

}