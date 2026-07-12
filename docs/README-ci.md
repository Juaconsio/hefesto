# CI — activación manual

El workflow de CI vive en [`docs/ci-workflow.yml`](./ci-workflow.yml) en lugar de
`.github/workflows/` porque el credential con el que se generó este commit no tiene
el scope `workflow` de GitHub (GitHub rechaza el push de archivos bajo
`.github/workflows/` sin ese permiso).

Para activarlo, muévelo a su lugar con un credential que sí tenga `workflow` scope:

```bash
mkdir -p .github/workflows
git mv docs/ci-workflow.yml .github/workflows/ci.yml
git commit -m "Enable CI workflow"
git push
```

O bien, en la UI de GitHub: **Add file → Create new file →**
`.github/workflows/ci.yml` y pega el contenido de `docs/ci-workflow.yml`.

El workflow corre en cada push a `master` y en cada PR:
`install → prisma generate → lint → typecheck → test → build`. No necesita base de
datos (los tests mockean los repositorios y las páginas son `force-dynamic`).
