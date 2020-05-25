export const Debounce = (wait: number, immediate: boolean = false) => {

  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {

    // store timeout value for cancel the timeout
    let timeoutID: any;
    // store original function for future use
    const original = descriptor.value;
    descriptor.value = function(args: any) {
      const lazyFn = () => {
        timeoutID = false;
        if (!immediate) original.apply(this, args);
      }
      const callNow = (immediate && !timeoutID)
      if (timeoutID) clearTimeout(timeoutID);
      timeoutID = setTimeout(lazyFn, wait);
      if (callNow) original.apply(this, args);
    }
    return descriptor;
  }
}
