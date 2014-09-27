# jQuery Integrity #
*A jQuery wrapper for [PTC Integrity](http://www.mks.com/platform/our-product) Web Services.*

This documentation is out of date - this plugin no longer requires jquery.soap.js - updated documentation to come.

## Description ##

The jQuery Integrity plugin wraps the [jQuery Soap](https://github.com/doedje/jquery.soap) plugin and makes it easy to interact with the (convoluted) web services exposed by the Integrity application. Note that [jquery.soap has it's own dependencies](https://github.com/doedje/jquery.soap#dependencies) that will also need to be resolved.

This plugin is intended to be used inside Integrity reporting recipes to allow reports to make web service calls using the verbs `create`, `edit` and `get`.

**Please note that this plugin does not currently support attachments. Yet...**

*Customizing this plugin for your specific usage is highly encouraged.*

## Usage ##

In the JavaScript section of the report recipe HTML (assuming your JavaScript directory is located at `/js/`):

	<script>
		var weburl = '<%weburl%>'; // **SET THE WEBURL FIRST!**
	</script>
	<script src="/js/jquery.min.js"></script>       // Required : jQuery
	<script src="/js/jquery.xml2json.js"></script>  // Optional : Convert xml to json
	<script src="/js/jquery.soap.js"></script>      // Required : jQuery Soap plugin
	<script src="/js/jquery.integrity.js"></script> // Required : jQuery Integrity plugin

At any point after this, the Integrity jQuery plugin methods can be utilized via the namespace `$.integrity`.

If the `weburl` variable is provided using the technique above, it will be used in creating a default web service URL by automatically appending `webservices/10/Integrity/` to the end of the value.

## Configuration Methods ##
All of the `set` methods return `$.integrity`, so they can be **chained**.

### setUrl(url) ###

Sets the URL for web service calls. Note that a fully qualified URL will need to be provided as the method will not prefix or append anything to the value passed in.

### getUrl() ###

Returns the URL being used for all web service calls.

### setCallback (type, callback) ###

Use this method to attach callbacks for [`success`](https://github.com/doedje/jquery.soap/blob/master/doc/options.md#success), [`error`](https://github.com/doedje/jquery.soap/blob/master/doc/options.md#error) and [`beforeSend`](https://github.com/doedje/jquery.soap/blob/master/doc/options.md#beforesend), per the [jquery.soap documentation](https://github.com/doedje/jquery.soap/blob/master/doc/options.md), where valid values for `type` are *success*, *error* and *beforeSend*. The method signatures for the callbacks are:

- success : function ([SOAPResponse](https://github.com/doedje/jquery.soap/blob/master/jquery.soap.js#L357))
- error : function ([SOAPResponse](https://github.com/doedje/jquery.soap/blob/master/jquery.soap.js#L357))
- beforeSend : function ([SOAPEnvelope](https://github.com/doedje/jquery.soap/blob/master/jquery.soap.js#L126))

### setDefault (key, value) ###

Use this method to set configuration options per the [jquery.soap documentation](https://github.com/doedje/jquery.soap/blob/master/doc/options.md). Note that this method cannot be used to set the URL (use [`setUrl(url)`](https://github.com/scottoffen/jquery.integrity/tree/master#seturlurl)) or any of the callbacks (use [`setCallback(type, method)`](https://github.com/scottoffen/jquery.integrity/tree/master#setcallback-type-callback)).

[Click here to see the default configuration options](https://github.com/scottoffen/jquery.integrity/blob/master/jquery.integrity.js#L6) in the code.

Specific to the Integrity web services, this method is also used to set the values for **Username**, **Password**, **ImpersonatedUser**, **DateFormat** and **DateTimeFormat** using the keys `username`, `password`, `impersonating`, `dateformat` and `datetimeformat` respectively. Note that these values are not validated in any way, and (if truthy) will be inserted into the XML as provided.

Of the Integrity-specific values listed above, only **Username** and **Password** are required by the Integrity web service.

### getDefault (key) ###

Returns the value in the default configuration options corresponding to the key passed in. Will also work for URL, callbacks and all Integrity-specific key/value pairs.

### logging.on() and logging.off() ###

Convenience methods for setting the [`enableLogging`](https://github.com/doedje/jquery.soap/blob/master/doc/options.md#enablelogging) jquery.soap configuration option to true and false, respectively.

## Request Execution Methods ##
Once the namespace has been configured, there are two ways to execute a request.

### Parameterized Verb ###

Requests can be sent directly from the namespace using the format:

	$.integrity(verb, params[, success, error]);

This method call returns the value of the call to $.soap(), which, according the [jquery.soap documentation](https://github.com/doedje/jquery.soap#promise), returns a jqXHR object which implements the [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) interface.

The **optional** `success` and `error` arguments are callbacks that will be called *in addition to* the default callbacks (if any) provided, and will receive the `SOAPResponse` object as a parameter.  

The verb should be either `create`, `edit` or `get`, and the params object argument is expected to look slightly different in each case.

#### Create ####

{ Type, ItemFields }

#### Edit ####

{ ItemId, ItemFields }

#### Get ####

{ InputFld, QueryDef }

### Specified Verb ###
There are functions attached to the namespace for `create`, `edit` and `get`, all of which have the same parameters and format:

	$.integrity.[verb:create|edit|get](params[, success, error]);

and can be used just like their parameterized counterparts.

	$.integrity.edit({ 'ItemId' : '123456' });

## Demo ##

Download the `demo.html` file to test jQuery Integrity with your Integrity instance. In addition to the files in this repository, you will need:

- [jQuery](http://jquery.com/)
- [jQuery Soap](http://plugins.jquery.com/soap/)
- [jQuery xml2json](https://github.com/josefvanniekerk/jQuery-xml2json)
- [Bootstrap](http://getbootstrap.com/)

Create a new Integrity report recipe using the contents of the `demo.html` file, updated with the correct paths to your JavaScript and CSS folders and the correct values for username and password on lines 83 and 84, respectively.

## Statement of Non-Support ##

This plugin is provided without warranties or conditions of any kind, either express or implied. As such, there is no support offered for it. [Please report any bugs or issues you find](https://github.com/scottoffen/jquery.integrity/issues) so that I can get it fixed. New features will be considered, but I make no promises about implementing them.
