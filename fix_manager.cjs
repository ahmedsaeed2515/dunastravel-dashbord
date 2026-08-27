const fs = require('fs');
const file = 'd:/@@project/LUXURY-PROJECT/dunastravel-dashbord/src/features/transportation/components/TransportationServicesManager.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '  basePriceUsd: number;\n  isActive: boolean;\n};',
  '  basePriceUsd: number;\n  isActive: boolean;\n  heroImage?: string;\n};'
);

content = content.replace(
  '  basePriceUsd: 0,\n  isActive: true,\n});',
  '  basePriceUsd: 0,\n  isActive: true,\n  heroImage: "",\n});'
);

content = content.replace(
  '          <form onSubmit={submit} className="grid gap-3 md:grid-cols-4">\n            <Input value={draft.name}',
  '          <form onSubmit={submit} className="grid gap-3 md:grid-cols-5">\n            <Input value={draft.name}'
);

content = content.replace(
  'placeholder="Base price (USD)" />\n            <div className="flex gap-2">',
  'placeholder="Base price (USD)" />\n            <Input value={draft.heroImage || ""} onChange={(event) => setDraft({ ...draft, heroImage: event.target.value })} placeholder="Image URL (optional)" />\n            <div className="flex gap-2">'
);

content = content.replace(
  'setDraft({ name: service.name, serviceType: service.serviceType, basePriceUsd: Number(service.basePriceUsd), isActive: service.isActive });',
  'setDraft({ name: service.name, serviceType: service.serviceType, basePriceUsd: Number(service.basePriceUsd), isActive: service.isActive, heroImage: service.heroImage || "" });'
);

fs.writeFileSync(file, content);
console.log('Fixed TransportationServicesManager.tsx');
