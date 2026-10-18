export type Api = {
    module: string;
    export: string;
    replacement?: string;
    message?: string;
};

export type Prop = {
    module: string;
    component: string;
    prop: string;
    replacement?: string;
    message?: string;
};

export type Label = {
    module: string;
    component: string;
    labelProps?: string[];
    allowSpread?: boolean;
};

export type DeprecatedComponents = {
    modules?: string[];
};

export type DesignSystemOptions = {
    deprecatedApis?: Api[];
    deprecatedProps?: Prop[];
    accessibleNames?: Label[];
    deprecatedComponents?: DeprecatedComponents | false;
};
