import './extensions/BasePanel.js';
import './extensions/HistogramExtension.js';
import './extensions/TablaExtension.js';

async function getAccessToken(callback) {
    try {
        const resp = await fetch('/api/auth/token');
        if (!resp.ok)
            throw new Error(await resp.text());
        const { access_token, expires_in } = await resp.json();
        callback(access_token, expires_in);
    } catch (err) {
        alert('Could not obtain access token. See the console for more details.');
        console.error(err);        
    }
}

export function initViewer(container) {
    return new Promise(function (resolve, reject) {
            Autodesk.Viewing.Initializer({ env: 'AutodeskProduction', getAccessToken }, function () {
            const config = {
                extensions: [
                    'Autodesk.DocumentBrowser',
                    'BasePanel',
                    'HistogramExtension',
                    'TablaExtension',
                ]
                
            };
            const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
            viewer.start();
            viewer.setTheme('light-theme');
            resolve(viewer);
        });
    });
}

export function loadModel(viewer, urn) {
    function onDocumentLoadSuccess(doc) {
        viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry());
        viewer.loadExtension("NestedViewerExtension",{filter:["2d","3d"],crossSelection: true});
        viewer.loadExtension('Autodesk.DocumentBrowser');
        viewer.loadExtension('Autodesk.VisualClusters');
        viewer.setDisplayEdges(false);
        viewer.setProgressiveRendering(true);
        viewer.setGroundReflection(true);
        viewer.setGroundShadow(true);
        viewer.setQualityLevel(false, false);
        viewer.setGroundReflectionAlpha(0);
        viewer.hideLines(true);
        viewer.setOptimizeNavigation(true);
        viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, async function () {
            const ext = await viewer.loadExtension('Autodesk.ModelStructure');
            const modelStructurePanel = new Autodesk.Viewing.Extensions.ViewerModelStructurePanel(viewer, 'My Model Browser');
            modelStructurePanel.options.onToggleMultipleOverlayedSelection = (selection) => {
                for (const s of selection) {
                    s.model = viewer.impl.findModel(parseInt(s.modelId)); // Make sure each selection set is linked to the corresponding model
                    s.selectionType = Autodesk.Viewing.SelectionType.OVERLAYED; // Override each selection set to use the "see-through" highlight
                }
                viewer.setAggregateSelection(selection);
            };
            ext.setModelStructurePanel(modelStructurePanel);
        });

    }
    function onDocumentLoadFailure(code, message) {
        alert('Could not load model. See console for more details.');
        console.error(message);
    }
    Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
}