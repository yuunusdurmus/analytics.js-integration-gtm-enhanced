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

GTM.prototype.specificationMapper = function(_event, _props) {
    var obj = null, specific = null;

    this.specificationMap.forEach(function(item){
        if(item.incomingEventName == _event){
            specific = item;
            obj = {};
            obj.ecommerce = {};
            obj.ecommerce[item.pushingObjectName] = {}
        }
    })

    return obj ? {obj: obj, specific: specific}: false;
}

GTM.prototype.productMapper = function(_products){
    var products = _products

    products.forEach(function(pro){
        pro.id = pro.product_id;
        delete pro.product_id;
    });

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
    push(
      this.options.hasOwnProperty('manipulator') ?
          this.options.manipulator.package.userTransform(identify.traits())
          : identify.traits()
    );
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

        switch(event) {
            case 'Product Viewed':
                var products = this.productMapper([props]);
                obj.ecommerce[specific.pushingObjectName].products = products;
                break;

            case 'Product List Viewed':
                var products = this.productMapper(props.products);
                obj.ecommerce[specific.pushingObjectName] = products;
                break;

            case 'Order Completed':
                var products = this.productMapper(props.products);
                obj.ecommerce[specific.pushingObjectName].actionField = {
                    id: props.order_id,
                    tax: props.tax,
                    revenue: props.revenue,
                    shipping: props.shipping
                }
                obj.ecommerce[specific.pushingObjectName].products = products;
                break;

            case 'Checkout Step Viewed':
                var products = this.productMapper(props.products);
                obj.ecommerce[specific.pushingObjectName].actionField = {
                    step: props.step
                };
                obj.ecommerce[specific.pushingObjectName].products = products;
                break;

            case 'Product Added':
                var products = this.productMapper([props]);
                obj.ecommerce[specific.pushingObjectName].products = products;
                break;

            case 'Product Removed':
                var products = this.productMapper([props]);
                obj.ecommerce[specific.pushingObjectName].products = products;
                break;

            case 'Cart Viewed':
                var products = this.productMapper(props.products);
                obj.ecommerce[specific.pushingObjectName].actionField = {step: 1};
                obj.ecommerce[specific.pushingObjectName].products = products;
                break;
        }
        
        push(
            this.options.hasOwnProperty('manipulator') ?
                this.options.manipulator.package.transform(obj, event)
                : obj
        );
    }
};
