/*jshint expr:true */
Function.prototype.bind=Function.prototype.bind||function(b){if(typeof this!=="function"){throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");}var a=Array.prototype.slice,f=a.call(arguments,1),e=this,c=function(){},d=function(){return e.apply(this instanceof c?this:b||window,f.concat(a.call(arguments)));};c.prototype=this.prototype;d.prototype=new c();return d;};
var Map = function _MapCtor(){
	this.el = d3.select("#map");
	this.po = org.polymaps;
	this.map = this.po.map()
		.container(this.el.append("svg:svg").node())
		.center({
			lat: 47.513,
			lon: 19.041
		})
		.zoom(6)
		.add(this.po.interact());

	this.map.add(
		this.po.image()
			.url(
				this.po
					.url("http://{S}tile.cloudmade.com/6e3eb0a2f1a74cf3be9d0ce6b3f12b0a/998/256/{Z}/{X}/{Y}.png")
						.hosts(["a.", "b.", "c.", ""]
					)
			)
		);

	this.map.add( this.po.compass()
		.pan("none"));
};
Map.prototype.addMarker = function( data ){
	var self = this;
	var layer = this.el.select( "svg" ).insert("svg:g", ".compass");
	var marker = layer
			.append("svg:g")
			.attr("transform", transform);

	// Add a circle.
	marker.append("svg:image")
			.attr( "xlink:href", "/img/marker.png" )
			.attr( "width", 24 )
			.attr( "height", 24 );
			//.attr("r", 4.5);

	// Add a label.
	marker.append("svg:text")
			.attr("x", 7)
			.attr("dy", ".31em")
			.text(function(d) { return data.title; });

	// Whenever the map moves, update the marker positions.
	this.map.on("move", function() {
		layer.selectAll("g").attr("transform", transform);
	});

	function transform(d) {
		d = self.map.locationPoint({lon: data.lon, lat: data.lat});
		return "translate(" + d.x + "," + d.y + ")";
	}
	
	setTimeout(function(){
		marker.remove();
	}, 2500);
	return marker;
};
var Message = function _MessageCtor( options ){
	options || ( options = {} );
	this._options = options;
};
eio.util.inherits( Message, eio.Emitter );
Message.prototype.connect = function(){
	this._socket = eio();
	this._socket.on( "message", this.message.bind( this ) );
};
Message.prototype.message = function( rawData ){
	var data;
	try{
		data = JSON.parse( rawData );
	}
	catch( x ){
		this.log( "couldn't parse message", x, rawData );
	}
	if( !data ){
		return;
	}
	this.emit( data.type, data.args );
};
Message.prototype.log = function(){
	return window.console && window.console.log && Function.prototype.apply.call( console.log, console, arguments );
};
Message.prototype.send = function( type, args ){
	var data = {
		type: type,
		args: args
	};
	this._socket.send( JSON.stringify( data ) );
};
var App = function _AppCtor(){
	this.map = new Map();
	this.message = new Message();
	this.message.on( "connection", this.onConnection.bind( this ) );
	this.message.connect();
};

App.prototype.onConnection = function( data ){
	this.map.addMarker( data );
};

var app = new App()