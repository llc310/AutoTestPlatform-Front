import { BaseModelAPI } from "../base_api";
import { Project } from "./models";

export class ProjectAPI extends BaseModelAPI<Project> {
    base_url = '/project/project/'
}
