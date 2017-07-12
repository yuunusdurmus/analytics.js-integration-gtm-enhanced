module.exports = {
    productMap: {
        name: {
            incoming: 'name',
            pushing: 'name'
        },
        id: {
            incoming: 'product_id',
            pushing: 'id'
        },
        price: {
            incoming: 'price',
            pushing: 'price'
        },
        category: {
            incoming: 'category',
            pushing: 'category'
        },
        variant: {
            incoming: 'variant',
            pushing: 'variant'
        },
        position: {
            incoming: 'position',
            pushing: 'position'
        },
        brand: {
            incoming: 'brand',
            pushing: 'brand'
        },
        quantity: {
            incoming: 'quantity',
            pushing: 'quantity'
        },
        creative: {
            incoming: 'creative',
            pushing: 'creative'
        }
    },

    array: [
        {
            incomingEventName: 'Product Viewed',
            pushingObjectName: 'detail',
            enabled: ['name' ,'id', 'price', 'brand', 'category', 'variant']
        },
        {
            incomingEventName: 'Product List Viewed',
            pushingObjectName: 'impressions',
            enabled: ['name' ,'id', 'price', 'brand', 'category', 'variant']
        },
        {
            incomingEventName: 'Order Completed',
            pushingObjectName: 'purchase',
            enabled: ['name' ,'id', 'price', 'brand', 'category', 'variant']
        },
        {
            incomingEventName: 'Checkout Step',
            pushingObjectName: 'checkout',
            enabled: ['name' ,'id', 'price', 'brand', 'category', 'variant']
        },
        {
            incomingEventName: 'Product Added',
            pushingObjectName: 'add',
            enabled: ['name' ,'id', 'price', 'category', 'variant']
        },
        {
            incomingEventName: 'Product Removed',
            pushingObjectName: 'remove',
            enabled: ['name' ,'id', 'price', 'category', 'variant']
        } 

    ]

}
