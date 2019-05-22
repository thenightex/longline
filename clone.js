/**
 * @since 1.0.0
 * @category Object
 * @param {Object} object The object to clone.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * let obj1 = clone(obj0)
 */
function clone(object) {
  /*
    Deep copy objects by value rather than by reference,
    exception: `Proxy`
  */

  const seen = new WeakMap()

  return (function clone(object) {
    if (object !== Object(object)) return object /*
    —— Check if the object belongs to a primitive data type */

    if (object instanceof Node) return object.cloneNode(true) /*
    —— Clone DOM trees */

    let _object // The clone of object

    switch (object.constructor) {
      case Object:
      case Array:
        _object = cloneObject(object)
        break

      case Date:
        _object = new Date(+object)
        break

      case Function:
        const fnStr = String(object)

        _object = new Function("return " +
          (/^(?!function |[^{]+?=>)[^(]+?\(/.test(fnStr)
            ? "function " : ""
          ) + fnStr
        ).call(object)

        Object.defineProperties(_object,
          Object.getOwnPropertyDescriptors(object)
        )
        break

      default:
        switch (Object.prototype.toString.call(object.constructor)) {
          //                              // Stem from:
          case "[object Function]":       // `class`
          case "[object Undefined]":      // `Object.create(null)`
            _object = cloneObject(object)
            break

          default:                        // `Proxy`
            _object = object
        }
    }

    return _object


    function cloneObject(object) {
      if (seen.has(object)) return seen.get(object) /*
      —— Handle recursive references (circular structures) */

      const _object = Array.isArray(object)
        ? []
        : Object.create(Object.getPrototypeOf(object)) /*
          —— Assign [[Prototype]] for inheritance */

      seen.set(object, _object) /*
      —— Make `_object` the associative mirror of `object` */

      Reflect.ownKeys(object).forEach(key =>
        defineProp(_object, key, { value: clone(object[key]) }, object)
      )

      return _object
    }
  })(object)
}


function defineProp(object, key, descriptor = {}, copyFrom = {}) {
  const prevDesc = Object.getOwnPropertyDescriptor(object, key)
    || { configurable: true, writable: true }
    , copyDesc = Object.getOwnPropertyDescriptor(copyFrom, key)
      || { configurable: true, writable: true } // Custom…
      || {} // …or left to native default settings

  const { configurable: _configurable, writable: _writable } = prevDesc
    , test = () => _writable === undefined
      ? _configurable // Can redefine property
      : _configurable && _writable // Can assign to property

  if (arguments.length <= 2) return test()
  if (!test()) return false;

  ["get", "set", "value", "writable", "enumerable", "configurable"]
    .forEach(k =>
      descriptor[k] === undefined && (descriptor[k] = copyDesc[k])
    )

  const { get, set, value, writable, enumerable, configurable }
    = descriptor

  return Object.defineProperty(object, key, get || set
    ? { get, set, enumerable, configurable } // Accessor descriptor
    : { value, writable, enumerable, configurable } // Data descriptor
  )
}

export default clone
