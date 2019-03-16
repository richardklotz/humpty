const fs = require('fs');
const path = require('path');
const pregyp = require('node-pre-gyp');

const binding_path = pregyp.find(
	path.resolve(path.join(__dirname, './package.json'))
);
const hummus = (module.exports = require(binding_path));
const {EventEmitter} = require('events');

/*
    addons to PDFWriter prototype for events listening
*/

hummus.PDFWriter.prototype.getEvents = function() {
	if (!this.events) this.events = new EventEmitter();
	return this.events;
};

hummus.PDFWriter.prototype.triggerDocumentExtensionEvent = function(
	eventName,
	eventParams
) {
	eventParams.writer = this;
	this.getEvents().emit(eventName, eventParams);
};

/*
    addon class for simple node wrappers
*/
hummus.PDFStreamForResponse = require('./PDFStreamForResponse');
hummus.PDFWStreamForFile = require('./PDFWStreamForFile');
hummus.PDFRStreamForFile = require('./PDFRStreamForFile');
hummus.PDFRStreamForBuffer = require('./PDFRStreamForBuffer');
