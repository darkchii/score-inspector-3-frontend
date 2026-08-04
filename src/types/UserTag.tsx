import type { IUserTag } from "./types";

class UserTag implements IUserTag {
    id: number;
    name: string
    ruleset_id: number;
    description: string | null;
    created_at: Date | null;
    updated_at: Date | null;

    constructor(api_data: any) {
        this.id = api_data.id;
        this.name = api_data.name;
        this.ruleset_id = api_data.ruleset_id;
        this.description = api_data.description || null;
        this.created_at = api_data.created_at ? new Date(api_data.created_at) : null;
        this.updated_at = api_data.updated_at ? new Date(api_data.updated_at) : null;
    }
}

export default UserTag;