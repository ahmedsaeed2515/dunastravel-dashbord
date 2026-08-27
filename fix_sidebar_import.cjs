const fs = require('fs');

const file = 'd:/@@project/LUXURY-PROJECT/dunastravel-dashbord/src/components/core/AppSidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '  CarFront,\n} from "lucide-react";',
  '  CarFront,\n  BookOpen,\n} from "lucide-react";'
);

fs.writeFileSync(file, content);
console.log('Added BookOpen to lucide-react import');
