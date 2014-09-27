(function ($,undefined)
{
	/***********************************************************************************
	* Private variables                                                                *
	***********************************************************************************/
	var defaults =
	{
		url : (typeof weburl !== 'undefined') ? weburl + 'webservices/10/Integrity/' : undefined,
		appendMethodToURL : false,
		envAttributes :
		{
			'xmlns:int' : 'http://webservice.mks.com/10/Integrity',
			'xmlns:sch' : 'http://webservice.mks.com/10/Integrity/schema'
		},
		SOAPAction : '',
		enableLogging : false,
		HTTPHeaders:
		{
			"Content-Type" : "text/xml; charset=utf-8"
		}
	};

	var integrity =
	{
		'username'       : '',
		'password'       : '',
		'impersonating'  : false,
		'dateformat'     : false,
		'datetimeformat' : false
	};

	var methods =
	{
		'create' : 'int:createItem',
		'edit'   : 'int:editItem',
		'get'    : 'int:getItemsByCustomQuery'
	};


	/***********************************************************************************
	* Integrity jQuery utility functions                                               *
	***********************************************************************************/
	$.integrity = function (verb, params, success, error)
	{
		var config = {};
		$.extend(config, defaults);

		/***********************************************************************************
		* Type checking                                                                    *
		***********************************************************************************/
		if (!(/^(create|edit|get)$/i).test(verb))
		{
			throw new TypeError('Invalid verb (' + verb + ') : value must be create, edit or get');
		}

		if ((params === undefined) || (params === null))
		{
			throw new Error('Missing web service object parameters');
		}

		if (typeof params !== 'object')
		{
			throw new ReferenceError('Web service parameters must be of type object');
		}
		/**********************************************************************************/


		/***********************************************************************************
		* Modify local success method                                                      *
		***********************************************************************************/
		if (typeof success === 'function')
		{
			var scallback = config.success;
			config.success = function (soapResponse)
			{
				if (typeof scallback === 'function')
				{
					scallback.call(this, soapResponse);
				}
				success.call(this, soapResponse);
			}
		}
		/**********************************************************************************/


		/***********************************************************************************
		* Modify local error method                                                        *
		***********************************************************************************/
		if (typeof error === 'function')
		{
			var ecallback = config.error;
			config.error = function (soapResponse)
			{
				if (typeof ecallback === 'function')
				{
					ecallback.call(this, soapResponse);
				}
				error.call(this, soapResponse);
			}
		}
		/**********************************************************************************/

		config.data = envelope(verb, params);
		return $.soap(config);
	};

	$.integrity.create = function (params, success, error)
	{
		$.integrity('create', params, success, error);
	};

	$.integrity.edit = function (params, success, error)
	{
		$.integrity('edit', params, success, error);
	};

	$.integrity.get = function (params, success, error)
	{
		$.integrity('get', params, success, error);
	};

	$.integrity.getUrl = function ()
	{
		return defaults.url;
	};

	$.integrity.setUrl = function (url)
	{
		defaults.url = url;
		return $.integrity;
	};

	$.integrity.setCallback = function (type, callback)
	{
		if ((/^(success|error|beforeSend)$/).test(type))
		{
			if (typeof callback === 'function')
			{
				defaults[type] = callback;
			}
			else
			{
				throw new ReferenceError('Invalid callback (' + (typeof callback) + ') : value must be of type function');
			}

			return $.integrity;
		}
		else
		{
			throw new TypeError('Invalid callback type (' + type + ') : value must be success or error');
		}
	};

	$.integrity.setDefault = function(key, value)
	{
		if (!(/^(url|success|error|beforeSend)$/i).test(key))
		{
			if ((/^(username|password|impersonating|datetime|datetimeformat)$/).test(key))
			{
				integrity[key] = value;
			}
			else
			{
				defaults[key] = value;
			}
		}
		else
		{
			throw new Error('Cannot set ' + key + ' using setDefault method');
		}

		return $.integrity;
	}

	$.integrity.getDefault = function(key)
	{
		if ((/^(username|password|impersonating|dateformat|datetimeformat)$/).test(key))
		{
			return integrity[key];
		}

		return defaults[key];
	}

	$.integrity.logging =
	{
		'on' : function ()
		{
			defaults.enableLogging = true;
		},

		'off' : function ()
		{
			defaults.enableLogging = false;
		}
	};


	/***********************************************************************************
	* Private functions                                                                *
	***********************************************************************************/
	function envelope(verb, params)
	{
		verb       = verb.toLowerCase();
		var method = methods[verb];
		var env    = [];

		env.push('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:int="http://webservice.mks.com/10/2/Integrity" xmlns:sch="http://webservice.mks.com/10/2/Integrity/schema">');
		env.push('<soapenv:Header/>');
		env.push('<soapenv:Body>');
		env.push('<' + method + '>');

		switch(verb)
		{
			case 'create' :
				env.push('<arg0 Type="' + params.Type + '">');
				break;
			case 'edit' :
				env.push('<arg0 sch:ItemId="' + params.ItemId + '">');
				break;
			case 'get' :
				env.push('<arg0>');
				break;
		}

		env.push('<sch:Username>' + integrity.username + '</sch:Username>');
		env.push('<sch:Password>' + integrity.password + '</sch:Password>');

		if (integrity.impersonating)
		{
			env.push('<sch:ImpersonatedUser>' + integrity.impersonating + '</sch:ImpersonatedUser>');
		}

		if (integrity.dateformat)
		{
			env.push('<sch:DateFormat>' + integrity.dateformat + '</sch:DateFormat>');
		}

		if (integrity.datetimeformat)
		{
			env.push('<sch:DateTimeFormat>' + integrity.datetimeformat + '</sch:DateTimeFormat>');
		}

		switch(verb)
		{
			case 'get':
				env.push('<sch:InputField>' + obj.InputFld + '</sch:InputField>');
				env.push('<sch:QueryDefinition>' + obj.QueryDef + '</sch:QueryDefinition>');
				break;
			default:
				env.push(gettags(params));
		}

		env.push('</arg0>');
		env.push('</' + method + '>');
		env.push('</soapenv:Body>');
		env.push('</soapenv:Envelope>');

		return env.join('');
	}


	function gettags (params)
	{
		var tags = [];

		for (var key in params.ItemFields)
		{
			if (params.ItemFields.hasOwnProperty(key))
			{
				var type  = params.ItemFields[key].type;
				var value = params.ItemFields[key].value;

				switch (type)
				{
					case 'state':
					case 'type':
						tags.push('<sch:ItemField Name="' + key + '"><sch:' + type + '>' + value + '</sch:' + type + '></sch:ItemField>');
						break;
					case 'pick':
					case 'relationship':
						var tag = [];

						tag.push('<sch:ItemField Name="' + key + '"><sch:' + type + '>');

						if (value !== undefined)
						{
							for (var i = 0, l = value.length; i < l; i += 1)
							{
								tag.push('<sch:value>' + value[i] + '</sch:value>');
							}
						}

						tag.push('</sch:' + type + '></sch:ItemField>');
						tags.push(tag.join(''));
						break;
					case 'user':
						tags.push('<sch:ItemField Name="' + key + '"><sch:' + type + '><sch:value>' + value.join(",") + '</sch:value></sch:' + type + '></sch:ItemField>');
						break;
					case 'boolean':
					case 'date':
					case 'dateTime':
					case 'double':
					case 'group':
					case 'integer':
					case 'project':
					case 'shorttext':
					case 'siProject':
					case 'longtext':
					default:
						tags.push('<sch:ItemField Name="' + key + '"><sch:' + type + '><sch:value>' + value + '</sch:value></sch:' + type + '></sch:ItemField>');
						break;
				}
			}
		}

		return tags.join('');
	}

	function getattachments (obj)
	{
		var tag = [];

		tag.push("<sch:Attachment>");
		tag.push("<sch:Name>?</sch:Name>");
		tag.push("<sch:Field>?</sch:Field>");
		tag.push("<sch:Description>?</sch:Description>");
		tag.push("<sch:Attachment>?</sch:Attachment>");
		tag.push("</sch:Attachment>");

		return tag.join('');
	}
})(jQuery);