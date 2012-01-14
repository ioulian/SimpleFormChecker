/**
 *	@author Ioulian Alexeev
 *	@date 08.11.2011
 *	@description Fast and versatile form checker script.
 *	@version 0.1.8
 */

/**
 * SimpleFormChecker main class
 */
function Sfc() {
	"use strict";

	/**
	 * Regex checks
	 *
	 * To add a new check, just duplicate any of these objects and change the values
	 * Don't forget about the comma ;)
	 */
	var regexChecks = {
			/**
			 * Checks for email adresses. This validates most of the email adresses
			 */
			Email : {
				Class : "email",
				ErrorText : "This must be a valid email address",
				Pattern : new RegExp(/^(("[\w-\s]+")|([\w\-]+(?:\.[\w\-]+)*)|("[\w\-\s]+")([\w\-]+(?:\.[\w\-]+)*))(@((?:[\w\-]+\.)*\w[\w\-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i)
			},
			/**
			 * Checks for url
			 */
			Url : {
				Class : "url",
				ErrorText : "This must be a valid url",
				Pattern : new RegExp(/(^|\s)((https?:\/\/)?[\w\-]+(\.[\w\-]+)+\.?(:\d+)?(\/\S*)?)/i)
			},
			/**
			 * Checks for IPv4
			 *
			 * Valid string(s): ###.###.###.###
			 */
			Ip : {
				Class : "ip",
				ErrorText : "This must be a valid IP number",
				Pattern : new RegExp(/^((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))*$/i)
			},
			/**
			 * Only numbers are allowed
			 */
			Number : {
				Class : "number",
				ErrorText : "This must contain only numbers",
				Pattern : new RegExp(/^[0-9]*$/i)
			},
			/**
			 * Only characters are allowed
			 */
			Characters : {
				Class : "characters",
				ErrorText : "This must contain only characters",
				Pattern : new RegExp(/^[a-zA-Z]*$/i)
			},
			/**
			 * Checks for day
			 *
			 * Valid string(s): 01-31
			 */
			Day : {
				Class : "day",
				ErrorText : "This must be a valid day",
				Pattern : new RegExp(/^([1-9]|[1-2][0-9]|3[01])$/i)
			},
			/**
			 * Checks for month
			 *
			 * Valid string(s): 01-31
			 */
			Month : {
				Class : "month",
				ErrorText : "This must be a valid month",
				Pattern : new RegExp(/^(([0]{0,1}[1-9])|(1[0-2]))$/i)
			},
			/**
			 * Checks for year
			 *
			 * Valid string(s): 1900 - 2099
			 */
			Year : {
				Class : "year",
				ErrorText : "This must be a valid year",
				Pattern : new RegExp(/^(19|20)\d\d$/i)
			},
			/**
			 * Checks for normal date
			 * 
			 * Valid string(s): DD MM YYYY || DD-MM-YYYY || DD/MM/YYYY || DD.MM.YYYY
			 */
			Date : {
				Class : "date",
				ErrorText : "This must be a valid date (DD/MM/YYYY)",
				Pattern : new RegExp(/^((0?[1-9]|[12][0-9]|3[01])[\- \/.](0?[1-9]|1[012])[\- \/.](19|20)?[0-9]{2})*$/i)
			},
			/**
			 * Checks for US formatted date
			 * 
			 * Valid string(s): MM DD YYYY || MM-DD-YYYY || MM/DD/YYYY || MM.DD.YYYY
			 */
			UsDate : {
				Class : "usdate",
				ErrorText : "This must be a valid date (MM/DD/YYYY)",
				Pattern : new RegExp(/^((0?[1-9]|1[012])[\- \/.](0?[1-9]|[12][0-9]|3[01])[\- \/.](19|20)?[0-9]{2})*$/i)
			},
			/**
			 * Checks for date formatted for database
			 *
			 * Valid string(s): YYYY-MM-DD
			 */
			MysqlDate : {
				Class : "mysqldate",
				ErrorText : "This must be a valid date (YYYY-MM-DD)",
				Pattern : new RegExp(/^((19|20)?[0-9]{2}[\-](0?[1-9]|1[012])[\-](0?[1-9]|[12][0-9]|3[01]))*$/i)
			}
		},

		/**
		 * Other checks : holder for custom checks
		 */
		otherChecks = {
			/**
			 * Use class "length"
			 * Add these attributes for check options:
			 *  - data-min="###" : Minimum characters
			 *  - data-max="###" : Maximum characters
			 *  - data-counter="xxx" : Counter id
			 */
			Length : {
				Class : "length",
				MinErrorText : "The minimum required number of characters is [[allowed]]",
				MaxErrorText : "The maximum allowed number of characters is [[allowed]]",
				EqualErrorText : "The number of characters must be [[allowed]]",
				CounterTextMax : "[[current]] <= [[max]]",
				CounterTextMin : "[[current]] >= [[min]]",
				CounterTextMinMax : "[[min]] <= [[current]] <= [[max]]",
				CounterTextEqual : "[[current]] == [[equal]]"
			},
			/**
			 * Identical
			 * Add this attribute for check options:
			 *  - data-equalto="xxx" : Id of the field you want the current field to be identical to
			 */
			Identical : {
				Class : "identical",
				ErrorText : "These fields must match"
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
			PasswordStrength : {
				Class : "strength",
				ErrorText : "Your password is too weak",
				Notifications : [
					"Very weak",
					"Weak",
					"Better",
					"Medium",
					"Strong",
					"Strongest"
				]
			}
		},

		/**
		 * Default options
		 *
		 * You can set these options by passing params.
		 * They are read only by the code
		 */
		settings = {
			// Asterix that is shown for required fields
			// You can leave this empty if you don't want asterixes to be shown
			asterix : "<span class=\"asterix\">*</span>",
			// Error message that is displayed for invalid fields
			// ([[text]] will be replaced with actual text)
			// You can leave this empty if you don't want the error message to be shown
			errorMessage : "<p class=\"errorMessage\">[[text]]</p>",

			// Class that defines required fields
			requiredClass : "required",

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

			// Error messages
			emptyErrorText : "This field is required",
			formErrorText : "Please check the highlighted fields"
		},

		/**
		 * Variables
		 *
		 * These variables are used by the code
		 */
		self = this,
		errorField = null,
		form = null,
		error = false,
		inputs = [
			"input",
			"select",
			"textarea"
		];

	/**
	 * Pre-init
	 * Sets the options, form and inits the logic.
	 *
	 * @param object Form to validate
	 * @param object Options-object
	 */
	Sfc.prototype.construct = function (f, options) {
		form = f;
		// Set options
		self.handleOptions(options);
		// Init logic
		self.init();
	};

	/**
	 * Initialise
	 * 
	 * - Add asterix on the fields where it is needed
	 * - Set the form to validate on a field change
	 * - Validate the form on submit
	 * - Checks a field length on keyup
	 */
	this.init = function () {
		var i,
			inputCount = inputs.length;

		// Loop
		for (i = 0; i < inputCount; i += 1) {
			$(form).find(inputs[i]).each(function () {
				// Add asterixes
				if (settings.asterix !== "") {
					if ($(this).hasClass(settings.requiredClass)) {
						$(this).parent(":first")
							.append(settings.asterix);
					}
				}

				// Validate field on change (check if it is needed)
				if (settings.checkOnChange) {
					$(this).bind("change", function () {
						self.checkField($(this));
					});
				}

				// These are only needed on inputs
				if (inputs[i] === "input") {
					if (settings.updateOnType) {
						// Check length of fields
						if ($(this).hasClass(otherChecks.Length.Class)) {
							$(this).bind("keyup", function () {
								self.validateFieldLength($(this), true);
							});

							// Also update counter on start
							self.validateFieldLength($(this), true);
						}

						// Check password strength on type
						if ($(this).hasClass(otherChecks.PasswordStrength.Class)) {
							$(this).bind("keyup", function () {
								self.checkPasswordStrength($(this), true);
							});
						}
					}
				}
			});
		}

		// Validate on submit
		$(form).submit(function () {
			return self.checkForm();
		});
	};

	/**
	 * Sets the options
	 *
	 * @param Options-object
	 */
	this.handleOptions = function (options) {
		// Loop for normal settings
		var param,
			check;

		if (options !== null) {
			for (param in options) {
				if (settings[param] !== null) {
					settings[param] = options[param];
				}
			}
		}

		// Loop for regexes
		if (options.errorText !== null) {
			for (check in options.errorText) {
				if (regexChecks[check] !== null) {
					regexChecks[check].ErrorText = options.errorText[check];
				}
			}

			for (check in options.errorText) {
				if (otherChecks[check] !== null) {
					otherChecks[check].ErrorText = options.errorText[check];
				}
			}
		}
	};

	/**
	 * Checks the form
	 *
	 * @param object Form that's need to be checked
	 * @return bool Form valid?
	 */
	this.checkForm = function () {
		var i,
			errorContainer,
			inputCount = inputs.length;

		// Reset
		error = false;

		// Check each input
		for (i = 0; i < inputCount; i += 1) {
			$(form).find(inputs[i]).each(function () {
				self.checkField($(this));
			});
		}

		// Don't submit the form if there's a error
		if (error) {
			if (settings.scrollToErrorField) {
				self.scrollToErrorField();
			}

			// Message if form is not valid
			errorContainer = $(form).data("errmessage");
			if (typeof errorContainer !== "undefined") {
				$("#" + errorContainer).text(settings.formErrorText);
			}

			return false;
		}
		return true;
	};

	this.scrollToErrorField = function () {
		// Animate to top?
		$("html, body").animate({
			scrollTop : errorField.offset().top
		}, settings.scrollTime);

		// Focus on the first error field
		errorField.focus();
	};

	/**
	 * Checks current field on added classes and validates the field based on them
	 *
	 * @param object Field to check
	 */
	this.checkField = function (object) {
		var check,
			err = false;

		// Check on errors
		if (!err && object.hasClass("required") && object.val() === "") {
			err = self.addError(object, settings.emptyErrorText);
		} else if (!err && self.validateFieldLength(object)) {
			err = true;
		} else if (!err && self.validateIdentical(object)) {
			err = true;
		} else if (!err && self.checkPasswordStrength(object)) {
			err = true;
		}

		// Do regex checks on it
		if (!err) { // No need to check if the field is already invalid
			if (regexChecks !== null) {
				for (check in regexChecks) {
					if (object.hasClass(regexChecks[check].Class)
							&& !regexChecks[check].Pattern.test(object.val())
							&& object.val() !== "") {
						err = self.addError(object, regexChecks[check].ErrorText);
					}
				}
			}
		}

		// Remove error if any
		if (!err) {
			self.removeError(object);
		}
	};

	/**
	 * Validates password strength
	 * http://codeassembly.com/How-to-make-a-password-strength-meter-for-your-register-form/
	 *
	 * @param object Field to check
	 * @param bool Update counter only? It doesn't validate the field while typing because it's annoying
	 * @return bool Error
	 */
	this.checkPasswordStrength = function (object, updateCounterOnly) {
		var score = 0,
			err = false,
			value = $(object).val(),
			descContainer = $("#" + $(object).data("desc")),
			minStrength = $(object).data("minstrength");

		updateCounterOnly = (typeof updateCounterOnly === "undefined") ? false : updateCounterOnly;

		// Password longer than 6 chars
		if (value.length > 6) {
			score += 1;
		}

		// Password has both lower- and uppercase characters
		if (value.match(/[a-z]/) && value.match(/[A-Z]/)) {
			score += 1;
		}

		// Password has at least 1 number
		if (value.match(/\d+/)) {
			score += 1;
		}

		// Password has at least 1 special character
		if (value.match(/\.[!,@,#,$,%,\^,&,*,?,_,~,-,(,)]/)) {
			score += 1;
		}

		// If password is longer than 12 characters
		if (value.length > 12) {
			score += 1;
		}

		// Update notification
		if (descContainer.length === 1) {
			$(descContainer).text(otherChecks.PasswordStrength.Notifications[score])
				.removeClass()
				.addClass("strength" + score);
		}

		// Add error
		if (typeof minStrength !== "undefined" && !updateCounterOnly) {
			if (score < minStrength) {
				err = self.addError(object, otherChecks.PasswordStrength.ErrorText);
			}
		}

		return err;
	};

	/**
	 * Validates the field length.
	 *
	 * @param object Field to check
	 * @return bool Error
	 */
	this.validateIdentical = function (object) {
		var equalToField,
			err = false,
			equalTo = $(object).data("equalto");

		if (typeof equalTo !== "undefined") {
			equalToField = $("#" + equalTo);
			if (equalToField.length === 1) { // There is only one field with this id
				if ($(equalToField).val() !== $(object).val()) { // Those two fields are not identical
					err = self.addError(object, otherChecks.Identical.ErrorText);
					self.addError(equalToField, otherChecks.Identical.ErrorText);
				} else {
					// No need to remove error on the field as this will be removed later
					self.removeError(equalToField);
				}
			}
		}

		return err;
	};

	/**
	 * Validates the field length.
	 *
	 * @param Field to check
	 * @param Update counter only? It doesn't validate the field while typing because it's annoying
	 * @return Error
	 */
	this.validateFieldLength = function (object, updateCounterOnly) {
		// Set the default to false
		updateCounterOnly = (typeof updateCounterOnly === "undefined") ? false : updateCounterOnly;
		var err = false,
			counterText = "",
			checkWhat = "",
			maxChars = $(object).data("max"),
			minChars = $(object).data("min");

		if (object.hasClass(otherChecks.Length.Class) && (object.attr("type") === "text" || object.attr("type") === "password")) {
			// Check what the user wants
			if (typeof maxChars !== "undefined" && typeof minChars === "undefined") { // Only maxChars are defined
				counterText = otherChecks.Length.CounterTextMax;
				checkWhat = "maxchars";
			} else if (typeof minChars !== "undefined" && typeof maxChars === "undefined") { // Only minChars are defined
				counterText = otherChecks.Length.CounterTextMin;
				checkWhat = "minchars";
			} else if (typeof maxChars !== "undefined" && typeof minChars !== "undefined") { // Both are defined
				if (minChars >= 0) { // Minchars is greater than or equal to 0
					if (maxChars > minChars) { // maxChars should be always be greater than minChars
						counterText = otherChecks.Length.CounterTextMinMax;
						checkWhat = "bothchars";
					} else if (maxChars === minChars) { // If they are the same, consider the developer wants a string of a given length
						counterText = otherChecks.Length.CounterTextEqual;
						checkWhat = "equalchars";
					}
				}
			}

			// Check error
			if (!err && (checkWhat === "maxchars" || checkWhat === "bothchars") && object.val().length > maxChars) { // Above maxChars
				err = (!updateCounterOnly) ? self.addError(object, otherChecks.Length.MaxErrorText.replace("[[allowed]]", maxChars)) : true;
			} else if (!err && (checkWhat === "minchars" || checkWhat === "bothchars") && object.val().length < minChars) { // Under minChars
				err = (!updateCounterOnly) ? self.addError(object, otherChecks.Length.MinErrorText.replace("[[allowed]]", minChars)) : true;
			} else if (!err && checkWhat === "equalchars" && object.val().length !== maxChars) { // Not equal to
				err = (!updateCounterOnly) ? self.addError(object, otherChecks.Length.EqualErrorText.replace("[[allowed]]", maxChars)) : true;
			}

			// Update and show the counter
			self.updateCounter(
				object,
				counterText,
				maxChars,
				minChars,
				err
			);
		}

		return err;
	};

	/**
	 * Updates counter
	 *
	 * @param object Field to check
	 * @param string Text that needs to be displayed
	 * @param int Max allowed characters
	 * @param int Min required characters
	 * @param string Error text
	 */
	this.updateCounter = function (object, counterText, max, min, err) {
		// We check the id
		var counter = $("#" + $(object).data("counter"));

		// Check if there's a counter container on the page.
		if (counter.length === 1) {
			min = (typeof min === "undefined") ? "" : min;
			max = (typeof max === "undefined") ? "" : max;
			$(counter).text(
				counterText
					.replace("[[min]]", min)
					.replace("[[current]]", $(object).val().length)
					.replace("[[max]]", max)
					.replace("[[equal]]", max)
			);

			if (err) {
				$(counter).addClass("error");
			} else {
				$(counter).removeClass("error");
			}
		}
	};

	/**
	 * Adds an error + adds class "error" on the field
	 *
	 * @param object Field
	 * @param string Error text that will be displayed
	 * @return bool True
	 */
	this.addError = function (object, text) {
		var errorMessageElement;

		if (errorField === null) {
			errorField = object;
		}

		// Add explaining error text
		if (text !== null || text !== "") {
			// Check if user has defined custom error element
			errorMessageElement = $("#" + $(object).data("errmessage"));
			if (errorMessageElement.length === 1) { // User has defined one
				if (errorMessageElement.text() === "") {
					errorMessageElement.hide()
						.text(text)
						.slideDown(settings.animationTime);
				}
			} else { // Nope, nothing found, create new one
				errorMessageElement = self.getErrorElement(object);
				// Check if an error is already there
				if (errorMessageElement.length === 0) {
					// If not, add a new p.errorText to it.
					$(settings.errorMessage.replace("[[text]]", text))
						.hide()
						.appendTo(object.parent(":first"))
						.slideDown(settings.animationTime);
				} else {
					// If it's there, just change the text to a new one.
					errorMessageElement.text(text);
				}
			}
		}

		object.addClass("error");
		error = true;
		return true;
	};

	/**
	 * Removes error, duh
	 *
	 * @param object Field
	 */
	this.removeError = function (object) {
		var errorMessageElement;

		// Reset field
		object.removeClass("error");

		// Check if user has defined custom error element
		errorMessageElement = $("#" + $(object).data("errmessage"));
		if (errorMessageElement.length === 1) { // User has defined one
			errorMessageElement.slideUp(settings.animationTime);
		} else {
			// Remove the text
			self.getErrorElement(object).slideUp(settings.animationTime)
				.queue(function () {
					$(this).remove();
				});
		}
	};

	/**
	 * Gets the error element for the given field
	 *
	 * @param object Field
	 * @return object Error element
	 */
	this.getErrorElement = function (object) {
		return object
			.parent(":first")
			.children(
				$(settings.errorMessage)[0].nodeName + "." + $(settings.errorMessage).attr("class")
			);
	};
}

(function ($) {
	"use strict";
	jQuery.fn.SimpleFormChecker = function (options) {
		var i,
			len,
			form,
			args,
			sfc;

		for (i = 0, len = this.length; i < len; i += 1) {
			form = $(this[i]);
			args = options || {};
			sfc = new Sfc().construct(form, args);
		}
	};
}(jQuery));