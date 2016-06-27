/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global'], function ($) {
	"use strict";
	var _ParameterValidator = function (options) {
		this._errorPrefix = options.errorPrefix;
	};

	var validationInfo = {
		validationInfo: {
			type: "object",
			mandatory: true
		},
		inputToValidate: {
			type: "object",
			mandatory: true
		},
		allowUnknownProperties: "bool"
	};

	function createValidationInfo (vValidationInfo) {
		if (typeof vValidationInfo === "string") {
			return {
				type: vValidationInfo,
				mandatory: false
			};
		}

		return vValidationInfo;
	}

	_ParameterValidator.prototype = {
		validate: function (options) {
			// validate its own parameters
			this._validate({
				inputToValidate: options,
				validationInfo: validationInfo
			});
			// validate the actual parameters
			this._validate(options);
		},

		_validate: function (oOptions) {
			var mValidationInfo = oOptions.validationInfo,
				oInputToValidate = oOptions.inputToValidate,
				bAllowUnknownProperties = oOptions.allowUnknownProperties,
				aErrors = [];

			Object.keys(oInputToValidate).forEach(function (sKey) {
				var oValidationInfo = createValidationInfo(mValidationInfo[sKey]);

				if (!bAllowUnknownProperties && !oValidationInfo) {
					aErrors.push("The property '" + sKey + "' is not defined in the API");
				}
			});


			Object.keys(mValidationInfo).forEach(function (sKey) {
				var vValue = oInputToValidate[sKey],
					oValidationInfo = createValidationInfo(mValidationInfo[sKey]);


				if (oValidationInfo.mandatory && vValue === undefined) {
					aErrors.push("No '" + sKey + "' given but it is a mandatory parameter");
				}
				if (vValue === undefined) {
					// parameter undefined if it was mandatory the error is pushed already
					return;
				}

				var fnValidator = _ParameterValidator.types[oValidationInfo.type];
				var sError = fnValidator(vValue, sKey);
				if (sError) {
					aErrors.push(sError);
				}
			});

			if (aErrors.length === 1) {
				throw new Error(this._errorPrefix + " - " + aErrors[0]);
			}

			if (aErrors.length) {
				aErrors.unshift("Multiple errors where thrown " + this._errorPrefix);
				throw new Error(aErrors.join("\n"));
			}
		}
	};

	_ParameterValidator.types = {
		func : function (fnValue, sPropertyName) {
			if ($.isFunction(fnValue)) {
				return;
			}
			return "the '" + sPropertyName + "' parameter needs to be a function but '"
				+ fnValue + "' was passed";
		},
		array: function (aValue, sPropertyName) {
			if ($.isArray(aValue)) {
				return;
			}
			return "the '" + sPropertyName + "' parameter needs to be an array but '"
				+ aValue + "' was passed";
		},
		object: function (oValue, sPropertyName) {
			if ($.isPlainObject(oValue)) {
				return;
			}
			return "the '" + sPropertyName + "' parameter needs to be an object but '"
				+ oValue + "' was passed";
		},
		bool: function (bValue, sPropertyName) {
			if ($.type(bValue) === "boolean") {
				return;
			}
			return "the '" + sPropertyName + "' parameter needs to be a boolean value but '"
				+ bValue + "' was passed";
		},
		// no validation just for declaring optional and mandatory params
		any: $.noop
	};

	return _ParameterValidator;
},  /* export= */ true);