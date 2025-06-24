# DataStorageFinderJS
_A flexible, JSON-backed Data storage finder tool written in JavaScript._

## Usage
An example docker-compose YML file can be found below.
```
---
services:
  app:
    restart: unless-stopped
    image: xtrasimplicity/data-storage-finder:latest
    volumes:
      - /etc/localtime:/etc/localtime
      - ./questions.json:/usr/share/nginx/html/questions.json
      - ./services.json:/usr/share/nginx/html/services.json
      - ./templates:/usr/share/nginx/html/templates/
    ports:
      - 3000:80
```

Define your questions in `questions.json`, as below:
```
[
  [
  {
    "id": "classification",
    "label": "What is the classification of your data?",
    "helpTip": "This refers to the sensitivity and risk level of the data you are working with.",
    "multi": false,
    "options": [
      { "text": "Public / Low Risk", "slug": "public_low_risk" },
      { "text": "Sensitive / Moderate Risk", "slug": "sensitive_moderate_risk" },
      { "text": "Confidential or Restricted / High Risk", "slug": "confidential_or_restricted_high_risk" },
      { "text": "Payment Information / Extreme Risk", "slug": "payment_information_extreme_risk" }
    ]
  },
  {
    "id": "accessFrequency",
    "label": "How often is the data expected to be accessed/modified?",
    "helpTip": "This helps determine the performance and availability requirements.",
    "multi": false,
    "options": [
      { "text": "Frequently", "slug": "frequently" },
      { "text": "Occasionally", "slug": "occasionally" },
      { "text": "Rarely", "slug": "rarely" },
      { "text": "Just Once", "slug": "just_once" }
    ]
  }
]
```

Create a file called `services.json`, and define your service attributes (for the data comparison table) and your services, as below:
```
{
  "attributes": [
    { "key": "description", "label": "Description" },
    { "key": "exampleUse", "label": "Example Use" },
    { "key": "cost", "label": "Cost" },
    { "key": "capacity", "label": "Capacity" },
    { "key": "access", "label": "Access & Collaboration" },
    { "key": "classifications", "label": "Data Classifications Allowed", "internal": true }, // Note: When internal is set to `true`, the value is determined using buit-in functions. If set to false, or unset, it will use the value defined in the service object.
    { "key": "caveats", "label": "Caveats (based on selections)", "internal": true },
    { "key": "durability", "label": "Durability" },
    { "key": "availability", "label": "Availability" },
    { "key": "complexity", "label": "Technical Complexity" },
    { "key": "support", "label": "Support Contact" },
    { "key": "howToAccess", "label": "How to Access" }
  ],
  "services": [
    {
      "name": "Personal Network Drive",
      "description": "Private network storage for individual users.",
      "criteria": {
        "classification": ["public_low_risk", "sensitive_moderate_risk", "confidential_or_restricted_high_risk"],
        "accessFrequency": ["occasionally", "rarely"],
        "sharing": ["only_me"],
        "volumeGrowth": ["small_amount_data_unlikely_to_grow"],
        "accessMethod": ["office_or_vpn"]
      },
      "caveats": {
        "classification": {
          "criteria": ["sensitive_moderate_risk", "confidential_or_restricted_high_risk", "payment_information_extreme_risk"],
          "caveat": {
            "title": "Encryption required",
            "description": "Encryption of sensitive files is required. Contact IT for assistance."
          }
        }
      },
      "details": {
        "description": "",
        "exampleUse": "Storing personal work files securely.",
        "cost": "Included in IT services.",
        "capacity": "Limited per user quota.",
        "access": "Mapped drive via VPN or on-prem.",
        "durability": "Backed up by IT.",
        "availability": "Subject to IT maintenance.",
        "complexity": "Low – standard file system.",
        "support": "support@mycorp.local",
        "howToAccess": "Provisioned automatically or via IT request."
      }
    }
  ]
}
```

The required `criteria` key for each service handles the filtering, with the value being an object. In the child object, the keys relate to the question IDs specified in `questions.json`, with the values being an array of strings, matching the desired answer `slugs` for the question.

The optional `caveats` key for each service is expected to either be unset, or to be an object. In the object, the keys relate to the question IDs, and the values are an Object which stipulates the criteria and assigned caveats.
E.g. In the example above, we want to show a caveat "Encryption required" when the classification is set to `sensitive_moderate_risk`, `confidential_or_restricted_high_risk`, or `payment_information_extreme_risk`. The caveat title appears in the service card, and the Caveat description appears in the Comparison Table when the service is selected.

If you want to change the title of the site, you can do so using a `site_options.json` file, bound to `/usr/share/nginx/html/site_options.json`, as below:
```
{
  "title": "My new site title"
}
```

## Development
First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.