import nx from "@nx/eslint-plugin";
import baseConfig from "../../eslint.config.mjs";

export default [
    ...baseConfig,
    ...nx.configs["flat/angular"],
    ...nx.configs["flat/angular-template"],
    {
        files: ["**/*.ts"],
        rules: {
            // This app is NgModule-based throughout (standalone: false is the forced default as of
            // Angular 19, not an opt-out) -- converting to standalone components is a real
            // architectural change, out of scope here.
            "@angular-eslint/prefer-standalone": "off",
            "@angular-eslint/directive-selector": [
                "error",
                {
                    type: "attribute",
                    prefix: "vicaAssist",
                    style: "camelCase"
                }
            ],
            "@angular-eslint/component-selector": [
                "error",
                {
                    type: "element",
                    prefix: "vica-assist",
                    style: "kebab-case"
                }
            ]
        }
    }
];
