import { BasePanel } from './BasePanel.js';

class HistogramExtension extends BasePanel {
    constructor(viewer, options) {
        super(viewer, options);
    }

    async load() {
        super.load();
        console.log('HistogramExtension loaded.');
        return true;
    }

    unload() {
        super.unload();
        console.log('HistogramExtension unloaded.');
        return true;
    }

    async findPropertyValueOccurrences(model, propertyName) {
        const dbids = await this.findLeafNodes(model);
        return new Promise(function (resolve, reject) {
            model.getBulkProperties(dbids, { propFilter: [propertyName] }, function (results) {
                let histogram = new Map();
                for (const result of results) {
                    if (result.properties.length > 0) {
                        const key = result.properties[0].displayValue;
                        if (histogram.has(key)) {
                            histogram.get(key).push(result.dbId);
                        } else {
                            histogram.set(key, [result.dbId]);
                        }
                    }
                }
                resolve(histogram);
            }, reject);
        });
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('HistogramExtension', HistogramExtension);