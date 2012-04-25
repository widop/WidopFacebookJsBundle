window.widop = window.widop || {};

(function(facebookManager, $, undefined) {

    /**
     * The facebook SDK options:
     *  - appId: The facebook application identifier (string)
     *  - cookie: The cookie flag (boolean)
     *  - status: The status flag (boolean)
     *  - xfbml: The xfbml flag (boolean)
     *  - locale: The locale (string)
     *
     *  - login: The login route.
     *  - logout: The logout route.
     */
    var _options = {
        appId: null,
        cookie: true,
        status: true,
        xfbml: true,
        locale: 'fr_FR',

        loginRoute: null,
        logoutRoute: null,

        loginCallback: function (response) { window.location.reload(true); },
        registerCallback: function (response) { window.location.reload(true); },
        logoutCallback: function () { window.location = _options.logoutRoute; }
    };

    /**
     * The events.
     */
    var _events = [
        { name: 'auth.authResponseChange', callback: function (response) { authResponseChange(response); }}
    ];

    /**
     * TRUE if the facebook SDK is loaded else FALSE.
     */
    var _isLoaded = false;

    /**
     * Loads the facebook SDK if all mandatory routes & options has been specify.
     */
    facebookManager.load = function (options) {
        $.extend(_options, options);

        if (!isReady()) {
            throw 'The Widop Facebook Manager is not ready to be loaded. You must specify all mandatory routes & options.';
        }

        (function() {
            var containerId = 'fb-root';
            var container = document.getElementById(containerId);

            if (!container) {
                var div = document.createElement('div');
                div.id = containerId;

                document.getElementsByTagName('body')[0].appendChild(div);
            }

            var js = document.createElement('script');
            js.type = 'text/javascript';
            js.async = true;
            js.src = '//connect.facebook.net/' + _options.locale + '/all.js';

            document.getElementsByTagName('head')[0].appendChild(js);
        }());

        window.fbAsyncInit = function() {
            FB.init(_options);
            _isLoaded = true;

            for (var i in _events) {
                facebookManager.subscribe(_events[i].name, _events[i].callback);
            }
        };
    }

    /**
     * Subscribes to a facebook SDK event.
     *
     * @param name The facebook SDK event.
     * @param callback A callback.
     */
    facebookManager.subscribe = function (name, callback) {
        if (_isLoaded) {
            FB.Event.subscribe(name, callback);
        } else {
            _events.push({
                'name': name,
                'callback': callback
            });
        }
    };

    /**
     * Checks if the Facebook Manager is ready for being loaded.
     *
     * @return TRUE if the Facebook Manager is ready for being loeaded else FALSE
     */
    var isReady = function () {
        return _options.appId && _options.loginRoute && _options.logoutRoute;
    }

    /**
     * Login the user on the symfony2 firewall.
     */
    var login = function (response) {
        if (!response || !response.status || !response.authResponse) {
            return;
        }

        $.post(
            _options.loginRoute, {
                accessToken: response.authResponse.accessToken
            },
            function (response) {
                if (response && response.status) {
                    if (response.process == 'register') {
                        _options.registerCallback(response);
                    } else {
                        _options.loginCallback(response);
                    }
                }
            }
        );
    };

    /**
     * Logout the user on the symfony2 firewall.
     */
    var logout = function (response) {
        _options.logoutCallback();
    };

    /**
     * Dispatches the authentication response change event on the Facebook Manager behavior.
     */
    var authResponseChange = function (response) {
        if (response.authResponse && response.status == "connected" && !authenticated) {
            login(response);
        } else if (authenticated) {
            logout(response);
        }
    };

})(window.widop.facebookManager = window.widop.facebookManager || {}, jQuery);
