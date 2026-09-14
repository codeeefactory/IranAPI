# IranAPI use cases

PlantUML is source of truth for report use-case diagrams.

- Overview: [`use-case-diagram.puml`](use-case-diagram.puml)
- Individual diagrams: [`use-cases/`](use-cases/)

## Corrected actor boundaries

- Visitor: public catalog, details, registration/sign-in, public Caller, and public CLI commands.
- Authenticated developer: sign-out, account, subscription, rating, managed Caller, Studio flow storage, projects, dashboard, and private CLI commands.
- API developer: publish APIs and manage only owned API metadata through limited admin access.
- System administrator: manage all live MongoDB collections; API usage stays read-only.
- External services: social identity provider, upstream APIs, deployment worker, and Docker engine.

## Important corrections

- Sign-out belongs to authenticated developer, not visitor.
- Studio stores a flow definition and usage event; it does not execute the node graph.
- Admin operates live MongoDB data, not a legacy ORM catalog.
- API developers have scoped admin access to their own APIs, plans, documentation, and endpoints.
- CLI public commands need no token. `login` validates and stores an existing token; it does not accept username/password.

Each `UC-01` through `UC-15` PlantUML diagram is embedded beside its detailed specification in the Persian report.
