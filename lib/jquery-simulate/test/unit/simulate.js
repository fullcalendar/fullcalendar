(function() {

module( "mouse events" );

test( "click on checkbox triggers change", function() {
	var input = $( "#radiocheckbox-3" ),
		checked = input.prop( "checked" );

	input.simulate( "click" );

	notEqual( checked, input.prop( "checked" ), "checkbox state changed" );
});

test( "click on radio triggers change", function() {
	var firstRadio = $( "#radiocheckbox-1" ),
		secondRadio = $( "#radiocheckbox-2" ),
		checked = firstRadio.prop( "checked" );

	if ( checked ) {
		secondRadio.simulate( "click" );
	} else {
		firstRadio.simulate( "click" );
	}

	notEqual( checked, firstRadio.prop( "checked" ), "radio state changed" );
});

var key = jQuery.simulate.keyCode,
	keyEvents = [ "keydown", "keyup", "keypress" ],
	i = 0;

module( "key events" );

function testKeyEvent ( keyEvent ) {
	test( keyEvent, function() {
		expect( 2 );
		jQuery("<div></div>").bind( keyEvent, function( event ) {
			ok( true, keyEvent + " event fired" );
			equal( event.keyCode, key.PAGE_UP, keyEvent + " event has correct keyCode" );
		}).appendTo("#qunit-fixture").simulate( keyEvent, {
			keyCode: key.PAGE_UP
		});
	});
}

for ( ; i < keyEvents.length; i++ ) {
	testKeyEvent( keyEvents[ i ] );
}

module( "complex events" );

asyncTest( "drag moves option", function() {

	var moves = 15,
		calls = 0,
		el = jQuery("<div class='top-left'></div>").appendTo("#qunit-fixture"),
		position;

	expect( moves + 2 );

	jQuery( document ).bind( "mousedown", function( event ) {
		position = {
			clientX : event.clientX,
			clientY : event.clientY
		};
	}).bind( "mousemove", function( event ) {
		ok( true, "mousemove event fired at the document" );
		if ( ++calls === moves ) {
			equal( position.clientX + 10, event.clientX, "last mousemove fired at correct clientX" );
			equal( position.clientY + 20, event.clientY, "last mousemove fired at correct clientX" );
			jQuery( document ).unbind("mousemove").unbind("mousedown");
			start();
		}
	});

	el.simulate( "drag", {
		moves: 1,
		dx: 10,
		dy: 20
	}).simulate( "drag", {
		moves: 5,
		dx: 10,
		dy: 20
	});

	// falsey defaults to 3
	el.simulate( "drag", {
		moves: 0,
		dx: 10,
		dy: 20
	}).simulate( "drag", {
		dx: 10,
		dy: 20
	}).simulate( "drag", {
		moves: null,
		dx: 10,
		dy: 20
	});
});

})();