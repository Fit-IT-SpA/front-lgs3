import { Injectable } from '@angular/core';

@Injectable()
export class EndpointService {
  public static Api                                             = "";
  public static Account_Activate                                = EndpointService.Api + "/users/activate/"
  public static Acc_CheckStatus                                 = EndpointService.Api + "/recover-passwords/check/"
  public static Auth_IsLoggedIn                                 = EndpointService.Api + "/users/logged-in"
  public static Auth_Authenticate                               = EndpointService.Api + "/users/authentication";
  public static Account_Regist                                  = EndpointService.Api + "/users/regist";
  public static Account_Profile                                 = EndpointService.Api + "/users/me";
  public static Recover_Request                                 = EndpointService.Api + "/recover-passwords"
  public static Recover_Check                                   = EndpointService.Api + "/recover-passwords/check/"
  public static Recover_SetPassword                             = EndpointService.Api + "/recover-passwords/set"
  public static Recover_UpdatePassword                          = EndpointService.Api + "/recover-passwords/update"
  public static WebCompHome                                     = EndpointService.Api + "/web-components/home";

}
