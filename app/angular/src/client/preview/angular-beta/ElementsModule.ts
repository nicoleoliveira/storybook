// Should be added first :
//   Custom Elements polyfill. Required for browsers that do not natively support Custom Elements.
//   eslint-disable-next-line import/no-extraneous-dependencies
import '@webcomponents/custom-elements';
//   Custom Elements ES5 shim. Required when using ES5 bundles on browsers that natively support
//   Custom Elements (either because the browser does not support ES2015 modules or because the app
//   is explicitly configured to generate ES5 only bundles).
//   eslint-disable-next-line import/no-extraneous-dependencies
import '@webcomponents/custom-elements/src/native-shim';

import { Injector, NgModule, Type } from '@angular/core';
import { createCustomElement, NgElementConstructor } from '@angular/elements';

export const createElementsModule = (
  ngModule: NgModule
): Type<{ ngEl: CustomElementConstructor }> => {
  @NgModule({ ...ngModule })
  class ElementsModule {
    public ngEl: NgElementConstructor<unknown>;

    constructor(private injector: Injector) {
      this.ngEl = createCustomElement(ngModule.bootstrap[0] as Type<unknown>, {
        injector: this.injector,
      });
    }

    ngDoBootstrap() {}
  }
  return ElementsModule;
};
