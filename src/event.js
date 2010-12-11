(function($){
  var $$ = $.qsa, handlers = {}, _zid = 1;
  function zid(element) {
    return element._zid || (element._zid = _zid++);
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event);
    if (event.ns) var matcher = matcherFor(event.ns);
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || handler.fn == fn)
        && (!selector || handler.sel == selector);
    });
  }
  function parse(event) {
    var parts = ('' + event).split('.');
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')};
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
  }

  function add(element, events, fn, selector, delegate){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []));
    events.split(/\s/).forEach(function(event){
      var handler = $.extend(parse(event), {fn: fn, sel: selector, del: delegate, i: set.length});
      set.push(handler);
      element.addEventListener(handler.e, delegate || fn, false);
    });
  }
  function remove(element, events, fn, selector){
    var id = zid(element);
    (events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i];
        element.removeEventListener(handler.e, handler.del || handler.fn, false);
      });
    });
  }

  $.event = {
    add: function(element, events, fn){
      add(element, events, fn);
    },
    remove: function(element, events, fn){
      remove(element, events, fn);
    }
  };

  $.fn.bind = function(event, callback){
    return this.each(function(element){
      add(element, event, callback);
    });
  };
  $.fn.unbind = function(event, callback){
    return this.each(function(element){
      remove(element, event, callback);
    });
  };

  $.fn.delegate = function(selector, event, callback){
    return this.each(function(element){
      var delegate = function(e){
        var target = e.target, nodes = $$(element, selector);
        var proxy = {originalEvent: e, liveFired: element};
        while (target && nodes.indexOf(target) < 0) target = target.parentNode;
        $.extend(proxy, e).currentTarget = target;
        if (target && !(target === element) && !(target === document))
          callback.call(target, proxy);
      };
      add(element, event, callback, selector, delegate);
    });
  };
  $.fn.undelegate = function(selector, event, callback){
    return this.each(function(element){
      remove(element, event, callback, selector);
    });
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback);
    return this;
  };
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback);
    return this;
  };

  $.fn.trigger = function(event){
    return this.each(function(element){
      var e = document.createEvent('Events');
      element.dispatchEvent(e, e.initEvent(event, true, false));
    });
  };
})(Zepto);