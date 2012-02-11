/**
 * This file is part of the Widop package.
 *
 * (c) Widop <contact@widop.com>
 *
 * For the full copyright and license information, please read the LICENSE
 * file that was distributed with this source code.
 *
 * JQuery plugin managing Facebook SDK for Symfony 2 project.
 *
 * Dependencies: FOSJsRoutingBundle.
 *
 *  This API aims at loading easily the Facebook SDK and calling an authentication page when the FB user's
 *  is on the login page of your website.
 *
 *  It passes several parameters to the controller in order to authenticate him/her.
 *
 *  This controller is responsible for authenticating the user and MUST return a JSON array containing a
 *  status variable that, if true, will redirect the user to the homepage.
 *
 *  NB: The 'anonymous' user MUST have access to the login and loginCheck routes.
 *
 *  How to use it (see functions description for more information about them):
 *
 *      sfFacebookManager.setUrls(urlList);
 *      sfFacebookManager.addEventCallback('fb.event', callback);
 *      ...
 *      sfFacebookManager.loadAPI(options);
 *      sfFacebookManager.addEventCallback('fb.event', callback);
 *
 */

sfFacebookManager = (function($) {
    var my = {};

    /**
     * This variable is set to true when the SDK is loaded and initialized.
     * When set to true, the addEventCallback function behaviour changes.
     */
    my.isAPIready = false;

    /**
     * This variable is used to check whether or not the Facebook SDK can be loaded.
     * Check for your console to see the reason why the Facebook SDK wasn't loaded.
     * @see setUrls function
     */
    my.canLoadAPI = false;

    /**
     * This array can contain multiple values:
     *  - appId: The FB app id (mandatory)
     *  - divId: Where to load the SDK (mandatory)
     *  - channelUrl: Channel file
     *  - oauth: Enable oauth 2.0
     *  - status: Check FB user's status
     *  - cookie: enable cookies to allow the server to access the session
     *  - xfbml: parse XFBML
     *
     */
    my.fbOpts = {};

    /**
     * This associative array contains a map of events/functions.
     * The listenEvents method is called after the FB.init one and go through it to register events.
     * NB: functions are defined by the user
     */
    my.fbEvents = [];

    /**
     * This array contains the different routes needed by the sfFacebookManager API:
     *  - loginRoute: The login page where the API listen for a connect event
     *  - loginCheckRoute: The API will call this url to try to authenticate the user
     *  - homepageRoute: The homepage where the user is redirected after successful authentication
     *  - logoutRoute: The user is redirect there if a logout event is detected
     */
    my.urls = {};

    /**
     * This method sets the different ROUTES NAME needed by the sfFacebookManager API.
     * It will also set the canLoadAPI to true, implying that it MUST be called before the loadAPI function.
     * Error will be thrown in case of missing parameters.
     *
     * @see my.urls description
     * @param urls A JSON array
     */
    my.setUrls = function (urls) {
        try {
            my.urls = urls;
            if (!my.urls) {
                throw 'You need urls for the sfFacebookManager to work';
            } else if (!my.urls.loginRoute) {
                throw 'You need a loginRoute';
            } else if (!my.urls.loginCheckRoute) {
                throw 'You need a loginCheckRoute';
            } else if (!my.urls.homepageRoute) {
                throw 'You need a homepageRoute';
            } else if (!my.urls.logoutRoute) {
                throw 'You need a logoutRoute';
            }
            my.canLoadAPI = true;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Check whether config values are correctly set or not.
     * Throw exceptions when mandatory fields are no correctly set.
     * Mandatory fields are: appId and divId
     *
     */
    function validOptions() {
        // Mandatory options
        if (!my.fbOpts) {
            throw 'You need to pass a configuration array';
        } else if (!my.fbOpts.appId) {
            throw 'You need to specify an app id (options.appId)';
        } else if (!my.fbOpts.divId) {
            throw 'You need to specify a div id for the FB SDK (options.divId)';
        }

        // Default options
        if (!my.fbOpts.channelUrl) {
            my.fbOpts.channelUrl = null;
        }
        if (!my.fbOpts.fbSrc) {
            my.fbOpts.fbSrc = document.location.protocol + "//connect.facebook.net/fr_FR/all.js";
        }
        if (!my.fbOpts.status) {
            my.fbOpts.status = true;
        }
        if (!my.fbOpts.cookie) {
            my.fbOpts.cookie = true;
        }
        if (!my.fbOpts.oauth) {
            my.fbOpts.oauth = true;
        }
        if (!my.fbOpts.xfbml) {
            my.fbOpts.xfbml = true;
        }
    }

    /**
     * Initialize the Facebook SDK given a JSON array.
     * Errors are logged when loading it.
     *
     * @param options A JSON array
     */
    my.loadAPI = function (options) {
        try {
            if (!my.canLoadAPI) {
                throw 'API cannot be loaded';
            }

            my.fbOpts = options;
            validOptions();

            // load FB SDK asynchronously
            (function() {
                var js;
                if (!document.getElementById(my.fbOpts.divId)) {
                    throw 'Incorrect element div id: ' + my.fbOpts.divId;
                }

                js = document.createElement('script');
                js.type = 'text/javascript';
                js.async = true;
                js.src = my.fbOpts.fbSrc;
                document.getElementById(my.fbOpts.divId).appendChild(js);
            }());

            window.fbAsyncInit = function() {
                FB.init(my.fbOpts);
                listenEvents();
                my.isAPIready = true;
                clickLogout();
                // Force initial check status
                if (document.location.href.indexOf(Routing.generate('User_login')) == -1) {
                    checkStatus();
                }
            };
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Push an event into the event stack if the API is not ready, otherwise subscribe directly to the event.
     *
     * @param eventName Name of the event (ex: auth.login ...)
     * @param callback Callback function
     */
    my.addEventCallback = function (eventName, callback) {
        if (my.isAPIready) {
            FB.Event.subscribe(eventName, callback);
        } else {
            my.fbEvents.push({ name: eventName, fct: callback});
        }
    };

    /**
     * Go through to event stack and subscribe each of them
     */
    function listenEvents() {
        for (var i = 0; i < my.fbEvents.length; i++) {
            FB.Event.subscribe(my.fbEvents[i].name, my.fbEvents[i].fct);
        }
        my.fbEvents = [];
    }

    /**
     * Return the current path of the page.
     * Example: http://mts.local/app_dev.php/ -> /app_dev.php/
     */
    function getCurrentPath() {
        return document.location.pathname;
    }

    /**
     * Function called when a login event (or statusChange event occurs on the login page [loginRoute]) is detected.
     * This function loads user's data, asks the server (loginCheckRoute) to authenticate the user
     * and redirects he or she to the homepage [homepageRoute] (if authentication was successful).
     *
     * @param response A HTTP Answer (JSON array)
     */
    my.loginFacebook = function (response) {
        executeCallbacksInQueue();
        if (!response || !response.status || !response.authResponse) {
            return;
        } else if (getCurrentPath().indexOf(Routing.generate(my.urls.loginRoute)) >= 0 && response.status != 'connected') {
            return; // Case on login page & not connected
        } else if (getCurrentPath().indexOf(Routing.generate(my.urls.loginRoute)) == -1 && response.status == 'connected') {
            return; // Case on the other pages and connected
        }
        var query = FB.Data.query('SELECT email, first_name, last_name FROM user WHERE uid = {0}', response.authResponse.userID);
        query.wait(function(rows) {
            var fListQuery = FB.Data.query('SELECT uid2 FROM friend WHERE uid1 = me()');
            fListQuery.wait(
                function (flist) {
                    $.post(
                        Routing.generate('User_loginfromfb',
                            {
                                email: rows[0].email,
                                uid: rows[0].uid,
                                firstName: rows[0].first_name,
                                lastName: rows[0].last_name
                            }),
                        {'friends': flist},
                        function (data) {
                            if (data && data.status) {
                                window.location = Routing.generate(my.urls.homepageRoute);
                            }
                        }, 'json'
                    )
                }
            );
        });
    };

    /**
     * This method is called when a logout event is detected.
     * The user logs out from facebook then is redirected to log out from the application [logoutRoute].
     * Note: A bootstrap modal may pop out when the user has logged out from facebook.
     *
     * @param response A HTTP Answer (JSON array)
     */
    my.logoutFacebook = function (response) {
        if (!response || !response.status || response.status != 'connected' || !response.authResponse) {
//            console.log('Logout event fired');
            /* show info modal
            if (!my.doClickLogout) {
                $('#my-modal').modal('show');
                $('.modal-backdrop').removeClass('hide');
            }*/
        }
    };

    /**
     * This variable is used to know whether or not the logout event was triggered by the 'log-out' button or
     * not.
     */
    my.doClickLogout = false;

    /**
     * Bind a link as a logout action.
     * The user logs out from facebook then is redirected to log out from the application [logoutRoute].
    *
     * Warning: The link id MUST be logoutLink
     */
    function clickLogout() {
        $('#logoutLink').click(
            function (e) {
                e.preventDefault();
                my.doClickLogout = true;
                FB.logout(function () {
                    window.location = Routing.generate(my.urls.logoutRoute);
                });
            }
        );
    }

    /**
     * Callback stack. The executeCallbacksInQueue method execute every of the callback in it when the  API
     * is fully loaded.
     */
    my.cbQueue = [];

    /**
     * Add a callback in the queue if the API is not ready and the login method wasn't called, otherwise execute it
     *
     * @param cb A callback function
     */
    my.addCallbackToQueue = function (cb) {
        if (!cb) {
            return ;
        }
        if (my.isAPIready) {
            cb();
        } else {
            my.cbQueue.push(cb);
        }
    }

    /**
     * Go through the callback queue and execute each of the callback.
     * This method is called at the very beginning of the loginFacebook one
     */
    function executeCallbacksInQueue () {
        for (var i = 0 ; i < my.cbQueue.length ; i++) {
            my.cbQueue[i]();
        }
        my.cbQueue = [];

    }

    /**
     * This method is added to the jQuery API.
     * Its purpose is to call the bind function of jQuery if the facebook user's is still connected.
     */
    $.fn.extend({
        fbBind: function( type, data, fn, scope ) {
            var element = $(this);
            FB.getLoginStatus( function (response) {
                my.logoutFacebook(response);
                $(element).bind(type, data, fn, scope);
            }, true);
        }
    });

    /**
     * This methods calls the getLoginStatus function of the FB SDK
     */
    function checkStatus() {
        FB.getLoginStatus( function (response) {
                my.logoutFacebook(response);
        }, true);
    }

    /**
     * Return true if the API is loaded
     */
    my.isAPIloaded = function () {
        return my.isAPIready;
    }

    return my;
})(jQuery);
