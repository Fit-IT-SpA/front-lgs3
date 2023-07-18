import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription} from 'rxjs';
import { UtilService } from '../../../../../shared/services/util.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoleService } from './../role.service';
import { Privilege } from '../../../../../shared/model/privilege';
import { PrivilegeService } from '../../privilege/privilege.service';
import { ConstantService } from '../../../../../shared/services/constant.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-role-view',
  templateUrl: './role-view.component.html',
  styleUrls: ['./role-view.component.scss'],
  providers: [ RoleService, PrivilegeService ]
})
export class RoleViewComponent implements OnInit, OnDestroy {
  private subscription :Subscription = new Subscription();
  slug : string;
  screenType: string;
  roleForm: FormGroup;
  privilegeForm: FormGroup;
  loading : boolean = true;
  privileges: Privilege[] = [];
  privilagesFilter: { value: string, label: string, job: string }[] = [];
  userPrivileges: String[];
  status:number = 0;
  access: boolean = false;
  constructor(private utilSrv : UtilService, private roleSrv : RoleService, public toster: ToastrService,
    private router : Router, private activatedRoute: ActivatedRoute, private privilegeSrv : PrivilegeService,
    public formBuilder: FormBuilder) {
  }

  private haveAccess(){
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
      let access = permissions.filter( (perm: string) => {
        return perm === ConstantService.PERM_PERFIL_ADMIN_ESCRITURA;
      });
      return access.length > 0;
    } else {
      return false;
    }
  }

  ngOnInit() {
    let access = this.haveAccess();
    if (!access){
      this.router.navigate(['/admin/unauthorized']);
    } else {
      this.access = access;
      this.subscription.add(this.activatedRoute.params.subscribe(params => { 
        this.slug = params['slug'];
        this.getPrivileges();
      }));

      this.subscription.add(this.utilSrv.screenType$.subscribe(
        screen => { 
          this.screenType = screen;
        }
      ));
    }
  }

  private getPrivileges(){
    this.subscription.add(this.privilegeSrv.findAll().subscribe(
      response => {
        this.privileges = response;
        for (let privilage of this.privileges) {
          this.privilagesFilter.push({
            value: privilage.slug,
            label: privilage.title,
            job: ''
          })
        }
        this.getRole();
      }, error => {
        this.loading = false;
        this.toster.error('Se ha producido un error al intentar conseguir los permisos.');
      }
    ));
  }

  private getRole(){
    this.subscription.add(this.roleSrv.findById(this.slug)
      .subscribe(
        response => {
          this.userPrivileges = response.privilege;
          this.roleForm = this.formBuilder.group({
            slug: this.formBuilder.control({value: response.slug, disabled: true}),
            title: this.formBuilder.control({value: response.title, disabled: true}),
            description: this.formBuilder.control({value: response.description, disabled: true}),
            createdAt: this.formBuilder.control({value: this.utilSrv.formatDate(response.createdAt), disabled: true}),
            createdBy: this.formBuilder.control({value: response.createdBy, disabled: true}),
            status: this.formBuilder.control({value: response.status.toString(), disabled: true}),
            privileges: this.formBuilder.control({value: this.searchPrivilages(response.privilege), disabled: true}),
          });
          this.status = response.status;
          this.loading = false;
        },
        error => {
          this.loading = false;
          this.toster.error('Se ha producido un error al intentar conseguir los roles.');
        }
      )
    );
  }

  private searchPrivilages(privilages: string[]) {
    var privilagesFilter: { value: string, label: string, job: string }[] = [];
    for (let privilage of privilages) {
      for (let privilageSystem of this.privilagesFilter) {
        if (privilage == privilageSystem.value) {
          privilagesFilter.push(privilageSystem);
        }
      }
    }
    return privilagesFilter;
  }

  getPrivilege(slug: string){
    let permission = this.privileges.filter( perm => {
      return perm.slug === slug;
    });
    return permission[0].title;
  }

  goBack(){
    this.router.navigate(['/admin/users/role']);
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

}
