import { BaseModelAPI } from "../base_api";
import { Department, Position, Role } from "./models";

export class DepartmentAPI extends BaseModelAPI<Department> {
    base_url = '/system/department/'
}

export class PositionAPI extends BaseModelAPI<Position> {
    base_url = '/system/position/'
}

export class RoleAPI extends BaseModelAPI<Role> {
    base_url = '/system/role/'
}