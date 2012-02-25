/**
 * JQuery plugin managing Facebook SDK for Symfony2 project.
 *
 * Dependencies: JQuery & FOSJsRoutingBundle.
 *
 * @author Geoffrey Bier <geoffrey-bier@gmail.com>
 * @author GeLo <geloen.eric@gmail.com>
 */

FacebookManager = (function ($, undefined) {
    var my = {
        isLoaded: false,
        options: {
            appId: null,
            cookie: true,
            status: true,
            xfbml: true,
            locale: 'fr_FR'
        },
        routes: {
            login: null,
            loginCheck: null,
            logout: null,
            target: null
        },
        events: [
            { name: 'auth.authResponseChange', callback: function (response) { my.authResponseChange(response); } }
        ]
    };

    /**
     * Sets options used when FB.init is called.
     *
     * options must contain at least:
     *  - appId: The facebook application ID.
     *
     * @param options The options.
     */
    my.setOptions = function (options) {
        if (!options.appId) {
            throw 'You must specify your facebook application ID.';
        }

        $.extend(my.options, options);
    }

    /**
     * Sets the routes that manages the symfony2 firewall.
     *
     * routes must contain:
     *  - login: The login route.
     *  - loginCheck: the login check route.
     *  - logout: The logout route.
     *  - target: The target route.
     *
     * @param routes The symfony2 routes
     */
    my.setRoutes = function (routes) {
        my.routes.login = Routing.generate(routes.login);
        my.routes.loginCheck = Routing.generate(routes.loginCheck);
        my.routes.logout = Routing.generate(routes.logout);
        my.routes.target = Routing.generate(routes.target);
    }

    /**
     * Loads the Facebook Manager if all manadtory routes & options has been specify.
     */
    my.load = function () {
        if (!my.isReady()) {
            throw 'The Facebook Manager is not ready to be loaded. You must specify all mandatory routes & options.';
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
            js.src = '//connect.facebook.net/' + my.options.locale + '/all.js';

            document.getElementsByTagName('head')[0].appendChild(js);
        }());

        window.fbAsyncInit = function() {
            FB.init(my.options);
            my.isLoaded = true;

            for (var i in my.events) {
                my.subscribe(my.events[i].name, my.events[i].callback);
            }
        };
    }

    /**
     * Checks if the Facebook Manager is ready for being loaded.
     *
     * @return TRUE if the Facebook Manager is ready for being loeaded else FALSE
     */
    my.isReady = function () {
        return my.options.appId && my.routes.login;
    }

    /**
     * Login the user on the symfony2 firewall.
     */
    my.login = function (response) {
        if (!response || !response.status || !response.authResponse) {
            return;
        }

        $.post(
            my.routes.loginCheck, {
                facebookId: response.authResponse.userID,
                accessToken: response.authResponse.accessToken
            },
            function (response) {
                if (response && response.status) {
                    window.location = my.routes.target;
                }
            }
        );
    };

    /**
     * Logout the user on the symfony2 firewall.
     */
    my.logout = function (response) {
        window.location = my.routes.logout;
    };

    /**
     * Checks if the current page is the login page.
     *
     * @return TRUE if the current page is the login page else FALSE.
     */
    my.isOnLoginPage = function () {
        return document.location.href.indexOf(my.routes.login) != -1;
    };

    /**
     * Dispatches the authentication response change event on the Facebook Manager behavior.
     */
    my.authResponseChange = function (response) {
        if (response.authResponse && response.status == "connected" && my.isOnLoginPage()) {
            my.login(response);
        } else if (!my.isOnLoginPage()) {
            my.logout(response);
        }
    };

    /**
     * Subscribes to a facebook SDK event.
     *
     * @param name The facebook SDK event.
     * @param callback A callback.
     */
    my.subscribe = function (name, callback) {
        if (my.isLoaded) {
            FB.Event.subscribe(name, callback);
        } else {
            my.events.push({
                'name': name,
                'callback': callback
            });
        }
    };

    return my;
})(jQuery);
