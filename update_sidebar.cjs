const fs = require('fs');

const file = 'd:/@@project/LUXURY-PROJECT/dunastravel-dashbord/src/components/core/AppSidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '  CarFront,\n} from "lucide-react";',
  '  CarFront,\n  BookOpen,\n} from "lucide-react";'
);

content = content.replace(
  '<NavItem href={adminRoutes.transportation} icon={CarFront} label="Transportation" />',
  '<NavItem href={adminRoutes.transportation} icon={CarFront} label="Transportation" />\n                  <NavItem href={adminRoutes.blogs} icon={BookOpen} label="Blogs & Journal" />'
);

fs.writeFileSync(file, content);
console.log('Added Blogs nav item to AppSidebar');
