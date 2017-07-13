var integration = require('@segment/analytics.js-integration');
var push = require('global-queue')('dataLayer', { wrap: false });
var SpecificationMap = require('./specification-map.js');

var GTM = module.exports = integration('Google Tag Manager')
    .global('dataLayer')
    .global('google_tag_manager')
    .option('containerId', '')
    .option('environment', '')
    .option('trackNamedPages', true)
    .option('trackCategorizedPages', true)
    .tag('no-env', '<script src="//www.googletagmanager.com/gtm.js?id={{ containerId }}&l=dataLayer">')
    .tag('with-env', '<script src="//www.googletagmanager.com/gtm.js?id={{ containerId }}&l=dataLayer&gtm_preview={{ environment }}">');

GTM.prototype.specificationMap = SpecificationMap.array;
GTM.prototype.productMap = SpecificationMap.productMap;

GTM.prototype.specificationMapper = function(_event, _props) {
    var obj = {}

    var specific = this.specificationMap.filter(function(item){
        return item.incomingEventName == _event;
    })[0];
    
    if(specific){ 
        obj.ecommerce = {};
        obj.ecommerce[specific.pushingObjectName] = {};

        return {
            obj: obj,
            specific: specific 
        };
    }else {
        return false;
    }
}

GTM.prototype.productMapper = function(specific, _products){
    var products = [],
        product = {};
    
    _products.forEach(function(pro){
        product = {};

        specific.enabled.forEach(function(enable){
            product[this.productMap[enable].pushing] = pro[this.productMap[enable].incoming]  
        }.bind(this))
        
        products.push(product)
    }.bind(this));

    return products;
}

GTM.prototype.loaded = function() {
    return !!(window.dataLayer && Array.prototype.push !== window.dataLayer.push);
};

GTM.prototype.initialize = function() {
    push({ 'gtm.start': Number(new Date()), event: 'gtm.js' });

    if(this.options.environment.length) {
        this.load('with-env', this.options, this.ready);
    }else {
        this.load('no-env', this.options, this.ready);
    }
};

GTM.prototype.identify = function(identify) {
    this.user = identify.traits()
};

GTM.prototype.page = function(page) {
    push({'page': page.fullName()})
};

GTM.prototype.track = function(track) {
    var props = track.properties(),
        event = track.obj.event,
        obj = null,
        specific = null;

    var result = this.specificationMapper(event, props);
    
    if(result) {
        obj = result.obj;
        specific = result.specific;

        if(event == 'Product Viewed') {
            var products = this.productMapper(specific, [props]);
            obj.ecommerce[specific.pushingObjectName].products = products;
        } 
        
        else if(event == 'Product List Viewed') {
            var products = this.productMapper(specific, props.products);
            obj.ecommerce[specific.pushingObjectName] = products;
        } 
        
        else if(event == 'Order Completed'){
            var products = this.productMapper(specific, props.products);
            obj.ecommerce[specific.pushingObjectName].actionField = {
                tax: props.tax,
                revenue: props.revenue,
                shipping: props.shipping
            }
            obj.ecommerce[specific.pushingObjectName].products = products;
        }

        else if(event == 'Checkout Started') {
            var products = this.productMapper(specific, props.products);
            obj.ecommerce[specific.pushingObjectName] = products;
        }

        else if(event == 'Product Added') {
            var products = this.productMapper(specific, [props]);
            obj.ecommerce[specific.pushingObjectName].products = products;
        }

        else if(event == 'Product Removed') {
            var products = this.productMapper(specific, [props]);
            obj.ecommerce[specific.pushingObjectName].products = products;
        }

        push(obj);
    }

   
};

