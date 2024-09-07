//importar librerias o clases base, padre etc..
import { BaseExtension } from "./BaseExtension.js";
import { TablaPanel} from "./TablaPanel.js";
//generar un constructor
class TablaExtension extends BaseExtension{
    constructor(viewer,options){
        super(viewer,options);
        this._button = null;
        this._panel = null;
    }
    //integrar metodos load() y unload()
    async load(){
        super.load();
        await Promise.all([
            this.loadScript('https://unpkg.com/tabulator-tables@4.9.3/dist/js/tabulator.min.js', 'Tabulator'),
            this.loadStylesheet('https://unpkg.com/tabulator-tables@4.9.3/dist/css/tabulator.min.css')
        ]);
        console.log('TablaExtension loaded.');
        return true;
    }
    //metodo unload

    unload(){
        super.unload();
        if(this._button){
            this.removeToolbarButton(this._button);
            this._button = null;
        }
        if(this._panel){
            this._panel.SetVisible(false);
            this._panel.unititialize();
            this._panel = null;
        }
        console.log('TablaExtension unloaded');
        return true;

    }

    onToolbarCreated(){
        this._panel = new TablaPanel(this,'CUANTIFICACIONES','TablaPanel',{x:10,y:10});
        this._button = this.createToolbarButton('TablaPanelButton','https://img.icons8.com/windows/32/steel-i-beam.png','Cuantificaciones');
        this._button.onClick = () =>{
            this._panel.setVisible(!this._panel.isVisible());
            this._button.setState(this._panel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);
            if (this._panel.isVisible() && this.viewer.model) {
                this.update();
            }
        };
    }

    onModelLoaded(model){
        super.onModelLoaded(model);
        if(this._panel && this._panel.isVisible()){
            this.update();
        }
    }

    async update(){
        const dbids = await this.findLeafNodes(this.viewer.model);
        this._panel.update(this.viewer.model,dbids);
    }

}

Autodesk.Viewing.theExtensionManager.registerExtension('TablaExtension',TablaExtension);