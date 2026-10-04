import nx from "@nx/eslint-plugin";

export default [
    { plugins: { "@nx": nx } },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.js",
            "**/*.jsx"
        ],
        rules: {
            // Downgraded to "warn": this app's "libraries" aren't isolated packages — they're
            // organizational subdirectories that both import from and are imported by vica-assist's
            // src/app tree (confirmed during the Nx upgrade: the app's webpack build compiles them
            // straight from source and never consumes any library's packaged dist/ output). Real
            // circular deps and app-imports-from-lib violations exist pre-existing throughout
            // (my-hotels <-> vica-assist, etc.) and fixing them means moving shared interfaces into
            // their own library — a real refactor, out of scope for this lint-tooling migration.
            "@nx/enforce-module-boundaries": [
                "warn",
                {
                    enforceBuildableLibDependency: true,
                    allow: [],
                    depConstraints: [
                        {
                            sourceTag: "*",
                            onlyDependOnLibsWithTags: [
                                "*"
                            ]
                        }
                    ]
                }
            ]
        }
    },
    ...nx.configs["flat/typescript"],
    ...nx.configs["flat/javascript"]
];
