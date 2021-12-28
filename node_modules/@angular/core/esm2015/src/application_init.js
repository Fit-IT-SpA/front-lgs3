/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isPromise } from '../src/util/lang';
import { Inject, Injectable, InjectionToken, Optional } from './di';
/**
 * An injection token that allows you to provide one or more initialization functions.
 * These function are injected at application startup and executed during
 * app initialization. If any of these functions returns a Promise, initialization
 * does not complete until the Promise is resolved.
 *
 * You can, for example, create a factory function that loads language data
 * or an external configuration, and provide that function to the `APP_INITIALIZER` token.
 * That way, the function is executed during the application bootstrap process,
 * and the needed data is available on startup.
 *
 * @publicApi
 */
import * as ɵngcc0 from './r3_symbols';
export const APP_INITIALIZER = new InjectionToken('Application Initializer');
/**
 * A class that reflects the state of running {@link APP_INITIALIZER}s.
 *
 * @publicApi
 */
export class ApplicationInitStatus {
    constructor(appInits) {
        this.appInits = appInits;
        this.initialized = false;
        this.done = false;
        this.donePromise = new Promise((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
    }
    /** @internal */
    runInitializers() {
        if (this.initialized) {
            return;
        }
        const asyncInitPromises = [];
        const complete = () => {
            this.done = true;
            this.resolve();
        };
        if (this.appInits) {
            for (let i = 0; i < this.appInits.length; i++) {
                const initResult = this.appInits[i]();
                if (isPromise(initResult)) {
                    asyncInitPromises.push(initResult);
                }
            }
        }
        Promise.all(asyncInitPromises)
            .then(() => {
            complete();
        })
            .catch(e => {
            this.reject(e);
        });
        if (asyncInitPromises.length === 0) {
            complete();
        }
        this.initialized = true;
    }
}
ApplicationInitStatus.ɵfac = function ApplicationInitStatus_Factory(t) { return new (t || ApplicationInitStatus)(ɵngcc0.ɵɵinject(APP_INITIALIZER, 8)); };
ApplicationInitStatus.ɵprov = ɵngcc0.ɵɵdefineInjectable({ token: ApplicationInitStatus, factory: ApplicationInitStatus.ɵfac });
ApplicationInitStatus.ctorParameters = () => [
    { type: Array, decorators: [{ type: Inject, args: [APP_INITIALIZER,] }, { type: Optional }] }
];
/*@__PURE__*/ (function () { ɵngcc0.setClassMetadata(ApplicationInitStatus, [{
        type: Injectable
    }], function () { return [{ type: Array, decorators: [{
                type: Inject,
                args: [APP_INITIALIZER]
            }, {
                type: Optional
            }] }]; }, null); })();

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb25faW5pdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvYXBwbGljYXRpb25faW5pdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRTNDLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFHbEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFDSCxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsSUFBSSxjQUFjLENBQW9CLHlCQUF5QixDQUFDLENBQUM7QUFFaEc7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBRUgsTUFBTSxPQUFPLHFCQUFxQjtBQUNsQyxJQVFFLFlBQXlELFFBQXVCO0FBQ2xGLFFBRDJELGFBQVEsR0FBUixRQUFRLENBQWU7QUFBQyxRQUp6RSxnQkFBVyxHQUFHLEtBQUssQ0FBQztBQUM5QixRQUNrQixTQUFJLEdBQUcsS0FBSyxDQUFDO0FBQy9CLFFBRUksSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtBQUNoRCxZQUFNLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO0FBQ3pCLFlBQU0sSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7QUFDeEIsUUFBSSxDQUFDLENBQUMsQ0FBQztBQUNQLElBQUUsQ0FBQztBQUNILElBQ0UsZ0JBQWdCO0FBQ2xCLElBQUUsZUFBZTtBQUNqQixRQUFJLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUMxQixZQUFNLE9BQU87QUFDYixTQUFLO0FBQ0wsUUFDSSxNQUFNLGlCQUFpQixHQUFtQixFQUFFLENBQUM7QUFDakQsUUFDSSxNQUFNLFFBQVEsR0FBRyxHQUFHLEVBQUU7QUFDMUIsWUFBTyxJQUF3QixDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDNUMsWUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckIsUUFBSSxDQUFDLENBQUM7QUFDTixRQUNJLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUN2QixZQUFNLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNyRCxnQkFBUSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDOUMsZ0JBQVEsSUFBSSxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDbkMsb0JBQVUsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzdDLGlCQUFTO0FBQ1QsYUFBTztBQUNQLFNBQUs7QUFDTCxRQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUM7QUFDbEMsYUFBUyxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQ25CLFlBQVUsUUFBUSxFQUFFLENBQUM7QUFDckIsUUFBUSxDQUFDLENBQUM7QUFDVixhQUFTLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNuQixZQUFVLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekIsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUNYLFFBQ0ksSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3hDLFlBQU0sUUFBUSxFQUFFLENBQUM7QUFDakIsU0FBSztBQUNMLFFBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDNUIsSUFBRSxDQUFDO0FBQ0g7aURBcERDLFVBQVU7K0hBQ1Q7QUFBQztBQUNVLHdDQVFFLE1BQU0sU0FBQyxlQUFlLGNBQUcsUUFBUTtBQUFNOzs7Ozs7OztrQ0FBRTtBQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aXNQcm9taXNlfSBmcm9tICcuLi9zcmMvdXRpbC9sYW5nJztcblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIEluamVjdGlvblRva2VuLCBPcHRpb25hbH0gZnJvbSAnLi9kaSc7XG5cblxuLyoqXG4gKiBBbiBpbmplY3Rpb24gdG9rZW4gdGhhdCBhbGxvd3MgeW91IHRvIHByb3ZpZGUgb25lIG9yIG1vcmUgaW5pdGlhbGl6YXRpb24gZnVuY3Rpb25zLlxuICogVGhlc2UgZnVuY3Rpb24gYXJlIGluamVjdGVkIGF0IGFwcGxpY2F0aW9uIHN0YXJ0dXAgYW5kIGV4ZWN1dGVkIGR1cmluZ1xuICogYXBwIGluaXRpYWxpemF0aW9uLiBJZiBhbnkgb2YgdGhlc2UgZnVuY3Rpb25zIHJldHVybnMgYSBQcm9taXNlLCBpbml0aWFsaXphdGlvblxuICogZG9lcyBub3QgY29tcGxldGUgdW50aWwgdGhlIFByb21pc2UgaXMgcmVzb2x2ZWQuXG4gKlxuICogWW91IGNhbiwgZm9yIGV4YW1wbGUsIGNyZWF0ZSBhIGZhY3RvcnkgZnVuY3Rpb24gdGhhdCBsb2FkcyBsYW5ndWFnZSBkYXRhXG4gKiBvciBhbiBleHRlcm5hbCBjb25maWd1cmF0aW9uLCBhbmQgcHJvdmlkZSB0aGF0IGZ1bmN0aW9uIHRvIHRoZSBgQVBQX0lOSVRJQUxJWkVSYCB0b2tlbi5cbiAqIFRoYXQgd2F5LCB0aGUgZnVuY3Rpb24gaXMgZXhlY3V0ZWQgZHVyaW5nIHRoZSBhcHBsaWNhdGlvbiBib290c3RyYXAgcHJvY2VzcyxcbiAqIGFuZCB0aGUgbmVlZGVkIGRhdGEgaXMgYXZhaWxhYmxlIG9uIHN0YXJ0dXAuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgQVBQX0lOSVRJQUxJWkVSID0gbmV3IEluamVjdGlvblRva2VuPEFycmF5PCgpID0+IHZvaWQ+PignQXBwbGljYXRpb24gSW5pdGlhbGl6ZXInKTtcblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgcmVmbGVjdHMgdGhlIHN0YXRlIG9mIHJ1bm5pbmcge0BsaW5rIEFQUF9JTklUSUFMSVpFUn1zLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFwcGxpY2F0aW9uSW5pdFN0YXR1cyB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIHJlc29sdmUhOiBGdW5jdGlvbjtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgcmVqZWN0ITogRnVuY3Rpb247XG4gIHByaXZhdGUgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgcHVibGljIHJlYWRvbmx5IGRvbmVQcm9taXNlOiBQcm9taXNlPGFueT47XG4gIHB1YmxpYyByZWFkb25seSBkb25lID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChBUFBfSU5JVElBTElaRVIpIEBPcHRpb25hbCgpIHByaXZhdGUgYXBwSW5pdHM6ICgoKSA9PiBhbnkpW10pIHtcbiAgICB0aGlzLmRvbmVQcm9taXNlID0gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICB0aGlzLnJlc29sdmUgPSByZXM7XG4gICAgICB0aGlzLnJlamVjdCA9IHJlajtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcnVuSW5pdGlhbGl6ZXJzKCkge1xuICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgYXN5bmNJbml0UHJvbWlzZXM6IFByb21pc2U8YW55PltdID0gW107XG5cbiAgICBjb25zdCBjb21wbGV0ZSA9ICgpID0+IHtcbiAgICAgICh0aGlzIGFzIHtkb25lOiBib29sZWFufSkuZG9uZSA9IHRydWU7XG4gICAgICB0aGlzLnJlc29sdmUoKTtcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMuYXBwSW5pdHMpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5hcHBJbml0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBpbml0UmVzdWx0ID0gdGhpcy5hcHBJbml0c1tpXSgpO1xuICAgICAgICBpZiAoaXNQcm9taXNlKGluaXRSZXN1bHQpKSB7XG4gICAgICAgICAgYXN5bmNJbml0UHJvbWlzZXMucHVzaChpbml0UmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIFByb21pc2UuYWxsKGFzeW5jSW5pdFByb21pc2VzKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGUgPT4ge1xuICAgICAgICAgIHRoaXMucmVqZWN0KGUpO1xuICAgICAgICB9KTtcblxuICAgIGlmIChhc3luY0luaXRQcm9taXNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbXBsZXRlKCk7XG4gICAgfVxuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICB9XG59XG4iXX0=