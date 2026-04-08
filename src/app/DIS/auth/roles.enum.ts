export enum RoleTypes {

    
    // Client Role
    INVENTORY_PENDING = 'inventory_pending',

    INVENTORY_LIST = 'inventory_list', //composite role
        INVENTORY_LIST_VIEW = 'inventory_list_view',
        INVENTORY_LIST_UPDATE = 'inventory_list_update',
        INVENTORY_LIST_DELETE = 'inventory_list_delete',
    
    INVENTORY_PLANNING = 'inventory_planning',//composite role
        INVENTORY_PLANNING_VIEW = 'inventory_planning_view',
        INVENTORY_PLANNING_UPDATE = 'inventory_planning_update',
        INVENTORY_PLANNING_CREATE = 'inventory_planning_create',

    INVENTORY_FORECASTING = 'inventory_forecasting',
    INVENTORY_SPT_MOBILE_CLIENT = 'spt_mobile_inventory_client',

    //Realm Role
    ADMIN_INVENTORY = 'inventory-demo-realm-admin',
    USER_INVENTORY = 'inventory-demo-realm-user',
    USER_MGMT_INVENTORY = 'inventory-demo-realm-user-management',
    PENDING_INVENTORY = 'inventory-demo-realm-pending',
    NEW_USER_INVENTORY = 'inventory-demo-realm-new-user',
    INVENTORY_SPT_MOBILE_REALM = 'spt_mobile_inventory',
    
    // added Roles
    ROLE_USER = 'SPT-user',
    ROLE_MANAGER = 'SPT-administrator',
    INVENTORY_SPT_MOBILE_ROLE_DEFAULT = 'SPT_mobile_Inventory_Client',
    SPT_ADMIN = "admin",
    SPT_USER = "user",
    LPT_INVENTORY_APP_ADMIN = 'LPT_INVENTORY_APP_ADMIN',
    LPT_INVENTORY_APP_USER = 'LPT_INVENTORY_APP_USER',
    LPT_REALM_INVENTORY_ADMIN = 'LPT-REALM-INVENTORY-ADMIN',
}