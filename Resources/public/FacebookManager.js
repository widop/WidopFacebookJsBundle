/**
 * Manages the Facebook SDK for a Symfony 2 project.
 *
 * Dependencies: JQuery & FOSJsRoutingBundle.
 */

function FacebookManager()
{
    this.isLoaded = false;

    this.options = {
        appId: null,
        cookie: true,
        status: true,
        xfbml: true,
        locale: 'fr_FR'
    };

    this.routes = {
        login: null,
        loginCheck: null,
        logout: null,
        target: null
    };

    this.events = [];
}

FacebookManager.prototype.setOptions = function(options)
{
    if (!options.appId) {
        throw 'You must specify your facebook application ID.';
    }

    $.extend(this.options, options);
}

FacebookManager.prototype.setRoutes = function(routes)
{
    if (!routes.login) {
        throw 'You must specify your login route.';
    }

    if (!routes.loginCheck) {
        throw 'You must specify your login check route.';
    }

    if (!routes.logout) {
        throw 'You must specify your logout route.';
    }

    if (!routes.target) {
        throw 'You must specify your target route.';
    }

    this.routes = routes;
}

FacebookManager.prototype.subscribe = function(name, callback) {
    if (this.isLoaded) {
        FB.Event.subscribe(name, callback);
    } else {
        this.events.push({
            'name': name,
            'callback': callback
        });
    }
};

FacebookManager.prototype.isLoadable = function()
{
    return this.options.appId && this.routes.login;
}

FacebookManager.prototype.load = function()
{
    if (!this.isLoadable()) {
        throw 'The Facebook Manager is not loadable. You must specify all mandatory routes & options.';
    }

    var containerId = 'fb-root';
    var div = document.getElementById(containerId);

    if (!div) {
        div = document.createElement('div');
        div.id = containerId;

        document.getElementsByTagName('body')[0].appendChild(div);
    }

    var js = document.createElement('script');
    js.type = 'text/javascript';
    js.async = true;
    js.src = '//connect.facebook.net/' + this.options.locale + '/all.js';

    document.getElementsByTagName('head')[0].appendChild(js);
}

FacebookManager.prototype.init = function()
{
    FB.init(this.options);
    this.isLoaded = true;

    for (var i in this.events) {
        this.subscribe(this.events[i].name, this.events[i].callback);
    }
}

FacebookManager.prototype.login = function(response)
{
    if (!response || !response.status || !response.authResponse) {
        return;
    }

    $.post(
        Routing.generate(this.routes.loginCheck), {
            access_token: 'huhu'
        },
        function (response) {
            if (response && response.status) {
                window.location = Routing.generate(this.routes.target);
            }
        }
    );
}

FacebookManager.prototype.logout = function(response) {
    if (!response.authResponse && document.location.href.indexOf(Routing.generate(this.routes.login)) == -1) {
        window.location = Routing.generate(this.routes.logout);
    }
};

FacebookManager.prototype.loginStatus = function(response) {
    if (response.authResponse && response.status == "connected") {
        this.login(response);
    } else {
        this.logout(response);
    }
};
