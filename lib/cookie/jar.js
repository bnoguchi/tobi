
/*!
 * Tobi - CookieJar
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var url = require('url');

/**
 * Initialize a new `CookieJar`.
 *
 * @api private
 */

var CookieJar = exports = module.exports = function CookieJar() {
  this.cookies = {};
};

/**
 * Add the given `cookie` to the jar.
 *
 * @param {Cookie} cookie
 * @api private
 */

CookieJar.prototype.add = function(cookie, host){
  var cookies = this.cookies
    , domain = cookie.domain || host
    , domainCookies = cookies[domain] || (cookies[domain] = []);
  domainCookies = cookies[domain] = domainCookies.filter(function(c){
    // Avoid duplication (same path, same name)
    return !(c.name == cookie.name && c.path == cookie.path);
  });
  domainCookies.push(cookie);
};

/**
 * Get cookies for the given `req`.
 *
 * @param {IncomingRequest} req
 * @return {Array}
 * @api private
 */

CookieJar.prototype.get = function(req){
  var uri = url.parse(req.url)
    , path = uri.pathname
    , hostname = uri.hostname
    , now = new Date
    , specificity = {}
    , cookies = this.cookies
    , domainCookies = Object.keys(cookies).filter(function(domain){
        return ~hostname.indexOf(domain);
      }).reduce(function(domainCookies, domain){
        return domainCookies.concat(cookies[domain]);
      }, []);
  return domainCookies.filter(function(cookie){
    if (0 == path.indexOf(cookie.path) && now < cookie.expires
      && cookie.path.length > (specificity[cookie.name] || 0))
      return specificity[cookie.name] = cookie.path.length;
  });
};

/**
 * Return Cookie string for the given `req`.
 *
 * @param {IncomingRequest} req
 * @return {String}
 * @api private
 */

CookieJar.prototype.cookieString = function(req){
  var cookies = this.get(req);
  if (cookies.length) {
    return cookies.map(function(cookie){
      return cookie.name + '=' + cookie.value;
    }).join('; ');
  }
};
