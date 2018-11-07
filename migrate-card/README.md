## Lovelace migrate card

Since version 0.82 you can edit your Lovelace layout from the UI itself. To do this, all your cards and views will need an unique ID. This card gives you a button to add ID's to your cards and views.

# Configuration:
Add the following to resources in ui-lovelace.yaml:
```yaml
resources:
  - url: /local/custom-lovelace/migrate-card/migrate-card.js
    type: module
```

And add a card with type `custom:migrate-card`:
```yaml
  - type: custom:migrate-card
```