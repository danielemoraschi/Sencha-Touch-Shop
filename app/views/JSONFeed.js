Ext.ns("foodtruck");

foodtruck.JSONFeedPanel = Ext.extend(Ext.Panel, {
	fullscreen: true,
	layout: 'card',
	cls:'feeds-group',
	
	initComponent: function() {
		Ext.apply(this, {
			items:[{
				xtype:'foodtruck-carousel', 
				id:'carousel'
			}]		
		});
		foodtruck.JSONFeedPanel.superclass.initComponent.apply(this, arguments);
		this.on({
            scope: this,
            afterrender: this.AjaxRequest,
        });	
	},
		
	AjaxRequest: function(){
		Ext.getStore('ProductCarouselStore').each(function(){
			var me = this;
			if(me.data.source!=""){

				Ext.Ajax.request({
	                url: me.data.source,
	                success: function(response, opts){
						var res = Ext.util.JSON.decode(response.responseText);
						var store = new Ext.data.Store({
								model: 'JSONFeed',
						});
						var dataview = new Ext.DataView({
							layout: 'card',
							tpl : new Ext.XTemplate(
					        	'<tpl for=".">'+
							        '<div class="group-feed-widget">'+
										'<div class="widget-title">{name}</div>'+
										'<br />'+
										'<div class="product-info"><i>{dishInfo}</i></div>'+
										'<div class="product-description">{product}</div>'+
										'<br />'+
										'<div class="buy-button-holder">${price} <div class="buy-button">Add to Order</div></div>'+
							        '</div>'+
							    '</tpl>'
					    	),
							cls: me.data.name,
							itemSelector: 'div.buy-button', 
							store: store,
							listeners: {
								itemtap: function(item, index, e){
									var record = this.store.getAt(index);
									var cents = parseFloat(record.data.price); //allows for cents in price, use this instead of record.data.price which could be a string
									Ext.Msg.alert('', 'Added ' + record.data.name + ' to order', Ext.emptyFn);
									var orderitem = Ext.ModelMgr.create({query: record.data.name, paypalQuery: record.data.paypalQuery, price: record.data.price, listPrice: cents }, 'Item');
									orderitem.save();

									Ext.dispatch({
								            controller: "storeCount",
								            action    : "count"
								    });
								}
							}
						});
						store.add(res.addresses);
						Ext.getCmp(me.data.name).add(dataview);
					}
	            });	
			}	
        });
	}
});
Ext.reg("foodtruck-jsonfeed-panel", foodtruck.JSONFeedPanel);