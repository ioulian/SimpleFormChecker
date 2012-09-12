/*!
 *	@author Ioulian Alexeev
 *	@date 08.11.2011
 *	@description Fast and versatile form checker script.
 *	@version 0.1.9
 */

/**
 * SimpleFormChecker main class
 */
function Sfc(form, options, $) {
	"use strict";

	/**
	* Regex checks
	*
	* To add a new check, just duplicate any of these objects and change the values
	* Don't forget about the comma ;)
	*/
	this.checks = [
		/**
		* Checks for email adresses. This validates most of the email adresses
		*/
		{
			Id : "Email",
			Class : "email",
			ErrorText : "This must be a valid email address",
			check : function (self, object) {
				return (/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/i).test($(object).val()) ? true : self.ErrorText;
			}
		},
		/**
		* Checks for url
		*/
		{
			Id : "Url",
			Class : "url",
			ErrorText : "This must be a valid url",
			check : function (self, object) {
				return (/(^|\s)((https?:\/\/)?[\w\-]+(\.[\w\-]+)+\.?(:\d+)?(\/\S*)?)/i).test($(object).val()) ? true : self.ErrorText;
			}
		},
		/**
		* Checks for IPv4
		*
		* Valid string(s): ###.###.###.###
		*/
		{
			Id : "Ip",
			Class : "ip",
			ErrorText : "This must be a valid IP number",
			check : function (self, object) {
				return (/^((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))*$/i).test($(object).val()) ? true : self.ErrorText;
			}
		},
		/**
		* Only numbers are allowed
		*/
		{
			Id : "Number",
			Class : "number",
			ErrorText : "This must contain only numbers",
			check : function (self, object) {
				return (/^[0-9]*$/i).test($(object).val()) ? true : self.ErrorText;
			}
		},
		/**
		* Only characters are allowed
		*/
		{
			Id : "Characters",
			Class : "characters",
			ErrorText : "This must contain only characters",
			check : function (self, object) {
				return (/^[a-zA-Z]*$/i).test($(object).val()) ? true : self.ErrorText;
			}
		},
		/**
		* Characters and digits
		*/
		{
			Id : "Alphanumeric",
			Class : "alphanumeric",
			ErrorText : "This must contain only alphanumeric characters",
			check : function (self, object) {
				return (/^[a-zA-Z0-9]*$/i).test($(object).val()) ? true : self.ErrorText;
			}
		},
		/**
		* Checks for day
		*
		* Valid string(s): 01-31
		*/
		{
			Id : "Day",
			Class : "day",
			ErrorText : "This must be a valid day",
			check : function (self, object) {
				return (/^([1-9]|[1-2][0-9]|3[01])$/i).test($(object).val()) ? true : self.ErrorText;
			}
		},
		/**
		* Checks for month
		*
		* Valid string(s): 01-31
		*/
		{
			Id : "Month",
			Class : "month",
			ErrorText : "This must be a valid month",
			check : function (self, object) {
				return (/^(([0]{0,1}[1-9])|(1[0-2]))$/i).test($(object).val()) ? true : self.ErrorText;
			}
		},
		/**
		* Checks for year
		*
		* Valid string(s): 1900 - 2099
		*/
		{
			Id : "Year",
			Class : "year",
			ErrorText : "This must be a valid year",
			check : function (self, object) {
				return (/^(19|20)\d\d$/i).test($(object).val()) ? true : self.ErrorText;
			}
		},
		/**
		* Checks for normal date
		*
		* Valid string(s): DD MM YYYY || DD-MM-YYYY || DD/MM/YYYY || DD.MM.YYYY
		*/
		{
			Id : "Date",
			Class : "date",
			ErrorText : "This must be a valid date (DD/MM/YYYY)",
			check : function (self, object) {
				return (/^((0?[1-9]|[12][0-9]|3[01])[\- \/.](0?[1-9]|1[012])[\- \/.](19|20)?[0-9]{2})*$/i).test($(object).val()) ? true : self.ErrorText;
			}
		},
		/**
		* Checks for US formatted date
		*
		* Valid string(s): MM DD YYYY || MM-DD-YYYY || MM/DD/YYYY || MM.DD.YYYY
		*/
		{
			Id : "UsDate",
			Class : "usdate",
			ErrorText : "This must be a valid date (MM/DD/YYYY)",
			check : function (self, object) {
				return (/^((0?[1-9]|1[012])[\- \/.](0?[1-9]|[12][0-9]|3[01])[\- \/.](19|20)?[0-9]{2})*$/i).test($(object).val()) ? true : self.ErrorText;
			}
		},
		/**
		* Checks for date formatted for database
		*
		* Valid string(s): YYYY-MM-DD
		*/
		{
			Id : "MysqlDate",
			Class : "mysqldate",
			ErrorText : "This must be a valid date (YYYY-MM-DD)",
			check : function (self, object) {
				return (/^((19|20)?[0-9]{2}[\-](0?[1-9]|1[012])[\-](0?[1-9]|[12][0-9]|3[01]))*$/i).test($(object).val()) ? true : self.ErrorText;
			}
		},
		/**
		* Use class "length"
		* Add these attributes for check options:
		*  - data-min="###" : Minimum characters
		*  - data-max="###" : Maximum characters
		*  - data-counter="xxx" : Counter id
		*/
		{
			Id : "Length",
			Class : "length",
			MinErrorText : "The minimum required number of characters is [[allowed]]",
			MaxErrorText : "The maximum allowed number of characters is [[allowed]]",
			MinMaxErrorText : "The number of characters must be between [[min]] and [[max]]",
			EqualErrorText : "The number of characters must be [[allowed]]",
			CounterTextMax : "[[current]] <= [[max]]",
			CounterTextMin : "[[current]] >= [[min]]",
			CounterTextMinMax : "[[min]] <= [[current]] <= [[max]]",
			CounterTextEqual : "[[current]] == [[equal]]",
			check : function (self, object, updateCounterOnly) {
				var counter,
					toReturn = true,
					counterText = "",
					maxChars = parseInt($(object).data("max"), 10),
					minChars = parseInt($(object).data("min"), 10);

				// Set the default to false
				updateCounterOnly = (typeof updateCounterOnly === "undefined") ? false : updateCounterOnly;

				// Check what the user wants
				if (!isNaN(maxChars) && isNaN(minChars)) {
					// Only maxChars are defined
					if ($(object).val().length > maxChars) {
						toReturn = self.MaxErrorText.replace("[[allowed]]", maxChars);
						counterText = self.CounterTextMax;
					}
				} else if (!isNaN(minChars) && isNaN(maxChars)) {
					// Only minChars are defined
					if ($(object).val().length < minChars) {
						toReturn = self.MinErrorText.replace("[[allowed]]", minChars);
						counterText = self.CounterTextMin;
					}
				} else if (!isNaN(maxChars) && !isNaN(minChars)) {
					// Both are defined
					if (minChars >= 0) {
						// Minchars is greater than or equal to 0
						if (maxChars > minChars) {
							// maxChars should be always be greater than minChars
							if (!($(object).val().length >= minChars && $(object).val().length <= maxChars)) {
								toReturn = self.MinMaxErrorText.replace("[[min]]", minChars).replace("[[max]]", maxChars);
								counterText = self.CounterTextMinMax;
							}
						} else if (maxChars === minChars) {
							// If they are the same, consider the developer wants a string of a given length
							if ($(object).val().length !== minChars) {
								toReturn = self.EqualErrorText.replace("[[allowed]]", minChars);
								counterText = self.CounterTextEqual;
							}
						}
					}
				}

				// We check the id
				counter = $($(object).data("counter"));
				// Check if there's a counter container on the page.
				if ($(counter).length > 0) {
					$(counter).text(
						counterText
							.replace("[[min]]", minChars)
							.replace("[[current]]", $(object).val().length)
							.replace("[[max]]", maxChars)
							.replace("[[equal]]", maxChars)
					);

					if (toReturn !== true) {
						counter.addClass("error");
					} else {
						counter.removeClass("error");
					}
				}

				if (!updateCounterOnly) {
					return toReturn;
				}
			}
		},
		/**
		* Identical
		* Add this attribute for check options:
		*  - data-equalto="xxx" : Id of the field you want the current field to be identical to
		*/
		{
			Id : "Identical",
			Class : "identical",
			ErrorText : "These fields must match",
			check : function (self, object) {
				var equalTo = $($(object).data("equalto"));
				if (equalTo.length === 0) {
					return true;
				}

				return ($(equalTo).val() === $(object).val()) ? true : self.ErrorText;
			}
		},
		/**
		* Password strength
		* Add this attribute for check options:
		*  - data-desc="xxx" : Id of the element where to display the strength
		*  - data-minstrength="###" : Minimum strength to pass 0 - Max notifications
		*
		* See:
		* http://codeassembly.com/How-to-make-a-password-strength-meter-for-your-register-form/
		*/
		{
			Id : "PasswordStrength",
			Class : "strength",
			ErrorText : "Your password is too weak",
			Notifications : [
				"Very weak",
				"Weak",
				"Better",
				"Medium",
				"Strong",
				"Strongest"
			],
			check : function (self, object, updateCounterOnly) {
				var score = 0,
					value = $(object).val(),
					descContainer = $($(object).data("desc")),
					minStrength = parseInt($(object).data("minstrength"), 10);

				updateCounterOnly = (typeof updateCounterOnly === "undefined") ? false : updateCounterOnly;

				// Password longer than 6 chars
				score += (value.length > 6) ? 1 : 0;
				// Uses lower and uppercase characters
				score += (value.match(/[a-z]/) && value.match(/[A-Z]/)) ? 1 : 0;
				// At least one digit
				score += (value.match(/\d+/)) ? 1 : 0;
				// At least one special character
				score += (value.match(/\.[!,@,#,$,%,\^,&,*,?,_,~,-,(,)]/)) ? 1 : 0;
				// Password longer than 12 chars
				score += (value.length > 12) ? 1 : 0;

				// Update notification
				if ($(descContainer).length === 1) {
					$(descContainer).text(self.Notifications[score])
						.removeClass()
						.addClass("strength" + score);
				}

				// Add error
				if (typeof minStrength !== "undefined" && !updateCounterOnly) {
					if (score < minStrength) {
						return self.ErrorText;
					}
				}

				return true;
			}
		},
		/**
		 * Checks checkboxes or radio buttons for at least one selected input
		 */
		{
			Id : "CheckBoxCount",
			Class : "count",
			ErrorText : "Please select at least one value",
			check : function (self, object) {
				var atLeastOneSelected = false;
				$(object).find("input[type=\"checkbox\"], input[type=\"radio\"]").each(function () {
					if (typeof $(this).attr("checked") !== "undefined") {
						atLeastOneSelected = true;
						return false;
					}
				});

				return atLeastOneSelected;
			}
		}
	];

	/**
	* Default options
	*
	* You can set these options by passing params.
	* They are read only by the code
	*/
	this.settings = {
		// Asterix that is shown for required fields
		// You can leave this empty if you don't want asterixes to be shown
		asterix : "<span class=\"asterix\">*</span>",
		// Error message that is displayed for invalid fields
		// ([[text]] will be replaced with actual text)
		// You can leave this empty if you don't want the error message to be shown
		errorMessage : "<p class=\"errorMessage\">[[text]]</p>",

		// Class that defines required fields
		requiredClass : "required",
		// Class that will be added to the input if it is not valid
		errorClass : "error",
		// Class that will be added to the form if the input is not filled in,
		// used with labels inside the input field
		emptyClass : "empty",

		// Check field on change
		checkOnChange : true,
		// Update info for (some) fields (like length, password strength, ...)
		updateOnType : true,

		// Scroll to the error field
		scrollToErrorField : true,

		// Slide animations time
		animationTime : 250,
		// Scroll to top animation time
		scrollTime : 500,

		// If true all the binded events on the form are only triggered
		// when form has completed its check and is valid.
		// If set to false, the events will be left unchanged
		blockEvents : true,

		// Error messages
		emptyErrorText : "This field is required",
		formErrorText : "Please check the highlighted fields"
	};

	/**
	* Variables
	*
	* These variables are used by the code
	*/
	this.originalEvents = {
		submit : []
	};
	this.formSubmitEvent = null;
	this.errorField = null;
	this.error = false;
	this.inputsToCheck = [
		"input",
		"select",
		"textarea",
		"div.count"
	];

	this.form = form;
	// Set options
	this.extendOptions(options);
	// Init logic
	this.init();
}

/**
* Initialise
*
* - Add asterix on the fields where it is needed
* - Set the form to validate on a field change
* - Validate the form on submit
* - Checks a field length on keyup
*/
Sfc.prototype.init = function () {
	var i, l,
		self = this;

	// Loop
	for (i = 0, l = this.inputsToCheck.length; i < l; i += 1) {
		$(this.form).find(this.inputsToCheck[i]).each(function () {
			// Add asterixes
			if (self.settings.asterix !== "") {
				if ($(this).hasClass(self.settings.requiredClass)) {
					$(this).parent(":first")
						.append(self.settings.asterix);
				}
			}

			// Validate field on change (check if it is needed)
			if (self.settings.checkOnChange) {
				$(this).on("change", function () {
					self.checkField(this);
				});
			}

			// These are only needed on inputs
			if (self.inputsToCheck[i] === "input") {
				if (self.settings.updateOnType) {
					// Check length of fields
					if ($(this).hasClass(self.getCheck("Length").Class)) {
						$(this).on("keyup", function () {
							self.getCheck("Length").check(self.getCheck("Length"), this, true);
						});

						// Also update counter on start
						self.getCheck("Length").check(self.getCheck("Length"), this, true);
					}

					// Check password strength on type
					if ($(this).hasClass(self.getCheck("PasswordStrength").Class)) {
						$(this).on("keyup", function () {
							self.getCheck("PasswordStrength").check(self.getCheck("PasswordStrength"), this, true);
						});
					}
				}
			}

			if (self.inputsToCheck[i] === "input" ||
					self.inputsToCheck[i] === "textarea") {
				// Display prefilled help text
				$(this).on("blur", function () {
					self.displayFieldTitle(this);
				}).on("focus", function () {
					self.clearFieldTitle(this);
				});
				self.displayFieldTitle(this);
			}
		});
	}

	// Save original events to trigger them later
	if (this.settings.blockEvents === true) {
		if (typeof $._data(this.form, "events") !== "undefined") {
			$($._data(this.form, "events").submit).each(function (index) {
				self.originalEvents.submit[index] = {
					handler : this.handler
				};
			});
		}
		
		this.removeOriginalEvents();
	}
	
	// Validate on submit
	this.formSubmitEvent = function (e) {
		return self.checkForm(e);
	};
	$(this.form).on("submit", this.formSubmitEvent);
};

Sfc.prototype.removeOriginalEvents = function () {
	var i, l;

	for (i = 0, l = this.originalEvents.submit.length; i < l; i += 1) {
		if (typeof this.originalEvents.submit[i].handler !== "undefined") {
			$(this.form).off("submit", this.originalEvents.submit[i].handler);
		}
	}
};

Sfc.prototype.addOriginalEvents = function () {
	var i, l;

	for (i = 0, l = this.originalEvents.submit.length; i < l; i += 1) {
		if (typeof this.originalEvents.submit[i].handler !== "undefined") {
			$(this.form).on("submit", this.originalEvents.submit[i].handler);
		}
	}
};

Sfc.prototype.displayFieldTitle = function (input) {
	if (typeof $(input).attr('title') !== "undefined" && $(input).val() === "") {
		$(input).addClass(this.settings.emptyClass);
		$(input).val($(input).attr('title'));
	}
};

Sfc.prototype.clearFieldTitle = function (input) {
	if ($(input).val() === $(input).attr('title')) {
		$(input).removeClass(this.settings.emptyClass);
		$(input).val("");
	}
};

/**
* Sets the options
*
* @param Options-object
*/
Sfc.prototype.extendOptions = function (options) {
	// Extend settings
	if (typeof options.settings !== "undefined") {
		$.extend(this.settings, options.settings);
	}

	// Extend checks
	if (typeof options.checks !== "undefined") {
		// Internal check handling is different than the one you pass
		// You need to pass the Id of the check as array key
		for (check in options.checks) {
			if (this.getCheck(check) !== null) {
				$.extend(this.getCheck(check), options.checks[check]);
			}
		}
		
	}
};

/**
 * Gets check by name
 * @param  string id Check Id
 * @return Object or null
 */
Sfc.prototype.getCheck = function (id) {
	var i, l;

	for (i = 0, l = this.checks.length; i < l; i += 1) {
		if (this.checks[i].Id === id) {
			return this.checks[i];
		}
	}

	return null;
};

/**
* Checks the form
*
* @param object Form that's need to be checked
* @return bool Form valid?
*/
Sfc.prototype.checkForm = function (e) {
	var i, l,
		self = this;

	// Reset
	this.error = false;
	this.errorField = null;

	// Check each input
	for (i = 0, l = this.inputsToCheck.length; i < l; i += 1) {
		$(this.form).find(this.inputsToCheck[i]).each(function () {
			self.clearFieldTitle(this);
			self.checkField(this);
			self.displayFieldTitle(this);
		});
	}

	// Don't submit the form if there's a error
	if (this.error) {
		if (this.settings.scrollToErrorField) {
			this.scrollToErrorField();
		}

		// Message if form is not valid
		$($(this.form).data("err-elm")).text(this.settings.formErrorText);

		e.preventDefault();
		return false;
	}
	
	for (i = 0, l = this.inputsToCheck.length; i < l; i += 1) {
		$(this.form).find(this.inputsToCheck[i]).each(function () {
			self.clearFieldTitle(this);
		});
	}

	if (this.settings.blockEvents === true) {
		// Remove this function (prevent endless loop)
		$(this.form).off("submit", this.formSubmitEvent);
		// Add original event listeners to the form
		this.addOriginalEvents();
		// Trigger them
		$(this.form).trigger("submit");
		// Remove them
		this.removeOriginalEvents();
		// Now bind the form submit event
		$(this.form).on("submit", this.formSubmitEvent);

		// We prevent the form to be submitted
		// if there are any other events binded to it
		if (this.originalEvents.submit.length > 0) {
			e.preventDefault();
			return false;
		}
	}
};

Sfc.prototype.scrollToErrorField = function () {
	var self = this;
	// Animate to top?
	$("html, body").animate({
		scrollTop : $(self.errorField).offset().top
	}, this.settings.scrollTime);

	// Focus on the first error field
	$(this.errorField).focus();
};

/**
* Checks current field on added classes and validates the field based on them
*
* @param object Field to check
*/
Sfc.prototype.checkField = function (object) {
	var i, l, checkStatus, radioGroup, somethingChecked,
		fieldRequired = $(object).hasClass("required"),
		err = false;

	// Check if field is filled in (or selected/checked)
	if (fieldRequired) {
		if ($(object).attr("type") === "checkbox" && $(object).attr("checked") !== "checked") {
			err = this.addError(object, this.settings.emptyErrorText);
		} else if ($(object).attr("type") === "radio") {
			// Find all radio's that are in a group
			radioGroup = $(this.form).find("input[name=\"" + $(object).attr("name") + "\"]");

			// Check if any of the radio buttons is checked
			somethingChecked = false;
			for (i = 0, l = radioGroup.length; i < l; i += 1) {
				if ($(radioGroup[i]).attr("checked") === "checked") {
					somethingChecked = true;
				}
			}

			// If non of the radio buttons is checked in the group, add an error
			if (!somethingChecked) {
				err = this.addError(object, this.settings.emptyErrorText);
			}
		} else if ($(object).val() === "") {
			err = this.addError(object, this.settings.emptyErrorText);
		}
	}

	// Process other checks
	if (!err) {
		for (i = 0, l = this.checks.length; i < l; i += 1) {
			// Check if something is filled in,
			// you can has non required fields that still must be validated
			if ($(object).val() !== "" || $(object).prop("tagName") === "DIV") {
				// Check if current field needs to be checked
				if ($(object).hasClass(this.checks[i].Class)) {
					// Check if validation is true or an error message
					checkStatus = this.checks[i].check(this.checks[i], object);
					if (checkStatus !== true) {
						err = this.addError(object, checkStatus);
						break;
					}
				}
			}
		}
	}

	// Remove error if any
	if (!err) {
		this.removeError(object);
	}
};

/**
* Adds an error + adds class "error" on the field
*
* @param object Field
* @param string Error text that will be displayed
* @return bool True
*/
Sfc.prototype.addError = function (object, text) {
	var errorMessageElement;

	if (this.errorField === null) {
		this.errorField = object;
	}

	if (typeof $(object).data("err-msg") !== "undefined" &&
			$(object).data("err-msg") !== "") {
		text = $(object).data("err-msg");
	}

	// Add explaining error text
	if (typeof text !== "undefined" || text !== "") {
		// Nope, nothing found, create new one
		errorMessageElement = this.getErrorElement(object);
		if (errorMessageElement !== null) {
			// Check if an error is already there
			if (errorMessageElement.length === 0) {
				// If not, add a new p.errorText to it.
				$(this.settings.errorMessage.replace("[[text]]", text))
					.hide()
					.appendTo($(object).parent(":first"))
					.slideDown(this.settings.animationTime);
			} else {
				// If it's there, just change the text to a new one.
				$(errorMessageElement)
					.hide()
					.html(text)
					.slideDown(this.settings.animationTime);
			}
		}
	}

	$(object).addClass(this.settings.errorClass);
	this.error = true;
	return true;
};

/**
* Removes error, duh
*
* @param object Field
*/
Sfc.prototype.removeError = function (object) {
	var errorMessageElement;

	// Reset field
	$(object).removeClass(this.settings.errorClass);

	errorMessageElement = this.getErrorElement(object);
	if (errorMessageElement !== null) {
		errorMessageElement.slideUp(this.settings.animationTime);
	}
};

/**
* Gets the error element for the given field
*
* @param object Field
* @return object Error element
*/
Sfc.prototype.getErrorElement = function (object) {
	var linkedErrorMessageElement;
	if (this.settings.errorMessage === "" ||
			this.settings.errorMessage === null ||
			this.settings.errorMessage === false) {
		return null;
	}

	linkedErrorMessageElement = $($(object).data("err-elm"));
	if (linkedErrorMessageElement.length > 0) {
		return linkedErrorMessageElement;
	}

	return $(object)
		.parent(":first")
		.children(
			$(this.settings.errorMessage)[0].nodeName + "." + $(this.settings.errorMessage).attr("class")
		);
};

(function ($) {
	"use strict";
	var checkers = [];
	$.fn.SimpleFormChecker = function (options) {
		var i, l,
			args;

		for (i = 0, l = this.length; i < l; i += 1) {
			// Create checker
			if (typeof $(this[i]).data("sfc-index") === "undefined") {
				args = options || {};
				checkers[checkers.length] = new Sfc(this[i], args, $);
				$(this[i]).data("sfc-index", i);
			}
		}
	};
}(jQuery));