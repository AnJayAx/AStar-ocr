import { RoleTypes } from "@dis/auth/roles.enum";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

export interface ISidebarItem {
    group: string;
    items: ISidebarItemItem[];
}

export interface ISidebarItemItem {
    name: string;
    icon?: string;
    faIcon?: IconDefinition;
    link?: string;
    elevation: RoleTypes[];
}