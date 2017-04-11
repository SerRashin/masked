var _regex          =  new RegExp('[0-9]'),
   _regex2           = new RegExp([_regex.source].concat('_').join('|'), 'g');

function isFunction(a) {
  return typeof a === 'function';
}

function getElements(selector) {
  var i,
    element,
    elements = [],
    first_digit;
  if ( typeof selector === 'string' ) {
    first_digit = selector[0];

    if ( (first_digit === '.') || (first_digit === '#') ) {
      selector = selector.substr(1);
    }

    if (first_digit === '.') {
      element = document.getElementsByClassName( selector );
      for(i in element) {
        if (element.hasOwnProperty(i) && element[i] !== 'null') {
          elements[element[i].id||i] = element[i];
        }
      }
    } else if (first_digit === '#') {
      element = document.getElementById( selector );
      if (element !== 'null') {
        elements.push(element);
      }
    } else {
      console.warn('selector finder empty');
    }
  } else if (selector.nodeType) {
    if (selector !== 'null') {
      elements.push(selector);
    }
  }

  return elements;
}

function getElementPath(element) {
  var el = element,
    parents = [];

  while (el.parentNode !== null) {
    var sibCount = 0;
    var sibIndex = 0;
    var ch = el.parentNode.childNodes;
    for ( var i = 0; i < ch.length; i++ ) {
      var sib = ch[i];
      if ( sib.nodeName === el.nodeName ) {
        if ( sib === el ) {
          sibIndex = sibCount;
        }
        sibCount++;
      }
    }

    var nodeName = el.nodeName.toUpperCase();

    if (el.className === 'CBH-masks') {
      el = el.parentNode;
      continue;
    }

    parents.unshift((sibCount > 1 ? nodeName + '[' + (sibIndex) + ']' : nodeName));

    el = el.parentNode;
    if (el.nodeType === 11) {
      el = el.host;
    }
  }

  return '//' + parents.join("/");
};

/**
 *  SUPPOORT
 *
 *   CORS is supported in the following browsers:
 *
 *   Chrome 3+
 *   Firefox 3.5+
 *   Opera 12+
 *   Safari 4+
 *   Internet Explorer 8+
 *
 * @author Sergey Rashin
 * @link https://github.com/serhanters/sAJAX
 */
var sAJAX = function (obj) {
  var i,
    res,
    url,
    xhr,
    status,
    statusText,
    callback,
    responses = {},
    und       = 'undefined',
    availableType       = ['GET', 'POST', 'PUT'],
    availableDataType   = ['json', 'text'],
    headers             = {},
    xmlhttpobj          = XMLHttpRequest,
    Msxml2              = 'Msxml2.XMLHTTP',
    args = {
      url:            obj.url             || false,
      async:          obj.async           || false,
      data:           obj.data            || null,
      crossDomain:    obj.crossDomain     || false,
      complete:       obj.result          || function(){},
      timeout:        obj.timeout         || 10000,
      type:           ( availableType.indexOf(obj.type) !== -1 ? obj.type : null )                || "GET",
      dataType:       ( availableDataType.indexOf(obj.dataType) !== -1 ? obj.dataType : null )    || "json"
    },
    makeQueryString      = function(data) {
      var query = [];
      for (var i in data) {
        if (data.hasOwnProperty(i)) {
          query.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));
        }
      }
      return query.join('&');
    };

  if (empty(args.url)) {
    return;
  }

  if (typeof xmlhttpobj === und){
    xmlhttpobj = function () {
      try {
        var activex_obj = ActiveXObject;
      } catch ( e ) {}
      try {
        return new activex_obj( Msxml2+'.6.0' );
      } catch ( e ) {}
      try {
        return new activex_obj( Msxml2+'.3.0' );
      } catch ( e ) {}
      try {
        return new activex_obj( Msxml2 );
      } catch ( e ) {}
      throw new Error( 'This browser does not support XMLHttpRequest.' );
    };
  }
  xhr = new (("onload" in new xmlhttpobj()) ? xmlhttpobj : XDomainRequest)();

  url = args.url;

  if (typeof args.data === 'string') {
    try {args.data = JSON.parse(args.data);} catch ( e ) {}
  }

  if (typeof args.data === 'object') {
    args.data = makeQueryString(args.data);
  }

  if (args.type === 'GET' && args.data && args.data.length>0) {
    url = args.url + '?' +args.data.toString();
  }
  xhr.open( args.type, url, args.async );

  if ( !args.crossDomain ) {
    headers["X-Requested-With"] = "XMLHttpRequest";
  }

  for ( i in headers ) { // Support: IE<9
    if ( headers.hasOwnProperty(i) && isset(headers[ i ]) ) {
      xhr.setRequestHeader( i, headers[ i ] + "" );
    }
  }

  if (args.data && args.data.toString().length>0) {
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    args.data = args.data.toString();
  }

  try {
    xhr.send(args.data || null);
  } catch ( e ) {}

  if  (args.async) {
    var timeout = setTimeout( function() {
      xhr.abort();
    }, args.timeout);
  }

  callback = function() {
    if ( xhr.readyState === 4  ) {
      if  (args.async) {
        clearTimeout(timeout);
      }
      callback = 'undefined';
      if ( xhr.readyState !== 4 ) {
        xhr.abort();
      } else {
        status = xhr.status;
        if ( typeof xhr.responseText === "string" ) {responses.text = xhr.responseText;}
        try {statusText = xhr.statusText;} catch( e ) {statusText = "";}
        if ( !status && !args.crossDomain ) {
          status = responses.text ? 200 : 404;
        } else if ( status === 1223 ) {
          status = 204;
        }
      }
    }

    if ( responses ) {
      if ( !status && !args.crossDomain ) {
        status = responses.text ? 200 : 404;
      } else if ( status === 1223 ) {
        status = 204;
      }
      if (status === 200) {
        if(args.dataType === 'text') {
          res = responses.text || '';
        } else if (args.dataType === 'json') {
          try {
            res = JSON.parse(responses.text) || '';
          } catch ( e ) {
            res = '';
          }
        }
        /**
         * @param a responce result
         * @param b responce code
         * @param c response text
         * @param d header for responce
         */
        args.complete(res, status, statusText, xhr.getAllResponseHeaders());
      }
    }
  };

  if ( !args.async ) {
    callback();
  } else if ( xhr.readyState === 4 ) { // (IE6 & IE7) if it's in cache and has been
    setTimeout( callback, 20 );
  } else {
    xhr.onreadystatechange = callback;
  }
};

/**
 * Проверяет переменную на существование
 * @returns {boolean}
 */
function isset() {
  var a  = arguments,
    l  = a.length,
    i  = 0,
    u  = undefined,
    uu = ''+u;

  while (i !== l) {
    if (a[i] === u || typeof a[i] === uu || a[i] === null) {
      return false;
    }
    i++;
  }

  return true;
}

/**
 * Проверяет переменную на пустоту
 * @returns {boolean}
 */
function empty()  {
  var a  = arguments,
    l  = a.length,
    i  = 0,
    i2 = 0,
    u  = undefined,
    uu = ''+ u,
    ev = [u, false, ''],
    el = ev.length;
  while (i !== l) {
    for (i2 = 0; i2 < el; i2++) {
      if (typeof a[i] === uu || a[i] === ev[i2] || a[i].length === 0) {
        return true;
      }
    }
    i++;
  }
  return false;
}

/**
 * Получить значение маски без символов только int
 * @param value
 * @returns {string}
 */
function getPhone(value) {
  return (value+'').replace(/\D+/g,"");
}