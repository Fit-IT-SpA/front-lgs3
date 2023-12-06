import { Injectable } from '@angular/core';

@Injectable()
export class ConstantService {

    public static ContentTypeJson                   = "application/json";
    public static ContentTypeXml                    = "application/xml;";
    public static ContentTypePdf                    = "application/pdf;";
    public static ContentTypeUrlEncoded             = "application/x-www-form-urlencoded;";
    public static ContentTypeMultipart              = "multipart/form-data";
    public static ContentTypeTextPlain              = "text/plain;";
    public static ContentTypeImageJpg               = "image/jpeg;";
    public static ContentTypeImagePng               = "image/png;";
    public static ContentTypeImageGif               = "image/gif;";
    public static EncodingUTF8                      = "UTF-8";
    public static EncodingISO88959                  = "ISO-8859-1";
    public static LangCodeES                        = "es";
    public static UnknownError                      = "Unknown Error";
    public static Anonymous                         = "Anonymous"
    public static paginationDesktop                 = 50;
    public static paginationMobile                  = 20
    public static formatDate                        = "DD-MM-YYYY HH:mm";
    public static simpleDate                        = "DD-MM-YYYY";
    public static snackDuration                     = 4000;
    public static PERM_CARGO_LECTURA                = "cargo-lectura";
    public static PERM_CLIENTE_LECTURA              = "cliente-lectura";
    public static PERM_COMPANIA_LECTURA             = "compania-lectura";
    public static PERM_DASHBOARD_LECTURA            = "dashboard-lectura";
    public static PERM_DEPARTAMENTO_LECTURA         = "departamento-lectura";
    public static PERM_MIS_SOLICITUDES_LECTURA      = "mis-solicitudes-lectura";
    public static PERM_MIS_SOLICITUDES_ESCRITURA    = "mis-solicitudes-escritura";
    public static PERM_FORMULARIO_LECTURA           = "mis-formularios-lectura";
    public static PERM_FORMULARIO_ESCRITURA         = "mis-formularios-escritura";
    public static PERM_GRUPO_LECTURA                = "grupo-lectura";
    public static PERM_GRUPO_ESCRITURA              = "grupo-escritura";
    public static PERM_HISTORIAL_LECTURA            = "historial-lectura";
    public static PERM_MIS_TICKETS_LECTURA          = "mis-tickets-lectura";
    public static PERM_ORDEN_TRABAJO_LECTURA        = "orden-de-trabajo-lectura";
    public static PERM_PERFIL_LECTURA               = "perfil-lectura";
    public static PERM_PERFIL_ESCRITURA             = "perfil-escritura";
    public static PERM_PRIVILEGIO_LECTURA           = "privilegio-lectura";
    public static PERM_PRIVILEGIO_ESCRITURA         = "privilegio-escritura";
    public static PERM_USUARIO_LECTURA              = "usuario-lectura";
    public static PERM_USUARIO_ESCRITURA            = "usuario-escritura";
    public static PERM_SOLICITUD_HISTORIAL_LECTURA       = "mis-solicitudes-lectura";
    public static PERM_SOLICITUD_HISTORIAL_ESCRITURA     = "mis-solicitudes-escritura";
    public static PERM_MIS_TICKETS_SIN_ASIGNAR_LECTURA   = "tickets-sin-asignar-lectura";
    public static PERM_MIS_TICKETS_SIN_ASIGNAR_ESCRITURA = "tickets-sin-asignar-escritura";
    public static PERM_COORDINADOR_LECTURA               = "coordinador-lectura";
    public static PERM_COORDINADOR_ESCRITURA             = "coordinador-escritura";
    public static PERM_RECURSOS_HUMANOS_LECTURA          = "recursos-humanos-lectura";
    public static PERM_RECURSOS_HUMANOS_ESCRITURA        = "recursos-humanos-escritura";
    public static PERM_REPORTES_EO_LECTURA               = "reporte-excepciones-operativas-lectura";
    public static PERM_REPORTES_PO_LECTURA               = "reporte-problemas-operativos-lectura";
    public static PERM_REFERIDOS_LECTURA                 = "referidos-lectura";
    public static PERM_REFERIDOS_ESCRITURA               = "referidos-escritura";
    public static PERM_REFERIDOS_FAQ_LECTURA                 = "referidos-faq-lectura";
    public static PERM_REFERIDOS_FAQ_ESCRITURA               = "referidos-faq-escritura";
    public static PERM_GESTION_VENTAS_LECTURA            = "referidos-ventas-lectura";
    public static PERM_GESTION_VENTAS_ESCRITURA          = "referidos-ventas-escritura";
    public static PERM_PROMOCIONES_LECTURA               = "promociones-lectura";
    public static PERM_PROMOCIONES_ESCRITURA             = "promociones-escritura";
    public static PERM_SERVICIOS_LECTURA               = "servicios-lectura";
    public static PERM_SERVICIOS_ESCRITURA             = "servicios-escritura";
    public static PERM_REFERIDOS_ADMIN_ESCRITURA             = "referidos-admin-escritura";
    public static PERM_USUARIO_ADMIN_LECTURA             = "usuario-admin-lectura";
    public static PERM_USUARIO_ADMIN_ESCRITURA             = "usuario-admin-escritura";
    public static PERM_PERFIL_ADMIN_LECTURA             = "perfil-admin-lectura";
    public static PERM_PERFIL_ADMIN_ESCRITURA             = "perfil-admin-escritura";
    public static PERM_PRIVILEGIO_ADMIN_LECTURA             = "privilegio-admin-lectura";
    public static PERM_PRIVILEGIO_ADMIN_ESCRITURA             = "privilegio-admin-escritura";
    public static PERM_GESTION_VENTAS_ADMIN_LECTURA             = "gestion-de-ventas-admin-lectura";
    public static PERM_GESTION_VENTAS_ADMIN_ESCRITURA             = "gestion-de-ventas-admin-escritura";
    public static PERM_MIS_PEDIDOS_LECTURA            = "mis-pedidos-lectura";
    public static PERM_MIS_PEDIDOS_ESCRITURA            = "mis-pedidos-escritura";
    public static PERM_MIS_OFERTAS_LECTURA            = "mis-ofertas-lectura";
    public static PERM_MIS_OFERTAS_ESCRITURA            = "mis-ofertas-escritura";
    public static PERM_MIS_TALLERES_LECTURA            = "mis-talleres-lectura";
    public static PERM_MIS_TALLERES_ESCRITURA            = "mis-talleres-escritura";
    public static PERM_MIS_COMERCIOS_LECTURA            = "mis-comercios-lectura";
    public static PERM_MIS_COMERCIOS_ESCRITURA            = "mis-comercios-escritura";
    public static PERM_CAJA_LECTURA            = "caja-lectura";
    public static PERM_CAJA_ESCRITURA            = "caja-escritura";
    public static PERM_REPORTES_LECTURA            = "reportes-lectura";
    public static PERM_REPORTES_ESCRITURA            = "reportes-escritura";
    public static PERM_SISTEMA_LECTURA                  = "sistema-lectura";
    public static PERM_SISTEMA_ESCRITURA                  = "sistema-escritura";
}
