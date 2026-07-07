# Original ZAD website archive

The existing `AMRYB/ZAD` default branch pointed to `438e8ffce0c5896175a82e2a1668a238deeda365` before the mobile project import. Its seven reachable commits date from 4–9 February 2026.

All 16 files from that tree, including its README, HTML, CSS, JavaScript and images, are preserved under `legacy-web/`. Committed blobs were compared byte-for-byte against the original tree. `.gitattributes` disables text normalization only inside that archive so historical line endings remain exact.

The import is a two-parent merge. The original main commit and the mobile implementation history both remain ancestors of the new main branch. Original authors, messages, dates and remote contributor branches are retained. No force push or rewritten historical commit is needed.

The root contains the maintained Expo mobile project. `legacy-web/` is archival source, excluded from the current Expo lint scope; it is not a claim that its old login/signup forms provide the new app’s backend. The archived website retains its original dependency links and content. No changes were made inside archived files.
