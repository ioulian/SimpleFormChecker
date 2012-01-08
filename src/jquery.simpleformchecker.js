/**
 *	@author Ioulian Alexeev
 *	@date 08.11.2011
 *	@description Fast and versatile form checker script.
 *	@version 0.1.6
 */

(function ($) {
	"use strict";
	jQuery.fn.SimpleFormChecker = function (options) {
		var i,
			len,
			form,
			args;

		for (i = 0, len = this.length; i < len; i += 1) {
			form = $(this[i]);
			args = options || {};
			$.SimpleFormChecker.construct(form, args);
		}
	};

	/**
	 * SimpleFormChecker main class
	 */
	$.SimpleFormChecker = {
		/**
		 * Regex checks
		 *
		 * To add a new check, just duplicate any of these objects and change the values
		 * Don't forget about the comma ;)
		 */
		regexChecks : {
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
		otherChecks : {
			/**
			 * Use class "length"
			 * Add these attributes for check options:
			 *  - data-min="###" : Minimum characters
			 *  - data-max="###" : Maximum characters
			 *  - data-counter="xxx" : Counter id
			 */
			Length : {
				Class : "length",
				MinErrorText : "The minimum required number of characters is [ALLOWED]",
				MaxErrorText : "The maximum allowed number of characters is [ALLOWED]",
				EqualErrorText : "The number of characters must be [ALLOWED]",
				CounterTextMax : "[CURRENT] <= [MAX]",
				CounterTextMin : "[MIN] <= [CURRENT]",
				CounterTextMinMax : "[MIN] <= [CURRENT] <= [MAX]",
				CounterTextEqual : "[CURRENT] == [EQUAL]"
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
		settings : {
			asterix : "*",
			errorTextElement : "p",

			checkOnChange : true,
			scrollToTop : true,
			showErrorText : true,

			animationTime : 250,
			scrollTime : 500,

			emptyErrorText : "This field is required",
			formErrorText : "Please check the highlighted fields"
		},

		/**
		 * Variables
		 *
		 * These variables are used by the code
		 */
		firstErrorField : null,
		form : null,
		error : false,

		/**
		 * Pre-init
		 * Sets the options, form and inits the logic.
		 *
		 * @param object Form to validate
		 * @param object Options-object
		 */
		construct : function (form, options) {
			this.form = form;
			// Set options
			this.handleOptions(options);
			// Init logic
			this.init();
		},

		/**
		 * Initialise
		 * 
		 * - Add asterix on the fields where it is needed
		 * - Set the form to validate on a field change
		 * - Validate the form on submit
		 * - Checks a field length on keyup
		 */
		init : function () {
			// Add required indicator (check first if user wants it)
			if (this.settings.asterix !== "" && !$(this.form).hasClass("noAsterix")) {
				$(this.form).find("input.required, select.required, textarea.required").each(function () {
					$(this).parent(":first").append("<span class=\"req\">" + $.SimpleFormChecker.settings.asterix + "</span>");
				});
			}

			// Validate field on change (check if it is needed)
			if (this.settings.checkOnChange) {
				$(this.form).find("input, select, textarea").change(function () {
					$.SimpleFormChecker.checkField($(this));
				});
			}

			// Validate on submit
			$(this.form).submit(function () {
				return $.SimpleFormChecker.checkForm(this);
			});

			// Check length of fields
			$(this.form).find("input." + this.otherChecks.Length.Class).keyup(function () {
				$.SimpleFormChecker.validateFieldLength($(this), true);
			});

			// Check password strength on type
			$(this.form).find("input." + this.otherChecks.PasswordStrength.Class).keyup(function () {
				$.SimpleFormChecker.checkPasswordStrength($(this), true);
			});
		},

		/**
		 * Sets the options
		 *
		 * @param Options-object
		 */
		handleOptions : function (options) {
			// Loop for normal settings
			var param,
				check;

			if (options !== null) {
				for (param in options) {
					if (this.settings[param] !== null) {
						this.settings[param] = options[param];
					}
				}
			}

			// Loop for regexes
			if (options.errorText !== null) {
				for (check in options.errorText) {
					if (this.regexChecks[check] !== null) {
						this.regexChecks[check].ErrorText = options.errorText[check];
					}
				}

				for (check in options.errorText) {
					if (this.otherChecks[check] !== null) {
						this.otherChecks[check].ErrorText = options.errorText[check];
					}
				}
			}
		},

		/**
		 * Checks the form
		 *
		 * @param object Form that's need to be checked
		 * @return bool Form valid?
		 */
		checkForm : function (form) {
			// Reset
			this.error = false;
			this.firstErrorField = null;

			// Check each input
			$(form).find("input, select, textarea").each(function () {
				$.SimpleFormChecker.checkField($(this));
			});

			// Don't submit the form if there's a error
			if (this.error) {
				// Animate to top?
				if (this.settings.scrollToTop) {
					$("html, body").animate({scrollTop: this.firstErrorField.offset().top}, this.settings.scrollTime);
				}
				// Focus on the first error field
				if (this.firstErrorField !== null) {
					$(this.firstErrorField).focus();
				}

				// Message if form is not valid
				var errorContainer = $(form).data("errmessage");
				if (typeof errorContainer !== "undefined") {
					$("#" + errorContainer).text(this.settings.formErrorText);
				}

				return false;
			}
			return true;
		},

		/**
		 * Checks current field on added classes and validates the field based on them
		 *
		 * @param object Field to check
		 */
		checkField : function (object) {
			var check,
				error = false;

			// Check on errors
			if (!error && object.hasClass("required") && object.val() === "") {
				error = this.addError(object, this.settings.emptyErrorText);
			} else if (!error && this.validateFieldLength(object)) {
				error = true;
			} else if (!error && this.validateIdentical(object)) {
				error = true;
			} else if (!error && this.checkPasswordStrength(object)) {
				error = true;
			}

			// Do regex checks on it
			if (!error) { // No need to check if the field is already invalid
				if (this.regexChecks !== null) {
					for (check in this.regexChecks) {
						if (object.hasClass(this.regexChecks[check].Class)
								&& !this.regexChecks[check].Pattern.test(object.val())
								&& object.val() !== "") {
							error = this.addError(object, this.regexChecks[check].ErrorText);
						}
					}
				}
			}

			// Remove error if any
			if (!error) {
				this.removeError(object);
			}
		},

		/**
		 * Validates password strength
		 * http://codeassembly.com/How-to-make-a-password-strength-meter-for-your-register-form/
		 *
		 * @param object Field to check
		 * @param bool Update counter only? It doesn't validate the field while typing because it's annoying
		 * @return bool Error
		 */
		checkPasswordStrength : function (object, updateCounterOnly) {
			var score = 0,
				error = false,
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
				$(descContainer).text(this.otherChecks.PasswordStrength.Notifications[score])
					.removeClass()
					.addClass("strength" + score);
			}

			// Add error
			if (typeof minStrength !== "undefined" && !updateCounterOnly) {
				if (score < minStrength) {
					error = this.addError(object, this.otherChecks.PasswordStrength.ErrorText);
				}
			}

			return error;
		},

		/**
		 * Validates the field length.
		 *
		 * @param object Field to check
		 * @return bool Error
		 */
		validateIdentical : function (object) {
			var equalToField,
				error = false,
				equalTo = $(object).data("equalto");

			if (typeof equalTo !== "undefined") {
				equalToField = $("#" + equalTo);
				if (equalToField.length === 1) { // There is only one field with this id
					if ($(equalToField).val() !== $(object).val()) { // Those two fields are not identical
						error = this.addError(object, this.otherChecks.Identical.ErrorText);
						this.addError(equalToField, this.otherChecks.Identical.ErrorText);
					} else {
						this.removeError(equalToField);
					}
				}
			}

			return error;
		},

		/**
		 * Validates the field length.
		 *
		 * @param Field to check
		 * @param Update counter only? It doesn't validate the field while typing because it's annoying
		 * @return Error
		 */
		validateFieldLength : function (object, updateCounterOnly) {
			// Set the default to false
			updateCounterOnly = (typeof updateCounterOnly === "undefined") ? false : updateCounterOnly;
			var error = false,
				counterText = "",
				checkWhat = "",
				maxChars = $(object).data("max"),
				minChars = $(object).data("min");

			if (object.hasClass(this.otherChecks.Length.Class) && (object.attr("type") === "text" || object.attr("type") === "password")) {
				// Check what the user wants
				if (typeof maxChars !== "undefined" && typeof minChars === "undefined") { // Only maxChars are defined
					counterText = this.otherChecks.Length.CounterTextMax;
					checkWhat = "maxchars";
				} else if (typeof minChars !== "undefined" && typeof maxChars === "undefined") { // Only minChars are defined
					counterText = this.otherChecks.Length.CounterTextMin;
					checkWhat = "minchars";
				} else if (typeof maxChars !== "undefined" && typeof minChars !== "undefined") { // Both are defined
					if (minChars >= 0) { // Minchars is greater than or equal to 0
						if (maxChars > minChars) { // maxChars should be always be greater than minChars
							counterText = this.otherChecks.Length.CounterTextMinMax;
							checkWhat = "bothchars";
						} else if (maxChars === minChars) { // If they are the same, consider the developer wants a string of a given length
							counterText = this.otherChecks.Length.CounterTextEqual;
							checkWhat = "equalchars";
						}
					}
				}

				// Check error
				if (!error && (checkWhat === "maxchars" || checkWhat === "bothchars") && object.val().length > maxChars) { // Above maxChars
					error = (!updateCounterOnly) ? this.addError(object, this.otherChecks.Length.MaxErrorText.replace("[ALLOWED]", maxChars)) : true;
				} else if (!error && (checkWhat === "minchars" || checkWhat === "bothchars") && object.val().length < minChars) { // Under minChars
					error = (!updateCounterOnly) ? this.addError(object, this.otherChecks.Length.MinErrorText.replace("[ALLOWED]", minChars)) : true;
				} else if (!error && checkWhat === "equalchars" && object.val().length !== maxChars) { // Not equal to
					error = (!updateCounterOnly) ? this.addError(object, this.otherChecks.Length.EqualErrorText.replace("[ALLOWED]", maxChars)) : true;
				}

				// Update and show the counter
				this.updateCounter(
					object,
					counterText,
					maxChars,
					minChars,
					error
				);
			}

			return error;
		},

		/**
		 * Updates counter
		 *
		 * @param object Field to check
		 * @param string Text that needs to be displayed
		 * @param int Max allowed characters
		 * @param int Min required characters
		 * @param string Error text
		 */
		updateCounter : function (object, counterText, max, min, error) {
			// We check the id
			var counter = $("#" + $(object).data("counter"));

			// Check if there's a counter container on the page.
			if (counter.length === 1) {
				min = (typeof min === "undefined") ? "" : min;
				max = (typeof max === "undefined") ? "" : max;
				$(counter).text(
					counterText
						.replace("[MIN]", min)
						.replace("[CURRENT]", $(object).val().length)
						.replace("[MAX]", max)
						.replace("[EQUAL]", max)
				);

				if (error) {
					$(counter).addClass("error");
				} else {
					$(counter).removeClass("error");
				}
			}
		},

		/**
		 * Adds an error + adds class "error" on the field
		 *
		 * @param object Field
		 * @param string Error text that will be displayed
		 * @return bool True
		 */
		addError : function (object, text) {
			// Set the first error-field so we can scroll to it later
			if (this.settings.scrollToTop && this.firstErrorField === null) {
				this.firstErrorField = object;
			}

			// Add explaining error text
			if (this.settings.showErrorText && text !== null) {
				// Check if an error is already there
				if (object.parent(":first").children(this.settings.errorTextElement + ".errorText").length === 0) {
					// If not, add a new p.errorText to it.
					var fieldErrorText = "<" + this.settings.errorTextElement + " class=\"errorText\">" + text + "</" + this.settings.errorTextElement + ">";
					$(fieldErrorText)
						.hide()
						.appendTo(object.parent(":first"))
						.slideDown(this.settings.animationTime);
				} else {
					// If it's there, just change the text to a new one.
					object.parent(":first")
						.children(this.settings.errorTextElement + ".errorText")
						.text(text);
				}
			}

			object.addClass("error");
			this.error = true;
			return true;
		},

		/**
		 * Removes error, duh
		 *
		 * @param object Field
		 */
		removeError : function (object) {
			// Reset field
			object.removeClass("error");
			// Remove the text
			object.parent(":first")
				.children(this.settings.errorTextElement + ".errorText")
				.slideUp(this.settings.animationTime)
				.queue(function () {
					$(this).remove();
				});
		}
	};
}(jQuery));