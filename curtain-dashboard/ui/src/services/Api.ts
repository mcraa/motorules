import { MotorModel, NewMotorModel, NewRuleModel, RuleModel } from "../models"

export type ApiError = {
    error: string
}

// dev stuff
const handleDevEnvBaseUrl = async (req: RequestInfo) => {
    if (process.env.NODE_ENV === 'development') {
       if (req instanceof Request) {
        const bodyP = req.headers.get('Content-Type') ? req.blob() : Promise.resolve(undefined);
        const url = new URL(req.url)
        const body = await bodyP
        req = new Request(`http://localhost:3003${url.pathname}`, {
            method: req.method,
            headers: req.headers,
            body: body,
            referrer: req.referrer,
            referrerPolicy: req.referrerPolicy,
            mode: req.mode,
            credentials: req.credentials,
            cache: req.cache,
            redirect: req.redirect,
            integrity: req.integrity,
        })
       } else {
           req = `http://localhost:3003/${req}`
       }
    }

    return req;
}

async function apiCall<T>(request: RequestInfo): Promise<T> {
    request = await handleDevEnvBaseUrl(request)
    let response: Response
    try {
        response = await fetch(request);
    } catch (error: any) {
        throw Error(`Failed api request ${request} \n ${error} :: ${error.message}`)
    }
 
    return await response.json();
}

export const getAllRules = async () =>  await apiCall<RuleModel[]>("api/rules")    
export const deletelRuleById = async (id: number) => await apiCall<number>(new Request(`api/rules/${id}`, { method: "DELETE"})) 
export const createRule = async (rule: NewRuleModel) => await apiCall<RuleModel | ApiError>(new Request(
    `api/rules`, 
    { 
        method: "POST", 
        body: JSON.stringify(rule), 
        headers: {"Content-Type": "application/json"}
    }
    )) 

export const getAllMotors = async () =>  await apiCall<MotorModel[]>("api/motors")    
export const deletelMotorById = async (id: number) => await apiCall<number>(new Request(`api/motors/${id}`, { method: "DELETE"})) 
export const updateMotorPositionById = async (id: number, update: MotorModel) => await apiCall<{ count: number  } | ApiError>(new Request(
    `api/motors/${id}/position`, 
    { 
        method: "PUT",
        body: JSON.stringify({ currentPosition: update.currentPosition }), 
        headers: {"Content-Type": "application/json"}
    })) 
export const createMotor = async (motor: NewMotorModel) => await apiCall<MotorModel | ApiError>(new Request(
    `api/motors`, 
    { 
        method: "POST", 
        body: JSON.stringify(motor), 
        headers: {"Content-Type": "application/json"}
    }
    )) 

export const getSensorData = async () =>  await apiCall<{ [name:string]: string | number }>("api/sensor-data")