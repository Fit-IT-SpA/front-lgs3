import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatButton } from '@angular/material/button';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { NotificationService } from './notification.service';
import { Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  providers: [NotificationService]
})
export class NotificationComponent implements OnInit {

  public unreadCount: number;
  public openNotification: boolean = false;
  private subscription: Subscription = new Subscription();
  public profile =  JSON.parse(localStorage.getItem('profile'));
  public notifications: any[];
  public loading: boolean = true;

  private _overlayRef: OverlayRef;
  private _unsubscribeAll: Subject<any>;
  private timeCall: number;

  @ViewChild('notificationsOrigin')
    private _notificationsOrigin: MatButton;

    @ViewChild('notificationsPanel')
    private _notificationsPanel: TemplateRef<any>;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _notificationsService: NotificationService,
    private _router: Router,
  ) { 
    // Set the private defaults
    this._unsubscribeAll = new Subject();

    // Set the defaults
    this.unreadCount = 0;
  }
  async ngOnInit(): Promise<void> {
    // Load the notifications
    /*this.getNotifications();
    console.log("this.timeCall");
    console.log(this.timeCall);*/
    this.subscription.add(this._notificationsService.getWebByEmail(this.profile.email).subscribe(
        response => {
            if (response) {
                console.log(response);
                this.notifications = response.notifications;
                this.timeCall = response.timeCall;
                // Calculate the unread count
                this.getUnreadCount();
                this._changeDetectorRef.markForCheck();
                if (this.timeCall) {
                    var bellProcess = setInterval(() => {
                        if (JSON.parse(localStorage.getItem('profile')))
                            this.getNotifications();
                        else
                            clearInterval(bellProcess);
                    }, this.timeCall);
                }
            }   
        },
        error => {
            console.log(error);
        }
    ));
  }
  /**
   * Toggle read status of the given notification
   */
  toggleRead(notification): void
  {
      console.log("toggleRead");
      // Toggle the read status
      notification.status == 0 ? notification.status = 1 : notification.status = 0;
      this.subscription.add(this._notificationsService.update(notification).subscribe(
          response => {
              this.getNotifications();
          },
          error => {
              console.log(error);
          }
      ));

      // Update the notification
      //this._notificationsService.update(notification.id, notification).subscribe();
  }
  toggleNotificationMobile() {
    this.openNotification = !this.openNotification;
  }
  getNotifications() {
    this.subscription.add(this._notificationsService.getWebByEmail(this.profile.email).subscribe(
        response => {
            if (response) {
                console.log(response);
                this.notifications = response.notifications;
                this.timeCall = response.timeCall;
                // Calculate the unread count
                this.getUnreadCount();
                this._changeDetectorRef.markForCheck();
                return response;
            }   
        },
        error => {
            console.log(error);
        }
    ));
  }
  getUnreadCount() {
    this.unreadCount = this.notifications.filter((notification) => notification.status === 0).length;
    console.log(this.unreadCount);
    this.loading = false;
  }
  markAllAsRead(): void {
        console.log("markAllAsRead");
        this.subscription.add(this._notificationsService.markAllAsRead(this.profile.email).subscribe(
            response => {
                this.getNotifications();
            },
            error => {
                console.log(error);
            }
        ));
        // Mark all as read
        //this._notificationsService.markAllAsRead().subscribe();
  }
    /**
     * Delete the given notification
     */
    delete(notification): void {
        // Delete the notification
        notification.status = -1;
        // Toggle the delete status
        this.subscription.add(this._notificationsService.update(notification).subscribe(
            response => {
                this.getNotifications();
            },
            error => {
                console.log(error);
            }
        ));
    }
    public notificationWithLink(link: string) {
        var linkSplit = link.split('admin/');
        if (linkSplit.length == 2) {
            this._router.navigate(['/admin/'+linkSplit[1]]);
        }
    }

}
