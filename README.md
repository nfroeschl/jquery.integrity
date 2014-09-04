# jQuery Integrity #
*A jQuery wrapper for [PTC Integrity](http://www.mks.com/platform/our-product) Web Services.*

## Description ##

The jQuery Integrity plugin wraps the [jquery.soap](https://github.com/doedje/jquery.soap) plugin and makes it easy to interact with the (convoluted) web services exposed by the Integrity application. Note that jquery.soap is dependent on [jquery.xml2json](https://github.com/josefvanniekerk/jQuery-xml2json) for the `SOAPResponse.toJSON()` method.

This plugin is intended to be used inside Integrity reporting recipes to allow reports to make web service calls using the verbs `create`, `edit` and `get`.

**Please note that this plugin does not currently support attachments. Yet...**

*Customizing this plugin for your specific usage is highly encouraged.*

## Usage ##

In the JavaScript section of the HTML (assuming your JavaScripts are located at `/js/`):

	<script>
		var weburl = '<%weburl%>'; // **SET THE WEBURL HERE!**
	</script>
	<script src="/js/jquery.min.js"></script>       // Required : jQuery
	<script src="/js/jquery.xml2json.js"></script>  // Optional : Convert xml to json
	<script src="/js/jquery.soap.js"></script>      // Required : jQuery Soap plugin
	<script src="/js/jquery.integrity.js"></script> // Required : jQuery Integrity plugin
	<script>
		// Your JavaScript here, inline or external doesn't matter
	</script>

At any point after this, the Integrity jQuery plugin can be accessed using the namespace `$.integrity`.

If the `weburl` variable is provided using this technique, the plugin automatically appends `webservices/10/Integrity/` to the end of the value.

## Configuration Methods ##
**All of the set methods return $.integrity, so they can be chained.**

### setUrl(url) ###

The URL for web service calls can be provided or changed using this method. Note that a fully qualified URL will need to be provided as the plugin will not prefix or append anything to the value passed in.

### getUrl() ###

Returns the URL being used for all web service calls.

### setCallback (type, callback) ###

Use this method to attach callbacks for `success`, `error` and `beforeSend`, per the [jquery.soap documentation](https://github.com/doedje/jquery.soap/blob/master/doc/options.md).

Valid values for `type` are case sensitive and include: `success`, `error` and `beforeSend`.

Callback method signatures are:

- success : function ([SOAPResponse](https://github.com/doedje/jquery.soap/blob/master/jquery.soap.js#L357))
- error : function ([SOAPResponse](https://github.com/doedje/jquery.soap/blob/master/jquery.soap.js#L357))
- beforeSend : function ([SOAPEnvelope](https://github.com/doedje/jquery.soap/blob/master/jquery.soap.js#L126))

### setDefault (key, value) ###

Use this method to set configuration options per the [jquery.soap documentation](https://github.com/doedje/jquery.soap/blob/master/doc/options.md). Note that this method cannot be used to set the URL (use `setUrl(url)`) or any of the callbacks (use `setCallback(type, method)`).

[Click here to see the default configuration options](https://github.com/scottoffen/jquery.integrity/blob/master/jquery.integrity.js#L6).

Specific to the Integrity web services, this method is also used to set the values for **Username**, **Password**, **ImpersonatedUser**, **DateFormat** and **DateTimeFormat** using the keys `username`, `password`, `impersonating`, `dateformat` and `datetimeformat` respectively. Note that these values are not validated in any way, and if truthy will be inserted into the xml as provided.

Of the Integrity-specific values listed above, only **Username** and **Password** are required by the Integrity web service.

### getDefault (key) ###

Returns the value in the default configuration options corresponding to the key passed in. Works for url, callbacks and all Integrity-specific key/value pairs.

### logging.on() and logging.off() ###

Convenience methods for setting the [`enableLogging`](https://github.com/doedje/jquery.soap/blob/master/doc/options.md#enablelogging) jquery.soap configuration option to true and false, respectively.

## Request Execution Methods ##
Once the namespace has been configured, there are two ways to execute a request.

### Parameterized Verb ###

Requests can be sent directly from the namespace using the format:

	$.integrity(verb, params[, success, error]);

This method call returns the value of the call to $.soap(), which, according the [jquery.soap documentation](https://github.com/doedje/jquery.soap#promise), returns a jqXHR object which implements the [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) interface.

The optional success and error arguments are callbacks that will be called *in addition to* the default callbacks (if any) provided, and will receive the `SOAPResponse` object as a parameter.  

The verb should be either `create`, `edit` or `get`, and the params object argument is expected to look slightly different in each case.

#### Create ####

#### Edit ####

#### Get ####

### Specified Verb ###
There are functions attached to the namespace for `create`, `edit` and `get`, all of which have the same parameters and format:

	$.integrity.[verb:create|edit|get](params[, success, error]);

and can be used just like their parameterized counterparts.

	$.integrity.edit({ 'ItemId' : '123456' });

## Statement of Non-Support ##

<<<<<<< HEAD
This plugin is provided without warranties or conditions of any kind, either express or implied. As such, there is no support offered for it. [Please report any bugs or issues you find](https://github.com/scottoffen/jquery.integrity/issues) so that I can get it fixed. New features will be considered, but I make no promises about implementing them.
=======
This plugin is provided without warranties or conditions of any kind, either express or implied. As such, there is no support offered for it. [Please report any bugs or issues you find](https://github.com/scottoffen/jquery.integrity/issues) so that I can get it fixed. New features will be considered, but I make no promises about implementing them.
>>>>>>> 245ff1b43db2f65e7267e9f5b17cc99d9b64defa
