import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';

@Injectable({ providedIn:'root' })
export class I18nService {
    private subscription: Subscription = new Subscription();;
    flags = [
        { code: 'es', name:'Español' }
        /*{ code: 'en', name:'English' },
        { code: 'pt', name:'Portuguese' },
        { code: 'de', name:'Deutsch' },
        { code: 'fr', name:'Français' }*/
      ]
    constructor(private translateService: TranslateService) { }

    /**
   * @author Carlos Castañeda
   * @description I18nService.setLanguages es un metodo publico que se encarga de
   * registrar los lenguajes para internationalization del sitio
   * @param 
   * @returns void
   */
    setLanguages(){
        let langs = [];
        for (let lang in this.flags){
            langs.push(lang['code']);
        }
        this.translateService.addLangs(langs);
    }
    
    public getFlagsForLanguage(){
        return this.flags;
    }
     /**
   * @author Carlos Castañeda
   * @description I18nService.detectBestUserLanguage es un metodo publico que se encarga de
   * capturar el lenguaje desde el header de la peticion, si no se encuentra se obtiene desde los properties
   * @param 
   * @returns void
   */
    detectBestUserLanguage(){
        this.translateService.setDefaultLang("es");
        this.translateService.use(this.translateService.getDefaultLang());
    }

    getKeyWithParameters(literal: string, parameters: any) : string {
        let message;
        this.subscription = this.translateService.get(literal, parameters).subscribe(
            (response: string) => { message = response; },
            (error) => { message = ""; }
        );
        return message;
    }
    getKey(literal: string) : string {
        let message;
        this.subscription = this.translateService.get(literal).subscribe(
            (response: string) => { message = response; },
            (error) => { message = ""; }
        );
        return message;
    }
}