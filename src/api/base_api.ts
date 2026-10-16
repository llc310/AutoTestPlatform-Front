import { http } from "@/utils/http/axios";

export class BaseModelAPI<T> {
    base_url = ''

    getDataList(params?) {
        return http.request<T>({
            url: `${this.base_url}`,
            method: 'get',
            params,
        });
    }

    createData(params: T) {
        return http.request<T>({
            url: `${this.base_url}`,
            method: 'post',
            data: params,
        }); 
    }

    getDataByID(id) {
        return http.request<T>({
            url: `${this.base_url}${id}/`,
            method: 'get',
        }); 
    }

    updateDataByID(id,newData: T) {
        return http.request<T>({
            url: `${this.base_url}${id}/`,
            method: 'put',
            data: newData,
        }); 
    }

    deleteDataByID(id) {
        return http.request<T>({
            url: `${this.base_url}${id}/`,
            method: 'delete',
        }); 
    }
}