/***********************************************************************************
* Polyfill for btoa and atob                                                       *
***********************************************************************************/
;(function ()
{
	var object = typeof exports != 'undefined' ? exports : this; // #8: web workers
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

	function InvalidCharacterError(message)
	{
		this.message = message;
	}

	InvalidCharacterError.prototype = new Error;
	InvalidCharacterError.prototype.name = 'InvalidCharacterError';

	// encoder
	// [https://gist.github.com/999166] by [https://github.com/nignag]
	object.btoa || (
	object.btoa = function (input)
	{
		var str = String(input);
		for (var block, charCode, idx = 0, map = chars, output = ''; str.charAt(idx | 0) || (map = '=', idx % 1); output += map.charAt(63 & block >> 8 - idx % 1 * 8))
		{
			charCode = str.charCodeAt(idx += 3/4);
			if (charCode > 0xFF)
			{
				throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
			}

			block = block << 8 | charCode;
		}

		return output;
	});

	// decoder
	// [https://gist.github.com/1020396] by [https://github.com/atk]
	object.atob || (
	object.atob = function (input)
	{
		var str = String(input).replace(/=+$/, '');
		if (str.length % 4 == 1)
		{
			throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
		}

		for (var bc = 0, bs, buffer, idx = 0, output = ''; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0)
		{
			buffer = chars.indexOf(buffer);
		}

		return output;
	});
}());
/**********************************************************************************/


(function ($,undefined)
{
	/***********************************************************************************
	* Private properties                                                               *
	***********************************************************************************/
	var defaults =
	{
		url: (typeof weburl !== 'undefined') ? weburl + 'webservices/10/Integrity/' : null,
		type: 'POST',
		contentType : 'text/xml; charset=utf-8',
		processData: false,
		dataType: 'xml',
		headers:
		{
			SOAPAction : ''
		}
	};

	var integrity =
	{
		username       : '',
		password       : '',
		impersonating  : false,
		dateformat     : false,
		datetimeformat : false
	};

	var methods =
	{
		'create' : 'int:createItem',
		'edit'   : 'int:editItem',
		'get'    : 'int:getItemsByCustomQuery'
	};
	/**********************************************************************************/



	/***********************************************************************************
	* API                                                                              *
	***********************************************************************************/
	$.integrity = function (verb, params, success, error, beforeSend)
	{
		var config = {};
		$.extend(config, defaults);
		var url = config.url;
		delete config.url;

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
		var scallback = config.success;
		config.success = function (data, status, jqxhr)
		{
			var json = $.xml2json(data);

			if (typeof scallback === 'function')
			{
				scallback.call(this, json);
			}

			if (typeof success === 'function')
			{
				success.call(this, json);
			}
		}
		/**********************************************************************************/


		/***********************************************************************************
		* Modify local error method                                                      *
		***********************************************************************************/
		var fcallback = config.error;
		config.error = function (jqxhr, status, errortxt)
		{
			var json = (jqxhr.responseXML) ? $.xml2json(jqxhr.responseXML) : (jqxhr.responseText) ? $.xml2json(jqxhr.responseText) : {};

			if (typeof fcallback === 'function')
			{
				fcallback.call(this, json);
			}

			if (typeof error === 'function')
			{
				error.call(this, json);
			}
		}
		/**********************************************************************************/


		/***********************************************************************************
		* Modify local beforeSend method                                                   *
		***********************************************************************************/
		var bscallback = config.beforeSend;
		config.beforeSend = function (jqxhr, params)
		{
			params.toString = function ()
			{
				if (typeof params.data === 'string')
				{
					return params.data;
				}
				if ($.isXMLDoc(params.data))
				{
					return dom2string(params.data);
				}
			};

			if (typeof bscallback === 'function')
			{
				bscallback.call(params, jqxhr, params);
			}

			if (typeof beforeSend === 'function')
			{
				return beforeSend.call(params, jqxhr, params);
			}
		}
		/**********************************************************************************/

		config.data = envelope(verb, params);
		return $.ajax(url, config);
	};

	$.integrity.create = function (params, success, error, beforeSend)
	{
		return $.integrity('create', params, success, error, beforeSend);
	};

	$.integrity.edit = function (params, success, error, beforeSend)
	{
		return $.integrity('edit', params, success, error, beforeSend);
	};

	$.integrity.get = function (params, success, error, beforeSend)
	{
		return $.integrity('get', params, success, error, beforeSend);
	};

	$.integrity.success = function (callback)
	{
		if (typeof callback === 'function')
		{
			defaults.success = callback;
		}
		return $.integrity;
	};

	$.integrity.error = function (callback)
	{
		if (typeof callback === 'function')
		{
			defaults.error = callback;
		}
		return $.integrity;
	};

	$.integrity.beforeSend = function (callback)
	{
		if (typeof callback === 'function')
		{
			defaults.beforeSend = callback;
		}
		return $.integrity;
	};

	$.integrity.setUrl = function (url)
	{
		if (typeof url === 'string')
		{
			defaults.url = url;
		}

		return $.integrity;
	};

	$.integrity.getUrl = function ()
	{
		return defaults.url;
	};

	$.integrity.setUsername = function (username)
	{
		if (typeof username === 'string')
		{
			integrity.username = username;
		}

		return $.integrity;
	};

	$.integrity.setPassword = function (password)
	{
		if (typeof password === 'string')
		{
			integrity.password = password;
		}

		return $.integrity;
	};

	$.integrity.credentials = function (callback)
	{
		if ((integrity.username) && (integrity.password))
		{
			if (typeof callback === 'function')
			{
				callback.call(this);
			}
		}
		else
		{
			var username = localStorage.getItem('credentials-username') || '';
			var password = sessionStorage.getItem('credentials-password');

			if ((username) && (password))
			{
				integrity.username = username;
				integrity.password = atob(password);

				if (typeof callback === 'function')
				{
					callback.call(this);
				}
			}
			else
			{
				/***********************************************************************************
				* Add the credentials modal dialog as needed                                       *
				***********************************************************************************/
				if (!(document.getElementById('modal-credentials')))
				{
					var afun = (username) ? '' : ' autofocus';
					var afpw = (username) ? ' autofocus' : '';

					var modal =
						'<div id="modal-credentials" class="modal fade">' +
							'<div class="modal-dialog">' +
								'<div class="modal-content">' +
									'<form id="credentials-form">' +
										'<div class="modal-header">' +
											'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
											'<h4 class="modal-title">Integrity Credentials</h4>' +
										'</div>' +
										'<div class="modal-body">' +
											'<div class="container">' +
												'<div class="col-lg-3">' +
													'<fieldset id="credentials-inputs">' +
														'<div>' +
															'<label for="credentials-username">Username</label>' +
															'<input class="form-control" type="text" id="credentials-username"' + afun + '>' +
														'</div>' +
														'<div>' +
															'<label for="credentials-password">Password</label>' +
															'<input class="form-control" type="password" id="credentials-password"' + afpw + '>' +
														'</div>' +
													'</fieldset>' +
												'</div>' +
											'</div>' +
										'</div>' +
										'<div class="modal-footer">' +
											'<fieldset id="credentials-buttons">' +
												'<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
												'<button type="submit" class="btn btn-primary has-spinner" id="credentials-continue">' +
													'<i class="glyphicon glyphicon-refresh spinner"></i> Continue' +
												'</button>' +
											'</fieldset>' +
										'</div>' +
									'</form>' +
								'</div>' +
							'</div>' +
						'</div>';

					$('body').append(modal);

					$('#credentials-inputs input').on('focus', function(evt)
					{
						$(evt.target).parent().removeClass('has-error');
					});
				}
				/**********************************************************************************/


				/***********************************************************************************
				* Set up the blank request for verifying credentials                               *
				***********************************************************************************/
				var request =
					'<?xml version="1.0" encoding="UTF-8"?>' +
					'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:int="http://webservice.mks.com/10/Integrity" xmlns:sch="http://webservice.mks.com/10/Integrity/schema">' +
						'<soapenv:Header/>' +
						'<soapenv:Body>' +
							'<int:editItem>' +
								'<arg0 sch:ItemId="29">' +
									'<sch:Username>%username%</sch:Username>' +
									'<sch:Password>%password%</sch:Password>' +
								'</arg0>' +
							'</int:editItem>' +
						'</soapenv:Body>' +
					'</soapenv:Envelope>';
				/**********************************************************************************/


				/***********************************************************************************
				* Continue button on-click event handler                                           *
				***********************************************************************************/
				$('#credentials-form').off();
				$('#credentials-form').on('submit', function(e)
				{
					e.preventDefault();
					var username = $('#credentials-username').val();
					var password = $('#credentials-password').val();

					if ((username) && (password))
					{
						$('#credentials-continue').addClass('active');
						$('#credentials-inputs').prop('disabled', true);
						$('#credentials-buttons').prop('disabled', true);

						$.ajax(defaults.url,
						{
							type        : 'POST',
							contentType : 'text/xml; charset=utf-8',
							processData : false,
							dataType    : 'xml',
							headers     :
							{
								SOAPAction : ''
							},
							data        : request.replace('%username%', username).replace('%password%', password),
							success     : function ()
							{
								localStorage.setItem('credentials-username', username);
								sessionStorage.setItem('credentials-password', btoa(password));

								integrity.username = username;
								integrity.password = password;

								$('#credentials-form').off();
								$('#modal-credentials').modal('hide');
								$('#credentials-continue').removeClass('active');
								$('#credentials-inputs').prop('disabled', false);
								$('#credentials-buttons').prop('disabled', false);
								$('#credentials-username').value = '';
								$('#credentials-password').value = '';

								if (typeof callback === 'function')
								{
									callback.call();
								}
							},
							error       : function ()
							{
								$('#credentials-continue').removeClass('active');
								$('#credentials-inputs').prop('disabled', false);
								$('#credentials-buttons').prop('disabled', false);
								$('#credentials-username').parent().addClass('has-error');
								$('#credentials-password').parent().addClass('has-error');
							}
						});
					}
					else
					{
						if (!username)
						{
							$('#credentials-username').parent().addClass('has-error');
						}

						if (!password)
						{
							$('#credentials-password').parent().addClass('has-error');
						}
					}
				});
				/**********************************************************************************/

				$('#credentials-username').parent().removeClass('has-error').val(username);
				$('#credentials-password').parent().removeClass('has-error').val('');
				$('#credentials-username').val(username);
				$('#credentials-username').focus();
				$('#credentials-password').val('');
				$('#modal-credentials').modal('show');
			}
		}
	};
	/**********************************************************************************/



	/***********************************************************************************
	* Private utility functions                                                        *
	***********************************************************************************/
	function dom2string (dom)
	{
		if (typeof XMLSerializer!=="undefined")
		{
			return new window.XMLSerializer().serializeToString(dom);
		}
		else
		{
			return dom.xml;
		}
	}

	function envelope(verb, params)
	{
		verb       = verb.toLowerCase();
		var method = methods[verb];
		var env    = [];

		env.push('<?xml version="1.0" encoding="UTF-8"?>');
		env.push('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:int="http://webservice.mks.com/10/Integrity" xmlns:sch="http://webservice.mks.com/10/Integrity/schema">');
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
	/**********************************************************************************/



	/***********************************************************************************
	* Add credential styles                                                            *
	***********************************************************************************/
	var styles = [];

	styles.push('.spinner');
	styles.push('{');
	styles.push('	display: none;');
	styles.push('	opacity: 0;');
	styles.push('	max-width: 0;');
	styles.push('	-webkit-transition: opacity 0.25s, max-width 0.45s;');
	styles.push('	-moz-transition: opacity 0.25s, max-width 0.45s;');
	styles.push('	-o-transition: opacity 0.25s, max-width 0.45s;');
	styles.push('	transition: opacity 0.25s, max-width 0.45s;');
	styles.push('}');

	styles.push('.has-spinner.active .spinner');
	styles.push('{');
	styles.push('	display: inline-block;');
	styles.push('	opacity: 1;');
	styles.push('	max-width: 50px;');
	styles.push('	-webkit-transform-origin: 50% 50%;');
	styles.push('	transform-origin:50% 50%;');
	styles.push('	-ms-transform-origin:50% 50%;');
	styles.push('	-webkit-animation: spin .75s infinite linear;');
	styles.push('	-moz-animation: spin .75s infinite linear;');
	styles.push('	-o-animation: spin .75s infinite linear;');
	styles.push('	animation: spin .75s infinite linear;');
	styles.push('}');

	styles.push('@-moz-keyframes spin');
	styles.push('{');
	styles.push('	from { -moz-transform: rotate(0deg); }');
	styles.push('	to { -moz-transform: rotate(360deg); }');
	styles.push('}');

	styles.push('@-webkit-keyframes spin');
	styles.push('{');
	styles.push('	from { -webkit-transform: rotate(0deg); }');
	styles.push('	to { -webkit-transform: rotate(360deg); }');
	styles.push('}');

	styles.push('@keyframes spin');
	styles.push('{');
	styles.push('	from { transform: rotate(0deg); }');
	styles.push('	to { transform: rotate(360deg); }');
	styles.push('}');

	$('document').ready(function ()
	{
		$('\n\t<style type="text/css">\n\t\t' + styles.join('\n\t\t') + '\n\t</style>\n').appendTo($('head'));
	});
	/**********************************************************************************/

})(jQuery);
