var
	debug = require( "debug" )( "elvira:status" ),
	http = require( "http" ),
	path = require( "path" ),
	express = require( "express" ),
	eio = require( "engine.io" ),
	app = express();

app.configure(function(){
	app.set( "port", process.env.PORT || 3000);
	app.set( "views", path.join( __dirname, "/views" ) );
	app.set( "view engine", "jade");
	app.use( express.favicon() );

	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, "public" )));
});

app.configure( "development", function(){
	app.use(express.logger("dev"));
	app.use(express.errorHandler({
		dumpExceptions: true
	}));
});

app.configure( "production", function(){
	app.use( express.errorHandler() );
});

app.get( "/", function( req, res ){
	res.render( "index" );
});

var server = http.createServer( app );
var eioServer = eio.attach( server );
var sendMessage = function( socket, type, args ){
	var data = {
		type: type,
		args: args
	};
	socket.send( JSON.stringify( data ) );
};
var broadcastMessage = function( ){
	var args = Array.prototype.slice.call( arguments );
	Object.keys( eioServer.clients ).forEach(function( socketId ){
		sendMessage.apply( null, [].concat( eioServer.clients[ socketId ] ).concat( args ) );
	});
};
setInterval(function(){
	broadcastMessage( "connection", {
		title: new Date(),
		lat: Math.random() + 47,
		lon: Math.random() + 19
	});
}, 1000);
server.listen( app.get( "port" ), function( err ){
	if( err ){
		return console.error( "Error starting app:", err );
	}
	console.log( "App is listening on: ", server.address().port );
});