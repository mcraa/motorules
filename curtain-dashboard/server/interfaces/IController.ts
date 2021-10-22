import { Request, RequestHandler, Response, Router } from "express";

export interface IController {
    path: string,
    routes: IControllerRoute[]
}

export interface IControllerRoute {
    METHOD: HttpMethod,
    slug?: string,
    handler: RequestHandler
}

export enum HttpMethod {
    GET = 'get',
    POST = 'post',
    PATCH = 'patch',
    PUT = 'put',
    DELETE = 'delete'
}