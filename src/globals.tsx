export namespace Globals {
  export var nodeId = 100;

  export function scrollDown(element: HTMLElement) {
    element.scrollTop = element.scrollHeight;
  }

  export function subscriptable(str: string): boolean {
    return str == "\u03c3" || str == "\u03C0" || str == "\u22c8" || str == "\u03c1";
  }

  export function subscriptRequired(str: string): boolean {
    return str == "\u03c3" || str == "\u03C0" || str == "\u03c1";
  }

  export function numChildren(str: string): number {
    if (str == "\u03c3" || str == "\u03C0" || str == "\u03c1") {
      return 1;
    } else {
      return 2;
    }
  }

  export function arrayContains(array: Array<string>, obj: string): boolean {
    return array.some(function(x) {
      return x == obj;
    });
  }
}
