# Feature matrix

Acronyms: **PLG** = product-led growth (self-serve signup and public pricing as the default GTM motion). Defined in [v0/marketing-plg.md](./v0/marketing-plg.md).

| ID   | Feature                            | Phase | Actor          | Route / API             | Spec                                                 | Status  |
| ---- | ---------------------------------- | ----- | -------------- | ----------------------- | ---------------------------------------------------- | ------- |
| F-01 | Sample tasks (demo)                | v0    | Signed-in user | `/tasks`, `api.tasks.*` | [v0/tasks.md](./v0/tasks.md)                         | Shipped |
| F-02 | Theme + i18n shell                 | v0    | Visitor        | `/`                     | [v0/shell.md](./v0/shell.md)                         | Demo    |
| F-03 | PLG (product-led growth) marketing | v0    | Visitor        | marketing `/*`          | [v0/marketing-plg.md](./v0/marketing-plg.md)         | Shipped |
| F-04 | Marketing product launch           | v1    | Product owner  | fork config + content   | [v1/marketing-product.md](./v1/marketing-product.md) | Planned |
