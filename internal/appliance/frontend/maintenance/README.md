# Sourcegraph Appliance Maintenance UI

## Build

This will produce the distributable `dist` folder in `bazel-bin/internal/appliance/frontend/maintenance/dist`:

    sg bazel build //internal/appliance/frontend/maintenance:build

## Local run

This will run the service locally, starting a Vite developer environment:

    pnpm install
    pnpm run dev
