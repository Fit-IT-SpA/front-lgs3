import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from '../../../../../shared/services/service-type.service';
import { UserService } from '../../../../../shared/services/user.service';
import { CompaniesService } from '../../../companies/companies.service';
import { User } from '../../../../../shared/model/user';
import { Order } from '../../../../../shared/model/order.model';
import { Offer } from '../../../../../shared/model/offer.model';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { validate, clean, format } from 'rut.js';
import { Companies } from 'src/app/shared/model/companies.model';
import { OrderService } from 'src/app/shared/services/order.service';
import { Product } from '../../../../../shared/model/product.model';
import { OfferService } from 'src/app/shared/services/offer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConstantService } from 'src/app/shared/services/constant.service';
declare var require;
const Swal = require('sweetalert2');
@Component({
  selector: 'app-offers-add',
  templateUrl: './offers-add.component.html',
  styleUrls: ['./offers-add.component.scss'],
  providers: [ServiceTypeService, UserService, CompaniesService, OrderService, OfferService],
})
export class OffersAddComponent implements OnInit {
  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public companiesForm: FormGroup;
  public profile =  JSON.parse(localStorage.getItem('profile'));
  private offer: Offer;
  public offersFormGroup: FormGroup;
  public companies: Companies[];
  public counter: number = 1;
  public filePath: string;
  public orderWithProductOffers: {
    order: Order,
    product: Product,
    offers: Offer[]
  };
  public imgFile: any;
  public idOrder: string
  public maxQty: number;
  public priceMask: number = 0;
  public idProduct: string
  public loading: boolean = true;
  public product: Product;
  public order: Order;

  constructor(
    private fb: FormBuilder,
    private srv: OrderService,
    private companiesSrv: CompaniesService,
    private srvOffer: OfferService,
    private router: Router,
    public toster: ToastrService,
    private activatedRoute: ActivatedRoute) {
    }
        
  ngOnInit(): void {
    if (this.haveAccess()) {
      this.subscription.add(this.activatedRoute.params.subscribe(params => {
        if (params['product']) {
          this.idProduct = params['product'];
          this.getCompanies();
        }
      }));
    }
  }
  private getCompanies() {
    this.subscription.add(
      this.companiesSrv.findByEmail(this.profile.email).subscribe(
          (response) => {
              this.companies = response;
              this.getProduct();
          }, (error) => {
            console.log(error);
          }
      )
    );
  }
  private getProduct() {
    this.subscription.add(this.srv.findProductById(this.idProduct).subscribe(
      response => {
        this.product = response;
        this.maxQty = this.product.originalQty
        this.offersFormGroup = this.fb.group({
          //photo: ['', Validators.required],
          estado: ['', Validators.required],
          origen: ['', Validators.required],
          make: ['', [Validators.maxLength(20), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/)]],
          price: [0, [Validators.required, Validators.min(200)]],
          cantidad: [1, [Validators.required, Validators.min(1), Validators.max(this.maxQty)]],
          despacho: ['retiro_tienda', Validators.required],
          company: [this.companies[0].rut],
          termsAndConditions: [false, [Validators.requiredTrue]],
          //comentario: ['']
        });
        this.getOrder();
      }, error => {
        console.log(error);
      }
    ));
  }
  private getOrder() {
    this.subscription.add(this.srv.findById(this.product.idOrder).subscribe(
      response => {
        this.order = response;
        console.log(this.order);
        this.loading = false;
      }, error => {
        console.log(error);
      }
    ))
  }
  
  sumaPrecio(){
      this.priceMask = parseInt(this.offersFormGroup.controls.price.value)*parseInt(this.offersFormGroup.controls.cantidad.value);
  }

  add() {
    this.loading = true;
    this.offer = this.createOffer();
    this.subscription.add(this.srvOffer.add(this.offer).subscribe(
        response => {
          this.toster.success('Se creó correctamente su Oferta!!');
          //this.offersFormGroup.controls.photo.setValue('');
          this.offersFormGroup.controls.origen.setValue('');
          this.offersFormGroup.controls.estado.setValue('');
          this.offersFormGroup.controls.price.setValue('');
          this.offersFormGroup.controls.despacho.setValue('');
          //this.offersFormGroup.controls.comentario.setValue('');
          this.offersFormGroup.controls.company.setValue('');
          this.offersFormGroup.controls.cantidad.setValue(0);
          this.loading = false;
          this.goBack()
        },
        error => {
            console.log(error);
            this.toster.error('No se pudo crear su Oferta :(');
        }
    ));
    
  }
  createOffer() {
    return {
        idOffer: (new Date().getTime()).toString(),
        createBy: this.profile.email,
        price: parseInt(this.offersFormGroup.controls.price.value),
        despacho: this.offersFormGroup.controls.despacho.value,
        //comentario: this.offersFormGroup.controls.comentario.value,
        estado: this.offersFormGroup.controls.estado.value,
        make: (this.offersFormGroup.controls.make.value) ? this.offersFormGroup.controls.make.value : '',
        origen: this.offersFormGroup.controls.origen.value,
        qty: this.offersFormGroup.controls.cantidad.value,
        qtyOfferAccepted: this.offersFormGroup.controls.cantidad.value,
        commission: 0.10,
        company: this.offersFormGroup.controls.company.value,
        status: 2,
        //photo: this.filePath,
        idOrder : this.order.id,
        idProduct : this.idProduct

    }
  }
  
  clickCompany(rut: string) {
    this.offersFormGroup.controls.company.setValue(rut);
  }
  
  public increment() {
    if (this.counter < this.maxQty) {
      this.counter += 1;
      this.offersFormGroup.controls.cantidad.setValue(this.counter);
      this.priceMask = parseInt(this.offersFormGroup.controls.price.value)*parseInt(this.offersFormGroup.controls.cantidad.value);
    }
  }

  public decrement() {
    if (this.counter > 1) {
        this.counter -= 1;
        this.offersFormGroup.controls.cantidad.setValue(this.counter);
        this.priceMask = parseInt(this.offersFormGroup.controls.price.value)*parseInt(this.offersFormGroup.controls.cantidad.value);
    }
  }
  
  /**
   * metodo para convertir cadena de caraceres en formato rut (puntos y guion)
   * @param rut rut de los talleres del usuario
   * @returns retorna el string con formato rut, si no es valido retornará un mensaje
   */
  formatRut(rut: string) {
    if (rut != '') 
        if (rut.length > 3 && validate(rut))
            return format(rut);
    return 'rut incorrecto';    
  }
 
  checkImageFile() {
    const inputNode: any = document.querySelector('#file');
    const fileTemp = inputNode.files[0];
    var mimeType = fileTemp.type;
    if (mimeType.match(/image\/*/) == null) {
      this.toster.error('Formato de imagen no soportado. Formatos soportados: png, jpg, jpeg', 'X');
      return;
    } else {
      this.imgFile = fileTemp;
      let possible = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      var ramdomName = '';
      for (var i = 30; i > 0; --i) ramdomName += possible[Math.floor(Math.random() * possible.length)];
      var fileExtension = this.imgFile.name.slice(this.imgFile.name.lastIndexOf('.') - this.imgFile.name.length);
      var newFileName = ramdomName + fileExtension;
      const formData = new FormData();

      formData.append("file", this.imgFile, newFileName);
      this.subscription.add(this.srv.uploadFile(formData).subscribe(
        response => {
          let archivo = response;
          this.filePath = this.srv.apiUrl + "/files/" + archivo.files[0].originalname;
          this.toster.success('¡Imagen subida correctamente!');
        }, error => {
            this.toster.error('Se ha producido un error al intentar cargar la imagen');
        }
      ));
      //this.offersFormGroup.controls.photo.setValue(this.imgFile.name);
      return;
    }

  }
  private haveAccess() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
        let access = permissions.filter((perm: string) => {
            return perm === ConstantService.PERM_MIS_OFERTAS_LECTURA;
        });
        return access.length > 0;
    } else {
        return false;
    }
  }
  public goBack() { 
    this.router.navigate(['/admin/orders/offers']);
  }
  public termsAndConditionsInfo() {
    Swal.fire({
        type: 'info',
        html: 
        `
        <article class="post-3 page type-page status-publish ast-article-single" id="post-3" itemtype="https://schema.org/CreativeWork" itemscope="itemscope">
  
  
  <header class="entry-header ast-no-thumbnail ast-header-without-markup">
    <h1 class="entry-title" itemprop="headline">Términos y Condiciones</h1>	</header> <!-- .entry-header -->


<div class="entry-content clear" itemprop="text">

  
      <div data-elementor-type="wp-page" data-elementor-id="3" class="elementor elementor-3" data-elementor-post-type="page">
              <div class="elementor-element elementor-element-6a94028 e-flex e-con-boxed e-con e-parent" data-id="6a94028" data-element_type="container" data-settings="{&quot;content_width&quot;:&quot;boxed&quot;}" data-core-v316-plus="true">
          <div class="e-con-inner">
        <div class="elementor-element elementor-element-450197f6 elementor-widget elementor-widget-text-editor" data-id="450197f6" data-element_type="widget" data-widget_type="text-editor.default">
        <div class="elementor-widget-container">
      <style>/*! elementor - v3.17.0 - 01-11-2023 */
.elementor-widget-text-editor.elementor-drop-cap-view-stacked .elementor-drop-cap{background-color:#69727d;color:#fff}.elementor-widget-text-editor.elementor-drop-cap-view-framed .elementor-drop-cap{color:#69727d;border:3px solid;background-color:transparent}.elementor-widget-text-editor:not(.elementor-drop-cap-view-default) .elementor-drop-cap{margin-top:8px}.elementor-widget-text-editor:not(.elementor-drop-cap-view-default) .elementor-drop-cap-letter{width:1em;height:1em}.elementor-widget-text-editor .elementor-drop-cap{float:left;text-align:center;line-height:1;font-size:50px}.elementor-widget-text-editor .elementor-drop-cap-letter{display:inline-block}</style>				<h3><strong>1. Introducción</strong></h3><p>Bienvenido a Planeta Tuercas, te invitamos a leer atentamente el presente acuerdo de términos y condiciones generales aplicables al uso de la plataforma digital que permite intermediar entre demandantes y oferentes permitirá vender repuestos, partes y/o piezas de productos motorizados y contratar otros servicios relacionados, dentro del Sitio web www.planetatuercas.cl</p><p>Consideremos que usted en nuestra página es TALLER o comprador , es decir usted necesita realizar una demanda de productos (persona natural o jurídica) y por otro extremo usted es COMERCIO, es decir propietario de accesorios, repuestos, partes y/o piezas de automóviles motorizados de diversas marcas (en adelante los “Productos”) y que requiere ofertar en el mercado a través de nuestro sitio, le informamos que para acceder y/o utilizar el sitio deberá comprender y posteriormente aceptar los presentes Términos y Condiciones, los cuales regulan el acceso y uso en Chile de este portal para la compraventa de los Productos. Las compraventas, el uso del Sitio y la aplicación de estos Términos y Condiciones están sujetos a las leyes de la República de Chile, en especial aquellas que protegen los derechos de los consumidores.</p><p>COMERCIO debe leer, entender y aceptar todas las condiciones contenidas en las Políticas de Privacidad, así como en los demás documentos incorporados a los mismos y debidamente informados, previo a su inscripción como usuario del portal.</p><p>Cualquier modificación a los presentes Términos y Condiciones será informada con antelación a su entrada en vigencia, lo que podrá ser aceptado por TALLER o por COMERCIO previo a utilizar nuestro servicio. Tratándose de modificaciones esenciales, técnicas y/o necesarias para el correcto funcionamiento del Sitio, el rechazo por parte de TALLER o COMERCIO de dichos cambios constituirá una condición objetiva que nos habilitará a no prestar los futuros servicios derivados del uso del Sitio.</p><p>Además, acreditado el incumplimiento grave y reiterado por parte del TALLER o COMERCIO de las disposiciones de estos Términos y Condiciones, podrá poner término al registro, lo que será informado oportunamente.</p><h3><strong>2. Información</strong></h3><p>Esta página está registrada por Planeta Tuercas Spa Rol Único Tributario N° 77.835.672-4 representado legalmente por Jonathan Marcelino Ortiz Rojas, ambos domiciliados para estos efectos en Antonio Bellet 193, Oficina 1210, comuna de Providencia, Santiago.</p><h3><strong>3. Glosario</strong></h3><p><strong>Cliente:</strong> Cualquier persona, natural o jurídica, que ingrese al Sitio, ya sea para revisar el contenido o para adquirir los productos o servicios ofrecidos en el portal.</p><p><strong>Taller o Comprador:</strong> Todo Cliente que adquiera un Producto ofertado en el portal.</p><p><strong>Planeta Tuercas:</strong> Planeta Tuercas Spa.</p><p><strong>Portal o Sitio:</strong> Es la página web www.planetatuercas.cl.</p><p><strong>Producto:</strong> Accesorios, repuestos, partes y/o piezas de productos motorizados de diversas marcas ofertadas por en el sitio.</p><p><strong>Comercio:</strong> Aquellas personas jurídicas con comercio establecido, que utilicen la plataforma de para vender sus Productos y Ofertar.</p><h3><strong>4. Capacidad</strong></h3><p>El acceso al Sitio y la oferta y venta de productos debe ser realizado por personas que tengan capacidad legal para contratar. No podrán constituirse como Comercio las personas que no tengan esa capacidad, los menores de edad o los Comercios del portal que hayan sido suspendidos temporalmente o inhabilitados definitivamente, de conformidad a las causales establecidas en los presentes Términos y Condiciones. Si estás inscribiendo un Comercio como empresa, debes tener capacidad para contratar a nombre de tal entidad y de obligar a la misma en los términos de estos Términos y Condiciones.</p><h3>5. Propuesta Planeta Tuercas</h3><p>En Planeta Tuercas, nos enorgullece ofrecer el primer Portal automotriz donde «el mesón manda», tú haces tu pedido y nosotros te ayudamos a encontrar lo que necesitas rápidamente, unificando la oferta del barrio 10 de Julio.</p><p>Nos especializamos en hacer el link perfecto entre ese repuesto que necesitas y quien lo tiene disponible, sin salir de tu Taller, casa o Local, para ello nos esforzamos por brindar a nuestros clientes una experiencia excepcional.</p><p>Nuestro equipo está formado por expertos repuestos automotrices, en calidad, confiabilidad del servicios y expertos en tecnología.</p><p>Desde los diferentes talleres y compradores registrados se generarán diariamente solicitudes en tiempo real, las cuales los diferentes comercios podrán ofertar de acuerdo a su stock disponible.</p><h4>Velocidad</h4><p>La velocidad para nosotros es importante, al igual que en el mesón de cada local si un cliente consulta por un productos este debe ser atendido rápidamente y así también una vez que se da la oferta esta permanece hasta que el stock se termina o hay cambios en el precio, por ello habrá un tiempo para las transacciones, esto implica que una vez realizada una oferta, esta permanecerá vigente sólo por un tiempo limitado, a su vez una vez aceptada la oferta, el tiempo para realizar el pago será también limitado, por lo que dicho pago debe ser realizado a la brevedad posible a este concepto de velocidad le llamamos los Pits como en Fórmula Uno.</p><p>Nuestro objetivo con los Pits es que el Comercio tenga seguridad que su oferta aceptada será pagada y no se desistirá, por ello podrá reservarla como vendida, así también por el lado del comprador deseamos que pueda contar con ofertas vigentes en todo momento, al igual que en el mesón de los comercios, la comunicación e interacción entre ambos debe ser fluida y rápida para completar la carrera.</p><p>Actualmente nuestra cobertura de venta es la Región Metropolitana, por ello Planeta Tuercas gestionará el retiro de los Productos en el Comercio para que el comprador pueda retirar en nuestro local y en un futuro podamos despachar a todo Chile, con distintas modalidades acorde a las necesidades del Cliente.</p><p>El Comercio no deberá pagar una comisión a Planeta Tuercas por el uso del Portal, nosotros incorporamos nuestra comisión en el precio de los productos efectivamente vendidos.</p><h3>6. Registro del Comercio</h3><p>Para utilizar los servicios que brinda Planeta Tuercas en su portal, es condición indispensable que el Comercio se registre en el Sitio, previa evaluación y aceptación de Planeta Tuercas. Para ello, el Comercio deberá completar y enviar a Planeta Tuercas un formulario de contacto, de acuerdo al procedimiento indicado en el Sitio.</p><p>El envío del formulario por parte del Comercio implica la aceptación por parte de éste de ser contactado por Planeta Tuercas, quien entregará la información necesaria para llevar a cabo el procedimiento de registro, a través del respectivo formulario de incorporación.</p><p>El envío del formulario de contacto o de incorporación no asegura la aceptación por parte de Planeta Tuercas de la solicitud del Comercio. El registro del Comercio en el Sitio se encuentra sujeto a una evaluación comercial. Planeta Tuercas informará adecuadamente la aceptación o rechazo al registro del Comercio, junto con las razones objetivas de la decisión.</p><p>Una vez aceptada la solicitud de registro, el Portal dispondrá de un espacio virtual (“Mi Mesón Virtual”) para el Comercio, donde podrá ofertar los productos con que pueda suplir la demanda de los clientes.</p><p>El registro en el Sitio supone el conocimiento y aceptación de todas y cada una de las cláusulas de los presentes Términos y Condiciones.</p><p>Toda información incluida en el registro será considerada veraz, por lo que es responsabilidad del Comercio verificar que la información personal que pone a disposición de Planeta Tuercas es exacta, precisa y verdadera. Asimismo, es responsabilidad del Comercio mantener actualizada la información proporcionada en el futuro.</p><p>De todas formas, podremos solicitar algún comprobante y/o dato adicional con la finalidad de corroborar la veracidad de los datos proporcionados. En caso de que el Comercio no confirme sus datos o se compruebe la falsedad de éstos, estaremos facultados para suspender temporal o definitivamente la cuenta del Comercio y todos sus usuarios registrados, sin que se genere responsabilidad alguna para Planeta Tuercas.</p><h3>7. Acceso al Sitio</h3><p>El Comercio accederá a su Mesón Virtual mediante las credenciales que seleccionará le serán proporcionadas al momento del registro. Al ingresar, se solicitará el cambio de contraseña, por una que sólo será conocida por el Comercio. El Comercio es responsable de mantener la confidencialidad de su Clave de Seguridad, así como de todas las actividades realizadas desde su cuenta y que pueda razonablemente controlar. Mesón Virtual es personal, único e intransferible, y está prohibido que un mismo Comercio inscriba o posea más de una Mesón Virtual. Un Comercio puede poseer más de un registro en caso de ser una persona jurídica. En caso de que Planeta Tuercas detecte que el Comercio ha tratado de contactar Talleres o Compradores por otros medios diferentes a los provistos en la portal para realizar ofertas sin permiso de Planeta Tuercas, las cuentas de estos Comercios, podrá cancelarlas, suspendidas o inhabilitadas.</p><p>El Comercio será responsable por todas las operaciones efectuadas en su Mesón Virtual, pues el acceso a la misma está restringido al ingreso y uso de su Clave de Seguridad, de conocimiento exclusivo del Comercio. En ningún caso Planeta Tuercas o el Portal tendrá acceso a la contraseña del Comercio. El Comercio se compromete a notificar a Planeta Tuercas en forma inmediata y por medio idóneo y fehaciente, sobre cualquier uso no autorizado de su Mesón Virtual, así como el ingreso por terceros no autorizados a la misma o sobre cualquier otra brecha de seguridad que sea de su conocimiento y que se relacione con su Mesón Virtual.</p><p>La seguridad, integridad y confidencialidad de su información son de extrema importancia para nosotros. Es por eso que contamos con medidas de seguridad técnicas, administrativas y físicas diseñadas para evitar el acceso, divulgación, el uso o la modificación no autorizada de su información.</p><p>El Comercio registrado en el Sitio podrá solicitar la rectificación, eliminación y/o cancelación de sus datos cuando lo estime conveniente, en conformidad a lo dispuesto en la Ley N° 19.628 sobre Protección de la Vida Privada.</p><h3>8. Uso del Sitio</h3><p>El Comercio dispondrá de su Mesón Virtual para efectuar las Ofertas de sus Productos. El Comercio será el único responsable por el contenido de sus Ofertas, debiendo asegurar su veracidad, integridad, exactitud, disponibilidad y licitud.</p><p>Sin perjuicio de lo anterior, Planeta Tuercas podrá, de manera previa o posterior al procedimiento de validación, revisar, aprobar, rechazar, modificar o eliminar una o más Ofertas de Productos, cuando éstas sean inconsistentes, falsas, inexactas o incumplan de alguna manera los presentes Términos y Condiciones.</p><p>Además, Planeta Tuercas se reserva el derecho de rechazar y/o eliminar cualquier publicación u Oferta que contenga hipervínculos que dirijan a otros sitios web.</p><h3>9. Recepción y gestión de pedidos</h3><p>A través del Portal, los Talleres y Compradores tendrán la posibilidad de adquirir los Productos ofertados por el Comercio en su Mesón Virtual, compra que se gestionará y validará por medio del Sitio.</p><p>Es responsabilidad del Comercio asegurar el stock de los Productos que comercializa y entregar una información veraz y oportuna a los Talleres y Compradores respecto de su disponibilidad.</p><p>En consecuencia, el precio publicado por el Comercio para la venta de un Producto, deberá ser respetado por este último en todas aquellas Ofertas que se hayan realizado cuando la Oferta estaba publicado y vigente para su aceptación.<br>Asimismo, el Comercio es responsable del contenido de sus Ofertas, precio, modalidades, características y otras condiciones específicas de contratación, salvo aquellas expresamente indicadas en estos Términos y Condiciones. El Comercio no puede efectuar cobros adicionales o distintos a aquellos publicados en su Mesón Virtual.</p><p>El Comercio es responsable de verificar que los Productos disponibles para la venta a través de la plataforma, cumplan con todas las normas y exigencias regulatorias que les sean aplicables.</p><p>En caso de que el Comercio ofrezca Productos con alguna deficiencia, usados o refaccionados o en cuya fabricación o elaboración se hayan utilizado partes o piezas usadas, deberá informarlo expresamente en la oferta al Taller o Comprador en forma previa a la compra.</p><p>El Comercio deberá cumplir íntegramente con aquello ofertado a los Talleres y Compradores, procurando mantener indemne a Planeta Tuercas de cualquier incumplimiento en que incurra respecto de los Compradores de los Productos en su Mesón Virtual.</p><p>El Comercio acepta que toda comunicación con los Talleres y Compradores durante la adquisición de los Productos en el portal, debe realizarse a través de dicha plataforma.</p><h3>10. Medios de pago</h3><p>El Cliente podrá realizar los pagos exclusivamente de manera digital, por los medios disponibles en el sitio.</p><p>Frente a una compra realizada por un Cliente a través del sitio, el Comercio deberá emitir la factura correspondiente a Planeta Tuercas SPA. Planeta Tuercas depositará o transferirá al Comercio las ventas pagadas por el Taller o Comprador de acuerdo al precio fijado por el Comercio en la Oferta aceptada.</p><h3>11. Despachos</h3><p>Para estos efectos, una vez confirmada la compra y, con ello, los tiempos de retiro o despacho comprometidos al Taller o Comprador, el Comercio deberá preparar los Productos para entregarlos a Planeta Tuercas debidamente embalados y etiquetados, al día siguiente de efectuada la compra. Planeta Tuercas retirará los Productos una vez recibida la confirmación por parte del Comercio.</p><p>El Comercio será responsable de disponer los Productos para su retiro dentro de los plazos comprometidos de despacho al Taller o Comprador. En caso de que el Taller incurra en 3 o más incumplimientos en la fecha de entrega, Planeta Tuercas podrá cancelar su registro en el Sitio. Ello, sin perjuicio de las responsabilidades que le asistan al Comercio por concepto de incumplimiento de sus obligaciones con los Talleres o Compradores y con Planeta Tuercas.</p><h3>12. Responsabilidad del Comercio</h3><p>a) El Comercio es el único responsable de que los Productos que ingresen al sistema de venta de Planeta Tuercas cumplan con los requisitos legales que permitan su venta. En consecuencia, dichos Productos deberán contar con sus antecedentes legales conforme a derecho y estar libres de gravámenes y prohibiciones que afecten el dominio.</p><p>b) El Comercio será el responsable de la existencia del Producto al momento de la venta y de la efectividad de las características y atributos ofertados.</p><p>c) El Comercio se obliga a dejar indemne a Planeta Tuercas de todos los perjuicios directos o indirectos que a ésta le hubiere significado el incumplimiento del Comercio a sus obligaciones con el Comprador del Producto, incluyendo el lucro cesante y daño moral. En tal caso, el Comercio deberá asumir todos los costos y pagos de honorarios derivados de las consecuencias de su incumplimiento.</p><p>d) El Comercio será responsable de la veracidad de los datos publicados respecto de los Productos ofrecidos en el Sitio y de cumplir con la garantía legal y convencional que corresponda respecto de los Productos que se adquieran a través del Sitio. En consecuencia, el Comercio será responsable ante el Comprador de dar cumplimiento a las disposiciones de la Ley N° 19.496 sobre Protección de Derechos de los Consumidores.</p><p>Estos Términos y Condiciones no constituyen un contrato de sociedad, de mandato, de franquicia o de relación laboral entre Planeta Tuercas  y el Comercio. El Comercio reconoce y acepta que el portal no es parte en ninguna operación, ni tiene control alguno sobre la seguridad o legalidad de los artículos anunciados, ni sobre la veracidad o exactitud de las Ofertas. </p><p>En virtud de lo anterior, Planeta Tuercas no tendrá responsabilidad sobre:</p><p>a. La utilización indebida que otros Comercios o los Clientes del Sitio puedan hacer respecto de los Productos publicados u ofertados, de los derechos de propiedad industrial y de los derechos de propiedad intelectual del Comercio.<br>b. El contenido de las páginas a las que el Comercio o los Clientes puedan acceder con o sin autorización de Planeta Tuercas.<br>c. El acceso de menores de edad o personas sin capacidad jurídica necesaria, bajo los términos de la legislación correspondiente, a los contenidos del Sitio o a la relación contractual que surja de su uso.</p><p>El Comercio deberá mantener indemne a Planeta Tuercas, a sus ejecutivos y personal, de cualquier reclamación judicial vinculada con los Productos que ofrezca y/o venda y deberá reembolsar a Planeta Tuercas cualquier suma que este último deba pagar, incluidas las costas, honorarios de abogados, indemnizaciones judiciales y convencionales y cualquier otro gasto relacionado.</p><p>El Comercio declara conocer y aceptar que la plataforma en que se desarrolla el portal de Planeta Tuercas no está exenta de fallas y, por tanto, en cualquier momento pueden verificarse circunstancias ajenas a la voluntad de Planeta Tuercas que impliquen que el Sitio no se encuentre operativo durante un período de tiempo.</p><h3>13. Responsabilidad de Planeta Tuercas</h3><p>Mediante su portal, Planeta Tuercas pone a disposición de los Comercios un Mesón virtual para comercializar sus Productos, facilitando la concreción de la venta entre el Comercio y los Clientes que accedan al Sitio.</p><p>En virtud de los presentes Términos y Condiciones, Planeta Tuercas:</p><p>a) Dispondrá de un Mesón virtual para que el Comercio comercialice sus Productos a través del Sitio mediante sus Ofertas.<br>b) Percibirá los pagos de los Compradores mediante los medios de pago disponibles en el Sitio y, luego, depositará el valor ofertado al Comercio.</p><h3>14. Facultades especiales de Planeta Tuercas</h3><p>PLANETA TUERCAS podrá cancelar el registro del Comercio en el Sitio, en cualquier tiempo, con efecto inmediato y sin derecho a indemnización alguna para el Comercio en los siguientes casos:</p><p>a. Si se declara la liquidación del Comercio o si éste cae en insolvencia o se designa un liquidador, interventor o administrador de los negocios o bienes del Comercio, o si se decreta el embargo de los bienes con los que el Comercio realiza su negocio.<br>b. Si el Comercio hubiere incurrido en incumplimientos graves y reiterados de sus obligaciones con PLANETA TUERCAS o con los Clientes.<br>c. Si, por razones objetivas, el Comercio no es apto para continuar con la venta de los Productos.<br>d. Si el Comercio utiliza el sitio para enajenar por su cuenta los Productos Ofertados.<br>e. Si el Comercio no cumple con los niveles de servicio; o recibe reclamos reiterados de los Clientes, mantiene deudas vencidas o incurre en otros comportamientos reprochables que puedan afectar a los Clientes o a la reputación del portal.</p><p>PLANETA TUERCAS podrá suspender o bloquear el contenido publicado por los Comercios, en caso que atente contra las buenas costumbres, sea contrario a la normativa legal y/o no cumpla con el propósito y objetivo del sitio.</p><h3>15. Privacidad de la información</h3><p>Para efectos de asegurar el buen funcionamiento de la plataforma, y otorgar seguridades suficientes tanto a los Comercios como a los Clientes, se le podrá solicitar al Comercio cierta información personal, según sea considerado necesario por Planeta Tuercas. Esta información no será en ningún caso entregada a terceros, salvo a empresas relacionadas con el portal o prestadoras de servicios de Planeta Tuercas con el único objeto de dar cumplimiento al servicio ofrecido al Comercio. En caso de entregar la información del Comercio a empresas concesionarias de bienes y servicios, dicha información será entregada sólo con este fin.</p><h3>16. Modificaciones</h3><p>El Portal, por su carácter tecnológico, evoluciona constantemente y podría ser modificado a lo largo del tiempo, a fin de garantizar la adecuada prestación del servicio. En caso de que realicemos un cambio sustancial en el sitio relacionado al registro, uso, mantenimiento y/o eliminación del Mesón Virtual, se notificará oportunamente al Comercio por los medios de contacto que tenga registrados en el sitio, lo que podrá ser aceptado o rechazado por éste. No obstante, en caso de que los cambios constituyan una modificación esencial, técnica y/o necesaria para la continuidad y/o correcto funcionamiento del sitio, el rechazo por parte del Comercio será una condición objetiva que nos habilitará a suspender temporal o definitivamente su Mesón Virtual.</p><p>En caso de que los cambios realizados por Planeta Tuercas se refieran a los servicios prestados en el sitio, se le notificará oportunamente al Comercio quien, en caso de no estar de acuerdo con alguna de dichas modificaciones, deberá abstenerse de seguir operando en el Sitio.</p><p>La duración del portal es, en principio, indefinida, sin perjuicio de que Planeta Tuercas puede suspender o dar término al Sitio por razones objetivas, sin que ello afecte los derechos ya adquiridos del Comercio.</p><h3>17. Fallas e interrupciones del Sitio</h3><p>Planeta Tuercas no garantiza el uso continuo e ininterrumpido del Sitio pues éste puede verse afectado o interrumpido por fallas del servidor, problemas de conexión o por efectuarse labores de mantención o mejoras para su operatividad.</p><p>Se deja expresa constancia que PLANETA TUERCAS adopta todas las medidas necesarias para proteger la seguridad de sus redes. Por tanto, cualquier violación o ataque a ellas, mediante los denominados “hackers”, constituirá caso fortuito o fuerza mayor, siempre que dichas circunstancias escapen del control razonable de PLANETA TUERCAS.</p><h3>18. Violaciones del Sistema o Bases de Datos</h3><p>No está permitida ninguna acción o uso de dispositivo, software, u otro medio tendiente a interferir tanto en las actividades y operatoria del sitio como en las ofertas, descripciones, cuentas o bases de datos de éste. Cualquier intromisión, tentativa o actividad violatoria o contraria a las leyes sobre derecho de propiedad intelectual y/o a las prohibiciones estipuladas en estos Términos y Condiciones, harán objeto a su responsable de las acciones legales pertinentes, y a las sanciones previstas por estos Términos y Condiciones, así como de indemnizar los daños ocasionados.</p><h3>19. Propiedad intelectual</h3><p>La información, contenido, diseño y cualquier otro elemento del Sitio se encuentran protegidos por leyes de Propiedad Intelectual. Su copia, redistribución, uso o publicación, total o parcial, está prohibida por la ley. Planeta Tuercas se reserva el derecho de difundir dicha información por los canales que estime conveniente sin que esto constituya una renuncia al derecho de propiedad de dicha información.</p><p>Planeta Tuercas y/o sus sociedades controlantes, controladas, filiales o subsidiarias se reservan todos los derechos, incluyendo los derechos de propiedad intelectual e industrial, asociados con los servicios de portal, sus Sitios web, los contenidos de sus pantallas, programas, bases de datos, redes, códigos, desarrollo, software, arquitectura, hardware, contenidos, información, tecnología, fases de integración, funcionalidades, dominios, archivos que permitan al Comercio acceder a su Mesón Virtual, herramientas de venta, marcas, patentes, derechos de autor, diseños y modelos industriales, nombres comerciales, entre otros, y declara que están protegidos por leyes nacionales e internacionales vigentes.</p><p>En ningún caso se entenderá que el Comercio tendrá algún tipo de derecho sobre los mismos excepto para utilizar el servicio del portal conforme a lo previsto en estos Términos y Condiciones. El uso indebido o contrario a la normativa vigente de los derechos de propiedad intelectual e industrial de Planeta Tuercas, así como su reproducción total o parcial, queda prohibido, salvo autorización expresa y por escrito de Planeta Tuercas.</p><p>Todos los derechos no expresamente otorgados en estos Términos y Condiciones son reservados por PLANETA TUERCAS o sus cesionarios, editores, titulares de derechos u otros generadores de contenidos. Ningún producto, imagen o sonido pueden ser reproducidos, duplicados, copiados, vendidos, revendidos o explotados para ningún fin, en todo o en parte, sin el consentimiento escrito previo de PLANETA TUERCAS.</p><p>Se prohíbe hacer un uso indebido de este Sitio o de las marcas, licencias o patentes que se publiciten en el Sitio. Lo anterior, sin perjuicio de las excepciones expresamente señaladas en la ley.</p><p>El Sitio puede contener enlaces a sitios web de terceros. En consideración a que Planeta Tuercas no tiene control sobre tales sitios, no será responsable por los contenidos, materiales, acciones y/o servicios prestados por los mismos, ni por los eventuales daños o pérdidas ocasionadas por la utilización de éstos, causados directa o indirectamente. La presencia de enlaces a otros sitios web no implica necesariamente una sociedad, relación, aprobación, respaldo de PLANETA TUERCAS con dichos sitios y sus contenidos.</p><p>Adicionalmente, PLANETA TUERCAS busca brindar a los titulares de Propiedad Intelectual una herramienta para denunciar contenido en supuesta infracción a sus derechos. Los Comercios podrán identificar y solicitar la remoción de aquellas publicaciones que infrinjan sus derechos. En caso de que PLANETA TUERCAS reciba una denuncia o un reclamo de un tercero o sospeche que se está cometiendo o se ha cometido una infracción a derechos de Propiedad Intelectual, podrá adoptar todas las medidas que entienda adecuadas, lo que puede incluir la aplicación de sanciones sobre el Mesón Virtual y Ofertas del Comercio. </p><h3>20. Registro de la actividad del Comercio mediante mecanismos automático</h3><p>PLANETA TUERCAS podrá registrar toda la actividad del Comercio en el Sitio de modo de analizar y optimizar su uso. Dicho registro podrá contener tanto información personal como del acceso a la información (incluidos dirección IP, cookies y cualquier otra tecnología para dicho registro).</p><p>PLANETA TUERCAS se reserva el derecho de hacer uso comercial de esta información. En ningún caso esta información será vendida, arrendada o entregada a terceros.</p><h3>21. Solución de conflictos, jurisdicción y ley aplicable</h3><p>En caso de presentarse alguna dificultad relacionada con el uso del Sitio o la adquisición de algún Producto o servicio, el Comercio podrá presentar su respectiva solicitud o reclamo a través de los siguientes medios contacto@planetatuercas.cl o ayuda@planetatuercas.cl o a través del chat con el ejecutivo de atención en línea disponible en www.planetatuercas.cl.</p><p>Si las diferencias persisten, éstas serán sometidas al conocimiento de los Tribunales Ordinarios de Justicia de la ciudad de Santiago, de conformidad a la normativa vigente.</p><p>Estos Términos y Condiciones se rigen por las leyes de la República de Chile, siendo sus Tribunales Ordinarios de Justicia los llamados a dirimir cualquier controversia, interpretación, alcance o cumplimiento de los mismos.</p><p>Todo lo anterior, sin perjuicio de los derechos y acciones legales que correspondan ante los Juzgados de Policía Local de acuerdo con la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores.</p><h3>22. Información de contacto</h3><p>Planeta Tuercas cuenta con los siguientes canales de atención a los Comercios: contacto@planetatuercas.cl o ayuda@planetatuercas.cl o a través del chat online disponible en www.planetatuercas.cl.</p>						</div>
        </div>
          </div>
        </div>
              </div>
    
  
  
</div><!-- .entry-content .clear -->

  
  
</article><!-- #post-## -->

        `,
        showCloseButton: true,
        showConfirmButton: true,
        buttonsStyling: false,
        customClass: {
            confirmButton: 'btn btn-pill btn-info', // Agrega tu clase CSS personalizada aquí
        }
    });
}
public privacyPoliciesInfo() {
  Swal.fire({
        type: 'info',
        html: 
        `
        <article class="post-1326 page type-page status-publish ast-article-single" id="post-1326" itemtype="https://schema.org/CreativeWork" itemscope="itemscope">
  
  
    <header class="entry-header ast-no-thumbnail ast-header-without-markup">
      <h1 class="entry-title" itemprop="headline">Politica de privacidad</h1>	</header> <!-- .entry-header -->


  <div class="entry-content clear" itemprop="text">

    
        <div data-elementor-type="wp-page" data-elementor-id="1326" class="elementor elementor-1326" data-elementor-post-type="page">
                <div class="elementor-element elementor-element-15e0b99a e-flex e-con-boxed e-con e-parent" data-id="15e0b99a" data-element_type="container" data-settings="{&quot;content_width&quot;:&quot;boxed&quot;}" data-core-v316-plus="true">
            <div class="e-con-inner">
          <div class="elementor-element elementor-element-540f8d71 elementor-widget elementor-widget-text-editor" data-id="540f8d71" data-element_type="widget" data-widget_type="text-editor.default">
          <div class="elementor-widget-container">
        <style>/*! elementor - v3.17.0 - 01-11-2023 */
  .elementor-widget-text-editor.elementor-drop-cap-view-stacked .elementor-drop-cap{background-color:#69727d;color:#fff}.elementor-widget-text-editor.elementor-drop-cap-view-framed .elementor-drop-cap{color:#69727d;border:3px solid;background-color:transparent}.elementor-widget-text-editor:not(.elementor-drop-cap-view-default) .elementor-drop-cap{margin-top:8px}.elementor-widget-text-editor:not(.elementor-drop-cap-view-default) .elementor-drop-cap-letter{width:1em;height:1em}.elementor-widget-text-editor .elementor-drop-cap{float:left;text-align:center;line-height:1;font-size:50px}.elementor-widget-text-editor .elementor-drop-cap-letter{display:inline-block}</style>				<p><!-- wp:heading {"level":3} --></p>
  <p><!-- /wp:heading --></p>
  <p><!-- wp:paragraph --></p>
  <p>Planeta Tuercas podrá solicitar a los usuarios o clientes datos personales, como información relativa a su nombre, razón social, RUT, giro, dirección de correo electrónico, domicilio o número telefónico, sin perjuicio que los datos específicos a solicitar serán debidamente informados a los usuarios o clientes en las oportunidades que correspondan. Estos datos no serán manejados por ninguna empresa que no pertenezca a Planeta Tuercas y serán tratados de manera confidencial, conforme a lo establecido por la legislación vigente y exclusivamente utilizados para procesar la compra, el despacho, gestionar la postventa y, en su caso, para el envío de publicidad sobre ofertas y promociones.</p>
  <p>En los casos que sean comunicados o cedidos a empresas relacionadas a Planeta Tuercas, se hará con el fin de mejorar la información y comercialización de los productos y servicios distribuidos o prestados. Con todo, los usuarios y clientes autorizan a Planeta Tuercas para comunicar su información personal a empresas externas o terceros en general con la finalidad de (i) dar cumplimiento a las condiciones de la compra del usuario o cliente y en general para cumplir con los deberes que Planeta Tuercas asuma con dicho usuario o cliente (por ejemplo, compartir los datos con empresas transportistas para poder efectuar el despacho de una compra), (ii) mejorar el nivel del servicio que presta Planeta Tuercas y así como experiencia general del usuario o cliente, y (iii) poder evaluar el ofrecimiento de nuevos servicios a los usuarios o clientes (por ejemplo, garantías extendidas para cierto tipo de productos).<br>El cliente inscrito en Planeta Tuercas tendrá derecho a requerir información de sus datos personales registrados y disponer la rectificación, eliminación y/o cancelación de estos datos cuando lo estime conveniente, en conformidad a la Ley N° 19.628. Para ejercer estos derechos, el cliente podrá ingresar a www.planetatuercas.cl (sección “Contacto”).</p>
  <p>Esto es sin perjuicio de la facultad de compartir los datos personales de usuarios y clientes a terceros que procesarán dichos datos en calidad de mandatarios de conformidad a la ley.</p>
  <p><!-- /wp:paragraph --></p>
  <p><!-- wp:heading {"level":3} --></p>
  <h3 class="wp-block-heading">Seguridad de la información</h3>
  <p><!-- /wp:heading --></p>
  <p><!-- wp:paragraph --></p>
  <p>Planeta Tuercas utiliza el certificado SSL Extended Validation de 2048 bits el cual permite total seguridad y privacidad de los datos de sus clientes y la realización de transacciones electrónicas seguras, lo que significa que toda información personal no podrá ser leída ni capturada por terceros.</p>
  <p><!-- /wp:paragraph --></p>						</div>
          </div>
            </div>
          </div>
                </div>
      
    
    
  </div><!-- .entry-content .clear -->

    
    
  </article><!-- #post-## -->

      `,
      showCloseButton: true,
      showConfirmButton: true,
      buttonsStyling: false,
      customClass: {
          confirmButton: 'btn btn-pill btn-info', // Agrega tu clase CSS personalizada aquí
      }
    });
  }

}
