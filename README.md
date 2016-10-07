# jQuery Integrity #
*A jQuery wrapper for [PTC Integrity](http://www.mks.com/platform/our-product) Web Services.*

## Important! ##

I am no longer working with PTC Integrity, and will not be maintaining this library. If you'd like to take it over, please shoot me an email and I'd be happy to turn it over to you. Otherwise, I will delete this repository in 2017.

## Description ##

The jQuery Integrity plugin facilitates simplified interactions with the web services exposed by the Integrity application. This plugin is intended to be used on pages created by Integrity reporting recipes to allow reports to make web service calls using the verbs `create`, `edit` and `get`.

> This plugin does not yet support attachments.
> Customizing this plugin for your specific scenario is highly encouraged.

## Usage ##

In the `head` of the report recipe HTML (assuming your JavaScript directory is located at `/js/`):

```html
<!-- required for $.integrity.credentails() dialog -->
<link rel="stylesheet" href="/css/bootstrap.min.css"> 

<script>
	var weburl = '<%weburl%>'; // **SET THE WEBURL FIRST!**
</script>
<script src="/js/jquery.min.js"></script>       // Required : jQuery
<script src="/js/jquery.xml2json.js"></script>  // Required : jQuery xml2json
<script src="/js/jquery.integrity.js"></script> // Required : jQuery Integrity plugin
```

At any point after this, the Integrity jQuery plugin methods can be utilized via the namespace `$.integrity`.

If the `weburl` variable is provided using the technique above, it will be used when the plugin initializes to create a default web service URL by automatically appending `webservices/10/Integrity/` to the end of the value.

> If the `weburl` is not created prior to the plugin initialization, then it will need to be set manually using the `setUrl(url)` method prior to making any service calls (including credential verification), and the fully qualified URL and path will need to be provided.

## Configuration Methods ##

Use these methods to configure the plugin.

> All of the methods listed below return `$.integrity` except `getUrl()`, so that chaining is fully supported.

### setUrl (string-url) ###

Sets the URL for web service calls. A fully qualified URL will need to be provided as the method will neither append nor prepend anything to the value passed in (in contrast to the approach described in the [Usage](https://github.com/scottoffen/jquery.integrity#usage) section).

### getUrl() ###

Returns the fully qualified URL being used for all web service calls.

### success (function(json)) ###

Sets a universal callback method for sucessfully completed service calls. This function will be executed after every service call before any additional success callback method.

A JSON representation of the XML data returned is the only parameter sent to the callback function.

### error (function(json)) ###

Sets a universal callback method for failed service calls. This function will be executed after every service call before any additional error callback method.

A JSON representation of the XML data returned is the only parameter sent to the callback function.

### beforeSend (function(params, [jqXHR](http://api.jquery.com/jQuery.ajax/#jqXHR))) ###

Sets a universal callback method to be executed prior to sending the service call. This function will be executed prior to every service call and before any additional beforeSend callback method. 

The `params` plain object passed to the callback method as the first argument has been augmented with a `toString()` method that returns a string representation of the XML body that will be sent to the service.. 

### setUsername (string-value) ###

Sets the username credential for all service calls. This value is neither validated nor authenticated. To validate/authenticate credentials, use the `credentials()` method.

Note that this will also update the `credentails-username` key in [localStorage](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage#localStorage).

### setPassword (string-value) ###

Sets the password credential for all service calls. This value is neither validated nor authenticated. To validate/authenticate credentials, use the `credentials()` method.

Note that this will also update the `credentails-password` key in [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage#sessionStorage).

### impersonate (string-value) ###

Sets the username that all service calls will be impersonating. Always optional, included for completeness.

### dateformat (string-value) ###

Sets the date format to be used in all service calls. Always optional, included for completeness.

### datetimeformat (string-value) ###

Sets the date/time format to be used in all service calls. Always optional, included for completeness.

## Obtaining Credentials ##

A username and password is required for all service calls.  While it is possible to hard-code these values using the `setUsername()` and `setPassword()` methods, it is more likely that you will want to dynamically capture the credentials of the person accessing the application at runtime. The plugin contains a simple method to obtain these credentials at any time.

> Note that if service calls are attempted prior to credentials being provided, the service call will throw an error.

### credentials (function()) ###

The method `$.integrity.credentials()` will check to see if credentials already exist, and if they don't, will prompt the user for them using a Bootstrap-styled modal dialog. Once credentials have been verified, they are stored locally using the web browsers [DOM Storage API](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage) for use on other pages.

The method takes as its only argument an optional callback method to be executed once credentials have been verified. No parameters will be passed to this callback method.

When called, the `$.integrity.credentials()` method uses the following logic:

1. If the internal username and password values have already been set (i.e., the `setUsername()` and `setPassword()` methods have been called), then the callback provided (if any) is executed.
2. Else if the username and password have been stored locally (i.e., credentials were gathered and verified on a previous page), then the internal username and password values are set and the callback provided (if any) is executed.
3. Else the user is prompted for credentials. Once a username and password have been provided, an innocuous service call is made to ensure the credentials are valid. If they are not, the user is prompted again. Once credentials are validated, they are stored locally and the internal username and password values are set.

If the prompt for credentials is canceled/closed, the callback method is not executed. 

### How Credentials Are Stored ###

Once verified, the username and password are stored locally using the web browsers [DOM Storage API](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage).

- The password is Base64 encoded and stored in [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage#sessionStorage) using the key `credentials-password`. Because sessionStorage is cleared everytime the browser restarts, this key-value pair is not stored long term, but can be shared across pages on the same domain during the same browser session.
- The username is stored using [localStorage](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage#localStorage) as clear text using the key `credentials-username`. As localStorage is persistent between browser sessions, a username provided in a previous session, if stored, will be used to populate the modal dialog Username field.

### Preemptive vs On-Demand Credential Request ###

The recommended approach is to gather credential preemptively on page load. This ensures that all service calls can be executed without error.

Credentials can also be gathered on demand by wrapping the `$.integrity()` call in the callback argument of the `$.integrity.credentials()` method:

```javascript
$.integrity.credentials(function ()
{
	$.integrity(...);
});
```

> This approach, while valid, has a limitation. The `$.integrity.credentials()` method does not return anything, while the request execution methods all return the [jqXHR](http://api.jquery.com/jQuery.ajax/#jqXHR) object. Using this approach means you have no access to the jqXHR object or [the Promise interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) it implements.

## Providing Global Defaults ##

An easy way to provide standard, global defaults for your application would be to put your global defaults in a separate configuration file.

Here is an example of doing that using the [jQuery Bark](https://github.com/scottoffen/jquery.bark) plugin:

**jquery.integrity.default-config.js**
```javascript
$.integrity.success(function (json)
{
	var title    = 'Success';
	var priority = 'success';
	var message  = undefined;

	try
	{
		if (json.Body.createItemResponse)
		{
			message = 'Created Item ' + json.Body.createItemResponse['return']['ns1:ItemId'];
		}
		else if (json.Body.editItemResponse)
		{
			message = 'Saved Item ' + json.Body.editItemResponse['return']['ns1:ItemId'];
		}
		// no need to bark on the get-verb
	}
	catch (err) {}

	$.bark({ 'title' : title, 'priority' : priority, 'message' : message });
})
.error(function (json)
{
	var title    = 'Error';
	var priority = 'danger';
	var msg      = 'Unknown';

	try
	{
		msg  = json.Body.Fault.faultstring;
		if (json.Body.Fault.detail)
		{
			msg += ' : ' + json.Body.Fault.detail.MKSException;
		}
	}
	catch (err) {}

	$.bark({ 'title' : title, 'priority' : priority, 'message' : msg });
})
.setUsername('DefaultUsername')  // While it is not recommended to use a default
.setPassword('defaultpassword'); // username/password in this manner, it can be done
```

And then reference the scripts in the correct order on the HTML page:

**HTML**
```html
<head>
	<!-- required for jquery-bark -->
	<link rel="stylesheet" href="/css/bootstrap.min.css"> 

	<script>
		var weburl = '<%weburl%>';
	</script>

	<script src="/js/jquery.min.js"></script>
	<script src="/js/jquery.bark.js"></script>
	<script src="/js/jquery.xml2json.js"></script>
	<script src="/js/jquery.integrity.js"></script>
	<script src="/js/jquery.integrity.default-config.js"></script>
</head>
```

With this approach, a gobal username/password is set (_not recommended_) and, on both success and error, in addition to any callback method provided with a specific request, you will see a bark-message indicating success or failure of each service call.

## Request Execution Methods ##
Once the namespace has been configured, there are two ways to execute a request.

### Parameterized Verb ###

Requests can be sent directly from the namespace using the format:

```javascript
$.integrity(verb, params[, success, error, beforeSend]);
```

> The verb should be either `create`, `edit` or `get`, and the `params` object argument is expected to look slightly different in each case.

#### Params for Create and Edit ####

Creating and Editing are nearly identical, with the only exception being that `create` expects an Integrity Item Type and `edit` expects an existing Item Id. Both also expect an `ItemFields` object that contains the data to be stored.

**Create Params Object**
```javascript
{
	'Type' : 'Requirement',
	'ItemFields' : {...}
}
```

**Edit Params Object**
```javascript
{
	'ItemId' : 12345,
	'ItemFields' : {...}
}
```

Constructing the `ItemFields` object will look the same regardless of whether you are trying to create a new object or edit an existing one. The `ItemFields` object should contain one or more key/value pairs that follow this pattern:

```javascript
'ItemFields' :
{
	'field-name-in-Integrity' :
	{
		'type'  : 'integrity-field-data-type',
		'value' : [value]
	},

	'field-name-in-Integrity' :
	{
		'type'  : 'integrity-field-data-type',
		'value' : [value]
	},
	...
}
```

> Note that the field name in Integrity must be the actual field name (or valid alias), which will not necessarily match the displayed name on any given form.

Below is a list of valid field data types and what type their associated values should be.

| Type         | Value               |
|:------------ |:--------------------|
| boolean      | string (true/false) |
| date         | string              |
| dateTime     | string              |
| double       | number              |
| group        | string              |
| integer      | number              |
| longtext     | string              |
| pick         | array               |
| project      | string              |
| relationship | array               |
| shorttext    | string              |
| siProject    | string              |
| state        | string              |
| type         | string              |
| user         | array               |

#### Params for Get ####

The get verb allows you to use custom Integrity queries to retrieve data.

**Get Params Object**
```javascript
{
	'InputFld' : '',
	'QueryDef' : ''
}
```

The easiest way to build a custom query is to create a named query in Integrity, and then use the Integrity CLI to get the associated query definition and available fields.

> Reference Chapter 3 of the **Integrity 10.4 Client User Guide** to learn how to create custom Integrity queries.

Once you have created a query in Integrity, you can get the information you need by going to the command line and using the following command:

```
im viewquery --hostname=integrity --port=7001 --user=[username] "[query name]"
```

With your username and the name of your query. You may also have to change the `hostname` parameter to match your environment.

The output of that command will look like this:

```
-----------------------
Created by User Name (username) on Mon dd, YYYY hh:mm:ss AM
Modified by User Name (username) on Mon dd, YYYY hh:mm:ss AM
Name: [query name]
Description:
        [description]
Image: [image]
Is Admin: [true/false]
Shared With:
        [value]
Query Definition: (field["ID"] = 12345)
Sorted By: ID (Ascending)
Fields: ID,Summary
-----------------------
```

The values you need are labeled `Query Definition` and `Fields`.

Using the above output as an example, the `param` object for the `get` verb should look like this:

```javascript
{
	'InputFld' : 'ID,Summary',
	'QueryDef' : '(field["ID"] = 12345)'
}
```

#### Request Scoped Callbacks ####

The final three (optional) parameters are for `success`, `error` and `beforeSend` callbacks scoped for this request only. These callbacks will be executed after the universal callbacks (if any) and are passed the same parameters.

```javascript
$.integrity('edit', { ItemId : 12345, ItemFields : {...}},
function (json)
{
	console.log('request scoped success callback');
},
function (json)
{
	console.log('request scoped error callback');
},
function (params, jqxhr)
{
	console.log('request scoped beforeSend callback');
});
``` 

It should go without saying that if you want to provide an `error` or `beforeSend` callback without specifying any of the other callbacks, you simply need to pass `undefined` or `null`.

```javascript
$.integrity('edit', { ItemId : 12345, ItemFields : {...}}, undefined, undefined,
function (params, jqxhr)
{
	console.log('request scoped beforeSend callback');
});
``` 

### Explicit Verbs ###
There are named functions attached to the namespace for `create`, `edit` and `get`, all of which have the same parameters and format:

```javascript
$.integrity.[verb:create|edit|get](params[, success, error, beforeSend]);
```

and can be used just like their parameterized counterparts.

```javascript
$.integrity.create({ 'Type' : 'Requirement', 'ItemFields' : {...} });

$.integrity.edit({ 'ItemId' : '12345', 'ItemFields' : {...} });

$.integrity.get({ 'InputFld' : 'ID, Summary', 'QueryDef' : '(field[ID] = 12345)' });
```

It doesn't matter which approach you use as verb-explicit methods are simply synonyms for the verb-parameterized method.

## Demo ##

Download the `demo.html` file to test jQuery Integrity with your Integrity instance. In addition to the files in this repository, you will need:

- [jQuery](http://jquery.com/)
- [Bootstrap](http://getbootstrap.com/)
- [jQuery xml2json](https://github.com/josefvanniekerk/jQuery-xml2json)

Create a new Integrity report recipe using the contents of the `demo.html` file, updated with the correct paths to your JavaScript and CSS folders.
