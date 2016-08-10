function getRandom(min, max){
	return Math.random() * (max - min) + min;
}

function getRandomInt(min, max){
  return Math.round(getRandom(min, max));
}

function boxIntersectsBox(a,b)
{
  return (Math.abs(a.center.x - b.center.x) * 2 < (a.size.x + b.size.x)) &&
         (Math.abs(a.center.y - b.center.y) * 2 < (a.size.y + b.size.y));
}

function radiansToDegree (radians) {
  if(radians === undefined)
  {
    return 0;
  }
  return radians * 180/Math.PI;
}

function degreeToRadians (degree) {
  if(degree === undefined)
  {
    return 0;
  }
  return degree * Math.PI / 180;
}

function isBoolean(variable)
{
  return variable.constructor === Boolean || typeof variable === 'boolean';
}

function isString(variable)
{
  return typeof myVar == 'string' || myVar instanceof String;
}

function isArray(obj)
{
  return Object.prototype.toString.call(obj) === '[object Array]';
}

function isFunction(f){
  return typeof f === 'function';
}

var pointerEventToXY = function(e){
  var out = {x:0, y:0};
  if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
    var touch = e.touches[0] || e.changedTouches[0];
    out.x = touch.pageX;
    out.y = touch.pageY;
  } else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave' || e.type=='click') {
    out.x = e.pageX;
    out.y = e.pageY;
  }
  return out;
};

function absorbTouchEvent(event) {
  if(event.type == 'touchstart' || event.type == 'touchmove' || event.type == 'touchend' || event.type == 'touchcancel'){
    var e = event || window.event;
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
    e.cancelBubble = true;
    e.returnValue = false;
    return false;   
  }
  
}

function checkClamps(clamps, value)
{
  if(!isArray(clamps) || isEmpty(clamps)){
    return 1;
  }

  if(value > clamps[1]){
    value = clamps[1];
  }
  else if(value < clamps[0]){
    value = clamps[0];
  }

  if(value == clamps[0] || value == clamps[1]){
    return -1;
  }

  return 1;
}

function isBetween(x, begin, end)
{
  if(begin > end)
  {
    var swap = end;
    end = begin;
    begin = swap;
  }

  return x >= begin && x <= end;

}

function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}

function sqr(x) { return x * x }

function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }

function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  if (t < 0) return dist2(p, v);
  if (t > 1) return dist2(p, w);
  return dist2(p, { x: v.x + t * (w.x - v.x),
                    y: v.y + t * (w.y - v.y) });
}

function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }

function getDegreeToVectorUp(p1, p2){
  var up = Vector2.up();
  var v1 = p2.substract(p1,true);
  return  Math.acos((v1.mulVector(up))/(v1.module()*up.module()));
}

function doWorkByTimer(timer, now){
  if(SCG.gameLogics.isPaused){
    //timer.lastTimeWork = now;
    timer.delta = 0;
    return;
  }

  timer.delta = now - timer.lastTimeWork;
  if(SCG.gameLogics.pauseDelta != 0){
    timer.delta -= SCG.gameLogics.pauseDelta;
  }

  timer.currentDelay -= timer.delta;
  if(timer.currentDelay <= 0){
    timer.currentDelay = timer.originDelay;
    timer.doWorkInternal.call(timer.context);  
  }
  
  timer.lastTimeWork = now;
}

function extend() {
  var options, name, src, copy, copyIsArray, clone,
    target = arguments[ 0 ] || {},
    i = 1,
    length = arguments.length,
    deep = false;

  if ( typeof target === "boolean" ) {
    deep = target;

    target = arguments[ i ] || {};
    i++;
  }

  if ( typeof target !== "object" && !isFunction( target ) ) {
    target = {};
  }

  if ( i === length ) {
    target = this;
    i--;
  }

  for ( ; i < length; i++ ) {
    if ( ( options = arguments[ i ] ) != null ) {
      for ( name in options ) {
        src = target[ name ];
        copy = options[ name ];

        if ( target === copy ) {
          continue;
        }

        if ( deep && copy && ( isPlainObject( copy ) ||
          ( copyIsArray = isArray( copy ) ) ) ) {

          if ( copyIsArray ) {
            copyIsArray = false;
            clone = src && isArray( src ) ? src : [];

          } else {
            clone = src && isPlainObject( src ) ? src : {};
          }

          target[ name ] = extend( deep, clone, copy );

        } else if ( copy !== undefined ) {
          target[ name ] = copy;
        }
      }
    }
  }

  return target;
};

function isPlainObject( obj ) {
    var proto, Ctor;
    var toString = Object.prototype.toString,
    hasOwn = Object.prototype.hasOwnProperty;
    var fnToString = hasOwn.toString;
    var ObjectFunctionString = fnToString.call( Object );

    if ( !obj || toString.call( obj ) !== "[object Object]" ) {
      return false;
    }

    proto = getProto( obj );
    if ( !proto ) {
      return true;
    }

    Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
    return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
  }

var getProto = Object.getPrototypeOf || function( obj ) {
      return obj.__proto__;
};

function getDOMByClassName(className){
  var result = undefined;
  var elements = document.getElementsByClassName(className);
  if(elements.length > 0){
    result = elements[0];
  }
  return result;
}

function appendDomElement(parent, type, properties)
{
  if(!(parent instanceof HTMLElement) && !(parent instanceof HTMLDocument) && !(parent instanceof HTMLBodyElement)){
    throw 'Cant append new element to non html Node'
  }

  if(type != undefined && typeof type != 'string' ){
   throw 'Type must be a string';
  }

  var element = document.createElement(type);

  setAttributes(element, properties);
  
  parent.appendChild(element);

  return element;
}

function setAttributes(element, properties) {
  for (var property in properties) {
    if (properties.hasOwnProperty(property)) {
      if(property == 'on'){
        var handlers = properties[property];
        for (var handler in handlers) {
          if (handlers.hasOwnProperty(handler)) {
            element.addEventListener(handler, handlers[handler], false);
          }
        }
      }
      else if(property == 'css')
      {
        var styles = properties[property];
        for (var style in styles) {
          if (styles.hasOwnProperty(style)) {
            element.style[style] = styles[style];
          }
        }
      }
      else{
        element.setAttribute(property, properties[property]);
      }
    }
  }
}

function addListenerMulti(el, s, fn) {
  s.split(' ').forEach(function(e) {el.addEventListener(e, fn, false)});
}

function drawFigures(ctx, points, props){
  ctx.save();

  ctx.lineJoin = 'bevel';
  if(props == undefined){
    props.alpha = 1;
  }

  ctx.globalAlpha  = props.alpha;
  for(var i = 0;i<points.length;i++){
    var cp = points[i];
    if(props.fill && cp.length < 3){
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(cp[0].x, cp[0].y);
    for(var j = 1;j<cp.length;j++){
      var p = cp[j];
      if(p instanceof Vector2){
        p = {p: p, type: 'line'};
      }

      if(p.type == 'line'){
        ctx.lineTo(p.p.x,p.p.y);
      }
      else if(p.type == 'curve'){
        ctx.quadraticCurveTo(p.control.x,p.control.y,p.p.x, p.p.y);
      }
    }
    if(props.fill){
      ctx.fillStyle = props.fill;
      ctx.fill();
    }
    if(props.stroke){
      ctx.strokeStyle = props.stroke;
      ctx.stroke();
    }
    
  }

  ctx.restore();
}
